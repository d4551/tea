import { httpStatus } from "../shared/constants/http.ts";
import {
  GAME_SESSION_ROUTE_PATTERNS,
  interpolateRoutePath,
} from "../shared/constants/route-patterns.ts";
import type { GameCommand, GameRealtimeFrame, GameSceneState } from "../shared/contracts/game.ts";
import {
  validateGameRealtimeFrame,
  WS_CLOSE_SESSION_MISSING,
  WS_CLOSE_TOKEN_EXPIRED,
} from "../shared/contracts/game.ts";
import type { GameClientRuntimeConfig } from "../shared/contracts/game-client-bootstrap.ts";
import { readJsonResponse, settleAsync } from "../shared/utils/async-result.ts";
import { acceptUnknown, safeJsonParse } from "../shared/utils/safe-json.ts";
import { isResumeTokenExpiredSoon } from "./game-client-bootstrap-session.ts";
import type {
  GameClientAlertTone,
  GameConnectionState,
  PersistedSessionMeta,
  RestoreSessionResponse,
} from "./game-client-types.ts";

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const buildSessionSocketUrl = (sessionId: string, resumeToken: string): string => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const path = interpolateRoutePath(GAME_SESSION_ROUTE_PATTERNS.websocket, { id: sessionId });
  const target = new URL(`${protocol}//${window.location.host}${path}`);
  if (resumeToken.length > 0) {
    target.searchParams.set("resumeToken", resumeToken);
  }

  return target.toString();
};

const buildSessionRestoreUrl = (sessionId: string): string => {
  const path = interpolateRoutePath(GAME_SESSION_ROUTE_PATTERNS.restore, { id: sessionId });
  return new URL(path, window.location.origin).toString();
};

const parseGameFrameFromMessage = (incoming: unknown): GameRealtimeFrame | null => {
  if (typeof incoming !== "string" && typeof incoming !== "object") {
    return null;
  }

  if (incoming instanceof ArrayBuffer || incoming instanceof Blob) {
    return null;
  }

  const payload =
    typeof incoming === "string" ? safeJsonParse(incoming, null, acceptUnknown) : incoming;
  const validation = validateGameRealtimeFrame(payload);
  if (!validation.ok) {
    return null;
  }

  return validation.data;
};

/**
 * Callbacks used by the playable transport layer to update runtime state and UI.
 */
export type GameClientTransportCallbacks = {
  readonly onQueueDepthChange: (depth: number) => void;
  readonly onConnectionStateChange: (state: GameConnectionState, closeCode?: number) => void;
  readonly onReconnectVisibilityChange: (visible: boolean) => void;
  readonly onAlertChange: (message: GameConnectionState | null, tone?: GameClientAlertTone) => void;
  readonly onStateChange: (state: GameSceneState) => void;
};

/**
 * Options for the playable game transport layer.
 */
export type GameClientTransportOptions = {
  readonly runtimeConfig: GameClientRuntimeConfig;
  readonly initialSessionMeta: PersistedSessionMeta;
  readonly persistSessionMeta: (meta: PersistedSessionMeta) => void;
  readonly callbacks: GameClientTransportCallbacks;
};

/**
 * WebSocket and restore-session transport interface for the playable runtime.
 */
export type GameClientTransport = {
  readonly connect: () => void;
  readonly reconnect: () => void;
  readonly sendCommand: (command: GameCommand) => boolean;
  readonly getSessionMeta: () => PersistedSessionMeta;
  readonly getConnectionState: () => GameConnectionState;
  readonly dispose: () => void;
};

/**
 * Creates the WebSocket transport and restore flow used by the playable browser client.
 */
export const createGameClientTransport = ({
  runtimeConfig,
  initialSessionMeta,
  persistSessionMeta,
  callbacks,
}: GameClientTransportOptions): GameClientTransport => {
  let runtimeSessionMeta = initialSessionMeta;
  let commandQueueDepth = initialSessionMeta.commandQueueDepth;
  let commandSequence = 0;
  let activeSocket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let restoreAbortController: AbortController | null = null;
  let connectionState: GameConnectionState = "disconnected";
  let isDisposed = false;

  const persistRuntimeSessionMeta = (meta: PersistedSessionMeta): void => {
    runtimeSessionMeta = meta;
    persistSessionMeta(meta);
  };

  const clearReconnectTimer = (): void => {
    if (!reconnectTimer) {
      return;
    }

    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  const cancelRestoreRequest = (): void => {
    if (!restoreAbortController) {
      return;
    }

    restoreAbortController.abort();
    restoreAbortController = null;
  };

  const setConnectionState = (state: GameConnectionState, closeCode?: number): void => {
    connectionState = state;
    callbacks.onConnectionStateChange(state, closeCode);
  };

  const scheduleReconnect = (): void => {
    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
      if (isDisposed) {
        return;
      }

      connect();
    }, runtimeConfig.socketReconnectDelayMs);
  };

  const syncRuntimeMeta = (frame: GameRealtimeFrame): void => {
    const nextResumeToken =
      typeof frame.resumeToken === "string" && frame.resumeToken.length > 0
        ? frame.resumeToken
        : runtimeSessionMeta.resumeToken;
    const nextExpiry =
      typeof frame.resumeTokenExpiresAtMs === "number" &&
      Number.isFinite(frame.resumeTokenExpiresAtMs)
        ? frame.resumeTokenExpiresAtMs
        : runtimeSessionMeta.expiresAtMs;

    const nextCommandQueueDepth =
      typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth;

    persistRuntimeSessionMeta({
      ...runtimeSessionMeta,
      resumeToken: nextResumeToken,
      expiresAtMs: nextExpiry,
      commandQueueDepth: nextCommandQueueDepth,
      participantRole:
        frame.participantRole === undefined
          ? runtimeSessionMeta.participantRole
          : frame.participantRole,
    });
  };

  const attemptRestoreSession = async (): Promise<boolean> => {
    if (runtimeSessionMeta.resumeToken.length === 0) {
      return false;
    }

    for (let attempt = 0; attempt < runtimeConfig.restoreMaxAttempts; attempt += 1) {
      cancelRestoreRequest();
      const controller = new AbortController();
      restoreAbortController = controller;
      const timeoutHandle = setTimeout(
        () => controller.abort(),
        runtimeConfig.restoreRequestTimeoutMs,
      );

      const fetchResult = await settleAsync(
        fetch(buildSessionRestoreUrl(runtimeSessionMeta.sessionId), {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          signal: controller.signal,
          body: JSON.stringify({
            resumeToken: runtimeSessionMeta.resumeToken,
          }),
        }),
      );

      clearTimeout(timeoutHandle);
      if (restoreAbortController === controller) {
        restoreAbortController = null;
      }

      if (!fetchResult.ok) {
        const error = fetchResult.error;
        if (controller.signal.aborted && attempt + 1 < runtimeConfig.restoreMaxAttempts) {
          await delay(runtimeConfig.socketReconnectDelayMs);
          continue;
        }

        if (
          error instanceof Error &&
          error.name === "AbortError" &&
          attempt + 1 < runtimeConfig.restoreMaxAttempts
        ) {
          await delay(runtimeConfig.socketReconnectDelayMs);
          continue;
        }

        return false;
      }

      const response = fetchResult.value;
      if (!response.ok) {
        if (
          response.status >= httpStatus.internalServerError &&
          attempt + 1 < runtimeConfig.restoreMaxAttempts
        ) {
          await delay(runtimeConfig.socketReconnectDelayMs);
          continue;
        }

        return false;
      }

      const payloadResult = await readJsonResponse<RestoreSessionResponse>(response);
      if (!payloadResult.ok || !payloadResult.value.ok) {
        return false;
      }

      const payload = payloadResult.value;
      persistRuntimeSessionMeta({
        ...runtimeSessionMeta,
        participantSessionId:
          payload.data.participantSessionId ?? runtimeSessionMeta.participantSessionId,
        resumeToken: payload.data.resumeToken ?? runtimeSessionMeta.resumeToken,
        expiresAtMs: payload.data.resumeTokenExpiresAtMs ?? runtimeSessionMeta.expiresAtMs,
        commandQueueDepth: payload.data.commandQueueDepth ?? runtimeSessionMeta.commandQueueDepth,
        locale: payload.data.locale,
        version: payload.data.version ?? runtimeSessionMeta.version,
      });

      commandQueueDepth = runtimeSessionMeta.commandQueueDepth;
      callbacks.onQueueDepthChange(commandQueueDepth);
      return true;
    }

    return false;
  };

  const handleRestoreFailure = (closeCode?: number): void => {
    setConnectionState("expired", closeCode);
    callbacks.onReconnectVisibilityChange(true);
    callbacks.onAlertChange("expired", "error");
  };

  const restoreAndReconnect = async (closeCode?: number): Promise<void> => {
    const restoreResult = await settleAsync(attemptRestoreSession());
    if (restoreResult.ok && restoreResult.value) {
      connect();
      return;
    }

    handleRestoreFailure(closeCode);
  };

  const connect = (): void => {
    if (isDisposed) {
      return;
    }

    if (
      activeSocket?.readyState === WebSocket.OPEN ||
      activeSocket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    clearReconnectTimer();
    setConnectionState("connecting");
    callbacks.onReconnectVisibilityChange(false);
    callbacks.onAlertChange(null);

    const socket = new WebSocket(
      buildSessionSocketUrl(runtimeSessionMeta.sessionId, runtimeSessionMeta.resumeToken),
    );
    activeSocket = socket;

    socket.addEventListener("open", () => {
      if (activeSocket !== socket || isDisposed) {
        return;
      }

      setConnectionState("connected");
      callbacks.onReconnectVisibilityChange(false);
      callbacks.onAlertChange(null);
      persistRuntimeSessionMeta(runtimeSessionMeta);
    });

    socket.addEventListener("message", (message) => {
      if (activeSocket !== socket || isDisposed) {
        return;
      }

      const frame = parseGameFrameFromMessage(message.data);
      if (!frame) {
        return;
      }

      const state = frame.state ?? null;
      if (!state) {
        return;
      }

      syncRuntimeMeta(frame);
      commandQueueDepth =
        typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth;
      callbacks.onQueueDepthChange(commandQueueDepth);
      callbacks.onStateChange(state);
    });

    socket.addEventListener("close", (event) => {
      if (activeSocket !== socket) {
        return;
      }

      activeSocket = null;
      if (isDisposed) {
        return;
      }

      if (event.code === WS_CLOSE_SESSION_MISSING) {
        setConnectionState("missing", event.code);
        callbacks.onReconnectVisibilityChange(true);
        callbacks.onAlertChange("missing", "warning");
        return;
      }

      if (
        event.code === WS_CLOSE_TOKEN_EXPIRED ||
        isResumeTokenExpiredSoon(runtimeSessionMeta.expiresAtMs)
      ) {
        setConnectionState("reconnecting", event.code);
        callbacks.onReconnectVisibilityChange(false);
        callbacks.onAlertChange("reconnecting", "info");
        void restoreAndReconnect(event.code);
        return;
      }

      setConnectionState("reconnecting", event.code);
      callbacks.onAlertChange("reconnecting", "info");
      scheduleReconnect();
    });
  };

  return {
    connect,
    reconnect() {
      if (isDisposed) {
        return;
      }

      callbacks.onReconnectVisibilityChange(false);
      callbacks.onAlertChange(null);
      setConnectionState("reconnecting");
      void restoreAndReconnect();
    },
    sendCommand(command) {
      if (activeSocket?.readyState !== WebSocket.OPEN) {
        return false;
      }

      commandSequence += 1;
      activeSocket.send(
        JSON.stringify({
          commandId: crypto.randomUUID(),
          source: "ws",
          locale: runtimeSessionMeta.locale,
          sequenceId: commandSequence,
          timestamp: new Date().toISOString(),
          ttlMs: runtimeConfig.commandTtlMs,
          command,
        } satisfies {
          readonly commandId: string;
          readonly source: "ws";
          readonly locale: string;
          readonly sequenceId: number;
          readonly timestamp: string;
          readonly ttlMs: number;
          readonly command: GameCommand;
        }),
      );

      return true;
    },
    getSessionMeta() {
      return runtimeSessionMeta;
    },
    getConnectionState() {
      return connectionState;
    },
    dispose() {
      isDisposed = true;
      clearReconnectTimer();
      cancelRestoreRequest();
      activeSocket?.close();
      activeSocket = null;
    },
  };
};

import { Ticker } from "pixi.js";
import { createLogger } from "../lib/logger.ts";
import type { GameSceneState } from "../shared/contracts/game.ts";
import { settleAsync } from "../shared/utils/async-result.ts";
import { createGameClientAudioService } from "./game-client-audio.ts";
import {
  persistSessionMeta,
  readGameClientBootstrap,
  readSessionMeta,
} from "./game-client-bootstrap-session.ts";
import { createGameClientDebugController } from "./game-client-debug.ts";
import {
  createGameClientInputController,
  createGameClientStatusController,
  readGameClientLabels,
} from "./game-client-input.ts";
import { createGameClientRenderRuntime } from "./game-client-renderer.ts";
import { createGameClientTransport } from "./game-client-transport.ts";

const browserLogger = createLogger("game-client");

const clientLog = (
  level: "info" | "warn" | "error",
  event: string,
  detail?: Record<string, unknown>,
): void => {
  const payload = {
    ts: Date.now(),
    event,
    ...(detail ?? {}),
  };

  if (level === "error") {
    browserLogger.error(event, payload);
    return;
  }

  if (level === "warn") {
    browserLogger.warn(event, payload);
    return;
  }

  browserLogger.info(event, payload);
};

const readReconnectButton = (): HTMLButtonElement | null => {
  const candidate = document.getElementById("game-reconnect");
  return candidate instanceof HTMLButtonElement ? candidate : null;
};

const parseCutsceneAudioPayload = (): {
  readonly action: string;
  readonly stepId: string | null;
  readonly soundAssetUrl: string | null;
  readonly stepDurationMs: number;
} => {
  const cutscene = document.getElementById("hud-cutscene");
  if (!(cutscene instanceof HTMLElement)) {
    return { action: "", stepId: null, soundAssetUrl: null, stepDurationMs: 0 };
  }

  const action = cutscene.dataset.cutsceneAction ?? "";
  const stepId = cutscene.dataset.cutsceneStepId ?? "";
  const soundAssetUrl = cutscene.dataset.cutsceneSoundAssetSource ?? "";
  const stepDurationMsRaw = Number(cutscene.dataset.cutsceneDurationMs ?? "0");

  return {
    action,
    stepId: stepId.length > 0 ? stepId : null,
    soundAssetUrl: soundAssetUrl.length > 0 ? soundAssetUrl : null,
    stepDurationMs: Number.isFinite(stepDurationMsRaw) ? stepDurationMsRaw : 0,
  };
};

const initGameClient = async (): Promise<void> => {
  const wrapper = document.getElementById("game-canvas-wrapper");
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }

  const bootstrap = readGameClientBootstrap();
  if (!bootstrap) {
    return;
  }

  const runtimeConfig = bootstrap.runtime;
  const queueBadge = document.getElementById("game-command-queue");
  const statusBadge = document.getElementById("game-connection-status");
  const statusTarget = document.getElementById("game-session-meta");
  const reconnectButton = readReconnectButton();
  const connectionAlert = document.getElementById("game-connection-alert");
  const connectionAlertText = document.getElementById("game-connection-alert-text");
  const focusStatus = document.getElementById("game-runtime-focus-status");
  const labels = readGameClientLabels(wrapper, statusBadge, queueBadge, reconnectButton);
  if (!labels) {
    return;
  }

  const sessionMeta = readSessionMeta(bootstrap, runtimeConfig);
  const status = createGameClientStatusController({
    queueBadge,
    statusBadge,
    statusTarget,
    reconnectButton,
    connectionAlert,
    connectionAlertText,
    getHudSceneElement: () => document.getElementById("hud-scene"),
    labels,
  });

  const audioService = createGameClientAudioService({
    onWarning(message, detail) {
      clientLog("warn", message, detail);
    },
  });

  let previousState: GameSceneState | null = null;
  let currentState: GameSceneState | null = null;

  const renderer = await createGameClientRenderRuntime({
    wrapper,
    rendererPreference: runtimeConfig.rendererPreference,
  });

  const transport = createGameClientTransport({
    runtimeConfig,
    initialSessionMeta: sessionMeta,
    persistSessionMeta: (nextSessionMeta) => persistSessionMeta(nextSessionMeta, runtimeConfig),
    callbacks: {
      onQueueDepthChange(depth) {
        status.setQueueDepth(depth);
      },
      onConnectionStateChange(state, closeCode) {
        status.setConnectionState(state, closeCode);
      },
      onReconnectVisibilityChange(visible) {
        status.setReconnectVisible(visible);
      },
      onAlertChange(messageKey, tone) {
        status.setConnectionAlert(messageKey ? labels.connection[messageKey] : null, tone);
      },
      onStateChange(state) {
        void renderer.prepareState(state);
        previousState = currentState;
        currentState = state;
      },
    },
  });

  const gamePageRoot = document.querySelector(".game-page-grid");
  const debug =
    gamePageRoot instanceof HTMLElement ? createGameClientDebugController(gamePageRoot) : null;

  const input = createGameClientInputController({
    wrapper,
    reconnectButton,
    focusStatus,
    labels,
    runtimeConfig,
    sendCommand(command) {
      if (transport.getSessionMeta().participantRole === "spectator") {
        if (command.type !== "move") {
          document.body.dispatchEvent(
            new CustomEvent("showToast", {
              detail: { message: labels.spectatorControlDenied, type: "info" },
            }),
          );
        }

        return false;
      }

      return transport.sendCommand(command);
    },
    getConnectionState() {
      return transport.getConnectionState();
    },
    onReconnect() {
      transport.reconnect();
    },
  });

  const listenerController = new AbortController();
  let isDisposed = false;
  const syncCutsceneAudio = (): void => {
    const { action, stepId, soundAssetUrl, stepDurationMs } = parseCutsceneAudioPayload();
    audioService.handleCutsceneUpdate({
      action,
      stepId: stepId ?? undefined,
      soundAssetUrl: soundAssetUrl ?? undefined,
      stepDurationMs,
    });
  };

  document.addEventListener("htmx:sseMessage", syncCutsceneAudio, {
    signal: listenerController.signal,
  });

  void syncCutsceneAudio();

  const ticker = new Ticker();
  ticker.add((time) => {
    const now = performance.now();
    input.tick(now);
    debug?.tick(time.deltaMS, () => currentState);
    renderer.renderFrame({
      state: currentState,
      previousState,
      alpha: input.resolveInterpolationAlpha(now),
      participantSessionId: transport.getSessionMeta().participantSessionId,
      deltaMs: time.deltaMS,
      debugMode: debug?.isVisible?.() ?? false,
    });
  });

  const disposeRuntime = (): void => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    listenerController.abort();
    debug?.dispose();
    input.dispose();
    transport.dispose();
    ticker.stop();
    ticker.destroy();
    renderer.dispose();
    audioService.dispose();
  };

  window.addEventListener(
    "resize",
    () => {
      renderer.resize();
    },
    { signal: listenerController.signal },
  );

  window.addEventListener("beforeunload", disposeRuntime, {
    once: true,
    signal: listenerController.signal,
  });
  window.addEventListener("pagehide", disposeRuntime, {
    once: true,
    signal: listenerController.signal,
  });

  status.setQueueDepth(sessionMeta.commandQueueDepth);
  status.setReconnectVisible(false);
  status.setConnectionAlert(null);
  transport.connect();
  ticker.start();
  persistSessionMeta(transport.getSessionMeta(), runtimeConfig);
};

const bootGameClient = async (): Promise<void> => {
  const result = await settleAsync(initGameClient());
  if (result.ok) {
    return;
  }

  clientLog("error", "init-failed", {
    message: result.error.message,
  });
  const wrapper = document.getElementById("game-canvas-wrapper");
  const statusBadge = document.getElementById("game-connection-status");
  const queueBadge = document.getElementById("game-command-queue");
  const reconnectButton = readReconnectButton();
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }

  const labels = readGameClientLabels(wrapper, statusBadge, queueBadge, reconnectButton);
  if (!labels) {
    return;
  }

  const status = createGameClientStatusController({
    queueBadge,
    statusBadge,
    statusTarget: document.getElementById("game-session-meta"),
    reconnectButton,
    connectionAlert: document.getElementById("game-connection-alert"),
    connectionAlertText: document.getElementById("game-connection-alert-text"),
    getHudSceneElement: () => document.getElementById("hud-scene"),
    labels,
  });
  status.setConnectionState("disconnected");
};

void bootGameClient();

import {
  Assets,
  Container,
  WebGLRenderer as PixiWebGLRenderer,
  Rectangle,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { appRoutes, interpolateRoutePath } from "../shared/constants/routes.ts";
import type {
  EntityState,
  GameCommand,
  GameSceneState,
  NpcState,
  SpriteAnimationConfig,
  SpriteManifest,
} from "../shared/contracts/game.ts";
import { readLocalStorage, writeLocalStorage } from "../shared/utils/browser-storage.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";
import { ThreeLayer } from "./three-layer.ts";

type PersistedSessionMeta = {
  readonly sessionId: string;
  readonly resumeToken: string;
  readonly locale: string;
  readonly commandQueueDepth: number;
  readonly version: number;
  readonly expiresAtMs: number;
};

type WsGameFrame = {
  readonly state?: GameSceneState;
  readonly player?: EntityState;
  readonly npcs?: readonly NpcState[];
  readonly commandQueueDepth?: number;
  readonly resumeToken?: string;
  readonly resumeTokenExpiresAtMs?: number;
};

type LoadedSceneAssets = {
  readonly backgroundTexture: Texture;
};

type RestoreSessionResponse = {
  readonly ok: true;
  readonly data: {
    readonly sessionId: string;
    readonly locale: string;
    readonly timestamp: string;
    readonly state: GameSceneState;
    readonly commandQueueDepth?: number;
    readonly resumeToken?: string;
    readonly resumeTokenExpiresAtMs?: number;
    readonly version?: number;
  };
};

type GameClientRuntimeConfig = {
  readonly commandSendIntervalMs: number;
  readonly commandTtlMs: number;
  readonly socketReconnectDelayMs: number;
  readonly restoreRequestTimeoutMs: number;
  readonly restoreMaxAttempts: number;
};

const SESSION_META_KEY = "lotfk:game:session-meta";
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const readMeta = (selector: string): HTMLMetaElement | null =>
  document.querySelector<HTMLMetaElement>(selector);

const resolveSpriteManifest = (characterKey: string): SpriteManifest | null =>
  gameSpriteManifests[characterKey] ?? null;

const parsePositiveInteger = (rawValue: string | undefined): number | null => {
  const value = Number.parseInt(rawValue ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
};

const readClientRuntimeConfig = (): GameClientRuntimeConfig | null => {
  const commandSendIntervalMs = parsePositiveInteger(
    readMeta('meta[name="game-client-command-send-interval-ms"]')?.dataset
      .gameClientCommandSendIntervalMs,
  );
  const commandTtlMs = parsePositiveInteger(
    readMeta('meta[name="game-client-command-ttl-ms"]')?.dataset.gameClientCommandTtlMs,
  );
  const socketReconnectDelayMs = parsePositiveInteger(
    readMeta('meta[name="game-client-socket-reconnect-delay-ms"]')?.dataset
      .gameClientSocketReconnectDelayMs,
  );
  const restoreRequestTimeoutMs = parsePositiveInteger(
    readMeta('meta[name="game-client-restore-request-timeout-ms"]')?.dataset
      .gameClientRestoreRequestTimeoutMs,
  );
  const restoreMaxAttempts = parsePositiveInteger(
    readMeta('meta[name="game-client-restore-max-attempts"]')?.dataset.gameClientRestoreMaxAttempts,
  );
  if (
    !commandSendIntervalMs ||
    !commandTtlMs ||
    !socketReconnectDelayMs ||
    !restoreRequestTimeoutMs ||
    !restoreMaxAttempts
  ) {
    return null;
  }

  return {
    commandSendIntervalMs,
    commandTtlMs,
    socketReconnectDelayMs,
    restoreRequestTimeoutMs: Math.min(restoreRequestTimeoutMs, commandTtlMs),
    restoreMaxAttempts,
  };
};

const readSessionMeta = (runtimeConfig: GameClientRuntimeConfig): PersistedSessionMeta | null => {
  const sessionMeta = readMeta('meta[name="game-session-id"]');
  if (!sessionMeta) {
    return null;
  }

  const sessionId = sessionMeta.dataset.sessionId?.trim();
  if (!sessionId) {
    return null;
  }

  const locale = readMeta('meta[name="game-session-locale"]')?.dataset.gameSessionLocale ?? "en-US";
  const resumeToken =
    readMeta('meta[name="game-session-resume-token"]')?.dataset.sessionResumeToken ?? "";
  const commandQueueDepth =
    Number.parseInt(
      readMeta('meta[name="game-session-command-queue-depth"]')?.dataset
        .gameSessionCommandQueueDepth ?? "0",
      10,
    ) || 0;
  const version =
    Number.parseInt(
      readMeta('meta[name="game-session-version"]')?.dataset.gameSessionVersion ?? "1",
      10,
    ) || 1;
  const expiresAtMs =
    Number.parseInt(
      readMeta('meta[name="game-session-resume-expires-at-ms"]')?.dataset
        .gameSessionResumeExpiresAtMs ?? "",
      10,
    ) || Date.now() + runtimeConfig.commandTtlMs;

  const runtimeMeta: PersistedSessionMeta = {
    sessionId,
    resumeToken,
    locale,
    commandQueueDepth,
    version,
    expiresAtMs,
  };

  const storedRaw = readLocalStorage(SESSION_META_KEY);
  if (!storedRaw) {
    return runtimeMeta;
  }

  const stored = safeJsonParse<PersistedSessionMeta | null>(storedRaw, null);
  if (
    stored?.sessionId === sessionId &&
    stored.locale.length > 0 &&
    stored.resumeToken.length > 0 &&
    Number.isFinite(stored.expiresAtMs) &&
    stored.expiresAtMs > Date.now()
  ) {
    return {
      ...runtimeMeta,
      resumeToken: stored.resumeToken,
      commandQueueDepth: stored.commandQueueDepth,
      version: stored.version,
      locale: stored.locale,
      expiresAtMs: stored.expiresAtMs,
    };
  }

  return runtimeMeta;
};

const persistSessionMeta = (
  meta: PersistedSessionMeta,
  runtimeConfig: GameClientRuntimeConfig,
): void => {
  writeLocalStorage(
    SESSION_META_KEY,
    JSON.stringify({
      ...meta,
      expiresAtMs: Math.max(meta.expiresAtMs, Date.now() + runtimeConfig.commandTtlMs),
    }),
  );
};

const buildSessionSocketUrl = (sessionId: string, resumeToken: string): string => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const path = interpolateRoutePath(appRoutes.gameApiSessionWebSocket, { id: sessionId });
  const target = new URL(`${protocol}//${window.location.host}${path}`);
  if (resumeToken.length > 0) {
    target.searchParams.set("resumeToken", resumeToken);
  }

  return target.toString();
};

const buildSessionRestoreUrl = (sessionId: string): string => {
  const path = interpolateRoutePath(appRoutes.gameApiSessionRestore, { id: sessionId });
  const target = new URL(path, window.location.origin);
  return target.toString();
};

const parseGameFrameFromMessage = (incoming: unknown): WsGameFrame | null => {
  if (typeof incoming !== "string" && typeof incoming !== "object") {
    return null;
  }

  if (incoming instanceof ArrayBuffer || incoming instanceof Blob) {
    return null;
  }

  const payload = typeof incoming === "string" ? safeJsonParse<unknown>(incoming, null) : incoming;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return payload as WsGameFrame;
};

const resolveFrameState = (frame: WsGameFrame): GameSceneState | null => {
  if (frame.state && typeof frame.state === "object") {
    return frame.state as GameSceneState;
  }

  if (frame.player && frame.npcs) {
    return frame as GameSceneState;
  }

  return null;
};

const setQueueDepth = (queueBadge: HTMLElement | null, depth: number): void => {
  const queueLabel = queueBadge?.dataset.queueLabel ?? "queue";
  if (queueBadge) {
    queueBadge.textContent = `${queueLabel}: ${depth}`;
    return;
  }

  const statusTarget = document.getElementById("game-session-meta");
  if (statusTarget) {
    statusTarget.dataset.commandQueueDepth = String(depth);
  }
};

const setConnectionStatus = (
  statusBadge: HTMLElement | null,
  state: "connecting" | "connected" | "disconnected" | "reconnecting" | "expired" | "missing",
  closeCode?: number,
): void => {
  if (!statusBadge) {
    return;
  }

  if (state === "connecting") {
    statusBadge.textContent = statusBadge.dataset.connectingLabel ?? statusBadge.textContent ?? "";
    return;
  }

  if (state === "connected") {
    statusBadge.textContent = statusBadge.dataset.connectedLabel ?? statusBadge.textContent ?? "";
    return;
  }

  if (state === "reconnecting") {
    statusBadge.textContent = statusBadge.dataset.reconnectingLabel ?? "reconnecting";
    return;
  }

  if (state === "expired") {
    statusBadge.textContent = statusBadge.dataset.expiredLabel ?? "session expired";
    return;
  }

  if (state === "missing") {
    statusBadge.textContent = statusBadge.dataset.missingLabel ?? "session missing";
    return;
  }

  const prefix = statusBadge.dataset.disconnectedPrefix ?? statusBadge.textContent ?? "";
  statusBadge.textContent = typeof closeCode === "number" ? `${prefix} (${closeCode})` : prefix;
};

const resolveAnimation = (
  manifest: SpriteManifest,
  animationKey: string,
  facing: EntityState["facing"],
): SpriteAnimationConfig => {
  const animation =
    manifest.animations[animationKey] ??
    manifest.animations[`idle-${facing}`] ??
    Object.values(manifest.animations)[0];
  if (animation) {
    return animation;
  }

  throw new Error(`Sprite manifest is missing animations for ${animationKey}`);
};

const resolveAnimationFrameIndex = (
  state: GameSceneState,
  animation: SpriteAnimationConfig,
): number => {
  if (animation.frames <= 1) {
    return 0;
  }

  const framesElapsed = Math.floor((state.worldTimeMs / 1000) * animation.speed);
  return framesElapsed % animation.frames;
};

const initGameClient = async (): Promise<void> => {
  const wrapper = document.getElementById("game-canvas-wrapper");
  if (!wrapper) {
    return;
  }

  const runtimeConfig = readClientRuntimeConfig();
  if (!runtimeConfig) {
    return;
  }

  const sessionMeta = readSessionMeta(runtimeConfig);
  if (!sessionMeta) {
    return;
  }

  let runtimeSessionMeta = sessionMeta;
  const threeLayer = new ThreeLayer(wrapper.clientWidth, wrapper.clientHeight);
  threeLayer.addTeaHouseEffects();
  wrapper.appendChild(threeLayer.renderer.domElement);

  const pixiRenderer = new PixiWebGLRenderer();
  await pixiRenderer.init({
    context: threeLayer.getContext() as WebGL2RenderingContext,
    width: wrapper.clientWidth,
    height: wrapper.clientHeight,
    clearBeforeRender: false,
    antialias: false,
  });

  const stage = new Container();
  stage.sortableChildren = true;

  const world = new Container();
  world.sortableChildren = true;
  stage.addChild(world);

  const sprites = new Map<string, Sprite>();
  const queueBadge = document.getElementById("game-command-queue");
  const statusBadge = document.getElementById("game-connection-status");
  const reconnectButton = document.getElementById("game-reconnect") as HTMLButtonElement | null;
  const connectionAlert = document.getElementById("game-connection-alert");
  const connectionAlertText = document.getElementById("game-connection-alert-text");
  const loadedTextures = new Map<string, Texture>();
  const frameTextures = new Map<string, Texture>();
  let backgroundSprite: Sprite | null = null;
  let commandSequence = 0;
  let commandQueueDepth = runtimeSessionMeta.commandQueueDepth;
  let lastState: GameSceneState | null = null;
  let targetState: GameSceneState | null = null;
  let activeSocket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let restoreAbortController: AbortController | null = null;
  let isDisposed = false;
  let connectionMode: "connected" | "reconnecting" | "expired" | "missing" | "disconnected" =
    "disconnected";

  const setReconnectVisible = (visible: boolean): void => {
    if (!reconnectButton) {
      return;
    }
    reconnectButton.textContent =
      reconnectButton.dataset.reconnectLabel ?? reconnectButton.textContent;
    reconnectButton.classList.toggle("hidden", !visible);
  };
  const setConnectionAlert = (
    message: string | null,
    tone: "info" | "warning" | "error" = "warning",
  ): void => {
    if (!connectionAlert || !connectionAlertText) {
      return;
    }

    connectionAlert.classList.toggle("hidden", !message);
    connectionAlert.classList.remove("alert-info", "alert-warning", "alert-error");
    connectionAlert.classList.add(
      tone === "error" ? "alert-error" : tone === "info" ? "alert-info" : "alert-warning",
    );
    connectionAlertText.textContent = message ?? "";
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
  const scheduleReconnect = (): void => {
    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
      if (isDisposed) {
        return;
      }
      connectSocket();
    }, runtimeConfig.socketReconnectDelayMs);
  };

  setQueueDepth(queueBadge, commandQueueDepth);
  setConnectionStatus(statusBadge, "connecting");
  setConnectionAlert(null);

  const ensureTextureLoaded = async (assetUrl: string): Promise<Texture> => {
    const cached = loadedTextures.get(assetUrl);
    if (cached) {
      return cached;
    }

    const texture = (await Assets.load(assetUrl)) as Texture;
    loadedTextures.set(assetUrl, texture);
    return texture;
  };

  const ensureSceneAssetsLoaded = async (state: GameSceneState): Promise<LoadedSceneAssets> => {
    const uniqueSheetUrls = new Set<string>([state.background]);
    const entities: readonly (EntityState | NpcState)[] = [state.player, ...state.npcs];

    for (const entity of entities) {
      const manifest = resolveSpriteManifest(entity.characterKey);
      if (manifest) {
        uniqueSheetUrls.add(manifest.sheet);
      }
    }

    await Promise.all(
      Array.from(uniqueSheetUrls.values(), (assetUrl) => ensureTextureLoaded(assetUrl)),
    );
    const backgroundTexture = loadedTextures.get(state.background) ?? Texture.EMPTY;

    if (!backgroundSprite) {
      backgroundSprite = new Sprite(backgroundTexture);
      backgroundSprite.zIndex = -10_000;
      world.addChildAt(backgroundSprite, 0);
    } else {
      backgroundSprite.texture = backgroundTexture;
    }

    backgroundSprite.x = 0;
    backgroundSprite.y = 0;
    backgroundSprite.width = state.geometry.width;
    backgroundSprite.height = state.geometry.height;

    return { backgroundTexture };
  };

  const resolveEntityTexture = (state: GameSceneState, entity: EntityState | NpcState): Texture => {
    const manifest = resolveSpriteManifest(entity.characterKey);
    if (!manifest) {
      return Texture.EMPTY;
    }

    const sheetTexture = loadedTextures.get(manifest.sheet);
    if (!sheetTexture) {
      return Texture.EMPTY;
    }

    const animation = resolveAnimation(manifest, entity.animation, entity.facing);
    const frameIndex = resolveAnimationFrameIndex(state, animation);
    const column = animation.startCol + frameIndex;
    const cacheKey = `${manifest.sheet}:${animation.row}:${column}`;
    const cached = frameTextures.get(cacheKey);

    if (cached) {
      return cached;
    }

    const texture = new Texture({
      source: sheetTexture.source,
      frame: new Rectangle(
        column * manifest.frameWidth,
        animation.row * manifest.frameHeight,
        manifest.frameWidth,
        manifest.frameHeight,
      ),
    });

    frameTextures.set(cacheKey, texture);
    return texture;
  };

  const syncRuntimeMeta = (frame: WsGameFrame): void => {
    const nextResumeToken =
      typeof frame.resumeToken === "string" && frame.resumeToken.length > 0
        ? frame.resumeToken
        : runtimeSessionMeta.resumeToken;
    const nextExpiry =
      typeof frame.resumeTokenExpiresAtMs === "number" &&
      Number.isFinite(frame.resumeTokenExpiresAtMs)
        ? frame.resumeTokenExpiresAtMs
        : runtimeSessionMeta.expiresAtMs;

    runtimeSessionMeta = {
      ...runtimeSessionMeta,
      resumeToken: nextResumeToken,
      expiresAtMs: nextExpiry,
      commandQueueDepth:
        typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth,
    };
    persistSessionMeta(runtimeSessionMeta, runtimeConfig);
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

      try {
        const response = await fetch(buildSessionRestoreUrl(runtimeSessionMeta.sessionId), {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          signal: controller.signal,
          body: JSON.stringify({
            resumeToken: runtimeSessionMeta.resumeToken,
          }),
        });
        if (!response.ok) {
          if (response.status >= 500 && attempt + 1 < runtimeConfig.restoreMaxAttempts) {
            await delay(runtimeConfig.socketReconnectDelayMs);
            continue;
          }
          return false;
        }

        const payload = (await response.json()) as RestoreSessionResponse;
        if (!payload.ok) {
          return false;
        }

        runtimeSessionMeta = {
          ...runtimeSessionMeta,
          resumeToken: payload.data.resumeToken ?? runtimeSessionMeta.resumeToken,
          expiresAtMs: payload.data.resumeTokenExpiresAtMs ?? runtimeSessionMeta.expiresAtMs,
          commandQueueDepth: payload.data.commandQueueDepth ?? runtimeSessionMeta.commandQueueDepth,
          locale: payload.data.locale,
          version: payload.data.version ?? runtimeSessionMeta.version,
        };
        persistSessionMeta(runtimeSessionMeta, runtimeConfig);
        commandQueueDepth = runtimeSessionMeta.commandQueueDepth;
        setQueueDepth(queueBadge, commandQueueDepth);
        return true;
      } catch (error) {
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
      } finally {
        clearTimeout(timeoutHandle);
        if (restoreAbortController === controller) {
          restoreAbortController = null;
        }
      }
    }
    return false;
  };

  const connectSocket = (): void => {
    if (isDisposed) {
      return;
    }
    if (
      activeSocket?.readyState === WebSocket.OPEN ||
      activeSocket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    connectionMode =
      connectionMode === "expired" || connectionMode === "missing"
        ? connectionMode
        : "reconnecting";
    clearReconnectTimer();
    setConnectionStatus(statusBadge, "connecting");
    setReconnectVisible(false);
    setConnectionAlert(null);
    const socket = new WebSocket(
      buildSessionSocketUrl(runtimeSessionMeta.sessionId, runtimeSessionMeta.resumeToken),
    );
    activeSocket = socket;

    socket.addEventListener("open", () => {
      if (activeSocket !== socket || isDisposed) {
        return;
      }
      connectionMode = "connected";
      setConnectionStatus(statusBadge, "connected");
      setReconnectVisible(false);
      setConnectionAlert(null);
      persistSessionMeta(runtimeSessionMeta, runtimeConfig);
    });

    socket.addEventListener("message", (message) => {
      if (activeSocket !== socket || isDisposed) {
        return;
      }
      const frame = parseGameFrameFromMessage(message.data);
      if (!frame) {
        return;
      }

      const state = resolveFrameState(frame);
      if (!state) {
        return;
      }

      void ensureSceneAssetsLoaded(state);
      syncRuntimeMeta(frame);
      lastState = targetState;
      targetState = state;
      commandQueueDepth =
        typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth;
      setQueueDepth(queueBadge, commandQueueDepth);
    });

    socket.addEventListener("close", (event) => {
      if (activeSocket !== socket) {
        return;
      }
      activeSocket = null;
      if (isDisposed) {
        return;
      }

      if (event.code === 4404) {
        connectionMode = "missing";
        setConnectionStatus(statusBadge, "missing", event.code);
        setReconnectVisible(true);
        setConnectionAlert(statusBadge?.dataset.missingLabel ?? "session missing", "warning");
        return;
      }

      const tokenExpired = event.code === 4408 || runtimeSessionMeta.expiresAtMs <= Date.now();
      if (tokenExpired) {
        connectionMode = "reconnecting";
        setConnectionStatus(statusBadge, "reconnecting", event.code);
        setReconnectVisible(false);
        setConnectionAlert(statusBadge?.dataset.reconnectingLabel ?? "reconnecting", "info");
        void attemptRestoreSession()
          .then((restored) => {
            if (restored) {
              connectSocket();
              return;
            }
            connectionMode = "expired";
            setConnectionStatus(statusBadge, "expired", event.code);
            setReconnectVisible(true);
            setConnectionAlert(statusBadge?.dataset.expiredLabel ?? "session expired", "error");
          })
          .catch(() => {
            connectionMode = "expired";
            setConnectionStatus(statusBadge, "expired", event.code);
            setReconnectVisible(true);
            setConnectionAlert(statusBadge?.dataset.expiredLabel ?? "session expired", "error");
          });
        return;
      }

      connectionMode = "reconnecting";
      setConnectionStatus(statusBadge, "reconnecting", event.code);
      setConnectionAlert(statusBadge?.dataset.reconnectingLabel ?? "reconnecting", "info");
      scheduleReconnect();
    });
  };

  const sendEnvelope = (command: GameCommand): void => {
    if (activeSocket?.readyState !== WebSocket.OPEN) {
      return;
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
  };

  reconnectButton?.addEventListener("click", () => {
    if (isDisposed) {
      return;
    }
    setReconnectVisible(false);
    setConnectionAlert(null);
    if (connectionMode === "missing") {
      window.location.reload();
      return;
    }

    connectionMode = "reconnecting";
    setConnectionStatus(statusBadge, "reconnecting");
    void attemptRestoreSession()
      .then((restored) => {
        if (restored) {
          connectSocket();
          return;
        }
        connectionMode = "expired";
        setConnectionStatus(statusBadge, "expired");
        setReconnectVisible(true);
        setConnectionAlert(statusBadge?.dataset.expiredLabel ?? "session expired", "error");
      })
      .catch(() => {
        connectionMode = "expired";
        setConnectionStatus(statusBadge, "expired");
        setReconnectVisible(true);
        setConnectionAlert(statusBadge?.dataset.expiredLabel ?? "session expired", "error");
      });
  });

  connectSocket();

  window.addEventListener("resize", () => {
    threeLayer.resize(wrapper.clientWidth, wrapper.clientHeight);
    pixiRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  });

  const keysHeld = new Set<string>();
  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) {
      return;
    }

    keysHeld.add(event.key);

    if (event.key === "e" || event.key === "Enter" || event.key === " ") {
      sendEnvelope({ type: "interact" });
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      sendEnvelope({ type: "confirmDialogue" });
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => {
    keysHeld.delete(event.key);
  });

  let lastMoveSentAt = 0;
  const ticker = new Ticker();
  ticker.add((time) => {
    const now = performance.now();
    if (now - lastMoveSentAt > runtimeConfig.commandSendIntervalMs) {
      if (keysHeld.has("w") || keysHeld.has("ArrowUp")) {
        sendEnvelope({
          type: "move",
          direction: "up",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
      } else if (keysHeld.has("s") || keysHeld.has("ArrowDown")) {
        sendEnvelope({
          type: "move",
          direction: "down",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
      } else if (keysHeld.has("a") || keysHeld.has("ArrowLeft")) {
        sendEnvelope({
          type: "move",
          direction: "left",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
      } else if (keysHeld.has("d") || keysHeld.has("ArrowRight")) {
        sendEnvelope({
          type: "move",
          direction: "right",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
      }
      lastMoveSentAt = now;
    }

    if (targetState) {
      renderState(
        targetState,
        lastState,
        Math.min((now - lastMoveSentAt) / runtimeConfig.commandSendIntervalMs, 1),
        sprites,
        world,
        resolveEntityTexture,
      );
    }

    threeLayer.tick(time.deltaMS);
    pixiRenderer.resetState();
    pixiRenderer.render({ container: stage });
  });
  ticker.start();

  window.addEventListener("beforeunload", () => {
    isDisposed = true;
    clearReconnectTimer();
    cancelRestoreRequest();
    activeSocket?.close();
    activeSocket = null;
    ticker.stop();
  });

  persistSessionMeta(runtimeSessionMeta, runtimeConfig);
};

const renderState = (
  current: GameSceneState,
  previous: GameSceneState | null,
  alpha: number,
  sprites: Map<string, Sprite>,
  world: Container,
  resolveEntityTexture: (state: GameSceneState, entity: EntityState | NpcState) => Texture,
): void => {
  const entities: readonly (EntityState | NpcState)[] = [current.player, ...current.npcs];

  for (const entity of entities) {
    const manifest = resolveSpriteManifest(entity.characterKey);
    const sprite =
      sprites.get(entity.id) ??
      (() => {
        const created = new Sprite();
        created.anchor.set(0, 0);
        world.addChild(created);
        sprites.set(entity.id, created);
        return created;
      })();

    const previousEntity =
      previous?.player.id === entity.id
        ? previous.player
        : previous?.npcs.find((npc) => npc.id === entity.id);
    const previousX = previousEntity?.position.x ?? entity.position.x;
    const previousY = previousEntity?.position.y ?? entity.position.y;

    sprite.texture = resolveEntityTexture(current, entity);
    sprite.scale.set(manifest?.scale ?? 1);
    sprite.x = previousX + (entity.position.x - previousX) * alpha - current.camera.x;
    sprite.y = previousY + (entity.position.y - previousY) * alpha - current.camera.y;
    sprite.zIndex = sprite.y;
  }
};

void initGameClient().catch(() => {
  setConnectionStatus(document.getElementById("game-connection-status"), "disconnected");
});

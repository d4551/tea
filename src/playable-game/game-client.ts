import {
  Assets,
  autoDetectRenderer,
  Container,
  Graphics,
  Rectangle,
  type Renderer,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { appRoutes, interpolateRoutePath } from "../shared/constants/routes.ts";
import type {
  EntityState,
  GameCommand,
  GameParticipantPresence,
  GameRealtimeFrame,
  GameSceneState,
  NpcState,
  SpriteAnimationConfig,
  SpriteManifest,
} from "../shared/contracts/game.ts";
import { validateGameRealtimeFrame } from "../shared/contracts/game.ts";
import { readLocalStorage, writeLocalStorage } from "../shared/utils/browser-storage.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";
import { ThreeLayer } from "./three-layer.ts";

type PersistedSessionMeta = {
  readonly sessionId: string;
  readonly participantSessionId: string;
  readonly resumeToken: string;
  readonly locale: string;
  readonly participantRole: "owner" | "controller" | "spectator";
  readonly commandQueueDepth: number;
  readonly version: number;
  readonly expiresAtMs: number;
};

type LoadedSceneAssets = {
  readonly backgroundTexture: Texture;
};

type RestoreSessionResponse = {
  readonly ok: true;
  readonly data: {
    readonly sessionId: string;
    readonly participantSessionId?: string;
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
  readonly rendererPreference: "webgpu" | "webgl";
};

type GameConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "expired"
  | "missing";

type GameClientLabels = {
  readonly queueLabel: string;
  readonly connection: Readonly<Record<GameConnectionState, string>>;
  readonly reconnectAction: string;
  readonly runtimeFocusActive: string;
  readonly runtimeFocusInactive: string;
};

const SESSION_META_KEY = "lotfk:game:session-meta";
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const readMeta = (selector: string): HTMLMetaElement | null =>
  document.querySelector<HTMLMetaElement>(selector);

const resolveDocumentLocale = (): string => {
  const documentLocale = document.documentElement.lang.trim();
  if (documentLocale.length > 0) {
    return documentLocale;
  }

  const browserLocale =
    navigator.languages.find((locale) => locale.trim().length > 0) ?? navigator.language;
  return browserLocale.trim();
};

const resolveSpriteManifest = (characterKey: string): SpriteManifest | null =>
  gameSpriteManifests[characterKey] ?? null;

const getSceneEntities = (
  state: GameSceneState,
): readonly (EntityState | NpcState | GameParticipantPresence["entity"])[] => [
  state.player,
  ...(state.coPlayers?.map((presence) => presence.entity) ?? []),
  ...state.npcs,
];

const findPreviousEntity = (
  state: GameSceneState | null,
  entityId: string,
): EntityState | NpcState | GameParticipantPresence["entity"] | null => {
  if (!state) {
    return null;
  }

  return getSceneEntities(state).find((entity) => entity.id === entityId) ?? null;
};

const resolveLocalActor = (
  state: GameSceneState,
  participantSessionId: string,
): EntityState | GameParticipantPresence["entity"] =>
  participantSessionId.length > 0
    ? (state.coPlayers?.find((presence) => presence.sessionId === participantSessionId)?.entity ??
      state.player)
    : state.player;

const resolveLocalCamera = (
  state: GameSceneState,
  participantSessionId: string,
): Readonly<{ readonly x: number; readonly y: number }> => {
  const localActor = resolveLocalActor(state, participantSessionId);
  if (localActor.id === state.player.id) {
    return state.camera;
  }

  return {
    x: state.camera.x + (localActor.position.x - state.player.position.x),
    y: state.camera.y + (localActor.position.y - state.player.position.y),
  };
};

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
  const rendererPreferenceRaw = readMeta('meta[name="game-client-renderer-preference"]')?.dataset
    .gameClientRendererPreference;
  const rendererPreference: "webgpu" | "webgl" =
    rendererPreferenceRaw === "webgl" ? "webgl" : "webgpu";
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
    rendererPreference,
  };
};

const readNonEmptyDatasetValue = (
  element: HTMLElement | null,
  attributeName: string,
): string | null => {
  const value = element?.dataset[attributeName];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readGameClientLabels = (
  wrapper: HTMLElement,
  statusBadge: HTMLElement | null,
  queueBadge: HTMLElement | null,
  reconnectButton: HTMLButtonElement | null,
): GameClientLabels | null => {
  const queueLabel = readNonEmptyDatasetValue(queueBadge, "queueLabel");
  const connectionConnecting = readNonEmptyDatasetValue(statusBadge, "connectingLabel");
  const connectionConnected = readNonEmptyDatasetValue(statusBadge, "connectedLabel");
  const connectionDisconnected = readNonEmptyDatasetValue(statusBadge, "disconnectedPrefix");
  const connectionReconnecting = readNonEmptyDatasetValue(statusBadge, "reconnectingLabel");
  const connectionExpired = readNonEmptyDatasetValue(statusBadge, "expiredLabel");
  const connectionMissing = readNonEmptyDatasetValue(statusBadge, "missingLabel");
  const reconnectAction = readNonEmptyDatasetValue(reconnectButton, "reconnectLabel");
  const runtimeFocusActive = readNonEmptyDatasetValue(wrapper, "runtimeFocusActiveLabel");
  const runtimeFocusInactive = readNonEmptyDatasetValue(wrapper, "runtimeFocusInactiveLabel");

  if (
    !queueLabel ||
    !connectionConnecting ||
    !connectionConnected ||
    !connectionDisconnected ||
    !connectionReconnecting ||
    !connectionExpired ||
    !connectionMissing ||
    !reconnectAction ||
    !runtimeFocusActive ||
    !runtimeFocusInactive
  ) {
    return null;
  }

  return {
    queueLabel,
    connection: {
      connecting: connectionConnecting,
      connected: connectionConnected,
      disconnected: connectionDisconnected,
      reconnecting: connectionReconnecting,
      expired: connectionExpired,
      missing: connectionMissing,
    },
    reconnectAction,
    runtimeFocusActive,
    runtimeFocusInactive,
  };
};

const isInteractiveElement = (element: Element | null): boolean =>
  Boolean(
    element?.closest(
      'a, button, input, select, textarea, summary, [contenteditable=""], [contenteditable="true"], [role="button"]',
    ),
  );

const readSessionMeta = (runtimeConfig: GameClientRuntimeConfig): PersistedSessionMeta | null => {
  const sessionMeta = readMeta('meta[name="game-session-id"]');
  if (!sessionMeta) {
    return null;
  }

  const sessionId = sessionMeta.dataset.sessionId?.trim();
  if (!sessionId) {
    return null;
  }

  const locale =
    readMeta('meta[name="game-session-locale"]')?.dataset.gameSessionLocale ??
    resolveDocumentLocale();
  const participantSessionId =
    readMeta('meta[name="game-session-participant-id"]')?.dataset.gameSessionParticipantId ?? "";
  const resumeToken =
    readMeta('meta[name="game-session-resume-token"]')?.dataset.sessionResumeToken ?? "";
  const participantRoleRaw = readMeta('meta[name="game-session-participant-role"]')?.dataset
    .gameSessionParticipantRole;
  const participantRole =
    participantRoleRaw === "spectator"
      ? "spectator"
      : participantRoleRaw === "controller"
        ? "controller"
        : "owner";
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
    participantSessionId,
    resumeToken,
    locale,
    participantRole,
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
    stored.participantSessionId.length > 0 &&
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
      participantSessionId: stored.participantSessionId,
      participantRole:
        stored.participantRole === "spectator" || stored.participantRole === "controller"
          ? stored.participantRole
          : runtimeMeta.participantRole,
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

const parseGameFrameFromMessage = (incoming: unknown): GameRealtimeFrame | null => {
  if (typeof incoming !== "string" && typeof incoming !== "object") {
    return null;
  }

  if (incoming instanceof ArrayBuffer || incoming instanceof Blob) {
    return null;
  }

  const payload = typeof incoming === "string" ? safeJsonParse(incoming, null) : incoming;

  const validation = validateGameRealtimeFrame(payload);
  if (!validation.ok) {
    return null;
  }

  return validation.data;
};

const setQueueDepth = (
  queueBadge: HTMLElement | null,
  statusTarget: HTMLElement | null,
  labels: GameClientLabels,
  depth: number,
): void => {
  if (queueBadge) {
    queueBadge.textContent = `${labels.queueLabel}: ${depth}`;
  }

  if (statusTarget) {
    statusTarget.dataset.commandQueueDepth = String(depth);
  }
};

const setConnectionStatus = (
  statusBadge: HTMLElement | null,
  labels: GameClientLabels,
  state: GameConnectionState,
  closeCode?: number,
): void => {
  if (!statusBadge) {
    return;
  }

  if (state === "connecting" || state === "connected" || state === "reconnecting") {
    statusBadge.textContent = labels.connection[state];
    return;
  }

  if (state === "expired" || state === "missing") {
    statusBadge.textContent = labels.connection[state];
    return;
  }

  const prefix = labels.connection.disconnected;
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

  const queueBadge = document.getElementById("game-command-queue");
  const statusBadge = document.getElementById("game-connection-status");
  const statusTarget = document.getElementById("game-session-meta");
  const reconnectButton = document.getElementById("game-reconnect") as HTMLButtonElement | null;
  const connectionAlert = document.getElementById("game-connection-alert");
  const connectionAlertText = document.getElementById("game-connection-alert-text");
  const focusStatus = document.getElementById("game-runtime-focus-status");
  const labels = readGameClientLabels(wrapper, statusBadge, queueBadge, reconnectButton);
  if (!labels) {
    return;
  }

  const sessionMeta = readSessionMeta(runtimeConfig);
  if (!sessionMeta) {
    return;
  }

  let runtimeSessionMeta = sessionMeta;
  const threeLayer = new ThreeLayer(wrapper.clientWidth, wrapper.clientHeight);
  threeLayer.addTeaHouseEffects();

  /** Resolve rendering mode: WebGPU uses separate canvases, WebGL shares context. */
  const useWebGpuMode = runtimeConfig.rendererPreference === "webgpu";
  let pixiRenderer: Renderer;

  if (useWebGpuMode) {
    /** WebGPU mode: Three.js canvas underneath, PixiJS canvas on top with transparent BG. */
    const threeCanvas = threeLayer.renderer.domElement;
    threeCanvas.style.position = "absolute";
    threeCanvas.style.inset = "0";
    threeCanvas.style.width = "100%";
    threeCanvas.style.height = "100%";
    wrapper.appendChild(threeCanvas);

    pixiRenderer = await autoDetectRenderer({
      preference: "webgpu",
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      backgroundAlpha: 0,
      clearBeforeRender: true,
      antialias: false,
    });

    const pixiCanvas = pixiRenderer.canvas as HTMLCanvasElement;
    pixiCanvas.style.position = "absolute";
    pixiCanvas.style.inset = "0";
    pixiCanvas.style.width = "100%";
    pixiCanvas.style.height = "100%";
    wrapper.appendChild(pixiCanvas);
  } else {
    /** WebGL mode: shared context (existing pattern). */
    wrapper.appendChild(threeLayer.renderer.domElement);

    pixiRenderer = await autoDetectRenderer({
      preference: "webgl",
      context: threeLayer.getContext() as WebGL2RenderingContext,
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      clearBeforeRender: false,
      antialias: false,
    });
  }

  const stage = new Container();
  stage.sortableChildren = true;

  const world = new Container();
  world.sortableChildren = true;
  stage.addChild(world);

  const sprites = new Map<string, Sprite>();
  const nodeOverlays = new Map<string, Graphics>();
  const listenerController = new AbortController();
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
  let runtimeHasFocus = false;
  let connectionMode: "connected" | "reconnecting" | "expired" | "missing" | "disconnected" =
    "disconnected";

  const setReconnectVisible = (visible: boolean): void => {
    if (!reconnectButton) {
      return;
    }
    reconnectButton.textContent = labels.reconnectAction;
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
  const setRuntimeFocusState = (active: boolean): void => {
    runtimeHasFocus = active;
    wrapper.dataset.runtimeActive = active ? "true" : "false";
    if (focusStatus) {
      focusStatus.textContent = active ? labels.runtimeFocusActive : labels.runtimeFocusInactive;
    }
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

  setQueueDepth(queueBadge, statusTarget, labels, commandQueueDepth);
  setConnectionStatus(statusBadge, labels, "connecting");
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
    const entities = getSceneEntities(state);

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

    runtimeSessionMeta = {
      ...runtimeSessionMeta,
      resumeToken: nextResumeToken,
      expiresAtMs: nextExpiry,
      commandQueueDepth:
        typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth,
      participantRole:
        frame.participantRole === undefined
          ? runtimeSessionMeta.participantRole
          : frame.participantRole,
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

      const fetchResult = await fetch(buildSessionRestoreUrl(runtimeSessionMeta.sessionId), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          resumeToken: runtimeSessionMeta.resumeToken,
        }),
      }).catch((error) => ({ error }));

      clearTimeout(timeoutHandle);
      if (restoreAbortController === controller) {
        restoreAbortController = null;
      }

      if (fetchResult && "error" in fetchResult) {
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

      const response = fetchResult as Response;
      if (!response.ok) {
        if (response.status >= 500 && attempt + 1 < runtimeConfig.restoreMaxAttempts) {
          await delay(runtimeConfig.socketReconnectDelayMs);
          continue;
        }
        return false;
      }

      const payload = (await response.json().catch(() => null)) as RestoreSessionResponse | null;
      if (!payload?.ok) {
        return false;
      }

      runtimeSessionMeta = {
        ...runtimeSessionMeta,
        participantSessionId:
          payload.data.participantSessionId ?? runtimeSessionMeta.participantSessionId,
        resumeToken: payload.data.resumeToken ?? runtimeSessionMeta.resumeToken,
        expiresAtMs: payload.data.resumeTokenExpiresAtMs ?? runtimeSessionMeta.expiresAtMs,
        commandQueueDepth: payload.data.commandQueueDepth ?? runtimeSessionMeta.commandQueueDepth,
        locale: payload.data.locale,
        version: payload.data.version ?? runtimeSessionMeta.version,
      };
      persistSessionMeta(runtimeSessionMeta, runtimeConfig);
      commandQueueDepth = runtimeSessionMeta.commandQueueDepth;
      setQueueDepth(queueBadge, statusTarget, labels, commandQueueDepth);
      return true;
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
    setConnectionStatus(statusBadge, labels, "connecting");
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
      setConnectionStatus(statusBadge, labels, "connected");
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

      const state = frame.state ?? null;
      if (!state) {
        return;
      }

      void ensureSceneAssetsLoaded(state);
      syncRuntimeMeta(frame);
      lastState = targetState;
      targetState = state;
      commandQueueDepth =
        typeof frame.commandQueueDepth === "number" ? frame.commandQueueDepth : commandQueueDepth;
      setQueueDepth(queueBadge, statusTarget, labels, commandQueueDepth);
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
        setConnectionStatus(statusBadge, labels, "missing", event.code);
        setReconnectVisible(true);
        setConnectionAlert(labels.connection.missing, "warning");
        return;
      }

      const tokenExpired = event.code === 4408 || runtimeSessionMeta.expiresAtMs <= Date.now();
      if (tokenExpired) {
        connectionMode = "reconnecting";
        setConnectionStatus(statusBadge, labels, "reconnecting", event.code);
        setReconnectVisible(false);
        setConnectionAlert(labels.connection.reconnecting, "info");
        void attemptRestoreSession()
          .then((restored) => {
            if (restored) {
              connectSocket();
              return;
            }
            connectionMode = "expired";
            setConnectionStatus(statusBadge, labels, "expired", event.code);
            setReconnectVisible(true);
            setConnectionAlert(labels.connection.expired, "error");
          })
          .catch(() => {
            connectionMode = "expired";
            setConnectionStatus(statusBadge, labels, "expired", event.code);
            setReconnectVisible(true);
            setConnectionAlert(labels.connection.expired, "error");
          });
        return;
      }

      connectionMode = "reconnecting";
      setConnectionStatus(statusBadge, labels, "reconnecting", event.code);
      setConnectionAlert(labels.connection.reconnecting, "info");
      scheduleReconnect();
    });
  };

  const sendEnvelope = (command: GameCommand): void => {
    if (runtimeSessionMeta.participantRole === "spectator") {
      return;
    }
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

  const shouldCaptureGameInput = (): boolean => {
    if (!runtimeHasFocus || document.activeElement !== wrapper) {
      return false;
    }

    return !isInteractiveElement(document.activeElement);
  };

  const keysHeld = new Set<string>();
  let lastMoveSentAt = 0;
  const ticker = new Ticker();
  ticker.add((time) => {
    const now = performance.now();
    if (shouldCaptureGameInput() && now - lastMoveSentAt > runtimeConfig.commandSendIntervalMs) {
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
      threeLayer.syncSceneState(targetState);
      renderState(
        targetState,
        lastState,
        Math.min((now - lastMoveSentAt) / runtimeConfig.commandSendIntervalMs, 1),
        runtimeSessionMeta.participantSessionId,
        sprites,
        nodeOverlays,
        world,
        resolveEntityTexture,
      );
    }

    threeLayer.tick(time.deltaMS);
    pixiRenderer.render({ container: stage });
  });

  const disposeRuntime = (): void => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    listenerController.abort();
    clearReconnectTimer();
    cancelRestoreRequest();
    activeSocket?.close();
    activeSocket = null;
    keysHeld.clear();
    ticker.stop();
    ticker.destroy();
    stage.destroy({ children: true });
    pixiRenderer.destroy();
    threeLayer.dispose();
    wrapper.replaceChildren();
  };

  reconnectButton?.addEventListener(
    "click",
    () => {
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
      setConnectionStatus(statusBadge, labels, "reconnecting");
      void attemptRestoreSession()
        .then((restored) => {
          if (restored) {
            connectSocket();
            return;
          }
          connectionMode = "expired";
          setConnectionStatus(statusBadge, labels, "expired");
          setReconnectVisible(true);
          setConnectionAlert(labels.connection.expired, "error");
        })
        .catch(() => {
          connectionMode = "expired";
          setConnectionStatus(statusBadge, labels, "expired");
          setReconnectVisible(true);
          setConnectionAlert(labels.connection.expired, "error");
        });
    },
    { signal: listenerController.signal },
  );

  window.addEventListener(
    "resize",
    () => {
      threeLayer.resize(wrapper.clientWidth, wrapper.clientHeight);
      pixiRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "pointerdown",
    () => {
      wrapper.focus({ preventScroll: true });
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "focus",
    () => {
      setRuntimeFocusState(true);
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "blur",
    () => {
      keysHeld.clear();
      setRuntimeFocusState(false);
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "keydown",
    (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        !shouldCaptureGameInput()
      ) {
        return;
      }

      keysHeld.add(event.key);

      if (event.key === "e" || event.key === "Enter" || event.key === " ") {
        sendEnvelope({ type: "interact" });
        event.preventDefault();
        return;
      }

      if (event.key.toLowerCase() === "i" || event.key === "Tab") {
        sendEnvelope({ type: "openInventory" });
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        // First try to close dialogue, then try to close inventory
        sendEnvelope({ type: "closeDialogue" });
        sendEnvelope({ type: "closeInventory" });
        event.preventDefault();
      }
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "keyup",
    (event) => {
      keysHeld.delete(event.key);
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

  setRuntimeFocusState(document.activeElement === wrapper);

  connectSocket();
  ticker.start();

  persistSessionMeta(runtimeSessionMeta, runtimeConfig);
};

const renderState = (
  current: GameSceneState,
  previous: GameSceneState | null,
  alpha: number,
  participantSessionId: string,
  sprites: Map<string, Sprite>,
  nodeOverlays: Map<string, Graphics>,
  world: Container,
  resolveEntityTexture: (state: GameSceneState, entity: EntityState | NpcState) => Texture,
): void => {
  const entities = getSceneEntities(current);
  const activeNodeIds = new Set<string>();
  const camera = resolveLocalCamera(current, participantSessionId);

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

    const previousEntity = findPreviousEntity(previous, entity.id);
    const previousX = previousEntity?.position.x ?? entity.position.x;
    const previousY = previousEntity?.position.y ?? entity.position.y;

    sprite.texture = resolveEntityTexture(current, entity);
    sprite.scale.set(manifest?.scale ?? 1);
    sprite.x = previousX + (entity.position.x - previousX) * alpha - camera.x;
    sprite.y = previousY + (entity.position.y - previousY) * alpha - camera.y;
    sprite.zIndex = sprite.y;
  }

  if (current.sceneMode !== "3d") {
    for (const node of current.nodes ?? []) {
      if (!("size" in node)) {
        continue;
      }

      activeNodeIds.add(node.id);
      const overlay =
        nodeOverlays.get(node.id) ??
        (() => {
          const created = new Graphics();
          world.addChild(created);
          nodeOverlays.set(node.id, created);
          return created;
        })();

      overlay.clear();
      overlay.rect(0, 0, node.size.width, node.size.height).fill({
        color: node.nodeType === "trigger" ? 0xf59e0b : 0x38bdf8,
        alpha: node.nodeType === "trigger" ? 0.22 : 0.16,
      });
      overlay.stroke({
        color: node.nodeType === "trigger" ? 0xf59e0b : 0x38bdf8,
        width: 2,
        alpha: 0.9,
      });
      overlay.x = node.position.x - camera.x;
      overlay.y = node.position.y - camera.y;
      overlay.zIndex = overlay.y + node.size.height;
    }
  }

  for (const [nodeId, overlay] of nodeOverlays.entries()) {
    if (activeNodeIds.has(nodeId)) {
      continue;
    }
    world.removeChild(overlay);
    overlay.destroy();
    nodeOverlays.delete(nodeId);
  }
};

void initGameClient().catch(() => {
  const wrapper = document.getElementById("game-canvas-wrapper");
  const statusBadge = document.getElementById("game-connection-status");
  const queueBadge = document.getElementById("game-command-queue");
  const reconnectButton = document.getElementById("game-reconnect") as HTMLButtonElement | null;
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }

  const labels = readGameClientLabels(wrapper, statusBadge, queueBadge, reconnectButton);
  if (!labels) {
    return;
  }

  setConnectionStatus(statusBadge, labels, "disconnected");
});

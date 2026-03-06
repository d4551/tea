import { Container, WebGLRenderer as PixiWebGLRenderer, Sprite, Ticker } from "pixi.js";
import { appRoutes, interpolateRoutePath } from "../shared/constants/routes.ts";
import type {
  EntityState,
  GameCommand,
  GameSceneState,
  NpcState,
} from "../shared/contracts/game.ts";
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
};

const SESSION_META_KEY = "lotfk:game:session-meta";
const COMMAND_SEND_INTERVAL_MS = 50;
const COMMAND_TTL_FALLBACK_MS = 60_000;

const readMeta = (selector: string): HTMLMetaElement | null =>
  document.querySelector<HTMLMetaElement>(selector);

const readSessionMeta = (): PersistedSessionMeta | null => {
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
  const resumeWindowMs =
    Number.parseInt(
      readMeta('meta[name="game-session-resume-window-ms"]')?.dataset.gameSessionResumeWindowMs ??
        "",
      10,
    ) || COMMAND_TTL_FALLBACK_MS;

  const runtimeMeta: PersistedSessionMeta = {
    sessionId,
    resumeToken,
    locale,
    commandQueueDepth,
    version,
    expiresAtMs: Date.now() + Math.max(resumeWindowMs, COMMAND_TTL_FALLBACK_MS),
  };

  let storedRaw: string | null = null;
  try {
    storedRaw = localStorage.getItem(SESSION_META_KEY);
  } catch {
    storedRaw = null;
  }

  if (!storedRaw) {
    return runtimeMeta;
  }

  try {
    const stored = JSON.parse(storedRaw) as PersistedSessionMeta;
    if (
      stored.sessionId === sessionId &&
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
  } catch {
    return runtimeMeta;
  }

  return runtimeMeta;
};

const persistSessionMeta = (meta: PersistedSessionMeta): void => {
  try {
    localStorage.setItem(
      SESSION_META_KEY,
      JSON.stringify({
        ...meta,
        expiresAtMs: Math.max(meta.expiresAtMs, Date.now() + COMMAND_TTL_FALLBACK_MS),
      }),
    );
  } catch {
    return;
  }
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

const parseGameStateFromMessage = (incoming: unknown): GameSceneState | null => {
  if (typeof incoming !== "string" && typeof incoming !== "object") {
    return null;
  }

  const payload = (() => {
    if (typeof incoming === "string") {
      try {
        return JSON.parse(incoming) as unknown;
      } catch {
        return null;
      }
    }

    if (incoming instanceof ArrayBuffer || incoming instanceof Blob) {
      return null;
    }

    return incoming;
  })();

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<WsGameFrame>;
  if (candidate.player && candidate.npcs) {
    return candidate as GameSceneState;
  }

  if (candidate.state && typeof candidate.state === "object") {
    return candidate.state as GameSceneState;
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
  state: "connecting" | "connected" | "disconnected",
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

  const prefix = statusBadge.dataset.disconnectedPrefix ?? statusBadge.textContent ?? "";
  statusBadge.textContent = typeof closeCode === "number" ? `${prefix} (${closeCode})` : prefix;
};

const initGameClient = async (): Promise<void> => {
  const wrapper = document.getElementById("game-canvas-wrapper");
  if (!wrapper) {
    return;
  }

  const sessionMeta = readSessionMeta();
  if (!sessionMeta) {
    return;
  }

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
  const sprites = new Map<string, Sprite>();
  const queueBadge = document.getElementById("game-command-queue");
  const statusBadge = document.getElementById("game-connection-status");
  let commandSequence = 0;
  let commandQueueDepth = sessionMeta.commandQueueDepth;
  let lastState: GameSceneState | null = null;
  let targetState: GameSceneState | null = null;

  setQueueDepth(queueBadge, commandQueueDepth);
  setConnectionStatus(statusBadge, "connecting");

  const socket = new WebSocket(
    buildSessionSocketUrl(sessionMeta.sessionId, sessionMeta.resumeToken),
  );
  socket.addEventListener("open", () => {
    setConnectionStatus(statusBadge, "connected");
  });
  socket.addEventListener("message", (message) => {
    const state = parseGameStateFromMessage(message.data);
    if (!state) {
      return;
    }

    lastState = targetState;
    targetState = state;
    commandQueueDepth = Math.max(commandQueueDepth - 1, 0);
    setQueueDepth(queueBadge, commandQueueDepth);
  });
  socket.addEventListener("close", (event) => {
    setConnectionStatus(statusBadge, "disconnected", event.code);
  });

  const sendEnvelope = (command: GameCommand): void => {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    commandSequence += 1;
    socket.send(
      JSON.stringify({
        commandId: crypto.randomUUID(),
        source: "ws",
        locale: sessionMeta.locale,
        sequenceId: commandSequence,
        timestamp: new Date().toISOString(),
        ttlMs: COMMAND_TTL_FALLBACK_MS,
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

    commandQueueDepth += 1;
    setQueueDepth(queueBadge, commandQueueDepth);
  };

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
      sendEnvelope({ type: "closeDialogue" });
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
    if (now - lastMoveSentAt > COMMAND_SEND_INTERVAL_MS) {
      if (keysHeld.has("w") || keysHeld.has("ArrowUp")) {
        sendEnvelope({ type: "move", direction: "up", durationMs: COMMAND_SEND_INTERVAL_MS });
      } else if (keysHeld.has("s") || keysHeld.has("ArrowDown")) {
        sendEnvelope({ type: "move", direction: "down", durationMs: COMMAND_SEND_INTERVAL_MS });
      } else if (keysHeld.has("a") || keysHeld.has("ArrowLeft")) {
        sendEnvelope({ type: "move", direction: "left", durationMs: COMMAND_SEND_INTERVAL_MS });
      } else if (keysHeld.has("d") || keysHeld.has("ArrowRight")) {
        sendEnvelope({ type: "move", direction: "right", durationMs: COMMAND_SEND_INTERVAL_MS });
      }
      lastMoveSentAt = now;
    }

    if (targetState) {
      renderState(
        targetState,
        lastState,
        Math.min((now - lastMoveSentAt) / COMMAND_SEND_INTERVAL_MS, 1),
        sprites,
        stage,
      );
    }

    threeLayer.tick(time.deltaMS);
    pixiRenderer.resetState();
    pixiRenderer.render({ container: stage });
  });
  ticker.start();

  persistSessionMeta({
    sessionId: sessionMeta.sessionId,
    resumeToken: sessionMeta.resumeToken,
    locale: sessionMeta.locale,
    commandQueueDepth,
    version: sessionMeta.version,
    expiresAtMs: sessionMeta.expiresAtMs,
  });
};

const renderState = (
  current: GameSceneState,
  previous: GameSceneState | null,
  alpha: number,
  sprites: Map<string, Sprite>,
  stage: Container,
): void => {
  const entities: readonly (EntityState | NpcState)[] = [current.player, ...current.npcs];

  for (const entity of entities) {
    const sprite =
      sprites.get(entity.id) ??
      (() => {
        const created = new Sprite();
        created.anchor.set(0.5, 1);
        stage.addChild(created);
        sprites.set(entity.id, created);
        return created;
      })();

    const previousEntity =
      previous?.player.id === entity.id
        ? previous.player
        : previous?.npcs.find((npc) => npc.id === entity.id);
    const previousX = previousEntity?.position.x ?? entity.position.x;
    const previousY = previousEntity?.position.y ?? entity.position.y;
    sprite.x = previousX + (entity.position.x - previousX) * alpha - (current.camera.x ?? 0);
    sprite.y = previousY + (entity.position.y - previousY) * alpha - (current.camera.y ?? 0);
  }

  stage.children.sort((left, right) => left.y - right.y);
};

void initGameClient().catch(() => {
  setConnectionStatus(document.getElementById("game-connection-status"), "disconnected");
});

import { Elysia, t } from "elysia";
import { normalizeLocale } from "../config/environment.ts";
import { gameTextByLocale } from "../domain/game/data/game-text.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { ApplicationError } from "../lib/error-envelope.ts";
import { createLogger } from "../lib/logger.ts";
import { authSessionGuard, resolveAuthSession } from "../plugins/auth-session.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type {
  GameHudState,
  GameSession,
  GameSessionState,
  GameSseCloseFrame,
  GameSseCloseReason,
} from "../shared/contracts/game.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";
import { escapeHtml } from "../views/layout.ts";
import { type SseUtils, ssePlugin } from "./sse-plugin.ts";

const _logger = createLogger("game.plugin");

const endpoint = (path: string): string => path.replace(/^\/api\/game/, "");
const route = {
  create: endpoint(appRoutes.gameApiSession),
  state: endpoint(appRoutes.gameApiSessionState),
  restore: endpoint(appRoutes.gameApiSessionRestore),
  close: endpoint(appRoutes.gameApiSessionClose),
  command: endpoint(appRoutes.gameApiSessionCommand),
  dialogue: endpoint(appRoutes.gameApiSessionDialogue),
  save: endpoint(appRoutes.gameApiSessionSave),
  hud: endpoint(appRoutes.gameApiSessionHud),
};

const gameCommandPayloadSchema = t.Union([
  t.Object({
    commandId: t.Optional(t.String()),
    source: t.Optional(t.Union([t.Literal("ws"), t.Literal("http")])),
    locale: t.Optional(t.String()),
    sequenceId: t.Optional(t.Number()),
    timestamp: t.Optional(t.String()),
    ttlMs: t.Optional(t.Number()),
    command: t.Union([
      t.Object({
        type: t.Literal("move"),
        direction: t.Union([
          t.Literal("up"),
          t.Literal("down"),
          t.Literal("left"),
          t.Literal("right"),
        ]),
        durationMs: t.Optional(t.Number()),
      }),
      t.Object({
        type: t.Literal("interact"),
        npcId: t.Optional(t.String()),
      }),
      t.Object({
        type: t.Literal("confirmDialogue"),
      }),
      t.Object({
        type: t.Literal("chat"),
        message: t.String(),
        npcId: t.String(),
      }),
      t.Object({
        type: t.Literal("closeDialogue"),
      }),
      t.Object({
        type: t.Literal("retryAction"),
      }),
    ]),
  }),
  t.Object({
    type: t.Union([
      t.Literal("move"),
      t.Literal("interact"),
      t.Literal("confirmDialogue"),
      t.Literal("chat"),
      t.Literal("closeDialogue"),
      t.Literal("retryAction"),
    ]),
    direction: t.Optional(
      t.Union([t.Literal("up"), t.Literal("down"), t.Literal("left"), t.Literal("right")]),
    ),
    durationMs: t.Optional(t.Number()),
    npcId: t.Optional(t.String()),
    message: t.Optional(t.String()),
  }),
]);
const commandBodySchema = gameCommandPayloadSchema;
const createSessionBodySchema = t.Object({
  locale: t.Optional(t.String()),
  sceneId: t.Optional(t.String()),
  projectId: t.Optional(t.String()),
});
const restoreSessionBodySchema = t.Object({
  resumeToken: t.String(),
});
const errorResponse = t.Object({
  ok: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    retryable: t.Boolean(),
    correlationId: t.String(),
  }),
});
const _snapshotState = t.Object({
  sessionId: t.String(),
  locale: t.String(),
  timestamp: t.String(),
  state: t.Object({}, { additionalProperties: true }),
});
const gameSessionStateSchema = t.Object({
  sessionId: t.String(),
  locale: t.String(),
  timestamp: t.String(),
  state: t.Optional(t.Object({}, { additionalProperties: true })),
  commandQueueDepth: t.Optional(t.Number()),
  resumeToken: t.Optional(t.String()),
  resumeTokenExpiresAtMs: t.Optional(t.Number()),
  resumeTokenVersion: t.Optional(t.Number()),
  stateVersion: t.Optional(t.Number()),
  version: t.Optional(t.Number()),
});

const closeSessionResponse = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    sessionId: t.String(),
    status: t.Literal("closed"),
  }),
});

const saveSessionResponse = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    sessionId: t.String(),
    locale: t.String(),
    status: t.Literal("saved"),
  }),
});

const deleteSessionResponse = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    sessionId: t.String(),
    locale: t.String(),
    status: t.Literal("deleted"),
  }),
});

const dialogueResponse = t.Object({
  ok: t.Literal(true),
  data: t.Nullable(
    t.Object({
      npcId: t.String(),
      npcLabel: t.String(),
      lineKey: t.String(),
      line: t.String(),
    }),
  ),
});

const commandStateSchema = t.Union([
  t.Literal("accepted"),
  t.Literal("queued"),
  t.Literal("rejected"),
  t.Literal("dropped"),
  t.Literal("error.retryable"),
  t.Literal("error.nonRetryable"),
  t.Literal("loading"),
]);

const actionStateSchema = t.Union([
  t.Literal("idle"),
  t.Literal("loading"),
  t.Literal("success"),
  t.Literal("empty"),
  t.Literal("error.retryable"),
  t.Literal("error.nonRetryable"),
  t.Literal("unauthorized"),
  t.Literal("actionQueued"),
  t.Literal("resolving"),
  t.Literal("moved"),
  t.Literal("dialogueOpen"),
  t.Literal("blockedByCollision"),
]);

const commandResponse = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    sessionId: t.String(),
    commandId: t.String(),
    sequenceId: t.Number(),
    state: commandStateSchema,
    commandType: t.Union([
      t.Literal("move"),
      t.Literal("interact"),
      t.Literal("confirmDialogue"),
      t.Literal("chat"),
      t.Literal("closeDialogue"),
      t.Literal("retryAction"),
    ]),
    errorCode: t.Optional(t.String()),
    errorReason: t.Optional(t.String()),
    commandState: t.Optional(actionStateSchema),
    queueDepth: t.Optional(t.Number()),
    accepted: t.Boolean(),
  }),
});

type SupportedLocale = "en-US" | "zh-CN";
const wsCloseCode = {
  sessionNotFound: 4404,
  sessionExpired: 4408,
} as const;

const buildCloseFrame = (
  reason: GameSseCloseReason,
  sessionId: string,
  message: string,
): GameSseCloseFrame => ({
  reason,
  message,
  sessionId,
});

const asLifecycleState = async (
  sessionId: string,
  ownerSessionId: string,
): Promise<GameSessionState | null> => gameLoop.getSessionState(sessionId, ownerSessionId);

const requireGameSession = async (sessionId: string): Promise<GameSession> => {
  const sessionResult = await gameLoop.getStoredSession(sessionId);
  if (sessionResult.ok) {
    return sessionResult.payload;
  }

  if (sessionResult.error === "SESSION_EXPIRED") {
    throw new ApplicationError(
      "SESSION_EXPIRED",
      "The requested session has expired.",
      httpStatus.gone,
      false,
    );
  }

  throw new ApplicationError("SESSION_NOT_FOUND", "Session not found.", httpStatus.notFound, false);
};

/**
 * Validates that the requested session belongs to the current auth-session owner.
 */
const requireOwnedGameSession = async (
  sessionId: string,
  ownerSessionId: string,
): Promise<GameSession> => {
  const session = await requireGameSession(sessionId);
  if (session.ownerSessionId !== ownerSessionId) {
    throw new ApplicationError(
      "UNAUTHORIZED",
      "Session ownership mismatch.",
      httpStatus.unauthorized,
      false,
    );
  }

  return session;
};

/**
 * Hardens HUD streaming with deterministic close reasons and bounded stop conditions.
 */
const createHudStream = async function* ({
  session,
  sse,
  signal,
}: {
  session: Pick<GameSession, "id" | "locale" | "scene" | "ownerSessionId">;
  sse: SseUtils;
  signal: AbortSignal;
}): AsyncGenerator<string> {
  const sessionId = session.id;
  const catalog =
    gameTextByLocale[session.locale as keyof typeof gameTextByLocale] ?? gameTextByLocale["en-US"];
  const messages = getMessages(session.locale as "en-US" | "zh-CN");
  const retryMs = defaultGameConfig.hudRetryDelayMs;
  let sequence = 0;
  const renderSceneBadge = (sceneTitle: string): string =>
    `<div id="hud-scene" sse-swap="scene-badge" hx-swap="outerHTML" aria-live="polite" role="status" class="pointer-events-auto rounded-full border border-base-content/10 bg-base-100/80 px-6 py-2 text-lg font-bold shadow backdrop-blur">${escapeHtml(
      sceneTitle,
    )}</div>`;
  const renderSceneHeading = (sceneTitle: string): string =>
    `<h1 id="game-scene-title-heading" sse-swap="scene-title-heading" hx-swap="outerHTML" class="text-3xl font-semibold">${escapeHtml(
      sceneTitle,
    )}</h1>`;
  const renderSceneValue = (sceneTitle: string): string =>
    `<span id="game-scene-title-value" sse-swap="scene-title-value" hx-swap="outerHTML" class="font-medium">${escapeHtml(
      sceneTitle,
    )}</span>`;
  const renderObjectiveSummary = (title: string): string =>
    `<p id="game-objective-summary" sse-swap="objective-summary" hx-swap="outerHTML" class="text-sm text-base-content/70">${escapeHtml(
      title,
    )}</p>`;
  const renderObjectiveCard = (title: string): string =>
    `<p id="game-objective-card" sse-swap="objective-card" hx-swap="outerHTML" class="text-sm text-base-content/75">${escapeHtml(
      title,
    )}</p>`;
  const renderSceneMode = (sceneMode: GameHudState["sceneMode"]): string =>
    `<span id="game-scene-mode-value" sse-swap="scene-mode" hx-swap="outerHTML" class="font-medium">${escapeHtml(
      sceneMode === "3d" ? messages.game.sceneMode3d : messages.game.sceneMode2d,
    )}</span>`;

  const initialObjectiveTitle = messages.game.objectiveDescription;

  yield sse.event("scene-badge", renderSceneBadge(session.scene.sceneTitle), {
    id: `${sessionId}-scene-badge`,
    retry: retryMs,
  });
  yield sse.event("scene-title-heading", renderSceneHeading(session.scene.sceneTitle), {
    id: `${sessionId}-scene-heading`,
    retry: retryMs,
  });
  yield sse.event("scene-title-value", renderSceneValue(session.scene.sceneTitle), {
    id: `${sessionId}-scene-value`,
    retry: retryMs,
  });
  yield sse.event("objective-summary", renderObjectiveSummary(initialObjectiveTitle), {
    id: `${sessionId}-objective-summary`,
    retry: retryMs,
  });
  yield sse.event("objective-card", renderObjectiveCard(initialObjectiveTitle), {
    id: `${sessionId}-objective-card`,
    retry: retryMs,
  });
  yield sse.event("scene-mode", renderSceneMode(session.scene.sceneMode), {
    id: `${sessionId}-scene-mode`,
    retry: retryMs,
  });

  let lastXp = -1;
  let lastDialogueKey = "";
  let lastSceneTitle = "";
  let lastObjectiveTitle = "";
  let lastSceneMode: GameHudState["sceneMode"] | "__missing" = "__missing";

  while (!signal.aborted) {
    const hudState = await gameLoop.getHudState(sessionId, session.ownerSessionId);
    if (!hudState) {
      const frame = buildCloseFrame(
        "session-missing",
        sessionId,
        messages.game.sessionDeletedStream,
      );
      yield sse.event("close", JSON.stringify(frame), {
        id: `${sessionId}-close`,
        retry: retryMs,
      });
      return;
    }

    const sceneTitle = hudState.sceneTitle;
    if (sceneTitle !== lastSceneTitle) {
      yield sse.event("scene-badge", renderSceneBadge(sceneTitle), {
        id: `${sessionId}-scene-badge-${sequence}`,
        retry: retryMs,
      });
      yield sse.event("scene-title-heading", renderSceneHeading(sceneTitle), {
        id: `${sessionId}-scene-heading-${sequence}`,
        retry: retryMs,
      });
      yield sse.event("scene-title-value", renderSceneValue(sceneTitle), {
        id: `${sessionId}-scene-value-${sequence}`,
        retry: retryMs,
      });
      lastSceneTitle = sceneTitle;
      sequence += 1;
    }

    const objectiveTitle = hudState.activeQuestTitle ?? messages.game.objectiveDescription;
    if (objectiveTitle !== lastObjectiveTitle) {
      yield sse.event("objective-summary", renderObjectiveSummary(objectiveTitle), {
        id: `${sessionId}-objective-summary-${sequence}`,
        retry: retryMs,
      });
      yield sse.event("objective-card", renderObjectiveCard(objectiveTitle), {
        id: `${sessionId}-objective-card-${sequence}`,
        retry: retryMs,
      });
      lastObjectiveTitle = objectiveTitle;
      sequence += 1;
    }

    if (hudState.sceneMode !== lastSceneMode) {
      yield sse.event("scene-mode", renderSceneMode(hudState.sceneMode), {
        id: `${sessionId}-scene-mode-${sequence}`,
        retry: retryMs,
      });
      lastSceneMode = hudState.sceneMode;
      sequence += 1;
    }

    const xp = hudState.xp;
    const level = hudState.level;

    if (xp !== lastXp) {
      const levelName =
        catalog.progression.levelNames[Math.max(0, level - 1)] ?? messages.game.unknownLevel;
      yield sse.event(
        "xp",
        `<div id="hud-xp" class="badge badge-primary badge-lg shadow-sm">XP: ${xp} / Lv${level} ${escapeHtml(levelName)}</div>`,
        { id: `${sessionId}-xp-${xp}`, retry: retryMs },
      );
      lastXp = xp;
    }

    const dialogue = hudState.dialogue;
    const dialogueKey = dialogue ? `${dialogue.npcId}:${dialogue.lineKey}:${dialogue.line}` : "";

    if (dialogueKey !== lastDialogueKey) {
      const html = dialogue
        ? `<div id="hud-dialogue" class="card bg-base-200/95 shadow-xl p-4 text-sm backdrop-blur">
             <p class="font-semibold text-primary mb-1">${escapeHtml(dialogue.npcLabel)}</p>
             <p>${escapeHtml(dialogue.line)}</p>
           </div>`
        : `<div id="hud-dialogue" class="hidden"></div>`;

      yield sse.event("dialogue", html, {
        id: `${sessionId}-dialogue-${sequence}`,
        retry: retryMs,
      });
      lastDialogueKey = dialogueKey;
      sequence += 1;
    }

    sequence += 1;
    yield sse.ping();
    await Bun.sleep(defaultGameConfig.hudPollIntervalMs);
  }
};

const createHudStreamHandler = async function* ({
  params,
  sse,
  cookie,
  request,
}: {
  params: { id: string };
  sse: SseUtils;
  cookie: Parameters<typeof resolveAuthSession>[0];
  request: Request;
}): AsyncGenerator<string> {
  const ownerSessionId = resolveAuthSession(cookie).sessionId;
  const session = await requireOwnedGameSession(params.id, ownerSessionId);
  yield* createHudStream({ session, sse, signal: request.signal });
};

const wsConnKeys = new WeakMap<object, string>();
const wsCleanups = new Map<string, () => void>();
const wsConnSessions = new Map<string, string>();
const wsConnSockets = new Map<
  string,
  { close(code?: number): void; unsubscribe(topic: string): void }
>();
const wsConnectionKeysBySession = new Map<string, Set<string>>();
const wsLocales = new Map<string, SupportedLocale>();

const readObjectProperty = (value: unknown, key: string): unknown => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined;
};

const normalizeResumeToken = (rawValue: unknown): string | undefined => {
  if (typeof rawValue === "string") {
    const token = rawValue.trim();
    return token.length > 0 ? token : undefined;
  }
  if (Array.isArray(rawValue)) {
    const token = rawValue.find((value) => typeof value === "string" && value.length > 0) as
      | string
      | undefined;
    return token;
  }

  return undefined;
};

const readResumeTokenFromWsQuery = (query: unknown): string | undefined => {
  return normalizeResumeToken(readObjectProperty(query, "resumeToken"));
};

const resolveWsOwnerSessionId = (rawCookie: unknown): string | null => {
  if (!rawCookie || typeof rawCookie !== "object") {
    return null;
  }

  const auth = resolveAuthSession(rawCookie as Parameters<typeof resolveAuthSession>[0]);
  return auth.sessionId;
};

const registerWsConnection = (
  sessionId: string,
  connKey: string,
  locale: SupportedLocale,
  cleanup: () => void,
  socket: { close(code?: number): void; unsubscribe(topic: string): void },
): void => {
  wsCleanups.set(connKey, cleanup);
  wsLocales.set(connKey, locale);
  wsConnSessions.set(connKey, sessionId);
  wsConnSockets.set(connKey, socket);

  const sessionKeys = wsConnectionKeysBySession.get(sessionId) ?? new Set<string>();
  sessionKeys.add(connKey);
  wsConnectionKeysBySession.set(sessionId, sessionKeys);
};

const cleanupWsConnection = (connKey: string): void => {
  wsCleanups.get(connKey)?.();
  wsCleanups.delete(connKey);
  wsLocales.delete(connKey);
  wsConnSockets.delete(connKey);

  const sessionId = wsConnSessions.get(connKey);
  wsConnSessions.delete(connKey);
  if (!sessionId) {
    return;
  }

  const sessionKeys = wsConnectionKeysBySession.get(sessionId);
  sessionKeys?.delete(connKey);
  if (sessionKeys && sessionKeys.size === 0) {
    wsConnectionKeysBySession.delete(sessionId);
  }
};

const closeWsConnectionsForSession = (
  sessionId: string,
  closeCode: number = wsCloseCode.sessionNotFound,
): void => {
  const sessionKeys = [...(wsConnectionKeysBySession.get(sessionId) ?? new Set<string>())];
  for (const connKey of sessionKeys) {
    const socket = wsConnSockets.get(connKey);
    socket?.unsubscribe(`game:${sessionId}`);
    cleanupWsConnection(connKey);
    socket?.close(closeCode);
  }
};

const cleanupAllWsConnections = (): void => {
  for (const sessionId of [...wsConnectionKeysBySession.keys()]) {
    closeWsConnectionsForSession(sessionId, wsCloseCode.sessionExpired);
  }
};

export const gamePlugin = new Elysia({ prefix: "/api/game" })
  .use(ssePlugin)
  .guard(authSessionGuard, (app) =>
    app
      .post(
        route.create,
        async ({ body, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const requestedLocale =
            typeof body?.locale === "string" && body.locale.length > 0 ? body.locale : undefined;
          const sceneId =
            typeof body?.sceneId === "string" && body.sceneId.length > 0 ? body.sceneId : undefined;
          const projectId =
            typeof body?.projectId === "string" && body.projectId.trim().length > 0
              ? body.projectId.trim()
              : undefined;

          const snapshot = await gameLoop.createSession(
            normalizeLocale(requestedLocale),
            sceneId,
            projectId,
            ownerSessionId,
          );
          const state = await asLifecycleState(snapshot.sessionId, ownerSessionId);
          return {
            ok: true,
            data: state ?? snapshot,
          };
        },
        {
          body: createSessionBodySchema,
          response: {
            [httpStatus.ok]: t.Object({ ok: t.Literal(true), data: gameSessionStateSchema }),
            [httpStatus.badRequest]: errorResponse,
            [httpStatus.unprocessableEntity]: errorResponse,
          },
        },
      )
      .get(
        route.state,
        async ({ params, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          const state = await asLifecycleState(session.id, ownerSessionId);
          if (!state) {
            throw new ApplicationError(
              "SESSION_NOT_FOUND",
              "Session not found.",
              httpStatus.notFound,
              false,
            );
          }
          return { ok: true, data: state };
        },
        {
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: t.Object({ ok: t.Literal(true), data: gameSessionStateSchema }),
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
          },
        },
      )
      .post(
        route.restore,
        async ({ params, body, set, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const sessionState = await gameLoop.restoreSession(
            params.id,
            body.resumeToken,
            ownerSessionId,
          );
          if (!sessionState) {
            set.status = httpStatus.unauthorized;
            throw new ApplicationError(
              "UNAUTHORIZED",
              "Session not found or resume token invalid.",
              httpStatus.unauthorized,
              false,
            );
          }

          return { ok: true, data: sessionState };
        },
        {
          params: t.Object({ id: t.String() }),
          body: restoreSessionBodySchema,
          response: {
            [httpStatus.ok]: t.Object({ ok: t.Literal(true), data: gameSessionStateSchema }),
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
          },
        },
      )
      .post(
        route.close,
        async ({ params, set, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          const closed = await gameLoop.closeSession(session.id);
          if (!closed) {
            set.status = httpStatus.notFound;
            throw new ApplicationError(
              "SESSION_NOT_FOUND",
              "Session not found.",
              httpStatus.notFound,
              false,
            );
          }

          closeWsConnectionsForSession(session.id);

          return {
            ok: true,
            data: {
              sessionId: params.id,
              status: "closed",
            },
          };
        },
        {
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: closeSessionResponse,
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
          },
        },
      )
      .post(
        route.save,
        async ({ params, set, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          const saveCooldownRemainingMs = gameLoop.getSaveCooldownRemainingMs(params.id);
          if (saveCooldownRemainingMs > 0) {
            set.status = httpStatus.tooManyRequests;
            throw new ApplicationError(
              "CONFLICT",
              `save-cooldown:${saveCooldownRemainingMs}`,
              httpStatus.tooManyRequests,
              true,
            );
          }

          await gameLoop.saveSessionNow(session.id);
          gameLoop.markManualSave(params.id);
          return {
            ok: true,
            data: {
              sessionId: session.id,
              locale: session.locale,
              status: "saved",
            },
          };
        },
        {
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: saveSessionResponse,
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.tooManyRequests]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
          },
        },
      )
      .delete(
        "/session/:id",
        async ({ params, set, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          const closed = await gameLoop.closeSession(session.id);
          if (!closed) {
            set.status = httpStatus.notFound;
            throw new ApplicationError(
              "SESSION_NOT_FOUND",
              "Session not found.",
              httpStatus.notFound,
              false,
            );
          }
          closeWsConnectionsForSession(session.id);
          return {
            ok: true,
            data: {
              sessionId: session.id,
              locale: session.locale,
              status: "deleted",
            },
          };
        },
        {
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: deleteSessionResponse,
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
          },
        },
      )
      .post(
        route.command,
        async ({ body, params, set, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          const result = gameLoop.processCommand(session.id, body, session.locale);
          if (result.state === "rejected") {
            set.status = httpStatus.unprocessableEntity;
            throw new ApplicationError(
              result.errorCode ?? "INVALID_COMMAND",
              result.errorCode === "INVALID_COMMAND"
                ? "Invalid command payload."
                : "Command rejected.",
              httpStatus.unprocessableEntity,
              false,
            );
          }

          if (result.state === "dropped" && result.errorCode === "CONFLICT") {
            set.status = httpStatus.conflict;
            throw new ApplicationError(
              result.errorCode,
              result.errorReason ?? "Command queue is full.",
              httpStatus.conflict,
              true,
            );
          }

          if (result.state === "dropped") {
            set.status = httpStatus.serviceUnavailable;
            throw new ApplicationError(
              result.errorCode ?? "INVALID_COMMAND",
              result.errorReason ?? "Command was dropped.",
              httpStatus.serviceUnavailable,
              true,
            );
          }

          if (!result.commandType) {
            set.status = httpStatus.unprocessableEntity;
            throw new ApplicationError(
              "INVALID_COMMAND",
              "Command type was not resolved for accepted command.",
              httpStatus.unprocessableEntity,
              false,
            );
          }

          return {
            ok: true,
            data: {
              sessionId: result.sessionId,
              commandId: result.commandId,
              sequenceId: result.sequenceId,
              state: result.state,
              commandType: result.commandType,
              errorCode: result.errorCode,
              errorReason: result.errorReason,
              commandState: result.commandState,
              queueDepth: gameLoop.getCommandQueueDepth(session.id),
              accepted: result.state === "queued" || result.state === "accepted",
            },
          };
        },
        {
          body: commandBodySchema,
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: commandResponse,
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
            [httpStatus.unprocessableEntity]: errorResponse,
            [httpStatus.conflict]: errorResponse,
            [httpStatus.serviceUnavailable]: errorResponse,
          },
        },
      )
      .get(
        route.dialogue,
        async ({ params, cookie }) => {
          const ownerSessionId = resolveAuthSession(cookie).sessionId;
          const session = await requireOwnedGameSession(params.id, ownerSessionId);
          return { ok: true, data: session.scene.dialogue };
        },
        {
          params: t.Object({ id: t.String() }),
          response: {
            [httpStatus.ok]: dialogueResponse,
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
            [httpStatus.gone]: errorResponse,
          },
        },
      )
      .get(route.hud, createHudStreamHandler, {
        params: t.Object({ id: t.String() }),
        response: {
          [httpStatus.ok]: t.String(),
          [httpStatus.unauthorized]: errorResponse,
        },
      })
      .ws("/session/:id/ws", {
        body: commandBodySchema,

        async open(ws) {
          const sessionId = ws.data.params.id;
          ws.subscribe(`game:${sessionId}`);

          const resumeToken = readResumeTokenFromWsQuery(readObjectProperty(ws.data, "query"));
          const ownerSessionId = resolveWsOwnerSessionId(readObjectProperty(ws.data, "cookie"));
          const sessionResult = await gameLoop.getStoredSession(sessionId);
          if (!sessionResult.ok) {
            ws.close(
              sessionResult.error === "SESSION_EXPIRED"
                ? wsCloseCode.sessionExpired
                : wsCloseCode.sessionNotFound,
            );
            return;
          }

          if (typeof resumeToken !== "string" || typeof ownerSessionId !== "string") {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }
          if (sessionResult.payload.ownerSessionId !== ownerSessionId) {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }

          const joinedSession = await gameLoop.restoreSession(
            sessionId,
            resumeToken,
            ownerSessionId,
          );
          if (!joinedSession) {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }

          const connKey = `${sessionId}:${crypto.randomUUID()}`;
          wsConnKeys.set(ws, connKey);
          const locale = sessionResult.payload.locale as SupportedLocale;

          const cleanup = gameLoop.startTick(sessionId, () => {
            void asLifecycleState(sessionId, ownerSessionId).then((state) => {
              if (!state) {
                ws.unsubscribe(`game:${sessionId}`);
                cleanupWsConnection(connKey);
                ws.close(wsCloseCode.sessionNotFound);
                return;
              }

              ws.send(
                JSON.stringify({
                  state: state.state,
                  commandQueueDepth: state.commandQueueDepth,
                  resumeToken: state.resumeToken,
                  resumeTokenExpiresAtMs: state.resumeTokenExpiresAtMs,
                }),
              );
            });
          });
          registerWsConnection(sessionId, connKey, locale, cleanup, ws);
        },

        message(ws, command) {
          const sessionId = ws.data.params.id;
          const connKey = wsConnKeys.get(ws);
          const locale = (connKey ? wsLocales.get(connKey) : undefined) ?? "en-US";
          const normalizedCommand =
            typeof command === "string" ? safeJsonParse(command, null) : command;
          const result = gameLoop.processCommand(sessionId, normalizedCommand, locale);
          if (result.state !== "queued") {
            _logger.info("game.command.rejected", {
              sessionId,
              state: result.state,
              commandType: result.commandType,
            });
          }
        },

        close(ws) {
          const sessionId = ws.data.params.id;
          ws.unsubscribe(`game:${sessionId}`);

          const connKey = wsConnKeys.get(ws);
          if (connKey) {
            cleanupWsConnection(connKey);
            wsConnKeys.delete(ws);
          }
        },
      }),
  )
  .onStop(() => {
    cleanupAllWsConnections();
  });

export type App = typeof gamePlugin;

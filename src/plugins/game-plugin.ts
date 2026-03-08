import { Elysia, t } from "elysia";
import { normalizeLocale } from "../config/environment.ts";
import { gameTextByLocale } from "../domain/game/data/game-text.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import { ApplicationError, errorEnvelope } from "../lib/error-envelope.ts";
import { createLogger } from "../lib/logger.ts";
import { authSessionGuard } from "../plugins/auth-session.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes, withQueryParameters } from "../shared/constants/routes.ts";
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
import { gameRequestContextPlugin, resolveGameWebSocketContext } from "./game-request-context.ts";
import { type SseUtils, ssePlugin } from "./sse-plugin.ts";

const _logger = createLogger("game.plugin");
const wantsHtml = (acceptHeader: string | null | undefined): boolean =>
  (acceptHeader ?? "").includes("text/html");

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
  invite: endpoint(appRoutes.gameApiSessionInvite),
  join: endpoint(appRoutes.gameApiSessionJoin),
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
      t.Object({
        type: t.Literal("combatAction"),
        action: t.Object({
          actorId: t.String(),
          type: t.Union([
            t.Literal("attack"),
            t.Literal("defend"),
            t.Literal("skill"),
            t.Literal("item"),
            t.Literal("flee"),
          ]),
          targetIds: t.Array(t.String()),
          skillId: t.Optional(t.String()),
          itemId: t.Optional(t.String()),
        }),
      }),
      t.Object({
        type: t.Literal("openInventory"),
      }),
      t.Object({
        type: t.Literal("closeInventory"),
      }),
      t.Object({
        type: t.Literal("useItem"),
        slotIndex: t.Number(),
      }),
      t.Object({
        type: t.Literal("equipItem"),
        slotIndex: t.Number(),
      }),
      t.Object({
        type: t.Literal("unequipItem"),
        slot: t.Union([t.Literal("weapon"), t.Literal("armor"), t.Literal("accessory")]),
      }),
      t.Object({
        type: t.Literal("advanceCutscene"),
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
      t.Literal("combatAction"),
      t.Literal("openInventory"),
      t.Literal("closeInventory"),
      t.Literal("useItem"),
      t.Literal("equipItem"),
      t.Literal("unequipItem"),
      t.Literal("advanceCutscene"),
    ]),
    direction: t.Optional(
      t.Union([t.Literal("up"), t.Literal("down"), t.Literal("left"), t.Literal("right")]),
    ),
    durationMs: t.Optional(t.Number()),
    npcId: t.Optional(t.String()),
    message: t.Optional(t.String()),
    action: t.Optional(
      t.Object({
        actorId: t.String(),
        type: t.Union([
          t.Literal("attack"),
          t.Literal("defend"),
          t.Literal("skill"),
          t.Literal("item"),
          t.Literal("flee"),
        ]),
        targetIds: t.Array(t.String()),
        skillId: t.Optional(t.String()),
        itemId: t.Optional(t.String()),
      }),
    ),
    slotIndex: t.Optional(t.Number()),
    slot: t.Optional(t.Union([t.Literal("weapon"), t.Literal("armor"), t.Literal("accessory")])),
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
const inviteSessionBodySchema = t.Object({
  role: t.Union([t.Literal("controller"), t.Literal("spectator")]),
  locale: t.Optional(t.String()),
});
const joinSessionBodySchema = t.Object({
  inviteToken: t.String(),
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
const gameParticipantSchema = t.Object({
  sessionId: t.String(),
  role: t.Union([t.Literal("owner"), t.Literal("controller"), t.Literal("spectator")]),
  joinedAtMs: t.Number(),
  updatedAtMs: t.Number(),
});
const gameSessionStateSchema = t.Object({
  sessionId: t.String(),
  participantSessionId: t.Optional(t.String()),
  locale: t.String(),
  timestamp: t.String(),
  state: t.Optional(t.Object({}, { additionalProperties: true })),
  commandQueueDepth: t.Optional(t.Number()),
  resumeToken: t.Optional(t.String()),
  resumeTokenExpiresAtMs: t.Optional(t.Number()),
  resumeTokenVersion: t.Optional(t.Number()),
  stateVersion: t.Optional(t.Number()),
  version: t.Optional(t.Number()),
  participantRole: t.Optional(
    t.Union([t.Literal("owner"), t.Literal("controller"), t.Literal("spectator")]),
  ),
  participants: t.Optional(t.Array(gameParticipantSchema)),
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

const inviteSessionResponse = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    sessionId: t.String(),
    role: t.Union([t.Literal("controller"), t.Literal("spectator")]),
    inviteToken: t.String(),
    joinPath: t.String(),
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
  t.Literal("inCombat"),
  t.Literal("inCutscene"),
  t.Literal("inventoryOpen"),
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
      t.Literal("combatAction"),
      t.Literal("openInventory"),
      t.Literal("closeInventory"),
      t.Literal("useItem"),
      t.Literal("equipItem"),
      t.Literal("unequipItem"),
      t.Literal("skipCutscene"),
      t.Literal("advanceCutscene"),
    ]),
    errorCode: t.Optional(t.String()),
    errorReason: t.Optional(t.String()),
    commandState: t.Optional(actionStateSchema),
    queueDepth: t.Optional(t.Number()),
    accepted: t.Boolean(),
  }),
});

type SupportedLocale = "en-US" | "zh-CN";
const getGameMessages = (locale: string) => getMessages(normalizeLocale(locale));
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

const toGameSessionStatePayload = (state: GameSessionState) => ({
  ...state,
  participants: state.participants.map((participant) => ({ ...participant })),
});

const getCommandErrorMessage = (
  locale: string,
  errorCode: string | undefined,
  errorReason: string | undefined,
): string => {
  const messages = getGameMessages(locale);
  if (errorCode === "INVALID_COMMAND") {
    return messages.game.invalidCommand;
  }

  switch (errorReason) {
    case "command-queue-full":
      return messages.game.commandQueueFull;
    case "command-expired":
      return messages.game.commandExpired;
    case "chat-rate-limit":
      return messages.game.chatRateLimited;
    default:
      return messages.game.commandDropped;
  }
};

const requireGameSession = async (sessionId: string, locale: string): Promise<GameSession> => {
  const messages = getGameMessages(locale);
  const sessionResult = await gameLoop.getStoredSession(sessionId);
  if (sessionResult.ok) {
    return sessionResult.payload;
  }

  if (sessionResult.error === "SESSION_EXPIRED") {
    throw new ApplicationError(
      "SESSION_EXPIRED",
      messages.game.sessionExpiredRequest,
      httpStatus.gone,
      false,
    );
  }

  throw new ApplicationError(
    "SESSION_NOT_FOUND",
    messages.game.sessionNotFoundRequest,
    httpStatus.notFound,
    false,
  );
};

/**
 * Validates that the requested session belongs to the current auth-session owner.
 */
const requireOwnedGameSession = async (
  sessionId: string,
  ownerSessionId: string,
  locale: string,
): Promise<GameSession> => {
  const messages = getGameMessages(locale);
  const session = await requireGameSession(sessionId, locale);
  if (session.ownerSessionId !== ownerSessionId) {
    throw new ApplicationError(
      "UNAUTHORIZED",
      messages.game.sessionOwnershipMismatch,
      httpStatus.unauthorized,
      false,
    );
  }

  return session;
};

/**
 * Validates that the current auth-session is allowed to observe the requested session.
 */
const requireAccessibleGameSession = async (
  sessionId: string,
  participantSessionId: string,
  locale: string,
): Promise<GameSessionState> => {
  const messages = getGameMessages(locale);
  const state = await gameLoop.getSessionState(sessionId, participantSessionId);
  if (!state) {
    throw new ApplicationError(
      "UNAUTHORIZED",
      messages.game.sessionAccessDenied,
      httpStatus.unauthorized,
      false,
    );
  }

  return state;
};

/**
 * Validates that the current auth-session can issue gameplay commands.
 */
const requireControllableGameSession = async (
  sessionId: string,
  participantSessionId: string,
  locale: string,
): Promise<GameSessionState> => {
  const messages = getGameMessages(locale);
  const state = await requireAccessibleGameSession(sessionId, participantSessionId, locale);
  if (state.participantRole === "spectator") {
    throw new ApplicationError(
      "UNAUTHORIZED",
      messages.game.spectatorControlDenied,
      httpStatus.unauthorized,
      false,
    );
  }

  return state;
};

const renderInviteResult = (
  sessionId: string,
  title: string,
  linkLabel: string,
  joinPath: string,
): string => `<div id="game-multiplayer-share-result" class="rounded-box bg-base-200/80 p-3 text-sm">
  <div class="font-medium">${escapeHtml(title)}</div>
  <div class="text-xs text-base-content/60">${escapeHtml(linkLabel)}</div>
  <div class="break-all font-mono text-xs text-base-content/70">${escapeHtml(joinPath)}</div>
  <div class="text-xs text-base-content/60">${escapeHtml(sessionId)}</div>
</div>`;

/**
 * Hardens HUD streaming with deterministic close reasons and bounded stop conditions.
 */
const createHudStream = async function* ({
  session,
  participantSessionId,
  sse,
  signal,
}: {
  session: Pick<GameSessionState, "sessionId" | "locale" | "participants" | "state">;
  participantSessionId: string;
  sse: SseUtils;
  signal: AbortSignal;
}): AsyncGenerator<string> {
  const sessionId = session.sessionId;
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
  const renderParticipants = (participants: GameHudState["participants"]): string =>
    `<div id="game-participants-list" sse-swap="participants" hx-swap="outerHTML" class="space-y-2">${participants
      .map(
        (
          participant,
        ) => `<div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2 text-sm">
          <span class="font-mono text-xs">${escapeHtml(participant.sessionId)}</span>
          <span class="badge badge-outline">${escapeHtml(
            participant.role === "owner"
              ? messages.game.participantRoleOwner
              : participant.role === "controller"
                ? messages.game.participantRoleController
                : messages.game.participantRoleSpectator,
          )}</span>
        </div>`,
      )
      .join("")}</div>`;

  const initialObjectiveTitle = messages.game.objectiveDescription;

  yield sse.event("scene-badge", renderSceneBadge(session.state.sceneTitle), {
    id: `${sessionId}-scene-badge`,
    retry: retryMs,
  });
  yield sse.event("scene-title-heading", renderSceneHeading(session.state.sceneTitle), {
    id: `${sessionId}-scene-heading`,
    retry: retryMs,
  });
  yield sse.event("scene-title-value", renderSceneValue(session.state.sceneTitle), {
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
  yield sse.event("scene-mode", renderSceneMode(session.state.sceneMode), {
    id: `${sessionId}-scene-mode`,
    retry: retryMs,
  });
  yield sse.event("participants", renderParticipants(session.participants), {
    id: `${sessionId}-participants`,
    retry: retryMs,
  });

  let lastXp = -1;
  let lastDialogueKey = "";
  let lastSceneTitle = "";
  let lastObjectiveTitle = "";
  let lastSceneMode: GameHudState["sceneMode"] | "__missing" = "__missing";
  let lastParticipantsSignature = "";
  let lastCombatSignature = "";
  let lastInventorySignature = "";
  let lastCutsceneSignature = "";

  while (!signal.aborted) {
    const hudState = await gameLoop.getHudState(sessionId, participantSessionId);
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

    const participantsSignature = JSON.stringify(hudState.participants);
    if (participantsSignature !== lastParticipantsSignature) {
      yield sse.event("participants", renderParticipants(hudState.participants), {
        id: `${sessionId}-participants-${sequence}`,
        retry: retryMs,
      });
      lastParticipantsSignature = participantsSignature;
      sequence += 1;
    }

    const xp = hudState.xp;
    const level = hudState.level;

    if (xp !== lastXp) {
      const levelName =
        catalog.progression.levelNames[Math.max(0, level - 1)] ?? messages.game.unknownLevel;
      yield sse.event(
        "xp",
        `<div id="hud-xp" class="badge badge-primary badge-lg shadow-sm">${escapeHtml(messages.game.xpLabel)}: ${xp} / ${escapeHtml(messages.game.levelLabel)}${level} ${escapeHtml(levelName)}</div>`,
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

    const combat = hudState.combat;
    const combatSignature = combat ? JSON.stringify(combat) : "";

    if (combatSignature !== lastCombatSignature) {
      if (combat) {
        const playerRows = combat.combatants
          .filter((c) => c.isPlayer)
          .map(
            (c) =>
              `<li class="flex items-center justify-between bg-base-100 p-2 rounded-box border border-base-200">
             <span class="font-bold text-primary truncate max-w-[120px]">${escapeHtml(c.label)}</span>
             <div class="flex items-center gap-2">
               <span class="text-xs font-mono w-16 text-right">${c.stats.hp}/${c.stats.maxHp} HP</span>
               <progress class="progress progress-success w-24 border border-base-content/20" value="${c.stats.hp}" max="${c.stats.maxHp}"></progress>
             </div>
           </li>`,
          )
          .join("");

        const enemyRows = combat.combatants
          .filter((c) => !c.isPlayer)
          .map(
            (c) =>
              `<li class="flex items-center justify-between bg-base-100 p-2 rounded-box border border-base-200">
             <span class="font-bold text-error truncate max-w-[120px]">${escapeHtml(c.label)}</span>
             <div class="flex items-center gap-2">
               <span class="text-xs font-mono w-16 text-right">${c.stats.hp}/${c.stats.maxHp} HP</span>
               <progress class="progress progress-error w-24 border border-base-content/20" value="${c.stats.hp}" max="${c.stats.maxHp}"></progress>
             </div>
           </li>`,
          )
          .join("");

        const logs =
          combat.log && combat.log.length > 0
            ? combat.log
                .slice(-3)
                .map(
                  (l) =>
                    `<div><span class="text-base-content/50">></span> ${escapeHtml(l.logEntry)}</div>`,
                )
                .join("")
            : '<div class="text-base-content/50 italic">Combat initiated...</div>';

        const html = `
          <div id="hud-combat" class="card bg-base-300/95 backdrop-blur shadow-2xl p-6 w-full max-w-4xl opacity-100 pointer-events-auto transition-all duration-300 scale-100 border border-base-content/10">
            
            <div class="flex justify-between items-center mb-6 border-b border-base-content/10 pb-4">
              <h3 class="text-2xl font-black text-base-content uppercase tracking-widest flex items-center gap-2">
                <span class="text-error">⚔</span> Combat Engagement
              </h3>
              <div class="flex gap-2">
                <span class="badge badge-error badge-outline font-mono">PHASE: ${escapeHtml(combat.phase.toUpperCase())}</span>
                <span class="badge badge-neutral font-mono shadow-sm">TURN ${combat.turnIndex + 1}</span>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-8 mb-6">
              <div class="space-y-3">
                <h4 class="text-sm font-bold uppercase tracking-wider text-base-content/70">Party</h4>
                <ul class="space-y-2">
                  ${playerRows}
                </ul>
              </div>
              <div class="space-y-3">
                <h4 class="text-sm font-bold uppercase tracking-wider text-base-content/70">Hostiles</h4>
                <ul class="space-y-2">
                  ${enemyRows}
                </ul>
              </div>
            </div>

            <div class="bg-base-100/50 rounded-box p-3 font-mono text-sm h-28 overflow-y-auto border border-base-content/5 shadow-inner flex flex-col justify-end">
              ${logs}
            </div>
            
            <div class="mt-6 flex gap-2 justify-center">
              <p class="text-xs text-base-content/50 font-mono">Use standard 'combatAction' commands via CLI / Game API to proceed.</p>
            </div>
          </div>
        `;
        yield sse.event("combat", html, { id: `${sessionId}-combat-${sequence}`, retry: retryMs });
      } else {
        yield sse.event("combat", `<div id="hud-combat" class="hidden"></div>`, {
          id: `${sessionId}-combat-${sequence}`,
          retry: retryMs,
        });
      }

      lastCombatSignature = combatSignature;
      sequence += 1;
    }

    const inventory = hudState.inventory;
    const inventorySignature = inventory ? JSON.stringify(inventory) : "";

    if (inventorySignature !== lastInventorySignature) {
      if (inventory) {
        const capacityHTML = `
          <div class="flex justify-between text-xs text-base-content/70 mt-1 mb-4 font-mono">
            <span>Capacity</span>
            <span>${inventory.slots.length} / ${inventory.capacity}</span>
          </div>
          <progress class="progress progress-primary w-full h-1" value="${inventory.slots.length}" max="${inventory.capacity}"></progress>
        `;

        const slotsHTML = inventory.slots
          .map(
            (s) => `
          <div class="flex items-center justify-between p-2 rounded bg-base-100 hover:bg-base-200 cursor-pointer border border-base-content/5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-base-300 flex items-center justify-center font-bold text-lg border border-base-content/10 shadow-sm">
                ${s.itemId.substring(0, 1).toUpperCase()}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-sm text-base-content leading-tight">${escapeHtml(s.itemId)}</span>
                <span class="text-xs text-base-content/50">${s.quantity}x</span>
              </div>
            </div>
            <button class="btn btn-xs btn-ghost text-base-content/40 hover:text-primary">Action</button>
          </div>
        `,
          )
          .join("");

        const html = `
          <div id="hud-inventory" class="card bg-base-300/95 backdrop-blur shadow-2xl p-6 w-full max-w-3xl opacity-100 pointer-events-auto transition-all duration-300 scale-100 border border-base-content/10">
            <div class="flex justify-between items-center mb-4 border-b border-base-content/10 pb-4">
              <h3 class="text-2xl font-black text-base-content uppercase tracking-widest flex items-center gap-2">
                <span class="text-primary">🎒</span> Inventory
              </h3>
              <div class="flex gap-2">
                <span class="badge badge-neutral font-mono shadow-sm">ID: ${escapeHtml(hudState.sessionId.substring(0, 8))}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="col-span-1 border-r border-base-content/10 pr-6">
                <h4 class="text-sm font-bold uppercase tracking-wider text-base-content/70 mb-2">Storage</h4>
                ${capacityHTML}
                <div class="divider my-2"></div>
                <div class="text-xs font-mono text-base-content/50">
                  <p>Weight: 0.0kg</p>
                  <p>Gold: 0</p>
                </div>
              </div>
              
              <div class="col-span-2">
                <h4 class="text-sm font-bold uppercase tracking-wider text-base-content/70 mb-4">Items</h4>
                <div class="space-y-2 max-h-64 overflow-y-auto pr-2 rounded-box p-1 custom-scrollbar">
                  ${slotsHTML.length > 0 ? slotsHTML : '<div class="text-center p-8 text-base-content/30 italic">Empty</div>'}
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-base-content/10 flex justify-between items-center">
              <p class="text-xs text-base-content/50 font-mono">Use 'inventoryAction' to manage items.</p>
              <button class="btn btn-sm btn-outline shadow-sm" hx-post="/api/game/command" hx-vals='{"action":"close_inventory"}' hx-swap="none">Close</button>
            </div>
          </div>
        `;
        yield sse.event("inventory", html, {
          id: `${sessionId}-inventory-${sequence}`,
          retry: retryMs,
        });
      } else {
        yield sse.event("inventory", `<div id="hud-inventory" class="hidden"></div>`, {
          id: `${sessionId}-inventory-${sequence}`,
          retry: retryMs,
        });
      }

      lastInventorySignature = inventorySignature;
      sequence += 1;
    }

    const cutscene = hudState.cutscene;
    const cutsceneSignature = cutscene ? JSON.stringify(cutscene) : "";

    if (cutsceneSignature !== lastCutsceneSignature) {
      if (cutscene) {
        const step = hudState.activeCutsceneStep;
        let contentHtml = "";

        if (step?.action === "dialogue") {
          contentHtml = `
            <div class="card bg-base-200/95 shadow-2xl p-6 w-full max-w-2xl backdrop-blur relative border border-base-content/10">
              <p class="font-bold text-primary mb-2 text-lg uppercase tracking-wider">${escapeHtml(step.speakerKey ?? "")}</p>
              <p class="text-lg text-base-content">${escapeHtml(step.dialogueKey ?? "")}</p>
              <div class="absolute bottom-3 right-6 text-xs text-base-content/50 font-mono animate-pulse">Use 'advanceCutscene' (Space/Enter) to continue</div>
            </div>
          `;
        } else if (step?.action === "camera_pan" || step?.action === "wait") {
          contentHtml = `<div class="text-xl font-mono text-base-content/50 uppercase tracking-[0.2em] italic animate-pulse">Cinematic in progress...</div>`;
        }

        const html = `
          <div id="hud-cutscene" class="fixed inset-0 z-50 flex flex-col items-center justify-end pb-[15vh] bg-black/70 backdrop-blur-sm pointer-events-auto transition-all duration-500">
            <div class="absolute top-6 right-6">
              <span class="badge badge-neutral shadow-sm font-mono text-xs tracking-widest px-3 py-2">CINEMATIC</span>
            </div>
            ${contentHtml}
            <div class="absolute top-6 left-6">
               <button class="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content" hx-post="/api/game/command" hx-vals='{"type":"skipCutscene"}' hx-swap="none">Skip [ESC]</button>
            </div>
          </div>
        `;
        yield sse.event("cutscene", html, {
          id: `${sessionId}-cutscene-${sequence}`,
          retry: retryMs,
        });
      } else {
        yield sse.event("cutscene", `<div id="hud-cutscene" class="hidden"></div>`, {
          id: `${sessionId}-cutscene-${sequence}`,
          retry: retryMs,
        });
      }

      lastCutsceneSignature = cutsceneSignature;
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
  request,
  gameParticipantSessionId,
  gameRequestLocale,
}: {
  params: { id: string };
  sse: SseUtils;
  request: Request;
  gameParticipantSessionId: string;
  gameRequestLocale: string;
}): AsyncGenerator<string> {
  const session = await requireAccessibleGameSession(
    params.id,
    gameParticipantSessionId,
    gameRequestLocale,
  );
  yield* createHudStream({
    session,
    participantSessionId: gameParticipantSessionId,
    sse,
    signal: request.signal,
  });
};

const wsConnKeys = new WeakMap<object, string>();
const wsCleanups = new Map<string, () => void>();
const wsConnSessions = new Map<string, string>();
const wsParticipantIds = new Map<string, string>();
const wsParticipantRoles = new Map<string, "owner" | "controller" | "spectator">();
const wsConnSockets = new Map<
  string,
  { close(code?: number): void; unsubscribe(topic: string): void }
>();
const wsConnectionKeysBySession = new Map<string, Set<string>>();
const wsLocales = new Map<string, SupportedLocale>();

const registerWsConnection = (
  sessionId: string,
  connKey: string,
  locale: SupportedLocale,
  participantSessionId: string,
  participantRole: "owner" | "controller" | "spectator",
  cleanup: () => void,
  socket: { close(code?: number): void; unsubscribe(topic: string): void },
): void => {
  wsCleanups.set(connKey, cleanup);
  wsLocales.set(connKey, locale);
  wsConnSessions.set(connKey, sessionId);
  wsParticipantIds.set(connKey, participantSessionId);
  wsParticipantRoles.set(connKey, participantRole);
  wsConnSockets.set(connKey, socket);

  const sessionKeys = wsConnectionKeysBySession.get(sessionId) ?? new Set<string>();
  sessionKeys.add(connKey);
  wsConnectionKeysBySession.set(sessionId, sessionKeys);
};

const cleanupWsConnection = (connKey: string): void => {
  wsCleanups.get(connKey)?.();
  wsCleanups.delete(connKey);
  wsLocales.delete(connKey);
  wsParticipantIds.delete(connKey);
  wsParticipantRoles.delete(connKey);
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
  .use(gameRequestContextPlugin)
  .guard(authSessionGuard, (app) =>
    app
      .post(
        route.create,
        async ({ body, gameParticipantSessionId, gameRequestLocale }) => {
          const ownerSessionId = gameParticipantSessionId;
          const requestedLocale =
            typeof body?.locale === "string" && body.locale.length > 0 ? body.locale : undefined;
          const sceneId =
            typeof body?.sceneId === "string" && body.sceneId.length > 0 ? body.sceneId : undefined;
          const projectId =
            typeof body?.projectId === "string" && body.projectId.trim().length > 0
              ? body.projectId.trim()
              : undefined;

          const snapshot = await gameLoop.createSession(
            normalizeLocale(requestedLocale ?? gameRequestLocale),
            sceneId,
            projectId,
            ownerSessionId,
          );
          const state = await asLifecycleState(snapshot.sessionId, ownerSessionId);
          return {
            ok: true,
            data: state
              ? toGameSessionStatePayload(state)
              : {
                  sessionId: snapshot.sessionId,
                  participantSessionId: ownerSessionId,
                  locale: snapshot.locale,
                  timestamp: snapshot.timestamp,
                  projectId: snapshot.projectId,
                  releaseVersion: snapshot.releaseVersion,
                  state: snapshot.state,
                  commandQueueDepth: gameLoop.getCommandQueueDepth(snapshot.sessionId),
                  resumeToken: gameLoop.getResumeToken(snapshot.sessionId, ownerSessionId) ?? "",
                  resumeTokenExpiresAtMs: gameLoop.getResumeTokenExpiresAtMs(
                    snapshot.sessionId,
                    ownerSessionId,
                  ),
                  resumeTokenVersion: 1,
                  stateVersion: 1,
                  version: 1,
                  participantRole: "owner" as const,
                  participants: [
                    {
                      sessionId: ownerSessionId,
                      role: "owner" as const,
                      joinedAtMs: Date.now(),
                      updatedAtMs: Date.now(),
                    },
                  ],
                },
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
        async ({ params, gameParticipantSessionId, gameRequestLocale }) => {
          const state = await requireAccessibleGameSession(
            params.id,
            gameParticipantSessionId,
            gameRequestLocale,
          );
          return { ok: true, data: toGameSessionStatePayload(state) };
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
        async ({ params, body, set, gameParticipantSessionId, gameRequestLocale }) => {
          const messages = getGameMessages(gameRequestLocale);
          const restoredSession = await gameLoop.restoreSession(
            params.id,
            body.resumeToken,
            gameParticipantSessionId,
          );
          if (!restoredSession) {
            set.status = httpStatus.unauthorized;
            throw new ApplicationError(
              "UNAUTHORIZED",
              messages.game.sessionAccessDenied,
              httpStatus.unauthorized,
              false,
            );
          }

          const sessionState = await requireAccessibleGameSession(
            params.id,
            gameParticipantSessionId,
            gameRequestLocale,
          );
          return { ok: true, data: toGameSessionStatePayload(sessionState) };
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
        route.join,
        async ({
          params,
          body,
          set,
          request,
          status,
          gameParticipantSessionId,
          gameRequestLocale,
        }) => {
          const messages = getGameMessages(gameRequestLocale);
          const sessionState = await gameLoop.joinSession(
            body.inviteToken,
            gameParticipantSessionId,
          );
          if (!sessionState || sessionState.sessionId !== params.id) {
            return status(
              httpStatus.unauthorized,
              errorEnvelope(
                new ApplicationError(
                  "UNAUTHORIZED",
                  messages.game.invalidInviteDescription,
                  httpStatus.unauthorized,
                  false,
                ),
                ensureCorrelationIdHeader(request, set.headers),
              ),
            );
          }

          return { ok: true, data: toGameSessionStatePayload(sessionState) };
        },
        {
          params: t.Object({ id: t.String() }),
          body: joinSessionBodySchema,
          response: {
            [httpStatus.ok]: t.Object({ ok: t.Literal(true), data: gameSessionStateSchema }),
            [httpStatus.unauthorized]: errorResponse,
          },
        },
      )
      .post(
        route.close,
        async ({ params, set, gameParticipantSessionId, gameRequestLocale }) => {
          const ownerSessionId = gameParticipantSessionId;
          const session = await requireOwnedGameSession(
            params.id,
            ownerSessionId,
            gameRequestLocale,
          );
          const closed = await gameLoop.closeSession(session.id);
          if (!closed) {
            const messages = getGameMessages(gameRequestLocale);
            set.status = httpStatus.notFound;
            throw new ApplicationError(
              "SESSION_NOT_FOUND",
              messages.game.sessionNotFoundRequest,
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
        route.invite,
        async ({
          params,
          body,
          request,
          set,
          status,
          gameParticipantSessionId,
          gameRequestLocale,
        }) => {
          const ownerSessionId = gameParticipantSessionId;
          const messages = getGameMessages(gameRequestLocale);
          await requireOwnedGameSession(params.id, ownerSessionId, gameRequestLocale);
          const inviteToken = await gameLoop.createInviteToken(
            params.id,
            ownerSessionId,
            body.role,
          );
          if (!inviteToken) {
            return status(
              httpStatus.notFound,
              errorEnvelope(
                new ApplicationError(
                  "SESSION_NOT_FOUND",
                  messages.game.sessionNotFoundRequest,
                  httpStatus.notFound,
                  false,
                ),
                ensureCorrelationIdHeader(request, set.headers),
              ),
            );
          }
          const locale = normalizeLocale(body.locale ?? gameRequestLocale);
          const joinPath = withQueryParameters(appRoutes.game, {
            lang: locale,
            invite: inviteToken,
            sessionId: params.id,
          });
          if (wantsHtml(request.headers.get("accept"))) {
            const messages = getMessages(locale);
            return renderInviteResult(
              params.id,
              body.role === "controller"
                ? messages.game.inviteControllerAction
                : messages.game.inviteSpectatorAction,
              messages.game.inviteLinkLabel,
              joinPath,
            );
          }

          return {
            ok: true,
            data: {
              sessionId: params.id,
              role: body.role,
              inviteToken,
              joinPath,
            },
          };
        },
        {
          params: t.Object({ id: t.String() }),
          body: inviteSessionBodySchema,
          response: {
            [httpStatus.ok]: t.Union([inviteSessionResponse, t.String()]),
            [httpStatus.unauthorized]: errorResponse,
            [httpStatus.notFound]: errorResponse,
          },
        },
      )
      .post(
        route.save,
        async ({ params, set, gameParticipantSessionId, gameRequestLocale }) => {
          const ownerSessionId = gameParticipantSessionId;
          const messages = getGameMessages(gameRequestLocale);
          const session = await requireOwnedGameSession(
            params.id,
            ownerSessionId,
            gameRequestLocale,
          );
          const saveCooldownRemainingMs = gameLoop.getSaveCooldownRemainingMs(params.id);
          if (saveCooldownRemainingMs > 0) {
            set.status = httpStatus.tooManyRequests;
            throw new ApplicationError(
              "CONFLICT",
              `${messages.game.saveCooldownActive} (${saveCooldownRemainingMs}ms)`,
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
        async ({ params, set, gameParticipantSessionId, gameRequestLocale }) => {
          const ownerSessionId = gameParticipantSessionId;
          const messages = getGameMessages(gameRequestLocale);
          const session = await requireOwnedGameSession(
            params.id,
            ownerSessionId,
            gameRequestLocale,
          );
          const closed = await gameLoop.closeSession(session.id);
          if (!closed) {
            set.status = httpStatus.notFound;
            throw new ApplicationError(
              "SESSION_NOT_FOUND",
              messages.game.sessionNotFoundRequest,
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
        async ({ body, params, set, gameParticipantSessionId, gameRequestLocale }) => {
          const session = await requireControllableGameSession(
            params.id,
            gameParticipantSessionId,
            gameRequestLocale,
          );
          const messages = getGameMessages(session.locale);
          const result = gameLoop.processCommand(
            session.sessionId,
            gameParticipantSessionId,
            body,
            session.locale,
          );
          if (result.state === "rejected") {
            set.status = httpStatus.unprocessableEntity;
            throw new ApplicationError(
              result.errorCode ?? "INVALID_COMMAND",
              result.errorCode === "INVALID_COMMAND"
                ? messages.game.invalidCommand
                : messages.game.commandRejected,
              httpStatus.unprocessableEntity,
              false,
            );
          }

          if (result.state === "dropped" && result.errorCode === "CONFLICT") {
            set.status = httpStatus.conflict;
            throw new ApplicationError(
              result.errorCode,
              getCommandErrorMessage(session.locale, result.errorCode, result.errorReason),
              httpStatus.conflict,
              true,
            );
          }

          if (result.state === "dropped") {
            set.status = httpStatus.serviceUnavailable;
            throw new ApplicationError(
              result.errorCode ?? "INVALID_COMMAND",
              getCommandErrorMessage(session.locale, result.errorCode, result.errorReason),
              httpStatus.serviceUnavailable,
              true,
            );
          }

          if (!result.commandType) {
            set.status = httpStatus.unprocessableEntity;
            throw new ApplicationError(
              "INVALID_COMMAND",
              messages.game.commandTypeMissing,
              httpStatus.unprocessableEntity,
              false,
            );
          }

          return {
            ok: true,
            data: {
              sessionId: result.sessionId,
              commandId: result.commandId ?? "unknown",
              sequenceId: result.sequenceId,
              state: result.state,
              commandType: result.commandType!,
              errorCode: result.errorCode,
              errorReason: result.errorReason,
              commandState: result.commandState,
              queueDepth: gameLoop.getCommandQueueDepth(session.sessionId),
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
        async ({ params, gameParticipantSessionId, gameRequestLocale }) => {
          const session = await requireAccessibleGameSession(
            params.id,
            gameParticipantSessionId,
            gameRequestLocale,
          );
          return { ok: true, data: session.state.dialogue };
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
          const transport = resolveGameWebSocketContext({
            query: ws.data.query,
            cookie: ws.data.cookie,
          });
          const resumeToken = transport.gameResumeToken;
          const participantSessionId = transport.gameParticipantSessionId;
          const sessionResult = await gameLoop.getStoredSession(sessionId);
          if (!sessionResult.ok) {
            ws.close(
              sessionResult.error === "SESSION_EXPIRED"
                ? wsCloseCode.sessionExpired
                : wsCloseCode.sessionNotFound,
            );
            return;
          }

          if (resumeToken === null || participantSessionId === null) {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }

          const joinedSession = await gameLoop.restoreSession(
            sessionId,
            resumeToken,
            participantSessionId,
          );
          if (!joinedSession) {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }
          const joinedState = await asLifecycleState(sessionId, participantSessionId);
          if (!joinedState) {
            ws.close(wsCloseCode.sessionExpired);
            return;
          }

          const connKey = `${sessionId}:${crypto.randomUUID()}`;
          wsConnKeys.set(ws, connKey);
          const locale = sessionResult.payload.locale as SupportedLocale;

          const cleanup = gameLoop.startTick(sessionId, () => {
            void asLifecycleState(sessionId, participantSessionId).then((state) => {
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
                  participantSessionId: state.participantSessionId,
                  participants: state.participants,
                  participantRole: state.participantRole,
                }),
              );
            });
          });
          registerWsConnection(
            sessionId,
            connKey,
            locale,
            participantSessionId,
            joinedState.participantRole,
            cleanup,
            ws,
          );
        },

        message(ws, command) {
          const sessionId = ws.data.params.id;
          const connKey = wsConnKeys.get(ws);
          const locale = (connKey ? wsLocales.get(connKey) : undefined) ?? "en-US";
          const participantSessionId = connKey ? wsParticipantIds.get(connKey) : undefined;
          const participantRole = connKey ? wsParticipantRoles.get(connKey) : undefined;
          if (!participantSessionId || participantRole === "spectator") {
            return;
          }
          const normalizedCommand =
            typeof command === "string" ? safeJsonParse(command, null) : command;
          const result = gameLoop.processCommand(
            sessionId,
            participantSessionId,
            normalizedCommand,
            locale,
          );
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

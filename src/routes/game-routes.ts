import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { authSessionGuard } from "../plugins/auth-session.ts";
import {
  type GameRequestContext,
  gameRequestContextPlugin,
  resolveGameRequestContext,
} from "../plugins/game-request-context.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { appRoutes, resolveRequestQueryParam } from "../shared/constants/routes.ts";
import type { GameSessionState } from "../shared/contracts/game.ts";
import { GamePage } from "../views/game-page.ts";

const resolveSessionContext = (
  request: Request,
): {
  readonly sessionId: string | null;
  readonly projectId: string | null;
  readonly inviteToken: string | null;
} => {
  const sessionId = resolveRequestQueryParam(request, "sessionId")?.trim() ?? null;
  const projectId = resolveRequestQueryParam(request, "projectId")?.trim() ?? null;
  const inviteToken = resolveRequestQueryParam(request, "invite")?.trim() ?? null;
  return { sessionId, projectId, inviteToken };
};

const isGameRequestContext = (value: unknown): value is GameRequestContext =>
  typeof value === "object" &&
  value !== null &&
  "gameParticipantSessionId" in value &&
  "gameRequestLocale" in value;

const hydrateGameSession = async (
  sessionId: string | null,
  locale: LocaleCode,
  projectId: string | null,
  ownerSessionId: string,
): Promise<GameSessionState> => {
  if (sessionId) {
    const existing = await gameLoop.getSessionState(sessionId, ownerSessionId);
    if (existing) {
      return existing;
    }
  }

  const created = await gameLoop.createSession(
    locale,
    defaultGameConfig.defaultSceneId,
    projectId ?? undefined,
    ownerSessionId,
  );
  const recreated = await gameLoop.getSessionState(created.sessionId, ownerSessionId);
  if (recreated) {
    return recreated;
  }

  return {
    sessionId: created.sessionId,
    locale: created.locale,
    timestamp: created.timestamp,
    projectId: created.projectId,
    state: created.state,
    participantRole: "owner",
    participants: [
      {
        sessionId: ownerSessionId,
        role: "owner",
        joinedAtMs: Date.now(),
        updatedAtMs: Date.now(),
      },
    ],
    commandQueueDepth: 0,
    version: 1,
    resumeToken: gameLoop.getResumeToken(created.sessionId, ownerSessionId) ?? "",
    resumeTokenExpiresAtMs: gameLoop.getResumeTokenExpiresAtMs(created.sessionId, ownerSessionId),
    resumeTokenVersion: 1,
    stateVersion: 1,
  };
};

export const gameRoutes = new Elysia({ prefix: appRoutes.game })
  .use(gameRequestContextPlugin)
  .guard(authSessionGuard, (app) =>
    app.get("/", async ({ request, cookie, ...contextValue }) => {
      const context = isGameRequestContext(contextValue)
        ? contextValue
        : resolveGameRequestContext(request, cookie);
      const locale = context.gameRequestLocale;
      const { sessionId, projectId, inviteToken } = resolveSessionContext(request);
      const ownerSessionId = context.gameParticipantSessionId;
      if (inviteToken) {
        const joined = await gameLoop.joinSession(inviteToken, ownerSessionId);
        if (joined) {
          return GamePage({
            state: "playable",
            locale,
            sessionId: joined.sessionId,
            projectId: joined.projectId,
            sceneTitle: joined.state.sceneTitle,
            sceneMode: joined.state.sceneMode,
            activeQuestTitle:
              joined.state.quests
                ?.find((quest) => !quest.completed)
                ?.steps.find((step) => step.state === "active")?.title ??
              joined.state.quests?.find((quest) => !quest.completed)?.title,
            resumeToken: joined.resumeToken,
            resumeTokenExpiresAtMs: joined.resumeTokenExpiresAtMs,
            commandQueueDepth: joined.commandQueueDepth,
            version: joined.version,
            participantRole: joined.participantRole,
            participants: joined.participants,
            clientRuntimeConfig: {
              commandSendIntervalMs: defaultGameConfig.commandSendIntervalMs,
              commandTtlMs: defaultGameConfig.commandTtlMs,
              socketReconnectDelayMs: defaultGameConfig.socketReconnectDelayMs,
              restoreRequestTimeoutMs: defaultGameConfig.restoreRequestTimeoutMs,
              restoreMaxAttempts: defaultGameConfig.restoreMaxAttempts,
            },
          });
        }

        return GamePage({
          locale,
          state: "invalid-invite",
        });
      }
      if (projectId) {
        const draftProject = await builderService.peekProject(projectId);
        if (!draftProject) {
          return GamePage({
            locale,
            state: "missing-project",
            projectId,
          });
        }

        const publishedProject = await builderService.getPublishedProject(projectId);
        if (!publishedProject) {
          return GamePage({
            locale,
            state: "unpublished-project",
            projectId,
          });
        }
      }
      const session = await hydrateGameSession(sessionId, locale, projectId, ownerSessionId);

      return GamePage({
        state: "playable",
        locale,
        sessionId: session.sessionId,
        projectId: session.projectId,
        sceneTitle: session.state.sceneTitle,
        sceneMode: session.state.sceneMode,
        activeQuestTitle:
          session.state.quests
            ?.find((quest) => !quest.completed)
            ?.steps.find((step) => step.state === "active")?.title ??
          session.state.quests?.find((quest) => !quest.completed)?.title,
        resumeToken: session.resumeToken,
        resumeTokenExpiresAtMs: session.resumeTokenExpiresAtMs,
        commandQueueDepth: session.commandQueueDepth,
        version: session.version,
        participantRole: session.participantRole,
        participants: session.participants,
        clientRuntimeConfig: {
          commandSendIntervalMs: defaultGameConfig.commandSendIntervalMs,
          commandTtlMs: defaultGameConfig.commandTtlMs,
          socketReconnectDelayMs: defaultGameConfig.socketReconnectDelayMs,
          restoreRequestTimeoutMs: defaultGameConfig.restoreRequestTimeoutMs,
          restoreMaxAttempts: defaultGameConfig.restoreMaxAttempts,
        },
      });
    }),
  );

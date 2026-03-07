import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { authSessionGuard } from "../plugins/auth-session.ts";
import { gameRequestContextPlugin } from "../plugins/game-request-context.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { GameSessionState } from "../shared/contracts/game.ts";
import { GamePage } from "../views/game-page.ts";

const hydrateGameSession = async (
  sessionId: string | null,
  locale: LocaleCode,
  projectId: string | null,
  ownerSessionId: string,
): Promise<GameSessionState | null> => {
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
  return gameLoop.getSessionState(created.sessionId, ownerSessionId);
};

export const gameRoutes = new Elysia({ prefix: appRoutes.game })
  .use(gameRequestContextPlugin)
  .guard(authSessionGuard, (app) =>
    app.get(
      "/",
      async ({
        gameRequestLocale,
        gameParticipantSessionId,
        gameRequestedSessionId,
        gameRequestedProjectId,
        gameInviteToken,
      }) => {
        const locale = gameRequestLocale;
        const sessionId = gameRequestedSessionId;
        const projectId = gameRequestedProjectId;
        const inviteToken = gameInviteToken;
        const ownerSessionId = gameParticipantSessionId;
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
              participantSessionId: joined.participantSessionId,
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
        if (!session) {
          return GamePage({
            locale,
            state: "session-unavailable",
            projectId: projectId ?? undefined,
          });
        }

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
          participantSessionId: session.participantSessionId,
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
      },
    ),
  );

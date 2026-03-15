import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { appConfig } from "../config/environment.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { authSessionGuard } from "../plugins/auth-session.ts";
import { gameRequestContextPlugin } from "../plugins/game-request-context.ts";
import type { ProjectBranding } from "../shared/branding/project-branding.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { defaultOracleMode } from "../shared/constants/oracle.ts";
import type { GameSessionState } from "../shared/contracts/game.ts";
import { GamePage, type GamePageProps } from "../views/game-page.ts";
import type { OraclePanelState } from "../views/layout.ts";
import { parseOracleMode } from "./oracle-input.ts";

/**
 * Assembles `GamePage` playable-state props from a resolved session.
 *
 * @param session Resolved game session state.
 * @param locale Active locale code.
 * @returns Props suitable for `GamePage`.
 */
const buildPlayablePageProps = (
  session: GameSessionState,
  locale: LocaleCode,
  requestOrigin?: string,
  brand?: ProjectBranding,
): GamePageProps => ({
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
    rendererPreference: appConfig.playableGame.rendererPreference,
  },
  appOrigin: requestOrigin,
  brand,
});

const resolveOraclePanelState = (request: Request): OraclePanelState => {
  const searchParams = new URL(request.url).searchParams;
  const openAiAssistant = searchParams.get("openAiAssistant");
  const hasOpenSignal =
    openAiAssistant === "true" || openAiAssistant === "1" || searchParams.has("question");
  if (!hasOpenSignal) {
    return {
      state: "idle",
      mode: defaultOracleMode,
      question: "",
    };
  }

  return {
    state: "idle",
    mode: parseOracleMode(searchParams.get("mode") ?? undefined),
    question: searchParams.get("question") ?? "",
  };
};

const hydrateGameSession = async (
  sessionId: string | null,
  locale: LocaleCode,
  projectId: string | null,
  ownerSessionId: string,
  sceneId: string | null,
): Promise<GameSessionState | null> => {
  if (sessionId) {
    const existing = await gameLoop.getSessionState(sessionId, ownerSessionId);
    if (existing) {
      return existing;
    }
  }

  const created = await gameLoop.createSession(
    locale,
    sceneId ?? defaultGameConfig.defaultSceneId,
    projectId ?? undefined,
    ownerSessionId,
  );
  return gameLoop.getSessionState(created.sessionId, ownerSessionId);
};

export const gameRoutes = new Elysia({ prefix: "/projects" })
  .use(gameRequestContextPlugin)
  .guard(authSessionGuard, (app) =>
    app.get(
      "/:projectId/playtest",
      async ({
        request,
        params,
        gameRequestLocale,
        gameParticipantSessionId,
        gameRequestedSessionId,
        gameRequestedProjectId,
        gameRequestedSceneId,
        gameInviteToken,
      }) => {
        const locale = gameRequestLocale;
        const sessionId = gameRequestedSessionId;
        const projectId = params.projectId?.trim() || gameRequestedProjectId;
        const inviteToken = gameInviteToken;
        const ownerSessionId = gameParticipantSessionId;
        const requestOrigin = new URL(request.url).origin;
        const oraclePanelState = resolveOraclePanelState(request);
        if (inviteToken) {
          const joined = await gameLoop.joinSession(inviteToken, ownerSessionId);
          if (joined) {
            return GamePage({
              ...buildPlayablePageProps(joined, locale, requestOrigin),
              oraclePanelState,
            });
          }

          return GamePage({
            locale,
            state: "invalid-invite",
            oraclePanelState,
          });
        }
        if (projectId) {
          const draftProject = await builderService.peekProject(projectId);
          if (!draftProject) {
            return GamePage({
              locale,
              state: "missing-project",
              projectId,
              oraclePanelState,
            });
          }

          const publishedProject = await builderService.getPublishedProject(projectId);
          if (!publishedProject) {
            return GamePage({
              locale,
              state: "unpublished-project",
              projectId,
              brand: draftProject.brand,
              oraclePanelState,
            });
          }

          const session = await hydrateGameSession(
            sessionId,
            locale,
            projectId,
            ownerSessionId,
            gameRequestedSceneId,
          );
          if (!session) {
            return GamePage({
              locale,
              state: "session-unavailable",
              projectId: projectId ?? undefined,
              brand: publishedProject.brand,
              oraclePanelState,
            });
          }

          return GamePage({
            ...buildPlayablePageProps(session, locale, requestOrigin, publishedProject.brand),
            oraclePanelState,
          });
        }
        const session = await hydrateGameSession(
          sessionId,
          locale,
          projectId,
          ownerSessionId,
          gameRequestedSceneId,
        );
        if (!session) {
          return GamePage({
            locale,
            state: "session-unavailable",
            projectId: projectId ?? undefined,
            oraclePanelState,
          });
        }

        return GamePage({
          ...buildPlayablePageProps(session, locale, requestOrigin),
          oraclePanelState,
        });
      },
    ),
  );

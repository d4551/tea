import { Elysia } from "elysia";
import { appConfig, type LocaleCode } from "../config/environment.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { GameSessionLifecycleResult } from "../shared/contracts/game.ts";
import { resolveRequestLocale } from "../shared/i18n/translator.ts";
import { GamePage } from "../views/game-page.ts";

const resolveSessionContext = (
  request: Request,
): {
  readonly sessionId: string | null;
  readonly resumeToken: string | null;
} => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() ?? null;
  const resumeToken = url.searchParams.get("resumeToken")?.trim() ?? null;
  return { sessionId, resumeToken };
};

const hydrateGameSession = async (
  sessionId: string | null,
  resumeToken: string | null,
  locale: LocaleCode,
): Promise<GameSessionLifecycleResult> => {
  if (sessionId) {
    if (resumeToken) {
      const joined = await gameLoop.joinSession(sessionId, resumeToken);
      if (joined) {
        const joinedState = await gameLoop.getSessionState(sessionId);
        if (joinedState) {
          return joinedState;
        }
      }

      const restored = await gameLoop.restoreSession(sessionId);
      if (restored) {
        const restoredState = await gameLoop.getSessionState(sessionId);
        if (restoredState) {
          return restoredState;
        }
      }
    } else {
      const restored = await gameLoop.restoreSession(sessionId);
      if (restored) {
        const restoredState = await gameLoop.getSessionState(sessionId);
        if (restoredState) {
          return restoredState;
        }
      }
    }
  }

  const created = await gameLoop.createSession(locale);
  const recreated = await gameLoop.getSessionState(created.sessionId);
  if (recreated) {
    return recreated;
  }

  return {
    sessionId: created.sessionId,
    locale: created.locale,
    timestamp: created.timestamp,
    commandQueueDepth: 0,
    version: 1,
    resumeToken: gameLoop.getResumeToken(created.sessionId) ?? "",
  };
};

export const gameRoutes = new Elysia({ prefix: appRoutes.game }).get("/", async ({ request }) => {
  const locale = resolveRequestLocale(request);
  const { sessionId, resumeToken } = resolveSessionContext(request);
  const session = await hydrateGameSession(sessionId, resumeToken, locale);

  return GamePage({
    locale,
    sessionId: session.sessionId,
    resumeToken: session.resumeToken,
    commandQueueDepth: session.commandQueueDepth,
    version: session.version,
    resumeWindowMs: appConfig.game.sessionResumeWindowMs,
  });
});

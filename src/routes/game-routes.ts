import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { authSessionGuard, resolveAuthSession } from "../plugins/auth-session.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { GameSessionLifecycleResult } from "../shared/contracts/game.ts";
import { resolveRequestLocale } from "../shared/i18n/translator.ts";
import { GamePage } from "../views/game-page.ts";

const resolveSessionContext = (
  request: Request,
): {
  readonly sessionId: string | null;
  readonly projectId: string | null;
} => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() ?? null;
  const projectId = url.searchParams.get("projectId")?.trim() ?? null;
  return { sessionId, projectId };
};

const hydrateGameSession = async (
  sessionId: string | null,
  locale: LocaleCode,
  projectId: string | null,
  ownerSessionId: string,
): Promise<GameSessionLifecycleResult> => {
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
    commandQueueDepth: 0,
    version: 1,
    resumeToken: gameLoop.getResumeToken(created.sessionId, ownerSessionId) ?? "",
    resumeTokenExpiresAtMs: gameLoop.getResumeTokenExpiresAtMs(created.sessionId, ownerSessionId),
    resumeTokenVersion: 1,
    stateVersion: 1,
  };
};

export const gameRoutes = new Elysia({ prefix: appRoutes.game }).guard(authSessionGuard, (app) =>
  app.get("/", async ({ request, cookie }) => {
    const locale = resolveRequestLocale(request);
    const { sessionId, projectId } = resolveSessionContext(request);
    const ownerSessionId = resolveAuthSession(cookie).sessionId;
    const session = await hydrateGameSession(sessionId, locale, projectId, ownerSessionId);

    return GamePage({
      locale,
      sessionId: session.sessionId,
      resumeToken: session.resumeToken,
      resumeTokenExpiresAtMs: session.resumeTokenExpiresAtMs,
      commandQueueDepth: session.commandQueueDepth,
      version: session.version,
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

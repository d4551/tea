import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { resolveRequestLocale } from "../shared/i18n/translator.ts";
import { resolveAuthSession } from "./auth-session.ts";

/**
 * Derived request context shared by game HTTP routes.
 */
export interface GameRequestContext {
  /** Authenticated anonymous session id derived from the request cookie. */
  readonly gameParticipantSessionId: string;
  /** Negotiated locale for the current request. */
  readonly gameRequestLocale: LocaleCode;
}

/**
 * Resolves canonical game request context from one HTTP request.
 *
 * @param request Current request object.
 * @param cookie Parsed Elysia cookie bag.
 * @returns Request-scoped game identity and locale.
 */
export const resolveGameRequestContext = (
  request: Request,
  cookie: Parameters<typeof resolveAuthSession>[0],
): GameRequestContext => ({
  gameParticipantSessionId: resolveAuthSession(cookie).sessionId,
  gameRequestLocale: resolveRequestLocale(request),
});

/**
 * Elysia plugin that derives canonical game participant identity and locale per request.
 */
export const gameRequestContextPlugin = new Elysia({ name: "game-request-context" }).derive(
  { as: "scoped" },
  ({ request, cookie }) => {
    const context = resolveGameRequestContext(request, cookie);

    return {
      gameParticipantSessionId: context.gameParticipantSessionId,
      gameRequestLocale: context.gameRequestLocale,
    };
  },
);

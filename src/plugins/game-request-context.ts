import { Elysia } from "elysia";
import type { LocaleCode } from "../config/environment.ts";
import { resolveRequestQueryParam } from "../shared/constants/routes.ts";
import { resolveRequestLocale } from "../shared/i18n/translator.ts";
import { type AuthCookieBag, type AuthPrincipal, resolveAuthSession } from "./auth-session.ts";

/**
 * Derived request context shared by game HTTP routes.
 */
export interface GameRequestContext {
  /** Authenticated anonymous session id derived from the request cookie. */
  readonly gameParticipantSessionId: string;
  /** Canonical principal type for authorization checks. */
  readonly gamePrincipalType: AuthPrincipal["actorType"];
  /** Canonical principal user identifier when available. */
  readonly gamePrincipalUserId: string | null;
  /** Canonical principal organization identifier when available. */
  readonly gamePrincipalOrganizationId: string | null;
  /** Canonical principal role keys when available. */
  readonly gamePrincipalRoleKeys: readonly string[];
  /** Negotiated locale for the current request. */
  readonly gameRequestLocale: LocaleCode;
  /** Requested session id from the game page query string. */
  readonly gameRequestedSessionId: string | null;
  /** Requested scene id from the game page query string. */
  readonly gameRequestedSceneId: string | null;
  /** Requested project id from the game page query string. */
  readonly gameRequestedProjectId: string | null;
  /** Requested invite token from the game page query string. */
  readonly gameInviteToken: string | null;
}

/**
 * Canonical websocket transport context for game session restore and command routing.
 */
export interface GameWebSocketContext {
  /** Authenticated anonymous session id derived from the websocket cookie bag. */
  readonly gameParticipantSessionId: string | null;
  /** Resume token carried by websocket query parameters. */
  readonly gameResumeToken: string | null;
}

type WebSocketTransportObject = Record<string, unknown>;

const isWebSocketTransportObject = (value: unknown): value is WebSocketTransportObject =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toWebSocketTransportObject = (value: unknown): WebSocketTransportObject =>
  isWebSocketTransportObject(value) ? value : {};

const isAuthCookieBag = (value: unknown): value is AuthCookieBag =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const readStringProperty = (source: WebSocketTransportObject, key: string): string | undefined =>
  typeof source[key] === "string" ? source[key] : undefined;

const normalizeTransportString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeTransportString(entry);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
};

const resolveTrimmedQueryValue = (request: Request, key: string): string | null =>
  normalizeTransportString(resolveRequestQueryParam(request, key));

const resolveTrimmedParamValue = (params: unknown, key: string): string | null => {
  if (!params || typeof params !== "object") {
    return null;
  }
  return normalizeTransportString((params as Record<string, unknown>)[key]);
};

/**
 * Resolves canonical game request context from one HTTP request.
 *
 * @param request Current request object.
 * @param cookie Parsed Elysia cookie bag.
 * @returns Request-scoped game identity and locale.
 */
export const resolveGameRequestContext = (
  request: Request,
  cookie: AuthCookieBag,
  params?: unknown,
): GameRequestContext => {
  const authSession = resolveAuthSession(cookie);

  return {
    gameParticipantSessionId: authSession.sessionId,
    gamePrincipalType: authSession.principal.actorType,
    gamePrincipalUserId: authSession.principal.actorId,
    gamePrincipalOrganizationId: authSession.principal.organizationId,
    gamePrincipalRoleKeys: authSession.principal.roleKeys,
    gameRequestLocale: resolveRequestLocale(request),
    gameRequestedSessionId: resolveTrimmedQueryValue(request, "sessionId"),
    gameRequestedSceneId: resolveTrimmedQueryValue(request, "sceneId"),
    gameRequestedProjectId:
      resolveTrimmedParamValue(params, "projectId") ??
      resolveTrimmedQueryValue(request, "projectId"),
    gameInviteToken: resolveTrimmedQueryValue(request, "invite"),
  };
};

/**
 * Safely resolves websocket transport identity and resume-token metadata.
 *
 * @param input Raw websocket cookie/query payloads supplied by Elysia.
 * @returns Canonical websocket participant identity and resume token.
 */
export const resolveGameWebSocketContext = (input: {
  readonly cookie: unknown;
  readonly query: unknown;
}): GameWebSocketContext => {
  const cookieSource = isAuthCookieBag(input.cookie) ? input.cookie : {};
  const querySource = toWebSocketTransportObject(input.query);
  const authSession = resolveAuthSession(cookieSource);

  return {
    gameParticipantSessionId: authSession.sessionId,
    gameResumeToken:
      normalizeTransportString(
        readStringProperty(querySource, "resumeToken") ?? querySource.resumeToken,
      ) ?? null,
  };
};

/**
 * Elysia plugin that derives canonical game participant identity and locale per request.
 */
export const gameRequestContextPlugin = new Elysia({ name: "game-request-context" }).derive(
  { as: "scoped" },
  ({ request, cookie, params }) => {
    const context = resolveGameRequestContext(request, cookie, params);

    return {
      gameParticipantSessionId: context.gameParticipantSessionId,
      gamePrincipalType: context.gamePrincipalType,
      gamePrincipalUserId: context.gamePrincipalUserId,
      gamePrincipalOrganizationId: context.gamePrincipalOrganizationId,
      gamePrincipalRoleKeys: context.gamePrincipalRoleKeys,
      gameRequestLocale: context.gameRequestLocale,
      gameRequestedSessionId: context.gameRequestedSessionId,
      gameRequestedSceneId: context.gameRequestedSceneId,
      gameRequestedProjectId: context.gameRequestedProjectId,
      gameInviteToken: context.gameInviteToken,
    };
  },
);

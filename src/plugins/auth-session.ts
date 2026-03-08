import { type Cookie, Elysia, t } from "elysia";
import { appConfig } from "../config/environment.ts";

/**
 * Request-scoped anonymous auth session derived from the session cookie.
 */
export interface AuthSession {
  /** Stable anonymous session identifier. */
  readonly sessionId: string;
  /** Whether the request carries a valid session. */
  readonly hasSession: boolean;
}

/**
 * Request-scoped auth context derived from the session cookie.
 */
export interface AuthRequestContext {
  /** Stable anonymous session identifier resolved for the current request. */
  readonly authSessionId: string;
  /** Whether the current request arrived with an existing session cookie. */
  readonly authHasSession: boolean;
}

interface AuthSessionCookieOptions {
  readonly httpOnly: boolean;
  readonly sameSite: "lax";
  readonly path: string;
  readonly maxAge: number;
  readonly secure: boolean;
}

export type AuthCookieBag = Record<string, Cookie<unknown>>;
const authSessionCache = new WeakMap<AuthCookieBag, AuthSession>();

const authSessionCookieSchema = t.Cookie({
  [appConfig.auth.sessionCookieName]: t.Optional(t.String()),
});

const createAnonymousSessionId = (): string => crypto.randomUUID();

const sessionCookieOptions: AuthSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: appConfig.auth.sessionMaxAgeSeconds,
  secure: true,
};

const readSessionId = (cookie: AuthCookieBag): string | null => {
  const sessionCookie = cookie[appConfig.auth.sessionCookieName];
  return typeof sessionCookie?.value === "string" && sessionCookie.value.length > 0
    ? sessionCookie.value
    : null;
};

/**
 * Resolves the request auth session from Elysia's cookie context.
 *
 * @param cookie Elysia cookie bag for the current request.
 * @returns Anonymous session state derived from the session cookie.
 */
export const resolveAuthSession = (cookie: AuthCookieBag): AuthSession => {
  const cachedSession = authSessionCache.get(cookie);
  if (cachedSession) {
    return cachedSession;
  }

  const existingSessionId = readSessionId(cookie);
  const authSession: AuthSession = {
    sessionId: existingSessionId ?? createAnonymousSessionId(),
    hasSession: existingSessionId !== null,
  };
  authSessionCache.set(cookie, authSession);
  return authSession;
};

/**
 * Resolves canonical request-scoped auth context from Elysia's cookie bag.
 *
 * @param cookie Elysia cookie bag for the current request.
 * @returns Session identity and existing-session state for request handlers.
 */
export const resolveAuthRequestContext = (cookie: AuthCookieBag): AuthRequestContext => {
  const authSession = resolveAuthSession(cookie);

  return {
    authSessionId: authSession.sessionId,
    authHasSession: authSession.hasSession,
  };
};

/**
 * Shared auth-session guard used by page and API route trees.
 */
export const authSessionGuard = {
  cookie: authSessionCookieSchema,
  beforeHandle: ({ cookie }: { cookie: AuthCookieBag }) => {
    const authSession = resolveAuthSession(cookie);
    const sessionCookie = cookie[appConfig.auth.sessionCookieName];
    sessionCookie?.set({
      value: authSession.sessionId,
      ...sessionCookieOptions,
    });
  },
} as const;

/**
 * Elysia plugin that derives canonical auth-session state for downstream handlers.
 */
export const authSessionContextPlugin = new Elysia({ name: "auth-session-context" }).derive(
  { as: "scoped" },
  ({ cookie }) => {
    const context = resolveAuthRequestContext(cookie);

    return {
      authSessionId: context.authSessionId,
      authHasSession: context.authHasSession,
    };
  },
);

import { type Cookie, t } from "elysia";
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

interface AuthSessionCookieOptions {
  readonly httpOnly: boolean;
  readonly sameSite: "lax";
  readonly path: string;
  readonly maxAge: number;
}

type AuthCookieBag = Record<string, Cookie<unknown>>;

const authSessionCookieSchema = t.Cookie({
  [appConfig.auth.sessionCookieName]: t.Optional(t.String()),
});

const createAnonymousSessionId = (): string => crypto.randomUUID();

const sessionCookieOptions: AuthSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: appConfig.auth.sessionMaxAgeSeconds,
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
  return {
    sessionId: readSessionId(cookie) ?? createAnonymousSessionId(),
    hasSession: true,
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

    if (!sessionCookie) {
      return;
    }

    sessionCookie.set({
      value: authSession.sessionId,
      ...sessionCookieOptions,
    });
  },
} as const;

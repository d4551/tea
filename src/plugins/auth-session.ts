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
  /** Canonical principal identity resolved for this request. */
  readonly principal: AuthPrincipal;
}

/** Canonical authentication principal shape used by enterprise-capable routes. */
export interface AuthPrincipal {
  /** Principal actor class for authorization checks. */
  readonly actorType: "anonymous" | "user";
  /** Identity id when actorType is "user". */
  readonly actorId: string | null;
  /** Default organization for this principal, when available. */
  readonly organizationId: string | null;
  /** Scoped role keys for authorization checks. */
  readonly roleKeys: readonly string[];
}

/**
 * Optional principal seed used when bootstrapping a known user identity from an upstream identity flow.
 */
export interface AuthPrincipalSeed {
  readonly actorId?: string | null;
  readonly organizationId?: string | null;
  readonly roleKeys?: readonly string[];
}

/**
 * Request-scoped auth context derived from the session cookie.
 */
export interface AuthRequestContext {
  /** Stable anonymous session identifier resolved for the current request. */
  readonly authSessionId: string;
  /** Whether the current request arrived with an existing session cookie. */
  readonly authHasSession: boolean;
  /** Canonical principal type resolved for request-level policy checks. */
  readonly authPrincipalType: "anonymous" | "user";
  /** Principal user identifier when authenticated. */
  readonly authPrincipalUserId: string | null;
  /** Principal organization identifier when available. */
  readonly authPrincipalOrganizationId: string | null;
  /** Principal role keys when available. */
  readonly authPrincipalRoleKeys: readonly string[];
}

interface AuthSessionCookieOptions {
  readonly httpOnly: boolean;
  readonly sameSite: "lax";
  readonly path: string;
  readonly maxAge: number;
  readonly secure: boolean;
}

interface AuthSessionCookie {
  readonly value?: Cookie<unknown>["value"];
  readonly set: (...args: Parameters<Cookie<unknown>["set"]>) => void;
}

export type AuthCookieBag = Record<string, AuthSessionCookie>;
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

type AuthSessionSeedRecord = {
  readonly seed: AuthPrincipalSeed;
  readonly expiresAtMs: number;
};

const authSessionMigrationSeeds = new Map<string, AuthSessionSeedRecord>();
const AUTH_SESSION_MIGRATION_LEEWAY_MS = 1000 * 60 * 60;

const resolveAuthMigrationSeed = (cookie: AuthCookieBag): AuthPrincipalSeed | undefined => {
  const sessionId = readSessionId(cookie);
  if (sessionId === null) {
    return undefined;
  }

  const candidate = authSessionMigrationSeeds.get(sessionId);
  if (candidate === undefined) {
    return undefined;
  }

  if (Date.now() > candidate.expiresAtMs) {
    authSessionMigrationSeeds.delete(sessionId);
    return undefined;
  }

  return candidate.seed;
};

/**
 * Registers a one-time migration seed for a legacy anonymous session id while
 * preserving anonymous fallback behavior for unresolved principals.
 */
export const registerAuthSessionMigrationSeed = (
  sessionId: string,
  seed: AuthPrincipalSeed,
  ttlMs = AUTH_SESSION_MIGRATION_LEEWAY_MS,
): void => {
  const trimmedSessionId = sessionId.trim();
  if (trimmedSessionId.length === 0) {
    return;
  }

  const filteredSeed: AuthPrincipalSeed = {
    actorId: typeof seed.actorId === "string" ? seed.actorId.trim() : undefined,
    organizationId:
      typeof seed.organizationId === "string" ? seed.organizationId.trim() : undefined,
    roleKeys:
      seed.roleKeys?.filter((role): role is string => typeof role === "string" && role.trim().length > 0) ??
      [],
  };

  const expiresAtMs = Date.now() + Math.max(1000 * 60, Math.min(ttlMs, 1000 * 60 * 60 * 24));
  authSessionMigrationSeeds.set(trimmedSessionId, { seed: filteredSeed, expiresAtMs });
};

const resolveAnonymousPrincipal = (): AuthPrincipal => ({
  actorType: "anonymous",
  actorId: null,
  organizationId: null,
  roleKeys: [],
});

const resolveUserPrincipalFromSeed = (seed: AuthPrincipalSeed | undefined): AuthPrincipal => {
  if (seed === undefined || typeof seed.actorId !== "string" || seed.actorId.trim().length === 0) {
    return resolveAnonymousPrincipal();
  }

  return {
    actorType: "user",
    actorId: seed.actorId.trim(),
    organizationId: seed.organizationId?.trim() ? seed.organizationId.trim() : null,
    roleKeys: seed.roleKeys?.filter((role): role is string => typeof role === "string" && role.trim().length > 0) ?? [],
  };
};

/**
 * Resolves the request auth session from Elysia's cookie context.
 *
 * @param cookie Elysia cookie bag for the current request.
 * @returns Anonymous session state derived from the session cookie.
 */
export const resolveAuthSession = (
  cookie: AuthCookieBag,
  principalSeed?: AuthPrincipalSeed,
): AuthSession => {
  const cachedSession = authSessionCache.get(cookie);
  if (cachedSession !== undefined && principalSeed === undefined) {
    return cachedSession;
  }

  const existingSessionId = readSessionId(cookie);
  const migrationSeed = principalSeed === undefined ? resolveAuthMigrationSeed(cookie) : undefined;
  const authSession: AuthSession = {
    sessionId: existingSessionId ?? createAnonymousSessionId(),
    hasSession: existingSessionId !== null,
    principal: resolveUserPrincipalFromSeed(principalSeed ?? migrationSeed),
  };

  if (principalSeed === undefined) {
    authSessionCache.set(cookie, authSession);
  }

  return authSession;
};

/**
 * Resolves canonical request-scoped auth context from Elysia's cookie bag.
 *
 * @param cookie Elysia cookie bag for the current request.
 * @returns Session identity and existing-session state for request handlers.
 */
export const resolveAuthRequestContext = (
  cookie: AuthCookieBag,
  principalSeed?: AuthPrincipalSeed,
): AuthRequestContext => {
  const authSession = resolveAuthSession(cookie, principalSeed);
  const principal = authSession.principal;

  return {
    authSessionId: authSession.sessionId,
    authHasSession: authSession.hasSession,
    authPrincipalType: principal.actorType,
    authPrincipalUserId: principal.actorId,
    authPrincipalOrganizationId: principal.organizationId,
    authPrincipalRoleKeys: principal.roleKeys,
  };
};

/**
 * Shared auth-session guard used by page and API route trees.
 */
export const authSessionGuard: {
  cookie: typeof authSessionCookieSchema;
  beforeHandle: ({ cookie }: { cookie: AuthCookieBag }) => void;
} = {
  cookie: authSessionCookieSchema,
  beforeHandle: ({ cookie }: { cookie: AuthCookieBag }) => {
    const authSession = resolveAuthSession(cookie);
    const sessionCookie = cookie[appConfig.auth.sessionCookieName];
    sessionCookie?.set({
      value: authSession.sessionId,
      ...sessionCookieOptions,
    });
  },
};

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
      authPrincipalType: context.authPrincipalType,
      authPrincipalUserId: context.authPrincipalUserId,
      authPrincipalOrganizationId: context.authPrincipalOrganizationId,
      authPrincipalRoleKeys: context.authPrincipalRoleKeys,
    };
  },
);

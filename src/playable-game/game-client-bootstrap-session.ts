import { GAME_SESSION_STORAGE_KEY } from "../shared/contracts/game.ts";
import {
  type GameClientBootstrapData,
  type GameClientRuntimeConfig,
  parseGameClientBootstrap,
} from "../shared/contracts/game-client-bootstrap.ts";
import { readLocalStorage, writeLocalStorage } from "../shared/utils/browser-storage.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";
import type { PersistedSessionMeta } from "./game-client-types.ts";

const SESSION_META_KEY = GAME_SESSION_STORAGE_KEY;
const CLOCK_SKEW_TOLERANCE_MS = 5_000;

const resolveDocumentLocale = (): string => {
  const documentLocale = document.documentElement.lang.trim();
  if (documentLocale.length > 0) {
    return documentLocale;
  }

  const browserLocale =
    navigator.languages.find((locale) => locale.trim().length > 0) ?? navigator.language;
  return browserLocale.trim();
};

/**
 * Returns `true` when a resume token is already expired or close enough to expiry that the client
 * should treat it as stale.
 */
export const isResumeTokenExpiredSoon = (expiresAtMs: number, now: number = Date.now()): boolean =>
  expiresAtMs <= now + CLOCK_SKEW_TOLERANCE_MS;

/**
 * Reads and validates the SSR bootstrap payload used by the playable browser runtime.
 */
export const readGameClientBootstrap = (): GameClientBootstrapData | null => {
  const bootstrapScript = document.getElementById("game-client-bootstrap");
  if (!(bootstrapScript instanceof HTMLScriptElement)) {
    return null;
  }

  const bootstrap = parseGameClientBootstrap(
    safeJsonParse<unknown>(bootstrapScript.textContent, null),
  );
  if (!bootstrap) {
    return null;
  }

  return {
    session: bootstrap.session,
    runtime: {
      ...bootstrap.runtime,
      restoreRequestTimeoutMs: Math.min(
        bootstrap.runtime.restoreRequestTimeoutMs,
        bootstrap.runtime.commandTtlMs,
      ),
    },
  };
};

/**
 * Merges the bootstrap session payload with a persisted local session snapshot when the stored data
 * still matches the active session and remains within the restore window.
 */
export const mergeStoredSessionMeta = (
  bootstrap: GameClientBootstrapData,
  runtimeConfig: GameClientRuntimeConfig,
  stored: PersistedSessionMeta | null,
  now: number = Date.now(),
): PersistedSessionMeta => {
  const runtimeMeta: PersistedSessionMeta = {
    sessionId: bootstrap.session.sessionId,
    participantSessionId: bootstrap.session.participantSessionId,
    resumeToken: bootstrap.session.resumeToken,
    locale: bootstrap.session.locale || resolveDocumentLocale(),
    participantRole: bootstrap.session.participantRole,
    commandQueueDepth: bootstrap.session.commandQueueDepth,
    version: bootstrap.session.version,
    expiresAtMs: bootstrap.session.resumeTokenExpiresAtMs || now + runtimeConfig.commandTtlMs,
  };

  if (
    stored !== null &&
    stored.sessionId === runtimeMeta.sessionId &&
    stored.participantSessionId.length > 0 &&
    stored.locale.length > 0 &&
    stored.resumeToken.length > 0 &&
    Number.isFinite(stored.expiresAtMs) &&
    stored.expiresAtMs > now - CLOCK_SKEW_TOLERANCE_MS
  ) {
    return {
      ...runtimeMeta,
      resumeToken: stored.resumeToken,
      commandQueueDepth: stored.commandQueueDepth,
      version: stored.version,
      locale: stored.locale,
      expiresAtMs: stored.expiresAtMs,
      participantSessionId: stored.participantSessionId,
      participantRole:
        stored.participantRole === "spectator" || stored.participantRole === "controller"
          ? stored.participantRole
          : runtimeMeta.participantRole,
    };
  }

  return runtimeMeta;
};

/**
 * Normalizes a runtime session snapshot before it is written to local storage.
 */
export const createStoredSessionMeta = (
  meta: PersistedSessionMeta,
  runtimeConfig: GameClientRuntimeConfig,
  now: number = Date.now(),
): PersistedSessionMeta => ({
  ...meta,
  expiresAtMs: Math.max(meta.expiresAtMs, now + runtimeConfig.commandTtlMs),
});

/**
 * Reads the current runtime session metadata, using persisted state when available and still valid.
 */
export const readSessionMeta = (
  bootstrap: GameClientBootstrapData,
  runtimeConfig: GameClientRuntimeConfig,
): PersistedSessionMeta => {
  const storedRaw = readLocalStorage(SESSION_META_KEY);
  const stored = storedRaw ? safeJsonParse<PersistedSessionMeta | null>(storedRaw, null) : null;
  return mergeStoredSessionMeta(bootstrap, runtimeConfig, stored);
};

/**
 * Persists the latest runtime session metadata for future reconnect and restore attempts.
 */
export const persistSessionMeta = (
  meta: PersistedSessionMeta,
  runtimeConfig: GameClientRuntimeConfig,
): void => {
  writeLocalStorage(SESSION_META_KEY, JSON.stringify(createStoredSessionMeta(meta, runtimeConfig)));
};

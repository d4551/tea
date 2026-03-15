import { isRecord } from "../utils/safe-json.ts";
import type { GameSessionParticipantRole } from "./game.ts";

/**
 * Runtime renderer preference supported by the playable client.
 */
export type GameClientRendererPreference = "webgpu" | "webgl";

/**
 * Browser runtime configuration for the playable client.
 */
export interface GameClientRuntimeConfig {
  /** Interval between command queue flush attempts. */
  readonly commandSendIntervalMs: number;
  /** Maximum time a queued command remains valid. */
  readonly commandTtlMs: number;
  /** Delay before reconnect attempts after socket loss. */
  readonly socketReconnectDelayMs: number;
  /** Timeout for session-restore HTTP requests. */
  readonly restoreRequestTimeoutMs: number;
  /** Maximum number of restore attempts before giving up. */
  readonly restoreMaxAttempts: number;
  /** Preferred renderer backend for the browser runtime. */
  readonly rendererPreference: GameClientRendererPreference;
}

/**
 * Session-scoped bootstrap data emitted into the SSR game page.
 */
export interface GameClientSessionBootstrap {
  /** Stable game session identifier. */
  readonly sessionId: string;
  /** Stable participant session identifier. */
  readonly participantSessionId: string;
  /** Signed resume token for restore and websocket lanes. */
  readonly resumeToken: string;
  /** Active locale for this runtime session. */
  readonly locale: string;
  /** Resume token expiry in epoch milliseconds. */
  readonly resumeTokenExpiresAtMs: number;
  /** Current queued command depth for optimistic client state. */
  readonly commandQueueDepth: number;
  /** Current session version. */
  readonly version: number;
  /** Role of the current participant. */
  readonly participantRole: GameSessionParticipantRole;
}

/**
 * Canonical SSR-to-runtime bootstrap contract for the playable client.
 */
export interface GameClientBootstrapData {
  /** Session metadata required for restore and realtime lanes. */
  readonly session: GameClientSessionBootstrap;
  /** Runtime transport and renderer configuration. */
  readonly runtime: GameClientRuntimeConfig;
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isParticipantRole = (value: unknown): value is GameSessionParticipantRole =>
  value === "owner" || value === "controller" || value === "spectator";

/**
 * Parses an unknown bootstrap payload into the canonical playable-client contract.
 *
 * @param value Unknown bootstrap payload.
 * @returns Typed bootstrap contract or null when invalid.
 */
export const parseGameClientBootstrap = (value: unknown): GameClientBootstrapData | null => {
  if (!isRecord(value) || !isRecord(value.session) || !isRecord(value.runtime)) {
    return null;
  }

  const session = value.session;
  const runtime = value.runtime;
  if (
    !isNonEmptyString(session.sessionId) ||
    !isNonEmptyString(session.participantSessionId) ||
    !isNonEmptyString(session.resumeToken) ||
    !isNonEmptyString(session.locale) ||
    !isPositiveInteger(session.resumeTokenExpiresAtMs) ||
    !isNonNegativeInteger(session.commandQueueDepth) ||
    !isPositiveInteger(session.version) ||
    !isParticipantRole(session.participantRole) ||
    !isPositiveInteger(runtime.commandSendIntervalMs) ||
    !isPositiveInteger(runtime.commandTtlMs) ||
    !isPositiveInteger(runtime.socketReconnectDelayMs) ||
    !isPositiveInteger(runtime.restoreRequestTimeoutMs) ||
    !isPositiveInteger(runtime.restoreMaxAttempts) ||
    (runtime.rendererPreference !== "webgpu" && runtime.rendererPreference !== "webgl")
  ) {
    return null;
  }

  return {
    session: {
      sessionId: session.sessionId,
      participantSessionId: session.participantSessionId,
      resumeToken: session.resumeToken,
      locale: session.locale,
      resumeTokenExpiresAtMs: session.resumeTokenExpiresAtMs,
      commandQueueDepth: session.commandQueueDepth,
      version: session.version,
      participantRole: session.participantRole,
    },
    runtime: {
      commandSendIntervalMs: runtime.commandSendIntervalMs,
      commandTtlMs: runtime.commandTtlMs,
      socketReconnectDelayMs: runtime.socketReconnectDelayMs,
      restoreRequestTimeoutMs: runtime.restoreRequestTimeoutMs,
      restoreMaxAttempts: runtime.restoreMaxAttempts,
      rendererPreference: runtime.rendererPreference,
    },
  };
};

/**
 * Serializes bootstrap data for safe embedding in an inline JSON script tag.
 *
 * @param value Bootstrap payload.
 * @returns Script-safe JSON string.
 */
export const serializeGameClientBootstrap = (value: GameClientBootstrapData): string =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

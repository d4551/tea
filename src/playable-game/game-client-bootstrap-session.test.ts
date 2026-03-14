import { describe, expect, test } from "bun:test";
import type { GameClientBootstrapData } from "../shared/contracts/game-client-bootstrap.ts";
import {
  createStoredSessionMeta,
  isResumeTokenExpiredSoon,
  mergeStoredSessionMeta,
} from "./game-client-bootstrap-session.ts";
import type { PersistedSessionMeta } from "./game-client-types.ts";

const bootstrap: GameClientBootstrapData = {
  session: {
    sessionId: "session-1",
    participantSessionId: "participant-1",
    resumeToken: "token-bootstrap",
    locale: "en-US",
    resumeTokenExpiresAtMs: 1_700_000_000_000,
    commandQueueDepth: 2,
    version: 3,
    participantRole: "owner",
  },
  runtime: {
    commandSendIntervalMs: 500,
    commandTtlMs: 5_000,
    socketReconnectDelayMs: 1_000,
    restoreRequestTimeoutMs: 2_000,
    restoreMaxAttempts: 3,
    rendererPreference: "webgpu",
  },
};

describe("game client bootstrap session helpers", () => {
  test("prefers matching persisted session metadata while the token remains valid", () => {
    const now = 1_700_000_000_000;
    const stored: PersistedSessionMeta = {
      sessionId: bootstrap.session.sessionId,
      participantSessionId: "participant-restored",
      resumeToken: "token-stored",
      locale: "zh-HK",
      participantRole: "controller",
      commandQueueDepth: 5,
      version: 7,
      expiresAtMs: now + 2_500,
    };

    const merged = mergeStoredSessionMeta(bootstrap, bootstrap.runtime, stored, now);

    expect(merged.resumeToken).toBe("token-stored");
    expect(merged.participantSessionId).toBe("participant-restored");
    expect(merged.locale).toBe("zh-HK");
    expect(merged.commandQueueDepth).toBe(5);
    expect(merged.version).toBe(7);
    expect(merged.participantRole).toBe("controller");
  });

  test("falls back to bootstrap metadata when persisted data is stale", () => {
    const now = 1_700_000_000_000;
    const stored: PersistedSessionMeta = {
      sessionId: bootstrap.session.sessionId,
      participantSessionId: "participant-restored",
      resumeToken: "token-stored",
      locale: "zh-HK",
      participantRole: "spectator",
      commandQueueDepth: 5,
      version: 7,
      expiresAtMs: now - 6_000,
    };

    const merged = mergeStoredSessionMeta(bootstrap, bootstrap.runtime, stored, now);

    expect(merged.resumeToken).toBe(bootstrap.session.resumeToken);
    expect(merged.participantSessionId).toBe(bootstrap.session.participantSessionId);
    expect(merged.locale).toBe(bootstrap.session.locale);
    expect(merged.commandQueueDepth).toBe(bootstrap.session.commandQueueDepth);
    expect(merged.version).toBe(bootstrap.session.version);
    expect(merged.participantRole).toBe(bootstrap.session.participantRole);
  });

  test("isResumeTokenExpiredSoon returns true when token expires within clock skew tolerance", () => {
    const now = 1_700_000_000_000;
    expect(isResumeTokenExpiredSoon(now + 2_000, now)).toBe(true);
    expect(isResumeTokenExpiredSoon(now + 1, now)).toBe(true);
    expect(isResumeTokenExpiredSoon(now, now)).toBe(true);
    expect(isResumeTokenExpiredSoon(now - 1, now)).toBe(true);
  });

  test("isResumeTokenExpiredSoon returns false when token expires well in the future", () => {
    const now = 1_700_000_000_000;
    expect(isResumeTokenExpiredSoon(now + 10_000, now)).toBe(false);
    expect(isResumeTokenExpiredSoon(now + 60_000, now)).toBe(false);
  });

  test("isResumeTokenExpiredSoon uses Date.now when now is omitted", () => {
    const futureExpiry = Date.now() + 60_000;
    expect(isResumeTokenExpiredSoon(futureExpiry)).toBe(false);
    const pastExpiry = Date.now() - 1_000;
    expect(isResumeTokenExpiredSoon(pastExpiry)).toBe(true);
  });

  test("extends persisted expiry to at least one command ttl window", () => {
    const now = 1_700_000_000_000;
    const stored = createStoredSessionMeta(
      {
        sessionId: bootstrap.session.sessionId,
        participantSessionId: bootstrap.session.participantSessionId,
        resumeToken: bootstrap.session.resumeToken,
        locale: bootstrap.session.locale,
        participantRole: bootstrap.session.participantRole,
        commandQueueDepth: bootstrap.session.commandQueueDepth,
        version: bootstrap.session.version,
        expiresAtMs: now,
      },
      bootstrap.runtime,
      now,
    );

    expect(stored.expiresAtMs).toBe(now + bootstrap.runtime.commandTtlMs);
  });
});

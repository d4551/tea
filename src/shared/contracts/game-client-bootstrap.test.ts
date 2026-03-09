import { describe, expect, test } from "bun:test";
import {
  type GameClientBootstrapData,
  parseGameClientBootstrap,
  serializeGameClientBootstrap,
} from "./game-client-bootstrap.ts";

describe("game client bootstrap contract", () => {
  test("round-trips a valid bootstrap payload", () => {
    const payload: GameClientBootstrapData = {
      session: {
        sessionId: "session-1",
        participantSessionId: "participant-1",
        resumeToken: "token-1",
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

    const serialized = serializeGameClientBootstrap(payload);
    const parsed = parseGameClientBootstrap(JSON.parse(serialized));

    expect(parsed).toEqual(payload);
  });

  test("rejects invalid participant roles", () => {
    const parsed = parseGameClientBootstrap({
      session: {
        sessionId: "session-1",
        participantSessionId: "participant-1",
        resumeToken: "token-1",
        locale: "en-US",
        resumeTokenExpiresAtMs: 1_700_000_000_000,
        commandQueueDepth: 0,
        version: 1,
        participantRole: "invalid",
      },
      runtime: {
        commandSendIntervalMs: 500,
        commandTtlMs: 5_000,
        socketReconnectDelayMs: 1_000,
        restoreRequestTimeoutMs: 2_000,
        restoreMaxAttempts: 3,
        rendererPreference: "webgl",
      },
    });

    expect(parsed).toBeNull();
  });
});

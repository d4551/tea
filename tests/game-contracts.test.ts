import { describe, expect, test } from "bun:test";
import { appConfig } from "../src/config/environment.ts";
import { buildSessionSceneState } from "../src/domain/game/utils/session-state.ts";
import { resolveGameWebSocketContext } from "../src/plugins/game-request-context.ts";
import { defaultGameConfig, resolveScene } from "../src/shared/config/game-config.ts";
import {
  validateGameRealtimeFrame,
  validateGameSceneState,
  validateTriggerDefinitions,
} from "../src/shared/contracts/game.ts";

const createBaselineSceneState = () => {
  const sceneDefinition = resolveScene(defaultGameConfig.defaultSceneId);
  if (!sceneDefinition) {
    throw new Error("Expected default scene definition to exist.");
  }

  return buildSessionSceneState(sceneDefinition, "en-US", 7);
};

describe("game shared contracts", () => {
  test("scene-state validator accepts baseline runtime state", () => {
    const state = createBaselineSceneState();

    const validation = validateGameSceneState(state);

    expect(validation.ok).toBe(true);
    if (!validation.ok) {
      return;
    }
    expect(validation.data.sceneId).toBe(state.sceneId);
  });

  test("scene-state validator accepts projected multiplayer presence", () => {
    const state = createBaselineSceneState();
    const participantRole: "controller" = "controller";
    const projectedState = {
      ...state,
      coPlayers: [
        {
          sessionId: "participant-1",
          role: participantRole,
          entity: {
            ...state.player,
            id: "participant-participant-1",
            label: "participant-1",
            characterKey: "riverPilot",
          },
        },
      ],
    };

    const validation = validateGameSceneState(projectedState);

    expect(validation.ok).toBe(true);
  });

  test("scene-state validator rejects malformed NPC runtime state", () => {
    const state = createBaselineSceneState();
    const malformedState = {
      ...state,
      npcs: [
        {
          ...state.npcs[0],
          dialogueEntries: "not-an-array",
        },
      ],
    };

    const validation = validateGameSceneState(malformedState);

    expect(validation.ok).toBe(false);
  });

  test("realtime-frame validator accepts canonical socket frames", () => {
    const state = createBaselineSceneState();

    const validation = validateGameRealtimeFrame({
      state,
      commandQueueDepth: 2,
      resumeToken: "token-123",
      resumeTokenExpiresAtMs: Date.now() + 1000,
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) {
      return;
    }
    expect(validation.data.state?.sceneId).toBe(state.sceneId);
  });

  test("realtime-frame validator rejects malformed socket payloads", () => {
    const validation = validateGameRealtimeFrame({
      state: { sceneId: "tea-house" },
      commandQueueDepth: -1,
    });

    expect(validation.ok).toBe(false);
  });

  test("trigger-definition validator rejects invalid trigger events", () => {
    const validation = validateTriggerDefinitions([
      {
        id: "trigger.invalid",
        label: "Invalid trigger",
        event: "teleport",
      },
    ]);

    expect(validation.ok).toBe(false);
  });

  test("websocket context resolver reads canonical participant id and resume token", () => {
    const context = resolveGameWebSocketContext({
      cookie: {
        [appConfig.auth.sessionCookieName]: {
          value: "participant-42",
        },
      },
      query: {
        resumeToken: "resume-token-123",
      },
    });

    expect(context.gameParticipantSessionId).toBe("participant-42");
    expect(context.gameResumeToken).toBe("resume-token-123");
  });

  test("websocket context resolver trims token arrays and falls back to anonymous session ids", () => {
    const context = resolveGameWebSocketContext({
      cookie: null,
      query: {
        resumeToken: ["", "  resume-token-456  "],
      },
    });

    expect(context.gameParticipantSessionId?.length).toBeGreaterThan(0);
    expect(context.gameResumeToken).toBe("resume-token-456");
  });
});

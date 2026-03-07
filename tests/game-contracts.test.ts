import { describe, expect, test } from "bun:test";
import { buildSessionSceneState } from "../src/domain/game/utils/session-state.ts";
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
});

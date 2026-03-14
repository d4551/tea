import { describe, expect, it } from "bun:test";
import type { CutsceneDefinition, CutscenePlaybackState } from "../../../shared/contracts/game.ts";
import { CutsceneEngine } from "../cutscene-engine.ts";

describe("CutsceneEngine", () => {
  const engine = new CutsceneEngine();

  const mockCutscene: CutsceneDefinition = {
    id: "test-cutscene",
    label: "Test Cutscene",
    skippable: true,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
    steps: [
      {
        id: "step1",
        ordinal: 0,
        action: "camera_pan",
        durationMs: 1000,
      },
      {
        id: "step2",
        ordinal: 1,
        action: "dialogue",
        durationMs: 0,
        speakerKey: "narrator",
        dialogueKey: "intro_text",
      },
      {
        id: "step3",
        ordinal: 2,
        action: "wait",
        durationMs: 500,
      },
    ],
  };

  const unskippableCutscene: CutsceneDefinition = {
    ...mockCutscene,
    skippable: false,
  };

  it("initializes cutscene playback state correctly", () => {
    const playback = engine.startCutscene("test-cutscene");
    expect(playback.cutsceneId).toBe("test-cutscene");
    expect(playback.currentStepIndex).toBe(0);
    expect(playback.stepElapsedMs).toBe(0);
    expect(playback.phase).toBe("playing");
  });

  it("advances duration-based steps automatically", () => {
    const playback = engine.startCutscene("test-cutscene");

    // First tick, halfway through duration
    let result = engine.executeTick(playback, mockCutscene, 500);
    expect(result.type).toBe("playing");
    expect(result.state.currentStepIndex).toBe(0);
    expect(result.state.stepElapsedMs).toBe(500);

    // Second tick, duration surpassed -> auto advance
    result = engine.executeTick(result.state, mockCutscene, 600);
    expect(result.type).toBe("playing"); // It advanced to next step, so it is "playing" the new step
    expect(result.state.currentStepIndex).toBe(1);
    expect(result.state.stepElapsedMs).toBe(0);
  });

  it("waits for input on dialogue steps", () => {
    // Jump straight to dialogue step
    const playback: CutscenePlaybackState = {
      cutsceneId: "test-cutscene",
      currentStepIndex: 1,
      stepElapsedMs: 0,
      phase: "playing",
    };

    const result = engine.executeTick(playback, mockCutscene, 100);
    expect(result.type).toBe("waiting_for_input");
    expect(result.state.currentStepIndex).toBe(1);
    expect(result.state.phase).toBe("waiting_for_input");
  });

  it("advances dialogue steps on input", () => {
    const playback: CutscenePlaybackState = {
      cutsceneId: "test-cutscene",
      currentStepIndex: 1,
      stepElapsedMs: 0,
      phase: "waiting_for_input",
    };

    const result = engine.handleInput(playback, mockCutscene);
    expect(result.type).toBe("playing");
    expect(result.state.currentStepIndex).toBe(2);
    expect(result.state.stepElapsedMs).toBe(0);
  });

  it("does not wait for input on non-dialogue sound steps", () => {
    const playback: CutscenePlaybackState = {
      cutsceneId: "test-cutscene",
      currentStepIndex: 0,
      stepElapsedMs: 0,
      phase: "playing",
    };
    const soundOnlyCutscene: CutsceneDefinition = {
      ...mockCutscene,
      steps: [
        {
          id: "sound-step",
          ordinal: 0,
          action: "play_sound",
          durationMs: 250,
          soundAssetId: "audio-1",
        },
      ],
    };

    const result = engine.executeTick(playback, soundOnlyCutscene, 1);
    expect(result.type).toBe("playing");
    expect(result.state.currentStepIndex).toBe(0);
    expect(result.state.stepElapsedMs).toBe(1);
  });

  it("auto-advances sound steps with implicit fallback duration", () => {
    const playback: CutscenePlaybackState = {
      cutsceneId: "test-cutscene",
      currentStepIndex: 0,
      stepElapsedMs: 0,
      phase: "playing",
    };
    const noDurationSoundCutscene: CutsceneDefinition = {
      ...mockCutscene,
      steps: [
        {
          id: "sound-step",
          ordinal: 0,
          action: "play_sound",
          durationMs: 0,
          soundAssetId: "audio-1",
        },
      ],
    };

    const result = engine.executeTick(playback, noDurationSoundCutscene, 300);
    expect(result.type).toBe("completed");
    expect(result.state.currentStepIndex).toBe(0);
    expect(result.state.phase).toBe("completed");
  });

  it("completes cutscene after last step", () => {
    const playback: CutscenePlaybackState = {
      cutsceneId: "test-cutscene",
      currentStepIndex: 2,
      stepElapsedMs: 0,
      phase: "playing",
    };

    const result = engine.executeTick(playback, mockCutscene, 600);
    expect(result.type).toBe("completed");
    expect(result.state.phase).toBe("completed");
  });

  it("skips skippable cutscenes", () => {
    const playback = engine.startCutscene("test-cutscene");
    const result = engine.skipCutscene(playback, mockCutscene);
    expect(result.type).toBe("skipped");
    expect(result.state.phase).toBe("skipped");
  });

  it("does not skip unskippable cutscenes", () => {
    const playback = engine.startCutscene("test-cutscene");
    const result = engine.skipCutscene(playback, unskippableCutscene);
    expect(result.type).toBe("playing"); // retains previous phase
    expect(result.state.phase).toBe("playing");
  });
});

import type {
  CutsceneActionType,
  CutsceneDefinition,
  CutscenePlaybackState,
  CutsceneStep,
  Vector2,
} from "../../shared/contracts/game.ts";

/**
 * Result of advancing a cutscene step.
 */
export type CutsceneTickResult =
  | { type: "playing"; state: CutscenePlaybackState }
  | { type: "waiting_for_input"; state: CutscenePlaybackState }
  | { type: "completed"; state: CutscenePlaybackState }
  | { type: "skipped"; state: CutscenePlaybackState };

/**
 * CutsceneEngine governs the playback of authored cutscenes within the game loop.
 * It tracks duration-based steps (pan, wait) and input-based steps (dialogue).
 */
export class CutsceneEngine {
  /**
   * Initializes a new cutscene playback state.
   */
  public startCutscene(cutsceneId: string): CutscenePlaybackState {
    return {
      cutsceneId,
      currentStepIndex: 0,
      stepElapsedMs: 0,
      phase: "playing",
    };
  }

  /**
   * Processes a single tick of the cutscene playback.
   */
  public executeTick(
    playback: CutscenePlaybackState,
    definition: CutsceneDefinition,
    deltaMs: number,
  ): CutsceneTickResult {
    if (playback.phase === "completed" || playback.phase === "skipped") {
      return { type: playback.phase, state: playback };
    }

    if (playback.phase === "waiting_for_input") {
      return { type: "waiting_for_input", state: playback };
    }

    const currentStep = definition.steps[playback.currentStepIndex];
    if (!currentStep) {
      // Out of bounds means we finished
      return {
        type: "completed",
        state: { ...playback, phase: "completed" },
      };
    }

    const nextElapsed = playback.stepElapsedMs + deltaMs;
    const requiresInput = this.stepRequiresInput(currentStep);

    // If the step is bounded by duration
    if (currentStep.durationMs && currentStep.durationMs > 0) {
      if (nextElapsed >= currentStep.durationMs) {
        if (requiresInput) {
          // Duration elapsed but still requires input to proceed (e.g. dialogue finished printing but user must press A)
          return {
            type: "waiting_for_input",
            state: {
              ...playback,
              stepElapsedMs: currentStep.durationMs,
              phase: "waiting_for_input",
            },
          };
        } else {
          // Auto-advance to next step
          return this.advanceToNextStep(playback, definition);
        }
      }
    } else if (requiresInput) {
      // Step doesn't have a specific duration but requires input immediately
      return {
        type: "waiting_for_input",
        state: { ...playback, stepElapsedMs: nextElapsed, phase: "waiting_for_input" },
      };
    } else {
      // Zero-duration automatic step, advances instantly
      return this.advanceToNextStep(playback, definition);
    }

    // Still playing current step
    return {
      type: "playing",
      state: { ...playback, stepElapsedMs: nextElapsed },
    };
  }

  /**
   * Responds to player input to advance the cutscene (e.g., dismissing dialogue).
   */
  public handleInput(
    playback: CutscenePlaybackState,
    definition: CutsceneDefinition,
  ): CutsceneTickResult {
    if (playback.phase === "completed" || playback.phase === "skipped") {
      return { type: playback.phase, state: playback };
    }

    // Input always tries to advance. If playing, it might skip dialogue text crawl.
    // In our engine, we will simplify: input instantly resolves the current step and advances.
    return this.advanceToNextStep(playback, definition);
  }

  /**
   * Skips the cutscene entirely if allowed.
   */
  public skipCutscene(
    playback: CutscenePlaybackState,
    definition: CutsceneDefinition,
  ): CutsceneTickResult {
    if (!definition.skippable) {
      return { type: playback.phase, state: playback };
    }

    return {
      type: "skipped",
      state: { ...playback, phase: "skipped" },
    };
  }

  private advanceToNextStep(
    playback: CutscenePlaybackState,
    definition: CutsceneDefinition,
  ): CutsceneTickResult {
    const nextIndex = playback.currentStepIndex + 1;
    if (nextIndex >= definition.steps.length) {
      return {
        type: "completed",
        state: { ...playback, phase: "completed" },
      };
    }

    return {
      type: "playing",
      state: {
        ...playback,
        currentStepIndex: nextIndex,
        stepElapsedMs: 0,
        phase: "playing",
      },
    };
  }

  private stepRequiresInput(step: CutsceneStep): boolean {
    // Dialogue always requires input to dismiss.
    return step.action === "dialogue";
  }
}

export const cutsceneEngine = new CutsceneEngine();

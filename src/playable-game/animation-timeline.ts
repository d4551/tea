import type { SpriteAnimationConfig } from "../shared/contracts/game.ts";

/**
 * Drives AnimatedSprite frame index and animationSpeed from SpriteAnimationConfig
 * and deterministic worldTimeMs. Used for replay-safe, server-authoritative animation.
 */
export class AnimationTimeline {
  constructor(private readonly config: SpriteAnimationConfig) {}

  /** Frames per second for AnimatedSprite.animationSpeed. */
  get animationSpeed(): number {
    return this.config.speed;
  }

  /** Number of frames in this animation. */
  get frameCount(): number {
    return this.config.frames;
  }

  /**
   * Computes the current frame index from worldTimeMs.
   * Deterministic: same worldTimeMs always yields same frame.
   */
  getFrameIndex(worldTimeMs: number): number {
    if (this.config.frames <= 1) {
      return 0;
    }
    const framesElapsed = Math.floor((worldTimeMs / 1000) * this.config.speed);
    return framesElapsed % this.config.frames;
  }
}

import type {
  AnimationKeyframe,
  AnimationTimeline,
  AnimationTrack,
} from "../../shared/contracts/game.ts";

/**
 * Result of evaluating an animation timeline at a specific point in time.
 * Maps property paths (e.g., "position.y", "opacity") to their numeric values.
 */
export type AnimationPlaybackState = Record<string, number>;

/**
 * Service for evaluating animation timelines.
 * Calculates interpolated values for all tracks based on elapsed playback time.
 */
export class AnimationTimelineService {
  /**
   * Evaluates an animation timeline at a specific elapsed time in milliseconds.
   *
   * @param timeline The animation timeline to evaluate.
   * @param elapsedMs The total elapsed playback time for this timeline instance.
   * @returns A record mapping animated properties to their current numeric values.
   */
  public evaluate(timeline: AnimationTimeline, elapsedMs: number): AnimationPlaybackState {
    const state: AnimationPlaybackState = {};
    if (timeline.durationMs <= 0 || timeline.tracks.length === 0) {
      return state;
    }

    // Determine the normalized time within the timeline's duration
    const t = timeline.loop
      ? elapsedMs % timeline.durationMs
      : Math.min(elapsedMs, timeline.durationMs);

    for (const track of timeline.tracks) {
      if (track.keyframes.length === 0) {
        continue;
      }
      state[track.property] = this.evaluateTrack(track, t);
    }

    return state;
  }

  /**
   * Evaluates a single animation track at normalized time t.
   */
  private evaluateTrack(track: AnimationTrack, t: number): number {
    const keyframes = track.keyframes;

    // Fast paths - use optional chaining with fallbacks to avoid non-null assertions
    const firstKeyframe = keyframes[0];
    if (!firstKeyframe) {
      return 0;
    }

    if (keyframes.length === 1) {
      return firstKeyframe.value;
    }
    if (t <= firstKeyframe.timeMs) {
      return firstKeyframe.value;
    }

    const lastKeyframe = keyframes[keyframes.length - 1];
    if (lastKeyframe && t >= lastKeyframe.timeMs) {
      return lastKeyframe.value;
    }

    // Find bounding keyframes - initialize with first two keyframes as defaults
    const secondKeyframe = keyframes[1];
    let k1: AnimationKeyframe = firstKeyframe;
    let k2: AnimationKeyframe = secondKeyframe ?? firstKeyframe;

    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i];
      const next = keyframes[i + 1];
      if (current && next && t >= current.timeMs && t <= next.timeMs) {
        k1 = current;
        k2 = next;
        break;
      }
    }

    // Avoid division by zero if keyframes share the exact same time
    const duration = k2.timeMs - k1.timeMs;
    if (duration === 0) {
      return k2.value;
    }

    const progress = (t - k1.timeMs) / duration;
    return this.interpolate(k1.value, k2.value, progress, k1.easing);
  }

  /**
   * Interpolates between two values based on a standard easing string and a progress alpha [0, 1].
   */
  private interpolate(
    start: number,
    end: number,
    alpha: number,
    easing: AnimationKeyframe["easing"],
  ): number {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    const range = end - start;

    switch (easing) {
      case "step":
        // Discrete step occurs at the end of the segment
        return start;
      case "linear":
        return start + range * clampedAlpha;
      case "ease-in":
        // Simple quadratic ease-in
        return start + range * (clampedAlpha * clampedAlpha);
      case "ease-out":
        // Simple quadratic ease-out
        return start + range * (clampedAlpha * (2 - clampedAlpha));
      case "ease-in-out":
        // Simple quadratic ease-in-out
        return clampedAlpha < 0.5
          ? start + range * (2 * clampedAlpha * clampedAlpha)
          : start + range * (-1 + (4 - 2 * clampedAlpha) * clampedAlpha);
      default:
        return start + range * clampedAlpha;
    }
  }
}

/**
 * Singleton instance of the animation timeline service.
 */
export const animationTimelineService = new AnimationTimelineService();

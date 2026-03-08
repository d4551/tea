import { describe, expect, it } from "bun:test";
import type { AnimationTimeline } from "../../../shared/contracts/game.ts";
import { AnimationTimelineService } from "../animation-timeline.ts";

describe("AnimationTimelineService", () => {
  const service = new AnimationTimelineService();

  const makeTimeline = (
    overrides: Partial<AnimationTimeline> = {},
  ): AnimationTimeline => ({
    id: "tl-1",
    assetId: "asset-1",
    label: "Walk Down",
    stateTag: "walk-down",
    sceneMode: "2d",
    durationMs: 1000,
    loop: false,
    tracks: [],
    createdAtMs: 0,
    updatedAtMs: 0,
    ...overrides,
  });

  describe("evaluate", () => {
    it("returns empty state for zero-duration timeline", () => {
      const tl = makeTimeline({ durationMs: 0 });
      const state = service.evaluate(tl, 500);
      expect(Object.keys(state)).toHaveLength(0);
    });

    it("returns empty state for timeline with no tracks", () => {
      const state = service.evaluate(makeTimeline(), 500);
      expect(Object.keys(state)).toHaveLength(0);
    });

    it("returns single keyframe value before its time", () => {
      const tl = makeTimeline({
        tracks: [
          {
            id: "t1",
            property: "opacity",
            keyframes: [{ timeMs: 0, value: 0.5, easing: "linear" }],
          },
        ],
      });
      const state = service.evaluate(tl, 0);
      expect(state.opacity).toBe(0.5);
    });

    it("interpolates linearly between two keyframes", () => {
      const tl = makeTimeline({
        tracks: [
          {
            id: "t1",
            property: "position.y",
            keyframes: [
              { timeMs: 0, value: 0, easing: "linear" },
              { timeMs: 1000, value: 100, easing: "linear" },
            ],
          },
        ],
      });
      const state = service.evaluate(tl, 500);
      expect(state["position.y"]).toBeCloseTo(50, 1);
    });

    it("clamps at last keyframe value when past duration (non-loop)", () => {
      const tl = makeTimeline({
        loop: false,
        tracks: [
          {
            id: "t1",
            property: "frame",
            keyframes: [
              { timeMs: 0, value: 0, easing: "linear" },
              { timeMs: 1000, value: 10, easing: "linear" },
            ],
          },
        ],
      });
      const state = service.evaluate(tl, 2000);
      expect(state.frame).toBe(10);
    });

    it("wraps elapsed time for looping timelines", () => {
      const tl = makeTimeline({
        loop: true,
        tracks: [
          {
            id: "t1",
            property: "frame",
            keyframes: [
              { timeMs: 0, value: 0, easing: "linear" },
              { timeMs: 1000, value: 10, easing: "linear" },
            ],
          },
        ],
      });
      // 1500ms on a 1000ms loop → wraps to 500ms → should be ~5
      const state = service.evaluate(tl, 1500);
      expect(state.frame).toBeCloseTo(5, 1);
    });

    it("uses step easing (returns start value)", () => {
      const tl = makeTimeline({
        tracks: [
          {
            id: "t1",
            property: "frame",
            keyframes: [
              { timeMs: 0, value: 0, easing: "step" },
              { timeMs: 1000, value: 10, easing: "step" },
            ],
          },
        ],
      });
      const state = service.evaluate(tl, 500);
      expect(state.frame).toBe(0);
    });

    it("evaluates multiple tracks simultaneously", () => {
      const tl = makeTimeline({
        tracks: [
          {
            id: "t1",
            property: "position.x",
            keyframes: [
              { timeMs: 0, value: 0, easing: "linear" },
              { timeMs: 1000, value: 100, easing: "linear" },
            ],
          },
          {
            id: "t2",
            property: "opacity",
            keyframes: [
              { timeMs: 0, value: 1, easing: "linear" },
              { timeMs: 1000, value: 0, easing: "linear" },
            ],
          },
        ],
      });
      const state = service.evaluate(tl, 500);
      expect(state["position.x"]).toBeCloseTo(50, 1);
      expect(state.opacity).toBeCloseTo(0.5, 1);
    });

    it("skips tracks with empty keyframes", () => {
      const tl = makeTimeline({
        tracks: [
          { id: "t1", property: "empty", keyframes: [] },
          {
            id: "t2",
            property: "opacity",
            keyframes: [{ timeMs: 0, value: 1, easing: "linear" }],
          },
        ],
      });
      const state = service.evaluate(tl, 0);
      expect(state.empty).toBeUndefined();
      expect(state.opacity).toBe(1);
    });
  });
});

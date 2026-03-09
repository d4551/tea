import { describe, expect, it } from "bun:test";
import type { PackableFrame } from "../sprite-packer.ts";
import { packFrames } from "../sprite-packer.ts";

describe("SpritePacker", () => {
  describe("packFrames", () => {
    it("returns zero dimensions for empty input", () => {
      const result = packFrames([]);
      expect(result.atlasWidth).toBe(0);
      expect(result.atlasHeight).toBe(0);
      expect(result.frames).toHaveLength(0);
    });

    it("packs a single frame at origin", () => {
      const frames: PackableFrame[] = [{ id: "f1", width: 64, height: 64 }];
      const result = packFrames(frames);

      expect(result.atlasWidth).toBe(64);
      expect(result.atlasHeight).toBe(64);
      expect(result.frames).toEqual([{ id: "f1", x: 0, y: 0, width: 64, height: 64 }]);
    });

    it("packs multiple frames in a single row", () => {
      const frames: PackableFrame[] = [
        { id: "a", width: 100, height: 50 },
        { id: "b", width: 100, height: 80 },
        { id: "c", width: 100, height: 60 },
      ];
      const result = packFrames(frames);

      expect(result.atlasWidth).toBe(300);
      expect(result.atlasHeight).toBe(80); // tallest frame
      const getFrame = (id: string) => result.frames.find((f) => f.id === id);
      expect(getFrame("b")).toEqual({ id: "b", x: 0, y: 0, width: 100, height: 80 });
      expect(getFrame("c")).toEqual({ id: "c", x: 100, y: 0, width: 100, height: 60 });
      expect(getFrame("a")).toEqual({ id: "a", x: 200, y: 0, width: 100, height: 50 });
    });

    it("wraps to a new row when exceeding max width", () => {
      const frames: PackableFrame[] = [
        { id: "a", width: 1500, height: 100 },
        { id: "b", width: 1000, height: 80 },
        // Total would be 2500 > 2048, so b wraps
      ];
      const result = packFrames(frames);

      expect(result.frames[0]).toEqual({ id: "a", x: 0, y: 0, width: 1500, height: 100 });
      expect(result.frames[1]).toEqual({ id: "b", x: 0, y: 100, width: 1000, height: 80 });
      expect(result.atlasWidth).toBe(1500);
      expect(result.atlasHeight).toBe(180);
    });

    it("handles frames of varying heights in wrapped rows", () => {
      const frames: PackableFrame[] = [
        { id: "a", width: 1200, height: 200 },
        { id: "b", width: 800, height: 150 },
        // Both fit in row 1 (total 2000 < 2048)
        { id: "c", width: 1400, height: 100 },
        // Needs new row at y=200
        { id: "d", width: 700, height: 300 },
        // Fits in row 2 (total 2100 > 2048) → wraps to row 3
      ];
      const result = packFrames(frames);

      const getFrame = (id: string) => result.frames.find((f) => f.id === id);
      // Sort order: d (300), a (200), b (150), c (100)
      expect(getFrame("d")).toEqual({ id: "d", x: 0, y: 0, width: 700, height: 300 });
      expect(getFrame("a")).toEqual({ id: "a", x: 700, y: 0, width: 1200, height: 200 }); // wraps after this (1900)
      expect(getFrame("b")).toEqual({ id: "b", x: 0, y: 300, width: 800, height: 150 }); // wrapped
      expect(getFrame("c")).toEqual({ id: "c", x: 0, y: 450, width: 1400, height: 100 }); // wrapped again
      expect(result.atlasWidth).toBe(1900);
      expect(result.atlasHeight).toBe(550);
    });
  });
});

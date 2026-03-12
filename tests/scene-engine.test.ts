import { describe, expect, it } from "bun:test";

import { SceneEngine } from "../src/domain/game/scene-engine.ts";
import type { CollisionMask, Direction, NpcState } from "../src/shared/contracts/game.ts";

const engine = new SceneEngine();

const makeCollision = (x: number, y: number, width: number, height: number): CollisionMask => ({
  x,
  y,
  width,
  height,
});

const makeNpc = (
  id: string,
  x: number,
  y: number,
  bounds: CollisionMask = { x: 0, y: 0, width: 32, height: 32 },
): NpcState =>
  ({
    id,
    label: `NPC ${id}`,
    characterKey: "",
    position: { x, y },
    facing: "down",
    animation: "idle",
    frame: 0,
    velocity: { x: 0, y: 0 },
    bounds,
    aiEnabled: false,
    dialogueIndex: 0,
    dialogueLineKeys: [],
    dialogueEntries: [],
    interactRadius: 48,
    homePosition: { x, y },
    aiProfile: {
      wanderRadius: 0,
      wanderSpeed: 0,
      idlePauseMs: [0, 0],
      greetOnApproach: false,
      greetLineKey: "",
    },
    active: false,
    state: "idle",
  });

const downDirection: Direction = "down";
const rightDirection: Direction = "right";

describe("SceneEngine", () => {
  describe("checkStaticCollision", () => {
    it("returns true when bounding box overlaps a collision mask", () => {
      const collisions = [makeCollision(50, 50, 100, 100)];
      expect(engine.checkStaticCollision(60, 60, 32, 32, collisions)).toBe(true);
    });

    it("returns false when bounding box does not overlap", () => {
      const collisions = [makeCollision(50, 50, 100, 100)];
      expect(engine.checkStaticCollision(0, 0, 32, 32, collisions)).toBe(false);
    });

    it("returns false when touching exactly on edge (no overlap)", () => {
      const collisions = [makeCollision(50, 50, 100, 100)];
      // Box ends exactly where collision starts — AABB overlap requires strict inequality
      expect(engine.checkStaticCollision(18, 18, 32, 32, collisions)).toBe(false);
    });

    it("handles empty collision array", () => {
      expect(engine.checkStaticCollision(0, 0, 32, 32, [])).toBe(false);
    });

    it("detects overlap with multiple collision masks", () => {
      const collisions = [makeCollision(100, 100, 50, 50), makeCollision(200, 200, 50, 50)];
      expect(engine.checkStaticCollision(210, 210, 20, 20, collisions)).toBe(true);
    });
  });

  describe("checkNpcCollision", () => {
    it("returns true when entity overlaps an NPC", () => {
      const npcs = [makeNpc("npc1", 100, 100)];
      expect(engine.checkNpcCollision(110, 110, 32, 32, npcs)).toBe(true);
    });

    it("returns false when entity does not overlap any NPC", () => {
      const npcs = [makeNpc("npc1", 100, 100)];
      expect(engine.checkNpcCollision(0, 0, 32, 32, npcs)).toBe(false);
    });

    it("excludes NPC by id when specified", () => {
      const npcs = [makeNpc("npc1", 100, 100)];
      expect(engine.checkNpcCollision(110, 110, 32, 32, npcs, "npc1")).toBe(false);
    });

    it("handles empty NPC array", () => {
      expect(engine.checkNpcCollision(0, 0, 32, 32, [])).toBe(false);
    });
  });

  describe("moveEntity", () => {
    const bounds: CollisionMask = { x: 0, y: 0, width: 32, height: 32 };
    const emptyCollisions: readonly CollisionMask[] = [];
    const emptyNpcs: readonly NpcState[] = [];

    it("moves entity in open space", () => {
      const result = engine.moveEntity(
        { x: 100, y: 100 },
        downDirection,
        bounds,
        { x: 1, y: 0 },
        5,
        emptyCollisions,
        emptyNpcs,
      );
      expect(result.position.x).toBe(105);
      expect(result.position.y).toBe(100);
      expect(result.facing).toBe("right");
      expect(result.moved).toBe(true);
    });

    it("returns unmoved when vector is zero", () => {
      const result = engine.moveEntity(
        { x: 100, y: 100 },
        downDirection,
        bounds,
        { x: 0, y: 0 },
        5,
        emptyCollisions,
        emptyNpcs,
      );
      expect(result.position.x).toBe(100);
      expect(result.position.y).toBe(100);
      expect(result.moved).toBe(false);
    });

    it("blocks movement into a static collision", () => {
      const collisions = [makeCollision(132, 0, 100, 200)];
      const result = engine.moveEntity(
        { x: 100, y: 100 },
        rightDirection,
        bounds,
        { x: 1, y: 0 },
        5,
        collisions,
        emptyNpcs,
      );
      // Tries to go right: blocked on X axis
      // Also tries Y slide but vector Y is 0, so stays put
      expect(result.position.x).toBe(100);
      expect(result.moved).toBe(false);
    });

    it("slides along Y axis when X is blocked", () => {
      const collisions = [makeCollision(132, 0, 100, 200)];
      const result = engine.moveEntity(
        { x: 100, y: 100 },
        rightDirection,
        bounds,
        { x: 1, y: 1 },
        5,
        collisions,
        emptyNpcs,
      );
      // X is blocked but Y should be free
      expect(result.position.y).toBe(105);
      expect(result.moved).toBe(true);
    });

    it("updates facing based on dominant axis", () => {
      const result = engine.moveEntity(
        { x: 100, y: 100 },
        rightDirection,
        bounds,
        { x: 0, y: -1 },
        5,
        emptyCollisions,
        emptyNpcs,
      );
      expect(result.facing).toBe("up");
    });
  });

  describe("findInteractableNpc", () => {
    const playerBounds: CollisionMask = { x: 0, y: 0, width: 32, height: 32 };

    it("finds the closest NPC within radius", () => {
      const npcs = [makeNpc("far", 200, 200), makeNpc("near", 120, 100)];
      const result = engine.findInteractableNpc({ x: 100, y: 100 }, playerBounds, npcs);
      expect(result?.id).toBe("near");
    });

    it("returns null when no NPC is in range", () => {
      const npcs = [makeNpc("far", 500, 500)];
      const result = engine.findInteractableNpc({ x: 0, y: 0 }, playerBounds, npcs);
      expect(result).toBeNull();
    });

    it("handles empty NPC array", () => {
      const result = engine.findInteractableNpc({ x: 0, y: 0 }, playerBounds, []);
      expect(result).toBeNull();
    });

    it("uses custom radius when provided", () => {
      const npcs = [makeNpc("npc1", 200, 200)];
      const result = engine.findInteractableNpc({ x: 100, y: 100 }, playerBounds, npcs, 500);
      expect(result?.id).toBe("npc1");
    });
  });
});

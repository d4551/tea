import { createPrng } from "lotfk-seeded-prng";
import { sceneEngine } from "./scene-engine.ts";
import type { MutableGameSceneState } from "./types.ts";

export class NpcAiEngine {
  /**
   * Updates all active NPCs using a deterministic, stateless PRNG.
   * State transitions are computed functionally based on worldTimeMs and seed.
   */
  public updateNpcs(state: MutableGameSceneState, seed: number, dtMs: number): void {
    for (let i = 0; i < state.npcs.length; i++) {
      const npc = state.npcs[i];
      if (!npc || !npc.aiEnabled) continue;

      // Deterministic PRNG: per-NPC index baked into the seed so each NPC is independent
      const rng = createPrng(seed + i * 1000);

      if (npc.state === "talking") {
        // Maintained externally (by GameLoop upon interact command).
        npc.velocity = { x: 0, y: 0 };
        npc.animation = `idle-${npc.facing}`;
        continue;
      }

      if (npc.state === "face_player") {
        // Forced to look at player; will revert to idle on next cycle unless locked.
        npc.velocity = { x: 0, y: 0 };
        npc.animation = `idle-${npc.facing}`;
        continue;
      }

      // Evaluate greet proximity (simulate greetOnApproach)
      if (npc.aiProfile.greetOnApproach) {
        const px = state.player.position.x + state.player.bounds.x + state.player.bounds.width / 2;
        const py = state.player.position.y + state.player.bounds.y + state.player.bounds.height / 2;
        const nx = npc.position.x + npc.bounds.x + npc.bounds.width / 2;
        const ny = npc.position.y + npc.bounds.y + npc.bounds.height / 2;

        const distSq = (px - nx) * (px - nx) + (py - ny) * (py - ny);
        const greetRadiusSq = npc.interactRadius * npc.interactRadius;
        if (distSq < greetRadiusSq && !npc.active) {
          // Face player if close enough
          npc.state = "face_player";
          npc.active = true;
          const dx = px - nx;
          const dy = py - ny;
          if (Math.abs(dx) > Math.abs(dy)) {
            npc.facing = dx > 0 ? "right" : "left";
          } else {
            npc.facing = dy > 0 ? "down" : "up";
          }
          npc.velocity = { x: 0, y: 0 };
          npc.animation = `idle-${npc.facing}`;
          continue;
        }

        if (distSq >= greetRadiusSq) {
          npc.active = false;
        }
      }

      // Functional Wander/Idle toggle based on worldTimeMs blocks.
      const cycleMs = Math.max(
        1_000,
        Math.floor((npc.aiProfile.idlePauseMs[0] + npc.aiProfile.idlePauseMs[1]) / 2),
      );
      const cycleCount = Math.floor(state.worldTimeMs / cycleMs);
      const rand = rng.next(state.worldTimeMs, cycleCount);

      if (rand < 0.6) {
        // Idle
        npc.state = "idle";
        npc.velocity = { x: 0, y: 0 };
        npc.animation = `idle-${npc.facing}`;
      } else {
        npc.state = "wander";
        // Pick direction based on this specific cycle
        const dirRand = rng.next(state.worldTimeMs, cycleCount + 0.5);
        let moveX = 0;
        let moveY = 0;
        if (dirRand < 0.25) {
          moveY = -1;
          npc.facing = "up";
        } else if (dirRand < 0.5) {
          moveY = 1;
          npc.facing = "down";
        } else if (dirRand < 0.75) {
          moveX = -1;
          npc.facing = "left";
        } else {
          moveX = 1;
          npc.facing = "right";
        }

        const speed = npc.aiProfile.wanderSpeed * (dtMs / 16); // Normalize to 60fps tick
        npc.velocity = { x: moveX * speed, y: moveY * speed };
        npc.animation = `walk-${npc.facing}`;

        // Apply movement via scene engine to respect collisions
        const moveResult = sceneEngine.moveEntity(
          npc.position,
          npc.facing,
          npc.bounds,
          { x: moveX, y: moveY },
          speed,
          state.collisions,
          state.npcs,
          npc.id,
        );

        // Prevent wandering way outside the spawn radius
        const distFromSpawn =
          Math.abs(moveResult.position.x - npc.homePosition.x) +
          Math.abs(moveResult.position.y - npc.homePosition.y);
        if (distFromSpawn > npc.aiProfile.wanderRadius) {
          npc.velocity = { x: 0, y: 0 }; // Cancel out of bounds movement
        } else {
          npc.position.x = moveResult.position.x;
          npc.position.y = moveResult.position.y;
          if (!moveResult.moved) {
            // Collided, stop moving for this cycle
            npc.velocity = { x: 0, y: 0 };
            npc.animation = `idle-${npc.facing}`;
          }
        }
      }
    }
  }
}

export const npcAiEngine = new NpcAiEngine();

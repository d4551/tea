import { describe, expect, it } from "bun:test";
import type { Combatant } from "../../shared/contracts/game.ts";
import { combatEngine } from "./combat-engine.ts";

describe("CombatEngine", () => {
  const mockPlayer = (): Combatant => ({
    id: "p1",
    label: "Hero",
    characterKey: "hero",
    isPlayer: true,
    alive: true,
    statusEffects: [],
    stats: {
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 20,
      defense: 10,
      magicAttack: 15,
      magicDefense: 10,
      speed: 15,
      critRate: 0.1,
      critMultiplier: 1.5,
    },
  });

  const mockEnemy = (): Combatant => ({
    id: "e1",
    label: "Goblin",
    characterKey: "goblin",
    isPlayer: false,
    alive: true,
    statusEffects: [],
    stats: {
      hp: 30,
      maxHp: 30,
      mp: 10,
      maxMp: 10,
      attack: 12,
      defense: 5,
      magicAttack: 5,
      magicDefense: 2,
      speed: 10,
      critRate: 0.05,
      critMultiplier: 1.5,
    },
  });

  describe("initializeEncounter", () => {
    it("sorts combatants by speed", () => {
      const p1 = mockPlayer();
      const p2 = { ...mockPlayer(), id: "p2", stats: { ...p1.stats, speed: 5 } };
      const e1 = mockEnemy(); // speed 10

      const state = combatEngine.initializeEncounter("env1", [p1, p2], [e1]);

      expect(state.phase).toBe("intro");
      expect(state.turnOrder).toEqual(["p1", "e1", "p2"]); // 15, 10, 5
    });
  });

  describe("resolveAction and applyResultsAndAdvanceTurn", () => {
    it("handles an attack action reducing enemy HP", () => {
      const player = mockPlayer();
      const enemy = mockEnemy();
      const state = combatEngine.initializeEncounter("env1", [player], [enemy]);

      // Player attacks enemy
      const results = combatEngine.resolveAction(
        player,
        { type: "attack", actorId: player.id, targetIds: [enemy.id] },
        [enemy],
      );

      expect(results).toHaveLength(1);
      const res = results[0]!;
      expect(res.targetId).toBe(enemy.id);
      expect(res.damageType).toBe("physical");
      expect(res.finalDamage).toBeGreaterThan(0);

      const nextState = combatEngine.applyResultsAndAdvanceTurn(
        { ...state, phase: "player_turn" },
        results,
      );

      const updatedEnemy = nextState.combatants.find((c) => c.id === enemy.id);
      expect(updatedEnemy?.stats.hp).toBeLessThan(30);
      expect(nextState.phase).toBe("enemy_turn");
      expect(nextState.activeActorIndex).toBe(1); // turn advanced
    });

    it("triggers victory when all enemies are defeated", () => {
      const player = mockPlayer();
      const enemy = { ...mockEnemy(), stats: { ...mockEnemy().stats, hp: 1 } };

      const state = combatEngine.initializeEncounter("env1", [player], [enemy]);

      const results = combatEngine.resolveAction(
        player,
        { type: "attack", actorId: player.id, targetIds: [enemy.id] },
        [enemy],
      );
      const nextState = combatEngine.applyResultsAndAdvanceTurn(
        { ...state, phase: "player_turn" },
        results,
      );

      expect(nextState.phase).toBe("victory");
      expect(nextState.combatants.find((c) => !c.isPlayer)?.alive).toBe(false);
    });

    it("triggers defeat when all players are defeated", () => {
      const player = { ...mockPlayer(), stats: { ...mockPlayer().stats, hp: 1 } };
      const enemy = mockEnemy();

      const state = combatEngine.initializeEncounter("env1", [player], [enemy]);

      // Enemy attacks player
      const results = combatEngine.resolveAction(
        enemy,
        { type: "attack", actorId: enemy.id, targetIds: [player.id] },
        [player],
      );
      const nextState = combatEngine.applyResultsAndAdvanceTurn(
        { ...state, phase: "enemy_turn", activeActorIndex: 1 },
        results,
      );

      expect(nextState.phase).toBe("defeat");
      expect(nextState.combatants.find((c) => c.isPlayer)?.alive).toBe(false);
    });
  });
});

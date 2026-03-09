import { defaultGameConfig } from "../../shared/config/game-config.ts";
import type {
  CombatAction,
  Combatant,
  CombatDamageResult,
  CombatEncounterState,
} from "../../shared/contracts/game";

/**
 * Handles core combat mechanics: determining turn order, resolving actions,
 * applying damage, and checking win/loss conditions.
 */
export class CombatEngine {
  /**
   * Initializes a new combat state from given participants and enemies.
   */
  public initializeEncounter(
    encounterId: string,
    players: Combatant[],
    enemies: Combatant[],
  ): CombatEncounterState {
    const allCombatants = [...players, ...enemies].sort((a, b) => b.stats.speed - a.stats.speed); // Highest speed goes first

    return {
      id: encounterId,
      phase: "intro",
      turnIndex: 0,
      combatants: allCombatants,
      turnOrder: allCombatants.map((c) => c.id),
      activeActorIndex: 0,
      log: [],
    };
  }

  /**
   * Resolves a single combat action and returns the resulting damage/healing.
   */
  public resolveAction(
    actor: Combatant,
    action: CombatAction,
    targets: Combatant[],
  ): CombatDamageResult[] {
    const results: CombatDamageResult[] = [];

    for (const target of targets) {
      if (action.type === "attack") {
        const atk = actor.stats.attack;
        const def = target.stats.defense;

        // Simple damage formula
        const rawDamage = Math.max(
          1,
          Math.floor(atk * defaultGameConfig.combatDamageMultiplier - def),
        );

        // Critical hit check
        const isCritical = Math.random() < actor.stats.critRate;
        const finalDamage = isCritical
          ? Math.floor(rawDamage * actor.stats.critMultiplier)
          : rawDamage;

        // Will this hit defeat the target?
        const defeated = target.stats.hp - finalDamage <= 0;

        results.push({
          targetId: target.id,
          rawDamage,
          finalDamage,
          critical: isCritical,
          damageType: "physical",
          defeated,
        });
      } else if (action.type === "defend") {
        results.push({
          targetId: target.id,
          rawDamage: 0,
          finalDamage: 0,
          critical: false,
          damageType: "physical",
          defeated: target.stats.hp <= 0,
        });
      } else if (action.type === "skill") {
        const rawDamage = defaultGameConfig.combatSkillBaseDamage;
        const finalDamage = Math.max(1, rawDamage - target.stats.magicDefense);
        const defeated = target.stats.hp - finalDamage <= 0;

        results.push({
          targetId: target.id,
          rawDamage,
          finalDamage,
          critical: false,
          damageType: "magical",
          defeated,
        });
      } else if (action.type === "item") {
        results.push({
          targetId: target.id,
          rawDamage: 0,
          finalDamage: 0,
          critical: false,
          damageType: "magical",
          defeated: target.stats.hp <= 0,
        });
      }
    }

    return results;
  }

  /**
   * Applies damage results to the combat state and advances the turn.
   */
  public applyResultsAndAdvanceTurn(
    state: CombatEncounterState,
    results: CombatDamageResult[],
  ): CombatEncounterState {
    let playersAliveCount = 0;
    let enemiesAliveCount = 0;

    // 1. Apply damage
    const updatedCombatants = state.combatants.map((combatant: Combatant) => {
      const damageTaken = results
        .filter((r) => r.targetId === combatant.id)
        .reduce((sum, r) => sum + r.finalDamage, 0);

      const newHp = Math.max(0, combatant.stats.hp - damageTaken);
      const alive = newHp > 0;

      if (alive) {
        if (combatant.isPlayer) playersAliveCount++;
        else enemiesAliveCount++;
      }

      if (damageTaken > 0 || !alive) {
        return {
          ...combatant,
          alive,
          stats: {
            ...combatant.stats,
            hp: newHp,
          },
        };
      }
      return combatant;
    });

    // 2. Check for encounter end
    let nextPhase = state.phase;
    if (playersAliveCount === 0) {
      nextPhase = "defeat";
    } else if (enemiesAliveCount === 0) {
      nextPhase = "victory";
    }

    if (nextPhase === "defeat" || nextPhase === "victory") {
      return {
        ...state,
        phase: nextPhase,
        combatants: updatedCombatants,
      };
    }

    // 3. Advance turn if still active
    let nextIndex = (state.activeActorIndex + 1) % state.turnOrder.length;
    let nextActorId = state.turnOrder[nextIndex];
    let nextActor = updatedCombatants.find((c) => c.id === nextActorId);

    // Skip dead combatants
    let loopCount = 0;
    while ((!nextActor || !nextActor.alive) && loopCount < state.turnOrder.length) {
      nextIndex = (nextIndex + 1) % state.turnOrder.length;
      nextActorId = state.turnOrder[nextIndex];
      nextActor = updatedCombatants.find((c) => c.id === nextActorId);
      loopCount++;
    }

    const nextTurnIndex = state.turnIndex + (nextIndex <= state.activeActorIndex ? 1 : 0);

    return {
      ...state,
      turnIndex: nextTurnIndex,
      activeActorIndex: nextIndex,
      combatants: updatedCombatants,
      phase: state.combatants[state.activeActorIndex]?.isPlayer ? "enemy_turn" : "player_turn",
    };
  }
}

export const combatEngine = new CombatEngine();

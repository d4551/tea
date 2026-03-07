import type { Prisma } from "@prisma/client";
import { prisma } from "../../../shared/services/db.ts";

interface ParsedInteractionMap {
  readonly [key: string]: boolean;
}

type MutableInteractionMap = { [key: string]: boolean };

/**
 * Minimal player-progress snapshot required by runtime HUD and progression flows.
 */
export interface PlayerProgressSnapshot {
  /** Total accumulated XP. */
  readonly xp: number;
  /** Current player level. */
  readonly level: number;
}

/**
 * Deterministic result returned after awarding XP.
 */
export interface PlayerProgressAwardResult extends PlayerProgressSnapshot {
  /** Whether XP was actually applied to a stored progress row. */
  readonly awarded: boolean;
  /** Previous persisted level before the award. */
  readonly previousLevel: number;
  /** Whether the award crossed a level boundary. */
  readonly leveledUp: boolean;
}

/**
 * Deterministic result returned after processing a one-time interaction.
 */
export interface PlayerProgressInteractionResult extends PlayerProgressAwardResult {
  /** Whether the interaction marker was newly recorded. */
  readonly interactionApplied: boolean;
}

const toRecordFromParsed = (value: unknown): ParsedInteractionMap => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      typeof key === "string" && typeof entry === "boolean" ? [[key, entry]] : [],
    ),
  ) as ParsedInteractionMap;
};

const parseInteractionMap = (
  source: Prisma.JsonValue,
): { readonly map: ParsedInteractionMap; readonly repaired: boolean } => {
  if (source !== null && typeof source === "object" && !Array.isArray(source)) {
    return { map: toRecordFromParsed(source), repaired: false };
  }
  return { map: {}, repaired: true };
};

const sanitizeInteractionFlag = (value: unknown): boolean =>
  typeof value === "boolean" ? value : false;

const rebuildInteractionMap = (raw: ParsedInteractionMap): MutableInteractionMap => {
  const next: MutableInteractionMap = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.length > 0) {
      next[key] = sanitizeInteractionFlag(value);
    }
  }

  return next;
};

/**
 * Single persistence owner for player XP, levels, and one-time interaction markers.
 */
export class PlayerProgressStore {
  /**
   * Ensures a player-progress row exists for the session.
   *
   * @param sessionId Stable game session identifier.
   */
  public async initialize(sessionId: string): Promise<void> {
    await prisma.playerProgress.upsert({
      where: { sessionId },
      update: {},
      create: {
        sessionId,
        xp: 0,
        level: 1,
        visitedScenes: [] satisfies Prisma.JsonArray,
        interactions: {} satisfies Prisma.JsonObject,
      },
    });
  }

  /**
   * Reads the current progress snapshot for one session.
   *
   * @param sessionId Stable game session identifier.
   * @returns Progress snapshot or `null` when missing.
   */
  public async getSnapshot(sessionId: string): Promise<PlayerProgressSnapshot | null> {
    const current = await prisma.playerProgress.findUnique({ where: { sessionId } });
    if (!current) {
      return null;
    }

    return {
      xp: current.xp,
      level: current.level,
    };
  }

  /**
   * Awards XP and reports whether the player crossed a level boundary.
   *
   * @param sessionId Stable game session identifier.
   * @param amount Positive XP increment.
   * @returns Structured award result with level-transition metadata.
   */
  public async awardXp(sessionId: string, amount: number): Promise<PlayerProgressAwardResult> {
    const current = await prisma.playerProgress.findUnique({ where: { sessionId } });
    if (!current) {
      return {
        awarded: false,
        xp: 0,
        level: 0,
        previousLevel: 0,
        leveledUp: false,
      };
    }

    const previousLevel = current.level;
    const updated = await prisma.playerProgress.addXp(sessionId, amount);
    return {
      awarded: true,
      xp: updated.xp,
      level: updated.level,
      previousLevel,
      leveledUp: updated.level > previousLevel,
    };
  }

  /**
   * Marks an interaction as completed once and awards XP on the first completion.
   *
   * @param sessionId Stable game session identifier.
   * @param interactionId Deterministic interaction marker key.
   * @param awardAmount XP to award on first completion.
   * @returns Structured interaction result with award and level-transition metadata.
   */
  public async processInteraction(
    sessionId: string,
    interactionId: string,
    awardAmount: number,
  ): Promise<PlayerProgressInteractionResult> {
    const current = await prisma.playerProgress.findUnique({ where: { sessionId } });
    if (!current) {
      return {
        interactionApplied: false,
        awarded: false,
        xp: 0,
        level: 0,
        previousLevel: 0,
        leveledUp: false,
      };
    }

    const parsed = parseInteractionMap(current.interactions);
    const interactions = rebuildInteractionMap(parsed.map);

    if (interactions[interactionId]) {
      if (parsed.repaired) {
        await prisma.playerProgress.update({
          where: { sessionId },
          data: { interactions },
        });
      }

      return {
        interactionApplied: false,
        awarded: false,
        xp: current.xp,
        level: current.level,
        previousLevel: current.level,
        leveledUp: false,
      };
    }

    interactions[interactionId] = true;
    await prisma.playerProgress.update({
      where: { sessionId },
      data: { interactions },
    });

    const awardResult = await this.awardXp(sessionId, awardAmount);
    return {
      interactionApplied: true,
      ...awardResult,
    };
  }
}

const sharedPlayerProgressStore = new PlayerProgressStore();

/**
 * Shared player-progress persistence owner.
 */
export const playerProgressStore = sharedPlayerProgressStore;

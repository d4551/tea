import { prisma } from "../../../shared/services/db.ts";

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

    const existingInteraction = await prisma.playerProgressInteraction.findUnique({
      where: {
        sessionId_interactionId: {
          sessionId,
          interactionId,
        },
      },
    });

    if (existingInteraction) {
      return {
        interactionApplied: false,
        awarded: false,
        xp: current.xp,
        level: current.level,
        previousLevel: current.level,
        leveledUp: false,
      };
    }

    await prisma.playerProgressInteraction.create({
      data: {
        sessionId,
        interactionId,
      },
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

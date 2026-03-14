import type { GameSession } from "../../../shared/contracts/game.ts";
import { prismaBase } from "../../../shared/services/db.ts";
import { safeJsonParse } from "../../../shared/utils/safe-json.ts";

/** Minimal guard for legacy save-slot format where session was stored directly. */
const isLegacyGameSession = (v: unknown): v is GameSession => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" && "scene" in r && typeof r.scene === "object" && r.scene !== null
  );
};

const isSaveSlotSnapshot = (v: SaveSlotSnapshot | GameSession): v is SaveSlotSnapshot =>
  "session" in v && typeof v.session === "object";

export interface SaveSlotSnapshot {
  readonly session: GameSession;
  readonly progress?: { readonly xp: number; readonly level: number };
}

export interface SaveSlotRecord {
  readonly id: string;
  readonly ownerSessionId: string;
  readonly slotName: string | null;
  readonly slotIndex: number | null;
  readonly sceneTitle: string;
  readonly createdAt: Date;
}

export interface CreateSlotResult {
  readonly ok: true;
  readonly slot: SaveSlotRecord;
}

export interface CreateSlotError {
  readonly ok: false;
  readonly error: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";
}

export type CreateSlotOutcome = CreateSlotResult | CreateSlotError;

export interface RestoreSlotResult {
  readonly ok: true;
  readonly sessionId: string;
}

export interface RestoreSlotError {
  readonly ok: false;
  readonly error: "SLOT_NOT_FOUND" | "UNAUTHORIZED" | "INVALID_SNAPSHOT";
}

export type RestoreSlotOutcome = RestoreSlotResult | RestoreSlotError;

/**
 * Persistence for named save slots. Uses GameSaveSlot table.
 */
export class SaveSlotStore {
  /**
   * Creates a save slot from the current session state.
   */
  public async createSlot(
    ownerSessionId: string,
    session: GameSession,
    slotName?: string | null,
    slotIndex?: number | null,
    progress?: { xp: number; level: number } | null,
  ): Promise<CreateSlotOutcome> {
    const sceneTitle = session.scene?.sceneTitle ?? session.scene?.sceneId ?? "Unknown";
    const snapshot = JSON.stringify({
      session: {
        ...session,
        id: session.id,
        participants: session.participants,
      },
      progress: progress ?? undefined,
    });

    const slot = await prismaBase.gameSaveSlot.create({
      data: {
        ownerSessionId,
        slotName: slotName?.trim() || null,
        slotIndex: slotIndex ?? null,
        sceneTitle,
        sessionSnapshot: snapshot,
      },
    });

    return {
      ok: true,
      slot: {
        id: slot.id,
        ownerSessionId: slot.ownerSessionId,
        slotName: slot.slotName,
        slotIndex: slot.slotIndex,
        sceneTitle: slot.sceneTitle,
        createdAt: slot.createdAt,
      },
    };
  }

  /**
   * Lists save slots for an owner, newest first.
   */
  public async listSlots(ownerSessionId: string): Promise<readonly SaveSlotRecord[]> {
    const rows = await prismaBase.gameSaveSlot.findMany({
      where: { ownerSessionId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return rows.map((row) => ({
      id: row.id,
      ownerSessionId: row.ownerSessionId,
      slotName: row.slotName,
      slotIndex: row.slotIndex,
      sceneTitle: row.sceneTitle,
      createdAt: row.createdAt,
    }));
  }

  /**
   * Returns the session snapshot for a slot. Caller must create a new session from it.
   */
  public async getSlotSnapshot(
    slotId: string,
    ownerSessionId: string,
  ): Promise<SaveSlotSnapshot | null> {
    const row = await prismaBase.gameSaveSlot.findUnique({
      where: { id: slotId },
    });

    if (!row || row.ownerSessionId !== ownerSessionId) {
      return null;
    }

    type SnapshotOrLegacy = SaveSlotSnapshot | GameSession;
    const parsed = safeJsonParse<SnapshotOrLegacy | null>(
      row.sessionSnapshot,
      null as SnapshotOrLegacy | null,
      (v): v is SnapshotOrLegacy | null =>
        v === null ||
        (typeof v === "object" &&
          v !== null &&
          (("session" in v && typeof (v as SaveSlotSnapshot).session === "object") ||
            isLegacyGameSession(v))),
    );

    if (parsed === null) return null;
    const session: GameSession = isSaveSlotSnapshot(parsed) ? parsed.session : parsed;
    const progress =
      "progress" in parsed && parsed?.progress && typeof parsed.progress === "object"
        ? { xp: parsed.progress.xp, level: parsed.progress.level }
        : undefined;
    return { session, progress };
  }

  /**
   * Deletes a save slot. Returns true if deleted.
   */
  public async deleteSlot(slotId: string, ownerSessionId: string): Promise<boolean> {
    const result = await prismaBase.gameSaveSlot.deleteMany({
      where: { id: slotId, ownerSessionId },
    });
    return result.count > 0;
  }
}

export const saveSlotStore = new SaveSlotStore();

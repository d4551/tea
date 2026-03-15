import type { GameSession } from "../../../shared/contracts/game.ts";
import { prismaBase } from "../../../shared/services/db.ts";
import { safeJsonParse } from "../../../shared/utils/safe-json.ts";

/**
 * Type guard for the canonical save-slot snapshot envelope.
 *
 * @param v Parsed JSON candidate.
 * @returns Whether the value matches the SaveSlotSnapshot shape.
 */
const isSaveSlotSnapshot = (v: unknown): v is SaveSlotSnapshot =>
  typeof v === "object" &&
  v !== null &&
  "session" in v &&
  typeof (v as SaveSlotSnapshot).session === "object";

/**
 * Serialized save-slot envelope containing a frozen session state.
 */
export interface SaveSlotSnapshot {
  readonly session: GameSession;
  readonly progress?: { readonly xp: number; readonly level: number };
}

/**
 * Public-facing save-slot metadata record (no session payload).
 */
export interface SaveSlotRecord {
  readonly id: string;
  readonly ownerSessionId: string;
  readonly slotName: string | null;
  readonly slotIndex: number | null;
  readonly sceneTitle: string;
  readonly createdAt: Date;
}

/**
 * Successful slot creation outcome.
 */
export interface CreateSlotResult {
  readonly ok: true;
  readonly slot: SaveSlotRecord;
}

/**
 * Failed slot creation outcome.
 */
export interface CreateSlotError {
  readonly ok: false;
  readonly error: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";
}

export type CreateSlotOutcome = CreateSlotResult | CreateSlotError;

/**
 * Successful slot restoration outcome.
 */
export interface RestoreSlotResult {
  readonly ok: true;
  readonly sessionId: string;
}

/**
 * Failed slot restoration outcome.
 */
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
   *
   * @param ownerSessionId Session owner identity.
   * @param session Current game session to snapshot.
   * @param slotName Optional human-readable slot label.
   * @param slotIndex Optional positional slot index.
   * @param progress Optional player progression data.
   * @returns Creation outcome with slot metadata on success.
   */
  public async createSlot(
    ownerSessionId: string,
    session: GameSession,
    slotName?: string | null,
    slotIndex?: number | null,
    progress?: { xp: number; level: number } | null,
  ): Promise<CreateSlotOutcome> {
    const sceneTitle = session.scene?.sceneTitle ?? session.scene?.sceneId ?? "Unknown";
    const snapshot: SaveSlotSnapshot = {
      session: {
        ...session,
        id: session.id,
        participants: session.participants,
      },
      progress: progress ?? undefined,
    };

    const slot = await prismaBase.gameSaveSlot.create({
      data: {
        ownerSessionId,
        slotName: slotName?.trim() || null,
        slotIndex: slotIndex ?? null,
        sceneTitle,
        sessionSnapshot: JSON.stringify(snapshot),
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
   *
   * @param ownerSessionId Session owner identity.
   * @returns Ordered list of save-slot metadata records.
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
   *
   * @param slotId Slot identifier to restore.
   * @param ownerSessionId Session owner identity for authorization.
   * @returns Deserialized snapshot or null when not found or unauthorized.
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

    const parsed = safeJsonParse<SaveSlotSnapshot | null>(
      row.sessionSnapshot,
      null,
      (v): v is SaveSlotSnapshot | null => v === null || isSaveSlotSnapshot(v),
    );

    return parsed;
  }

  /**
   * Deletes a save slot. Returns true if deleted.
   *
   * @param slotId Slot identifier to remove.
   * @param ownerSessionId Session owner identity for authorization.
   * @returns Whether a slot was successfully deleted.
   */
  public async deleteSlot(slotId: string, ownerSessionId: string): Promise<boolean> {
    const result = await prismaBase.gameSaveSlot.deleteMany({
      where: { id: slotId, ownerSessionId },
    });
    return result.count > 0;
  }
}

export const saveSlotStore = new SaveSlotStore();

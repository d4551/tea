import type { Prisma } from "@prisma/client";
import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../../shared/config/game-config.ts";
import { gameAssetUrls } from "../../../shared/constants/game-assets.ts";
import type {
  GameLocale,
  GameSceneState,
  GameSession,
  GameSessionParticipant,
  GameSessionParticipantRole,
  GameSessionSnapshot,
  SceneDefinition,
  TriggerDefinition,
} from "../../../shared/contracts/game.ts";
import {
  validateGameSceneState,
  validateTriggerDefinitions,
} from "../../../shared/contracts/game.ts";
import { prisma } from "../../../shared/services/db.ts";
import { buildSessionSceneState } from "../utils/session-state.ts";

const logger = createLogger("game.state-store");

/**
 * Canonical session storage contract for domain/game services.
 */
export interface GameStateStore {
  /** Creates and persists a fresh session. */
  createSession(seed: GameSessionSeed): Promise<GameSession>;
  /** Loads an active session by id. */
  getSession(sessionId: string): Promise<StoreResult<GameSession>>;
  /** Counts active non-expired sessions. */
  countActiveSessions(nowMs?: number): Promise<number>;
  /** Persists an updated session snapshot and extends TTL. */
  saveSession(session: GameSession): Promise<void>;
  /** Deletes a session. */
  deleteSession(sessionId: string): Promise<void>;
  /** Creates a stable serializable snapshot for response transport. */
  toSnapshot(session: GameSession): GameSessionSnapshot;
  /** Removes all expired sessions and returns count removed. */
  purgeExpiredSessions(nowMs?: number): Promise<number>;
  /** Lists non-owner participants admitted to a session. */
  listParticipants(sessionId: string): Promise<readonly GameSessionParticipant[]>;
  /** Creates or updates one participant room membership. */
  saveParticipant(
    sessionId: string,
    participantSessionId: string,
    role: Exclude<GameSessionParticipantRole, "owner">,
  ): Promise<GameSessionParticipant>;
}

/**
 * Input seed used to create a persisted game session.
 */
export interface GameSessionSeed {
  /** Stable session identifier. */
  readonly id: string;
  /** Stable owner identity derived from auth-session cookie. */
  readonly ownerSessionId: string;
  /** Session RNG seed. */
  readonly seed: number;
  /** Active locale. */
  readonly locale: GameLocale;
  /** Pre-built scene state to persist. */
  readonly scene: GameSceneState;
  /** Optional project binding used to seed the scene. */
  readonly projectId?: string;
  /** Published release version captured when the session was created. */
  readonly releaseVersion?: number;
  /** Published trigger definitions captured at session creation. */
  readonly triggerDefinitions?: readonly TriggerDefinition[];
}

/**
 * Runtime store operation result.
 */
export type StoreResult<TPayload> =
  | {
      readonly ok: true;
      readonly payload: TPayload;
    }
  | {
      readonly ok: false;
      readonly error: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";
    };

/**
 * Internal persisted entry with TTL tracking.
 */
interface StoredSession {
  readonly id: string;
  readonly session: GameSession;
  readonly expiresAtMs: number;
}

interface StoredParticipantEntry {
  readonly role: Exclude<GameSessionParticipantRole, "owner">;
  readonly joinedAtMs: number;
  readonly updatedAtMs: number;
}

interface GameSessionRow {
  readonly id: string;
  readonly ownerSessionId: string;
  readonly seed: number;
  readonly locale: string;
  readonly sceneId: string;
  readonly state: Prisma.JsonValue;
  readonly stateVersion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt: Date;
}

interface PersistedSessionState {
  /** Materialized runtime scene state. */
  readonly scene: GameSceneState;
  /** Optional builder project binding. */
  readonly projectId?: string;
  /** Published release version captured at session creation. */
  readonly releaseVersion?: number;
  /** Published trigger definitions captured at session creation. */
  readonly triggerDefinitions?: readonly TriggerDefinition[];
}

/**
 * Creates a unique deterministic session ID using browser-safe crypto APIs in Bun.
 */
const _newSessionId = (): string => crypto.randomUUID();

/**
 * Computes a monotonic now-timestamp in milliseconds.
 */
const nowMs = (): number => Date.now();

/**
 * Resolves a fallback scene when the requested definition is unavailable.
 */
const defaultSceneDefinition = (): SceneDefinition => {
  const scene = resolveScene(defaultGameConfig.defaultSceneId);
  if (scene !== null) {
    return scene;
  }

  return {
    id: defaultGameConfig.defaultSceneId,
    sceneMode: "2d",
    titleKey: "scene.teaHouse.title",
    background: gameAssetUrls.teaHouseBackground,
    geometry: {
      width: 640,
      height: 640,
    },
    spawn: {
      x: 300,
      y: 380,
    },
    nodes: [],
    npcs: [],
    collisions: [],
  };
};

/**
 * Serializes and deserializes scene payloads safely.
 */
const toScenePayload = (
  scene: GameSceneState,
  projectId?: string,
  releaseVersion?: number,
  triggerDefinitions?: readonly TriggerDefinition[],
): Prisma.InputJsonValue =>
  JSON.parse(
    JSON.stringify({
      scene,
      projectId,
      releaseVersion,
      triggerDefinitions,
    } satisfies PersistedSessionState),
  );

/**
 * Safely restores scene state from DB JSON with safe fallback.
 */
const toSceneState = (value: Prisma.JsonValue): PersistedSessionState | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value;
  if ("scene" in record) {
    const sceneValidation = validateGameSceneState(record.scene);
    if (!sceneValidation.ok) {
      return null;
    }

    const triggerValidation =
      record.triggerDefinitions === undefined
        ? { ok: true as const, data: undefined }
        : validateTriggerDefinitions(record.triggerDefinitions);
    if (!triggerValidation.ok) {
      return null;
    }

    return {
      scene: structuredClone(sceneValidation.data),
      projectId: typeof record.projectId === "string" ? record.projectId : undefined,
      releaseVersion:
        typeof record.releaseVersion === "number" && Number.isFinite(record.releaseVersion)
          ? record.releaseVersion
          : undefined,
      triggerDefinitions:
        triggerValidation.data === undefined ? undefined : structuredClone(triggerValidation.data),
    };
  }

  const sceneValidation = validateGameSceneState(record);
  if (!sceneValidation.ok) {
    return null;
  }

  return {
    scene: structuredClone(sceneValidation.data),
    projectId: undefined,
  };
};

interface SceneStateRestoreResult {
  readonly scene: GameSceneState;
  readonly projectId?: string;
  readonly releaseVersion?: number;
  readonly triggerDefinitions?: readonly TriggerDefinition[];
  readonly repaired: boolean;
}

/**
 * Rebuilds malformed persisted scene state from canonical scene definitions.
 */
const restoreSceneState = (row: GameSessionRow): SceneStateRestoreResult => {
  const parsed = toSceneState(row.state);
  if (parsed !== null) {
    return {
      scene: parsed.scene,
      projectId: parsed.projectId,
      releaseVersion: parsed.releaseVersion,
      triggerDefinitions: parsed.triggerDefinitions,
      repaired: false,
    };
  }

  const sceneDefinition = resolveScene(row.sceneId) ?? defaultSceneDefinition();
  return {
    scene: buildSessionSceneState(sceneDefinition, row.locale as GameLocale, row.seed),
    projectId: undefined,
    releaseVersion: undefined,
    triggerDefinitions: undefined,
    repaired: true,
  };
};

/**
 * Shared map serialization for GameSession snapshots.
 */
const toSnapshotSession = (session: GameSession): GameSessionSnapshot => ({
  sessionId: session.id,
  locale: session.locale,
  timestamp: new Date(session.updatedAtMs).toISOString(),
  projectId: session.projectId,
  releaseVersion: session.releaseVersion,
  state: session.scene,
});

/**
 * Builds the canonical owner participant record for a session.
 */
const toOwnerParticipant = (session: {
  readonly ownerSessionId: string;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
}): GameSessionParticipant => ({
  sessionId: session.ownerSessionId,
  role: "owner",
  joinedAtMs: session.createdAtMs,
  updatedAtMs: session.updatedAtMs,
});

/**
 * Builds an in-memory store entry with TTL.
 */
const toStoredSession = (session: GameSession): StoredSession => ({
  id: session.id,
  session: {
    ...session,
    updatedAtMs: nowMs(),
  },
  expiresAtMs: nowMs() + appConfig.game.sessionTtlMs,
});

/**
 * Converts a Prisma row into typed runtime session shape.
 */
const toGameSessionFromRow = (
  row: GameSessionRow,
): { readonly session: GameSession; readonly repaired: boolean } => {
  const restored = restoreSceneState(row);
  const ownerParticipant = toOwnerParticipant({
    ownerSessionId: row.ownerSessionId,
    createdAtMs: row.createdAt.getTime(),
    updatedAtMs: row.updatedAt.getTime(),
  });
  return {
    session: {
      id: row.id,
      ownerSessionId: row.ownerSessionId,
      seed: row.seed,
      locale: row.locale as GameLocale,
      scene: restored.scene,
      projectId: restored.projectId,
      releaseVersion: restored.releaseVersion,
      triggerDefinitions: restored.triggerDefinitions,
      participants: [ownerParticipant],
      stateVersion: row.stateVersion,
      updatedAtMs: row.updatedAt.getTime(),
      createdAtMs: row.createdAt.getTime(),
    },
    repaired: restored.repaired,
  };
};

/**
 * In-memory session store fallback.
 */
class InMemoryGameStateStore implements GameStateStore {
  private readonly sessions: Map<string, StoredSession>;
  private readonly participants: Map<string, Map<string, StoredParticipantEntry>>;

  public constructor() {
    this.sessions = new Map<string, StoredSession>();
    this.participants = new Map<string, Map<string, StoredParticipantEntry>>();
  }

  public async createSession(seed: GameSessionSeed): Promise<GameSession> {
    const createdAtMs = nowMs();

    const session: GameSession = {
      id: seed.id,
      ownerSessionId: seed.ownerSessionId,
      seed: seed.seed,
      locale: seed.locale,
      projectId: seed.projectId,
      releaseVersion: seed.releaseVersion,
      triggerDefinitions: seed.triggerDefinitions,
      participants: [
        {
          sessionId: seed.ownerSessionId,
          role: "owner",
          joinedAtMs: createdAtMs,
          updatedAtMs: createdAtMs,
        },
      ],
      stateVersion: 1,
      createdAtMs,
      updatedAtMs: createdAtMs,
      scene: structuredClone(seed.scene),
    };

    const stored = toStoredSession(session);
    this.sessions.set(stored.id, stored);

    return stored.session;
  }

  public async getSession(sessionId: string): Promise<StoreResult<GameSession>> {
    const entry = this.sessions.get(sessionId);
    if (!entry) {
      return { ok: false, error: "SESSION_NOT_FOUND" };
    }

    if (nowMs() > entry.expiresAtMs) {
      this.sessions.delete(sessionId);
      this.participants.delete(sessionId);
      return { ok: false, error: "SESSION_EXPIRED" };
    }

    return {
      ok: true,
      payload: {
        ...entry.session,
        participants: [
          toOwnerParticipant(entry.session),
          ...(await this.listParticipants(sessionId)),
        ],
      },
    };
  }

  public async countActiveSessions(now: number = nowMs()): Promise<number> {
    let activeSessions = 0;

    for (const [id, entry] of this.sessions.entries()) {
      if (now > entry.expiresAtMs) {
        this.sessions.delete(id);
        continue;
      }

      activeSessions += 1;
    }

    return activeSessions;
  }

  public async saveSession(session: GameSession): Promise<void> {
    const stored = toStoredSession(session);
    this.sessions.set(stored.id, stored);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.participants.delete(sessionId);
  }

  public toSnapshot(session: GameSession): GameSessionSnapshot {
    return toSnapshotSession(session);
  }

  public async purgeExpiredSessions(now: number = nowMs()): Promise<number> {
    let purged = 0;

    for (const [id, entry] of this.sessions.entries()) {
      if (now > entry.expiresAtMs) {
        this.sessions.delete(id);
        this.participants.delete(id);
        purged += 1;
      }
    }

    return purged;
  }

  public async listParticipants(sessionId: string): Promise<readonly GameSessionParticipant[]> {
    const sessionParticipants = this.participants.get(sessionId);
    if (!sessionParticipants) {
      return [];
    }

    return [...sessionParticipants.entries()].map(([participantSessionId, participant]) => ({
      sessionId: participantSessionId,
      role: participant.role,
      joinedAtMs: participant.joinedAtMs,
      updatedAtMs: participant.updatedAtMs,
    }));
  }

  public async saveParticipant(
    sessionId: string,
    participantSessionId: string,
    role: Exclude<GameSessionParticipantRole, "owner">,
  ): Promise<GameSessionParticipant> {
    const createdAtMs = nowMs();
    const sessionParticipants = this.participants.get(sessionId) ?? new Map<string, StoredParticipantEntry>();
    const current = sessionParticipants.get(participantSessionId);
    const nextEntry: StoredParticipantEntry = {
      role,
      joinedAtMs: current?.joinedAtMs ?? createdAtMs,
      updatedAtMs: createdAtMs,
    };
    sessionParticipants.set(participantSessionId, nextEntry);
    this.participants.set(sessionId, sessionParticipants);
    return {
      sessionId: participantSessionId,
      role,
      joinedAtMs: nextEntry.joinedAtMs,
      updatedAtMs: nextEntry.updatedAtMs,
    };
  }
}

/**
 * Prisma-backed authoritative store for game sessions.
 */
class PrismaGameStateStore implements GameStateStore {
  public async createSession(seed: GameSessionSeed): Promise<GameSession> {
    const resolvedId = seed.id !== "" ? seed.id : _newSessionId();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + appConfig.game.sessionTtlMs);

    const persisted = await prisma.gameSession.create({
      data: {
        id: resolvedId,
        ownerSessionId: seed.ownerSessionId,
        seed: seed.seed,
        locale: seed.locale as string,
        sceneId: seed.scene.sceneId,
        state: toScenePayload(
          seed.scene,
          seed.projectId,
          seed.releaseVersion,
          seed.triggerDefinitions,
        ),
        stateVersion: 1,
        createdAt,
        updatedAt: createdAt,
        expiresAt,
      },
    });

    return {
      ...toGameSessionFromRow(persisted).session,
      projectId: seed.projectId,
      releaseVersion: seed.releaseVersion,
      triggerDefinitions: seed.triggerDefinitions,
      participants: [
        {
          sessionId: seed.ownerSessionId,
          role: "owner",
          joinedAtMs: createdAt.getTime(),
          updatedAtMs: createdAt.getTime(),
        },
      ],
    };
  }

  public async getSession(sessionId: string): Promise<StoreResult<GameSession>> {
    const persisted = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!persisted) {
      return { ok: false, error: "SESSION_NOT_FOUND" };
    }

    if (persisted.expiresAt.getTime() <= nowMs()) {
      await prisma.gameSession.deleteMany({ where: { id: sessionId } });
      return { ok: false, error: "SESSION_EXPIRED" };
    }

    const restored = toGameSessionFromRow(persisted);
    if (restored.repaired) {
      logger.warn("session.state.repaired", {
        sessionId,
        sceneId: persisted.sceneId,
      });
      await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          state: toScenePayload(
            restored.session.scene,
            restored.session.projectId,
            restored.session.releaseVersion,
            restored.session.triggerDefinitions,
          ),
          updatedAt: new Date(),
        },
      });
    }

    return {
      ok: true,
      payload: {
        ...restored.session,
        participants: [toOwnerParticipant(restored.session), ...(await this.listParticipants(sessionId))],
      },
    };
  }

  public async countActiveSessions(now: number = nowMs()): Promise<number> {
    const threshold = new Date(now);
    return prisma.gameSession.count({
      where: { expiresAt: { gt: threshold } },
    });
  }

  public async saveSession(session: GameSession): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + appConfig.game.sessionTtlMs);
    const expectedPreviousVersion = Math.max(1, session.stateVersion - 1);
    const updated = await prisma.gameSession.updateMany({
      where: {
        id: session.id,
        stateVersion: expectedPreviousVersion,
      },
      data: {
        seed: session.seed,
        ownerSessionId: session.ownerSessionId,
        locale: session.locale,
        sceneId: session.scene.sceneId,
        state: toScenePayload(
          session.scene,
          session.projectId,
          session.releaseVersion,
          session.triggerDefinitions,
        ),
        stateVersion: session.stateVersion,
        updatedAt: now,
        expiresAt,
      },
    });

    if (updated.count > 0) {
      return;
    }

    // Idempotent save path when the same stateVersion was already persisted.
    const existing = await prisma.gameSession.findUnique({
      where: { id: session.id },
      select: { id: true, stateVersion: true },
    });
    if (!existing) {
      return;
    }
    if (existing.stateVersion === session.stateVersion) {
      return;
    }

    throw new Error(
      `state-version-conflict:${session.id}:${existing.stateVersion}:${session.stateVersion}`,
    );
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await prisma.gameSession.deleteMany({ where: { id: sessionId } });
  }

  public async listParticipants(sessionId: string): Promise<readonly GameSessionParticipant[]> {
    const rows = await prisma.gameSessionParticipant.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map((row) => ({
      sessionId: row.participantSessionId,
      role: row.role as Exclude<GameSessionParticipantRole, "owner">,
      joinedAtMs: row.createdAt.getTime(),
      updatedAtMs: row.updatedAt.getTime(),
    }));
  }

  public async saveParticipant(
    sessionId: string,
    participantSessionId: string,
    role: Exclude<GameSessionParticipantRole, "owner">,
  ): Promise<GameSessionParticipant> {
    const row = await prisma.gameSessionParticipant.upsert({
      where: {
        sessionId_participantSessionId: {
          sessionId,
          participantSessionId,
        },
      },
      create: {
        sessionId,
        participantSessionId,
        role,
      },
      update: {
        role,
      },
    });

    return {
      sessionId: row.participantSessionId,
      role: row.role as Exclude<GameSessionParticipantRole, "owner">,
      joinedAtMs: row.createdAt.getTime(),
      updatedAtMs: row.updatedAt.getTime(),
    };
  }

  public toSnapshot(session: GameSession): GameSessionSnapshot {
    return toSnapshotSession(session);
  }

  public async purgeExpiredSessions(now: number = nowMs()): Promise<number> {
    const threshold = new Date(now);
    const removed = await prisma.gameSession.deleteMany({
      where: { expiresAt: { lt: threshold } },
    });

    return removed.count;
  }
}

/**
 * Shared helper to generate a typed session lookup result.
 */
export const isSessionResult = (value: StoreResult<unknown>): value is StoreResult<GameSession> =>
  value.ok;

/**
 * Selects store implementation by environment configuration.
 */
const createGameStateStore = (): GameStateStore => {
  if (appConfig.game.sessionStore === "prisma") {
    return new PrismaGameStateStore();
  }

  return new InMemoryGameStateStore();
};

/**
 * Runtime store implementation used by game routes and domain services.
 */
export const gameStateStore = createGameStateStore();

/**
 * Utility to resolve session ids from external input.
 */
export const isSessionId = (value: string | undefined | null): value is string =>
  value !== null && value !== undefined && value.length > 0;

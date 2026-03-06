import type { Prisma } from "@prisma/client";
import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../../shared/config/game-config.ts";
import { gameAssetUrls } from "../../../shared/constants/game-assets.ts";
import type {
  GameLocale,
  GameSceneState,
  GameSession,
  GameSessionSnapshot,
  SceneDefinition,
  TriggerDefinition,
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
  /** Persists an updated session snapshot and extends TTL. */
  saveSession(session: GameSession): Promise<void>;
  /** Deletes a session. */
  deleteSession(sessionId: string): Promise<void>;
  /** Creates a stable serializable snapshot for response transport. */
  toSnapshot(session: GameSession): GameSessionSnapshot;
  /** Removes all expired sessions and returns count removed. */
  purgeExpiredSessions(nowMs?: number): Promise<number>;
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

  const record = value as Record<string, unknown>;
  if (
    "scene" in record &&
    record.scene !== null &&
    typeof record.scene === "object" &&
    !Array.isArray(record.scene)
  ) {
    return {
      scene: JSON.parse(JSON.stringify(record.scene)) as GameSceneState,
      projectId: typeof record.projectId === "string" ? record.projectId : undefined,
      releaseVersion:
        typeof record.releaseVersion === "number" && Number.isFinite(record.releaseVersion)
          ? record.releaseVersion
          : undefined,
      triggerDefinitions: Array.isArray(record.triggerDefinitions)
        ? (JSON.parse(JSON.stringify(record.triggerDefinitions)) as readonly TriggerDefinition[])
        : undefined,
    };
  }

  return {
    scene: JSON.parse(JSON.stringify(value)) as GameSceneState,
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

  public constructor() {
    this.sessions = new Map<string, StoredSession>();
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
      return { ok: false, error: "SESSION_EXPIRED" };
    }

    return {
      ok: true,
      payload: {
        ...entry.session,
      },
    };
  }

  public async saveSession(session: GameSession): Promise<void> {
    const stored = toStoredSession(session);
    this.sessions.set(stored.id, stored);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  public toSnapshot(session: GameSession): GameSessionSnapshot {
    return toSnapshotSession(session);
  }

  public async purgeExpiredSessions(now: number = nowMs()): Promise<number> {
    let purged = 0;

    for (const [id, entry] of this.sessions.entries()) {
      if (now > entry.expiresAtMs) {
        this.sessions.delete(id);
        purged += 1;
      }
    }

    return purged;
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

    return { ok: true, payload: restored.session };
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

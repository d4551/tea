import type { Prisma } from "@prisma/client";
import { appConfig, type LocaleCode } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../../shared/config/game-config.ts";
import { gameAssetUrls } from "../../../shared/constants/game-assets.ts";
import type {
  GameLocale,
  GameSceneState,
  GameSession,
  GameSessionSnapshot,
  SceneDefinition,
} from "../../../shared/contracts/game.ts";
import { prisma } from "../../../shared/services/db.ts";
import { buildSessionSceneState } from "../utils/session-state.ts";

const logger = createLogger("game.state-store");

/**
 * Canonical session storage contract for domain/game services.
 */
export interface GameStateStore {
  /** Creates and persists a fresh session. */
  createSession(
    id: string,
    sceneId: string,
    locale: LocaleCode,
    seed: number,
  ): Promise<GameSession>;
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
  readonly seed: number;
  readonly locale: string;
  readonly sceneId: string;
  readonly state: Prisma.JsonValue;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt: Date;
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
    npcs: [],
    collisions: [],
  };
};

/**
 * Serializes and deserializes scene payloads safely.
 */
const toScenePayload = (scene: GameSceneState): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(scene));

/**
 * Safely restores scene state from DB JSON with safe fallback.
 */
const toSceneState = (value: Prisma.JsonValue): GameSceneState | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? JSON.parse(JSON.stringify(value))
    : null;

interface SceneStateRestoreResult {
  readonly scene: GameSceneState;
  readonly repaired: boolean;
}

/**
 * Rebuilds malformed persisted scene state from canonical scene definitions.
 */
const restoreSceneState = (row: GameSessionRow): SceneStateRestoreResult => {
  const parsed = toSceneState(row.state);
  if (parsed !== null) {
    return {
      scene: parsed,
      repaired: false,
    };
  }

  const sceneDefinition = resolveScene(row.sceneId) ?? defaultSceneDefinition();
  return {
    scene: buildSessionSceneState(sceneDefinition, row.locale as GameLocale, row.seed),
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
      seed: row.seed,
      locale: row.locale as GameLocale,
      scene: restored.scene,
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

  public async createSession(
    id: string,
    sceneId: string,
    locale: GameLocale,
    seed: number,
  ): Promise<GameSession> {
    const sceneDefinition = resolveScene(sceneId) ?? defaultSceneDefinition();
    const createdAtMs = nowMs();

    const session: GameSession = {
      id,
      seed,
      locale,
      createdAtMs,
      updatedAtMs: createdAtMs,
      scene: buildSessionSceneState(sceneDefinition, locale, seed),
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
  public async createSession(
    id: string,
    sceneId: string,
    locale: LocaleCode,
    seed: number,
  ): Promise<GameSession> {
    const resolvedId = id !== "" ? id : _newSessionId();
    const sceneDefinition = resolveScene(sceneId) ?? defaultSceneDefinition();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + appConfig.game.sessionTtlMs);

    const persisted = await prisma.gameSession.create({
      data: {
        id: resolvedId,
        seed,
        locale: locale as string,
        sceneId: sceneDefinition.id,
        state: toScenePayload(buildSessionSceneState(sceneDefinition, locale as GameLocale, seed)),
        createdAt,
        updatedAt: createdAt,
        expiresAt,
      },
    });

    return toGameSessionFromRow(persisted).session;
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
          state: toScenePayload(restored.session.scene),
          updatedAt: new Date(),
        },
      });
    }

    return { ok: true, payload: restored.session };
  }

  public async saveSession(session: GameSession): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + appConfig.game.sessionTtlMs);

    await prisma.gameSession.update({
      where: { id: session.id },
      data: {
        seed: session.seed,
        locale: session.locale,
        sceneId: session.scene.sceneId,
        state: toScenePayload(session.scene),
        updatedAt: now,
        expiresAt,
      },
    });
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

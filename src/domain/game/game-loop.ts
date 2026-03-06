import { createHash } from "node:crypto";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../shared/config/game-config.ts";
import type {
  GameActionState,
  GameCommandEnvelope,
  GameCommandInput,
  GameCommandResult,
  GameCommandState,
  GameLocale,
  GameSceneState,
  GameSession,
  GameSessionSnapshot,
  GameSessionState,
} from "../../shared/contracts/game.ts";
import { validateGameCommandInput } from "../../shared/contracts/game.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import { builderService } from "../builder/builder-service.ts";
import { generateNpcDialogue } from "./ai/game-ai-service.ts";
import { npcAiEngine } from "./npc-ai.ts";
import {
  awardXp,
  initializeProgress,
  processInteractionProgress,
  XP_CONFIG,
} from "./progression.ts";
import { sceneEngine } from "./scene-engine.ts";
import { gameStateStore } from "./services/GameStateStore.ts";
import type { Mutable, MutableGameSceneState } from "./types.ts";
import { buildSessionSceneState } from "./utils/session-state.ts";

// Wrap worldTimeMs at ~1 day to prevent float precision loss in NPC PRNG
const WORLD_TIME_WRAP_MS = 86_400_007;
const logger = createLogger("game.loop");
const resumeTokenSecretMaterial = [
  appConfig.applicationName,
  appConfig.auth.sessionCookieName,
  Bun.env.DATABASE_URL ?? "",
  defaultGameConfig.defaultSceneId,
].join(":");

type SnapshotCallback = (snapshot: GameSessionSnapshot) => void;

type QueuedCommand = Readonly<{
  /** Envelope accepted by command runtime. */
  readonly envelope: GameCommandEnvelope;
}>;

const isExpired = (envelope: GameCommandEnvelope): boolean => {
  if (typeof envelope.ttlMs !== "number" || envelope.ttlMs <= 0) {
    return false;
  }

  const issued = Date.parse(envelope.timestamp);
  if (Number.isNaN(issued)) {
    return false;
  }

  return Date.now() - issued > envelope.ttlMs;
};

type ResumeTokenPayload = {
  /** Stable session identifier. */
  readonly sessionId: string;
  /** Session-cookie identity allowed to restore this token. */
  readonly ownerSessionId: string;
  /** Expiry timestamp in ms since epoch. */
  readonly expiresAtMs: number;
  /** Monotonic token version per gameplay session. */
  readonly tokenVersion: number;
  /** Integrity signature over the payload. */
  readonly signature: string;
};

const hashResumePayload = (
  sessionId: string,
  ownerSessionId: string,
  expiresAtMs: number,
  tokenVersion: number,
): string =>
  createHash("sha256")
    .update(
      `${sessionId}:${ownerSessionId}:${expiresAtMs}:${tokenVersion}:${resumeTokenSecretMaterial}`,
    )
    .digest("base64url");

const encodeResumeToken = (
  sessionId: string,
  ownerSessionId: string,
  expiresAtMs: number,
  tokenVersion: number,
): string =>
  Buffer.from(
    JSON.stringify({
      sessionId,
      ownerSessionId,
      expiresAtMs,
      tokenVersion,
      signature: hashResumePayload(sessionId, ownerSessionId, expiresAtMs, tokenVersion),
    } satisfies ResumeTokenPayload),
    "utf8",
  ).toString("base64url");

const decodeResumeToken = (token: string): ResumeTokenPayload | null => {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const payload = safeJsonParse<ResumeTokenPayload | null>(decoded, null);

  if (
    !payload ||
    payload.sessionId.length === 0 ||
    payload.ownerSessionId.length === 0 ||
    !Number.isFinite(payload.expiresAtMs) ||
    !Number.isFinite(payload.tokenVersion) ||
    payload.signature.length === 0
  ) {
    return null;
  }

  return payload;
};

/**
 * Game Loop Service — server-authoritative tick engine.
 *
 * Call startTick(sessionId, onSnapshot) to begin background simulation.
 * Returns a cleanup function; call it when the client disconnects.
 */
export class GameLoopService {
  private commandQueue = new Map<string, QueuedCommand[]>();
  private commandSeq = new Map<string, number>();
  private lastManualSaveAtMs = new Map<string, number>();
  private tickTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private tickInFlight = new Set<string>();
  private tickCallbacks = new Map<string, Set<SnapshotCallback>>();
  private liveSessions = new Map<string, Mutable<GameSession>>();
  private lastPersistAtMs = new Map<string, number>();
  private resumeTokenVersion = new Map<string, number>();
  private chatWindow = new Map<string, number[]>();

  private mapCommandState = (state: GameCommandState): GameActionState | undefined => {
    if (state === "queued") {
      return "loading";
    }
    if (state === "rejected") {
      return "error.nonRetryable";
    }
    if (state === "dropped") {
      return "error.retryable";
    }
    return undefined;
  };

  private normalizeLocale = (
    sessionLocale: GameLocale,
    commandLocale: string | undefined,
  ): GameLocale => {
    return commandLocale === "zh-CN" || commandLocale === "en-US" ? commandLocale : sessionLocale;
  };

  // ── Session creation ────────────────────────────────────────────────────────

  public async createSession(
    locale: GameLocale = "en-US",
    sceneId = defaultGameConfig.defaultSceneId,
    projectId?: string,
    ownerSessionId: string = "anonymous",
  ): Promise<GameSessionSnapshot> {
    const sessionId = crypto.randomUUID();
    const seed = Math.floor(Math.random() * 100_000);
    const publishedProject =
      typeof projectId === "string" && projectId.trim().length > 0
        ? await builderService.getPublishedProject(projectId)
        : null;
    const dialogueCatalog = Object.fromEntries(
      (
        publishedProject?.dialogues.get(locale) ??
        publishedProject?.dialogues.get(appConfig.defaultLocale) ??
        new Map<string, string>()
      ).entries(),
    );
    const resolvedScene =
      publishedProject?.scenes.get(sceneId) ??
      resolveScene(sceneId) ??
      resolveScene(defaultGameConfig.defaultSceneId);
    if (!resolvedScene) {
      throw new Error("Invalid scene");
    }

    const scene = buildSessionSceneState(
      resolvedScene,
      locale as GameLocale,
      seed,
      dialogueCatalog,
    );

    await gameStateStore.createSession({
      id: sessionId,
      ownerSessionId,
      seed,
      locale,
      scene,
      projectId: publishedProject ? projectId : undefined,
    });
    await initializeProgress(sessionId);
    await processInteractionProgress(sessionId, `scene-${resolvedScene.id}`);

    const saved = await gameStateStore.getSession(sessionId);
    if (!saved.ok) throw new Error(`Failed to create session: ${sessionId}`);

    this.ensureSessionMaps(sessionId);
    this.liveSessions.set(sessionId, saved.payload as Mutable<GameSession>);
    this.lastPersistAtMs.set(sessionId, Date.now());
    this.resumeTokenVersion.set(sessionId, 1);
    this.chatWindow.set(sessionId, []);
    if (typeof ownerSessionId === "string" && ownerSessionId.length > 0) {
      this.getResumeTokenState(sessionId, ownerSessionId, false);
    }
    return gameStateStore.toSnapshot(saved.payload);
  }

  public async restoreSession(
    sessionId: string,
    resumeToken: string,
    ownerSessionId: string,
  ): Promise<GameSessionSnapshot | null> {
    if (!this.isResumeTokenValid(sessionId, resumeToken, ownerSessionId)) {
      return null;
    }

    const sessionResult = await this.getRuntimeSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }
    if (sessionResult.payload.ownerSessionId !== ownerSessionId) {
      return null;
    }

    this.ensureSessionMaps(sessionId);
    this.rotateResumeTokenVersion(sessionId);
    return gameStateStore.toSnapshot(sessionResult.payload);
  }

  public async closeSession(sessionId: string): Promise<boolean> {
    const result = await this.getRuntimeSession(sessionId);
    if (!result.ok) {
      return false;
    }

    await this.persistSessionIfDue(result.payload, true);
    await gameStateStore.deleteSession(sessionId);
    this._clearTick(sessionId);
    this.lastManualSaveAtMs.delete(sessionId);
    this.liveSessions.delete(sessionId);
    this.lastPersistAtMs.delete(sessionId);
    this.resumeTokenVersion.delete(sessionId);
    this.chatWindow.delete(sessionId);
    return true;
  }

  public getCommandQueueDepth(sessionId: string): number {
    return this.commandQueue.get(sessionId)?.length ?? 0;
  }

  public async getSessionState(
    sessionId: string,
    ownerSessionId: string = "anonymous",
  ): Promise<GameSessionState | null> {
    const sessionResult = await this.getRuntimeSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }
    if (sessionResult.payload.ownerSessionId !== ownerSessionId) {
      return null;
    }

    const snapshot = gameStateStore.toSnapshot(sessionResult.payload);
    const resumeTokenState = this.getResumeTokenState(sessionId, ownerSessionId);

    return {
      ...snapshot,
      commandQueueDepth: this.getCommandQueueDepth(sessionId),
      resumeToken: resumeTokenState.token,
      resumeTokenExpiresAtMs: resumeTokenState.expiresAtMs,
      resumeTokenVersion: resumeTokenState.tokenVersion,
      stateVersion: sessionResult.payload.stateVersion,
      version: 1,
    };
  }

  public async getExistingOrThrow(
    sessionId: string,
    ownerSessionId: string = "anonymous",
  ): Promise<GameSessionState | null> {
    return this.getSessionState(sessionId, ownerSessionId);
  }

  public getResumeToken(sessionId: string, ownerSessionId: string): string | null {
    return this.getResumeTokenState(sessionId, ownerSessionId).token;
  }

  public getResumeTokenExpiresAtMs(sessionId: string, ownerSessionId: string): number {
    return this.getResumeTokenState(sessionId, ownerSessionId).expiresAtMs;
  }

  public getSaveCooldownRemainingMs(sessionId: string, nowMs: number = Date.now()): number {
    const lastSavedAtMs = this.lastManualSaveAtMs.get(sessionId) ?? 0;
    const cooldownEndsAtMs = lastSavedAtMs + defaultGameConfig.saveCooldownMs;

    return Math.max(0, cooldownEndsAtMs - nowMs);
  }

  public markManualSave(sessionId: string, nowMs: number = Date.now()): void {
    this.lastManualSaveAtMs.set(sessionId, nowMs);
  }

  /**
   * Forces a persisted snapshot write regardless of throttle window.
   */
  public async saveSessionNow(sessionId: string): Promise<boolean> {
    const sessionResult = await this.getRuntimeSession(sessionId);
    if (!sessionResult.ok) {
      return false;
    }

    await this.persistSessionIfDue(sessionResult.payload, true);
    return true;
  }

  // ── Background tick management ──────────────────────────────────────────────

  /**
   * Registers a snapshot callback and starts the background interval (once per session).
   * Returns a cleanup function — call it on WS close to deregister this callback.
   * The interval stops automatically when all callbacks are removed.
   */
  public startTick(sessionId: string, onSnapshot: SnapshotCallback): () => void {
    let cbs = this.tickCallbacks.get(sessionId);
    if (!cbs) {
      cbs = new Set();
      this.tickCallbacks.set(sessionId, cbs);
    }
    cbs.add(onSnapshot);

    this.ensureTicking(sessionId);

    return () => {
      const callbacks = this.tickCallbacks.get(sessionId);
      callbacks?.delete(onSnapshot);
      if ((callbacks?.size ?? 0) === 0 && this.getCommandQueueDepth(sessionId) === 0) {
        void this.flushSession(sessionId).catch(() => undefined);
      }
    };
  }

  private _clearTick(sessionId: string): void {
    clearTimeout(this.tickTimeouts.get(sessionId));
    this.tickTimeouts.delete(sessionId);
    this.tickInFlight.delete(sessionId);
    this.tickCallbacks.delete(sessionId);
    this.commandQueue.delete(sessionId);
    this.commandSeq.delete(sessionId);
  }

  private ensureSessionMaps(sessionId: string): void {
    if (!this.commandQueue.has(sessionId)) {
      this.commandQueue.set(sessionId, []);
    }
    if (!this.commandSeq.has(sessionId)) {
      this.commandSeq.set(sessionId, 0);
    }
    if (!this.resumeTokenVersion.has(sessionId)) {
      this.resumeTokenVersion.set(sessionId, 1);
    }
    if (!this.chatWindow.has(sessionId)) {
      this.chatWindow.set(sessionId, []);
    }
  }

  private getResumeTokenState(
    sessionId: string,
    ownerSessionId: string,
    rotate: boolean = false,
  ): {
    readonly token: string;
    readonly expiresAtMs: number;
    readonly tokenVersion: number;
  } {
    const currentVersion = this.resumeTokenVersion.get(sessionId) ?? 1;
    const tokenVersion = rotate ? currentVersion + 1 : currentVersion;
    this.resumeTokenVersion.set(sessionId, tokenVersion);
    const expiresAtMs =
      Date.now() + Math.max(defaultGameConfig.sessionResumeWindowMs, defaultGameConfig.tickMs);

    return {
      token: encodeResumeToken(sessionId, ownerSessionId, expiresAtMs, tokenVersion),
      expiresAtMs,
      tokenVersion,
    };
  }

  private isResumeTokenValid(
    sessionId: string,
    resumeToken: string,
    ownerSessionId: string,
  ): boolean {
    const payload = decodeResumeToken(resumeToken);
    if (!payload) {
      return false;
    }

    if (
      payload.sessionId !== sessionId ||
      payload.ownerSessionId !== ownerSessionId ||
      payload.expiresAtMs < Date.now()
    ) {
      return false;
    }

    const expectedVersion = this.resumeTokenVersion.get(sessionId) ?? 1;
    if (payload.tokenVersion !== expectedVersion) {
      return false;
    }

    return (
      payload.signature ===
      hashResumePayload(
        payload.sessionId,
        payload.ownerSessionId,
        payload.expiresAtMs,
        payload.tokenVersion,
      )
    );
  }

  private rotateResumeTokenVersion(sessionId: string): void {
    this.resumeTokenVersion.set(sessionId, (this.resumeTokenVersion.get(sessionId) ?? 1) + 1);
  }

  private async getRuntimeSession(sessionId: string): Promise<
    | {
        readonly ok: true;
        readonly payload: Mutable<GameSession>;
      }
    | {
        readonly ok: false;
        readonly error: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";
      }
  > {
    const liveSession = this.liveSessions.get(sessionId);
    if (liveSession) {
      return { ok: true, payload: liveSession };
    }

    const sessionResult = await gameStateStore.getSession(sessionId);
    if (!sessionResult.ok) {
      return sessionResult;
    }

    const mutableSession = sessionResult.payload as Mutable<GameSession>;
    this.liveSessions.set(sessionId, mutableSession);
    this.ensureSessionMaps(sessionId);
    this.lastPersistAtMs.set(sessionId, Date.now());
    return { ok: true, payload: mutableSession };
  }

  private consumeChatWindow(sessionId: string, nowMs: number = Date.now()): boolean {
    const windowStart = nowMs - defaultGameConfig.chatRateLimitWindowMs;
    const bucket = this.chatWindow.get(sessionId) ?? [];
    const pruned = bucket.filter((ts) => ts >= windowStart);
    if (pruned.length >= defaultGameConfig.maxChatCommandsPerWindow) {
      this.chatWindow.set(sessionId, pruned);
      return false;
    }

    pruned.push(nowMs);
    this.chatWindow.set(sessionId, pruned);
    return true;
  }

  private async persistSessionIfDue(session: Mutable<GameSession>, force: boolean): Promise<void> {
    const now = Date.now();
    const lastPersistAt = this.lastPersistAtMs.get(session.id) ?? 0;
    if (!force && now - lastPersistAt < defaultGameConfig.sessionPersistIntervalMs) {
      return;
    }

    const nextVersion = session.stateVersion + 1;
    const stagedSession = {
      ...session,
      stateVersion: nextVersion,
      updatedAtMs: now,
    } satisfies GameSession;
    await gameStateStore.saveSession(stagedSession);
    session.stateVersion = nextVersion;
    session.updatedAtMs = now;
    this.lastPersistAtMs.set(session.id, now);
  }

  private async flushSession(sessionId: string): Promise<void> {
    const session = this.liveSessions.get(sessionId);
    if (!session) {
      return;
    }
    await this.persistSessionIfDue(session, true);
  }

  private scheduleTick(sessionId: string, delayMs: number): void {
    if (this.tickTimeouts.has(sessionId)) {
      return;
    }

    const timeout = setTimeout(async () => {
      this.tickTimeouts.delete(sessionId);
      if (this.tickInFlight.has(sessionId)) {
        this.scheduleTick(sessionId, defaultGameConfig.tickMs);
        return;
      }

      this.tickInFlight.add(sessionId);
      try {
        const snapshot = await this.tick(sessionId, defaultGameConfig.tickMs);
        if (!snapshot) {
          this._clearTick(sessionId);
          return;
        }

        for (const cb of this.tickCallbacks.get(sessionId) ?? []) {
          cb(snapshot);
        }

        if (this.shouldKeepTicking(sessionId, snapshot.state)) {
          this.scheduleTick(sessionId, defaultGameConfig.tickMs);
          return;
        }

        await this.flushSession(sessionId);
        this._clearTick(sessionId);
      } catch (error) {
        logger.error("tick.failed", {
          sessionId,
          error: String(error),
        });
        const restored = await gameStateStore.getSession(sessionId);
        if (restored.ok) {
          this.liveSessions.set(sessionId, restored.payload as Mutable<GameSession>);
        }
        if (
          (this.tickCallbacks.get(sessionId)?.size ?? 0) > 0 ||
          this.getCommandQueueDepth(sessionId) > 0
        ) {
          this.scheduleTick(sessionId, defaultGameConfig.tickMs);
        }
      } finally {
        this.tickInFlight.delete(sessionId);
      }
    }, delayMs);

    this.tickTimeouts.set(sessionId, timeout);
  }

  private ensureTicking(sessionId: string): void {
    if (this.tickTimeouts.has(sessionId)) {
      return;
    }
    this.scheduleTick(sessionId, defaultGameConfig.tickMs);
  }

  private shouldKeepTicking(sessionId: string, state: GameSceneState): boolean {
    return (
      (this.tickCallbacks.get(sessionId)?.size ?? 0) > 0 ||
      this.getCommandQueueDepth(sessionId) > 0 ||
      state.dialogue !== null
    );
  }

  private isPlayerFacingNpc(
    state: MutableGameSceneState,
    npc: Mutable<(typeof state.npcs)[number]>,
  ): boolean {
    const playerCenterX =
      state.player.position.x + state.player.bounds.x + state.player.bounds.width / 2;
    const playerCenterY =
      state.player.position.y + state.player.bounds.y + state.player.bounds.height / 2;
    const npcCenterX = npc.position.x + npc.bounds.x + npc.bounds.width / 2;
    const npcCenterY = npc.position.y + npc.bounds.y + npc.bounds.height / 2;
    const dx = npcCenterX - playerCenterX;
    const dy = npcCenterY - playerCenterY;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? state.player.facing === "right" : state.player.facing === "left";
    }

    return dy >= 0 ? state.player.facing === "down" : state.player.facing === "up";
  }

  private resolveChatTarget(
    state: MutableGameSceneState,
    npcId: string,
  ): Mutable<(typeof state.npcs)[number]> | null {
    const target = state.npcs.find((candidate) => candidate.id === npcId) as
      | Mutable<(typeof state.npcs)[number]>
      | undefined;
    if (!target) {
      return null;
    }

    const interactable = sceneEngine.findInteractableNpc(
      state.player.position,
      state.player.bounds,
      state.npcs,
    );
    if (!interactable || interactable.id !== npcId) {
      return null;
    }

    if (!this.isPlayerFacingNpc(state, target)) {
      return null;
    }

    return target;
  }

  // ── Command queue ────────────────────────────────────────────────────────────

  public processCommand(
    sessionId: string,
    command: GameCommandInput | unknown,
    sessionLocale: GameLocale,
  ): GameCommandResult {
    this.ensureSessionMaps(sessionId);
    const validation = validateGameCommandInput(command, sessionLocale);
    if (!validation.ok) {
      return {
        sessionId,
        commandId: crypto.randomUUID(),
        sequenceId: 0,
        commandType: undefined,
        state: "rejected",
        commandState: this.mapCommandState("rejected"),
        errorCode: validation.errorCode,
        errorReason: validation.message,
      };
    }

    let queue = this.commandQueue.get(sessionId);
    if (!queue) {
      queue = [] as QueuedCommand[];
      this.commandQueue.set(sessionId, queue);
    }

    const nextSequence = (this.commandSeq.get(sessionId) ?? 0) + 1;
    const safeCommand = {
      ...validation.data,
      sequenceId:
        validation.data.sequenceId && validation.data.sequenceId > 0
          ? validation.data.sequenceId
          : nextSequence,
    } as GameCommandEnvelope;
    const effectiveLocale = this.normalizeLocale(sessionLocale, safeCommand.locale);
    const envelope = {
      ...safeCommand,
      locale: effectiveLocale,
      sequenceId: safeCommand.sequenceId,
    } satisfies GameCommandEnvelope;

    this.commandSeq.set(sessionId, envelope.sequenceId);

    if (isExpired(envelope)) {
      return {
        sessionId,
        commandId: envelope.commandId,
        sequenceId: envelope.sequenceId,
        state: "dropped",
        errorCode: "INVALID_COMMAND",
        errorReason: "command-expired",
        commandType: envelope.command.type,
        commandState: this.mapCommandState("dropped"),
      };
    }

    if (envelope.command.type === "chat" && !this.consumeChatWindow(sessionId)) {
      return {
        sessionId,
        commandId: envelope.commandId,
        sequenceId: envelope.sequenceId,
        state: "dropped",
        errorCode: "CONFLICT",
        errorReason: "chat-rate-limit",
        commandType: envelope.command.type,
        commandState: this.mapCommandState("dropped"),
      };
    }

    if (queue.length < defaultGameConfig.maxCommandsPerTick) {
      queue.push({ envelope });
      this.ensureTicking(sessionId);
      return {
        sessionId,
        commandId: envelope.commandId,
        sequenceId: envelope.sequenceId,
        state: "queued",
        commandType: envelope.command.type,
        commandState: this.mapCommandState("queued"),
      };
    }

    return {
      sessionId,
      commandId: envelope.commandId,
      sequenceId: envelope.sequenceId,
      state: "dropped",
      errorCode: "CONFLICT",
      errorReason: "command-queue-full",
      commandType: envelope.command.type,
      commandState: this.mapCommandState("dropped"),
    };
  }

  // ── Core tick ────────────────────────────────────────────────────────────────

  public async tick(sessionId: string, dtMs: number): Promise<GameSessionSnapshot | undefined> {
    const sessionResult = await this.getRuntimeSession(sessionId);
    if (!sessionResult.ok) return undefined;
    const session = sessionResult.payload;

    const state = session.scene as unknown as MutableGameSceneState;

    // Wrap to prevent float precision loss after ~24 hours
    state.worldTimeMs = (state.worldTimeMs + dtMs) % WORLD_TIME_WRAP_MS;

    const queue = this.commandQueue.get(sessionId) ?? [];
    this.commandQueue.set(sessionId, []);

    let nextActionState: GameSceneState["actionState"] = state.dialogue ? "dialogueOpen" : "empty";
    let commandApplied = false;

    let playerMoved = false;
    let interactionCount = 0;

    for (const queued of queue) {
      const cmd = queued.envelope.command;
      const commandType = cmd.type;

      if (commandType === "interact" || commandType === "chat") {
        interactionCount += 1;
        if (interactionCount > defaultGameConfig.maxInteractionsPerTick) {
          continue;
        }
      }

      if (commandType === "move") {
        const vector = { x: 0, y: 0 };
        if (cmd.direction === "up") vector.y = -1;
        else if (cmd.direction === "down") vector.y = 1;
        else if (cmd.direction === "left") vector.x = -1;
        else if (cmd.direction === "right") vector.x = 1;

        const durationScale = Math.max(
          1,
          Math.round((cmd.durationMs ?? defaultGameConfig.tickMs) / defaultGameConfig.tickMs),
        );
        const speed = Math.max(1, Math.min(defaultGameConfig.maxMovePerTick * durationScale, 80));

        const result = sceneEngine.moveEntity(
          state.player.position,
          state.player.facing,
          state.player.bounds,
          vector,
          speed,
          state.collisions,
          state.npcs,
        );

        state.player.position.x = result.position.x;
        state.player.position.y = result.position.y;
        state.player.facing = result.facing;
        state.player.velocity.x = vector.x * speed;
        state.player.velocity.y = vector.y * speed;
        state.player.animation = `walk-${result.facing}`;
        state.player.frame = result.moved ? state.player.frame + 1 : 0;
        playerMoved = result.moved || playerMoved;
        commandApplied = true;
        nextActionState = result.moved ? "moved" : "blockedByCollision";
      } else if (commandType === "interact") {
        commandApplied = true;
        const interactable = sceneEngine.findInteractableNpc(
          state.player.position,
          state.player.bounds,
          state.npcs,
        ) as Mutable<(typeof state.npcs)[0]> | null;

        if (interactable) {
          interactable.state = "talking";
          interactable.active = true;

          const dx = state.player.position.x - interactable.position.x;
          const dy = state.player.position.y - interactable.position.y;
          interactable.facing =
            Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
          interactable.animation = `idle-${interactable.facing}`;

          const line =
            interactable.dialogueEntries[
              interactable.dialogueIndex % interactable.dialogueEntries.length
            ];
          if (line) {
            state.dialogue = {
              npcId: interactable.id,
              npcLabel: interactable.label,
              line: line.text,
              lineKey: line.key,
            };
            interactable.dialogueIndex++;
            nextActionState = "dialogueOpen";
          } else {
            nextActionState = "error.nonRetryable";
          }

          await processInteractionProgress(sessionId, `npc-${interactable.id}`);
          await awardXp(sessionId, XP_CONFIG.dialogue, "dialogue");
        }
      } else if (commandType === "closeDialogue") {
        commandApplied = true;
        state.dialogue = null;
        for (const npc of state.npcs) {
          if (npc.state === "talking") {
            npc.state = "idle";
          }
        }
        nextActionState = "success";
      } else if (commandType === "chat") {
        commandApplied = true;
        // Enforce chat message length limit before forwarding to AI
        const msg = (cmd.message ?? "").slice(0, defaultGameConfig.maxChatMessageLength);
        if (cmd.npcId && msg.length > 0) {
          const interactable = this.resolveChatTarget(state, cmd.npcId);

          if (interactable?.aiEnabled) {
            interactable.state = "talking";

            const response = await generateNpcDialogue(
              {
                npcId: interactable.characterKey,
                sceneId: state.sceneId,
                playerMessage: msg,
                history:
                  state.dialogue !== null
                    ? [`${state.dialogue.npcLabel}: ${state.dialogue.line}`]
                    : [],
              },
              session.locale,
            );
            const reply = response.ok ? response.text : response.error;

            state.dialogue = {
              npcId: interactable.id,
              npcLabel: interactable.label,
              line: reply,
              lineKey: "ai-response",
            };
            nextActionState = "dialogueOpen";

            await processInteractionProgress(sessionId, `chat-${interactable.id}`);
            await awardXp(sessionId, XP_CONFIG.dialogue, "chat");
          } else {
            nextActionState = "error.nonRetryable";
          }
        } else {
          nextActionState = "error.nonRetryable";
        }
      } else if (commandType === "confirmDialogue") {
        commandApplied = true;
        if (state.dialogue) {
          state.dialogue = null;
          for (const npc of state.npcs) {
            if (npc.state === "talking") {
              npc.state = "idle";
            }
          }
          nextActionState = "success";
        } else {
          nextActionState = "empty";
        }
      } else if (commandType === "retryAction") {
        commandApplied = true;
        nextActionState = "loading";
      }
    }

    if (!commandApplied) {
      nextActionState = state.dialogue ? "dialogueOpen" : "idle";
    }

    if (!playerMoved && state.dialogue === null && nextActionState !== "dialogueOpen") {
      state.player.animation = `idle-${state.player.facing}`;
      state.player.velocity.x = 0;
      state.player.velocity.y = 0;
      state.player.frame = 0;
    }

    state.actionState = nextActionState;

    // Camera: center on player, clamped to scene bounds
    const { width: scW, height: scH } = state.geometry;
    const { viewportWidth: vpW, viewportHeight: vpH } = defaultGameConfig;
    state.camera.x = Math.max(0, Math.min(state.player.position.x - vpW / 2, scW - vpW));
    state.camera.y = Math.max(0, Math.min(state.player.position.y - vpH / 2, scH - vpH));

    // Advance NPC AI
    npcAiEngine.updateNpcs(state, session.seed, dtMs);

    await this.persistSessionIfDue(session, false);
    return gameStateStore.toSnapshot(session);
  }
}

export const gameLoop = new GameLoopService();

import { defaultGameConfig, resolveScene } from "../../shared/config/game-config.ts";
import type {
  GameActionState,
  GameCommandEnvelope,
  GameCommandInput,
  GameCommandResult,
  GameCommandState,
  GameLocale,
  GameSceneState,
  GameSessionSnapshot,
  GameSessionState,
} from "../../shared/contracts/game.ts";
import { validateGameCommandInput } from "../../shared/contracts/game.ts";
import { createOracleService } from "../oracle/oracle-service.ts";
import { resolveGameText } from "./data/game-text.ts";
import { npcAiEngine } from "./npc-ai.ts";
import {
  awardXp,
  initializeProgress,
  processInteractionProgress,
  XP_CONFIG,
} from "./progression.ts";
import { sceneEngine } from "./scene-engine.ts";
import { gameStateStore } from "./services/GameStateStore.ts";
import type { Mutable } from "./types.ts";

const oracleService = createOracleService();

// Wrap worldTimeMs at ~1 day to prevent float precision loss in NPC PRNG
const WORLD_TIME_WRAP_MS = 86_400_007;

type SnapshotCallback = (snapshot: GameSessionSnapshot) => void;

type QueuedCommand = Readonly<{
  /** Envelope accepted by command runtime. */
  readonly envelope: GameCommandEnvelope;
}>;

type ResumeSession = {
  /** Session id paired with active resume token. */
  readonly token: string;
  /** Expiry when resume token should be rejected. */
  readonly expiresAtMs: number;
};

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

/**
 * Game Loop Service — server-authoritative tick engine.
 *
 * Call startTick(sessionId, onSnapshot) to begin background simulation.
 * Returns a cleanup function; call it when the client disconnects.
 */
export class GameLoopService {
  private commandQueue = new Map<string, QueuedCommand[]>();
  private commandSeq = new Map<string, number>();
  private resumeTokens = new Map<string, ResumeSession>();
  private tickIntervals = new Map<string, ReturnType<typeof setInterval>>();
  private tickCallbacks = new Map<string, Set<SnapshotCallback>>();

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
  ): Promise<GameSessionSnapshot> {
    const sceneDef = resolveScene(sceneId);
    if (!sceneDef) throw new Error("Invalid scene");

    const sessionId = crypto.randomUUID();
    const seed = Math.floor(Math.random() * 100_000);

    await gameStateStore.createSession(sessionId, sceneId, locale as GameLocale, seed);
    await initializeProgress(sessionId);
    await processInteractionProgress(sessionId, `scene-${sceneId}`);

    const saved = await gameStateStore.getSession(sessionId);
    if (!saved.ok) throw new Error(`Failed to create session: ${sessionId}`);

    this.commandQueue.set(sessionId, []);
    this.commandSeq.set(sessionId, 0);
    this.resumeTokens.set(sessionId, {
      token: crypto.randomUUID(),
      expiresAtMs:
        Date.now() +
        Math.max(defaultGameConfig.sessionResumeWindowMs, defaultGameConfig.sessionTtlMs),
    });
    return gameStateStore.toSnapshot(saved.payload);
  }

  public async restoreSession(sessionId: string): Promise<GameSessionSnapshot | null> {
    const sessionResult = await gameStateStore.getSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }

    if (!this.commandQueue.has(sessionId)) {
      this.commandQueue.set(sessionId, []);
      this.commandSeq.set(sessionId, 0);
    }

    if (!this.resumeTokens.has(sessionId)) {
      this.resumeTokens.set(sessionId, {
        token: crypto.randomUUID(),
        expiresAtMs:
          Date.now() +
          Math.max(defaultGameConfig.sessionResumeWindowMs, defaultGameConfig.sessionTtlMs),
      });
    }

    return gameStateStore.toSnapshot(sessionResult.payload);
  }

  public async joinSession(
    sessionId: string,
    resumeToken: string,
  ): Promise<GameSessionSnapshot | null> {
    const sessionResult = await gameStateStore.getSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }

    const tokenData = this.resumeTokens.get(sessionId);
    if (!tokenData || tokenData.token !== resumeToken || tokenData.expiresAtMs < Date.now()) {
      return null;
    }

    if (!this.commandQueue.has(sessionId)) {
      this.commandQueue.set(sessionId, []);
      this.commandSeq.set(sessionId, 0);
    }

    return gameStateStore.toSnapshot(sessionResult.payload);
  }

  public async closeSession(sessionId: string): Promise<boolean> {
    const result = await gameStateStore.getSession(sessionId);
    if (!result.ok) {
      return false;
    }

    await gameStateStore.deleteSession(sessionId);
    this._clearTick(sessionId);
    this.resumeTokens.delete(sessionId);
    return true;
  }

  public getCommandQueueDepth(sessionId: string): number {
    return this.commandQueue.get(sessionId)?.length ?? 0;
  }

  public async getSessionState(sessionId: string): Promise<GameSessionState | null> {
    const sessionResult = await gameStateStore.getSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }

    const snapshot = gameStateStore.toSnapshot(sessionResult.payload);
    const resumeToken = this.getResumeToken(sessionId);

    return {
      ...snapshot,
      commandQueueDepth: this.getCommandQueueDepth(sessionId),
      resumeToken: resumeToken ?? "",
      version: 1,
    };
  }

  public async getExistingOrThrow(sessionId: string): Promise<GameSessionState | null> {
    return this.getSessionState(sessionId);
  }

  public getResumeToken(sessionId: string): string | null {
    const tokenData = this.resumeTokens.get(sessionId);
    if (!tokenData) return null;

    if (tokenData.expiresAtMs < Date.now()) {
      this.resumeTokens.delete(sessionId);
      return null;
    }

    return tokenData.token;
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

    if (!this.tickIntervals.has(sessionId)) {
      const interval = setInterval(async () => {
        const snapshot = await this.tick(sessionId, defaultGameConfig.tickMs);
        if (snapshot) {
          for (const cb of this.tickCallbacks.get(sessionId) ?? []) {
            cb(snapshot);
          }
        } else {
          this._clearTick(sessionId);
        }
      }, defaultGameConfig.tickMs);
      this.tickIntervals.set(sessionId, interval);
    }

    return () => {
      const callbacks = this.tickCallbacks.get(sessionId);
      callbacks?.delete(onSnapshot);
      if ((callbacks?.size ?? 0) === 0) {
        this._clearTick(sessionId);
      }
    };
  }

  private _clearTick(sessionId: string): void {
    clearInterval(this.tickIntervals.get(sessionId));
    this.tickIntervals.delete(sessionId);
    this.tickCallbacks.delete(sessionId);
    this.commandQueue.delete(sessionId);
    this.commandSeq.delete(sessionId);
  }

  // ── Command queue ────────────────────────────────────────────────────────────

  public processCommand(
    sessionId: string,
    command: GameCommandInput | unknown,
    sessionLocale: GameLocale,
  ): GameCommandResult {
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

    if (queue.length < defaultGameConfig.maxCommandsPerTick) {
      queue.push({ envelope });
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
    const sessionResult = await gameStateStore.getSession(sessionId);
    if (!sessionResult.ok) return undefined;
    const session = sessionResult.payload;

    const state = session.scene as Mutable<GameSceneState>;

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
        state.player.animation = `walk-${result.facing}`;
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

          const dx = state.player.position.x - interactable.position.x;
          const dy = state.player.position.y - interactable.position.y;
          interactable.facing =
            Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
          interactable.animation = `idle-${interactable.facing}`;

          const lineKey =
            interactable.dialogueLineKeys[
              interactable.dialogueIndex % interactable.dialogueLineKeys.length
            ];
          if (lineKey) {
            state.dialogue = {
              npcId: interactable.id,
              npcLabel: interactable.label,
              line: resolveGameText(session.locale, lineKey),
              lineKey,
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
          if (npc.state === "talking") npc.state = "idle";
        }
        nextActionState = "success";
      } else if (commandType === "chat") {
        commandApplied = true;
        // Enforce chat message length limit before forwarding to AI
        const msg = (cmd.message ?? "").slice(0, defaultGameConfig.maxChatMessageLength);
        if (cmd.npcId && msg.length > 0) {
          const interactable = state.npcs.find((n) => n.id === cmd.npcId) as
            | Mutable<(typeof state.npcs)[0]>
            | undefined;

          if (interactable?.aiEnabled) {
            interactable.state = "talking";

            const response = await oracleService.evaluate({
              question: msg,
              locale: session.locale,
              hasSession: true,
              mode: "auto",
            });

            const reply =
              response.state === "success"
                ? response.answer
                : "message" in response
                  ? response.message
                  : "";

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
        nextActionState = state.dialogue ? "success" : "empty";
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
    }

    state.actionState = nextActionState;

    // Camera: center on player, clamped to scene bounds
    const sceneDef = resolveScene(state.sceneId);
    if (sceneDef) {
      const { width: scW, height: scH } = sceneDef.geometry;
      const { viewportWidth: vpW, viewportHeight: vpH } = defaultGameConfig;
      state.camera.x = Math.max(0, Math.min(state.player.position.x - vpW / 2, scW - vpW));
      state.camera.y = Math.max(0, Math.min(state.player.position.y - vpH / 2, scH - vpH));
    }

    // Advance NPC AI
    npcAiEngine.updateNpcs(state, session.seed, dtMs);

    await gameStateStore.saveSession(session);
    return gameStateStore.toSnapshot(session);
  }
}

export const gameLoop = new GameLoopService();

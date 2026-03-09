import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../shared/config/game-config.ts";
import type {
  CombatEncounterState,
  CutscenePlaybackState,
  CutsceneStep,
  GameActionState,
  GameCommandEnvelope,
  GameCommandInput,
  GameCommandResult,
  GameCommandState,
  GameFlagDefinition,
  GameHudState,
  GameLocale,
  GameParticipantPresence,
  GameSceneState,
  GameSession,
  GameSessionParticipant,
  GameSessionParticipantRole,
  GameSessionSnapshot,
  GameSessionState,
  PlayerInventoryState,
  QuestDefinition,
  SceneNodeDefinition,
  TriggerDefinition,
  TriggerEventType,
} from "../../shared/contracts/game.ts";
import { validateGameCommandInput } from "../../shared/contracts/game.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import { builderService } from "../builder/builder-service.ts";
import { generateNpcDialogue } from "./ai/game-ai-service.ts";
import { combatEngine } from "./combat-engine.ts";
import { cutsceneEngine } from "./cutscene-engine.ts";
import { inventoryService } from "./inventory-service.ts";
import { npcAiEngine } from "./npc-ai.ts";
import { XP_CONFIG } from "./progression.ts";
import { sceneEngine } from "./scene-engine.ts";
import {
  type GameStateStore,
  gameStateStore,
  type StoreResult,
} from "./services/GameStateStore.ts";
import { type PlayerProgressStore, playerProgressStore } from "./services/player-progress-store.ts";
import type { Mutable, MutableGameSceneState } from "./types.ts";
import { buildSessionSceneState } from "./utils/session-state.ts";

// Wrap worldTimeMs at ~1 day to prevent float precision loss in NPC PRNG
const WORLD_TIME_WRAP_MS = defaultGameConfig.worldTimeWrapMs;
const MULTIPLAYER_PRESENCE_OFFSETS: readonly Readonly<{
  readonly x: number;
  readonly y: number;
}>[] = [
  { x: 56, y: 0 },
  { x: -56, y: 0 },
  { x: 0, y: 56 },
  { x: 0, y: -56 },
  { x: 40, y: 40 },
  { x: -40, y: 40 },
];
const PRESENCE_CHARACTER_BY_ROLE: Readonly<
  Record<Exclude<GameSessionParticipantRole, "owner">, string>
> = {
  controller: "riverPilot",
  spectator: "merchant",
};
const logger = createLogger("game.loop");
const resumeTokenSecretMaterial = [
  appConfig.applicationName,
  appConfig.auth.sessionCookieName,
  appConfig.auth.resumeTokenSecret,
  defaultGameConfig.defaultSceneId,
].join(":");

type SnapshotCallback = (snapshot: GameSessionSnapshot) => void;

type RuntimeActorEntity =
  | MutableGameSceneState["player"]
  | NonNullable<MutableGameSceneState["coPlayers"]>[number]["entity"];

interface GameLoopDependencies {
  /** Canonical session persistence owner. */
  readonly stateStore?: GameStateStore;
  /** Canonical player-progress persistence owner. */
  readonly progressStore?: PlayerProgressStore;
}

type QueuedCommand = Readonly<{
  /** Envelope accepted by command runtime. */
  readonly envelope: GameCommandEnvelope;
  /** Authenticated participant that issued the command. */
  readonly participantSessionId: string;
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
  readonly participantSessionId: string;
  /** Expiry timestamp in ms since epoch. */
  readonly expiresAtMs: number;
  /** Monotonic token version per gameplay session. */
  readonly tokenVersion: number;
  /** Integrity signature over the payload. */
  readonly signature: string;
};

type InviteTokenPayload = {
  /** Stable session identifier. */
  readonly sessionId: string;
  /** Owner session allowed to mint the invite. */
  readonly ownerSessionId: string;
  /** Granted room role. */
  readonly role: Exclude<GameSessionParticipantRole, "owner">;
  /** Invite expiry timestamp in ms since epoch. */
  readonly expiresAtMs: number;
  /** Integrity signature over the payload. */
  readonly signature: string;
};

const hashResumePayload = (
  sessionId: string,
  participantSessionId: string,
  expiresAtMs: number,
  tokenVersion: number,
): string =>
  Bun.hash(
    `${sessionId}:${participantSessionId}:${expiresAtMs}:${tokenVersion}:${resumeTokenSecretMaterial}`,
  ).toString(36);

const hashInvitePayload = (
  sessionId: string,
  ownerSessionId: string,
  role: Exclude<GameSessionParticipantRole, "owner">,
  expiresAtMs: number,
): string =>
  Bun.hash(
    `${sessionId}:${ownerSessionId}:${role}:${expiresAtMs}:${resumeTokenSecretMaterial}`,
  ).toString(36);

const encodeResumeToken = (
  sessionId: string,
  participantSessionId: string,
  expiresAtMs: number,
  tokenVersion: number,
): string =>
  Buffer.from(
    JSON.stringify({
      sessionId,
      participantSessionId,
      expiresAtMs,
      tokenVersion,
      signature: hashResumePayload(sessionId, participantSessionId, expiresAtMs, tokenVersion),
    } satisfies ResumeTokenPayload),
    "utf8",
  ).toString("base64url");

const encodeInviteToken = (
  sessionId: string,
  ownerSessionId: string,
  role: Exclude<GameSessionParticipantRole, "owner">,
  expiresAtMs: number,
): string =>
  Buffer.from(
    JSON.stringify({
      sessionId,
      ownerSessionId,
      role,
      expiresAtMs,
      signature: hashInvitePayload(sessionId, ownerSessionId, role, expiresAtMs),
    } satisfies InviteTokenPayload),
    "utf8",
  ).toString("base64url");

const decodeResumeToken = (token: string): ResumeTokenPayload | null => {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const payload = safeJsonParse<ResumeTokenPayload | null>(decoded, null);

  if (
    !payload ||
    payload.sessionId.length === 0 ||
    payload.participantSessionId.length === 0 ||
    !Number.isFinite(payload.expiresAtMs) ||
    !Number.isFinite(payload.tokenVersion) ||
    payload.signature.length === 0
  ) {
    return null;
  }

  return payload;
};

const decodeInviteToken = (token: string): InviteTokenPayload | null => {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const payload = safeJsonParse<InviteTokenPayload | null>(decoded, null);

  if (
    !payload ||
    payload.sessionId.length === 0 ||
    payload.ownerSessionId.length === 0 ||
    (payload.role !== "controller" && payload.role !== "spectator") ||
    !Number.isFinite(payload.expiresAtMs) ||
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
  private readonly stateStore: GameStateStore;
  private readonly progressStore: PlayerProgressStore;
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

  public constructor(deps: GameLoopDependencies = {}) {
    this.stateStore = deps.stateStore ?? gameStateStore;
    this.progressStore = deps.progressStore ?? playerProgressStore;
  }

  private actorTokenKey(sessionId: string, participantSessionId: string): string {
    return `${sessionId}:${participantSessionId}`;
  }

  private async listSessionParticipants(
    session: GameSession,
  ): Promise<readonly GameSessionParticipant[]> {
    const persistedParticipants = await this.stateStore.listParticipants(session.id);
    return [
      {
        sessionId: session.ownerSessionId,
        role: "owner",
        joinedAtMs: session.createdAtMs,
        updatedAtMs: session.updatedAtMs,
      },
      ...persistedParticipants,
    ];
  }

  private async enrichSessionParticipants(
    session: Mutable<GameSession>,
  ): Promise<Mutable<GameSession>> {
    session.participants = [...(await this.listSessionParticipants(session))];
    this.syncParticipantPresence(session);
    return session;
  }

  private buildParticipantPresence(session: GameSession): readonly GameParticipantPresence[] {
    const ownerBounds = session.scene.player.bounds;
    const existingPresenceBySessionId = new Map(
      (session.scene.coPlayers ?? []).map((presence) => [presence.sessionId, presence]),
    );
    const resolvedPresenceEntities: RuntimeActorEntity[] = [];

    return session.participants
      .filter(
        (
          participant,
        ): participant is GameSessionParticipant & {
          readonly role: Exclude<GameSessionParticipantRole, "owner">;
        } => participant.role !== "owner",
      )
      .map((participant, index) => {
        const existingPresence = existingPresenceBySessionId.get(participant.sessionId);
        const characterKey = PRESENCE_CHARACTER_BY_ROLE[participant.role];
        const entity = existingPresence?.entity;
        const position =
          entity?.position ??
          this.resolveParticipantSpawnPosition(session, index, resolvedPresenceEntities);
        const nextPresence = {
          sessionId: participant.sessionId,
          role: participant.role,
          entity: {
            id: `participant-${participant.sessionId}`,
            label: participant.sessionId,
            characterKey,
            position,
            facing: entity?.facing ?? session.scene.player.facing,
            animation: entity?.animation ?? `idle-${session.scene.player.facing}`,
            frame: entity?.frame ?? 0,
            velocity: entity?.velocity ?? { x: 0, y: 0 },
            bounds: entity?.bounds ?? ownerBounds,
          },
        } satisfies GameParticipantPresence;
        resolvedPresenceEntities.push(nextPresence.entity);

        return nextPresence;
      });
  }

  private syncParticipantPresence(session: Mutable<GameSession>): void {
    session.scene.coPlayers = [...this.buildParticipantPresence(session)];
  }

  private resolveParticipantSpawnPosition(
    session: GameSession,
    index: number,
    claimedEntities: readonly RuntimeActorEntity[],
  ): RuntimeActorEntity["position"] {
    const ownerPosition = session.scene.player.position;
    const ownerBounds = session.scene.player.bounds;
    const candidateOffsets = [
      ...MULTIPLAYER_PRESENCE_OFFSETS,
      { x: 0, y: -96 },
      { x: 96, y: 0 },
      { x: -96, y: 0 },
      { x: 0, y: 96 },
    ];

    for (let attempt = 0; attempt < candidateOffsets.length; attempt += 1) {
      const offset = candidateOffsets[(index + attempt) % candidateOffsets.length] ??
        candidateOffsets[0] ?? { x: 0, y: -96 };
      const candidate = {
        x: ownerPosition.x + offset.x,
        y: ownerPosition.y + offset.y,
      };
      const footX = candidate.x + ownerBounds.x;
      const footY = candidate.y + ownerBounds.y;
      const collidesScene = sceneEngine.checkStaticCollision(
        footX,
        footY,
        ownerBounds.width,
        ownerBounds.height,
        session.scene.collisions,
      );
      const collidesNpc = sceneEngine.checkNpcCollision(
        footX,
        footY,
        ownerBounds.width,
        ownerBounds.height,
        session.scene.npcs,
      );
      const collidesParticipant = claimedEntities.some((entity) => {
        const otherX = entity.position.x + entity.bounds.x;
        const otherY = entity.position.y + entity.bounds.y;
        return (
          footX < otherX + entity.bounds.width &&
          footX + ownerBounds.width > otherX &&
          footY < otherY + entity.bounds.height &&
          footY + ownerBounds.height > otherY
        );
      });
      if (!collidesScene && !collidesNpc && !collidesParticipant) {
        return candidate;
      }
    }

    return {
      x: ownerPosition.x,
      y: ownerPosition.y - 96,
    };
  }

  private resolveSceneActor(
    state: MutableGameSceneState,
    session: GameSession,
    participantSessionId: string,
  ): RuntimeActorEntity | null {
    if (participantSessionId === session.ownerSessionId) {
      return state.player;
    }

    const presence = state.coPlayers?.find(
      (candidate) => candidate.sessionId === participantSessionId,
    );
    return presence?.entity ?? null;
  }

  private resolveParticipantRole(
    session: GameSession,
    participantSessionId: string,
  ): GameSessionParticipantRole | null {
    if (session.ownerSessionId === participantSessionId) {
      return "owner";
    }

    return (
      session.participants.find((participant) => participant.sessionId === participantSessionId)
        ?.role ?? null
    );
  }

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

  private buildInitialFlags(
    definitions: readonly GameFlagDefinition[] | undefined,
  ): Readonly<Record<string, string | number | boolean>> {
    return Object.fromEntries(
      (definitions ?? []).map((definition) => [definition.key, definition.initialValue]),
    );
  }

  private buildInitialQuests(
    definitions: readonly QuestDefinition[] | undefined,
  ): NonNullable<MutableGameSceneState["quests"]> {
    return (definitions ?? []).map((definition) => ({
      id: definition.id,
      title: definition.title,
      description: definition.description,
      completed: false,
      steps: definition.steps.map((step, index) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        state: index === 0 ? "active" : "pending",
      })),
    })) as NonNullable<MutableGameSceneState["quests"]>;
  }

  private triggerMatchesRequiredFlags(
    state: MutableGameSceneState,
    trigger: TriggerDefinition,
  ): boolean {
    const requiredFlags = trigger.requiredFlags;
    if (!requiredFlags) {
      return true;
    }

    const runtimeFlags = state.flags ?? {};
    return Object.entries(requiredFlags).every(([key, value]) => runtimeFlags[key] === value);
  }

  private advanceQuestState(
    state: MutableGameSceneState,
    questId: string,
    questStepId: string,
  ): boolean {
    const quest = state.quests?.find((candidate) => candidate.id === questId);
    if (!quest) {
      return false;
    }

    const targetStep = quest.steps.find((candidate) => candidate.id === questStepId);
    if (!targetStep || targetStep.state === "completed") {
      return false;
    }

    targetStep.state = "completed";
    const nextPendingStep = quest.steps.find((candidate) => candidate.state === "pending");
    if (nextPendingStep) {
      nextPendingStep.state = "active";
    }
    quest.completed = quest.steps.every((candidate) => candidate.state === "completed");
    return true;
  }

  private applyMatchingTriggers(
    state: MutableGameSceneState,
    triggers: readonly TriggerDefinition[],
    event: TriggerEventType,
    context: Readonly<{
      readonly sceneId: string;
      readonly npcCharacterKey?: string;
      readonly nodeId?: string;
    }>,
  ): boolean {
    let changed = false;

    for (const trigger of triggers) {
      if (trigger.event !== event) {
        continue;
      }
      if (trigger.sceneId && trigger.sceneId !== context.sceneId) {
        continue;
      }
      if (trigger.npcId && trigger.npcId !== context.npcCharacterKey) {
        continue;
      }
      if (trigger.nodeId && trigger.nodeId !== context.nodeId) {
        continue;
      }
      if (!this.triggerMatchesRequiredFlags(state, trigger)) {
        continue;
      }

      let triggerChanged = false;
      if (trigger.setFlags) {
        const runtimeFlags = { ...(state.flags ?? {}) };
        for (const [key, value] of Object.entries(trigger.setFlags)) {
          if (runtimeFlags[key] !== value) {
            runtimeFlags[key] = value;
            triggerChanged = true;
          }
        }
        if (triggerChanged) {
          state.flags = runtimeFlags;
        }
      }

      if (trigger.questId && trigger.questStepId) {
        triggerChanged =
          this.advanceQuestState(state, trigger.questId, trigger.questStepId) || triggerChanged;
      }

      if (trigger.cutsceneId) {
        state.cutscene = cutsceneEngine.startCutscene(trigger.cutsceneId);
        triggerChanged = true;
      }

      changed = triggerChanged || changed;
    }

    return changed;
  }

  private resolveTriggeredSceneNode(
    state: MutableGameSceneState,
    actor: RuntimeActorEntity,
  ): SceneNodeDefinition | null {
    const nodes = state.nodes ?? [];
    const actorX = actor.position.x;
    const actorY = actor.position.y;

    for (const node of nodes) {
      if (node.nodeType !== "trigger") {
        continue;
      }

      if ("size" in node) {
        const withinX = actorX >= node.position.x && actorX <= node.position.x + node.size.width;
        const withinY = actorY >= node.position.y && actorY <= node.position.y + node.size.height;
        if (withinX && withinY) {
          return node;
        }
        continue;
      }

      const dx = actorX - node.position.x;
      const dy = actorY - node.position.y;
      const dz = 0 - node.position.z;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) <= 64) {
        return node;
      }
    }

    return null;
  }

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
    const publishedFlags = publishedProject ? Array.from(publishedProject.flags.values()) : [];
    const publishedQuests = publishedProject ? Array.from(publishedProject.quests.values()) : [];
    const publishedTriggers = publishedProject
      ? Array.from(publishedProject.triggers.values())
      : [];
    const dialogueCatalog = Object.fromEntries(
      (
        publishedProject?.dialogues.get(locale) ??
        publishedProject?.dialogues.get(appConfig.defaultLocale) ??
        new Map<string, string>()
      ).entries(),
    );
    const resolvedScene = publishedProject?.scenes.get(sceneId) ??
      resolveScene(sceneId) ??
      resolveScene(defaultGameConfig.defaultSceneId) ?? {
        id: defaultGameConfig.defaultSceneId,
        sceneMode: "2d",
        titleKey: "scene.teaHouse.title",
        background: "",
        geometry: {
          width: defaultGameConfig.viewportWidth,
          height: defaultGameConfig.viewportHeight,
        },
        spawn: {
          x: Math.round(defaultGameConfig.viewportWidth / 2),
          y: Math.round(defaultGameConfig.viewportHeight / 2),
        },
        nodes: [],
        npcs: [],
        collisions: [],
      };

    const scene = buildSessionSceneState(
      resolvedScene,
      locale as GameLocale,
      seed,
      dialogueCatalog,
      publishedFlags,
      publishedQuests,
      publishedProject ? Array.from(publishedProject.assets.values()) : [],
    );
    const mutableScene = scene as MutableGameSceneState;
    mutableScene.flags = this.buildInitialFlags(publishedFlags);
    mutableScene.quests = this.buildInitialQuests(publishedQuests);
    if (publishedTriggers.length > 0) {
      this.applyMatchingTriggers(mutableScene, publishedTriggers, "scene-enter", {
        sceneId: resolvedScene.id,
      });
    }

    await this.stateStore.createSession({
      id: sessionId,
      ownerSessionId,
      seed,
      locale,
      scene,
      projectId: publishedProject ? projectId : undefined,
      releaseVersion: publishedProject?.publishedReleaseVersion ?? undefined,
      triggerDefinitions: publishedTriggers,
    });
    await this.progressStore.initialize(sessionId);
    await this.progressStore.processInteraction(
      sessionId,
      `scene-${resolvedScene.id}`,
      XP_CONFIG.sceneDiscovery,
    );

    const saved = await this.stateStore.getSession(sessionId);
    if (!saved.ok) throw new Error(`Failed to create session: ${sessionId}`);

    this.ensureSessionMaps(sessionId);
    const liveSession = (await this.enrichSessionParticipants(
      saved.payload as Mutable<GameSession>,
    )) as Mutable<GameSession>;
    this.liveSessions.set(sessionId, liveSession);
    this.lastPersistAtMs.set(sessionId, Date.now());
    this.chatWindow.set(sessionId, []);
    if (typeof ownerSessionId === "string" && ownerSessionId.length > 0) {
      this.getResumeTokenState(sessionId, ownerSessionId, false);
    }
    return this.stateStore.toSnapshot(liveSession);
  }

  public async restoreSession(
    sessionId: string,
    resumeToken: string,
    participantSessionId: string,
  ): Promise<GameSessionSnapshot | null> {
    if (!this.isResumeTokenValid(sessionId, resumeToken, participantSessionId)) {
      return null;
    }

    const sessionResult = await this.getRuntimeSession(sessionId);
    if (!sessionResult.ok) {
      return null;
    }
    await this.enrichSessionParticipants(sessionResult.payload);
    if (!this.resolveParticipantRole(sessionResult.payload, participantSessionId)) {
      return null;
    }

    this.ensureSessionMaps(sessionId);
    this.rotateResumeTokenVersion(sessionId, participantSessionId);
    await this.enrichSessionParticipants(sessionResult.payload);
    return this.stateStore.toSnapshot(sessionResult.payload);
  }

  /**
   * Returns the canonical count of active non-expired gameplay sessions.
   */
  public async countActiveSessions(): Promise<number> {
    return this.stateStore.countActiveSessions();
  }

  /**
   * Loads one persisted gameplay session without mutating transport state.
   */
  public async getStoredSession(sessionId: string): Promise<StoreResult<GameSession>> {
    return this.stateStore.getSession(sessionId);
  }

  /**
   * Removes expired sessions through the canonical runtime owner.
   */
  public async purgeExpiredSessions(): Promise<number> {
    return this.stateStore.purgeExpiredSessions();
  }

  public async closeSession(sessionId: string): Promise<boolean> {
    const result = await this.getRuntimeSession(sessionId);
    if (!result.ok) {
      return false;
    }

    await this.persistSessionIfDue(result.payload, true);
    await this.stateStore.deleteSession(sessionId);
    this._clearTick(sessionId);
    this.lastManualSaveAtMs.delete(sessionId);
    this.liveSessions.delete(sessionId);
    this.lastPersistAtMs.delete(sessionId);
    for (const tokenKey of [...this.resumeTokenVersion.keys()]) {
      if (tokenKey.startsWith(`${sessionId}:`)) {
        this.resumeTokenVersion.delete(tokenKey);
      }
    }
    this.chatWindow.delete(sessionId);
    return true;
  }

  public getCommandQueueDepth(sessionId: string): number {
    return this.commandQueue.get(sessionId)?.length ?? 0;
  }

  public async getSessionState(
    sessionId: string,
    participantSessionId: string = "anonymous",
  ): Promise<GameSessionState | null> {
    const sessionResult = await this.getRuntimeSession(sessionId, true);
    if (!sessionResult.ok) {
      return null;
    }
    await this.enrichSessionParticipants(sessionResult.payload);
    const participantRole = this.resolveParticipantRole(
      sessionResult.payload,
      participantSessionId,
    );
    if (!participantRole) {
      return null;
    }

    const snapshot = this.stateStore.toSnapshot(sessionResult.payload);
    const resumeTokenState = this.getResumeTokenState(sessionId, participantSessionId);

    return {
      ...snapshot,
      participantSessionId,
      participantRole,
      participants: sessionResult.payload.participants,
      commandQueueDepth: this.getCommandQueueDepth(sessionId),
      resumeToken: resumeTokenState.token,
      resumeTokenExpiresAtMs: resumeTokenState.expiresAtMs,
      resumeTokenVersion: resumeTokenState.tokenVersion,
      stateVersion: sessionResult.payload.stateVersion,
      version: 1,
    };
  }

  /**
   * Returns a canonical HUD snapshot for the active session owner.
   */
  public async getHudState(
    sessionId: string,
    participantSessionId: string = "anonymous",
  ): Promise<GameHudState | null> {
    const sessionResult = await this.getRuntimeSession(sessionId, true);
    if (!sessionResult.ok) {
      return null;
    }
    await this.enrichSessionParticipants(sessionResult.payload);
    const participantRole = this.resolveParticipantRole(
      sessionResult.payload,
      participantSessionId,
    );
    if (!participantRole) {
      return null;
    }

    const progress = await this.progressStore.getSnapshot(sessionId);
    const activeQuest =
      sessionResult.payload.scene.quests?.find((quest) => !quest.completed) ??
      sessionResult.payload.scene.quests?.[0];

    let activeCutsceneStep: CutsceneStep | undefined;
    if (sessionResult.payload.scene.cutscene) {
      const state = sessionResult.payload.scene.cutscene;
      const def = sessionResult.payload.cutsceneDefinitions?.find((c) => c.id === state.cutsceneId);
      if (def && state.currentStepIndex < def.steps.length) {
        activeCutsceneStep = def.steps[state.currentStepIndex];
      }
    }

    return {
      sessionId,
      sceneTitle: sessionResult.payload.scene.sceneTitle,
      sceneMode: sessionResult.payload.scene.sceneMode,
      activeQuestTitle: activeQuest?.title,
      locale: sessionResult.payload.locale,
      participantRole,
      participants: sessionResult.payload.participants,
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      dialogue: sessionResult.payload.scene.dialogue,
      combat: sessionResult.payload.scene.combat,
      inventory:
        sessionResult.payload.scene.actionState === "inventoryOpen"
          ? sessionResult.payload.scene.inventory
          : undefined,
      cutscene: sessionResult.payload.scene.cutscene,
      activeCutsceneStep,
    };
  }

  public async getExistingOrThrow(
    sessionId: string,
    participantSessionId: string = "anonymous",
  ): Promise<GameSessionState | null> {
    return this.getSessionState(sessionId, participantSessionId);
  }

  public getResumeToken(sessionId: string, participantSessionId: string): string | null {
    return this.getResumeTokenState(sessionId, participantSessionId).token;
  }

  public getResumeTokenExpiresAtMs(sessionId: string, participantSessionId: string): number {
    return this.getResumeTokenState(sessionId, participantSessionId).expiresAtMs;
  }

  /**
   * Creates a shareable invite token for a non-owner multiplayer participant.
   */
  public async createInviteToken(
    sessionId: string,
    ownerSessionId: string,
    role: Exclude<GameSessionParticipantRole, "owner">,
  ): Promise<string | null> {
    const sessionResult = await this.getRuntimeSession(sessionId, true);
    if (!sessionResult.ok || sessionResult.payload.ownerSessionId !== ownerSessionId) {
      return null;
    }

    const expiresAtMs =
      Date.now() + Math.max(defaultGameConfig.sessionResumeWindowMs, defaultGameConfig.tickMs);
    return encodeInviteToken(sessionId, ownerSessionId, role, expiresAtMs);
  }

  /**
   * Admits a participant into an existing shared gameplay session.
   */
  public async joinSession(
    inviteToken: string,
    participantSessionId: string,
  ): Promise<GameSessionState | null> {
    const payload = decodeInviteToken(inviteToken);
    if (!payload || payload.expiresAtMs < Date.now()) {
      return null;
    }

    const sessionResult = await this.getRuntimeSession(payload.sessionId, true);
    if (!sessionResult.ok || sessionResult.payload.ownerSessionId !== payload.ownerSessionId) {
      return null;
    }

    if (participantSessionId !== payload.ownerSessionId) {
      await this.stateStore.saveParticipant(payload.sessionId, participantSessionId, payload.role);
    }

    return this.getSessionState(payload.sessionId, participantSessionId);
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
        void this.flushSession(sessionId).catch((error: unknown) => {
          logger.warn("game-loop.flush.teardown-failed", { sessionId, error: String(error) });
        });
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
    if (!this.chatWindow.has(sessionId)) {
      this.chatWindow.set(sessionId, []);
    }
  }

  private getResumeTokenState(
    sessionId: string,
    participantSessionId: string,
    rotate: boolean = false,
  ): {
    readonly token: string;
    readonly expiresAtMs: number;
    readonly tokenVersion: number;
  } {
    const tokenKey = this.actorTokenKey(sessionId, participantSessionId);
    const currentVersion = this.resumeTokenVersion.get(tokenKey) ?? 1;
    const tokenVersion = rotate ? currentVersion + 1 : currentVersion;
    this.resumeTokenVersion.set(tokenKey, tokenVersion);
    const expiresAtMs =
      Date.now() + Math.max(defaultGameConfig.sessionResumeWindowMs, defaultGameConfig.tickMs);

    return {
      token: encodeResumeToken(sessionId, participantSessionId, expiresAtMs, tokenVersion),
      expiresAtMs,
      tokenVersion,
    };
  }

  private isResumeTokenValid(
    sessionId: string,
    resumeToken: string,
    participantSessionId: string,
  ): boolean {
    const payload = decodeResumeToken(resumeToken);
    if (!payload) {
      return false;
    }

    if (
      payload.sessionId !== sessionId ||
      payload.participantSessionId !== participantSessionId ||
      payload.expiresAtMs < Date.now()
    ) {
      return false;
    }

    const expectedVersion =
      this.resumeTokenVersion.get(this.actorTokenKey(sessionId, participantSessionId)) ?? 1;
    if (payload.tokenVersion !== expectedVersion) {
      return false;
    }

    return (
      payload.signature ===
      hashResumePayload(
        payload.sessionId,
        payload.participantSessionId,
        payload.expiresAtMs,
        payload.tokenVersion,
      )
    );
  }

  private rotateResumeTokenVersion(sessionId: string, participantSessionId: string): void {
    const tokenKey = this.actorTokenKey(sessionId, participantSessionId);
    this.resumeTokenVersion.set(tokenKey, (this.resumeTokenVersion.get(tokenKey) ?? 1) + 1);
  }

  private async getRuntimeSession(
    sessionId: string,
    refreshPersisted: boolean = false,
  ): Promise<
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
      if (refreshPersisted) {
        const persisted = await this.stateStore.getSession(sessionId);
        if (
          persisted.ok &&
          (persisted.payload.stateVersion > liveSession.stateVersion ||
            persisted.payload.updatedAtMs > liveSession.updatedAtMs)
        ) {
          const refreshedSession = persisted.payload as Mutable<GameSession>;
          await this.enrichSessionParticipants(refreshedSession);
          this.liveSessions.set(sessionId, refreshedSession);
          return { ok: true, payload: refreshedSession };
        }
      }
      await this.enrichSessionParticipants(liveSession);
      return { ok: true, payload: liveSession };
    }

    const sessionResult = await this.stateStore.getSession(sessionId);
    if (!sessionResult.ok) {
      return sessionResult;
    }

    const mutableSession = sessionResult.payload as Mutable<GameSession>;
    await this.enrichSessionParticipants(mutableSession);
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
    await this.stateStore.saveSession(stagedSession);
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
      this.tickInFlight.add(sessionId);

      const runTick = async (): Promise<void> => {
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
      };

      await runTick().catch(async (error: unknown) => {
        logger.error("tick.failed", {
          sessionId,
          error: String(error),
        });
        const restored = await this.stateStore.getSession(sessionId).catch(() => null);
        if (restored?.ok) {
          this.liveSessions.set(sessionId, restored.payload as Mutable<GameSession>);
        }
        if (
          (this.tickCallbacks.get(sessionId)?.size ?? 0) > 0 ||
          this.getCommandQueueDepth(sessionId) > 0
        ) {
          this.scheduleTick(sessionId, defaultGameConfig.tickMs);
        }
      });

      this.tickInFlight.delete(sessionId);
    }, delayMs);

    this.tickTimeouts.set(sessionId, timeout);
  }

  private ensureTicking(sessionId: string, delayMs: number = defaultGameConfig.tickMs): void {
    if (this.tickTimeouts.has(sessionId)) {
      return;
    }
    this.scheduleTick(sessionId, delayMs);
  }

  private shouldKeepTicking(sessionId: string, state: GameSceneState): boolean {
    return (
      (this.tickCallbacks.get(sessionId)?.size ?? 0) > 0 ||
      this.getCommandQueueDepth(sessionId) > 0 ||
      state.dialogue !== null
    );
  }

  private isActorFacingNpc(
    actor: RuntimeActorEntity,
    npc: Mutable<MutableGameSceneState["npcs"][number]>,
  ): boolean {
    const playerCenterX = actor.position.x + actor.bounds.x + actor.bounds.width / 2;
    const playerCenterY = actor.position.y + actor.bounds.y + actor.bounds.height / 2;
    const npcCenterX = npc.position.x + npc.bounds.x + npc.bounds.width / 2;
    const npcCenterY = npc.position.y + npc.bounds.y + npc.bounds.height / 2;
    const dx = npcCenterX - playerCenterX;
    const dy = npcCenterY - playerCenterY;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? actor.facing === "right" : actor.facing === "left";
    }

    return dy >= 0 ? actor.facing === "down" : actor.facing === "up";
  }

  private resolveChatTarget(
    state: MutableGameSceneState,
    actor: RuntimeActorEntity,
    npcId: string,
  ): Mutable<(typeof state.npcs)[number]> | null {
    const target = state.npcs.find((candidate) => candidate.id === npcId) as
      | Mutable<(typeof state.npcs)[number]>
      | undefined;
    if (!target) {
      return null;
    }

    const interactable = sceneEngine.findInteractableNpc(actor.position, actor.bounds, state.npcs);
    if (!interactable || interactable.id !== npcId) {
      return null;
    }

    if (!this.isActorFacingNpc(actor, target)) {
      return null;
    }

    return target;
  }

  // ── Command queue ────────────────────────────────────────────────────────────

  public processCommand(
    sessionId: string,
    participantSessionId: string,
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
      queue.push({ envelope, participantSessionId });
      this.ensureTicking(sessionId, 0);
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

    const state = session.scene;

    // Wrap to prevent float precision loss after ~24 hours
    state.worldTimeMs = (state.worldTimeMs + dtMs) % WORLD_TIME_WRAP_MS;

    const queue = this.commandQueue.get(sessionId) ?? [];
    this.commandQueue.set(sessionId, []);

    let nextActionState: GameSceneState["actionState"] = state.dialogue ? "dialogueOpen" : "empty";
    let commandApplied = false;

    const movedActorIds = new Set<string>();
    let interactionCount = 0;

    for (const queued of queue) {
      const cmd = queued.envelope.command;
      const commandType = cmd.type;
      const actor = this.resolveSceneActor(state, session, queued.participantSessionId);
      if (!actor) {
        continue;
      }

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
          actor.position,
          actor.facing,
          actor.bounds,
          vector,
          speed,
          state.collisions,
          state.npcs,
        );

        actor.position.x = result.position.x;
        actor.position.y = result.position.y;
        actor.facing = result.facing;
        actor.velocity.x = vector.x * speed;
        actor.velocity.y = vector.y * speed;
        actor.animation = `walk-${result.facing}`;
        actor.frame = result.moved ? actor.frame + 1 : 0;
        if (result.moved) {
          movedActorIds.add(actor.id);
        }
        commandApplied = true;
        nextActionState = result.moved ? "moved" : "blockedByCollision";
        const triggeredNode = this.resolveTriggeredSceneNode(state, actor);
        if (triggeredNode) {
          this.applyMatchingTriggers(state, session.triggerDefinitions ?? [], "scene-enter", {
            sceneId: state.sceneId,
            nodeId: triggeredNode.id,
          });
        }
      } else if (commandType === "interact") {
        commandApplied = true;
        const interactable = sceneEngine.findInteractableNpc(
          actor.position,
          actor.bounds,
          state.npcs,
        ) as Mutable<(typeof state.npcs)[0]> | null;

        if (interactable) {
          interactable.state = "talking";
          interactable.active = true;

          const dx = actor.position.x - interactable.position.x;
          const dy = actor.position.y - interactable.position.y;
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
            this.applyMatchingTriggers(state, session.triggerDefinitions ?? [], "npc-interact", {
              sceneId: state.sceneId,
              npcCharacterKey: interactable.characterKey,
            });
          } else {
            nextActionState = "error.nonRetryable";
          }

          await this.progressStore.processInteraction(
            sessionId,
            `npc-${interactable.id}`,
            XP_CONFIG.interaction,
          );
          await this.progressStore.awardXp(sessionId, XP_CONFIG.dialogue);
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
          const interactable = this.resolveChatTarget(state, actor, cmd.npcId);

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
            this.applyMatchingTriggers(state, session.triggerDefinitions ?? [], "chat", {
              sceneId: state.sceneId,
              npcCharacterKey: interactable.characterKey,
            });

            await this.progressStore.processInteraction(
              sessionId,
              `chat-${interactable.id}`,
              XP_CONFIG.interaction,
            );
            await this.progressStore.awardXp(sessionId, XP_CONFIG.dialogue);
          } else {
            nextActionState = "error.nonRetryable";
          }
        } else {
          nextActionState = "error.nonRetryable";
        }
      } else if (commandType === "confirmDialogue") {
        commandApplied = true;
        if (state.dialogue) {
          const dialogueNpcCharacterKey =
            state.npcs.find((npc) => npc.id === state.dialogue?.npcId)?.characterKey ??
            state.npcs.find((npc) => npc.state === "talking")?.characterKey;
          state.dialogue = null;
          for (const npc of state.npcs) {
            if (npc.state === "talking") {
              npc.state = "idle";
            }
          }
          this.applyMatchingTriggers(
            state,
            session.triggerDefinitions ?? [],
            "dialogue-confirmed",
            {
              sceneId: state.sceneId,
              npcCharacterKey: dialogueNpcCharacterKey,
            },
          );
          nextActionState = "success";
        } else {
          nextActionState = "empty";
        }
      } else if (commandType === "retryAction") {
        commandApplied = true;
        nextActionState = "loading";
      } else if (commandType === "combatAction") {
        commandApplied = true;
        if (state.combat && state.combat.phase !== "victory" && state.combat.phase !== "defeat") {
          const actorId = cmd.action.actorId;
          const isActorTurn = state.combat.turnOrder[state.combat.activeActorIndex] === actorId;

          if (isActorTurn) {
            const actor = state.combat.combatants.find((c) => c.id === actorId);
            const targets = state.combat.combatants.filter((c) =>
              cmd.action.targetIds.includes(c.id),
            );

            if (actor && targets.length > 0) {
              const results = combatEngine.resolveAction(actor, cmd.action, targets);
              const nextCombatState = combatEngine.applyResultsAndAdvanceTurn(
                state.combat,
                results,
              );

              if (nextCombatState.phase === "victory") {
                state.combat = undefined;
                nextActionState = "success";
                await this.progressStore.awardXp(sessionId, 50); // Give 50 XP for winning combat
                this.applyMatchingTriggers(
                  state,
                  session.triggerDefinitions ?? [],
                  "combat-victory",
                  { sceneId: state.sceneId },
                );
              } else if (nextCombatState.phase === "defeat") {
                state.combat = undefined;
                nextActionState = "idle";
                state.player.position = { x: 50, y: 50 }; // Basic revive/respawn mechanic
              } else {
                state.combat = nextCombatState as Mutable<CombatEncounterState>;
                nextActionState = "inCombat";
              }
            } else {
              nextActionState = "error.nonRetryable";
            }
          } else {
            nextActionState = "error.nonRetryable";
          }
        } else {
          nextActionState = "error.nonRetryable";
        }
      } else if (commandType === "openInventory") {
        commandApplied = true;
        nextActionState = "inventoryOpen";
      } else if (commandType === "closeInventory") {
        commandApplied = true;
        nextActionState = "idle";
      } else if (commandType === "useItem" && cmd.slotIndex !== undefined) {
        commandApplied = true;
        if (state.inventory) {
          const slot = state.inventory.slots.find((s) => s.slotIndex === cmd.slotIndex);
          if (slot) {
            const itemDef = session.itemDefinitions?.find((d) => d.id === slot.itemId);
            if (itemDef) {
              const removeResult = inventoryService.removeItem(
                structuredClone(state.inventory),
                slot.itemId,
                1,
              );
              if (removeResult.ok) {
                state.inventory = structuredClone(
                  removeResult.state,
                ) as Mutable<PlayerInventoryState>;
                // Apply healing effects to active combatant if in combat
                if (state.combat) {
                  const playerCombatant = state.combat.combatants.find((c) => c.isPlayer);
                  if (playerCombatant) {
                    for (const effect of itemDef.useEffects) {
                      if (effect.type === "heal_hp") {
                        playerCombatant.stats.hp = Math.min(
                          playerCombatant.stats.hp + effect.magnitude,
                          playerCombatant.stats.maxHp,
                        );
                      } else if (effect.type === "heal_mp") {
                        playerCombatant.stats.mp = Math.min(
                          playerCombatant.stats.mp + effect.magnitude,
                          playerCombatant.stats.maxMp,
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
        nextActionState = "inventoryOpen";
      } else if (commandType === "equipItem" && cmd.slotIndex !== undefined) {
        commandApplied = true;
        if (state.inventory) {
          const slot = state.inventory.slots.find((s) => s.slotIndex === cmd.slotIndex);
          if (slot) {
            const itemDef = session.itemDefinitions?.find((d) => d.id === slot.itemId);
            if (itemDef) {
              const equipResult = inventoryService.equipItem(
                structuredClone(state.inventory),
                itemDef,
              );
              if (equipResult.ok) {
                state.inventory = structuredClone(
                  equipResult.state,
                ) as Mutable<PlayerInventoryState>;
              }
            }
          }
        }
        nextActionState = "inventoryOpen";
      } else if (commandType === "unequipItem" && cmd.slot) {
        commandApplied = true;
        if (state.inventory) {
          const equippedItemId =
            state.inventory.equipment[cmd.slot as keyof typeof state.inventory.equipment];
          if (equippedItemId) {
            const itemDef = session.itemDefinitions?.find((d) => d.id === equippedItemId);
            if (itemDef) {
              const unequipResult = inventoryService.unequipItem(
                structuredClone(state.inventory),
                itemDef,
              );
              if (unequipResult.ok) {
                state.inventory = structuredClone(
                  unequipResult.state,
                ) as Mutable<PlayerInventoryState>;
              }
            }
          }
        }
        nextActionState = "inventoryOpen";
      } else if (commandType === "advanceCutscene") {
        commandApplied = true;
        if (state.cutscene) {
          const def = session.cutsceneDefinitions?.find((c) => c.id === state.cutscene?.cutsceneId);
          if (def) {
            const result = cutsceneEngine.handleInput(state.cutscene, def);
            if (result.type === "completed" || result.type === "skipped") {
              state.cutscene = undefined;
              nextActionState = "idle";
              this.applyMatchingTriggers(
                state,
                session.triggerDefinitions ?? [],
                "cutscene-completed",
                { sceneId: state.sceneId },
              );
            } else {
              state.cutscene = result.state as Mutable<CutscenePlaybackState>;
              nextActionState = "inCutscene";
            }
          }
        }
      } else if (commandType === "skipCutscene") {
        commandApplied = true;
        if (state.cutscene) {
          const def = session.cutsceneDefinitions?.find((c) => c.id === state.cutscene?.cutsceneId);
          if (def) {
            const result = cutsceneEngine.skipCutscene(state.cutscene, def);
            if (result.type === "skipped" || result.type === "completed") {
              state.cutscene = undefined;
              nextActionState = "idle";
              this.applyMatchingTriggers(
                state,
                session.triggerDefinitions ?? [],
                "cutscene-completed",
                { sceneId: state.sceneId },
              );
            } else {
              state.cutscene = result.state as Mutable<CutscenePlaybackState>;
              nextActionState = "inCutscene";
            }
          }
        }
      }
    }

    if (!commandApplied) {
      if (state.dialogue) {
        nextActionState = "dialogueOpen";
      } else if (state.actionState === "inventoryOpen") {
        nextActionState = "inventoryOpen";
      } else if (state.combat) {
        nextActionState = "inCombat";
      } else if (state.cutscene) {
        nextActionState = "inCutscene";
      } else {
        nextActionState = "idle";
      }
    }

    if (state.cutscene) {
      const def = session.cutsceneDefinitions?.find((c) => c.id === state.cutscene?.cutsceneId);
      if (def) {
        const result = cutsceneEngine.executeTick(state.cutscene, def, dtMs);
        if (result.type === "completed" || result.type === "skipped") {
          state.cutscene = undefined;
          if (nextActionState === "inCutscene") {
            nextActionState = "idle";
          }
          this.applyMatchingTriggers(
            state,
            session.triggerDefinitions ?? [],
            "cutscene-completed",
            { sceneId: state.sceneId },
          );
        } else {
          state.cutscene = result.state as Mutable<CutscenePlaybackState>;
          nextActionState = "inCutscene";
        }
      } else {
        // Fallback if missing definition
        state.cutscene = undefined;
        nextActionState = "idle";
      }
    }

    if (state.dialogue === null && nextActionState !== "dialogueOpen") {
      const runtimeActors: RuntimeActorEntity[] = [
        state.player,
        ...(state.coPlayers?.map((presence) => presence.entity) ?? []),
      ];
      for (const actor of runtimeActors) {
        if (movedActorIds.has(actor.id)) {
          continue;
        }

        actor.animation = `idle-${actor.facing}`;
        actor.velocity.x = 0;
        actor.velocity.y = 0;
        actor.frame = 0;
      }
    }

    state.actionState = nextActionState;

    // Camera: center on player, clamped to scene bounds
    const { width: scW, height: scH } = state.geometry;
    const { viewportWidth: vpW, viewportHeight: vpH } = defaultGameConfig;
    state.camera.x = Math.max(0, Math.min(state.player.position.x - vpW / 2, scW - vpW));
    state.camera.y = Math.max(0, Math.min(state.player.position.y - vpH / 2, scH - vpH));

    // Advance NPC AI
    npcAiEngine.updateNpcs(state, session.seed, dtMs);
    this.syncParticipantPresence(session);

    await this.persistSessionIfDue(session, false);
    return this.stateStore.toSnapshot(session);
  }
}

export const gameLoop = new GameLoopService();

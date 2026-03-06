import type { LocaleCode } from "../../config/environment.ts";
import { safeJsonParse } from "../utils/safe-json.ts";

/**
 * Supported locales for game engine behavior and UI copy.
 */
export type GameLocale = LocaleCode;

/**
 * Cardinal movement and facing options.
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * Facing aliases used across animation and NPC interaction logic.
 */
export type Facing = Direction;

/**
 * Axis-aligned rectangle for collision checks.
 */
export interface CollisionMask {
  /** X coordinate in the owning coordinate space. */
  readonly x: number;
  /** Y coordinate in the owning coordinate space. */
  readonly y: number;
  /** Rectangle width in world pixels. */
  readonly width: number;
  /** Rectangle height in world pixels. */
  readonly height: number;
}

/**
 * Shared command input for movement vectors.
 */
export interface MovementVector {
  /** Horizontal movement delta. */
  readonly x: number;
  /** Vertical movement delta. */
  readonly y: number;
}

/**
 * Per-frame animation timing config.
 */
export interface SpriteAnimationConfig {
  /** Atlas row that stores this animation. */
  readonly row: number;
  /** Number of frames in the animation cycle. */
  readonly frames: number;
  /** Sprite sheet column where this animation starts. */
  readonly startCol: number;
  /** Relative speed in frames per second. */
  readonly speed: number;
}

/**
 * Sprite atlas metadata.
 */
export interface SpriteManifest {
  /** Sprite sheet path exposed to the browser. */
  readonly sheet: string;
  /** Logical frame width in source pixels. */
  readonly frameWidth: number;
  /** Logical frame height in source pixels. */
  readonly frameHeight: number;
  /** Atlas column count. */
  readonly cols: number;
  /** Atlas row count. */
  readonly rows: number;
  /** Scale applied by renderer. */
  readonly scale: number;
  /** Default movement speed in px per tick. */
  readonly speed: number;
  /** Named animation definitions (e.g., idle-down). */
  readonly animations: Record<string, SpriteAnimationConfig>;
  /** Optional NPC palette column offset for sprite sheets. */
  readonly npcColOffset?: number;
}

/**
 * Runtime collision and interaction geometry for a scene.
 */
export interface SceneGeometry {
  /** Scene world width in pixels. */
  readonly width: number;
  /** Scene world height in pixels. */
  readonly height: number;
}

/**
 * Scene-level entity definition for static bootstrapping.
 */
export interface SceneNpcDefinition {
  /** NPC key in the character registry. */
  readonly characterKey: string;
  /** Spawn position X in scene space. */
  readonly x: number;
  /** Spawn position Y in scene space. */
  readonly y: number;
  /** Display name label key for localization/branding. */
  readonly labelKey: string;
  /** Deterministic dialogue key list for this NPC. */
  readonly dialogueKeys: readonly string[];
  /** Interaction radius in px. */
  readonly interactRadius: number;
  /** AI tuning options. */
  readonly ai: NpcAiBlueprint;
}

/**
 * NPC AI tuning profile.
 */
export interface NpcAiBlueprint {
  /** NPC wandering radius around its home point. */
  readonly wanderRadius: number;
  /** NPC wander speed in px/tick-normalized units. */
  readonly wanderSpeed: number;
  /** Minimum and maximum idle pause in ms. */
  readonly idlePauseMs: readonly [number, number];
  /** Whether the NPC greets approaching players. */
  readonly greetOnApproach: boolean;
  /** Greeting line key to play once per approach. */
  readonly greetLineKey: string;
}

/**
 * Scene static descriptor.
 */
export interface SceneDefinition {
  /** Stable scene identifier. */
  readonly id: string;
  /** Human-readable scene title key. */
  readonly titleKey: string;
  /** Scene background path. */
  readonly background: string;
  /** World camera extents and boundaries. */
  readonly geometry: SceneGeometry;
  /** Spawn point for the player. */
  readonly spawn: Readonly<{ readonly x: number; readonly y: number }>;
  /** Scene NPC definitions. */
  readonly npcs: readonly SceneNpcDefinition[];
  /** Static world collision rectangles. */
  readonly collisions: readonly CollisionMask[];
}

/**
 * Top-level game configuration contract.
 */
export interface GameConfig {
  /** Movement tick interval in ms. */
  readonly tickMs: number;
  /** Session expiry window in ms. */
  readonly sessionTtlMs: number;
  /** Delay before save persistence is available. */
  readonly saveCooldownMs: number;
  /** Maximum player movement per tick in scene px. */
  readonly maxMovePerTick: number;
  /** Maximum interactions triggered per tick. */
  readonly maxInteractionsPerTick: number;
  /** Scene world baseline identifier. */
  readonly defaultSceneId: string;
  /** Canonical map key for non-locale user-facing text. */
  readonly fallbackLocale: GameLocale;
  /** Client movement command cadence in ms. */
  readonly commandSendIntervalMs: number;
  /** Client command TTL window in ms. */
  readonly commandTtlMs: number;
  /** WebSocket reconnect delay in ms. */
  readonly socketReconnectDelayMs: number;
  /** Session-restore request timeout in ms. */
  readonly restoreRequestTimeoutMs: number;
  /** Maximum restore attempts before showing expired state. */
  readonly restoreMaxAttempts: number;
}

/**
 * Runtime error envelope for command and session operations.
 */
export type GameErrorCode =
  | "INVALID_COMMAND"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "UNAUTHORIZED";

/**
 * Result contract for all game domain calls.
 */
export type GameResult<TData> =
  | {
      readonly ok: true;
      readonly data: TData;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: GameErrorCode;
        readonly message: string;
        readonly retryable: boolean;
      };
    };

/**
 * Base entity state used by serialization and UI rendering.
 */
export interface EntityState {
  /** Stable entity identifier within session. */
  readonly id: string;
  /** Human-facing label. */
  readonly label: string;
  /** Character key into SpriteManifest lookup. */
  readonly characterKey: string;
  /** Top-left world position. */
  readonly position: Readonly<{ readonly x: number; readonly y: number }>;
  /** Facing orientation. */
  readonly facing: Facing;
  /** Animation key in manifest. */
  readonly animation: string;
  /** Frame index used for sprite rendering. */
  readonly frame: number;
  /** Velocity vector at current tick. */
  readonly velocity: MovementVector;
  /** Local collision bounds relative to {@link position}. */
  readonly bounds: CollisionMask;
}

/**
 * Resolved dialogue entry persisted inside a session snapshot.
 */
export interface GameDialogueEntry {
  /** Stable dialogue key used for diagnostics and replay. */
  readonly key: string;
  /** Localized resolved text used by the runtime. */
  readonly text: string;
}

/**
 * Persistent NPC state for snapshots and commands.
 */
export interface NpcState extends EntityState {
  /** Optional AI-enabled behavior marker. */
  readonly aiEnabled: boolean;
  /** Next dialogue index into resolved localized lines. */
  readonly dialogueIndex: number;
  /** Localized dialogue option keys for this NPC. */
  readonly dialogueLineKeys: readonly string[];
  /** Localized dialogue lines resolved at session creation time. */
  readonly dialogueEntries: readonly GameDialogueEntry[];
  /** Interaction radius in px for this NPC. */
  readonly interactRadius: number;
  /** Home position used by deterministic wander logic. */
  readonly homePosition: Readonly<{ readonly x: number; readonly y: number }>;
  /** Persisted AI tuning used by runtime tick logic. */
  readonly aiProfile: NpcAiBlueprint;
  /** Whether this NPC currently has focus for greeting/interaction cues. */
  readonly active: boolean;
  /** Optional interaction state machine marker. */
  readonly state: NpcStateMachine;
}

/**
 * NPC AI state marker for diagnostics and deterministic replays.
 */
export type NpcStateMachine = "idle" | "wander" | "face_player" | "talking";

/**
 * Scene state returned by `/game/session/:id/state`.
 */
export interface GameSceneState {
  /** Active scene identifier. */
  readonly sceneId: string;
  /** Human-readable scene title resolved for the active locale. */
  readonly sceneTitle: string;
  /** Background image path used by the playable renderer. */
  readonly background: string;
  /** Scene geometry used by camera clamping and background rendering. */
  readonly geometry: SceneGeometry;
  /** Player snapshot. */
  readonly player: EntityState;
  /** NPC snapshots. */
  readonly npcs: readonly NpcState[];
  /** Collision zones for HUD/debug overlays. */
  readonly collisions: readonly CollisionMask[];
  /** Current viewport offset for rendering/scrolling. */
  readonly camera: Readonly<{ readonly x: number; readonly y: number }>;
  /** UI-level route state (idle/loading/playing/error...). */
  readonly uiState: GameUiState;
  /** Gameplay sub-state for actions and transitions. */
  readonly actionState: GameActionState;
  /** Optional dialogue payload. */
  readonly dialogue: GameDialogue | null;
  /** World time tracked in ms for diagnostics. */
  readonly worldTimeMs: number;
}

/**
 * Session data persisted in memory.
 */
export interface GameSession {
  /** Session identifier. */
  readonly id: string;
  /** Stable owner identity derived from auth-session cookie. */
  readonly ownerSessionId: string;
  /** Seed used for deterministic NPC movement decisions. */
  readonly seed: number;
  /** Active locale. */
  readonly locale: GameLocale;
  /** Last known scene state. */
  readonly scene: GameSceneState;
  /** Last project binding used to seed this session, if any. */
  readonly projectId?: string;
  /** Monotonic scene-state version used for optimistic persistence. */
  readonly stateVersion: number;
  /** Last persisted tick marker. */
  readonly updatedAtMs: number;
  /** Session creation time. */
  readonly createdAtMs: number;
}

/**
 * Runtime UI route state for rendering and accessibility status mapping.
 */
export type GameUiState = "idle" | "loading" | "playing" | "empty" | "error" | "unauthorized";

/**
 * Canonical HUD stream event names emitted by server sent events.
 */
export type GameSseEventName = "scene-title" | "xp" | "dialogue" | "close" | "error";

/**
 * Deterministic stream close reasons for SSE clients.
 */
export type GameSseCloseReason = "session-missing" | "session-expired" | "stream-error";

/**
 * Sub-state machine for gameplay actions and collisions. */
export type GameActionState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error.retryable"
  | "error.nonRetryable"
  | "unauthorized"
  | "actionQueued"
  | "resolving"
  | "moved"
  | "dialogueOpen"
  | "blockedByCollision";

/**
 * Open dialogue entry.
 */
export interface GameDialogue {
  /** NPC id driving the current dialogue. */
  readonly npcId: string;
  /** NPC display label. */
  readonly npcLabel: string;
  /** Dialogue text already localized. */
  readonly line: string;
  /** Line key used for re-resolution/replay checks. */
  readonly lineKey: string;
}

/**
 * Commands that can be issued from game client controls.
 */
export type GameCommand =
  | {
      readonly type: "move";
      /** Directional intent. */
      readonly direction: Direction;
      /** Optional hold duration in ms used for deterministic movement scaling. */
      readonly durationMs: number;
    }
  | {
      readonly type: "interact";
      /** Optional explicit NPC target id. */
      readonly npcId?: string;
    }
  | {
      readonly type: "confirmDialogue";
    }
  | {
      readonly type: "chat";
      /** The string message sent to an AI or Oracle NPC. */
      readonly message: string;
      /** The NPC to direct the message to. */
      readonly npcId: string;
    }
  | {
      readonly type: "closeDialogue";
    }
  | {
      readonly type: "retryAction";
    };

/**
 * Snapshot bundle returned from stateful endpoints.
 */
export interface GameSessionSnapshot {
  /** Session id for follow-up commands. */
  readonly sessionId: string;
  /** Stable locale from session creation / override. */
  readonly locale: GameLocale;
  /** Timestamp in ISO 8601 format for deterministic clients. */
  readonly timestamp: string;
  /** Scene and gameplay state. */
  readonly state: GameSceneState;
}

/**
 * Structured SSE close payload for deterministic client behavior.
 */
export interface GameSseCloseFrame {
  /** Canonical terminal state for HUD stream close events. */
  readonly reason: GameSseCloseReason;
  /** Optional human-readable guidance for retry UIs. */
  readonly message: string;
  /** Correlated session id. */
  readonly sessionId: string;
}

/**
 * Common shape for commands accepted by both REST and WS game boundaries.
 */
export type GameCommandPayload = Record<string, unknown>;

/**
 * Locale-indexed validation error messages.
 * Kept inline to avoid circular imports from the shared contracts layer.
 */
const validationMessages: Record<
  LocaleCode,
  {
    readonly invalidCommand: string;
    readonly invalidDirection: string;
    readonly chatMissingFields: string;
    readonly unknownCommandType: string;
  }
> = {
  "en-US": {
    invalidCommand: "Invalid command payload",
    invalidDirection: "Invalid move direction",
    chatMissingFields: "Chat commands require npcId and message",
    unknownCommandType: "Unknown command type",
  },
  "zh-CN": {
    invalidCommand: "\u65e0\u6548\u547d\u4ee4",
    invalidDirection: "\u65e0\u6548\u79fb\u52a8\u65b9\u5411",
    chatMissingFields: "\u7f3a\u5c11\u804a\u5929\u5bf9\u8c61\u6216\u6d88\u606f\u5185\u5bb9",
    unknownCommandType: "\u672a\u8bc6\u522b\u7684\u547d\u4ee4\u7c7b\u578b",
  },
};

/**
 * Validates inbound command payloads before they reach domain handlers.
 *
 * @param payload Raw payload from API/WS boundary.
 * @param locale Locale for localization of error messages.
 * @returns Validated typed command or structured validation error payload.
 */
export const validateGameCommand = (
  payload: unknown,
  locale: LocaleCode,
):
  | {
      readonly ok: true;
      readonly data: GameCommand;
    }
  | {
      readonly ok: false;
      readonly errorCode: GameErrorCode;
      readonly message: string;
    } => {
  const msg = validationMessages[locale] ?? validationMessages["en-US"];

  if (typeof payload !== "object" || payload === null) {
    return {
      ok: false,
      errorCode: "INVALID_COMMAND",
      message: msg.invalidCommand,
    };
  }

  const record = payload as Record<string, unknown>;
  const rawType = typeof record.type === "string" ? record.type : "";

  if (rawType === "move") {
    const requestedDirection = typeof record.direction === "string" ? record.direction : "";
    const direction = ["up", "down", "left", "right"].includes(requestedDirection)
      ? (requestedDirection as Direction)
      : null;

    if (direction === null) {
      return {
        ok: false,
        errorCode: "INVALID_COMMAND",
        message: msg.invalidDirection,
      };
    }

    const durationCandidate = record.durationMs;
    const durationMs =
      typeof durationCandidate === "number" && Number.isFinite(durationCandidate)
        ? Math.max(1, Math.trunc(durationCandidate))
        : 120;

    return {
      ok: true,
      data: {
        type: "move",
        direction,
        durationMs,
      } as GameCommand,
    };
  }

  if (rawType === "interact") {
    const npcIdValue =
      typeof record.npcId === "string" && record.npcId.length > 0 ? record.npcId : undefined;

    return {
      ok: true,
      data:
        npcIdValue === undefined ? { type: "interact" } : { type: "interact", npcId: npcIdValue },
    };
  }

  if (rawType === "confirmDialogue") {
    return {
      ok: true,
      data: {
        type: "confirmDialogue",
      } as GameCommand,
    };
  }

  if (rawType === "closeDialogue") {
    return {
      ok: true,
      data: {
        type: "closeDialogue",
      } as GameCommand,
    };
  }

  if (rawType === "retryAction") {
    return {
      ok: true,
      data: {
        type: "retryAction",
      } as GameCommand,
    };
  }

  if (rawType === "chat") {
    const npcId = typeof record.npcId === "string" ? record.npcId.trim() : "";
    const message = typeof record.message === "string" ? record.message.trim() : "";

    if (npcId.length === 0 || message.length === 0) {
      return {
        ok: false,
        errorCode: "INVALID_COMMAND",
        message: msg.chatMissingFields,
      };
    }

    return {
      ok: true,
      data: {
        type: "chat",
        npcId,
        message,
      } as GameCommand,
    };
  }

  return {
    ok: false,
    errorCode: "INVALID_COMMAND",
    message: msg.unknownCommandType,
  };
};

/**
 * Runtime input from command transport layers (REST and WS).
 */
export type GameCommandInput = GameCommand | GameCommandEnvelope;

/**
 * Runtime validation for command envelopes with command defaults.
 */
export const validateGameCommandInput = (
  payload: unknown,
  sessionLocale: LocaleCode,
): GameCommandEnvelopeValidation => {
  if (
    payload &&
    typeof payload === "object" &&
    "command" in payload &&
    typeof (payload as Record<string, unknown>).command === "object"
  ) {
    const candidate = payload as Record<string, unknown>;
    const locale = candidate.locale;
    const source = candidate.source;
    const commandPayload = candidate.command as unknown;

    const commandValidation = validateGameCommand(
      commandPayload,
      isSupportedLocale(locale) ? (locale as LocaleCode) : sessionLocale,
    );
    if (!commandValidation.ok) {
      return {
        ok: false,
        errorCode: commandValidation.errorCode,
        message: commandValidation.message,
      };
    }

    const sequenceValue = candidate.sequenceId;
    const ttlValue = candidate.ttlMs;

    return {
      ok: true,
      data: {
        commandId:
          typeof candidate.commandId === "string" && candidate.commandId.length > 0
            ? candidate.commandId
            : crypto.randomUUID(),
        source: source === "ws" || source === "http" ? source : "http",
        locale: isSupportedLocale(locale) ? (locale as LocaleCode) : sessionLocale,
        sequenceId:
          typeof sequenceValue === "number" && Number.isInteger(sequenceValue) && sequenceValue >= 0
            ? sequenceValue
            : 0,
        timestamp:
          typeof candidate.timestamp === "string" && candidate.timestamp.length > 0
            ? candidate.timestamp
            : new Date().toISOString(),
        ttlMs:
          typeof ttlValue === "number" && Number.isFinite(ttlValue) && ttlValue > 0
            ? ttlValue
            : undefined,
        command: commandValidation.data,
      },
    };
  }

  const commandValidation = validateGameCommand(payload, sessionLocale);
  if (!commandValidation.ok) {
    return {
      ok: false,
      errorCode: commandValidation.errorCode,
      message: commandValidation.message,
    };
  }

  return {
    ok: true,
    data: {
      commandId: crypto.randomUUID(),
      source: "http",
      locale: sessionLocale,
      sequenceId: 0,
      timestamp: new Date().toISOString(),
      command: commandValidation.data,
    },
  };
};

/**
 * Guard for locale-like values in command input.
 *
 * @param value Untyped locale candidate.
 * @returns Whether value is a supported locale.
 */
const isSupportedLocale = (value: unknown): value is LocaleCode =>
  value === "en-US" || value === "zh-CN";

/**
 * Contract for command processing responses.
 */
export interface CommandActionResult {
  /** Session identifier receiving the command. */
  readonly sessionId: string;
  /** Command that was validated and queued. */
  readonly commandType: GameCommand["type"];
  /** Whether command was accepted by the server. */
  readonly accepted: boolean;
}

/**
 * Generic API result envelope used by game-command style endpoints.
 */
export interface GameApiResult<TData> {
  /** Deterministic ok contract. */
  readonly ok: true;
  /** Typed payload for success. */
  readonly data: TData;
}

/**
 * AI provider readiness state for health and routing visibility.
 */
export type ProviderReadiness = "ready" | "degraded" | "offline";

/**
 * Feature-level capability flags exposed to the builder AI UI.
 */
export interface FeatureCapability {
  /** Optional request/response intent assistant. */
  readonly assist: boolean;
  /** Runtime test invocation support. */
  readonly test: boolean;
  /** Structured patch suggestions and plan generation support. */
  readonly toolLikeSuggestions: boolean;
  /** Provider supports token streaming. */
  readonly streaming: boolean;
  /** Non-network fallback mode remains available. */
  readonly offlineFallback: boolean;
}

/**
 * Canonical provider health and capability contract used by `/api/ai/health`.
 */
export interface AiProviderStatus {
  /** Provider name used by route diagnostics. */
  readonly name: string;
  /** Provider readiness bucket. */
  readonly readiness: ProviderReadiness;
  /** Whether provider can currently process requests. */
  readonly ready: boolean;
  /** Number of models successfully discovered. */
  readonly modelCount: number;
  /** Optional degraded-state hint for observability. */
  readonly reason?: string;
}

/**
 * Command envelope used by both REST and websocket game channels.
 */
export interface GameCommandEnvelope {
  /** Stable command identifier, generated by caller. */
  readonly commandId: string;
  /** Source channel that emitted this command. */
  readonly source: "ws" | "http";
  /** Session language for deterministic parser behavior. */
  readonly locale: LocaleCode;
  /** Monotonic sequence id within session. */
  readonly sequenceId: number;
  /** ISO timestamp when command was issued. */
  readonly timestamp: string;
  /** Optional TTL window in milliseconds. */
  readonly ttlMs?: number;
  /** Payload command. */
  readonly command: GameCommand;
}

/**
 * Raw command input accepted by API/WS boundaries.
 */
export type GameCommandPayloadInput = GameCommand | GameCommandEnvelope;

/**
 * Envelope validation result.
 */
export interface GameCommandEnvelopeValidationResult {
  /** Indicates validation outcome. */
  readonly ok: true;
  /** Recovered command envelope used by runtime. */
  readonly data: GameCommandEnvelope;
}

/**
 * Envelope validation failure shape.
 */
export interface GameCommandEnvelopeValidationFailure {
  /** Indicates validation outcome. */
  readonly ok: false;
  /** Canonical game error code for invalid payloads. */
  readonly errorCode: GameErrorCode;
  /** Human-readable cause for deterministic UI copy. */
  readonly message: string;
}

/**
 * Union return type used at API boundaries.
 */
export type GameCommandEnvelopeValidation =
  | GameCommandEnvelopeValidationResult
  | GameCommandEnvelopeValidationFailure;

/**
 * Runtime command result for UI state machines.
 */
export type GameCommandState =
  | "accepted"
  | "queued"
  | "rejected"
  | "dropped"
  | "error.retryable"
  | "error.nonRetryable"
  | "loading";

/**
 * Runtime command result for API boundaries.
 */
export interface GameCommandResult {
  /** Associated session. */
  readonly sessionId: string;
  /** Command envelope identifier. */
  readonly commandId: string;
  /** Sequence from envelope, if supplied. */
  readonly sequenceId: number;
  /** Command type when command payload is valid. */
  readonly commandType?: GameCommand["type"];
  /** Command processing state. */
  readonly state: GameCommandState;
  /** Optional user-facing reason for rejection. */
  readonly errorCode?: GameErrorCode;
  /** Optional machine-readable dropped/rejection reason. */
  readonly errorReason?: string;
  /** Deterministic UI-oriented action state. */
  readonly commandState?: GameActionState;
}

/**
 * Supported game session lifecycle outcomes.
 */
export interface GameSessionLifecycleResult {
  /** Session object used by create/restore calls. */
  readonly sessionId: string;
  /** Current scene locale. */
  readonly locale: LocaleCode;
  /** Current server timestamp. */
  readonly timestamp: string;
  /** Command queue depth at this point in time. */
  readonly commandQueueDepth: number;
  /** Contract version for compatibility and replay tooling. */
  readonly version: number;
  /** Resume token used by UI reconnection flows. */
  readonly resumeToken: string;
  /** Absolute resume token expiry timestamp in ms since epoch. */
  readonly resumeTokenExpiresAtMs: number;
  /** Monotonic resume-token generation version for deterministic rotation. */
  readonly resumeTokenVersion: number;
  /** Monotonic scene-state version at the time of the snapshot. */
  readonly stateVersion: number;
}

/**
 * Session creation contract shared by `/api/game/session` and restore flows.
 */
export interface GameSessionCreate {
  /** Optional locale from builder/editor or user locale. */
  readonly locale?: LocaleCode;
  /** Optional initial scene override. */
  readonly sceneId?: string;
  /** Optional existing project binding. */
  readonly projectId?: string;
}

/**
 * Resume contract for restoring existing sessions.
 */
export interface GameSessionResume {
  /** Existing session identifier. */
  readonly sessionId: string;
  /** Resume token for trusted hand-off. */
  readonly resumeToken: string;
  /** Caller locale. */
  readonly locale?: LocaleCode;
}

/**
 * Stable snapshot contract for resumed gameplay.
 */
export interface GameSessionState extends GameSessionLifecycleResult {
  /** Scene and gameplay state. */
  readonly state: GameSceneState;
}

/**
 * Builder AI request envelope.
 */
export interface BuilderAIRequest {
  /** AI operation mode. */
  readonly mode: "test" | "assist" | "compose";
  /** Scene identifier or working set context. */
  readonly sceneId?: string;
  /** Optional target NPC identifier for scene/npc-specific prompts. */
  readonly npcId?: string;
  /** Builder content mutation target. */
  readonly target?: string;
  /** Input prompt to the model. */
  readonly prompt: string;
  /** Optional game context hint. */
  readonly context?: string;
  /** Locale / language for response. */
  readonly locale?: LocaleCode;
  /** Optional structured constraints. */
  readonly constraints?: Record<string, string | number | boolean | null>;
}

/**
 * Builder AI response contract with normalized operation suggestions.
 */
export interface BuilderAIResponse {
  /** Intent label for UI copy and routing. */
  readonly intent: string;
  /** Human readable result for quick display. */
  readonly rawText: string;
  /** Deterministic operation patches after schema validation. */
  readonly proposedOperations: readonly BuilderArtifactPatch[];
  /** Risk flags raised by validator. */
  readonly riskFlags: readonly string[];
  /** Validation hints returned to the UX. */
  readonly validationHints: readonly string[];
}

/**
 * Builder operation plan contract used by orchestration.
 */
export interface BuilderAIRunPlan {
  /** Human-readable plan intent. */
  readonly intent: string;
  /** Ordered patch list. */
  readonly operations: readonly BuilderArtifactPatch[];
  /** Required model/provider capabilities. */
  readonly requirements?: readonly string[];
  /** Estimated risk for each operation. */
  readonly riskFlags?: readonly string[];
}

/**
 * Single patch operation emitted by builder AI orchestration.
 */
export interface BuilderArtifactPatch {
  /** JSON patch-like operation. */
  readonly op: "add" | "replace" | "remove";
  /** Target path inside project artifact JSON. */
  readonly path: string;
  /** JSON-encoded candidate value. */
  readonly value: string;
  /** Diff checksum for idempotence. */
  readonly checksum?: string;
  /** Patch confidence score 0..1. */
  readonly confidence?: number;
}

/**
 * Builder scene mutation payload.
 */
export interface BuilderScenePayload {
  /** Scene identifier. */
  readonly id: string;
  /** Scene definition content. */
  readonly scene: SceneDefinition;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder NPC mutation payload.
 */
export interface BuilderNpcPayload {
  /** Owning scene identifier. */
  readonly sceneId: string;
  /** NPC definition. */
  readonly npc: SceneNpcDefinition;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder dialogue mutation payload.
 */
export interface BuilderDialoguePayload {
  /** Dialogue key to update. */
  readonly key: string;
  /** Dialogue content value. */
  readonly text: string;
  /** Optional locale override. */
  readonly locale?: LocaleCode;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder mutation result returned by CRUD endpoints.
 */
export interface BuilderMutationResult {
  /** Affected project identifier. */
  readonly projectId: string;
  /** Resource type. */
  readonly resourceType: "project" | "scene" | "npc" | "dialogue";
  /** Stable resource identifier. */
  readonly resourceId: string;
  /** Mutation action that occurred. */
  readonly action: "created" | "updated" | "deleted" | "published";
  /** Resulting checksum, if produced. */
  readonly checksum?: string;
}

/**
 * Robust progress type with JSON parsing helpers.
 */
export interface PlayerProgressV2 {
  /** Session XP total. */
  readonly xp: number;
  /** Current level index. */
  readonly level: number;
  /** Sequence of visited scenes. */
  readonly visitedScenes: readonly string[];
  /** Interaction completion map. */
  readonly interactions: Readonly<Record<string, boolean>>;
  /** Last update correlation for replay/debug. */
  readonly updatedAt: string;
}

/**
 * Parses JSON safely with a typed fallback.
 */
export const parseJson = <T>(source: string, fallback: T): T => safeJsonParse(source, fallback);

/**
 * Normalizes persisted player progress into the v2 contract.
 */
export const parsePlayerProgressV2 = (
  xp: unknown,
  level: unknown,
  visitedScenesValue: unknown,
  interactionsValue: unknown,
  updatedAt: string,
): PlayerProgressV2 => {
  const parsedVisitedScenes = Array.isArray(visitedScenesValue)
    ? visitedScenesValue
    : parseJson(
        typeof visitedScenesValue === "string" ? visitedScenesValue : "[]",
        [] as unknown[],
      );

  const parsedInteractions =
    typeof interactionsValue === "object" &&
    interactionsValue !== null &&
    !Array.isArray(interactionsValue)
      ? interactionsValue
      : parseJson(
          typeof interactionsValue === "string" ? interactionsValue : "{}",
          {} as Record<string, boolean>,
        );

  return {
    xp: typeof xp === "number" && Number.isFinite(xp) ? Math.max(0, Math.trunc(xp)) : 0,
    level: typeof level === "number" && Number.isFinite(level) ? Math.max(1, Math.trunc(level)) : 1,
    visitedScenes: Array.isArray(parsedVisitedScenes)
      ? parsedVisitedScenes.filter((value): value is string => typeof value === "string")
      : [],
    interactions:
      typeof parsedInteractions === "object" && parsedInteractions !== null
        ? Object.fromEntries(
            Object.entries(parsedInteractions).filter(
              (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
            ),
          )
        : {},
    updatedAt:
      typeof updatedAt === "string" && updatedAt.length > 0 ? updatedAt : new Date().toISOString(),
  };
};

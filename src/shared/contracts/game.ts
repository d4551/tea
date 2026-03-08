import type { LocaleCode } from "../../config/environment.ts";
import { safeJsonParse } from "../utils/safe-json.ts";

/**
 * Application-defined WebSocket close code: session not found.
 * Signals the client to stop reconnecting and show a session-missing error.
 */
export const WS_CLOSE_SESSION_MISSING = 4404 as const;

/**
 * Application-defined WebSocket close code: resume token expired or invalid.
 * Signals the client to clear stored session metadata and redirect.
 */
export const WS_CLOSE_TOKEN_EXPIRED = 4408 as const;

/**
 * localStorage key for persisting game session metadata across reconnects.
 */
export const GAME_SESSION_STORAGE_KEY = "lotfk:game:session-meta" as const;

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
 * Supported authored scene runtime modes.
 */
export type SceneMode = "2d" | "3d";

/**
 * Supported authored asset kinds in the builder platform.
 */
export type BuilderAssetKind =
  | "background"
  | "sprite-sheet"
  | "audio"
  | "model"
  | "portrait"
  | "tiles"
  | "tile-set"
  | "material";

/**
 * Optional authored asset variant derived from a canonical asset.
 */
export interface AssetVariant {
  /** Stable variant identifier. */
  readonly id: string;
  /** Variant format such as png, wav, glb, or json. */
  readonly format: string;
  /** Browser-accessible source path or remote URL. */
  readonly source: string;
  /** Short usage label such as preview, runtime, or thumbnail. */
  readonly usage: string;
  /** Optional MIME type used for transport/runtime loader selection. */
  readonly mimeType?: string;
}

/**
 * Builder-authored asset metadata.
 */
export interface BuilderAsset {
  /** Stable asset identifier. */
  readonly id: string;
  /** Asset kind. */
  readonly kind: BuilderAssetKind;
  /** Human-readable asset label. */
  readonly label: string;
  /** Preferred runtime mode for the asset. */
  readonly sceneMode: SceneMode;
  /** Canonical source path or URL. */
  readonly source: string;
  /** Canonical source format such as png, glb, usdz, or usda. */
  readonly sourceFormat: string;
  /** Optional source MIME type when known. */
  readonly sourceMimeType?: string;
  /** Optional tag list for filtering and grouping. */
  readonly tags: readonly string[];
  /** Available derived variants for this asset. */
  readonly variants: readonly AssetVariant[];
  /** Whether the asset is approved for attachment to scenes. */
  readonly approved: boolean;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Authored animation clip metadata used by 2D and 3D nodes.
 */
export interface AnimationClip {
  /** Stable clip identifier. */
  readonly id: string;
  /** Owning asset identifier. */
  readonly assetId: string;
  /** Human-readable clip label. */
  readonly label: string;
  /** Target runtime mode for the clip. */
  readonly sceneMode: SceneMode;
  /** Named state tag such as idle, walk, or reveal. */
  readonly stateTag: string;
  /** Playback rate in frames per second. */
  readonly playbackFps: number;
  /** Zero-based frame offset. */
  readonly startFrame: number;
  /** Number of frames or samples in the clip. */
  readonly frameCount: number;
  /** Whether the clip loops. */
  readonly loop: boolean;
  /** Optional facing/direction hint. */
  readonly direction?: Facing;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Shared 2D vector definition.
 */
export interface Vector2 {
  /** Horizontal coordinate. */
  readonly x: number;
  /** Vertical coordinate. */
  readonly y: number;
}

/**
 * Shared 3D vector definition.
 */
export interface Vector3 {
  /** X coordinate. */
  readonly x: number;
  /** Y coordinate. */
  readonly y: number;
  /** Z coordinate. */
  readonly z: number;
}

/**
 * Author-time 2D scene node.
 */
export interface SceneNode2D {
  /** Stable node identifier. */
  readonly id: string;
  /** Node role in the scene graph. */
  readonly nodeType: "sprite" | "tile" | "spawn" | "trigger" | "camera";
  /** Optional attached asset. */
  readonly assetId?: string;
  /** Optional attached clip. */
  readonly animationClipId?: string;
  /** Node position in scene space. */
  readonly position: Vector2;
  /** Node size in authored pixels. */
  readonly size: Readonly<{ readonly width: number; readonly height: number }>;
  /** Painter's-order layer key. */
  readonly layer: string;
}

/**
 * Author-time 3D scene node.
 */
export interface SceneNode3D {
  /** Stable node identifier. */
  readonly id: string;
  /** Node role in the scene graph. */
  readonly nodeType: "model" | "light" | "camera" | "spawn" | "trigger";
  /** Optional attached asset. */
  readonly assetId?: string;
  /** Optional attached clip. */
  readonly animationClipId?: string;
  /** Node translation in scene space. */
  readonly position: Vector3;
  /** Node rotation in radians. */
  readonly rotation: Vector3;
  /** Node scale multipliers. */
  readonly scale: Vector3;
}

/**
 * Authored scene node definition.
 */
export type SceneNodeDefinition = SceneNode2D | SceneNode3D;

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
  /** Scene runtime mode. */
  readonly sceneMode?: SceneMode;
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
  /** Authored scene graph nodes. */
  readonly nodes?: readonly SceneNodeDefinition[];
  /** Static world collision rectangles. */
  readonly collisions: readonly CollisionMask[];
}

/**
 * Dialogue graph edge between authored dialogue nodes.
 */
export interface DialogueGraphEdge {
  /** Destination node identifier. */
  readonly to: string;
  /** Optional required flag before the edge is valid. */
  readonly requiredFlag?: string;
  /** Optional quest step to advance when traversed. */
  readonly advanceQuestStepId?: string;
}

/**
 * Dialogue graph node used for branching authored dialogue.
 */
export interface DialogueGraphNode {
  /** Stable node identifier. */
  readonly id: string;
  /** Localized dialogue line key or literal string. */
  readonly line: string;
  /** Optional next edges available from this node. */
  readonly edges: readonly DialogueGraphEdge[];
}

/**
 * Builder-authored dialogue graph.
 */
export interface DialogueGraph {
  /** Stable graph identifier. */
  readonly id: string;
  /** Human-readable graph title. */
  readonly title: string;
  /** Optional owning NPC key. */
  readonly npcId?: string;
  /** Entry node identifier. */
  readonly rootNodeId: string;
  /** Authored nodes in this graph. */
  readonly nodes: readonly DialogueGraphNode[];
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Supported trigger event types for the mechanics engine.
 */
export type TriggerEventType =
  | "scene-enter"
  | "npc-interact"
  | "chat"
  | "dialogue-confirmed"
  | "combat-victory"
  | "item-acquired"
  | "cutscene-completed";

/**
 * Builder-authored game flag definition.
 */
export interface GameFlagDefinition {
  /** Stable flag key. */
  readonly key: string;
  /** Human-readable label. */
  readonly label: string;
  /** Initial flag value. */
  readonly initialValue: string | number | boolean;
}

/**
 * Builder-authored trigger definition.
 */
export interface TriggerDefinition {
  /** Stable trigger identifier. */
  readonly id: string;
  /** Human-readable trigger label. */
  readonly label: string;
  /** Runtime event that can activate the trigger. */
  readonly event: TriggerEventType;
  /** Optional scene scoping. */
  readonly sceneId?: string;
  /** Optional NPC scoping. */
  readonly npcId?: string;
  /** Optional authored scene-node scoping. */
  readonly nodeId?: string;
  /** Optional cutscene to start when triggered. */
  readonly cutsceneId?: string;
  /** Optional flag prerequisites keyed by flag id. */
  readonly requiredFlags?: Readonly<Record<string, string | number | boolean>>;
  /** Flag mutations applied when the trigger fires. */
  readonly setFlags?: Readonly<Record<string, string | number | boolean>>;
  /** Optional quest identifier to advance. */
  readonly questId?: string;
  /** Optional quest step identifier to complete. */
  readonly questStepId?: string;
}

/**
 * Supported quest step states in session runtime.
 */
export type QuestStepState = "pending" | "active" | "completed";

/**
 * Builder-authored quest step.
 */
export interface QuestStep {
  /** Stable step identifier. */
  readonly id: string;
  /** Short user-facing title. */
  readonly title: string;
  /** Optional player-facing description. */
  readonly description: string;
  /** Trigger that completes this step. */
  readonly triggerId: string;
}

/**
 * Builder-authored quest definition.
 */
export interface QuestDefinition {
  /** Stable quest identifier. */
  readonly id: string;
  /** Player-facing title. */
  readonly title: string;
  /** Player-facing description. */
  readonly description: string;
  /** Ordered quest steps. */
  readonly steps: readonly QuestStep[];
}

/**
 * Runtime quest step state.
 */
export interface GameQuestStepState {
  /** Stable step identifier. */
  readonly id: string;
  /** Player-facing title. */
  readonly title: string;
  /** Player-facing description. */
  readonly description: string;
  /** Current runtime status. */
  readonly state: QuestStepState;
}

/**
 * Runtime quest state mirrored into the session snapshot.
 */
export interface GameQuestState {
  /** Stable quest identifier. */
  readonly id: string;
  /** Quest title. */
  readonly title: string;
  /** Quest description. */
  readonly description: string;
  /** Whether the quest is complete. */
  readonly completed: boolean;
  /** Ordered runtime quest step states. */
  readonly steps: readonly GameQuestStepState[];
}

/**
 * Supported long-running generation job statuses.
 */
export type GenerationJobStatus =
  | "queued"
  | "running"
  | "blocked_for_approval"
  | "succeeded"
  | "failed"
  | "canceled";

/**
 * Generated artifact metadata attached to a job.
 */
export interface GenerationArtifact {
  /** Stable artifact identifier. */
  readonly id: string;
  /** Owning generation job identifier. */
  readonly jobId: string;
  /** Artifact kind. */
  readonly kind: BuilderAssetKind | "animation-plan" | "automation-evidence";
  /** Human-readable artifact label. */
  readonly label: string;
  /** Browser-accessible preview source or URL. */
  readonly previewSource: string;
  /** Short review summary. */
  readonly summary: string;
  /** Optional machine-readable MIME type for preview/rendering. */
  readonly mimeType?: string;
  /** Whether the artifact has been approved. */
  readonly approved: boolean;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
}

/**
 * Builder-authored long-running generation job.
 */
export interface GenerationJob {
  /** Stable job identifier. */
  readonly id: string;
  /** Requested output kind. */
  readonly kind: "sprite-sheet" | "portrait" | "tiles" | "voice-line" | "animation-plan";
  /** Current job status. */
  readonly status: GenerationJobStatus;
  /** User prompt or request summary. */
  readonly prompt: string;
  /** Optional target scene/entity/asset identifier. */
  readonly targetId?: string;
  /** Artifacts produced so far. */
  readonly artifactIds: readonly string[];
  /** Optional status message. */
  readonly statusMessage: string;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Supported automation run statuses.
 */
export type AutomationRunStatus =
  | "queued"
  | "running"
  | "blocked_for_approval"
  | "succeeded"
  | "failed"
  | "canceled";

/**
 * Single auditable automation step.
 */
export interface AutomationRunStep {
  /** Stable step identifier. */
  readonly id: string;
  /** Action type performed by the automation. */
  readonly action: "browser" | "http" | "builder" | "attach-file";
  /** Human-readable summary. */
  readonly summary: string;
  /** Step status. */
  readonly status: "pending" | "running" | "completed" | "failed";
  /** Optional evidence URL produced by the step. */
  readonly evidenceSource?: string;
}

/**
 * Approval-gated automation run metadata.
 */
export interface AutomationRun {
  /** Stable automation run identifier. */
  readonly id: string;
  /** Current status. */
  readonly status: AutomationRunStatus;
  /** Human-readable goal. */
  readonly goal: string;
  /** Structured auditable steps. */
  readonly steps: readonly AutomationRunStep[];
  /** Optional output artifact ids generated by the run. */
  readonly artifactIds: readonly string[];
  /** Optional status note. */
  readonly statusMessage: string;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

// ---------------------------------------------------------------------------
// Combat System
// ---------------------------------------------------------------------------

/**
 * Damage type taxonomy for the combat engine.
 */
export type DamageType = "physical" | "magical" | "fire" | "ice" | "lightning" | "holy" | "dark";

/**
 * Base statistics shared by all combatants.
 */
export interface CombatantStats {
  /** Maximum hit points. */
  readonly maxHp: number;
  /** Current hit points. */
  readonly hp: number;
  /** Maximum mana points. */
  readonly maxMp: number;
  /** Current mana points. */
  readonly mp: number;
  /** Physical attack power. */
  readonly attack: number;
  /** Physical defense. */
  readonly defense: number;
  /** Magical attack power. */
  readonly magicAttack: number;
  /** Magical defense. */
  readonly magicDefense: number;
  /** Turn order priority. */
  readonly speed: number;
  /** Chance to land a critical hit (0-1). */
  readonly critRate: number;
  /** Critical damage multiplier (e.g., 1.5). */
  readonly critMultiplier: number;
}

/**
 * Combatant in an active encounter.
 */
export interface Combatant {
  /** Unique combatant identifier within the encounter. */
  readonly id: string;
  /** Display label for UI. */
  readonly label: string;
  /** Character key into sprite manifest. */
  readonly characterKey: string;
  /** Whether this combatant is player-controlled. */
  readonly isPlayer: boolean;
  /** Live combat statistics. */
  readonly stats: CombatantStats;
  /** Active status effects. */
  readonly statusEffects: readonly StatusEffect[];
  /** Whether the combatant is alive. */
  readonly alive: boolean;
}

/**
 * Temporal status effect applied to a combatant.
 */
export interface StatusEffect {
  /** Effect identifier. */
  readonly id: string;
  /** Display label. */
  readonly label: string;
  /** Remaining turns until expiry. */
  readonly remainingTurns: number;
  /** Stat modifier applied per turn. */
  readonly statModifier?: Partial<CombatantStats>;
  /** Damage dealt per turn (DoT). */
  readonly damagePerTurn?: number;
  /** Healing applied per turn (HoT). */
  readonly healPerTurn?: number;
}

/**
 * Player-selectable combat action.
 */
export type CombatActionType = "attack" | "defend" | "skill" | "item" | "flee";

/**
 * Single combat action submitted by a combatant.
 */
export interface CombatAction {
  /** Acting combatant identifier. */
  readonly actorId: string;
  /** Action type. */
  readonly type: CombatActionType;
  /** Target combatant identifier(s). */
  readonly targetIds: readonly string[];
  /** Optional skill identifier. */
  readonly skillId?: string;
  /** Optional item identifier for "item" actions. */
  readonly itemId?: string;
}

/**
 * Damage result from a single combat action resolution.
 */
export interface CombatDamageResult {
  /** Target combatant identifier. */
  readonly targetId: string;
  /** Raw damage dealt before mitigation. */
  readonly rawDamage: number;
  /** Final damage after defense. */
  readonly finalDamage: number;
  /** Whether this was a critical hit. */
  readonly critical: boolean;
  /** Damage type dealt. */
  readonly damageType: DamageType;
  /** Whether the target was defeated. */
  readonly defeated: boolean;
}

/**
 * Result of executing a full combat turn.
 */
export interface CombatTurnResult {
  /** Action that was executed. */
  readonly action: CombatAction;
  /** Damage outcomes for each target. */
  readonly damages: readonly CombatDamageResult[];
  /** Status effects applied. */
  readonly appliedEffects: readonly StatusEffect[];
  /** Text log entry for the turn. */
  readonly logEntry: string;
}

/**
 * Combat encounter phase.
 */
export type CombatPhase =
  | "intro"
  | "player_turn"
  | "enemy_turn"
  | "resolution"
  | "victory"
  | "defeat"
  | "fled";

/**
 * Active combat encounter state.
 */
export interface CombatEncounterState {
  /** Unique encounter identifier. */
  readonly id: string;
  /** Current phase of combat. */
  readonly phase: CombatPhase;
  /** Current turn index (0-based). */
  readonly turnIndex: number;
  /** All combatants in the encounter. */
  readonly combatants: readonly Combatant[];
  /** Turn order (combatant ids). */
  readonly turnOrder: readonly string[];
  /** Index into turnOrder for the current actor. */
  readonly activeActorIndex: number;
  /** Combat log for UI display. */
  readonly log: readonly CombatTurnResult[];
  /** Optional loot table identifier for victory rewards. */
  readonly lootTableId?: string;
}

/**
 * Builder-authored enemy template for encounter generation.
 */
export interface EnemyTemplate {
  /** Stable enemy identifier. */
  readonly id: string;
  /** Display label key. */
  readonly labelKey: string;
  /** Character key for sprite rendering. */
  readonly characterKey: string;
  /** Base statistics. */
  readonly baseStats: CombatantStats;
  /** XP reward on defeat. */
  readonly xpReward: number;
  /** Item drop table. */
  readonly dropIds?: readonly string[];
}

// ---------------------------------------------------------------------------
// Inventory System
// ---------------------------------------------------------------------------

/**
 * Item rarity tier for the loot system.
 */
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * Equipment slot for character loadout.
 */
export type EquipmentSlotType = "weapon" | "armor" | "accessory" | "consumable";

/**
 * Stat modification applied by an item.
 */
export interface ItemStatEffect {
  /** Stat key to modify. */
  readonly stat: keyof CombatantStats;
  /** Additive modifier value. */
  readonly value: number;
}

/**
 * Special effect triggered when an item is used.
 */
export interface ItemUseEffect {
  /** Effect type. */
  readonly type: "heal_hp" | "heal_mp" | "damage" | "buff" | "debuff" | "cure_status";
  /** Numeric magnitude. */
  readonly magnitude: number;
  /** Optional duration in turns for buffs/debuffs. */
  readonly durationTurns?: number;
  /** Optional target selector. */
  readonly target?: "self" | "ally" | "enemy" | "all_allies" | "all_enemies";
}

/**
 * Builder-authored item definition.
 */
export interface ItemDefinition {
  /** Stable item identifier. */
  readonly id: string;
  /** Display label key for localization. */
  readonly labelKey: string;
  /** Item description key. */
  readonly descriptionKey: string;
  /** Rarity tier. */
  readonly rarity: ItemRarity;
  /** Equipment slot if equippable. */
  readonly equipSlot?: EquipmentSlotType;
  /** Whether this item can stack in inventory. */
  readonly stackable: boolean;
  /** Maximum stack size. */
  readonly maxStack: number;
  /** Passive stat effects when equipped. */
  readonly statEffects: readonly ItemStatEffect[];
  /** Active effects when consumed/used. */
  readonly useEffects: readonly ItemUseEffect[];
  /** Sell value. */
  readonly sellValue: number;
  /** Optional sprite asset identifier for UI rendering. */
  readonly spriteAssetId?: string;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
}

/**
 * Single slot in a player's inventory.
 */
export interface InventorySlot {
  /** Slot index (0-based). */
  readonly slotIndex: number;
  /** Item definition identifier. */
  readonly itemId: string;
  /** Current stack quantity. */
  readonly quantity: number;
}

/**
 * Equipment loadout for a player.
 */
export interface EquipmentLoadout {
  /** Equipped weapon item id, if any. */
  readonly weapon?: string;
  /** Equipped armor item id, if any. */
  readonly armor?: string;
  /** Equipped accessory item id, if any. */
  readonly accessory?: string;
}

/**
 * Full inventory state for a session participant.
 */
export interface PlayerInventoryState {
  /** Maximum inventory capacity. */
  readonly capacity: number;
  /** Occupied slots. */
  readonly slots: readonly InventorySlot[];
  /** Current equipment loadout. */
  readonly equipment: EquipmentLoadout;
  /** Currency balance. */
  readonly currency: number;
}

// ---------------------------------------------------------------------------
// Cutscene System
// ---------------------------------------------------------------------------

/**
 * Cutscene action types for the sequencer.
 */
export type CutsceneActionType =
  | "dialogue"
  | "camera_pan"
  | "fade_in"
  | "fade_out"
  | "wait"
  | "animate_entity"
  | "play_sound"
  | "set_flag"
  | "spawn_entity"
  | "remove_entity";

/**
 * Single authored cutscene step.
 */
export interface CutsceneStep {
  /** Stable step identifier. */
  readonly id: string;
  /** Step ordinal for sequencing. */
  readonly ordinal: number;
  /** Action type for this step. */
  readonly action: CutsceneActionType;
  /** Duration in ms (for waits, fades, camera pans). */
  readonly durationMs: number;
  /** Optional dialogue speaker character key. */
  readonly speakerKey?: string;
  /** Optional dialogue text key. */
  readonly dialogueKey?: string;
  /** Optional target entity/NPC identifier. */
  readonly entityId?: string;
  /** Optional animation key to trigger. */
  readonly animationKey?: string;
  /** Optional camera target position. */
  readonly cameraTarget?: Vector2;
  /** Optional flag key to set. */
  readonly flagKey?: string;
  /** Optional flag value to set. */
  readonly flagValue?: string | number | boolean;
  /** Optional sound asset identifier. */
  readonly soundAssetId?: string;
}

/**
 * Builder-authored cutscene definition.
 */
export interface CutsceneDefinition {
  /** Stable cutscene identifier. */
  readonly id: string;
  /** Human-readable cutscene label. */
  readonly label: string;
  /** Trigger event that starts this cutscene. */
  readonly triggerId?: string;
  /** Ordered steps in the cutscene. */
  readonly steps: readonly CutsceneStep[];
  /** Whether the player can skip the cutscene. */
  readonly skippable: boolean;
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Active cutscene playback state.
 */
export type CutscenePlaybackPhase = "playing" | "waiting_for_input" | "completed" | "skipped";

/**
 * Runtime cutscene playback state.
 */
export interface CutscenePlaybackState {
  /** Active cutscene identifier. */
  readonly cutsceneId: string;
  /** Current step index. */
  readonly currentStepIndex: number;
  /** Elapsed time within the current step in ms. */
  readonly stepElapsedMs: number;
  /** Current playback phase. */
  readonly phase: CutscenePlaybackPhase;
}

// ---------------------------------------------------------------------------
// Animation Timeline Editor
// ---------------------------------------------------------------------------

/**
 * Numeric keyframe in an animation track.
 */
export interface AnimationKeyframe {
  /** Time position in ms. */
  readonly timeMs: number;
  /** Numeric value at this keyframe. */
  readonly value: number;
  /** Easing function for interpolation to the next keyframe. */
  readonly easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "step";
}

/**
 * Single track in an animation timeline (e.g., position.x, opacity, frame). */
export interface AnimationTrack {
  /** Stable track identifier. */
  readonly id: string;
  /** Property path this track animates (e.g., "position.x", "frame"). */
  readonly property: string;
  /** Keyframes in chronological order. */
  readonly keyframes: readonly AnimationKeyframe[];
}

/**
 * Builder-authored animation timeline linking tracks to a state tag.
 */
export interface AnimationTimeline {
  /** Stable timeline identifier. */
  readonly id: string;
  /** Owning asset identifier. */
  readonly assetId: string;
  /** Human-readable timeline label. */
  readonly label: string;
  /** State tag (e.g., idle-down, attack-right). */
  readonly stateTag: string;
  /** Target scene mode. */
  readonly sceneMode: SceneMode;
  /** Total duration in ms. */
  readonly durationMs: number;
  /** Whether the timeline loops. */
  readonly loop: boolean;
  /** Animation tracks. */
  readonly tracks: readonly AnimationTrack[];
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
  /** Last update timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

// ---------------------------------------------------------------------------
// Sprite Atlas Packing
// ---------------------------------------------------------------------------

/**
 * Packed frame metadata within a sprite atlas.
 */
export interface SpriteAtlasFrame {
  /** Frame identifier (typically filename). */
  readonly id: string;
  /** X position in the atlas. */
  readonly x: number;
  /** Y position in the atlas. */
  readonly y: number;
  /** Frame width. */
  readonly width: number;
  /** Frame height. */
  readonly height: number;
}

/**
 * Generated sprite atlas metadata.
 */
export interface SpriteAtlasManifest {
  /** Stable atlas identifier. */
  readonly id: string;
  /** Browser-accessible atlas image path. */
  readonly imagePath: string;
  /** Atlas image width. */
  readonly atlasWidth: number;
  /** Atlas image height. */
  readonly atlasHeight: number;
  /** Packed frames. */
  readonly frames: readonly SpriteAtlasFrame[];
  /** Creation timestamp in ms since epoch. */
  readonly createdAtMs: number;
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
 * Runtime-visible participant presence projected into the playable scene.
 */
export interface GameParticipantPresence {
  /** Authenticated room participant backing this presence. */
  readonly sessionId: string;
  /** Granted room role for diagnostics and UI affordances. */
  readonly role: GameSessionParticipantRole;
  /** Renderable entity state used by the playable client. */
  readonly entity: EntityState;
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
  /** Active scene runtime mode. */
  readonly sceneMode?: SceneMode;
  /** Human-readable scene title resolved for the active locale. */
  readonly sceneTitle: string;
  /** Background image path used by the playable renderer. */
  readonly background: string;
  /** Scene geometry used by camera clamping and background rendering. */
  readonly geometry: SceneGeometry;
  /** Player snapshot. */
  readonly player: EntityState;
  /** Additional room participants rendered as live presence in the scene. */
  readonly coPlayers?: readonly GameParticipantPresence[];
  /** NPC snapshots. */
  readonly npcs: readonly NpcState[];
  /** Collision zones for HUD/debug overlays. */
  readonly collisions: readonly CollisionMask[];
  /** Authored scene nodes active in this scene. */
  readonly nodes?: readonly SceneNodeDefinition[];
  /** Runtime-visible authored assets needed for node resolution. */
  readonly assets?: readonly BuilderAsset[];
  /** Current viewport offset for rendering/scrolling. */
  readonly camera: Readonly<{ readonly x: number; readonly y: number }>;
  /** UI-level route state (idle/loading/playing/error...). */
  readonly uiState: GameUiState;
  /** Gameplay sub-state for actions and transitions. */
  readonly actionState: GameActionState;
  /** Optional dialogue payload. */
  readonly dialogue: GameDialogue | null;
  /** Runtime quest states for the active release. */
  readonly quests?: readonly GameQuestState[];
  /** Session-scoped flag bag. */
  readonly flags?: Readonly<Record<string, string | number | boolean>>;
  /** World time tracked in ms for diagnostics. */
  readonly worldTimeMs: number;
  /** Active combat encounter state, if in combat. */
  readonly combat?: CombatEncounterState;
  /** Player inventory state. */
  readonly inventory?: PlayerInventoryState;
  /** Active cutscene playback state, if in cutscene. */
  readonly cutscene?: CutscenePlaybackState;
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
  /** Published release version captured when the session was created. */
  readonly releaseVersion?: number;
  /** Published trigger definitions captured when the session was created. */
  readonly triggerDefinitions?: readonly TriggerDefinition[];
  /** Published cutscene definitions captured when the session was created. */
  readonly cutsceneDefinitions?: readonly CutsceneDefinition[];
  /** Published item definitions captured when the session was created. */
  readonly itemDefinitions?: readonly ItemDefinition[];
  /** Connected room participants authorized to observe or control the session. */
  readonly participants: readonly GameSessionParticipant[];
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
 * Multiplayer room role granted to one authenticated participant.
 */
export type GameSessionParticipantRole = "owner" | "controller" | "spectator";

/**
 * Authenticated participant admitted to a shared gameplay session.
 */
export interface GameSessionParticipant {
  /** Session-cookie identity for the connected player/browser. */
  readonly sessionId: string;
  /** Granted room role. */
  readonly role: GameSessionParticipantRole;
  /** Join timestamp in ms since epoch. */
  readonly joinedAtMs: number;
  /** Last activity timestamp in ms since epoch. */
  readonly updatedAtMs: number;
}

/**
 * Canonical HUD stream event names emitted by server sent events.
 */
export type GameSseEventName =
  | "scene-title"
  | "xp"
  | "dialogue"
  | "participants"
  | "close"
  | "error"
  | "combat"
  | "inventory"
  | "cutscene";

/**
 * Deterministic stream close reasons for SSE clients.
 */
export type GameSseCloseReason = "session-missing" | "session-expired" | "stream-error";

/**
 * Sub-state machine for gameplay actions and collisions.
 */
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
  | "blockedByCollision"
  | "inCombat"
  | "inCutscene"
  | "inventoryOpen";

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
    }
  | {
      readonly type: "combatAction";
      /** The combat action to execute. */
      readonly action: CombatAction;
    }
  | {
      readonly type: "openInventory";
    }
  | {
      readonly type: "closeInventory";
    }
  | {
      readonly type: "useItem";
      /** Slot index of the item to use. */
      readonly slotIndex: number;
    }
  | {
      readonly type: "equipItem";
      /** Slot index of the item to equip. */
      readonly slotIndex: number;
    }
  | {
      readonly type: "unequipItem";
      /** Equipment slot to clear. */
      readonly slot: EquipmentSlotType;
    }
  | {
      readonly type: "advanceCutscene";
    }
  | {
      readonly type: "skipCutscene";
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
  /** Published project bound to this session, if any. */
  readonly projectId?: string;
  /** Published release version bound to this session, if any. */
  readonly releaseVersion?: number;
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
 * Realtime websocket frame contract emitted by the game runtime.
 */
export interface GameRealtimeFrame {
  /** Optional full scene state snapshot. */
  readonly state?: GameSceneState;
  /** Optional command queue depth for UI diagnostics. */
  readonly commandQueueDepth?: number;
  /** Optional refreshed resume token for reconnect flows. */
  readonly resumeToken?: string;
  /** Optional refreshed resume-token expiry timestamp. */
  readonly resumeTokenExpiresAtMs?: number;
  /** Current room participants for multiplayer presence. */
  readonly participants?: readonly GameSessionParticipant[];
  /** The caller role resolved for this frame. */
  readonly participantRole?: GameSessionParticipantRole;
  /** Runtime-visible participant presence projected for the scene. */
  readonly coPlayers?: readonly GameParticipantPresence[];
}

/**
 * Common shape for commands accepted by both REST and WS game boundaries.
 */
export type GameCommandPayload = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isStringRecordValue = (value: unknown): value is string | number | boolean =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

const isDirectionValue = (value: unknown): value is Direction =>
  value === "up" || value === "down" || value === "left" || value === "right";

const isGameUiStateValue = (value: unknown): value is GameUiState =>
  value === "idle" ||
  value === "loading" ||
  value === "playing" ||
  value === "empty" ||
  value === "error" ||
  value === "unauthorized";

const isGameActionStateValue = (value: unknown): value is GameActionState =>
  value === "idle" ||
  value === "loading" ||
  value === "success" ||
  value === "empty" ||
  value === "error.retryable" ||
  value === "error.nonRetryable" ||
  value === "unauthorized" ||
  value === "actionQueued" ||
  value === "resolving" ||
  value === "moved" ||
  value === "dialogueOpen" ||
  value === "blockedByCollision" ||
  value === "inCombat" ||
  value === "inCutscene" ||
  value === "inventoryOpen";

const isQuestStepStateValue = (value: unknown): value is QuestStepState =>
  value === "pending" || value === "active" || value === "completed";

const isTriggerEventTypeValue = (value: unknown): value is TriggerEventType =>
  value === "scene-enter" ||
  value === "npc-interact" ||
  value === "chat" ||
  value === "dialogue-confirmed" ||
  value === "combat-victory" ||
  value === "item-acquired" ||
  value === "cutscene-completed";

const isVector2 = (value: unknown): value is Vector2 =>
  isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);

const isVector3 = (value: unknown): value is Vector3 =>
  isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y) && isFiniteNumber(value.z);

const isSceneGeometry = (value: unknown): value is SceneGeometry =>
  isRecord(value) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height) &&
  value.width > 0 &&
  value.height > 0;

const isAssetVariant = (value: unknown): value is AssetVariant =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.format === "string" &&
  typeof value.source === "string" &&
  typeof value.usage === "string" &&
  (value.mimeType === undefined || typeof value.mimeType === "string");

const isBuilderAsset = (value: unknown): value is BuilderAsset =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.kind === "string" &&
  typeof value.label === "string" &&
  (value.sceneMode === "2d" || value.sceneMode === "3d") &&
  typeof value.source === "string" &&
  typeof value.sourceFormat === "string" &&
  (value.sourceMimeType === undefined || typeof value.sourceMimeType === "string") &&
  Array.isArray(value.tags) &&
  value.tags.every((tag): tag is string => typeof tag === "string") &&
  Array.isArray(value.variants) &&
  value.variants.every(isAssetVariant) &&
  typeof value.approved === "boolean" &&
  isFiniteNumber(value.createdAtMs) &&
  isFiniteNumber(value.updatedAtMs);

const isCollisionMask = (value: unknown): value is CollisionMask =>
  isRecord(value) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height);

const isMovementVector = (value: unknown): value is MovementVector =>
  isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);

const isSceneNode2D = (value: unknown): value is SceneNode2D =>
  isRecord(value) &&
  typeof value.id === "string" &&
  (value.nodeType === "sprite" ||
    value.nodeType === "tile" ||
    value.nodeType === "spawn" ||
    value.nodeType === "trigger" ||
    value.nodeType === "camera") &&
  (value.assetId === undefined || typeof value.assetId === "string") &&
  (value.animationClipId === undefined || typeof value.animationClipId === "string") &&
  isVector2(value.position) &&
  isRecord(value.size) &&
  isFiniteNumber(value.size.width) &&
  isFiniteNumber(value.size.height) &&
  typeof value.layer === "string";

const isSceneNode3D = (value: unknown): value is SceneNode3D =>
  isRecord(value) &&
  typeof value.id === "string" &&
  (value.nodeType === "model" ||
    value.nodeType === "light" ||
    value.nodeType === "camera" ||
    value.nodeType === "spawn" ||
    value.nodeType === "trigger") &&
  (value.assetId === undefined || typeof value.assetId === "string") &&
  (value.animationClipId === undefined || typeof value.animationClipId === "string") &&
  isVector3(value.position) &&
  isVector3(value.rotation) &&
  isVector3(value.scale);

const isSceneNodeDefinition = (value: unknown): value is SceneNodeDefinition =>
  isSceneNode2D(value) || isSceneNode3D(value);

const isNpcAiBlueprint = (value: unknown): value is NpcAiBlueprint =>
  isRecord(value) &&
  isFiniteNumber(value.wanderRadius) &&
  isFiniteNumber(value.wanderSpeed) &&
  Array.isArray(value.idlePauseMs) &&
  value.idlePauseMs.length === 2 &&
  value.idlePauseMs.every(isFiniteNumber) &&
  typeof value.greetOnApproach === "boolean" &&
  typeof value.greetLineKey === "string";

const isEntityState = (value: unknown): value is EntityState =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.label === "string" &&
  typeof value.characterKey === "string" &&
  isVector2(value.position) &&
  isDirectionValue(value.facing) &&
  typeof value.animation === "string" &&
  isFiniteNumber(value.frame) &&
  isMovementVector(value.velocity) &&
  isCollisionMask(value.bounds);

const isGameDialogueEntry = (value: unknown): value is GameDialogueEntry =>
  isRecord(value) && typeof value.key === "string" && typeof value.text === "string";

const isNpcStateMachineValue = (value: unknown): value is NpcStateMachine =>
  value === "idle" || value === "wander" || value === "face_player" || value === "talking";

const isNpcState = (value: unknown): value is NpcState => {
  if (!isRecord(value) || !isEntityState(value)) {
    return false;
  }

  return (
    typeof value.aiEnabled === "boolean" &&
    isFiniteNumber(value.dialogueIndex) &&
    Array.isArray(value.dialogueLineKeys) &&
    value.dialogueLineKeys.every((lineKey): lineKey is string => typeof lineKey === "string") &&
    Array.isArray(value.dialogueEntries) &&
    value.dialogueEntries.every(isGameDialogueEntry) &&
    isFiniteNumber(value.interactRadius) &&
    isVector2(value.homePosition) &&
    isNpcAiBlueprint(value.aiProfile) &&
    typeof value.active === "boolean" &&
    isNpcStateMachineValue(value.state)
  );
};

const isGameParticipantPresence = (value: unknown): value is GameParticipantPresence =>
  isRecord(value) &&
  typeof value.sessionId === "string" &&
  isGameSessionParticipantRole(value.role) &&
  isEntityState(value.entity);

const isGameDialogue = (value: unknown): value is GameDialogue =>
  isRecord(value) &&
  typeof value.npcId === "string" &&
  typeof value.npcLabel === "string" &&
  typeof value.line === "string" &&
  typeof value.lineKey === "string";

const isGameQuestStepState = (value: unknown): value is GameQuestStepState =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.title === "string" &&
  typeof value.description === "string" &&
  isQuestStepStateValue(value.state);

const isGameQuestState = (value: unknown): value is GameQuestState =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.title === "string" &&
  typeof value.description === "string" &&
  typeof value.completed === "boolean" &&
  Array.isArray(value.steps) &&
  value.steps.every(isGameQuestStepState);

const isFlagRecord = (
  value: unknown,
): value is Readonly<Record<string, string | number | boolean>> =>
  isRecord(value) && Object.values(value).every(isStringRecordValue);

const isTriggerDefinition = (value: unknown): value is TriggerDefinition =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.label === "string" &&
  isTriggerEventTypeValue(value.event) &&
  (value.sceneId === undefined || typeof value.sceneId === "string") &&
  (value.npcId === undefined || typeof value.npcId === "string") &&
  (value.nodeId === undefined || typeof value.nodeId === "string") &&
  (value.requiredFlags === undefined || isFlagRecord(value.requiredFlags)) &&
  (value.setFlags === undefined || isFlagRecord(value.setFlags)) &&
  (value.questId === undefined || typeof value.questId === "string") &&
  (value.questStepId === undefined || typeof value.questStepId === "string");

const isGameSessionParticipantRole = (value: unknown): value is GameSessionParticipantRole =>
  value === "owner" || value === "controller" || value === "spectator";

const isGameSessionParticipant = (value: unknown): value is GameSessionParticipant =>
  isRecord(value) &&
  typeof value.sessionId === "string" &&
  isGameSessionParticipantRole(value.role) &&
  isFiniteNumber(value.joinedAtMs) &&
  isFiniteNumber(value.updatedAtMs);

const isGameSceneStateValue = (value: unknown): value is GameSceneState =>
  isRecord(value) &&
  typeof value.sceneId === "string" &&
  (value.sceneMode === undefined || value.sceneMode === "2d" || value.sceneMode === "3d") &&
  typeof value.sceneTitle === "string" &&
  typeof value.background === "string" &&
  isSceneGeometry(value.geometry) &&
  isEntityState(value.player) &&
  (value.coPlayers === undefined ||
    (Array.isArray(value.coPlayers) && value.coPlayers.every(isGameParticipantPresence))) &&
  Array.isArray(value.npcs) &&
  value.npcs.every(isNpcState) &&
  Array.isArray(value.collisions) &&
  value.collisions.every(isCollisionMask) &&
  (value.nodes === undefined ||
    (Array.isArray(value.nodes) && value.nodes.every(isSceneNodeDefinition))) &&
  (value.assets === undefined ||
    (Array.isArray(value.assets) && value.assets.every(isBuilderAsset))) &&
  isVector2(value.camera) &&
  isGameUiStateValue(value.uiState) &&
  isGameActionStateValue(value.actionState) &&
  (value.dialogue === null || isGameDialogue(value.dialogue)) &&
  (value.quests === undefined ||
    (Array.isArray(value.quests) && value.quests.every(isGameQuestState))) &&
  (value.flags === undefined || isFlagRecord(value.flags)) &&
  isFiniteNumber(value.worldTimeMs);

/**
 * Validates a runtime scene-state payload before it reaches clients or session rehydration.
 *
 * @param payload Untyped value at a persistence or transport boundary.
 * @returns Typed scene state or a deterministic validation failure.
 */
export const validateGameSceneState = (
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: GameSceneState;
    }
  | {
      readonly ok: false;
      readonly message: string;
    } =>
  isGameSceneStateValue(payload)
    ? { ok: true, data: payload }
    : { ok: false, message: "Invalid game scene state payload." };

/**
 * Validates trigger-definition arrays restored from persisted release/session payloads.
 *
 * @param payload Untyped trigger-definition collection.
 * @returns Typed trigger definitions or a deterministic validation failure.
 */
export const validateTriggerDefinitions = (
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: readonly TriggerDefinition[];
    }
  | {
      readonly ok: false;
      readonly message: string;
    } =>
  Array.isArray(payload) && payload.every(isTriggerDefinition)
    ? { ok: true, data: payload }
    : { ok: false, message: "Invalid trigger definition payload." };

/**
 * Validates realtime websocket frames before the browser client mutates runtime state.
 *
 * @param payload Untyped websocket frame payload.
 * @returns Typed realtime frame or a deterministic validation failure.
 */
export const validateGameRealtimeFrame = (
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: GameRealtimeFrame;
    }
  | {
      readonly ok: false;
      readonly message: string;
    } => {
  if (!isRecord(payload)) {
    return { ok: false, message: "Invalid realtime frame payload." };
  }

  let state: GameSceneState | undefined;
  if (payload.state !== undefined) {
    const stateValidation = validateGameSceneState(payload.state);
    if (stateValidation.ok === false) {
      return { ok: false, message: stateValidation.message };
    }

    state = stateValidation.data;
  }

  if (
    payload.commandQueueDepth !== undefined &&
    (!isFiniteNumber(payload.commandQueueDepth) || payload.commandQueueDepth < 0)
  ) {
    return { ok: false, message: "Invalid realtime frame queue depth." };
  }

  if (payload.resumeToken !== undefined && typeof payload.resumeToken !== "string") {
    return { ok: false, message: "Invalid realtime frame resume token." };
  }

  if (
    payload.resumeTokenExpiresAtMs !== undefined &&
    !isFiniteNumber(payload.resumeTokenExpiresAtMs)
  ) {
    return { ok: false, message: "Invalid realtime frame resume expiry." };
  }

  if (
    payload.participants !== undefined &&
    (!Array.isArray(payload.participants) || !payload.participants.every(isGameSessionParticipant))
  ) {
    return { ok: false, message: "Invalid realtime frame participants." };
  }

  if (
    payload.participantRole !== undefined &&
    !isGameSessionParticipantRole(payload.participantRole)
  ) {
    return { ok: false, message: "Invalid realtime frame participant role." };
  }

  if (
    payload.coPlayers !== undefined &&
    (!Array.isArray(payload.coPlayers) || !payload.coPlayers.every(isGameParticipantPresence))
  ) {
    return { ok: false, message: "Invalid realtime frame co-players." };
  }

  const commandQueueDepth =
    payload.commandQueueDepth === undefined ? undefined : (payload.commandQueueDepth as number);
  const resumeToken =
    payload.resumeToken === undefined ? undefined : (payload.resumeToken as string);
  const resumeTokenExpiresAtMs =
    payload.resumeTokenExpiresAtMs === undefined
      ? undefined
      : (payload.resumeTokenExpiresAtMs as number);
  const participants =
    payload.participants === undefined
      ? undefined
      : (payload.participants as readonly GameSessionParticipant[]);
  const participantRole =
    payload.participantRole === undefined
      ? undefined
      : (payload.participantRole as GameSessionParticipantRole);
  const coPlayers =
    payload.coPlayers === undefined
      ? undefined
      : (payload.coPlayers as readonly GameParticipantPresence[]);

  return {
    ok: true,
    data: {
      state,
      commandQueueDepth,
      resumeToken,
      resumeTokenExpiresAtMs,
      participants,
      participantRole,
      coPlayers,
    },
  };
};

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
    const commandPayload = candidate.command;

    const commandValidation = validateGameCommand(
      commandPayload,
      isSupportedLocale(locale) ? (locale as LocaleCode) : sessionLocale,
    );
    if (commandValidation.ok === false) {
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
  if (commandValidation.ok === false) {
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
  /** Authenticated participant identity bound to this session snapshot. */
  readonly participantSessionId: string;
  /** Current scene locale. */
  readonly locale: LocaleCode;
  /** Current server timestamp. */
  readonly timestamp: string;
  /** Published project bound to this session, if any. */
  readonly projectId?: string;
  /** Published release version bound to this session, if any. */
  readonly releaseVersion?: number;
  /** Command queue depth at this point in time. */
  readonly commandQueueDepth: number;
  /** Contract version for replay tooling and deterministic state validation. */
  readonly version: number;
  /** Resume token used by UI reconnection flows. */
  readonly resumeToken: string;
  /** Absolute resume token expiry timestamp in ms since epoch. */
  readonly resumeTokenExpiresAtMs: number;
  /** Monotonic resume-token generation version for deterministic rotation. */
  readonly resumeTokenVersion: number;
  /** Monotonic scene-state version at the time of the snapshot. */
  readonly stateVersion: number;
  /** Role granted to the authenticated participant. */
  readonly participantRole: GameSessionParticipantRole;
  /** Current room participant list. */
  readonly participants: readonly GameSessionParticipant[];
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
 * Canonical HUD snapshot used by SSE transport rendering.
 */
export interface GameHudState {
  /** Stable session identifier. */
  readonly sessionId: string;
  /** Scene title rendered in the HUD. */
  readonly sceneTitle: string;
  /** Active scene runtime mode. */
  readonly sceneMode?: SceneMode;
  /** Active quest title surfaced in the player-facing shell. */
  readonly activeQuestTitle?: string;
  /** Active locale for runtime copy. */
  readonly locale: GameLocale;
  /** Role granted to the active participant. */
  readonly participantRole: GameSessionParticipantRole;
  /** Current room participant list. */
  readonly participants: readonly GameSessionParticipant[];
  /** Current player XP total. */
  readonly xp: number;
  /** Current progression level. */
  readonly level: number;
  /** Active dialogue, if any. */
  readonly dialogue: GameSceneState["dialogue"];
  /** Active combat encounter, if any. */
  readonly combat?: CombatEncounterState;
  /** Active inventory sequence, if open */
  readonly inventory?: PlayerInventoryState;
  /** Active cutscene state, if any. */
  readonly cutscene?: CutscenePlaybackState;
  /** The actively playing cutscene step, if any. */
  readonly activeCutsceneStep?: CutsceneStep;
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
 * Builder asset mutation payload.
 */
export interface BuilderAssetPayload {
  /** Asset identifier. */
  readonly id: string;
  /** Asset definition. */
  readonly asset: BuilderAsset;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder animation clip mutation payload.
 */
export interface BuilderAnimationClipPayload {
  /** Clip identifier. */
  readonly id: string;
  /** Clip definition. */
  readonly clip: AnimationClip;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder animation timeline mutation payload.
 */
export interface BuilderAnimationTimelinePayload {
  /** Timeline identifier. */
  readonly id: string;
  /** Timeline definition. */
  readonly timeline: AnimationTimeline;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder dialogue graph mutation payload.
 */
export interface BuilderDialogueGraphPayload {
  /** Graph identifier. */
  readonly id: string;
  /** Graph definition. */
  readonly graph: DialogueGraph;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder quest mutation payload.
 */
export interface BuilderQuestPayload {
  /** Quest identifier. */
  readonly id: string;
  /** Quest definition. */
  readonly quest: QuestDefinition;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder trigger mutation payload.
 */
export interface BuilderTriggerPayload {
  /** Trigger identifier. */
  readonly id: string;
  /** Trigger definition. */
  readonly trigger: TriggerDefinition;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder automation creation payload.
 */
export interface BuilderAutomationRunPayload {
  /** Run identifier. */
  readonly id: string;
  /** Automation run definition. */
  readonly run: AutomationRun;
  /** Optional checksum for idempotent writes. */
  readonly checksum?: string;
}

/**
 * Builder generation job creation payload.
 */
export interface BuilderGenerationJobPayload {
  /** Job identifier. */
  readonly id: string;
  /** Job definition. */
  readonly job: GenerationJob;
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
  readonly resourceType:
    | "project"
    | "scene"
    | "npc"
    | "dialogue"
    | "asset"
    | "animationClip"
    | "dialogueGraph"
    | "quest"
    | "trigger"
    | "generationJob"
    | "artifact"
    | "automationRun";
  /** Stable resource identifier. */
  readonly resourceId: string;
  /** Mutation action that occurred. */
  readonly action:
    | "created"
    | "updated"
    | "deleted"
    | "published"
    | "queued"
    | "approved"
    | "canceled";
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
        [] as readonly string[],
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

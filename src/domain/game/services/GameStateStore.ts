import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { defaultGameConfig, resolveScene } from "../../../shared/config/game-config.ts";
import { gameAssetUrls } from "../../../shared/constants/game-assets.ts";
import type {
  AssetVariant,
  BuilderAsset,
  EntityState,
  GameActionState,
  GameDialogue,
  GameLocale,
  GameParticipantPresence,
  GameQuestState,
  GameQuestStepState,
  GameSceneState,
  GameSession,
  GameSessionParticipant,
  GameSessionParticipantRole,
  GameSessionSnapshot,
  GameUiState,
  InventorySlot,
  NpcState,
  PlayerInventoryState,
  SceneDefinition,
  SceneNodeDefinition,
  TriggerDefinition,
} from "../../../shared/contracts/game.ts";
import { validateGameSceneState } from "../../../shared/contracts/game.ts";
import { prismaBase } from "../../../shared/services/db.ts";
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
  readonly projectId: string | null;
  readonly releaseVersion: number | null;
  readonly stateVersion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt: Date;
}

interface GameSessionSceneStateRow {
  readonly sessionId: string;
  readonly sceneMode: string;
  readonly sceneTitle: string;
  readonly background: string;
  readonly geometryWidth: number;
  readonly geometryHeight: number;
}

interface GameSessionSceneStateCreateRow {
  readonly sessionId: string;
  readonly sceneMode: string;
  readonly sceneTitle: string;
  readonly background: string;
  readonly geometryWidth: number;
  readonly geometryHeight: number;
}

interface GameSessionSceneCollisionRow {
  readonly sessionId: string;
  readonly ordinal: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface GameSessionSceneCollisionCreateRow {
  readonly sessionId: string;
  readonly ordinal: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface GameSessionSceneNodeRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly nodeType: string;
  readonly assetId: string | null;
  readonly animationClipId: string | null;
  readonly positionX: number;
  readonly positionY: number;
  readonly positionZ: number | null;
  readonly sizeWidth: number | null;
  readonly sizeHeight: number | null;
  readonly layer: string | null;
  readonly rotationX: number | null;
  readonly rotationY: number | null;
  readonly rotationZ: number | null;
  readonly scaleX: number | null;
  readonly scaleY: number | null;
  readonly scaleZ: number | null;
}

interface GameSessionSceneNodeCreateRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly nodeType: string;
  readonly assetId?: string;
  readonly animationClipId?: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly positionZ?: number;
  readonly sizeWidth?: number;
  readonly sizeHeight?: number;
  readonly layer?: string;
  readonly rotationX?: number;
  readonly rotationY?: number;
  readonly rotationZ?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly scaleZ?: number;
}

interface GameSessionSceneAssetRow {
  readonly sessionId: string;
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly sceneMode: string;
  readonly source: string;
  readonly sourceFormat: string;
  readonly sourceMimeType: string | null;
  readonly approved: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface GameSessionSceneAssetTagRow {
  readonly sessionId: string;
  readonly assetId: string;
  readonly ordinal: number;
  readonly value: string;
}

interface GameSessionSceneAssetVariantRow {
  readonly sessionId: string;
  readonly assetId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly format: string;
  readonly source: string;
  readonly usage: string;
  readonly mimeType: string | null;
}

interface GameSessionSceneAssetCreateRow {
  readonly sessionId: string;
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly sceneMode: string;
  readonly source: string;
  readonly sourceFormat: string;
  readonly sourceMimeType?: string;
  readonly approved: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface GameSessionSceneAssetTagCreateRow {
  readonly sessionId: string;
  readonly assetId: string;
  readonly ordinal: number;
  readonly value: string;
}

interface GameSessionSceneAssetVariantCreateRow {
  readonly sessionId: string;
  readonly assetId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly format: string;
  readonly source: string;
  readonly usage: string;
  readonly mimeType?: string;
}

interface GameSessionActorRow {
  readonly sessionId: string;
  readonly participantSessionId: string;
  readonly role: string;
  readonly entityId: string;
  readonly label: string;
  readonly characterKey: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly facing: string;
  readonly animation: string;
  readonly frame: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly boundsX: number;
  readonly boundsY: number;
  readonly boundsWidth: number;
  readonly boundsHeight: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface GameSessionActorCreateRow {
  readonly sessionId: string;
  readonly participantSessionId: string;
  readonly role: GameSessionParticipantRole;
  readonly entityId: string;
  readonly label: string;
  readonly characterKey: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly facing: EntityState["facing"];
  readonly animation: string;
  readonly frame: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly boundsX: number;
  readonly boundsY: number;
  readonly boundsWidth: number;
  readonly boundsHeight: number;
}

interface GameSessionRuntimeStateRow {
  readonly sessionId: string;
  readonly cameraX: number;
  readonly cameraY: number;
  readonly uiState: string;
  readonly actionState: string;
  readonly worldTimeMs: number;
  readonly dialogueNpcId: string | null;
  readonly dialogueNpcLabel: string | null;
  readonly dialogueLine: string | null;
  readonly dialogueLineKey: string | null;
}

interface GameSessionRuntimeStateCreateRow {
  readonly sessionId: string;
  readonly cameraX: number;
  readonly cameraY: number;
  readonly uiState: GameUiState;
  readonly actionState: GameActionState;
  readonly worldTimeMs: number;
  readonly dialogueNpcId?: string;
  readonly dialogueNpcLabel?: string;
  readonly dialogueLine?: string;
  readonly dialogueLineKey?: string;
}

interface GameSessionNpcRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly characterKey: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly label: string;
  readonly facing: string;
  readonly animation: string;
  readonly frame: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly boundsX: number;
  readonly boundsY: number;
  readonly boundsWidth: number;
  readonly boundsHeight: number;
  readonly aiEnabled: boolean;
  readonly dialogueIndex: number;
  readonly interactRadius: number;
  readonly homePositionX: number;
  readonly homePositionY: number;
  readonly wanderRadius: number;
  readonly wanderSpeed: number;
  readonly idlePauseMinMs: number;
  readonly idlePauseMaxMs: number;
  readonly greetOnApproach: boolean;
  readonly greetLineKey: string;
  readonly active: boolean;
  readonly state: string;
}

interface GameSessionNpcDialogueKeyRow {
  readonly sessionId: string;
  readonly npcId: string;
  readonly ordinal: number;
  readonly key: string;
}

interface GameSessionNpcDialogueEntryRow {
  readonly sessionId: string;
  readonly npcId: string;
  readonly ordinal: number;
  readonly key: string;
  readonly text: string;
}

interface GameSessionNpcCreateRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly characterKey: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly label: string;
  readonly facing: EntityState["facing"];
  readonly animation: string;
  readonly frame: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly boundsX: number;
  readonly boundsY: number;
  readonly boundsWidth: number;
  readonly boundsHeight: number;
  readonly aiEnabled: boolean;
  readonly dialogueIndex: number;
  readonly interactRadius: number;
  readonly homePositionX: number;
  readonly homePositionY: number;
  readonly wanderRadius: number;
  readonly wanderSpeed: number;
  readonly idlePauseMinMs: number;
  readonly idlePauseMaxMs: number;
  readonly greetOnApproach: boolean;
  readonly greetLineKey: string;
  readonly active: boolean;
  readonly state: string;
}

interface GameSessionNpcDialogueKeyCreateRow {
  readonly sessionId: string;
  readonly npcId: string;
  readonly ordinal: number;
  readonly key: string;
}

interface GameSessionNpcDialogueEntryCreateRow {
  readonly sessionId: string;
  readonly npcId: string;
  readonly ordinal: number;
  readonly key: string;
  readonly text: string;
}

type PersistedFlagValueType = "string" | "number" | "boolean";

interface GameSessionTriggerRow {
  readonly sessionId: string;
  readonly id: string;
  readonly label: string;
  readonly event: string;
  readonly sceneId: string | null;
  readonly npcId: string | null;
  readonly nodeId: string | null;
  readonly questId: string | null;
  readonly questStepId: string | null;
}

interface GameSessionTriggerFlagRow {
  readonly sessionId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}

interface GameSessionTriggerCreateRow {
  readonly sessionId: string;
  readonly id: string;
  readonly label: string;
  readonly event: TriggerDefinition["event"];
  readonly sceneId?: string;
  readonly npcId?: string;
  readonly nodeId?: string;
  readonly questId?: string;
  readonly questStepId?: string;
}

interface GameSessionTriggerFlagCreateRow {
  readonly sessionId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: PersistedFlagValueType;
  readonly stringValue?: string;
  readonly numberValue?: number;
  readonly boolValue?: boolean;
}

interface GameSessionQuestRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
}

interface GameSessionQuestStepRow {
  readonly sessionId: string;
  readonly questId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly state: string;
}

interface GameSessionQuestCreateRow {
  readonly sessionId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
}

interface GameSessionQuestStepCreateRow {
  readonly sessionId: string;
  readonly questId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly state: GameQuestStepState["state"];
}

interface GameSessionFlagRow {
  readonly sessionId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}

interface GameSessionFlagCreateRow {
  readonly sessionId: string;
  readonly key: string;
  readonly valueType: PersistedFlagValueType;
  readonly stringValue?: string;
  readonly numberValue?: number;
  readonly boolValue?: boolean;
}

interface GameSessionInventorySlotRow {
  readonly sessionId: string;
  readonly slotIndex: number;
  readonly itemId: string;
  readonly quantity: number;
}

interface GameSessionEquipmentRow {
  readonly sessionId: string;
  readonly weapon: string | null;
  readonly armor: string | null;
  readonly accessory: string | null;
  readonly currency: number;
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

const toPersistedSceneStateRow = (
  sessionId: string,
  scene: GameSceneState,
): GameSessionSceneStateCreateRow => ({
  sessionId,
  sceneMode: scene.sceneMode ?? "2d",
  sceneTitle: scene.sceneTitle,
  background: scene.background,
  geometryWidth: scene.geometry.width,
  geometryHeight: scene.geometry.height,
});

const toPersistedSceneCollisionRows = (
  sessionId: string,
  scene: GameSceneState,
): GameSessionSceneCollisionCreateRow[] =>
  scene.collisions.map((collision, ordinal) => ({
    sessionId,
    ordinal,
    x: collision.x,
    y: collision.y,
    width: collision.width,
    height: collision.height,
  }));

const toPersistedSceneNodeRows = (
  sessionId: string,
  scene: GameSceneState,
): GameSessionSceneNodeCreateRow[] =>
  (scene.nodes ?? []).map((node, ordinal) => ({
    sessionId,
    id: node.id,
    ordinal,
    nodeType: node.nodeType,
    assetId: node.assetId,
    animationClipId: node.animationClipId,
    positionX: node.position.x,
    positionY: node.position.y,
    positionZ: "z" in node.position ? node.position.z : undefined,
    sizeWidth: "size" in node ? node.size.width : undefined,
    sizeHeight: "size" in node ? node.size.height : undefined,
    layer: "layer" in node ? node.layer : undefined,
    rotationX: "rotation" in node ? node.rotation.x : undefined,
    rotationY: "rotation" in node ? node.rotation.y : undefined,
    rotationZ: "rotation" in node ? node.rotation.z : undefined,
    scaleX: "scale" in node ? node.scale.x : undefined,
    scaleY: "scale" in node ? node.scale.y : undefined,
    scaleZ: "scale" in node ? node.scale.z : undefined,
  }));

const toPersistedSceneAssetRows = (
  sessionId: string,
  scene: GameSceneState,
): {
  readonly assetRows: GameSessionSceneAssetCreateRow[];
  readonly tagRows: GameSessionSceneAssetTagCreateRow[];
  readonly variantRows: GameSessionSceneAssetVariantCreateRow[];
} => {
  const assetRows: GameSessionSceneAssetCreateRow[] = [];
  const tagRows: GameSessionSceneAssetTagCreateRow[] = [];
  const variantRows: GameSessionSceneAssetVariantCreateRow[] = [];

  for (const asset of scene.assets ?? []) {
    assetRows.push({
      sessionId,
      id: asset.id,
      kind: asset.kind,
      label: asset.label,
      sceneMode: asset.sceneMode,
      source: asset.source,
      sourceFormat: asset.sourceFormat,
      sourceMimeType: asset.sourceMimeType,
      approved: asset.approved,
      createdAt: new Date(asset.createdAtMs),
      updatedAt: new Date(asset.updatedAtMs),
    });
    for (const [ordinal, value] of asset.tags.entries()) {
      tagRows.push({
        sessionId,
        assetId: asset.id,
        ordinal,
        value,
      });
    }
    for (const [ordinal, variant] of asset.variants.entries()) {
      variantRows.push({
        sessionId,
        assetId: asset.id,
        id: variant.id,
        ordinal,
        format: variant.format,
        source: variant.source,
        usage: variant.usage,
        mimeType: variant.mimeType,
      });
    }
  }

  return { assetRows, tagRows, variantRows };
};

const toPersistedActorRowInput = (
  sessionId: string,
  participantSessionId: string,
  role: GameSessionParticipantRole,
  entity: EntityState,
): GameSessionActorCreateRow => ({
  sessionId,
  participantSessionId,
  role,
  entityId: entity.id,
  label: entity.label,
  characterKey: entity.characterKey,
  positionX: entity.position.x,
  positionY: entity.position.y,
  facing: entity.facing,
  animation: entity.animation,
  frame: entity.frame,
  velocityX: entity.velocity.x,
  velocityY: entity.velocity.y,
  boundsX: entity.bounds.x,
  boundsY: entity.bounds.y,
  boundsWidth: entity.bounds.width,
  boundsHeight: entity.bounds.height,
});

const toPersistedActorRows = (session: GameSession): GameSessionActorCreateRow[] => [
  toPersistedActorRowInput(session.id, session.ownerSessionId, "owner", session.scene.player),
  ...(session.scene.coPlayers ?? []).map((presence) =>
    toPersistedActorRowInput(session.id, presence.sessionId, presence.role, presence.entity),
  ),
];

const toPersistedRuntimeStateRow = (
  sessionId: string,
  scene: GameSceneState,
): GameSessionRuntimeStateCreateRow => ({
  sessionId,
  cameraX: scene.camera.x,
  cameraY: scene.camera.y,
  uiState: scene.uiState,
  actionState: scene.actionState,
  worldTimeMs: scene.worldTimeMs,
  dialogueNpcId: scene.dialogue?.npcId,
  dialogueNpcLabel: scene.dialogue?.npcLabel,
  dialogueLine: scene.dialogue?.line,
  dialogueLineKey: scene.dialogue?.lineKey,
});

const toPersistedNpcRows = (
  sessionId: string,
  npcs: readonly NpcState[],
): {
  readonly npcRows: GameSessionNpcCreateRow[];
  readonly dialogueKeyRows: GameSessionNpcDialogueKeyCreateRow[];
  readonly dialogueEntryRows: GameSessionNpcDialogueEntryCreateRow[];
} => {
  const npcRows: GameSessionNpcCreateRow[] = [];
  const dialogueKeyRows: GameSessionNpcDialogueKeyCreateRow[] = [];
  const dialogueEntryRows: GameSessionNpcDialogueEntryCreateRow[] = [];

  for (const [npcOrdinal, npc] of npcs.entries()) {
    npcRows.push({
      sessionId,
      id: npc.id,
      ordinal: npcOrdinal,
      characterKey: npc.characterKey,
      positionX: npc.position.x,
      positionY: npc.position.y,
      label: npc.label,
      facing: npc.facing,
      animation: npc.animation,
      frame: npc.frame,
      velocityX: npc.velocity.x,
      velocityY: npc.velocity.y,
      boundsX: npc.bounds.x,
      boundsY: npc.bounds.y,
      boundsWidth: npc.bounds.width,
      boundsHeight: npc.bounds.height,
      aiEnabled: npc.aiEnabled,
      dialogueIndex: npc.dialogueIndex,
      interactRadius: npc.interactRadius,
      homePositionX: npc.homePosition.x,
      homePositionY: npc.homePosition.y,
      wanderRadius: npc.aiProfile.wanderRadius,
      wanderSpeed: npc.aiProfile.wanderSpeed,
      idlePauseMinMs: npc.aiProfile.idlePauseMs[0],
      idlePauseMaxMs: npc.aiProfile.idlePauseMs[1],
      greetOnApproach: npc.aiProfile.greetOnApproach,
      greetLineKey: npc.aiProfile.greetLineKey,
      active: npc.active,
      state: npc.state,
    });

    for (const [ordinal, key] of npc.dialogueLineKeys.entries()) {
      dialogueKeyRows.push({
        sessionId,
        npcId: npc.id,
        ordinal,
        key,
      });
    }

    for (const [ordinal, entry] of npc.dialogueEntries.entries()) {
      dialogueEntryRows.push({
        sessionId,
        npcId: npc.id,
        ordinal,
        key: entry.key,
        text: entry.text,
      });
    }
  }

  return {
    npcRows,
    dialogueKeyRows,
    dialogueEntryRows,
  };
};

const toEntityStateFromActorRow = (row: GameSessionActorRow): EntityState => ({
  id: row.entityId,
  label: row.label,
  characterKey: row.characterKey,
  position: {
    x: row.positionX,
    y: row.positionY,
  },
  facing: row.facing as EntityState["facing"],
  animation: row.animation,
  frame: row.frame,
  velocity: {
    x: row.velocityX,
    y: row.velocityY,
  },
  bounds: {
    x: row.boundsX,
    y: row.boundsY,
    width: row.boundsWidth,
    height: row.boundsHeight,
  },
});

const toPresenceFromActorRow = (row: GameSessionActorRow): GameParticipantPresence => ({
  sessionId: row.participantSessionId,
  role: row.role as Exclude<GameSessionParticipantRole, "owner">,
  entity: toEntityStateFromActorRow(row),
});

const toSceneCollisionsFromRows = (
  rows: readonly GameSessionSceneCollisionRow[],
): GameSceneState["collisions"] =>
  [...rows]
    .sort((left, right) => left.ordinal - right.ordinal)
    .map((row) => ({
      x: row.x,
      y: row.y,
      width: row.width,
      height: row.height,
    }));

const toSceneNodesFromRows = (
  rows: readonly GameSessionSceneNodeRow[],
): readonly SceneNodeDefinition[] =>
  [...rows]
    .sort((left, right) => left.ordinal - right.ordinal)
    .flatMap((row): readonly SceneNodeDefinition[] => {
      const isThreeDimensionalNode =
        row.positionZ !== null ||
        row.rotationX !== null ||
        row.rotationY !== null ||
        row.rotationZ !== null ||
        row.scaleX !== null ||
        row.scaleY !== null ||
        row.scaleZ !== null;

      if (isThreeDimensionalNode) {
        return [
          {
            id: row.id,
            nodeType: row.nodeType as SceneNodeDefinition["nodeType"],
            assetId: row.assetId ?? undefined,
            animationClipId: row.animationClipId ?? undefined,
            position: {
              x: row.positionX,
              y: row.positionY,
              z: row.positionZ ?? 0,
            },
            rotation: {
              x: row.rotationX ?? 0,
              y: row.rotationY ?? 0,
              z: row.rotationZ ?? 0,
            },
            scale: {
              x: row.scaleX ?? 1,
              y: row.scaleY ?? 1,
              z: row.scaleZ ?? 1,
            },
          } as SceneNodeDefinition,
        ];
      }

      return [
        {
          id: row.id,
          nodeType: row.nodeType as SceneNodeDefinition["nodeType"],
          assetId: row.assetId ?? undefined,
          animationClipId: row.animationClipId ?? undefined,
          position: {
            x: row.positionX,
            y: row.positionY,
          },
          size: {
            width: row.sizeWidth ?? 0,
            height: row.sizeHeight ?? 0,
          },
          layer: row.layer ?? "scene",
        } as SceneNodeDefinition,
      ];
    });

const toSceneAssetsFromRows = (
  assetRows: readonly GameSessionSceneAssetRow[],
  tagRows: readonly GameSessionSceneAssetTagRow[],
  variantRows: readonly GameSessionSceneAssetVariantRow[],
): readonly BuilderAsset[] =>
  [...assetRows]
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
    .map((assetRow) => {
      const tags = tagRows
        .filter((row) => row.sessionId === assetRow.sessionId && row.assetId === assetRow.id)
        .sort((left, right) => left.ordinal - right.ordinal)
        .map((row) => row.value);
      const variants: AssetVariant[] = variantRows
        .filter((row) => row.sessionId === assetRow.sessionId && row.assetId === assetRow.id)
        .sort((left, right) => left.ordinal - right.ordinal)
        .map((row) => ({
          id: row.id,
          format: row.format,
          source: row.source,
          usage: row.usage,
          mimeType: row.mimeType ?? undefined,
        }));

      return {
        id: assetRow.id,
        kind: assetRow.kind as BuilderAsset["kind"],
        label: assetRow.label,
        sceneMode: assetRow.sceneMode as BuilderAsset["sceneMode"],
        source: assetRow.source,
        sourceFormat: assetRow.sourceFormat,
        sourceMimeType: assetRow.sourceMimeType ?? undefined,
        tags,
        variants,
        approved: assetRow.approved,
        createdAtMs: assetRow.createdAt.getTime(),
        updatedAtMs: assetRow.updatedAt.getTime(),
      };
    });

const toDialogueFromRuntimeStateRow = (
  row: GameSessionRuntimeStateRow | null,
): GameDialogue | null => {
  if (
    !row ||
    !row.dialogueNpcId ||
    !row.dialogueNpcLabel ||
    !row.dialogueLine ||
    !row.dialogueLineKey
  ) {
    return null;
  }

  return {
    npcId: row.dialogueNpcId,
    npcLabel: row.dialogueNpcLabel,
    line: row.dialogueLine,
    lineKey: row.dialogueLineKey,
  };
};

const toNpcStatesFromRows = (
  npcRows: readonly GameSessionNpcRow[],
  dialogueKeyRows: readonly GameSessionNpcDialogueKeyRow[],
  dialogueEntryRows: readonly GameSessionNpcDialogueEntryRow[],
): readonly NpcState[] => {
  if (npcRows.length === 0) {
    return [];
  }

  const dialogueKeysByNpc = new Map<string, string[]>();
  for (const row of dialogueKeyRows) {
    const current = dialogueKeysByNpc.get(row.npcId) ?? [];
    current[row.ordinal] = row.key;
    dialogueKeysByNpc.set(row.npcId, current);
  }

  const dialogueEntriesByNpc = new Map<string, { key: string; text: string }[]>();
  for (const row of dialogueEntryRows) {
    const current = dialogueEntriesByNpc.get(row.npcId) ?? [];
    current[row.ordinal] = {
      key: row.key,
      text: row.text,
    };
    dialogueEntriesByNpc.set(row.npcId, current);
  }

  return [...npcRows]
    .sort((left, right) => left.ordinal - right.ordinal)
    .map((row) => ({
      id: row.id,
      label: row.label,
      characterKey: row.characterKey,
      position: {
        x: row.positionX,
        y: row.positionY,
      },
      facing: row.facing as EntityState["facing"],
      animation: row.animation,
      frame: row.frame,
      velocity: {
        x: row.velocityX,
        y: row.velocityY,
      },
      bounds: {
        x: row.boundsX,
        y: row.boundsY,
        width: row.boundsWidth,
        height: row.boundsHeight,
      },
      aiEnabled: row.aiEnabled,
      dialogueIndex: row.dialogueIndex,
      dialogueLineKeys: (dialogueKeysByNpc.get(row.id) ?? []).filter(
        (key): key is string => typeof key === "string",
      ),
      dialogueEntries: (dialogueEntriesByNpc.get(row.id) ?? []).filter(
        (entry): entry is { key: string; text: string } =>
          typeof entry?.key === "string" && typeof entry?.text === "string",
      ),
      interactRadius: row.interactRadius,
      homePosition: {
        x: row.homePositionX,
        y: row.homePositionY,
      },
      aiProfile: {
        wanderRadius: row.wanderRadius,
        wanderSpeed: row.wanderSpeed,
        idlePauseMs: [row.idlePauseMinMs, row.idlePauseMaxMs],
        greetOnApproach: row.greetOnApproach,
        greetLineKey: row.greetLineKey,
      },
      active: row.active,
      state: row.state as NpcState["state"],
    }));
};

const toPersistedFlagValueType = (value: string | number | boolean): PersistedFlagValueType => {
  if (typeof value === "string") {
    return "string";
  }
  if (typeof value === "number") {
    return "number";
  }
  return "boolean";
};

const toPersistedTriggerRows = (
  sessionId: string,
  triggers: readonly TriggerDefinition[] | undefined,
): {
  readonly triggerRows: GameSessionTriggerCreateRow[];
  readonly requiredFlagRows: GameSessionTriggerFlagCreateRow[];
  readonly setFlagRows: GameSessionTriggerFlagCreateRow[];
} => {
  const triggerRows: GameSessionTriggerCreateRow[] = [];
  const requiredFlagRows: GameSessionTriggerFlagCreateRow[] = [];
  const setFlagRows: GameSessionTriggerFlagCreateRow[] = [];

  for (const trigger of triggers ?? []) {
    triggerRows.push({
      sessionId,
      id: trigger.id,
      label: trigger.label,
      event: trigger.event,
      sceneId: trigger.sceneId,
      npcId: trigger.npcId,
      nodeId: trigger.nodeId,
      questId: trigger.questId,
      questStepId: trigger.questStepId,
    });

    for (const [key, value] of Object.entries(trigger.requiredFlags ?? {})) {
      requiredFlagRows.push({
        sessionId,
        triggerId: trigger.id,
        key,
        valueType: toPersistedFlagValueType(value),
        stringValue: typeof value === "string" ? value : undefined,
        numberValue: typeof value === "number" ? value : undefined,
        boolValue: typeof value === "boolean" ? value : undefined,
      });
    }

    for (const [key, value] of Object.entries(trigger.setFlags ?? {})) {
      setFlagRows.push({
        sessionId,
        triggerId: trigger.id,
        key,
        valueType: toPersistedFlagValueType(value),
        stringValue: typeof value === "string" ? value : undefined,
        numberValue: typeof value === "number" ? value : undefined,
        boolValue: typeof value === "boolean" ? value : undefined,
      });
    }
  }

  return {
    triggerRows,
    requiredFlagRows,
    setFlagRows,
  };
};

const fromPersistedTriggerFlagValue = (
  row: GameSessionTriggerFlagRow,
): string | number | boolean | undefined => {
  if (row.valueType === "string") {
    return row.stringValue ?? undefined;
  }
  if (row.valueType === "number") {
    return row.numberValue ?? undefined;
  }
  if (row.valueType === "boolean") {
    return row.boolValue ?? undefined;
  }
  return undefined;
};

const fromPersistedSessionFlagValue = (
  row: GameSessionFlagRow,
): string | number | boolean | undefined => {
  if (row.valueType === "string") {
    return row.stringValue ?? undefined;
  }
  if (row.valueType === "number") {
    return row.numberValue ?? undefined;
  }
  if (row.valueType === "boolean") {
    return row.boolValue ?? undefined;
  }
  return undefined;
};

const toPersistedSessionFlagRows = (
  sessionId: string,
  flags: GameSceneState["flags"],
): GameSessionFlagCreateRow[] =>
  Object.entries(flags ?? {}).map(([key, value]) => ({
    sessionId,
    key,
    valueType: toPersistedFlagValueType(value),
    stringValue: typeof value === "string" ? value : undefined,
    numberValue: typeof value === "number" ? value : undefined,
    boolValue: typeof value === "boolean" ? value : undefined,
  }));

const toSessionFlagsFromRows = (
  flagRows: readonly GameSessionFlagRow[],
): Readonly<Record<string, string | number | boolean>> | undefined => {
  if (flagRows.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    flagRows.flatMap((row) => {
      const value = fromPersistedSessionFlagValue(row);
      return value === undefined ? [] : [[row.key, value] as const];
    }),
  );
};

const toPersistedQuestRows = (
  sessionId: string,
  quests: GameSceneState["quests"],
): {
  readonly questRows: GameSessionQuestCreateRow[];
  readonly questStepRows: GameSessionQuestStepCreateRow[];
} => {
  const questRows: GameSessionQuestCreateRow[] = [];
  const questStepRows: GameSessionQuestStepCreateRow[] = [];

  for (const [questOrdinal, quest] of (quests ?? []).entries()) {
    questRows.push({
      sessionId,
      id: quest.id,
      ordinal: questOrdinal,
      title: quest.title,
      description: quest.description,
      completed: quest.completed,
    });

    for (const [stepOrdinal, step] of quest.steps.entries()) {
      questStepRows.push({
        sessionId,
        questId: quest.id,
        id: step.id,
        ordinal: stepOrdinal,
        title: step.title,
        description: step.description,
        state: step.state,
      });
    }
  }

  return {
    questRows,
    questStepRows,
  };
};

const toSessionQuestsFromRows = (
  questRows: readonly GameSessionQuestRow[],
  questStepRows: readonly GameSessionQuestStepRow[],
): readonly GameQuestState[] | undefined => {
  if (questRows.length === 0) {
    return undefined;
  }

  const stepsByQuestId = new Map<
    string,
    { readonly ordinal: number; readonly step: GameQuestStepState }[]
  >();
  for (const row of questStepRows) {
    const current = stepsByQuestId.get(row.questId) ?? [];
    current.push({
      ordinal: row.ordinal,
      step: {
        id: row.id,
        title: row.title,
        description: row.description,
        state: row.state as GameQuestStepState["state"],
      },
    });
    stepsByQuestId.set(row.questId, current);
  }

  return [...questRows]
    .sort((left, right) => left.ordinal - right.ordinal)
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      steps: (stepsByQuestId.get(row.id) ?? [])
        .sort((left, right) => left.ordinal - right.ordinal)
        .map((entry) => entry.step),
    }));
};

const toPersistedInventorySlotRows = (
  sessionId: string,
  inventory?: PlayerInventoryState,
): GameSessionInventorySlotRow[] =>
  (inventory?.slots ?? []).map((slot, index) => ({
    sessionId,
    slotIndex: index,
    itemId: slot.itemId,
    quantity: slot.quantity,
  }));

const toPersistedEquipmentRow = (
  sessionId: string,
  inventory?: PlayerInventoryState,
): GameSessionEquipmentRow => ({
  sessionId,
  weapon: inventory?.equipment.weapon ?? null,
  armor: inventory?.equipment.armor ?? null,
  accessory: inventory?.equipment.accessory ?? null,
  currency: inventory?.currency ?? 0,
});

const toInventoryStateFromRows = (
  slotRows: readonly GameSessionInventorySlotRow[],
  equipmentRow: GameSessionEquipmentRow | null,
): PlayerInventoryState | undefined => {
  if (slotRows.length === 0 && !equipmentRow) {
    return undefined;
  }

  const slots: InventorySlot[] = [];
  for (const row of slotRows) {
    slots[row.slotIndex] = {
      slotIndex: row.slotIndex,
      itemId: row.itemId,
      quantity: row.quantity,
    };
  }

  const denseSlots = Array.from(slots, (item) => item || undefined).filter(
    (item): item is InventorySlot => item !== undefined,
  );

  return {
    slots: denseSlots,
    equipment: {
      weapon: equipmentRow?.weapon ?? undefined,
      armor: equipmentRow?.armor ?? undefined,
      accessory: equipmentRow?.accessory ?? undefined,
    },
    currency: equipmentRow?.currency ?? 0,
    capacity: 20,
  };
};

const toTriggerDefinitionsFromRows = (
  triggerRows: readonly GameSessionTriggerRow[],
  requiredFlagRows: readonly GameSessionTriggerFlagRow[],
  setFlagRows: readonly GameSessionTriggerFlagRow[],
): readonly TriggerDefinition[] => {
  const requiredFlagsByTrigger = new Map<string, Record<string, string | number | boolean>>();
  for (const row of requiredFlagRows) {
    const value = fromPersistedTriggerFlagValue(row);
    if (value === undefined) {
      continue;
    }
    const current = requiredFlagsByTrigger.get(row.triggerId) ?? {};
    current[row.key] = value;
    requiredFlagsByTrigger.set(row.triggerId, current);
  }

  const setFlagsByTrigger = new Map<string, Record<string, string | number | boolean>>();
  for (const row of setFlagRows) {
    const value = fromPersistedTriggerFlagValue(row);
    if (value === undefined) {
      continue;
    }
    const current = setFlagsByTrigger.get(row.triggerId) ?? {};
    current[row.key] = value;
    setFlagsByTrigger.set(row.triggerId, current);
  }

  return triggerRows.map((row) => {
    const requiredFlags = requiredFlagsByTrigger.get(row.id);
    const setFlags = setFlagsByTrigger.get(row.id);

    return {
      id: row.id,
      label: row.label,
      event: row.event as TriggerDefinition["event"],
      sceneId: row.sceneId ?? undefined,
      npcId: row.npcId ?? undefined,
      nodeId: row.nodeId ?? undefined,
      requiredFlags,
      setFlags,
      questId: row.questId ?? undefined,
      questStepId: row.questStepId ?? undefined,
    };
  });
};

interface SceneStateRestoreResult {
  readonly scene: GameSceneState;
  readonly projectId?: string;
  readonly releaseVersion?: number;
  readonly triggerDefinitions?: readonly TriggerDefinition[];
  readonly repaired: boolean;
  readonly migratedSceneState: boolean;
  readonly migratedActors: boolean;
  readonly migratedTriggers: boolean;
  readonly migratedQuests: boolean;
  readonly migratedFlags: boolean;
  readonly migratedRuntimeState: boolean;
  readonly migratedNpcs: boolean;
}

/**
 * Rebuilds malformed persisted scene state from canonical scene definitions.
 */
const restoreSceneState = (
  row: GameSessionRow,
  sceneStateRow: GameSessionSceneStateRow | null,
  sceneCollisionRows: readonly GameSessionSceneCollisionRow[],
  sceneNodeRows: readonly GameSessionSceneNodeRow[],
  sceneAssetRows: readonly GameSessionSceneAssetRow[],
  sceneAssetTagRows: readonly GameSessionSceneAssetTagRow[],
  sceneAssetVariantRows: readonly GameSessionSceneAssetVariantRow[],
  actorRows: readonly GameSessionActorRow[],
  runtimeStateRow: GameSessionRuntimeStateRow | null,
  npcRows: readonly GameSessionNpcRow[],
  npcDialogueKeyRows: readonly GameSessionNpcDialogueKeyRow[],
  npcDialogueEntryRows: readonly GameSessionNpcDialogueEntryRow[],
  triggerRows: readonly GameSessionTriggerRow[],
  requiredFlagRows: readonly GameSessionTriggerFlagRow[],
  setFlagRows: readonly GameSessionTriggerFlagRow[],
  questRows: readonly GameSessionQuestRow[],
  questStepRows: readonly GameSessionQuestStepRow[],
  flagRows: readonly GameSessionFlagRow[],
  inventorySlotRows: readonly GameSessionInventorySlotRow[],
  equipmentRow: GameSessionEquipmentRow | null,
): SceneStateRestoreResult => {
  const persistedNpcs = toNpcStatesFromRows(npcRows, npcDialogueKeyRows, npcDialogueEntryRows);
  const persistedInventory = toInventoryStateFromRows(inventorySlotRows, equipmentRow);
  const persistedTriggers = toTriggerDefinitionsFromRows(
    triggerRows,
    requiredFlagRows,
    setFlagRows,
  );
  const persistedQuests = toSessionQuestsFromRows(questRows, questStepRows);
  const persistedFlags = toSessionFlagsFromRows(flagRows);

  const persistedCollisions = toSceneCollisionsFromRows(sceneCollisionRows);
  const persistedNodes = toSceneNodesFromRows(sceneNodeRows);
  const persistedAssets = toSceneAssetsFromRows(
    sceneAssetRows,
    sceneAssetTagRows,
    sceneAssetVariantRows,
  );
  const ownerActor = actorRows.find((actor) => actor.participantSessionId === row.ownerSessionId);
  const coPlayerActors = actorRows.filter(
    (actor) => actor.participantSessionId !== row.ownerSessionId,
  );

  if (ownerActor) {
    const candidateScene = {
      sceneId: row.sceneId,
      sceneMode: (sceneStateRow?.sceneMode as GameSceneState["sceneMode"] | undefined) ?? "2d",
      sceneTitle: sceneStateRow?.sceneTitle ?? row.sceneId,
      background: sceneStateRow?.background ?? gameAssetUrls.teaHouseBackground,
      geometry:
        sceneStateRow !== null
          ? {
              width: sceneStateRow.geometryWidth,
              height: sceneStateRow.geometryHeight,
            }
          : undefined,
      collisions: sceneCollisionRows.length > 0 ? persistedCollisions : [],
      nodes: sceneNodeRows.length > 0 ? persistedNodes : [],
      assets: sceneAssetRows.length > 0 ? persistedAssets : [],
      player: toEntityStateFromActorRow(ownerActor),
      coPlayers:
        coPlayerActors.length > 0
          ? coPlayerActors.map((actor) => toPresenceFromActorRow(actor))
          : [],
      npcs: persistedNpcs.length > 0 ? persistedNpcs : [],
      camera: runtimeStateRow
        ? {
            x: runtimeStateRow.cameraX,
            y: runtimeStateRow.cameraY,
          }
        : undefined,
      uiState: runtimeStateRow?.uiState,
      actionState: runtimeStateRow?.actionState,
      dialogue: runtimeStateRow ? toDialogueFromRuntimeStateRow(runtimeStateRow) : undefined,
      worldTimeMs: runtimeStateRow?.worldTimeMs,
      quests: persistedQuests,
      flags: persistedFlags ?? {},
      inventory: persistedInventory,
    };
    const sceneValidation = validateGameSceneState(candidateScene);
    if (sceneValidation.ok) {
      return {
        scene: structuredClone(sceneValidation.data),
        projectId: row.projectId ?? undefined,
        releaseVersion: row.releaseVersion ?? undefined,
        triggerDefinitions:
          persistedTriggers.length > 0 ? structuredClone(persistedTriggers) : undefined,
        repaired: false,
        migratedSceneState: sceneStateRow === null,
        migratedActors: actorRows.length === 0,
        migratedTriggers: false,
        migratedQuests: false,
        migratedFlags: false,
        migratedRuntimeState: runtimeStateRow === null,
        migratedNpcs: false,
      };
    }
  }

  const sceneDefinition = resolveScene(row.sceneId) ?? defaultSceneDefinition();
  return {
    scene: buildSessionSceneState(sceneDefinition, row.locale as GameLocale, row.seed),
    projectId: row.projectId ?? undefined,
    releaseVersion: row.releaseVersion ?? undefined,
    triggerDefinitions: undefined,
    repaired: true,
    migratedSceneState: false,
    migratedActors: true,
    migratedTriggers: false,
    migratedQuests: false,
    migratedFlags: false,
    migratedRuntimeState: false,
    migratedNpcs: false,
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
  sceneStateRow: GameSessionSceneStateRow | null,
  sceneCollisionRows: readonly GameSessionSceneCollisionRow[],
  sceneNodeRows: readonly GameSessionSceneNodeRow[],
  sceneAssetRows: readonly GameSessionSceneAssetRow[],
  sceneAssetTagRows: readonly GameSessionSceneAssetTagRow[],
  sceneAssetVariantRows: readonly GameSessionSceneAssetVariantRow[],
  actorRows: readonly GameSessionActorRow[],
  runtimeStateRow: GameSessionRuntimeStateRow | null,
  npcRows: readonly GameSessionNpcRow[],
  npcDialogueKeyRows: readonly GameSessionNpcDialogueKeyRow[],
  npcDialogueEntryRows: readonly GameSessionNpcDialogueEntryRow[],
  triggerRows: readonly GameSessionTriggerRow[],
  requiredFlagRows: readonly GameSessionTriggerFlagRow[],
  setFlagRows: readonly GameSessionTriggerFlagRow[],
  questRows: readonly GameSessionQuestRow[],
  questStepRows: readonly GameSessionQuestStepRow[],
  flagRows: readonly GameSessionFlagRow[],
  inventorySlotRows: readonly GameSessionInventorySlotRow[],
  equipmentRow: GameSessionEquipmentRow | null,
): { readonly session: GameSession; readonly repaired: boolean } => {
  const restored = restoreSceneState(
    row,
    sceneStateRow,
    sceneCollisionRows,
    sceneNodeRows,
    sceneAssetRows,
    sceneAssetTagRows,
    sceneAssetVariantRows,
    actorRows,
    runtimeStateRow,
    npcRows,
    npcDialogueKeyRows,
    npcDialogueEntryRows,
    triggerRows,
    requiredFlagRows,
    setFlagRows,
    questRows,
    questStepRows,
    flagRows,
    inventorySlotRows,
    equipmentRow,
  );
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
    repaired:
      restored.repaired ||
      restored.migratedSceneState ||
      restored.migratedActors ||
      restored.migratedTriggers ||
      restored.migratedQuests ||
      restored.migratedFlags ||
      restored.migratedRuntimeState ||
      restored.migratedNpcs,
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
    const sessionParticipants =
      this.participants.get(sessionId) ?? new Map<string, StoredParticipantEntry>();
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
    const persistedSceneState = toPersistedSceneStateRow(resolvedId, seed.scene);
    const persistedSceneCollisions = toPersistedSceneCollisionRows(resolvedId, seed.scene);
    const persistedSceneNodes = toPersistedSceneNodeRows(resolvedId, seed.scene);
    const persistedSceneAssets = toPersistedSceneAssetRows(resolvedId, seed.scene);
    const persistedTriggers = toPersistedTriggerRows(resolvedId, seed.triggerDefinitions);
    const persistedQuests = toPersistedQuestRows(resolvedId, seed.scene.quests);
    const persistedFlags = toPersistedSessionFlagRows(resolvedId, seed.scene.flags);
    const persistedRuntimeState = toPersistedRuntimeStateRow(resolvedId, seed.scene);
    const persistedNpcs = toPersistedNpcRows(resolvedId, seed.scene.npcs);
    const persistedInventorySlots = toPersistedInventorySlotRows(resolvedId, seed.scene.inventory);
    const persistedEquipment = toPersistedEquipmentRow(resolvedId, seed.scene.inventory);

    const [persisted] = await prismaBase.$transaction([
      prismaBase.gameSession.create({
        data: {
          id: resolvedId,
          ownerSessionId: seed.ownerSessionId,
          seed: seed.seed,
          locale: seed.locale as string,
          sceneId: seed.scene.sceneId,
          projectId: seed.projectId,
          releaseVersion: seed.releaseVersion,
          stateVersion: 1,
          createdAt,
          updatedAt: createdAt,
          expiresAt,
        },
      }),
      prismaBase.gameSessionActor.createMany({
        data: [
          toPersistedActorRowInput(resolvedId, seed.ownerSessionId, "owner", seed.scene.player),
        ],
      }),
      prismaBase.gameSessionSceneState.create({
        data: persistedSceneState,
      }),
      prismaBase.gameSessionSceneCollision.createMany({
        data: persistedSceneCollisions,
      }),
      prismaBase.gameSessionSceneNode.createMany({
        data: persistedSceneNodes,
      }),
      prismaBase.gameSessionSceneAsset.createMany({
        data: persistedSceneAssets.assetRows,
      }),
      prismaBase.gameSessionSceneAssetTag.createMany({
        data: persistedSceneAssets.tagRows,
      }),
      prismaBase.gameSessionSceneAssetVariant.createMany({
        data: persistedSceneAssets.variantRows,
      }),
      prismaBase.gameSessionRuntimeState.create({
        data: persistedRuntimeState,
      }),
      prismaBase.gameSessionNpc.createMany({
        data: persistedNpcs.npcRows,
      }),
      prismaBase.gameSessionNpcDialogueKey.createMany({
        data: persistedNpcs.dialogueKeyRows,
      }),
      prismaBase.gameSessionNpcDialogueEntry.createMany({
        data: persistedNpcs.dialogueEntryRows,
      }),
      prismaBase.gameSessionTrigger.createMany({
        data: persistedTriggers.triggerRows,
      }),
      prismaBase.gameSessionTriggerRequiredFlag.createMany({
        data: persistedTriggers.requiredFlagRows,
      }),
      prismaBase.gameSessionTriggerSetFlag.createMany({
        data: persistedTriggers.setFlagRows,
      }),
      prismaBase.gameSessionQuest.createMany({
        data: persistedQuests.questRows,
      }),
      prismaBase.gameSessionQuestStep.createMany({
        data: persistedQuests.questStepRows,
      }),
      prismaBase.gameSessionFlag.createMany({
        data: persistedFlags,
      }),
      prismaBase.gameSessionInventorySlot.createMany({
        data: persistedInventorySlots,
      }),
      prismaBase.gameSessionEquipment.create({
        data: persistedEquipment,
      }),
    ]);

    return {
      ...toGameSessionFromRow(
        persisted,
        {
          sessionId: resolvedId,
          sceneMode: persistedSceneState.sceneMode,
          sceneTitle: persistedSceneState.sceneTitle,
          background: persistedSceneState.background,
          geometryWidth: persistedSceneState.geometryWidth,
          geometryHeight: persistedSceneState.geometryHeight,
        },
        persistedSceneCollisions.map((row) => ({ ...row })),
        persistedSceneNodes.map((row) => ({
          sessionId: row.sessionId,
          id: row.id,
          ordinal: row.ordinal,
          nodeType: row.nodeType,
          assetId: row.assetId ?? null,
          animationClipId: row.animationClipId ?? null,
          positionX: row.positionX,
          positionY: row.positionY,
          positionZ: row.positionZ ?? null,
          sizeWidth: row.sizeWidth ?? null,
          sizeHeight: row.sizeHeight ?? null,
          layer: row.layer ?? null,
          rotationX: row.rotationX ?? null,
          rotationY: row.rotationY ?? null,
          rotationZ: row.rotationZ ?? null,
          scaleX: row.scaleX ?? null,
          scaleY: row.scaleY ?? null,
          scaleZ: row.scaleZ ?? null,
        })),
        persistedSceneAssets.assetRows.map((row) => ({
          sessionId: row.sessionId,
          id: row.id,
          kind: row.kind,
          label: row.label,
          sceneMode: row.sceneMode,
          source: row.source,
          sourceFormat: row.sourceFormat,
          sourceMimeType: row.sourceMimeType ?? null,
          approved: row.approved,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        })),
        persistedSceneAssets.tagRows.map((row) => ({ ...row })),
        persistedSceneAssets.variantRows.map((row) => ({
          sessionId: row.sessionId,
          assetId: row.assetId,
          id: row.id,
          ordinal: row.ordinal,
          format: row.format,
          source: row.source,
          usage: row.usage,
          mimeType: row.mimeType ?? null,
        })),
        [
          {
            sessionId: resolvedId,
            participantSessionId: seed.ownerSessionId,
            role: "owner",
            entityId: seed.scene.player.id,
            label: seed.scene.player.label,
            characterKey: seed.scene.player.characterKey,
            positionX: seed.scene.player.position.x,
            positionY: seed.scene.player.position.y,
            facing: seed.scene.player.facing,
            animation: seed.scene.player.animation,
            frame: seed.scene.player.frame,
            velocityX: seed.scene.player.velocity.x,
            velocityY: seed.scene.player.velocity.y,
            boundsX: seed.scene.player.bounds.x,
            boundsY: seed.scene.player.bounds.y,
            boundsWidth: seed.scene.player.bounds.width,
            boundsHeight: seed.scene.player.bounds.height,
            createdAt,
            updatedAt: createdAt,
          },
        ],
        {
          sessionId: resolvedId,
          cameraX: persistedRuntimeState.cameraX,
          cameraY: persistedRuntimeState.cameraY,
          uiState: persistedRuntimeState.uiState,
          actionState: persistedRuntimeState.actionState,
          worldTimeMs: persistedRuntimeState.worldTimeMs,
          dialogueNpcId: persistedRuntimeState.dialogueNpcId ?? null,
          dialogueNpcLabel: persistedRuntimeState.dialogueNpcLabel ?? null,
          dialogueLine: persistedRuntimeState.dialogueLine ?? null,
          dialogueLineKey: persistedRuntimeState.dialogueLineKey ?? null,
        },
        persistedNpcs.npcRows.map((row) => ({
          sessionId: row.sessionId,
          id: row.id,
          ordinal: row.ordinal,
          characterKey: row.characterKey,
          positionX: row.positionX,
          positionY: row.positionY,
          label: row.label,
          facing: row.facing,
          animation: row.animation,
          frame: row.frame,
          velocityX: row.velocityX,
          velocityY: row.velocityY,
          boundsX: row.boundsX,
          boundsY: row.boundsY,
          boundsWidth: row.boundsWidth,
          boundsHeight: row.boundsHeight,
          aiEnabled: row.aiEnabled,
          dialogueIndex: row.dialogueIndex,
          interactRadius: row.interactRadius,
          homePositionX: row.homePositionX,
          homePositionY: row.homePositionY,
          wanderRadius: row.wanderRadius,
          wanderSpeed: row.wanderSpeed,
          idlePauseMinMs: row.idlePauseMinMs,
          idlePauseMaxMs: row.idlePauseMaxMs,
          greetOnApproach: row.greetOnApproach,
          greetLineKey: row.greetLineKey,
          active: row.active,
          state: row.state,
        })),
        persistedNpcs.dialogueKeyRows.map((row) => ({
          sessionId: row.sessionId,
          npcId: row.npcId,
          ordinal: row.ordinal,
          key: row.key,
        })),
        persistedNpcs.dialogueEntryRows.map((row) => ({
          sessionId: row.sessionId,
          npcId: row.npcId,
          ordinal: row.ordinal,
          key: row.key,
          text: row.text,
        })),
        persistedTriggers.triggerRows.map((row) => ({
          sessionId: row.sessionId,
          id: row.id,
          label: row.label,
          event: row.event,
          sceneId: row.sceneId ?? null,
          npcId: row.npcId ?? null,
          nodeId: row.nodeId ?? null,
          questId: row.questId ?? null,
          questStepId: row.questStepId ?? null,
        })),
        persistedTriggers.requiredFlagRows.map((row) => ({
          sessionId: row.sessionId,
          triggerId: row.triggerId,
          key: row.key,
          valueType: row.valueType,
          stringValue: row.stringValue ?? null,
          numberValue: row.numberValue ?? null,
          boolValue: row.boolValue ?? null,
        })),
        persistedTriggers.setFlagRows.map((row) => ({
          sessionId: row.sessionId,
          triggerId: row.triggerId,
          key: row.key,
          valueType: row.valueType,
          stringValue: row.stringValue ?? null,
          numberValue: row.numberValue ?? null,
          boolValue: row.boolValue ?? null,
        })),
        persistedQuests.questRows.map((row) => ({
          sessionId: row.sessionId,
          id: row.id,
          ordinal: row.ordinal,
          title: row.title,
          description: row.description,
          completed: row.completed,
        })),
        persistedQuests.questStepRows.map((row) => ({
          sessionId: row.sessionId,
          questId: row.questId,
          id: row.id,
          ordinal: row.ordinal,
          title: row.title,
          description: row.description,
          state: row.state,
        })),
        persistedFlags.map((row) => ({
          sessionId: row.sessionId,
          key: row.key,
          valueType: row.valueType,
          stringValue: row.stringValue ?? null,
          numberValue: row.numberValue ?? null,
          boolValue: row.boolValue ?? null,
        })),
        persistedInventorySlots,
        persistedEquipment,
      ).session,
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
    const [
      persisted,
      sceneStateRow,
      sceneCollisionRows,
      sceneNodeRows,
      sceneAssetRows,
      sceneAssetTagRows,
      sceneAssetVariantRows,
      actorRows,
      runtimeStateRow,
      npcRows,
      npcDialogueKeyRows,
      npcDialogueEntryRows,
      triggerRows,
      requiredFlagRows,
      setFlagRows,
      questRows,
      questStepRows,
      flagRows,
      inventorySlotRows,
      equipmentRow,
    ] = await prismaBase.$transaction([
      prismaBase.gameSession.findUnique({
        where: { id: sessionId },
      }),
      prismaBase.gameSessionSceneState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneCollision.findMany({
        where: { sessionId },
        orderBy: { ordinal: "asc" },
      }),
      prismaBase.gameSessionSceneNode.findMany({
        where: { sessionId },
        orderBy: { ordinal: "asc" },
      }),
      prismaBase.gameSessionSceneAsset.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      }),
      prismaBase.gameSessionSceneAssetTag.findMany({
        where: { sessionId },
        orderBy: [{ assetId: "asc" }, { ordinal: "asc" }],
      }),
      prismaBase.gameSessionSceneAssetVariant.findMany({
        where: { sessionId },
        orderBy: [{ assetId: "asc" }, { ordinal: "asc" }],
      }),
      prismaBase.gameSessionActor.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      }),
      prismaBase.gameSessionRuntimeState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpc.findMany({
        where: { sessionId },
        orderBy: { ordinal: "asc" },
      }),
      prismaBase.gameSessionNpcDialogueKey.findMany({
        where: { sessionId },
        orderBy: [{ npcId: "asc" }, { ordinal: "asc" }],
      }),
      prismaBase.gameSessionNpcDialogueEntry.findMany({
        where: { sessionId },
        orderBy: [{ npcId: "asc" }, { ordinal: "asc" }],
      }),
      prismaBase.gameSessionTrigger.findMany({
        where: { sessionId },
        orderBy: { id: "asc" },
      }),
      prismaBase.gameSessionTriggerRequiredFlag.findMany({
        where: { sessionId },
        orderBy: [{ triggerId: "asc" }, { key: "asc" }],
      }),
      prismaBase.gameSessionTriggerSetFlag.findMany({
        where: { sessionId },
        orderBy: [{ triggerId: "asc" }, { key: "asc" }],
      }),
      prismaBase.gameSessionQuest.findMany({
        where: { sessionId },
        orderBy: { ordinal: "asc" },
      }),
      prismaBase.gameSessionQuestStep.findMany({
        where: { sessionId },
        orderBy: [{ questId: "asc" }, { ordinal: "asc" }],
      }),
      prismaBase.gameSessionFlag.findMany({
        where: { sessionId },
        orderBy: { key: "asc" },
      }),
      prismaBase.gameSessionInventorySlot.findMany({
        where: { sessionId },
        orderBy: { slotIndex: "asc" },
      }),
      prismaBase.gameSessionEquipment.findUnique({
        where: { sessionId },
      }),
    ]);

    if (!persisted) {
      return { ok: false, error: "SESSION_NOT_FOUND" };
    }

    if (persisted.expiresAt.getTime() <= nowMs()) {
      await prismaBase.gameSession.deleteMany({ where: { id: sessionId } });
      return { ok: false, error: "SESSION_EXPIRED" };
    }

    const restored = toGameSessionFromRow(
      persisted,
      sceneStateRow,
      sceneCollisionRows,
      sceneNodeRows,
      sceneAssetRows,
      sceneAssetTagRows,
      sceneAssetVariantRows,
      actorRows,
      runtimeStateRow,
      npcRows,
      npcDialogueKeyRows,
      npcDialogueEntryRows,
      triggerRows,
      requiredFlagRows,
      setFlagRows,
      questRows,
      questStepRows,
      flagRows,
      inventorySlotRows,
      equipmentRow,
    );
    if (restored.repaired) {
      logger.warn("session.state.repaired", {
        sessionId,
        sceneId: persisted.sceneId,
      });
      const persistedTriggers = toPersistedTriggerRows(
        sessionId,
        restored.session.triggerDefinitions,
      );
      const persistedQuests = toPersistedQuestRows(sessionId, restored.session.scene.quests);
      const persistedFlags = toPersistedSessionFlagRows(sessionId, restored.session.scene.flags);
      const persistedSceneState = toPersistedSceneStateRow(sessionId, restored.session.scene);
      const persistedSceneCollisions = toPersistedSceneCollisionRows(
        sessionId,
        restored.session.scene,
      );
      const persistedSceneNodes = toPersistedSceneNodeRows(sessionId, restored.session.scene);
      const persistedSceneAssets = toPersistedSceneAssetRows(sessionId, restored.session.scene);
      const persistedRuntimeState = toPersistedRuntimeStateRow(sessionId, restored.session.scene);
      const persistedNpcs = toPersistedNpcRows(sessionId, restored.session.scene.npcs);
      const persistedInventorySlots = toPersistedInventorySlotRows(
        sessionId,
        restored.session.scene.inventory,
      );
      const persistedEquipment = toPersistedEquipmentRow(
        sessionId,
        restored.session.scene.inventory,
      );

      await prismaBase.$transaction([
        prismaBase.gameSession.update({
          where: { id: sessionId },
          data: {
            projectId: restored.session.projectId ?? null,
            releaseVersion: restored.session.releaseVersion ?? null,
            updatedAt: new Date(),
          },
        }),
        prismaBase.gameSessionActor.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneState.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneCollision.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneNode.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneAssetVariant.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneAssetTag.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionSceneAsset.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionActor.createMany({
          data: toPersistedActorRows(restored.session),
        }),
        prismaBase.gameSessionSceneState.create({
          data: persistedSceneState,
        }),
        prismaBase.gameSessionSceneCollision.createMany({
          data: persistedSceneCollisions,
        }),
        prismaBase.gameSessionSceneNode.createMany({
          data: persistedSceneNodes,
        }),
        prismaBase.gameSessionSceneAsset.createMany({
          data: persistedSceneAssets.assetRows,
        }),
        prismaBase.gameSessionSceneAssetTag.createMany({
          data: persistedSceneAssets.tagRows,
        }),
        prismaBase.gameSessionSceneAssetVariant.createMany({
          data: persistedSceneAssets.variantRows,
        }),
        prismaBase.gameSessionRuntimeState.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionNpcDialogueEntry.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionNpcDialogueKey.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionNpc.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionTrigger.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionTriggerRequiredFlag.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionTriggerSetFlag.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionQuest.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionQuestStep.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionFlag.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionInventorySlot.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionEquipment.deleteMany({
          where: { sessionId },
        }),
        prismaBase.gameSessionRuntimeState.create({
          data: persistedRuntimeState,
        }),
        prismaBase.gameSessionNpc.createMany({
          data: persistedNpcs.npcRows,
        }),
        prismaBase.gameSessionNpcDialogueKey.createMany({
          data: persistedNpcs.dialogueKeyRows,
        }),
        prismaBase.gameSessionNpcDialogueEntry.createMany({
          data: persistedNpcs.dialogueEntryRows,
        }),
        prismaBase.gameSessionTrigger.createMany({
          data: persistedTriggers.triggerRows,
        }),
        prismaBase.gameSessionTriggerRequiredFlag.createMany({
          data: persistedTriggers.requiredFlagRows,
        }),
        prismaBase.gameSessionTriggerSetFlag.createMany({
          data: persistedTriggers.setFlagRows,
        }),
        prismaBase.gameSessionQuest.createMany({
          data: persistedQuests.questRows,
        }),
        prismaBase.gameSessionQuestStep.createMany({
          data: persistedQuests.questStepRows,
        }),
        prismaBase.gameSessionFlag.createMany({
          data: persistedFlags,
        }),
        prismaBase.gameSessionInventorySlot.createMany({
          data: persistedInventorySlots,
        }),
        prismaBase.gameSessionEquipment.create({
          data: persistedEquipment,
        }),
      ]);
    }

    return {
      ok: true,
      payload: {
        ...restored.session,
        participants: [
          toOwnerParticipant(restored.session),
          ...(await this.listParticipants(sessionId)),
        ],
      },
    };
  }

  public async countActiveSessions(now: number = nowMs()): Promise<number> {
    const threshold = new Date(now);
    return prismaBase.gameSession.count({
      where: { expiresAt: { gt: threshold } },
    });
  }

  public async saveSession(session: GameSession): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + appConfig.game.sessionTtlMs);
    const expectedPreviousVersion = Math.max(1, session.stateVersion - 1);
    const persistedTriggers = toPersistedTriggerRows(session.id, session.triggerDefinitions);
    const persistedQuests = toPersistedQuestRows(session.id, session.scene.quests);
    const persistedFlags = toPersistedSessionFlagRows(session.id, session.scene.flags);
    const persistedSceneState = toPersistedSceneStateRow(session.id, session.scene);
    const persistedSceneCollisions = toPersistedSceneCollisionRows(session.id, session.scene);
    const persistedSceneNodes = toPersistedSceneNodeRows(session.id, session.scene);
    const persistedSceneAssets = toPersistedSceneAssetRows(session.id, session.scene);
    const persistedRuntimeState = toPersistedRuntimeStateRow(session.id, session.scene);
    const persistedNpcs = toPersistedNpcRows(session.id, session.scene.npcs);
    const persistedInventorySlots = toPersistedInventorySlotRows(
      session.id,
      session.scene.inventory,
    );
    const persistedEquipment = toPersistedEquipmentRow(session.id, session.scene.inventory);

    const updated = await prismaBase.$transaction(async (tx) => {
      const result = await tx.gameSession.updateMany({
        where: {
          id: session.id,
          stateVersion: expectedPreviousVersion,
        },
        data: {
          seed: session.seed,
          ownerSessionId: session.ownerSessionId,
          locale: session.locale,
          sceneId: session.scene.sceneId,
          projectId: session.projectId ?? null,
          releaseVersion: session.releaseVersion ?? null,
          stateVersion: session.stateVersion,
          updatedAt: now,
          expiresAt,
        },
      });

      if (result.count > 0) {
        await tx.gameSessionActor.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneState.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneCollision.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneNode.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneAssetVariant.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneAssetTag.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionSceneAsset.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionActor.createMany({
          data: toPersistedActorRows(session),
        });
        await tx.gameSessionSceneState.create({
          data: persistedSceneState,
        });
        await tx.gameSessionSceneCollision.createMany({
          data: persistedSceneCollisions,
        });
        await tx.gameSessionSceneNode.createMany({
          data: persistedSceneNodes,
        });
        await tx.gameSessionSceneAsset.createMany({
          data: persistedSceneAssets.assetRows,
        });
        await tx.gameSessionSceneAssetTag.createMany({
          data: persistedSceneAssets.tagRows,
        });
        await tx.gameSessionSceneAssetVariant.createMany({
          data: persistedSceneAssets.variantRows,
        });
        await tx.gameSessionRuntimeState.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionNpcDialogueEntry.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionNpcDialogueKey.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionNpc.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionTrigger.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionTriggerRequiredFlag.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionTriggerSetFlag.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionQuest.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionQuestStep.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionFlag.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionInventorySlot.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionEquipment.deleteMany({
          where: { sessionId: session.id },
        });
        await tx.gameSessionRuntimeState.create({
          data: persistedRuntimeState,
        });
        await tx.gameSessionNpc.createMany({
          data: persistedNpcs.npcRows,
        });
        await tx.gameSessionNpcDialogueKey.createMany({
          data: persistedNpcs.dialogueKeyRows,
        });
        await tx.gameSessionNpcDialogueEntry.createMany({
          data: persistedNpcs.dialogueEntryRows,
        });
        await tx.gameSessionTrigger.createMany({
          data: persistedTriggers.triggerRows,
        });
        await tx.gameSessionTriggerRequiredFlag.createMany({
          data: persistedTriggers.requiredFlagRows,
        });
        await tx.gameSessionTriggerSetFlag.createMany({
          data: persistedTriggers.setFlagRows,
        });
        await tx.gameSessionQuest.createMany({
          data: persistedQuests.questRows,
        });
        await tx.gameSessionQuestStep.createMany({
          data: persistedQuests.questStepRows,
        });
        await tx.gameSessionFlag.createMany({
          data: persistedFlags,
        });
        await tx.gameSessionInventorySlot.createMany({
          data: persistedInventorySlots,
        });
        await tx.gameSessionEquipment.create({
          data: persistedEquipment,
        });
      }

      return result;
    });

    if (updated.count > 0) {
      return;
    }

    // Idempotent save path when the same stateVersion was already persisted.
    const existing = await prismaBase.gameSession.findUnique({
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
    await prismaBase.gameSession.deleteMany({ where: { id: sessionId } });
  }

  public async listParticipants(sessionId: string): Promise<readonly GameSessionParticipant[]> {
    const rows = await prismaBase.gameSessionParticipant.findMany({
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
    const row = await prismaBase.gameSessionParticipant.upsert({
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
    const removed = await prismaBase.gameSession.deleteMany({
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

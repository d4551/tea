import { PrismaLibSql } from "@prisma/adapter-libsql";
import { type Prisma, PrismaClient } from "@prisma/client";
import type { LocaleCode } from "../../config/environment.ts";
import { appConfig } from "../../config/environment.ts";
import { getLevel } from "../../domain/game/progression.ts";
import { createLogger } from "../../lib/logger.ts";
import type {
  AnimationClip,
  AnimationTimeline,
  AutomationRun,
  BuilderAsset,
  DialogueGraph,
  GameFlagDefinition,
  GenerationArtifact,
  GenerationJob,
  QuestDefinition,
  SceneDefinition,
  TriggerDefinition,
} from "../contracts/game.ts";
import { isInputJsonValue, safeJsonParse } from "../utils/safe-json.ts";

declare global {
  // biome-lint: globalThis.prisma intentionally re-assigned in dev for HMR
  var _devPrisma: ExtendedPrismaClient | undefined;
}

/**
 * Canonical builder-project row shape used by domain services.
 */
export const builderProjectRowSelect = {
  id: true,
  state: true,
  checksum: true,
  version: true,
  createdBy: true,
  updatedBy: true,
  source: true,
  latestReleaseVersion: true,
  publishedReleaseVersion: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectSelect;

/**
 * Selected builder-project row contract shared across persistence helpers.
 */
export type BuilderProjectRow = Prisma.BuilderProjectGetPayload<{
  select: typeof builderProjectRowSelect;
}>;

/**
 * Canonical builder release snapshot row shape.
 */
export const builderProjectReleaseStateSelect = {
  state: true,
} satisfies Prisma.BuilderProjectReleaseSelect;

/**
 * Selected builder release snapshot row contract shared across persistence helpers.
 */
export type BuilderProjectReleaseStateRow = Prisma.BuilderProjectReleaseGetPayload<{
  select: typeof builderProjectReleaseStateSelect;
}>;

/**
 * Canonical builder scene row shape used by domain services.
 */
export const builderProjectSceneRowSelect = {
  projectId: true,
  id: true,
  sceneMode: true,
  displayTitle: true,
  titleKey: true,
  background: true,
  geometryWidth: true,
  geometryHeight: true,
  spawnX: true,
  spawnY: true,
  tilemapData: true,
  npcs: {
    select: {
      characterKey: true,
      ordinal: true,
      x: true,
      y: true,
      displayName: true,
      labelKey: true,
      interactRadius: true,
      wanderRadius: true,
      wanderSpeed: true,
      idlePauseMinMs: true,
      idlePauseMaxMs: true,
      greetOnApproach: true,
      greetLineKey: true,
      dialogueKeys: { select: { ordinal: true, key: true } },
    },
  },
  nodes: {
    select: {
      id: true,
      ordinal: true,
      nodeType: true,
      assetId: true,
      animationClipId: true,
      positionX: true,
      positionY: true,
      positionZ: true,
      sizeWidth: true,
      sizeHeight: true,
      layer: true,
      rotationX: true,
      rotationY: true,
      rotationZ: true,
      scaleX: true,
      scaleY: true,
      scaleZ: true,
      particleEmitterData: true,
    },
  },
  collisions: {
    select: {
      ordinal: true,
      x: true,
      y: true,
      width: true,
      height: true,
    },
  },
} satisfies Prisma.BuilderProjectSceneSelect;

/**
 * Selected builder scene row contract shared across persistence helpers.
 */
export type BuilderProjectSceneRow = Prisma.BuilderProjectSceneGetPayload<{
  select: typeof builderProjectSceneRowSelect;
}>;

/**
 * Canonical builder scene-collision row shape used by domain services.
 */
export const builderProjectSceneCollisionRowSelect = {
  projectId: true,
  sceneId: true,
  ordinal: true,
  x: true,
  y: true,
  width: true,
  height: true,
} satisfies Prisma.BuilderProjectSceneCollisionSelect;

/**
 * Selected builder scene-collision row contract shared across persistence helpers.
 */
export type BuilderProjectSceneCollisionRow = Prisma.BuilderProjectSceneCollisionGetPayload<{
  select: typeof builderProjectSceneCollisionRowSelect;
}>;

/**
 * Canonical builder scene-NPC row shape used by domain services.
 */
export const builderProjectSceneNpcRowSelect = {
  projectId: true,
  sceneId: true,
  characterKey: true,
  ordinal: true,
  x: true,
  y: true,
  displayName: true,
  labelKey: true,
  interactRadius: true,
  wanderRadius: true,
  wanderSpeed: true,
  idlePauseMinMs: true,
  idlePauseMaxMs: true,
  greetOnApproach: true,
  greetLineKey: true,
} satisfies Prisma.BuilderProjectSceneNpcSelect;

/**
 * Selected builder scene-NPC row contract shared across persistence helpers.
 */
export type BuilderProjectSceneNpcRow = Prisma.BuilderProjectSceneNpcGetPayload<{
  select: typeof builderProjectSceneNpcRowSelect;
}>;

/**
 * Canonical builder scene-NPC dialogue-key row shape used by domain services.
 */
export const builderProjectSceneNpcDialogueKeyRowSelect = {
  projectId: true,
  sceneId: true,
  characterKey: true,
  ordinal: true,
  key: true,
} satisfies Prisma.BuilderProjectSceneNpcDialogueKeySelect;

/**
 * Selected builder scene-NPC dialogue-key row contract shared across persistence helpers.
 */
export type BuilderProjectSceneNpcDialogueKeyRow =
  Prisma.BuilderProjectSceneNpcDialogueKeyGetPayload<{
    select: typeof builderProjectSceneNpcDialogueKeyRowSelect;
  }>;

/**
 * Canonical builder scene-node row shape used by domain services.
 */
export const builderProjectSceneNodeRowSelect = {
  projectId: true,
  sceneId: true,
  id: true,
  ordinal: true,
  nodeType: true,
  assetId: true,
  animationClipId: true,
  positionX: true,
  positionY: true,
  positionZ: true,
  sizeWidth: true,
  sizeHeight: true,
  layer: true,
  rotationX: true,
  rotationY: true,
  rotationZ: true,
  scaleX: true,
  scaleY: true,
  scaleZ: true,
} satisfies Prisma.BuilderProjectSceneNodeSelect;

/**
 * Selected builder scene-node row contract shared across persistence helpers.
 */
export type BuilderProjectSceneNodeRow = Prisma.BuilderProjectSceneNodeGetPayload<{
  select: typeof builderProjectSceneNodeRowSelect;
}>;

/**
 * Canonical builder dialogue-entry row shape used by domain services.
 */
export const builderProjectDialogueEntryRowSelect = {
  projectId: true,
  locale: true,
  key: true,
  text: true,
} satisfies Prisma.BuilderProjectDialogueEntrySelect;

/**
 * Selected builder dialogue-entry row contract shared across persistence helpers.
 */
export type BuilderProjectDialogueEntryRow = Prisma.BuilderProjectDialogueEntryGetPayload<{
  select: typeof builderProjectDialogueEntryRowSelect;
}>;

/**
 * Canonical builder-project asset row shape used by domain services.
 */
export const builderProjectAssetRowSelect = {
  projectId: true,
  id: true,
  kind: true,
  label: true,
  sceneMode: true,
  source: true,
  sourceFormat: true,
  sourceMimeType: true,
  approved: true,
  createdAt: true,
  updatedAt: true,
  tags: { select: { ordinal: true, value: true } },
  variants: {
    select: {
      id: true,
      ordinal: true,
      format: true,
      source: true,
      usage: true,
      mimeType: true,
    },
  },
} satisfies Prisma.BuilderProjectAssetSelect;

/**
 * Selected builder-project asset row contract shared across persistence helpers.
 */
export type BuilderProjectAssetRow = Prisma.BuilderProjectAssetGetPayload<{
  select: typeof builderProjectAssetRowSelect;
}>;

/**
 * Canonical builder-project asset-tag row shape used by domain services.
 */
export const builderProjectAssetTagRowSelect = {
  projectId: true,
  assetId: true,
  ordinal: true,
  value: true,
} satisfies Prisma.BuilderProjectAssetTagSelect;

/**
 * Selected builder-project asset-tag row contract shared across persistence helpers.
 */
export type BuilderProjectAssetTagRow = Prisma.BuilderProjectAssetTagGetPayload<{
  select: typeof builderProjectAssetTagRowSelect;
}>;

/**
 * Canonical builder-project asset-variant row shape used by domain services.
 */
export const builderProjectAssetVariantRowSelect = {
  projectId: true,
  assetId: true,
  id: true,
  ordinal: true,
  format: true,
  source: true,
  usage: true,
  mimeType: true,
} satisfies Prisma.BuilderProjectAssetVariantSelect;

/**
 * Selected builder-project asset-variant row contract shared across persistence helpers.
 */
export type BuilderProjectAssetVariantRow = Prisma.BuilderProjectAssetVariantGetPayload<{
  select: typeof builderProjectAssetVariantRowSelect;
}>;

/**
 * Canonical builder animation-clip row shape used by domain services.
 */
export const builderProjectAnimationClipRowSelect = {
  projectId: true,
  id: true,
  assetId: true,
  label: true,
  sceneMode: true,
  stateTag: true,
  playbackFps: true,
  startFrame: true,
  frameCount: true,
  loop: true,
  direction: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectAnimationClipSelect;

/**
 * Selected builder animation-clip row contract shared across persistence helpers.
 */
export type BuilderProjectAnimationClipRow = Prisma.BuilderProjectAnimationClipGetPayload<{
  select: typeof builderProjectAnimationClipRowSelect;
}>;

/**
 * Canonical builder animation-timeline row shape used by domain services.
 */
export const builderProjectAnimationTimelineRowSelect = {
  projectId: true,
  id: true,
  assetId: true,
  label: true,
  sceneMode: true,
  stateTag: true,
  durationMs: true,
  loop: true,
  createdAt: true,
  updatedAt: true,
  tracks: {
    select: {
      id: true,
      property: true,
      keyframes: true,
    },
  },
} satisfies Prisma.BuilderProjectAnimationTimelineSelect;

/**
 * Selected builder animation-timeline row contract shared across persistence helpers.
 */
export type BuilderProjectAnimationTimelineRow = Prisma.BuilderProjectAnimationTimelineGetPayload<{
  select: typeof builderProjectAnimationTimelineRowSelect;
}>;

/**
 * Canonical builder animation-track row shape used by domain services.
 */
export const builderProjectAnimationTrackRowSelect = {
  projectId: true,
  timelineId: true,
  id: true,
  property: true,
  keyframes: true,
} satisfies Prisma.BuilderProjectAnimationTrackSelect;

/**
 * Selected builder animation-track row contract shared across persistence helpers.
 */
export type BuilderProjectAnimationTrackRow = Prisma.BuilderProjectAnimationTrackGetPayload<{
  select: typeof builderProjectAnimationTrackRowSelect;
}>;

/**
 * Canonical builder sprite-atlas row shape used by domain services.
 */
export const builderProjectSpriteAtlasRowSelect = {
  projectId: true,
  id: true,
  imagePath: true,
  atlasWidth: true,
  atlasHeight: true,
  frames: true,
  createdAt: true,
} satisfies Prisma.BuilderProjectSpriteAtlasSelect;

/**
 * Selected builder sprite-atlas row contract shared across persistence helpers.
 */
export type BuilderProjectSpriteAtlasRow = Prisma.BuilderProjectSpriteAtlasGetPayload<{
  select: typeof builderProjectSpriteAtlasRowSelect;
}>;

/**
 * Canonical builder dialogue-graph row shape used by domain services.
 */
export const builderProjectDialogueGraphRowSelect = {
  projectId: true,
  id: true,
  title: true,
  npcId: true,
  rootNodeId: true,
  createdAt: true,
  updatedAt: true,
  nodes: {
    select: {
      id: true,
      ordinal: true,
      line: true,
      edges: {
        select: {
          nodeId: true,
          ordinal: true,
          toNodeId: true,
          requiredFlag: true,
          advanceQuestStepId: true,
        },
      },
    },
  },
} satisfies Prisma.BuilderProjectDialogueGraphSelect;

/**
 * Selected builder dialogue-graph row contract shared across persistence helpers.
 */
export type BuilderProjectDialogueGraphRow = Prisma.BuilderProjectDialogueGraphGetPayload<{
  select: typeof builderProjectDialogueGraphRowSelect;
}>;

/**
 * Canonical builder dialogue-graph node row shape used by domain services.
 */
export const builderProjectDialogueGraphNodeRowSelect = {
  projectId: true,
  graphId: true,
  id: true,
  ordinal: true,
  line: true,
} satisfies NonNullable<Prisma.BuilderProjectDialogueGraphNodeFindManyArgs["select"]>;

/**
 * Selected builder dialogue-graph node row contract shared across persistence helpers.
 */
export interface BuilderProjectDialogueGraphNodeRow {
  readonly projectId: string;
  readonly graphId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly line: string;
}

/**
 * Canonical builder dialogue-graph edge row shape used by domain services.
 */
export const builderProjectDialogueGraphEdgeRowSelect = {
  projectId: true,
  graphId: true,
  nodeId: true,
  ordinal: true,
  toNodeId: true,
  requiredFlag: true,
  advanceQuestStepId: true,
} satisfies NonNullable<Prisma.BuilderProjectDialogueGraphEdgeFindManyArgs["select"]>;

/**
 * Selected builder dialogue-graph edge row contract shared across persistence helpers.
 */
export interface BuilderProjectDialogueGraphEdgeRow {
  readonly projectId: string;
  readonly graphId: string;
  readonly nodeId: string;
  readonly ordinal: number;
  readonly toNodeId: string;
  readonly requiredFlag: string | null;
  readonly advanceQuestStepId: string | null;
}

/**
 * Canonical builder quest row shape used by domain services.
 */
export const builderProjectQuestRowSelect = {
  projectId: true,
  id: true,
  title: true,
  description: true,
  steps: {
    select: {
      id: true,
      ordinal: true,
      title: true,
      description: true,
      triggerId: true,
    },
  },
} satisfies Prisma.BuilderProjectQuestSelect;

/**
 * Selected builder quest row contract shared across persistence helpers.
 */
export type BuilderProjectQuestRow = Prisma.BuilderProjectQuestGetPayload<{
  select: typeof builderProjectQuestRowSelect;
}>;

/**
 * Canonical builder quest-step row shape used by domain services.
 */
export const builderProjectQuestStepRowSelect = {
  projectId: true,
  questId: true,
  id: true,
  ordinal: true,
  title: true,
  description: true,
  triggerId: true,
} satisfies NonNullable<Prisma.BuilderProjectQuestStepFindManyArgs["select"]>;

/**
 * Selected builder quest-step row contract shared across persistence helpers.
 */
export interface BuilderProjectQuestStepRow {
  readonly projectId: string;
  readonly questId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly triggerId: string;
}

/**
 * Canonical builder trigger row shape used by domain services.
 */
export const builderProjectTriggerRowSelect = {
  projectId: true,
  id: true,
  label: true,
  event: true,
  sceneId: true,
  npcId: true,
  nodeId: true,
  questId: true,
  questStepId: true,
  requiredFlags: {
    select: {
      key: true,
      valueType: true,
      stringValue: true,
      numberValue: true,
      boolValue: true,
    },
  },
  setFlags: {
    select: {
      key: true,
      valueType: true,
      stringValue: true,
      numberValue: true,
      boolValue: true,
    },
  },
} satisfies Prisma.BuilderProjectTriggerSelect;

/**
 * Selected builder trigger row contract shared across persistence helpers.
 */
export type BuilderProjectTriggerRow = Prisma.BuilderProjectTriggerGetPayload<{
  select: typeof builderProjectTriggerRowSelect;
}>;

/**
 * Canonical builder trigger-required-flag row shape used by domain services.
 */
export const builderProjectTriggerRequiredFlagRowSelect = {
  projectId: true,
  triggerId: true,
  key: true,
  valueType: true,
  stringValue: true,
  numberValue: true,
  boolValue: true,
} satisfies NonNullable<Prisma.BuilderProjectTriggerRequiredFlagFindManyArgs["select"]>;

/**
 * Selected builder trigger-required-flag row contract shared across persistence helpers.
 */
export interface BuilderProjectTriggerRequiredFlagRow {
  readonly projectId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}

/**
 * Canonical builder trigger-set-flag row shape used by domain services.
 */
export const builderProjectTriggerSetFlagRowSelect = {
  projectId: true,
  triggerId: true,
  key: true,
  valueType: true,
  stringValue: true,
  numberValue: true,
  boolValue: true,
} satisfies NonNullable<Prisma.BuilderProjectTriggerSetFlagFindManyArgs["select"]>;

/**
 * Selected builder trigger-set-flag row contract shared across persistence helpers.
 */
export interface BuilderProjectTriggerSetFlagRow {
  readonly projectId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}

/**
 * Canonical builder flag row shape used by domain services.
 */
export const builderProjectFlagRowSelect = {
  projectId: true,
  key: true,
  label: true,
  valueType: true,
  stringValue: true,
  numberValue: true,
  boolValue: true,
} satisfies Prisma.BuilderProjectFlagSelect;

/**
 * Selected builder flag row contract shared across persistence helpers.
 */
export type BuilderProjectFlagRow = Prisma.BuilderProjectFlagGetPayload<{
  select: typeof builderProjectFlagRowSelect;
}>;

/**
 * Canonical builder generation-job row shape used by domain services.
 */
export const builderProjectGenerationJobRowSelect = {
  projectId: true,
  id: true,
  kind: true,
  status: true,
  prompt: true,
  targetId: true,
  statusMessage: true,
  createdAt: true,
  updatedAt: true,
  artifacts: { select: { ordinal: true, artifactId: true } },
} satisfies Prisma.BuilderProjectGenerationJobSelect;

/**
 * Selected builder generation-job row contract shared across persistence helpers.
 */
export type BuilderProjectGenerationJobRow = Prisma.BuilderProjectGenerationJobGetPayload<{
  select: typeof builderProjectGenerationJobRowSelect;
}>;

/**
 * Canonical builder generation-job artifact row shape used by domain services.
 */
export const builderProjectGenerationJobArtifactRowSelect = {
  projectId: true,
  jobId: true,
  ordinal: true,
  artifactId: true,
} satisfies Prisma.BuilderProjectGenerationJobArtifactSelect;

/**
 * Selected builder generation-job artifact row contract shared across persistence helpers.
 */
export type BuilderProjectGenerationJobArtifactRow =
  Prisma.BuilderProjectGenerationJobArtifactGetPayload<{
    select: typeof builderProjectGenerationJobArtifactRowSelect;
  }>;

/**
 * Canonical builder artifact row shape used by domain services.
 */
export const builderProjectArtifactRowSelect = {
  projectId: true,
  id: true,
  jobId: true,
  kind: true,
  label: true,
  previewSource: true,
  summary: true,
  mimeType: true,
  generationSource: true,
  generationReason: true,
  approved: true,
  createdAt: true,
} satisfies Prisma.BuilderProjectArtifactSelect;

/**
 * Selected builder artifact row contract shared across persistence helpers.
 */
export type BuilderProjectArtifactRow = Prisma.BuilderProjectArtifactGetPayload<{
  select: typeof builderProjectArtifactRowSelect;
}>;

/**
 * Canonical builder automation-run row shape used by domain services.
 */
export const builderProjectAutomationRunRowSelect = {
  projectId: true,
  id: true,
  status: true,
  goal: true,
  statusMessage: true,
  createdAt: true,
  updatedAt: true,
  steps: {
    select: {
      id: true,
      ordinal: true,
      action: true,
      summary: true,
      status: true,
      specJson: true,
      evidenceSource: true,
    },
  },
  artifacts: { select: { ordinal: true, artifactId: true } },
} satisfies Prisma.BuilderProjectAutomationRunSelect;

/**
 * Selected builder automation-run row contract shared across persistence helpers.
 */
export type BuilderProjectAutomationRunRow = Prisma.BuilderProjectAutomationRunGetPayload<{
  select: typeof builderProjectAutomationRunRowSelect;
}>;

/**
 * Canonical builder automation-run step row shape used by domain services.
 */
export const builderProjectAutomationRunStepRowSelect = {
  projectId: true,
  runId: true,
  id: true,
  ordinal: true,
  action: true,
  summary: true,
  status: true,
  specJson: true,
  evidenceSource: true,
} satisfies Prisma.BuilderProjectAutomationRunStepSelect;

/**
 * Selected builder automation-run step row contract shared across persistence helpers.
 */
export type BuilderProjectAutomationRunStepRow = Prisma.BuilderProjectAutomationRunStepGetPayload<{
  select: typeof builderProjectAutomationRunStepRowSelect;
}>;

/**
 * Canonical builder automation-run artifact row shape used by domain services.
 */
export const builderProjectAutomationRunArtifactRowSelect = {
  projectId: true,
  runId: true,
  ordinal: true,
  artifactId: true,
} satisfies Prisma.BuilderProjectAutomationRunArtifactSelect;

/**
 * Selected builder automation-run artifact row contract shared across persistence helpers.
 */
export type BuilderProjectAutomationRunArtifactRow =
  Prisma.BuilderProjectAutomationRunArtifactGetPayload<{
    select: typeof builderProjectAutomationRunArtifactRowSelect;
  }>;

// ── Base client ───────────────────────────────────────────────────────────────

const prismaLogger = createLogger("database.prisma");

const prismaLogDefinitions: Prisma.LogDefinition[] = [{ emit: "event", level: "query" }];

type QueryEvent = { query: string; params: string; timestamp: Date };

const attachPrismaStructuredLogging = (client: PrismaClient): PrismaClient => {
  // Prisma Client with libsql adapter may have $on types that exclude "query"
  // https://github.com/prisma/prisma/issues/23108
  (client as { $on(event: "query", callback: (e: QueryEvent) => void): void }).$on(
    "query",
    (event) => {
      prismaLogger.info("prisma.client", {
        level: "query",
        target: "prisma-query",
        message: `${event.query} (${event.params})`,
        timestamp: event.timestamp.toISOString(),
      });
    },
  );

  return client;
};

const createBaseClient = (): PrismaClient => {
  const adapter = new PrismaLibSql({ url: appConfig.database.url });
  return attachPrismaStructuredLogging(new PrismaClient({ adapter, log: prismaLogDefinitions }));
};

const toSceneCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneCreateManyInput[] =>
  scenes.map((scene) => ({
    projectId,
    id: scene.id,
    sceneMode: scene.sceneMode,
    displayTitle: scene.displayTitle,
    titleKey: scene.titleKey,
    background: scene.background,
    geometryWidth: scene.geometry.width,
    geometryHeight: scene.geometry.height,
    spawnX: scene.spawn.x,
    spawnY: scene.spawn.y,
    tilemapData: (scene.tilemap ?? undefined) as Prisma.InputJsonValue | undefined,
  }));

const toSceneCollisionCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneCollisionCreateManyInput[] =>
  scenes.flatMap((scene) =>
    scene.collisions.map((collision, ordinal) => ({
      projectId,
      sceneId: scene.id,
      ordinal,
      x: collision.x,
      y: collision.y,
      width: collision.width,
      height: collision.height,
    })),
  );

const toSceneNpcCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneNpcCreateManyInput[] =>
  scenes.flatMap((scene) =>
    scene.npcs.map((npc, ordinal) => ({
      projectId,
      sceneId: scene.id,
      characterKey: npc.characterKey,
      ordinal,
      x: npc.x,
      y: npc.y,
      displayName: npc.displayName,
      labelKey: npc.labelKey,
      interactRadius: npc.interactRadius,
      wanderRadius: npc.ai.wanderRadius,
      wanderSpeed: npc.ai.wanderSpeed,
      idlePauseMinMs: npc.ai.idlePauseMs[0],
      idlePauseMaxMs: npc.ai.idlePauseMs[1],
      greetOnApproach: npc.ai.greetOnApproach,
      greetLineKey: npc.ai.greetLineKey,
    })),
  );

const toSceneNpcDialogueKeyCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneNpcDialogueKeyCreateManyInput[] =>
  scenes.flatMap((scene) =>
    scene.npcs.flatMap((npc) =>
      npc.dialogueKeys.map((key, ordinal) => ({
        projectId,
        sceneId: scene.id,
        characterKey: npc.characterKey,
        ordinal,
        key,
      })),
    ),
  );

const toSceneNodeCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneNodeCreateManyInput[] =>
  scenes.flatMap((scene) =>
    (scene.nodes ?? []).map((node, ordinal) => ({
      projectId,
      sceneId: scene.id,
      id: node.id,
      ordinal,
      nodeType: node.nodeType,
      assetId: node.assetId,
      animationClipId: node.animationClipId,
      positionX: node.position.x,
      positionY: node.position.y,
      positionZ: "z" in node.position ? node.position.z : null,
      sizeWidth: "size" in node ? node.size.width : null,
      sizeHeight: "size" in node ? node.size.height : null,
      layer: "layer" in node ? node.layer : null,
      rotationX: "rotation" in node ? node.rotation.x : null,
      rotationY: "rotation" in node ? node.rotation.y : null,
      rotationZ: "rotation" in node ? node.rotation.z : null,
      scaleX: "scale" in node ? node.scale.x : null,
      scaleY: "scale" in node ? node.scale.y : null,
      scaleZ: "scale" in node ? node.scale.z : null,
      particleEmitterData: (node.particleEmitter ?? undefined) as Prisma.InputJsonValue | undefined,
    })),
  );

const toDialogueEntryCreateManyInput = (
  projectId: string,
  dialogues: Readonly<Record<LocaleCode, Record<string, string>>>,
): Prisma.BuilderProjectDialogueEntryCreateManyInput[] =>
  Object.entries(dialogues).flatMap(([locale, catalog]) =>
    Object.entries(catalog).map(([key, text]) => ({
      projectId,
      locale,
      key,
      text,
    })),
  );

const toAssetCreateManyInput = (
  projectId: string,
  assets: readonly BuilderAsset[],
): Prisma.BuilderProjectAssetCreateManyInput[] =>
  assets.map((asset) => ({
    projectId,
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
  }));

const toAssetTagCreateManyInput = (
  projectId: string,
  assets: readonly BuilderAsset[],
): Prisma.BuilderProjectAssetTagCreateManyInput[] =>
  assets.flatMap((asset) =>
    asset.tags.map((tag, ordinal) => ({
      projectId,
      assetId: asset.id,
      ordinal,
      value: tag,
    })),
  );

const toAssetVariantCreateManyInput = (
  projectId: string,
  assets: readonly BuilderAsset[],
): Prisma.BuilderProjectAssetVariantCreateManyInput[] =>
  assets.flatMap((asset) =>
    asset.variants.map((variant, ordinal) => ({
      projectId,
      assetId: asset.id,
      id: variant.id,
      ordinal,
      format: variant.format,
      source: variant.source,
      usage: variant.usage,
      mimeType: variant.mimeType ?? null,
    })),
  );

const toAnimationClipCreateManyInput = (
  projectId: string,
  animationClips: readonly AnimationClip[],
): Prisma.BuilderProjectAnimationClipCreateManyInput[] =>
  animationClips.map((clip) => ({
    projectId,
    id: clip.id,
    assetId: clip.assetId,
    label: clip.label,
    sceneMode: clip.sceneMode,
    stateTag: clip.stateTag,
    playbackFps: clip.playbackFps,
    startFrame: clip.startFrame,
    frameCount: clip.frameCount,
    loop: clip.loop,
    direction: clip.direction,
    createdAt: new Date(clip.createdAtMs),
    updatedAt: new Date(clip.updatedAtMs),
  }));

const _toAnimationTimelineCreateManyInput = (
  projectId: string,
  timelines: readonly AnimationTimeline[],
): Prisma.BuilderProjectAnimationTimelineCreateManyInput[] =>
  timelines.map((timeline) => ({
    projectId,
    id: timeline.id,
    assetId: timeline.assetId,
    label: timeline.label,
    sceneMode: timeline.sceneMode,
    stateTag: timeline.stateTag,
    durationMs: timeline.durationMs,
    loop: timeline.loop,
    createdAt: new Date(timeline.createdAtMs),
    updatedAt: new Date(timeline.updatedAtMs),
  }));

const _toAnimationTrackCreateManyInput = (
  projectId: string,
  timelines: readonly AnimationTimeline[],
): Prisma.BuilderProjectAnimationTrackCreateManyInput[] =>
  timelines.flatMap((timeline) =>
    timeline.tracks.map((track) => ({
      projectId,
      timelineId: timeline.id,
      id: track.id,
      property: track.property,
      keyframes: JSON.stringify(track.keyframes),
    })),
  );

const toDialogueGraphCreateManyInput = (
  projectId: string,
  dialogueGraphs: readonly DialogueGraph[],
): Prisma.BuilderProjectDialogueGraphCreateManyInput[] =>
  dialogueGraphs.map((graph) => ({
    projectId,
    id: graph.id,
    title: graph.title,
    npcId: graph.npcId,
    rootNodeId: graph.rootNodeId,
    createdAt: new Date(graph.createdAtMs),
    updatedAt: new Date(graph.updatedAtMs),
  }));

const toDialogueGraphNodeCreateManyInput = (
  projectId: string,
  dialogueGraphs: readonly DialogueGraph[],
): Array<{
  readonly projectId: string;
  readonly graphId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly line: string;
}> =>
  dialogueGraphs.flatMap((graph) =>
    graph.nodes.map((node, ordinal) => ({
      projectId,
      graphId: graph.id,
      id: node.id,
      ordinal,
      line: node.line,
    })),
  );

const toDialogueGraphEdgeCreateManyInput = (
  projectId: string,
  dialogueGraphs: readonly DialogueGraph[],
): Array<{
  readonly projectId: string;
  readonly graphId: string;
  readonly nodeId: string;
  readonly ordinal: number;
  readonly toNodeId: string;
  readonly requiredFlag?: string;
  readonly advanceQuestStepId?: string;
}> =>
  dialogueGraphs.flatMap((graph) =>
    graph.nodes.flatMap((node) =>
      node.edges.map((edge, ordinal) => ({
        projectId,
        graphId: graph.id,
        nodeId: node.id,
        ordinal,
        toNodeId: edge.to,
        requiredFlag: edge.requiredFlag,
        advanceQuestStepId: edge.advanceQuestStepId,
      })),
    ),
  );

const toQuestCreateManyInput = (
  projectId: string,
  quests: readonly QuestDefinition[],
): Prisma.BuilderProjectQuestCreateManyInput[] =>
  quests.map((quest) => ({
    projectId,
    id: quest.id,
    title: quest.title,
    description: quest.description,
  }));

const toQuestStepCreateManyInput = (
  projectId: string,
  quests: readonly QuestDefinition[],
): Array<{
  readonly projectId: string;
  readonly questId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly description: string;
  readonly triggerId: string;
}> =>
  quests.flatMap((quest) =>
    quest.steps.map((step, ordinal) => ({
      projectId,
      questId: quest.id,
      id: step.id,
      ordinal,
      title: step.title,
      description: step.description,
      triggerId: step.triggerId,
    })),
  );

const toFlagValueColumns = (
  value: string | number | boolean,
): {
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
} => {
  if (typeof value === "string") {
    return {
      valueType: "string",
      stringValue: value,
      numberValue: null,
      boolValue: null,
    };
  }

  if (typeof value === "number") {
    return {
      valueType: "number",
      stringValue: null,
      numberValue: value,
      boolValue: null,
    };
  }

  return {
    valueType: "boolean",
    stringValue: null,
    numberValue: null,
    boolValue: value,
  };
};

const toTriggerCreateManyInput = (
  projectId: string,
  triggers: readonly TriggerDefinition[],
): Prisma.BuilderProjectTriggerCreateManyInput[] =>
  triggers.map((trigger) => ({
    projectId,
    id: trigger.id,
    label: trigger.label,
    event: trigger.event,
    sceneId: trigger.sceneId,
    npcId: trigger.npcId,
    nodeId: trigger.nodeId,
    questId: trigger.questId,
    questStepId: trigger.questStepId,
  }));

const toTriggerRequiredFlagCreateManyInput = (
  projectId: string,
  triggers: readonly TriggerDefinition[],
): Array<{
  readonly projectId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}> =>
  triggers.flatMap((trigger) =>
    Object.entries(trigger.requiredFlags ?? {}).map(([key, value]) => ({
      projectId,
      triggerId: trigger.id,
      key,
      ...toFlagValueColumns(value),
    })),
  );

const toTriggerSetFlagCreateManyInput = (
  projectId: string,
  triggers: readonly TriggerDefinition[],
): Array<{
  readonly projectId: string;
  readonly triggerId: string;
  readonly key: string;
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: boolean | null;
}> =>
  triggers.flatMap((trigger) =>
    Object.entries(trigger.setFlags ?? {}).map(([key, value]) => ({
      projectId,
      triggerId: trigger.id,
      key,
      ...toFlagValueColumns(value),
    })),
  );

const toFlagCreateManyInput = (
  projectId: string,
  flags: readonly GameFlagDefinition[],
): Prisma.BuilderProjectFlagCreateManyInput[] =>
  flags.map((flag) => ({
    projectId,
    key: flag.key,
    label: flag.label,
    ...toFlagValueColumns(flag.initialValue),
  }));

const toGenerationJobCreateManyInput = (
  projectId: string,
  generationJobs: readonly GenerationJob[],
): Prisma.BuilderProjectGenerationJobCreateManyInput[] =>
  generationJobs.map((job) => ({
    projectId,
    id: job.id,
    kind: job.kind,
    status: job.status,
    prompt: job.prompt,
    targetId: job.targetId,
    statusMessage: job.statusMessage,
    createdAt: new Date(job.createdAtMs),
    updatedAt: new Date(job.updatedAtMs),
  }));

const toGenerationJobArtifactCreateManyInput = (
  projectId: string,
  generationJobs: readonly GenerationJob[],
): Array<{
  readonly projectId: string;
  readonly jobId: string;
  readonly ordinal: number;
  readonly artifactId: string;
}> =>
  generationJobs.flatMap((job) =>
    job.artifactIds.map((artifactId, ordinal) => ({
      projectId,
      jobId: job.id,
      ordinal,
      artifactId,
    })),
  );

const toArtifactCreateManyInput = (
  projectId: string,
  artifacts: readonly GenerationArtifact[],
): Prisma.BuilderProjectArtifactCreateManyInput[] =>
  artifacts.map((artifact) => ({
    projectId,
    id: artifact.id,
    jobId: artifact.jobId,
    kind: artifact.kind,
    label: artifact.label,
    previewSource: artifact.previewSource,
    summary: artifact.summary,
    mimeType: artifact.mimeType,
    generationSource: artifact.metadata?.source,
    generationReason: artifact.metadata?.reason,
    approved: artifact.approved,
    createdAt: new Date(artifact.createdAtMs),
  }));

const toAutomationRunCreateManyInput = (
  projectId: string,
  automationRuns: readonly AutomationRun[],
): Prisma.BuilderProjectAutomationRunCreateManyInput[] =>
  automationRuns.map((run) => ({
    projectId,
    id: run.id,
    status: run.status,
    goal: run.goal,
    statusMessage: run.statusMessage,
    createdAt: new Date(run.createdAtMs),
    updatedAt: new Date(run.updatedAtMs),
  }));

const toAutomationRunStepCreateManyInput = (
  projectId: string,
  automationRuns: readonly AutomationRun[],
): Array<{
  readonly projectId: string;
  readonly runId: string;
  readonly id: string;
  readonly ordinal: number;
  readonly action: string;
  readonly summary: string;
  readonly status: string;
  readonly specJson?: string;
  readonly evidenceSource?: string;
}> =>
  automationRuns.flatMap((run) =>
    run.steps.map((step, ordinal) => ({
      projectId,
      runId: run.id,
      id: step.id,
      ordinal,
      action: step.action,
      summary: step.summary,
      status: step.status,
      specJson: step.spec ? JSON.stringify(step.spec) : undefined,
      evidenceSource: step.evidenceSource,
    })),
  );

const toAutomationRunArtifactCreateManyInput = (
  projectId: string,
  automationRuns: readonly AutomationRun[],
): Array<{
  readonly projectId: string;
  readonly runId: string;
  readonly ordinal: number;
  readonly artifactId: string;
}> =>
  automationRuns.flatMap((run) =>
    run.artifactIds.map((artifactId, ordinal) => ({
      projectId,
      runId: run.id,
      ordinal,
      artifactId,
    })),
  );

// ── Domain error for session state ────────────────────────────────────────────

/**
 * Typed domain error carrying a discriminated error code.
 */
export class DomainError extends Error {
  readonly code: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";

  constructor(code: "SESSION_NOT_FOUND" | "SESSION_EXPIRED", message: string) {
    super(message);
    this.code = code;
  }
}

// ── $extends — domain methods ─────────────────────────────────────────────────

const withBuilderCoreExtensions = (base: PrismaClient) =>
  base.$extends({
    model: {
      /**
       * BuilderProject persistence helpers.
       */
      builderProject: {
        /** Finds a builder project using the canonical selected row shape. */
        async findStateRow(id: string): Promise<BuilderProjectRow | null> {
          return base.builderProject.findUnique({
            where: { id },
            select: builderProjectRowSelect,
          });
        },

        /** Lists builder projects by id using the canonical selected row shape. */
        async listStateRowsByIds(
          projectIds: readonly string[],
        ): Promise<readonly BuilderProjectRow[]> {
          if (projectIds.length === 0) {
            return [];
          }

          return base.builderProject.findMany({
            where: {
              id: {
                in: [...projectIds],
              },
            },
            orderBy: { id: "asc" },
            select: builderProjectRowSelect,
          });
        },

        /** Creates a builder project using the canonical selected row shape. */
        async createStateProject(
          id: string,
          state: Prisma.InputJsonValue,
          checksum: string,
          createdBy?: string,
          content?: {
            readonly scenes: readonly SceneDefinition[];
            readonly dialogues: Readonly<Record<LocaleCode, Record<string, string>>>;
            readonly assets: readonly BuilderAsset[];
            readonly animationClips: readonly AnimationClip[];
            readonly dialogueGraphs: readonly DialogueGraph[];
            readonly quests: readonly QuestDefinition[];
            readonly triggers: readonly TriggerDefinition[];
            readonly flags: readonly GameFlagDefinition[];
            readonly generationJobs: readonly GenerationJob[];
            readonly artifacts: readonly GenerationArtifact[];
            readonly automationRuns: readonly AutomationRun[];
          },
          source?: string,
        ): Promise<BuilderProjectRow> {
          return base.$transaction(async (tx) => {
            const actor = (createdBy ?? "").trim() || "system";
            const row = await tx.builderProject.create({
              data: {
                id,
                state,
                checksum,
                createdBy: actor,
                updatedBy: actor,
                source: source?.trim() || "builder",
              },
              select: builderProjectRowSelect,
            });

            if (content) {
              if (content.scenes.length > 0) {
                await tx.builderProjectScene.createMany({
                  data: toSceneCreateManyInput(id, content.scenes),
                });
                const sceneCollisions = toSceneCollisionCreateManyInput(id, content.scenes);
                if (sceneCollisions.length > 0) {
                  await tx.builderProjectSceneCollision.createMany({
                    data: sceneCollisions,
                  });
                }
                const sceneNpcs = toSceneNpcCreateManyInput(id, content.scenes);
                if (sceneNpcs.length > 0) {
                  await tx.builderProjectSceneNpc.createMany({
                    data: sceneNpcs,
                  });
                }
                const sceneNpcDialogueKeys = toSceneNpcDialogueKeyCreateManyInput(
                  id,
                  content.scenes,
                );
                if (sceneNpcDialogueKeys.length > 0) {
                  await tx.builderProjectSceneNpcDialogueKey.createMany({
                    data: sceneNpcDialogueKeys,
                  });
                }
                const sceneNodes = toSceneNodeCreateManyInput(id, content.scenes);
                if (sceneNodes.length > 0) {
                  await tx.builderProjectSceneNode.createMany({
                    data: sceneNodes,
                  });
                }
              }
              const dialogueEntries = toDialogueEntryCreateManyInput(id, content.dialogues);
              if (dialogueEntries.length > 0) {
                await tx.builderProjectDialogueEntry.createMany({
                  data: dialogueEntries,
                });
              }
              if (content.assets.length > 0) {
                await tx.builderProjectAsset.createMany({
                  data: toAssetCreateManyInput(id, content.assets),
                });
                const assetTags = toAssetTagCreateManyInput(id, content.assets);
                if (assetTags.length > 0) {
                  await tx.builderProjectAssetTag.createMany({
                    data: assetTags,
                  });
                }
                const assetVariants = toAssetVariantCreateManyInput(id, content.assets);
                if (assetVariants.length > 0) {
                  await tx.builderProjectAssetVariant.createMany({
                    data: assetVariants,
                  });
                }
              }
              if (content.animationClips.length > 0) {
                await tx.builderProjectAnimationClip.createMany({
                  data: toAnimationClipCreateManyInput(id, content.animationClips),
                });
              }
              if (content.dialogueGraphs.length > 0) {
                await tx.builderProjectDialogueGraph.createMany({
                  data: toDialogueGraphCreateManyInput(id, content.dialogueGraphs),
                });
                const dialogueGraphNodes = toDialogueGraphNodeCreateManyInput(
                  id,
                  content.dialogueGraphs,
                );
                if (dialogueGraphNodes.length > 0) {
                  await tx.builderProjectDialogueGraphNode.createMany({
                    data: dialogueGraphNodes,
                  });
                }
                const dialogueGraphEdges = toDialogueGraphEdgeCreateManyInput(
                  id,
                  content.dialogueGraphs,
                );
                if (dialogueGraphEdges.length > 0) {
                  await tx.builderProjectDialogueGraphEdge.createMany({
                    data: dialogueGraphEdges,
                  });
                }
              }
              if (content.quests.length > 0) {
                await tx.builderProjectQuest.createMany({
                  data: toQuestCreateManyInput(id, content.quests),
                });
                const questSteps = toQuestStepCreateManyInput(id, content.quests);
                if (questSteps.length > 0) {
                  await tx.builderProjectQuestStep.createMany({
                    data: questSteps,
                  });
                }
              }
              if (content.triggers.length > 0) {
                await tx.builderProjectTrigger.createMany({
                  data: toTriggerCreateManyInput(id, content.triggers),
                });
                const requiredFlags = toTriggerRequiredFlagCreateManyInput(id, content.triggers);
                if (requiredFlags.length > 0) {
                  await tx.builderProjectTriggerRequiredFlag.createMany({
                    data: requiredFlags,
                  });
                }
                const setFlags = toTriggerSetFlagCreateManyInput(id, content.triggers);
                if (setFlags.length > 0) {
                  await tx.builderProjectTriggerSetFlag.createMany({
                    data: setFlags,
                  });
                }
              }
              if (content.flags.length > 0) {
                await tx.builderProjectFlag.createMany({
                  data: toFlagCreateManyInput(id, content.flags),
                });
              }
              if (content.generationJobs.length > 0) {
                await tx.builderProjectGenerationJob.createMany({
                  data: toGenerationJobCreateManyInput(id, content.generationJobs),
                });
                const generationJobArtifacts = toGenerationJobArtifactCreateManyInput(
                  id,
                  content.generationJobs,
                );
                if (generationJobArtifacts.length > 0) {
                  await tx.builderProjectGenerationJobArtifact.createMany({
                    data: generationJobArtifacts,
                  });
                }
              }
              if (content.artifacts.length > 0) {
                await tx.builderProjectArtifact.createMany({
                  data: toArtifactCreateManyInput(id, content.artifacts),
                });
              }
              if (content.automationRuns.length > 0) {
                await tx.builderProjectAutomationRun.createMany({
                  data: toAutomationRunCreateManyInput(id, content.automationRuns),
                });
                const automationRunSteps = toAutomationRunStepCreateManyInput(
                  id,
                  content.automationRuns,
                );
                if (automationRunSteps.length > 0) {
                  await tx.builderProjectAutomationRunStep.createMany({
                    data: automationRunSteps,
                  });
                }
                const automationRunArtifacts = toAutomationRunArtifactCreateManyInput(
                  id,
                  content.automationRuns,
                );
                if (automationRunArtifacts.length > 0) {
                  await tx.builderProjectAutomationRunArtifact.createMany({
                    data: automationRunArtifacts,
                  });
                }
              }
            }

            return row;
          });
        },

        /**
         * Performs an optimistic-concurrency state write and returns the refreshed row.
         */
        async saveStateVersioned(
          id: string,
          version: number,
          state: Prisma.InputJsonValue,
          checksum: string,
          updatedBy: string,
          content?: {
            readonly scenes: readonly SceneDefinition[];
            readonly dialogues: Readonly<Record<LocaleCode, Record<string, string>>>;
            readonly assets: readonly BuilderAsset[];
            readonly animationClips: readonly AnimationClip[];
            readonly dialogueGraphs: readonly DialogueGraph[];
            readonly quests: readonly QuestDefinition[];
            readonly triggers: readonly TriggerDefinition[];
            readonly flags: readonly GameFlagDefinition[];
            readonly generationJobs: readonly GenerationJob[];
            readonly artifacts: readonly GenerationArtifact[];
            readonly automationRuns: readonly AutomationRun[];
          },
        ): Promise<BuilderProjectRow | null> {
          return base.$transaction(async (tx) => {
            const updated = await tx.builderProject.updateMany({
              where: { id, version },
              data: {
                state,
                checksum,
                updatedBy,
                version: {
                  increment: 1,
                },
              },
            });
            if (updated.count === 0) {
              return null;
            }

            if (content) {
              await tx.builderProjectDialogueEntry.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectSceneNpcDialogueKey.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectSceneNpc.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectSceneNode.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectSceneCollision.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectScene.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectArtifact.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAutomationRunArtifact.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAutomationRunStep.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAutomationRun.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectGenerationJobArtifact.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectGenerationJob.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAnimationClip.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectDialogueGraphEdge.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectDialogueGraphNode.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectDialogueGraph.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectQuestStep.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectQuest.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectTriggerRequiredFlag.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectTriggerSetFlag.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectTrigger.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectFlag.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAssetTag.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAssetVariant.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAsset.deleteMany({
                where: { projectId: id },
              });

              if (content.scenes.length > 0) {
                await tx.builderProjectScene.createMany({
                  data: toSceneCreateManyInput(id, content.scenes),
                });
                const sceneCollisions = toSceneCollisionCreateManyInput(id, content.scenes);
                if (sceneCollisions.length > 0) {
                  await tx.builderProjectSceneCollision.createMany({
                    data: sceneCollisions,
                  });
                }
                const sceneNpcs = toSceneNpcCreateManyInput(id, content.scenes);
                if (sceneNpcs.length > 0) {
                  await tx.builderProjectSceneNpc.createMany({
                    data: sceneNpcs,
                  });
                }
                const sceneNpcDialogueKeys = toSceneNpcDialogueKeyCreateManyInput(
                  id,
                  content.scenes,
                );
                if (sceneNpcDialogueKeys.length > 0) {
                  await tx.builderProjectSceneNpcDialogueKey.createMany({
                    data: sceneNpcDialogueKeys,
                  });
                }
                const sceneNodes = toSceneNodeCreateManyInput(id, content.scenes);
                if (sceneNodes.length > 0) {
                  await tx.builderProjectSceneNode.createMany({
                    data: sceneNodes,
                  });
                }
              }
              const dialogueEntries = toDialogueEntryCreateManyInput(id, content.dialogues);
              if (dialogueEntries.length > 0) {
                await tx.builderProjectDialogueEntry.createMany({
                  data: dialogueEntries,
                });
              }
              if (content.assets.length > 0) {
                await tx.builderProjectAsset.createMany({
                  data: toAssetCreateManyInput(id, content.assets),
                });
                const assetTags = toAssetTagCreateManyInput(id, content.assets);
                if (assetTags.length > 0) {
                  await tx.builderProjectAssetTag.createMany({
                    data: assetTags,
                  });
                }
                const assetVariants = toAssetVariantCreateManyInput(id, content.assets);
                if (assetVariants.length > 0) {
                  await tx.builderProjectAssetVariant.createMany({
                    data: assetVariants,
                  });
                }
              }
              if (content.animationClips.length > 0) {
                await tx.builderProjectAnimationClip.createMany({
                  data: toAnimationClipCreateManyInput(id, content.animationClips),
                });
              }
              if (content.dialogueGraphs.length > 0) {
                await tx.builderProjectDialogueGraph.createMany({
                  data: toDialogueGraphCreateManyInput(id, content.dialogueGraphs),
                });
                const dialogueGraphNodes = toDialogueGraphNodeCreateManyInput(
                  id,
                  content.dialogueGraphs,
                );
                if (dialogueGraphNodes.length > 0) {
                  await tx.builderProjectDialogueGraphNode.createMany({
                    data: dialogueGraphNodes,
                  });
                }
                const dialogueGraphEdges = toDialogueGraphEdgeCreateManyInput(
                  id,
                  content.dialogueGraphs,
                );
                if (dialogueGraphEdges.length > 0) {
                  await tx.builderProjectDialogueGraphEdge.createMany({
                    data: dialogueGraphEdges,
                  });
                }
              }
              if (content.quests.length > 0) {
                await tx.builderProjectQuest.createMany({
                  data: toQuestCreateManyInput(id, content.quests),
                });
                const questSteps = toQuestStepCreateManyInput(id, content.quests);
                if (questSteps.length > 0) {
                  await tx.builderProjectQuestStep.createMany({
                    data: questSteps,
                  });
                }
              }
              if (content.triggers.length > 0) {
                await tx.builderProjectTrigger.createMany({
                  data: toTriggerCreateManyInput(id, content.triggers),
                });
                const requiredFlags = toTriggerRequiredFlagCreateManyInput(id, content.triggers);
                if (requiredFlags.length > 0) {
                  await tx.builderProjectTriggerRequiredFlag.createMany({
                    data: requiredFlags,
                  });
                }
                const setFlags = toTriggerSetFlagCreateManyInput(id, content.triggers);
                if (setFlags.length > 0) {
                  await tx.builderProjectTriggerSetFlag.createMany({
                    data: setFlags,
                  });
                }
              }
              if (content.flags.length > 0) {
                await tx.builderProjectFlag.createMany({
                  data: toFlagCreateManyInput(id, content.flags),
                });
              }
              if (content.generationJobs.length > 0) {
                await tx.builderProjectGenerationJob.createMany({
                  data: toGenerationJobCreateManyInput(id, content.generationJobs),
                });
                const generationJobArtifacts = toGenerationJobArtifactCreateManyInput(
                  id,
                  content.generationJobs,
                );
                if (generationJobArtifacts.length > 0) {
                  await tx.builderProjectGenerationJobArtifact.createMany({
                    data: generationJobArtifacts,
                  });
                }
              }
              if (content.artifacts.length > 0) {
                await tx.builderProjectArtifact.createMany({
                  data: toArtifactCreateManyInput(id, content.artifacts),
                });
              }
              if (content.automationRuns.length > 0) {
                await tx.builderProjectAutomationRun.createMany({
                  data: toAutomationRunCreateManyInput(id, content.automationRuns),
                });
                const automationRunSteps = toAutomationRunStepCreateManyInput(
                  id,
                  content.automationRuns,
                );
                if (automationRunSteps.length > 0) {
                  await tx.builderProjectAutomationRunStep.createMany({
                    data: automationRunSteps,
                  });
                }
                const automationRunArtifacts = toAutomationRunArtifactCreateManyInput(
                  id,
                  content.automationRuns,
                );
                if (automationRunArtifacts.length > 0) {
                  await tx.builderProjectAutomationRunArtifact.createMany({
                    data: automationRunArtifacts,
                  });
                }
              }
            }

            return tx.builderProject.findUnique({
              where: { id },
              select: builderProjectRowSelect,
            });
          });
        },

        /** Lists builder projects using the canonical selected row shape. */
        async listStateRows(projectId?: string): Promise<readonly BuilderProjectRow[]> {
          if (projectId) {
            const row = await base.builderProject.findUnique({
              where: { id: projectId },
              select: builderProjectRowSelect,
            });
            return row ? [row] : [];
          }

          return base.builderProject.findMany({
            orderBy: { id: "asc" },
            select: builderProjectRowSelect,
          });
        },

        /**
         * Publishes or unpublishes a builder project with immutable release snapshots.
         */
        async publishStateSnapshot(
          projectId: string,
          published: boolean,
          snapshot?: {
            readonly state: Prisma.InputJsonValue;
            readonly checksum: string;
          },
          updatedBy?: string,
        ): Promise<BuilderProjectRow | null> {
          return base.$transaction(async (tx) => {
            const actor = (updatedBy ?? "").trim() || "builder-publish";
            const row = await tx.builderProject.findUnique({
              where: { id: projectId },
            });
            if (!row) {
              return null;
            }

            if (published) {
              const nextReleaseVersion = row.latestReleaseVersion + 1;
              await tx.builderProjectRelease.create({
                data: {
                  projectId: row.id,
                  releaseVersion: nextReleaseVersion,
                  checksum: snapshot?.checksum ?? row.checksum,
                  state:
                    snapshot?.state ??
                    safeJsonParse<Prisma.InputJsonValue>(
                      JSON.stringify(row.state ?? {}),
                      {},
                      isInputJsonValue,
                    ),
                },
              });

              await tx.builderProject.update({
                where: { id: row.id },
                data: {
                  latestReleaseVersion: nextReleaseVersion,
                  publishedReleaseVersion: nextReleaseVersion,
                  updatedBy: actor,
                  version: {
                    increment: 1,
                  },
                },
              });
            } else {
              await tx.builderProject.update({
                where: { id: row.id },
                data: {
                  publishedReleaseVersion: null,
                  updatedBy: actor,
                  version: {
                    increment: 1,
                  },
                },
              });
            }

            return tx.builderProject.findUnique({
              where: { id: row.id },
              select: builderProjectRowSelect,
            });
          });
        },
      },
    },
  });

// ── $extends — builder row-list methods ───────────────────────────────────────

const withBuilderRowExtensions = (base: ReturnType<typeof withBuilderCoreExtensions>) =>
  base.$extends({
    model: {
      /**
       * BuilderProjectRelease persistence helpers.
       */
      builderProjectRelease: {
        /** Finds a published release snapshot using the canonical selected row shape. */
        async findStateRelease(
          projectId: string,
          releaseVersion: number,
        ): Promise<BuilderProjectReleaseStateRow | null> {
          return base.builderProjectRelease.findUnique({
            where: {
              projectId_releaseVersion: {
                projectId,
                releaseVersion,
              },
            },
            select: builderProjectReleaseStateSelect,
          });
        },
      },

      /**
       * BuilderProjectScene persistence helpers.
       */
      builderProjectScene: {
        /** Lists draft scene rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectSceneRow[]> {
          return base.builderProjectScene.findMany({
            where: { projectId },
            select: builderProjectSceneRowSelect,
          });
        },
      },

      /**
       * BuilderProjectSceneCollision persistence helpers.
       */
      builderProjectSceneCollision: {
        /** Lists draft scene collision rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectSceneCollisionRow[]> {
          return base.builderProjectSceneCollision.findMany({
            where: { projectId },
            orderBy: [{ sceneId: "asc" }, { ordinal: "asc" }],
            select: builderProjectSceneCollisionRowSelect,
          });
        },
      },

      /**
       * BuilderProjectSceneNpc persistence helpers.
       */
      builderProjectSceneNpc: {
        /** Lists draft scene-NPC rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectSceneNpcRow[]> {
          return base.builderProjectSceneNpc.findMany({
            where: { projectId },
            orderBy: [{ sceneId: "asc" }, { ordinal: "asc" }],
            select: builderProjectSceneNpcRowSelect,
          });
        },
      },

      /**
       * BuilderProjectSceneNpcDialogueKey persistence helpers.
       */
      builderProjectSceneNpcDialogueKey: {
        /** Lists draft scene-NPC dialogue-key rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectSceneNpcDialogueKeyRow[]> {
          return base.builderProjectSceneNpcDialogueKey.findMany({
            where: { projectId },
            orderBy: [{ sceneId: "asc" }, { characterKey: "asc" }, { ordinal: "asc" }],
            select: builderProjectSceneNpcDialogueKeyRowSelect,
          });
        },
      },

      /**
       * BuilderProjectSceneNode persistence helpers.
       */
      builderProjectSceneNode: {
        /** Lists draft scene-node rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectSceneNodeRow[]> {
          return base.builderProjectSceneNode.findMany({
            where: { projectId },
            orderBy: [{ sceneId: "asc" }, { ordinal: "asc" }],
            select: builderProjectSceneNodeRowSelect,
          });
        },
      },

      /**
       * BuilderProjectDialogueEntry persistence helpers.
       */
      builderProjectDialogueEntry: {
        /** Lists draft dialogue-entry rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectDialogueEntryRow[]> {
          return base.builderProjectDialogueEntry.findMany({
            where: { projectId },
            select: builderProjectDialogueEntryRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAsset persistence helpers.
       */
      builderProjectAsset: {
        /** Lists draft asset rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectAssetRow[]> {
          return base.builderProjectAsset.findMany({
            where: { projectId },
            select: builderProjectAssetRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAssetTag persistence helpers.
       */
      builderProjectAssetTag: {
        /** Lists draft asset-tag rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectAssetTagRow[]> {
          return base.builderProjectAssetTag.findMany({
            where: { projectId },
            orderBy: [{ assetId: "asc" }, { ordinal: "asc" }],
            select: builderProjectAssetTagRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAssetVariant persistence helpers.
       */
      builderProjectAssetVariant: {
        /** Lists draft asset-variant rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAssetVariantRow[]> {
          return base.builderProjectAssetVariant.findMany({
            where: { projectId },
            orderBy: [{ assetId: "asc" }, { ordinal: "asc" }],
            select: builderProjectAssetVariantRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAnimationClip persistence helpers.
       */
      builderProjectAnimationClip: {
        /** Lists draft animation-clip rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAnimationClipRow[]> {
          return base.builderProjectAnimationClip.findMany({
            where: { projectId },
            select: builderProjectAnimationClipRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAnimationTimeline persistence helpers.
       */
      builderProjectAnimationTimeline: {
        /** Lists draft animation-timeline rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAnimationTimelineRow[]> {
          return base.builderProjectAnimationTimeline.findMany({
            where: { projectId },
            select: builderProjectAnimationTimelineRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAnimationTrack persistence helpers.
       */
      builderProjectAnimationTrack: {
        /** Lists draft animation-track rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAnimationTrackRow[]> {
          return base.builderProjectAnimationTrack.findMany({
            where: { projectId },
            select: builderProjectAnimationTrackRowSelect,
          });
        },
      },

      /**
       * BuilderProjectSpriteAtlas persistence helpers.
       */
      builderProjectSpriteAtlas: {
        /** Lists draft sprite-atlas rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectSpriteAtlasRow[]> {
          return base.builderProjectSpriteAtlas.findMany({
            where: { projectId },
            select: builderProjectSpriteAtlasRowSelect,
          });
        },
      },

      /**
       * BuilderProjectDialogueGraph persistence helpers.
       */
      builderProjectDialogueGraph: {
        /** Lists draft dialogue-graph rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectDialogueGraphRow[]> {
          return base.builderProjectDialogueGraph.findMany({
            where: { projectId },
            select: builderProjectDialogueGraphRowSelect,
          });
        },
      },

      /**
       * BuilderProjectDialogueGraphNode persistence helpers.
       */
      builderProjectDialogueGraphNode: {
        /** Lists draft dialogue-graph node rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectDialogueGraphNodeRow[]> {
          return base.builderProjectDialogueGraphNode.findMany({
            where: { projectId },
            orderBy: [{ graphId: "asc" }, { ordinal: "asc" }],
            select: builderProjectDialogueGraphNodeRowSelect,
          });
        },
      },

      /**
       * BuilderProjectDialogueGraphEdge persistence helpers.
       */
      builderProjectDialogueGraphEdge: {
        /** Lists draft dialogue-graph edge rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectDialogueGraphEdgeRow[]> {
          return base.builderProjectDialogueGraphEdge.findMany({
            where: { projectId },
            orderBy: [{ graphId: "asc" }, { nodeId: "asc" }, { ordinal: "asc" }],
            select: builderProjectDialogueGraphEdgeRowSelect,
          });
        },
      },

      /**
       * BuilderProjectQuest persistence helpers.
       */
      builderProjectQuest: {
        /** Lists draft quest rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectQuestRow[]> {
          return base.builderProjectQuest.findMany({
            where: { projectId },
            select: builderProjectQuestRowSelect,
          });
        },
      },

      /**
       * BuilderProjectQuestStep persistence helpers.
       */
      builderProjectQuestStep: {
        /** Lists draft quest-step rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectQuestStepRow[]> {
          return base.builderProjectQuestStep.findMany({
            where: { projectId },
            orderBy: [{ questId: "asc" }, { ordinal: "asc" }],
            select: builderProjectQuestStepRowSelect,
          });
        },
      },

      /**
       * BuilderProjectTrigger persistence helpers.
       */
      builderProjectTrigger: {
        /** Lists draft trigger rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectTriggerRow[]> {
          return base.builderProjectTrigger.findMany({
            where: { projectId },
            select: builderProjectTriggerRowSelect,
          });
        },
      },

      /**
       * BuilderProjectTriggerRequiredFlag persistence helpers.
       */
      builderProjectTriggerRequiredFlag: {
        /** Lists draft trigger-required-flag rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectTriggerRequiredFlagRow[]> {
          return base.builderProjectTriggerRequiredFlag.findMany({
            where: { projectId },
            orderBy: [{ triggerId: "asc" }, { key: "asc" }],
            select: builderProjectTriggerRequiredFlagRowSelect,
          });
        },
      },

      /**
       * BuilderProjectTriggerSetFlag persistence helpers.
       */
      builderProjectTriggerSetFlag: {
        /** Lists draft trigger-set-flag rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectTriggerSetFlagRow[]> {
          return base.builderProjectTriggerSetFlag.findMany({
            where: { projectId },
            orderBy: [{ triggerId: "asc" }, { key: "asc" }],
            select: builderProjectTriggerSetFlagRowSelect,
          });
        },
      },

      /**
       * BuilderProjectFlag persistence helpers.
       */
      builderProjectFlag: {
        /** Lists draft flag rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectFlagRow[]> {
          return base.builderProjectFlag.findMany({
            where: { projectId },
            select: builderProjectFlagRowSelect,
          });
        },
      },

      builderProjectGenerationJob: {
        /** Lists draft generation-job rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectGenerationJobRow[]> {
          return base.builderProjectGenerationJob.findMany({
            where: { projectId },
            select: builderProjectGenerationJobRowSelect,
          });
        },

        /** Lists project ids that currently have queued generation jobs. */
        async listQueuedProjectIds(projectId?: string): Promise<readonly string[]> {
          const rows = await base.builderProjectGenerationJob.findMany({
            where: {
              status: "queued",
              ...(projectId ? { projectId } : {}),
            },
            orderBy: [{ projectId: "asc" }, { id: "asc" }],
            select: { projectId: true },
          });

          return [...new Set(rows.map((row) => row.projectId))];
        },
      },

      /**
       * BuilderProjectGenerationJobArtifact persistence helpers.
       */
      builderProjectGenerationJobArtifact: {
        /** Lists draft generation-job artifact rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectGenerationJobArtifactRow[]> {
          return base.builderProjectGenerationJobArtifact.findMany({
            where: { projectId },
            orderBy: [{ jobId: "asc" }, { ordinal: "asc" }],
            select: builderProjectGenerationJobArtifactRowSelect,
          });
        },
      },

      /**
       * BuilderProjectArtifact persistence helpers.
       */
      builderProjectArtifact: {
        /** Lists draft artifact rows for one project. */
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectArtifactRow[]> {
          return base.builderProjectArtifact.findMany({
            where: { projectId },
            select: builderProjectArtifactRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAutomationRun persistence helpers.
       */
      builderProjectAutomationRun: {
        /** Lists draft automation-run rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAutomationRunRow[]> {
          return base.builderProjectAutomationRun.findMany({
            where: { projectId },
            select: builderProjectAutomationRunRowSelect,
          });
        },

        /** Lists project ids that currently have queued automation runs. */
        async listQueuedProjectIds(projectId?: string): Promise<readonly string[]> {
          const rows = await base.builderProjectAutomationRun.findMany({
            where: {
              status: "queued",
              ...(projectId ? { projectId } : {}),
            },
            orderBy: [{ projectId: "asc" }, { id: "asc" }],
            select: { projectId: true },
          });

          return [...new Set(rows.map((row) => row.projectId))];
        },
      },

      /**
       * BuilderProjectAutomationRunStep persistence helpers.
       */
      builderProjectAutomationRunStep: {
        /** Lists draft automation-run step rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAutomationRunStepRow[]> {
          return base.builderProjectAutomationRunStep.findMany({
            where: { projectId },
            orderBy: [{ runId: "asc" }, { ordinal: "asc" }],
            select: builderProjectAutomationRunStepRowSelect,
          });
        },
      },

      /**
       * BuilderProjectAutomationRunArtifact persistence helpers.
       */
      builderProjectAutomationRunArtifact: {
        /** Lists draft automation-run artifact rows for one project. */
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAutomationRunArtifactRow[]> {
          return base.builderProjectAutomationRunArtifact.findMany({
            where: { projectId },
            orderBy: [{ runId: "asc" }, { ordinal: "asc" }],
            select: builderProjectAutomationRunArtifactRowSelect,
          });
        },
      },
    },
  });

// ── $extends — game & oracle domain methods ───────────────────────────────────

const withGameExtensions = (base: ReturnType<typeof withBuilderRowExtensions>) =>
  base.$extends({
    model: {
      /**
       * GameSession domain methods.
       */
      gameSession: {
        /** Hard-deletes all sessions whose expiresAt is in the past. */
        async purgeExpired() {
          return base.gameSession.deleteMany({
            where: { expiresAt: { lt: new Date() } },
          });
        },

        /**
         * Returns the session or throws SESSION_EXPIRED / SESSION_NOT_FOUND.
         * Use instead of findUnique + manual expiry check.
         */
        async findActiveOrThrow(id: string) {
          const session = await base.gameSession.findUnique({
            where: { id },
          });
          if (!session) {
            throw new DomainError("SESSION_NOT_FOUND", "SESSION_NOT_FOUND");
          }
          if (session.expiresAt < new Date()) {
            throw new DomainError("SESSION_EXPIRED", "SESSION_EXPIRED");
          }
          return session;
        },
      },

      /**
       * PlayerProgress domain methods.
       */
      playerProgress: {
        /**
         * Adds XP and re-computes level in one atomic update.
         * Returns the updated record.
         */
        async addXp(sessionId: string, amount: number) {
          const current = await base.playerProgress.findUnique({
            where: { sessionId },
          });
          const newXp = (current?.xp ?? 0) + amount;
          const newLevel = getLevel(newXp) + 1; // getLevel returns 0-based index
          return base.playerProgress.upsert({
            where: { sessionId },
            create: {
              sessionId,
              xp: newXp,
              level: newLevel,
            },
            update: { xp: newXp, level: newLevel },
          });
        },

        /**
         * Lists visited scene rows for one session in deterministic ordinal order.
         */
        async listVisitedSceneRows(sessionId: string) {
          return base.playerProgressVisitedScene.findMany({
            where: { sessionId },
            orderBy: { ordinal: "asc" },
          });
        },

        /**
         * Lists interaction completion rows for one session.
         */
        async listInteractionRows(sessionId: string) {
          return base.playerProgressInteraction.findMany({
            where: { sessionId },
            orderBy: { interactionId: "asc" },
          });
        },
      },

      /**
       * OracleInteraction domain methods.
       */
      oracleInteraction: {
        /**
         * Creates an interaction record with all three required columns populated.
         * Replaces scattered create() calls throughout the oracle service.
         */
        async recordWithSentiment(prompt: string, sentiment: string, fortune: string) {
          return base.oracleInteraction.create({
            data: { prompt, sentiment, fortune },
          });
        },
      },
    },
  });

/**
 * Chains all three extension layers into the final extended Prisma client.
 */
const withDomainExtensions = (base: PrismaClient) =>
  withGameExtensions(withBuilderRowExtensions(withBuilderCoreExtensions(base)));

type ExtendedPrismaClient = ReturnType<typeof withDomainExtensions>;

// ── Singleton export ──────────────────────────────────────────────────────────

const basePrismaClient = createBaseClient();
type BasePrismaClient = PrismaClient;

export const prismaBase: BasePrismaClient = basePrismaClient;
export const prisma: ExtendedPrismaClient =
  globalThis._devPrisma ?? withDomainExtensions(basePrismaClient);

if (appConfig.runtime.nodeEnv === "development") {
  globalThis._devPrisma = prisma;
}

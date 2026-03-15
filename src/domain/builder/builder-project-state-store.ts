import type { Prisma } from "@prisma/client";
import { appConfig, type LocaleCode } from "../../config/environment.ts";
import {
  createStarterProjectBranding,
  normalizeProjectBranding,
  type ProjectBranding,
} from "../../shared/branding/project-branding.ts";
import { builderGeometryPlaceholderPaths, joinUrlPath } from "../../shared/constants/assets.ts";
import { DEFAULT_NPC_IDLE_PAUSE_MS } from "../../shared/constants/builder-defaults.ts";
import type {
  AnimationClip,
  AnimationKeyframe,
  AnimationTimeline,
  AssetVariant,
  AutomationRun,
  AutomationRunStep,
  AutomationStepSpec,
  BuilderAsset,
  DialogueGraph,
  GameFlagDefinition,
  GenerationArtifact,
  GenerationJob,
  ParticleEmitterConfig,
  QuestDefinition,
  SceneDefinition,
  SceneNode2D,
  SceneNode3D,
  SceneNodeDefinition,
  SceneNpcDefinition,
  SpriteAtlasManifest,
  StarterProjectTemplateId,
  TilemapDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import {
  type BuilderProjectAnimationClipRow,
  type BuilderProjectAnimationTimelineRow,
  type BuilderProjectArtifactRow,
  type BuilderProjectAssetRow,
  type BuilderProjectAutomationRunRow,
  type BuilderProjectDialogueEntryRow,
  type BuilderProjectDialogueGraphRow,
  type BuilderProjectFlagRow,
  type BuilderProjectGenerationJobRow,
  type BuilderProjectQuestRow,
  type BuilderProjectRow,
  type BuilderProjectSceneRow,
  type BuilderProjectSpriteAtlasRow,
  type BuilderProjectTriggerRow,
  prisma,
} from "../../shared/services/db.ts";
import { acceptUnknown, safeJsonParse } from "../../shared/utils/safe-json.ts";
import { gameTextByLocale } from "../game/data/game-text.ts";
import {
  gameScenes,
  gameScenes2d,
  gameScenes3d,
  gameSpriteManifests,
} from "../game/data/sprite-data.ts";
import { resolveStarterProjectTemplateId, toStarterProjectSource } from "./starter-projects.ts";

/**
 * Shared default project identifier for builder routes and API defaults.
 */
export const defaultBuilderProjectId = "default";

const supportedLocales: readonly LocaleCode[] = ["en-US", "zh-CN"];
const baselineCreatedAtMs = 0;

/**
 * Canonical mutable builder project state materialized for the builder domain.
 * Draft project JSON stores scenes and dialogue catalogs, while authored media,
 * mechanics, and worker state are loaded from dedicated relational tables and
 * merged here.
 */
export interface BuilderProjectState {
  /** Project-owned brand profile used by builder and playable shells. */
  readonly brand: ProjectBranding;
  /** Scene definitions keyed by scene id. */
  readonly scenes: Record<string, SceneDefinition>;
  /** Dialogue catalogs keyed by locale and dialogue key. */
  readonly dialogues: Record<LocaleCode, Record<string, string>>;
  /** Authored asset registry. */
  readonly assets: Record<string, BuilderAsset>;
  /** Authored animation clips. */
  readonly animationClips: Record<string, AnimationClip>;
  /** Authored animation timelines. */
  readonly animationTimelines: Record<string, AnimationTimeline>;
  readonly spriteAtlases: Record<string, SpriteAtlasManifest>;
  /** Authored dialogue graphs. */
  readonly dialogueGraphs: Record<string, DialogueGraph>;
  /** Authored quest definitions. */
  readonly quests: Record<string, QuestDefinition>;
  /** Authored trigger definitions. */
  readonly triggers: Record<string, TriggerDefinition>;
  /** Authored game flags. */
  readonly flags: Record<string, GameFlagDefinition>;
  /** Generation jobs keyed by job id. */
  readonly generationJobs: Record<string, GenerationJob>;
  /** Reviewable generation artifacts keyed by artifact id. */
  readonly artifacts: Record<string, GenerationArtifact>;
  /** Approval-gated automation runs keyed by run id. */
  readonly automationRuns: Record<string, AutomationRun>;
}

/**
 * Builder-side snapshot projected from the canonical persisted state.
 */
export interface BuilderProjectSnapshot {
  /** Logical project identifier. */
  readonly id: string;
  /** Starter template provenance for this project. */
  readonly starterTemplateId: StarterProjectTemplateId;
  /** Project-owned brand profile. */
  readonly brand: ProjectBranding;
  /** Scene registry by stable scene id. */
  readonly scenes: Map<string, SceneDefinition>;
  /** Dialogue registry by locale -> key -> value. */
  readonly dialogues: Map<LocaleCode, Map<string, string>>;
  /** Authored asset registry. */
  readonly assets: Map<string, BuilderAsset>;
  /** Authored animation clips. */
  readonly animationClips: Map<string, AnimationClip>;
  /** Authored animation timelines. */
  readonly animationTimelines: Map<string, AnimationTimeline>;
  readonly spriteAtlases: Map<string, SpriteAtlasManifest>;
  /** Authored dialogue graphs. */
  readonly dialogueGraphs: Map<string, DialogueGraph>;
  /** Authored quest definitions. */
  readonly quests: Map<string, QuestDefinition>;
  /** Authored trigger definitions. */
  readonly triggers: Map<string, TriggerDefinition>;
  /** Authored flag definitions. */
  readonly flags: Map<string, GameFlagDefinition>;
  /** Queued and completed generation jobs. */
  readonly generationJobs: Map<string, GenerationJob>;
  /** Reviewable generated artifacts. */
  readonly artifacts: Map<string, GenerationArtifact>;
  /** Approval-gated automation runs. */
  readonly automationRuns: Map<string, AutomationRun>;
  /** Project publish status. */
  readonly published: boolean;
  /** Creation owner marker for audit-trail provenance. */
  readonly createdBy: string;
  /** Last update owner marker. */
  readonly updatedBy: string;
  /** Immutable source provenance marker. */
  readonly source: string;
  /** Stable project checksum. */
  readonly checksum: string;
  /** Last mutation version. */
  readonly version: number;
  /** Optional resume timestamp marker (ms since epoch). */
  readonly lastUpdatedAtMs: number;
  /** Latest immutable release version published from this project. */
  readonly latestReleaseVersion: number;
  /** Currently published release version, if any. */
  readonly publishedReleaseVersion: number | null;
}

/**
 * Loaded builder project row paired with its normalized mutable state.
 */
export interface BuilderProjectStateEntry {
  /** Canonical Prisma-selected row. */
  readonly row: BuilderProjectRow;
  /** Decoded mutable builder state. */
  readonly state: BuilderProjectState;
  /** Whether the row currently has a published release pointer. */
  readonly published: boolean;
}

/**
 * Successful state mutation result produced by the project state store.
 */
export interface BuilderProjectStateMutation<T> {
  /** Refreshed persisted project entry after save. */
  readonly entry: BuilderProjectStateEntry;
  /** Caller-owned mutation payload projected from the updated state. */
  readonly payload: T;
}

type BuilderProjectStateMutationDecision<T> =
  | {
      readonly ok: true;
      readonly payload: T;
    }
  | {
      readonly ok: false;
    };

const asRecord = (value: unknown): Record<string, unknown> => {
  const record: Record<string, unknown> = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return record;
  }

  for (const key of Object.keys(value)) {
    const entry = Reflect.get(value, key);
    if (entry !== undefined) {
      record[key] = entry;
    }
  }

  return record;
};

const toRecordFromEntries = <T>(entries: Iterable<readonly [string, T]>): Record<string, T> =>
  Object.fromEntries(entries);

const toStringValue = (value: unknown): string | null => (typeof value === "string" ? value : null);

const toBooleanValue = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;

const toBuilderAssetKind = (value: string): BuilderAsset["kind"] | null => {
  switch (value) {
    case "background":
    case "sprite-sheet":
    case "audio":
    case "model":
    case "portrait":
    case "tiles":
    case "tile-set":
    case "material":
      return value;
    default:
      return null;
  }
};

const toSceneMode = (value: string): BuilderAsset["sceneMode"] | null => {
  switch (value) {
    case "2d":
    case "3d":
      return value;
    default:
      return null;
  }
};

const toSceneNode3dType = (value: string): SceneNode3D["nodeType"] | null => {
  switch (value) {
    case "model":
    case "light":
    case "camera":
    case "spawn":
    case "trigger":
      return value;
    default:
      return null;
  }
};

const toSceneNode2dType = (value: string): SceneNode2D["nodeType"] | null => {
  switch (value) {
    case "sprite":
    case "tile":
    case "spawn":
    case "trigger":
    case "camera":
      return value;
    default:
      return null;
  }
};

const toGenerationJobKind = (value: string): GenerationJob["kind"] | null => {
  switch (value) {
    case "sprite-sheet":
    case "portrait":
    case "tiles":
    case "voice-line":
    case "animation-plan":
      return value;
    default:
      return null;
  }
};

const toGenerationJobStatus = (value: string): GenerationJob["status"] | null => {
  switch (value) {
    case "queued":
    case "running":
    case "blocked_for_approval":
    case "succeeded":
    case "failed":
    case "canceled":
      return value;
    default:
      return null;
  }
};

const toGenerationArtifactKind = (value: string): GenerationArtifact["kind"] | null => {
  switch (value) {
    case "background":
    case "sprite-sheet":
    case "audio":
    case "model":
    case "portrait":
    case "tiles":
    case "tile-set":
    case "material":
    case "animation-plan":
    case "automation-evidence":
      return value;
    default:
      return null;
  }
};

const toAutomationRunStatus = (value: string): AutomationRun["status"] | null => {
  switch (value) {
    case "queued":
    case "running":
    case "blocked_for_approval":
    case "succeeded":
    case "failed":
    case "canceled":
      return value;
    default:
      return null;
  }
};

const toAutomationStepAction = (value: string): AutomationRunStep["action"] | null => {
  switch (value) {
    case "browser":
    case "http":
    case "builder":
    case "attach-file":
      return value;
    default:
      return null;
  }
};

const toAutomationStepStatus = (value: string): AutomationRunStep["status"] | null => {
  switch (value) {
    case "pending":
    case "running":
    case "completed":
    case "failed":
      return value;
    default:
      return null;
  }
};

const checksumOf = (value: unknown): string => {
  const payload = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `checksum-${hash.toString(16).padStart(8, "0")}`;
};

const buildBaselineAssets = (): Record<string, BuilderAsset> => {
  const backgroundAssets = Object.values(gameScenes).map(
    (scene) =>
      ({
        id: `asset.background.${scene.id}`,
        kind: "background",
        label: scene.id,
        sceneMode: scene.sceneMode ?? "2d",
        source: scene.background,
        sourceFormat: "png",
        tags: ["baseline", scene.id],
        variants: [
          {
            id: `variant.background.${scene.id}.runtime`,
            format: "png",
            source: scene.background,
            usage: "runtime",
            mimeType: "image/png",
          },
        ],
        approved: true,
        createdAtMs: baselineCreatedAtMs,
        updatedAtMs: baselineCreatedAtMs,
      }) satisfies BuilderAsset,
  );

  const spriteAssets = Object.entries(gameSpriteManifests).map(
    ([characterKey, manifest]) =>
      ({
        id: `asset.sprite.${characterKey}`,
        kind: "sprite-sheet",
        label: characterKey,
        sceneMode: "2d",
        source: manifest.sheet,
        sourceFormat: "png",
        tags: ["baseline", "sprite", characterKey],
        variants: [
          {
            id: `variant.sprite.${characterKey}.runtime`,
            format: "png",
            source: manifest.sheet,
            usage: "runtime",
            mimeType: "image/png",
          },
        ],
        approved: true,
        createdAtMs: baselineCreatedAtMs,
        updatedAtMs: baselineCreatedAtMs,
      }) satisfies BuilderAsset,
  );

  const placeholderGlb = joinUrlPath(
    appConfig.staticAssets.assetsPrefix,
    builderGeometryPlaceholderPaths.glb,
  );
  const placeholderUsdz = joinUrlPath(
    appConfig.staticAssets.assetsPrefix,
    builderGeometryPlaceholderPaths.usdz,
  );
  const modelAssets: BuilderAsset[] = [
    {
      id: "asset.model.cavernModel",
      kind: "model",
      label: "Crystal Cavern (GLB)",
      sceneMode: "3d",
      source: placeholderGlb,
      sourceFormat: "glb",
      tags: ["baseline", "environment", "3d"],
      variants: [
        {
          id: "variant.model.cavernModel.runtime",
          format: "glb",
          source: placeholderGlb,
          usage: "runtime",
          mimeType: "model/gltf-binary",
        },
      ],
      approved: true,
      createdAtMs: baselineCreatedAtMs,
      updatedAtMs: baselineCreatedAtMs,
    },
    {
      id: "asset.model.cavernUsd",
      kind: "model",
      label: "Crystal Cavern (USDZ)",
      sceneMode: "3d",
      source: placeholderUsdz,
      sourceFormat: "usdz",
      tags: ["baseline", "environment", "3d", "usd"],
      variants: [
        {
          id: "variant.model.cavernUsd.runtime",
          format: "usdz",
          source: placeholderUsdz,
          usage: "runtime",
          mimeType: "model/vnd.usdz+zip",
        },
      ],
      approved: true,
      createdAtMs: baselineCreatedAtMs,
      updatedAtMs: baselineCreatedAtMs,
    },
  ];

  return toRecordFromEntries(
    [...backgroundAssets, ...spriteAssets, ...modelAssets].map((asset) => [asset.id, asset]),
  );
};

const buildBaselineAnimationClips = (): Record<string, AnimationClip> =>
  toRecordFromEntries(
    Object.entries(gameSpriteManifests).flatMap(([characterKey, manifest]) =>
      Object.entries(manifest.animations).map(([animationKey, animation]) => {
        const clip: AnimationClip = {
          id: `clip.${characterKey}.${animationKey}`,
          assetId: `asset.sprite.${characterKey}`,
          label: `${characterKey}:${animationKey}`,
          sceneMode: "2d",
          stateTag: animationKey,
          playbackFps: animation.speed,
          startFrame: animation.startCol,
          frameCount: animation.frames,
          loop: true,
          direction: animationKey.endsWith("-up")
            ? "up"
            : animationKey.endsWith("-down")
              ? "down"
              : animationKey.endsWith("-left")
                ? "left"
                : animationKey.endsWith("-right")
                  ? "right"
                  : undefined,
          createdAtMs: baselineCreatedAtMs,
          updatedAtMs: baselineCreatedAtMs,
        };
        return [clip.id, clip];
      }),
    ),
  );

const buildBaselineDialogueGraphs = (): Record<string, DialogueGraph> => ({
  "graph.teaMonk.intro": {
    id: "graph.teaMonk.intro",
    title: "Tea Monk Intro",
    npcId: "teaMonk",
    rootNodeId: "root",
    nodes: [
      {
        id: "root",
        line: "npc.teaMonk.greet",
        edges: [
          {
            to: "wisdom",
            advanceQuestStepId: "step.meet-teaMonk",
          },
        ],
      },
      {
        id: "wisdom",
        line: "npc.teaMonk.lines.wood-cycle",
        edges: [],
      },
    ],
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  },
});

const buildBaselineFlags = (): Record<string, GameFlagDefinition> => ({
  teaHouseVisited: {
    key: "teaHouseVisited",
    label: "Tea house visited",
    initialValue: false,
  },
  teaMonkMet: {
    key: "teaMonkMet",
    label: "Tea monk met",
    initialValue: false,
  },
});

const buildBaselineTriggers = (): Record<string, TriggerDefinition> => ({
  "trigger.enter-teaHouse": {
    id: "trigger.enter-teaHouse",
    label: "Enter tea house",
    event: "scene-enter",
    sceneId: "teaHouse",
    setFlags: {
      teaHouseVisited: true,
    },
  },
  "trigger.meet-teaMonk": {
    id: "trigger.meet-teaMonk",
    label: "Meet the tea monk",
    event: "npc-interact",
    sceneId: "teaHouse",
    npcId: "teaMonk",
    setFlags: {
      teaMonkMet: true,
    },
    questId: "quest.teaHouse.welcome",
    questStepId: "step.meet-teaMonk",
  },
});

const buildBaselineQuests = (): Record<string, QuestDefinition> => ({
  "quest.teaHouse.welcome": {
    id: "quest.teaHouse.welcome",
    title: "Meet the Tea Monk",
    description: "Find the tea monk and start the authored introduction flow.",
    steps: [
      {
        id: "step.meet-teaMonk",
        title: "Speak with the tea monk",
        description: "Approach the tea monk and interact to unlock the first authored flag.",
        triggerId: "trigger.meet-teaMonk",
      },
    ],
  },
});

const createBaselineState = (): BuilderProjectState => {
  const scenes = toRecordFromEntries(
    Object.entries(gameScenes).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  );
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": Object.fromEntries(Object.entries(gameTextByLocale["en-US"].npcs)),
    "zh-CN": Object.fromEntries(Object.entries(gameTextByLocale["zh-CN"].npcs)),
  };

  return {
    brand: createStarterProjectBranding("tea-house-story"),
    scenes,
    dialogues,
    assets: buildBaselineAssets(),
    animationClips: buildBaselineAnimationClips(),
    animationTimelines: {},
    spriteAtlases: {},
    dialogueGraphs: buildBaselineDialogueGraphs(),
    quests: buildBaselineQuests(),
    triggers: buildBaselineTriggers(),
    flags: buildBaselineFlags(),
    generationJobs: {},
    artifacts: {},
    automationRuns: {},
  };
};

const createBlankStarterState = (): BuilderProjectState => ({
  brand: createStarterProjectBranding("blank"),
  scenes: {},
  dialogues: {
    "en-US": {},
    "zh-CN": {},
  },
  assets: {},
  animationClips: {},
  animationTimelines: {},
  spriteAtlases: {},
  dialogueGraphs: {},
  quests: {},
  triggers: {},
  flags: {},
  generationJobs: {},
  artifacts: {},
  automationRuns: {},
});

const buildBaselineAssets2d = (): Record<string, BuilderAsset> => {
  const backgroundAssets = Object.values(gameScenes2d).map(
    (scene) =>
      ({
        id: `asset.background.${scene.id}`,
        kind: "background",
        label: scene.id,
        sceneMode: "2d",
        source: scene.background,
        sourceFormat: "png",
        tags: ["baseline", scene.id],
        variants: [
          {
            id: `variant.background.${scene.id}.runtime`,
            format: "png",
            source: scene.background,
            usage: "runtime",
            mimeType: "image/png",
          },
        ],
        approved: true,
        createdAtMs: baselineCreatedAtMs,
        updatedAtMs: baselineCreatedAtMs,
      }) satisfies BuilderAsset,
  );

  const spriteKeys2d = ["chaJiang", "teaMonk"] as const;
  const spriteAssets: BuilderAsset[] = [];
  for (const characterKey of spriteKeys2d) {
    const manifest = gameSpriteManifests[characterKey];
    if (!manifest) continue;
    spriteAssets.push({
      id: `asset.sprite.${characterKey}`,
      kind: "sprite-sheet",
      label: characterKey,
      sceneMode: "2d",
      source: manifest.sheet,
      sourceFormat: "png",
      tags: ["baseline", "sprite", characterKey],
      variants: [
        {
          id: `variant.sprite.${characterKey}.runtime`,
          format: "png",
          source: manifest.sheet,
          usage: "runtime",
          mimeType: "image/png",
        },
      ],
      approved: true,
      createdAtMs: baselineCreatedAtMs,
      updatedAtMs: baselineCreatedAtMs,
    });
  }

  return toRecordFromEntries(
    [...backgroundAssets, ...spriteAssets].map((asset) => [asset.id, asset]),
  );
};

const buildBaselineAnimationClips2d = (): Record<string, AnimationClip> =>
  toRecordFromEntries(
    (["chaJiang", "teaMonk"] as const).flatMap((characterKey) => {
      const manifest = gameSpriteManifests[characterKey];
      if (!manifest) return [];
      return Object.entries(manifest.animations).map(([animationKey, animation]) => {
        const clip: AnimationClip = {
          id: `clip.${characterKey}.${animationKey}`,
          assetId: `asset.sprite.${characterKey}`,
          label: `${characterKey}:${animationKey}`,
          sceneMode: "2d",
          stateTag: animationKey,
          playbackFps: animation.speed,
          startFrame: animation.startCol,
          frameCount: animation.frames,
          loop: true,
          direction: animationKey.endsWith("-up")
            ? "up"
            : animationKey.endsWith("-down")
              ? "down"
              : animationKey.endsWith("-left")
                ? "left"
                : animationKey.endsWith("-right")
                  ? "right"
                  : undefined,
          createdAtMs: baselineCreatedAtMs,
          updatedAtMs: baselineCreatedAtMs,
        };
        return [clip.id, clip];
      });
    }),
  );

const buildBaselineDialogueGraphs2d = (): Record<string, DialogueGraph> => ({
  "graph.chaJiang.garden": {
    id: "graph.chaJiang.garden",
    title: "Garden Keeper Intro",
    npcId: "chaJiang",
    rootNodeId: "root",
    nodes: [
      {
        id: "root",
        line: "npc.gardenKeeper.greet",
        edges: [
          {
            to: "seeds",
            advanceQuestStepId: "step.meet-gardenKeeper",
          },
        ],
      },
      {
        id: "seeds",
        line: "npc.gardenKeeper.lines.seeds",
        edges: [],
      },
    ],
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  },
  "graph.teaMonk.garden": {
    id: "graph.teaMonk.garden",
    title: "Wandering Sage Intro",
    npcId: "teaMonk",
    rootNodeId: "root",
    nodes: [
      {
        id: "root",
        line: "npc.wanderingSage.greet",
        edges: [
          {
            to: "meditation",
            advanceQuestStepId: "step.meet-wanderingSage",
          },
        ],
      },
      {
        id: "meditation",
        line: "npc.wanderingSage.lines.meditation",
        edges: [],
      },
    ],
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  },
});

const buildBaselineFlags2d = (): Record<string, GameFlagDefinition> => ({
  gardenVisited: {
    key: "gardenVisited",
    label: "Garden visited",
    initialValue: false,
  },
  gardenKeeperMet: {
    key: "gardenKeeperMet",
    label: "Garden keeper met",
    initialValue: false,
  },
});

const buildBaselineTriggers2d = (): Record<string, TriggerDefinition> => ({
  "trigger.enter-pixelGarden": {
    id: "trigger.enter-pixelGarden",
    label: "Enter pixel garden",
    event: "scene-enter",
    sceneId: "pixelGarden",
    setFlags: {
      gardenVisited: true,
    },
  },
  "trigger.meet-gardenKeeper": {
    id: "trigger.meet-gardenKeeper",
    label: "Meet the garden keeper",
    event: "npc-interact",
    sceneId: "pixelGarden",
    npcId: "chaJiang",
    setFlags: {
      gardenKeeperMet: true,
    },
    questId: "quest.garden.welcome",
    questStepId: "step.meet-gardenKeeper",
  },
  "trigger.meet-wanderingSage": {
    id: "trigger.meet-wanderingSage",
    label: "Meet the wandering sage",
    event: "npc-interact",
    sceneId: "pixelGarden",
    npcId: "teaMonk",
    setFlags: {},
    questId: "quest.garden.welcome",
    questStepId: "step.meet-wanderingSage",
  },
});

const buildBaselineQuests2d = (): Record<string, QuestDefinition> => ({
  "quest.garden.welcome": {
    id: "quest.garden.welcome",
    title: "Welcome to the Garden",
    description: "Speak with the garden keeper to begin your journey.",
    steps: [
      {
        id: "step.meet-gardenKeeper",
        title: "Speak with the garden keeper",
        description: "Approach the garden keeper and interact.",
        triggerId: "trigger.meet-gardenKeeper",
      },
      {
        id: "step.meet-wanderingSage",
        title: "Speak with the wandering sage",
        description: "Find the wandering sage and listen to their wisdom.",
        triggerId: "trigger.meet-wanderingSage",
      },
    ],
  },
});

const createBaselineState2d = (): BuilderProjectState => {
  const scenes = toRecordFromEntries(
    Object.entries(gameScenes2d).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  );
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": Object.fromEntries(Object.entries(gameTextByLocale["en-US"].npcs)),
    "zh-CN": Object.fromEntries(Object.entries(gameTextByLocale["zh-CN"].npcs)),
  };

  return {
    brand: createStarterProjectBranding("2d-game"),
    scenes,
    dialogues,
    assets: buildBaselineAssets2d(),
    animationClips: buildBaselineAnimationClips2d(),
    animationTimelines: {},
    spriteAtlases: {},
    dialogueGraphs: buildBaselineDialogueGraphs2d(),
    quests: buildBaselineQuests2d(),
    triggers: buildBaselineTriggers2d(),
    flags: buildBaselineFlags2d(),
    generationJobs: {},
    artifacts: {},
    automationRuns: {},
  };
};

const buildBaselineAssets3d = (): Record<string, BuilderAsset> => {
  const backgroundAssets = Object.values(gameScenes3d).map(
    (scene) =>
      ({
        id: `asset.background.${scene.id}`,
        kind: "background",
        label: scene.id,
        sceneMode: "3d",
        source: scene.background,
        sourceFormat: "png",
        tags: ["baseline", scene.id],
        variants: [
          {
            id: `variant.background.${scene.id}.runtime`,
            format: "png",
            source: scene.background,
            usage: "runtime",
            mimeType: "image/png",
          },
        ],
        approved: true,
        createdAtMs: baselineCreatedAtMs,
        updatedAtMs: baselineCreatedAtMs,
      }) satisfies BuilderAsset,
  );

  const placeholderGlb = joinUrlPath(
    appConfig.staticAssets.assetsPrefix,
    builderGeometryPlaceholderPaths.glb,
  );
  const modelAsset: BuilderAsset = {
    id: "asset.model.orbitalModel",
    kind: "model",
    label: "Orbital Station (GLB)",
    sceneMode: "3d",
    source: placeholderGlb,
    sourceFormat: "glb",
    tags: ["baseline", "environment", "3d"],
    variants: [
      {
        id: "variant.model.orbitalModel.runtime",
        format: "glb",
        source: placeholderGlb,
        usage: "runtime",
        mimeType: "model/gltf-binary",
      },
    ],
    approved: true,
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  };

  const allAssets: BuilderAsset[] = [...backgroundAssets, modelAsset];
  return toRecordFromEntries(allAssets.map((a) => [a.id, a]));
};

const buildBaselineFlags3d = (): Record<string, GameFlagDefinition> => ({
  orbitalVisited: {
    key: "orbitalVisited",
    label: "Orbital station visited",
    initialValue: false,
  },
});

const buildBaselineTriggers3d = (): Record<string, TriggerDefinition> => ({
  "trigger.enter-orbitalStation": {
    id: "trigger.enter-orbitalStation",
    label: "Enter orbital station",
    event: "scene-enter",
    sceneId: "orbitalStation",
    setFlags: {
      orbitalVisited: true,
    },
  },
});

const buildBaselineQuests3d = (): Record<string, QuestDefinition> => ({
  "quest.orbital.explore": {
    id: "quest.orbital.explore",
    title: "Explore the Station",
    description: "Navigate the orbital station and discover its layout.",
    steps: [
      {
        id: "step.enter-orbital",
        title: "Enter the orbital station",
        description: "Step into the station and begin your exploration.",
        triggerId: "trigger.enter-orbitalStation",
      },
    ],
  },
});

const createBaselineState3d = (): BuilderProjectState => {
  const scenes = toRecordFromEntries(
    Object.entries(gameScenes3d).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  );
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": Object.fromEntries(Object.entries(gameTextByLocale["en-US"].npcs)),
    "zh-CN": Object.fromEntries(Object.entries(gameTextByLocale["zh-CN"].npcs)),
  };

  return {
    brand: createStarterProjectBranding("3d-game"),
    scenes,
    dialogues,
    assets: buildBaselineAssets3d(),
    animationClips: {},
    animationTimelines: {},
    spriteAtlases: {},
    dialogueGraphs: {},
    quests: buildBaselineQuests3d(),
    triggers: buildBaselineTriggers3d(),
    flags: buildBaselineFlags3d(),
    generationJobs: {},
    artifacts: {},
    automationRuns: {},
  };
};

const createStarterProjectState = (templateId: StarterProjectTemplateId): BuilderProjectState => {
  if (templateId === "tea-house-story") {
    return createBaselineState();
  }
  if (templateId === "2d-game") {
    return createBaselineState2d();
  }
  if (templateId === "3d-game") {
    return createBaselineState3d();
  }

  return createBlankStarterState();
};

const toDraftStateInput = (state: BuilderProjectState): Prisma.InputJsonValue => {
  const {
    scenes: _scenes,
    dialogues: _dialogues,
    assets: _assets,
    animationClips: _animationClips,
    dialogueGraphs: _dialogueGraphs,
    quests: _quests,
    triggers: _triggers,
    flags: _flags,
    generationJobs: _generationJobs,
    artifacts: _artifacts,
    automationRuns: _automationRuns,
    ...draftState
  } = state;
  return safeJsonParse<Prisma.InputJsonValue>(
    JSON.stringify(draftState),
    {},
    (v): v is Prisma.InputJsonValue => true,
  );
};

const toNumberValue = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const _toVector2 = (value: unknown): { readonly x: number; readonly y: number } | null => {
  const record = asRecord(value);
  const x = toNumberValue(record.x);
  const y = toNumberValue(record.y);
  return x === null || y === null ? null : { x, y };
};

const toVector3 = (
  value: unknown,
): { readonly x: number; readonly y: number; readonly z: number } | null => {
  const record = asRecord(value);
  const x = toNumberValue(record.x);
  const y = toNumberValue(record.y);
  const z = toNumberValue(record.z);
  return x === null || y === null || z === null ? null : { x, y, z };
};

const _toSceneGeometry = (value: unknown): SceneDefinition["geometry"] | null => {
  const record = asRecord(value);
  const width = toNumberValue(record.width);
  const height = toNumberValue(record.height);
  return width === null || height === null ? null : { width, height };
};

const toNpcAiBlueprint = (value: unknown): SceneNpcDefinition["ai"] | null => {
  const record = asRecord(value);
  const wanderRadius = toNumberValue(record.wanderRadius);
  const wanderSpeed = toNumberValue(record.wanderSpeed);
  const idlePauseMs = Array.isArray(record.idlePauseMs) ? record.idlePauseMs : [];
  const idleMin = toNumberValue(idlePauseMs[0]);
  const idleMax = toNumberValue(idlePauseMs[1]);
  if (
    wanderRadius === null ||
    wanderSpeed === null ||
    idleMin === null ||
    idleMax === null ||
    typeof record.greetOnApproach !== "boolean" ||
    typeof record.greetLineKey !== "string"
  ) {
    return null;
  }
  return {
    wanderRadius,
    wanderSpeed,
    idlePauseMs: [idleMin, idleMax],
    greetOnApproach: record.greetOnApproach,
    greetLineKey: record.greetLineKey,
  };
};

const _toSceneNpcs = (value: unknown): SceneDefinition["npcs"] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const record = asRecord(item);
        const x = toNumberValue(record.x);
        const y = toNumberValue(record.y);
        const interactRadius = toNumberValue(record.interactRadius);
        const ai = toNpcAiBlueprint(record.ai);
        const dialogueKeys =
          Array.isArray(record.dialogueKeys) &&
          record.dialogueKeys.every((entry): entry is string => typeof entry === "string")
            ? [...record.dialogueKeys]
            : null;
        if (
          typeof record.characterKey !== "string" ||
          x === null ||
          y === null ||
          typeof record.labelKey !== "string" ||
          dialogueKeys === null ||
          interactRadius === null ||
          ai === null
        ) {
          return [];
        }
        return [
          {
            characterKey: record.characterKey,
            displayName:
              typeof record.displayName === "string" && record.displayName.trim().length > 0
                ? record.displayName
                : record.labelKey,
            x,
            y,
            labelKey: record.labelKey,
            dialogueKeys,
            interactRadius,
            ai,
          } satisfies SceneNpcDefinition,
        ];
      })
    : [];

const _toSceneNodes = (
  value: unknown,
  sceneMode?: SceneDefinition["sceneMode"],
): SceneDefinition["nodes"] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const nodes: SceneNodeDefinition[] = [];

  for (const item of value) {
    const record = asRecord(item);
    if (typeof record.id !== "string" || typeof record.nodeType !== "string") {
      continue;
    }

    const positionRecord = asRecord(record.position);
    const x = toNumberValue(positionRecord.x);
    const y = toNumberValue(positionRecord.y);
    const z = toNumberValue(positionRecord.z);

    const position = x !== null && y !== null ? (z !== null ? { x, y, z } : { x, y }) : null;

    const rotationRecord = asRecord(record.rotation);
    const rotX = toNumberValue(rotationRecord.x);
    const rotY = toNumberValue(rotationRecord.y);
    const rotZ = toNumberValue(rotationRecord.z);
    const rotation =
      rotX !== null && rotY !== null && rotZ !== null ? { x: rotX, y: rotY, z: rotZ } : null;

    const scaleRecord = asRecord(record.scale);
    const scaleX = toNumberValue(scaleRecord.x);
    const scaleY = toNumberValue(scaleRecord.y);
    const scaleZ = toNumberValue(scaleRecord.z);
    const scale =
      scaleX !== null && scaleY !== null && scaleZ !== null
        ? { x: scaleX, y: scaleY, z: scaleZ }
        : null;

    const isThreeDimensionalNode =
      sceneMode === "3d" || z !== null || rotation !== null || scale !== null;

    if (
      !isThreeDimensionalNode &&
      (record.nodeType === "sprite" ||
        record.nodeType === "tile" ||
        record.nodeType === "spawn" ||
        record.nodeType === "trigger" ||
        record.nodeType === "camera")
    ) {
      const sizeRecord = asRecord(record.size);
      const width = toNumberValue(sizeRecord.width);
      const height = toNumberValue(sizeRecord.height);
      if (
        position === null ||
        width === null ||
        height === null ||
        typeof record.layer !== "string"
      ) {
        continue;
      }

      nodes.push({
        id: record.id,
        nodeType: record.nodeType,
        assetId: typeof record.assetId === "string" ? record.assetId : undefined,
        animationClipId:
          typeof record.animationClipId === "string" ? record.animationClipId : undefined,
        position,
        size: { width, height },
        layer: record.layer,
      });
      continue;
    }

    if (
      record.nodeType === "model" ||
      record.nodeType === "light" ||
      record.nodeType === "camera" ||
      record.nodeType === "spawn" ||
      record.nodeType === "trigger"
    ) {
      const position = toVector3(record.position);
      const rotation = toVector3(record.rotation);
      const scale = toVector3(record.scale);
      if (position === null || rotation === null || scale === null) {
        continue;
      }

      nodes.push({
        id: record.id,
        nodeType: record.nodeType,
        assetId: typeof record.assetId === "string" ? record.assetId : undefined,
        animationClipId:
          typeof record.animationClipId === "string" ? record.animationClipId : undefined,
        position,
        rotation,
        scale,
      });
    }
  }

  return nodes;
};

const toCollisionMasks = (value: unknown): SceneDefinition["collisions"] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const record = asRecord(item);
        const x = toNumberValue(record.x);
        const y = toNumberValue(record.y);
        const width = toNumberValue(record.width);
        const height = toNumberValue(record.height);
        if (x === null || y === null || width === null || height === null) {
          return [];
        }
        return [{ x, y, width, height }];
      })
    : [];

const toParticleEmitterConfig = (value: unknown): ParticleEmitterConfig | undefined => {
  const r = asRecord(value);
  if (!r || typeof r.maxCount !== "number" || typeof r.rate !== "number") {
    return undefined;
  }
  const speed = Array.isArray(r.speed) && r.speed.length >= 2 ? [r.speed[0], r.speed[1]] : [0, 1];
  const size = Array.isArray(r.size) && r.size.length >= 2 ? [r.size[0], r.size[1]] : [4, 8];
  return {
    assetId: typeof r.assetId === "string" ? r.assetId : undefined,
    maxCount: r.maxCount,
    rate: r.rate,
    lifetimeMs: typeof r.lifetimeMs === "number" ? r.lifetimeMs : 2000,
    speed: [Number(speed[0]), Number(speed[1])],
    spread: typeof r.spread === "number" ? r.spread : Math.PI,
    size: [Number(size[0]), Number(size[1])],
    gravity: typeof r.gravity === "boolean" ? r.gravity : undefined,
  };
};

const toTilemapDefinition = (value: unknown): TilemapDefinition | undefined => {
  const r = asRecord(value);
  if (!r || !Array.isArray(r.layers) || r.layers.length === 0) {
    return undefined;
  }
  const layers = r.layers.flatMap((item: unknown) => {
    const layer = asRecord(item);
    if (
      !layer ||
      typeof layer.id !== "string" ||
      typeof layer.tileSetAssetId !== "string" ||
      typeof layer.tileWidth !== "number" ||
      typeof layer.tileHeight !== "number" ||
      !Array.isArray(layer.data)
    ) {
      return [];
    }
    return [
      {
        id: layer.id,
        tileSetAssetId: layer.tileSetAssetId,
        tileWidth: layer.tileWidth,
        tileHeight: layer.tileHeight,
        data: layer.data.map((row: unknown) =>
          Array.isArray(row) ? row.map((v) => (typeof v === "number" ? v : -1)) : [],
        ),
        collision: typeof layer.collision === "boolean" ? layer.collision : undefined,
        layer: typeof layer.layer === "string" ? layer.layer : undefined,
      },
    ];
  });
  if (layers.length === 0) {
    return undefined;
  }
  return { layers };
};

const toScenesFromRows = (
  rows: readonly BuilderProjectSceneRow[],
): Record<string, SceneDefinition> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const sceneMode =
        row.sceneMode === "2d" || row.sceneMode === "3d" ? row.sceneMode : undefined;
      const geometry: SceneDefinition["geometry"] = {
        width: row.geometryWidth,
        height: row.geometryHeight,
      };
      const spawn = { x: row.spawnX, y: row.spawnY };
      if (geometry.width <= 0 || geometry.height <= 0) {
        return [];
      }

      /** Converts relational NPC rows with flat AI columns to domain NPC definitions. */
      const npcs: SceneNpcDefinition[] = Array.isArray(row.npcs)
        ? row.npcs.flatMap((npc) => {
            const dialogueKeys = Array.isArray(npc.dialogueKeys)
              ? npc.dialogueKeys.sort((a, b) => a.ordinal - b.ordinal).map((dk) => dk.key)
              : [];
            const ai: SceneNpcDefinition["ai"] = {
              wanderRadius: npc.wanderRadius ?? 0,
              wanderSpeed: npc.wanderSpeed ?? 0,
              idlePauseMs: [
                npc.idlePauseMinMs ?? DEFAULT_NPC_IDLE_PAUSE_MS[0],
                npc.idlePauseMaxMs ?? DEFAULT_NPC_IDLE_PAUSE_MS[1],
              ],
              greetOnApproach: npc.greetOnApproach ?? false,
              greetLineKey: npc.greetLineKey ?? "",
            };
            if (typeof npc.characterKey !== "string" || typeof npc.labelKey !== "string") {
              return [];
            }
            return [
              {
                characterKey: npc.characterKey,
                displayName:
                  typeof npc.displayName === "string" && npc.displayName.trim().length > 0
                    ? npc.displayName
                    : npc.labelKey,
                x: npc.x,
                y: npc.y,
                labelKey: npc.labelKey,
                dialogueKeys,
                interactRadius: npc.interactRadius,
                ai,
              } satisfies SceneNpcDefinition,
            ];
          })
        : [];

      /** Converts relational node rows with flat position/rotation/scale columns. */
      const nodes: SceneNodeDefinition[] | undefined = Array.isArray(row.nodes)
        ? row.nodes.flatMap((node): SceneNodeDefinition[] => {
            const x = node.positionX;
            const y = node.positionY;
            const z = node.positionZ;
            if (x === null || y === null) {
              return [];
            }

            // 3D node: has z coordinate
            if (z !== null) {
              const nodeType = toSceneNode3dType(node.nodeType);
              if (!nodeType) {
                return [];
              }
              const particleEmitter =
                node.particleEmitterData != null
                  ? toParticleEmitterConfig(node.particleEmitterData)
                  : undefined;
              const node3d: SceneNode3D = {
                id: node.id,
                nodeType,
                position: { x, y, z },
                rotation: {
                  x: node.rotationX ?? 0,
                  y: node.rotationY ?? 0,
                  z: node.rotationZ ?? 0,
                },
                scale: {
                  x: node.scaleX ?? 1,
                  y: node.scaleY ?? 1,
                  z: node.scaleZ ?? 1,
                },
                ...(node.assetId ? { assetId: node.assetId } : {}),
                ...(node.animationClipId ? { animationClipId: node.animationClipId } : {}),
                ...(particleEmitter ? { particleEmitter } : {}),
              };
              return [node3d];
            }

            // 2D node: no z coordinate
            const nodeType = toSceneNode2dType(node.nodeType);
            if (!nodeType) {
              return [];
            }
            const particleEmitter =
              node.particleEmitterData != null
                ? toParticleEmitterConfig(node.particleEmitterData)
                : undefined;
            const node2d: SceneNode2D = {
              id: node.id,
              nodeType,
              position: { x, y },
              size: {
                width: node.sizeWidth ?? 0,
                height: node.sizeHeight ?? 0,
              },
              layer: node.layer ?? "foreground",
              ...(node.assetId ? { assetId: node.assetId } : {}),
              ...(node.animationClipId ? { animationClipId: node.animationClipId } : {}),
              ...(particleEmitter ? { particleEmitter } : {}),
            };
            return [node2d];
          })
        : undefined;

      const tilemap = row.tilemapData != null ? toTilemapDefinition(row.tilemapData) : undefined;

      return [
        [
          row.id,
          {
            id: row.id,
            sceneMode,
            displayTitle:
              typeof row.displayTitle === "string" && row.displayTitle.trim().length > 0
                ? row.displayTitle
                : row.titleKey,
            titleKey: row.titleKey,
            background: row.background,
            geometry,
            spawn,
            npcs,
            nodes,
            ...(tilemap ? { tilemap } : {}),
            collisions: toCollisionMasks(row.collisions),
          } satisfies SceneDefinition,
        ],
      ];
    }),
  );

const toDialoguesFromRows = (
  rows: readonly BuilderProjectDialogueEntryRow[],
): BuilderProjectState["dialogues"] => {
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": {},
    "zh-CN": {},
  };

  for (const row of rows) {
    const locale = normalizeBuilderLocale(row.locale);
    dialogues[locale][row.key] = row.text;
  }

  return dialogues;
};

const withDraftContent = (
  state: BuilderProjectState,
  scenes: Record<string, SceneDefinition>,
  dialogues: BuilderProjectState["dialogues"],
): BuilderProjectState => ({
  ...state,
  scenes,
  dialogues,
});

const toAssetVariantArray = (value: unknown): readonly AssetVariant[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        if (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.format === "string" &&
          typeof item.source === "string" &&
          typeof item.usage === "string"
        ) {
          return [
            {
              id: item.id,
              format: item.format,
              source: item.source,
              usage: item.usage,
            } satisfies AssetVariant,
          ];
        }

        return [];
      })
    : [];

const toBuilderAssetsFromRows = (
  rows: readonly BuilderProjectAssetRow[],
): Record<string, BuilderAsset> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const kind = toBuilderAssetKind(row.kind);
      const sceneMode = toSceneMode(row.sceneMode);
      if (!kind || !sceneMode) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            kind,
            label: row.label,
            sceneMode,
            source: row.source,
            sourceFormat: row.sourceFormat,
            sourceMimeType: row.sourceMimeType ?? undefined,
            tags: row.tags.map((t) => t.value),
            variants: toAssetVariantArray(row.variants),
            approved: row.approved,
            createdAtMs: row.createdAt.getTime(),
            updatedAtMs: row.updatedAt.getTime(),
          } satisfies BuilderAsset,
        ],
      ];
    }),
  );

const toAnimationClipsFromRows = (
  rows: readonly BuilderProjectAnimationClipRow[],
): Record<string, AnimationClip> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const sceneMode = toSceneMode(row.sceneMode);
      if (!sceneMode) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            assetId: row.assetId,
            label: row.label,
            sceneMode,
            stateTag: row.stateTag,
            playbackFps: row.playbackFps,
            startFrame: row.startFrame,
            frameCount: row.frameCount,
            loop: row.loop,
            direction:
              row.direction === "up" ||
              row.direction === "down" ||
              row.direction === "left" ||
              row.direction === "right"
                ? row.direction
                : undefined,
            createdAtMs: row.createdAt.getTime(),
            updatedAtMs: row.updatedAt.getTime(),
          } satisfies AnimationClip,
        ],
      ];
    }),
  );

/**
 * Converts animation timeline rows (with nested track rows) into domain-level AnimationTimeline records.
 * Track keyframes are stored as JSON strings in the database and parsed here.
 */
const toAnimationTimelinesFromRows = (
  rows: readonly BuilderProjectAnimationTimelineRow[],
): Record<string, AnimationTimeline> =>
  toRecordFromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        assetId: row.assetId,
        label: row.label,
        stateTag: row.stateTag,
        sceneMode: row.sceneMode === "2d" || row.sceneMode === "3d" ? row.sceneMode : "2d",
        durationMs: row.durationMs,
        loop: row.loop,
        tracks: row.tracks.map((track: { id: string; property: string; keyframes: string }) => ({
          id: track.id,
          property: track.property,
          keyframes: parseTrackKeyframes(track.keyframes),
        })),
        createdAtMs: row.createdAt.getTime(),
        updatedAtMs: row.updatedAt.getTime(),
      } satisfies AnimationTimeline,
    ]),
  );

/**
 * Converts sprite-atlas rows into domain-level SpriteAtlasManifest records.
 * Frame arrays are stored as JSON strings in the database and parsed here.
 */
const toSpriteAtlasFromRows = (
  rows: readonly BuilderProjectSpriteAtlasRow[],
): Record<string, SpriteAtlasManifest> =>
  toRecordFromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        imagePath: row.imagePath,
        atlasWidth: row.atlasWidth,
        atlasHeight: row.atlasHeight,
        frames: parseSpriteAtlasFrames(row.frames),
        createdAtMs: row.createdAt.getTime(),
      } satisfies SpriteAtlasManifest,
    ]),
  );

/**
 * Parses a JSON-serialized sprite atlas frame array string into typed SpriteAtlasFrame[].
 * Returns an empty array on malformed input.
 */
const parseSpriteAtlasFrames = (raw: string): SpriteAtlasManifest["frames"] => {
  const parsed = safeJsonParse<unknown[]>(raw, [], (v): v is unknown[] => Array.isArray(v));
  return parsed.filter((f): f is SpriteAtlasManifest["frames"][number] => {
    if (typeof f !== "object" || f === null) return false;
    const r = asRecord(f);
    return (
      typeof r.name === "string" &&
      typeof r.x === "number" &&
      typeof r.y === "number" &&
      typeof r.width === "number" &&
      typeof r.height === "number"
    );
  });
};

const isAnimationEasing = (value: string): value is AnimationKeyframe["easing"] =>
  value === "linear" || value === "easeIn" || value === "easeOut" || value === "easeInOut";

/**
 * Parses a JSON-serialized keyframe array string into typed AnimationKeyframe[].
 * Returns an empty array on malformed input.
 */
const parseTrackKeyframes = (raw: string): AnimationTimeline["tracks"][number]["keyframes"] => {
  const parsed = safeJsonParse<unknown[]>(raw, [], (v): v is unknown[] => Array.isArray(v));
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.flatMap((item: unknown) => {
    if (item === null || typeof item !== "object") {
      return [];
    }

    const itemRecord = asRecord(item);
    if (
      typeof itemRecord.id !== "string" ||
      typeof itemRecord.timeMs !== "number" ||
      typeof itemRecord.value !== "number" ||
      typeof itemRecord.easing !== "string"
    ) {
      return [];
    }

    const kf = {
      id: itemRecord.id,
      timeMs: itemRecord.timeMs,
      value: itemRecord.value,
      easing: itemRecord.easing,
    };

    if (!isAnimationEasing(kf.easing)) {
      return [];
    }

    return [
      {
        id: kf.id,
        timeMs: kf.timeMs,
        value: kf.value,
        easing: kf.easing,
      } satisfies AnimationKeyframe,
    ];
  });
};
const withDraftMedia = (
  state: BuilderProjectState,
  assets: Record<string, BuilderAsset>,
  animationClips: Record<string, AnimationClip>,
  animationTimelines: Record<string, AnimationTimeline>,
): BuilderProjectState => ({
  ...state,
  assets,
  animationClips,
  animationTimelines,
});

const toDialogueGraphNodes = (value: unknown): DialogueGraph["nodes"] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        if (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.line === "string" &&
          Array.isArray(item.edges)
        ) {
          return [
            {
              id: item.id,
              line: item.line,
              edges: item.edges.flatMap((edge: unknown) => {
                const edgeRecord = edge && typeof edge === "object" ? asRecord(edge) : null;

                if (!edgeRecord) {
                  return [];
                }

                const toId = edgeRecord.toNodeId ?? edgeRecord.to;
                if (
                  typeof toId === "string" &&
                  (edgeRecord.requiredFlag === undefined ||
                    edgeRecord.requiredFlag === null ||
                    typeof edgeRecord.requiredFlag === "string") &&
                  (edgeRecord.advanceQuestStepId === undefined ||
                    edgeRecord.advanceQuestStepId === null ||
                    typeof edgeRecord.advanceQuestStepId === "string")
                ) {
                  return [
                    {
                      to: toId,
                      requiredFlag: edgeRecord.requiredFlag || undefined,
                      advanceQuestStepId: edgeRecord.advanceQuestStepId || undefined,
                    },
                  ];
                }

                return [];
              }),
            },
          ];
        }

        return [];
      })
    : [];

const toDialogueGraphsFromRows = (
  rows: readonly BuilderProjectDialogueGraphRow[],
): Record<string, DialogueGraph> =>
  toRecordFromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        title: row.title,
        npcId: row.npcId ?? undefined,
        rootNodeId: row.rootNodeId,
        nodes: toDialogueGraphNodes(row.nodes),
        createdAtMs: row.createdAt.getTime(),
        updatedAtMs: row.updatedAt.getTime(),
      } satisfies DialogueGraph,
    ]),
  );

const toQuestSteps = (value: unknown): QuestDefinition["steps"] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        if (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.description === "string" &&
          typeof item.triggerId === "string"
        ) {
          return [
            {
              id: item.id,
              title: item.title,
              description: item.description,
              triggerId: item.triggerId,
            },
          ];
        }

        return [];
      })
    : [];

const toQuestsFromRows = (
  rows: readonly BuilderProjectQuestRow[],
): Record<string, QuestDefinition> =>
  toRecordFromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        title: row.title,
        description: row.description,
        steps: toQuestSteps(row.steps),
      } satisfies QuestDefinition,
    ]),
  );

const toFlagValueRecord = (
  value: unknown,
): Readonly<Record<string, string | number | boolean>> | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const record = value
      .filter(
        (item): item is Record<string, unknown> =>
          item &&
          typeof item === "object" &&
          typeof item.key === "string" &&
          typeof item.valueType === "string",
      )
      .map((item) => {
        const val =
          item.valueType === "boolean"
            ? Boolean(item.boolValue)
            : item.valueType === "number"
              ? Number(item.numberValue)
              : String(item.stringValue ?? "");
        return [item.key, val];
      });
    return record.length > 0 ? Object.fromEntries(record) : undefined;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  const record = Object.entries(value).filter(
    (entry): entry is [string, string | number | boolean] =>
      typeof entry[0] === "string" &&
      (typeof entry[1] === "string" ||
        typeof entry[1] === "number" ||
        typeof entry[1] === "boolean"),
  );

  return record.length > 0 ? Object.fromEntries(record) : undefined;
};

const toTriggersFromRows = (
  rows: readonly BuilderProjectTriggerRow[],
): Record<string, TriggerDefinition> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const event = row.event;
      if (
        event !== "scene-enter" &&
        event !== "npc-interact" &&
        event !== "chat" &&
        event !== "dialogue-confirmed"
      ) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            label: row.label,
            event,
            sceneId: row.sceneId ?? undefined,
            npcId: row.npcId ?? undefined,
            nodeId: row.nodeId ?? undefined,
            requiredFlags: toFlagValueRecord(row.requiredFlags),
            setFlags: toFlagValueRecord(row.setFlags),
            questId: row.questId ?? undefined,
            questStepId: row.questStepId ?? undefined,
          } satisfies TriggerDefinition,
        ],
      ];
    }),
  );

const toFlagsFromRows = (
  rows: readonly BuilderProjectFlagRow[],
): Record<string, GameFlagDefinition> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const initialValue =
        row.valueType === "boolean"
          ? row.boolValue
          : row.valueType === "number"
            ? row.numberValue
            : row.stringValue;
      if (
        typeof initialValue !== "string" &&
        typeof initialValue !== "number" &&
        typeof initialValue !== "boolean"
      ) {
        return [];
      }

      return [
        [
          row.key,
          {
            key: row.key,
            label: row.label,
            initialValue,
          } satisfies GameFlagDefinition,
        ],
      ];
    }),
  );

const withDraftMechanics = (
  state: BuilderProjectState,
  dialogueGraphs: Record<string, DialogueGraph>,
  quests: Record<string, QuestDefinition>,
  triggers: Record<string, TriggerDefinition>,
  flags: Record<string, GameFlagDefinition>,
): BuilderProjectState => ({
  ...state,
  dialogueGraphs,
  quests,
  triggers,
  flags,
});

const toGenerationJobsFromRows = (
  rows: readonly BuilderProjectGenerationJobRow[],
): Record<string, GenerationJob> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const kind = toGenerationJobKind(row.kind);
      const status = toGenerationJobStatus(row.status);
      if (!kind || !status) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            kind,
            status,
            prompt: row.prompt,
            targetId: row.targetId ?? undefined,
            artifactIds: row.artifacts.map((a) => a.artifactId),
            statusMessage: row.statusMessage,
            createdAtMs: row.createdAt.getTime(),
            updatedAtMs: row.updatedAt.getTime(),
          } satisfies GenerationJob,
        ],
      ];
    }),
  );

const toGenerationArtifactsFromRows = (
  rows: readonly BuilderProjectArtifactRow[],
): Record<string, GenerationArtifact> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const kind = toGenerationArtifactKind(row.kind);
      if (!kind) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            jobId: row.jobId,
            kind,
            label: row.label,
            previewSource: row.previewSource,
            summary: row.summary,
            mimeType: row.mimeType ?? undefined,
            metadata:
              typeof row.generationSource === "string"
                ? {
                    source: row.generationSource === "placeholder" ? "placeholder" : "ai",
                    reason: row.generationReason ?? undefined,
                  }
                : undefined,
            approved: row.approved,
            createdAtMs: row.createdAt.getTime(),
          } satisfies GenerationArtifact,
        ],
      ];
    }),
  );

const toStringRecord = (value: unknown): Readonly<Record<string, string>> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value);
  if (!entries.every(([, entryValue]) => typeof entryValue === "string")) {
    return null;
  }

  return toRecordFromEntries(entries);
};

const parseAutomationStepSpecValue = (value: unknown): AutomationStepSpec | undefined => {
  const record = asRecord(value);
  const kind = toStringValue(record.kind);
  if (!kind) {
    return undefined;
  }

  switch (kind) {
    case "goto": {
      const path = toStringValue(record.path);
      return path?.startsWith("/") ? { kind, path } : undefined;
    }
    case "click": {
      const role = toStringValue(record.role);
      const name = toStringValue(record.name);
      return role &&
        name &&
        (role === "button" ||
          role === "link" ||
          role === "tab" ||
          role === "checkbox" ||
          role === "radio" ||
          role === "textbox")
        ? { kind, role, name }
        : undefined;
    }
    case "fill": {
      const role = toStringValue(record.role);
      const name = toStringValue(record.name);
      const valueText = toStringValue(record.value);
      return role &&
        name &&
        valueText &&
        (role === "textbox" || role === "searchbox" || role === "combobox")
        ? { kind, role, name, value: valueText }
        : undefined;
    }
    case "assert-text": {
      const text = toStringValue(record.text);
      return text ? { kind, text } : undefined;
    }
    case "screenshot": {
      const fileStem = toStringValue(record.fileStem);
      const fullPage = toBooleanValue(record.fullPage);
      return fileStem
        ? {
            kind,
            fileStem,
            ...(fullPage === null ? {} : { fullPage }),
          }
        : undefined;
    }
    case "request": {
      const method = toStringValue(record.method);
      const path = toStringValue(record.path);
      const form = record.form === undefined ? undefined : toStringRecord(record.form);
      const expectedStatusValue =
        record.expectedStatus === undefined ? undefined : toNumberValue(record.expectedStatus);
      const expectedStatus = expectedStatusValue === null ? undefined : expectedStatusValue;
      const responseFileStem = toStringValue(record.responseFileStem) ?? undefined;
      return (method === "GET" || method === "POST") &&
        path &&
        path.startsWith("/") &&
        form !== null &&
        (expectedStatus === undefined || Number.isInteger(expectedStatus))
        ? {
            kind,
            method,
            path,
            ...(form ? { form } : {}),
            ...(expectedStatus === undefined ? {} : { expectedStatus }),
            ...(responseFileStem ? { responseFileStem } : {}),
          }
        : undefined;
    }
    case "create-scene": {
      const id = toStringValue(record.id);
      const titleKey = toStringValue(record.titleKey);
      const background = toStringValue(record.background);
      const sceneMode = toSceneMode(toStringValue(record.sceneMode) ?? "");
      return id && titleKey && background && sceneMode
        ? { kind, id, titleKey, background, sceneMode }
        : undefined;
    }
    case "create-trigger": {
      const id = toStringValue(record.id);
      const label = toStringValue(record.label);
      const event = toStringValue(record.event);
      return id &&
        label &&
        event &&
        (event === "scene-enter" ||
          event === "npc-interact" ||
          event === "chat" ||
          event === "dialogue-confirmed" ||
          event === "combat-victory" ||
          event === "item-acquired" ||
          event === "cutscene-completed")
        ? {
            kind,
            id,
            label,
            event,
            sceneId: toStringValue(record.sceneId) ?? undefined,
            npcId: toStringValue(record.npcId) ?? undefined,
          }
        : undefined;
    }
    case "create-quest": {
      const id = toStringValue(record.id);
      const title = toStringValue(record.title);
      const description = toStringValue(record.description);
      const triggerId = toStringValue(record.triggerId);
      return id && title && description && triggerId
        ? { kind, id, title, description, triggerId }
        : undefined;
    }
    case "create-dialogue-graph": {
      const id = toStringValue(record.id);
      const title = toStringValue(record.title);
      const line = toStringValue(record.line);
      return id && title && line
        ? {
            kind,
            id,
            title,
            line,
            npcId: toStringValue(record.npcId) ?? undefined,
          }
        : undefined;
    }
    case "create-asset": {
      const id = toStringValue(record.id);
      const label = toStringValue(record.label);
      const assetKind = toBuilderAssetKind(toStringValue(record.assetKind) ?? "");
      const sceneMode = toSceneMode(toStringValue(record.sceneMode) ?? "");
      const source = toStringValue(record.source);
      return id && label && assetKind && sceneMode && source
        ? { kind, id, label, assetKind, sceneMode, source }
        : undefined;
    }
    case "create-animation-clip": {
      const id = toStringValue(record.id);
      const assetId = toStringValue(record.assetId);
      const stateTag = toStringValue(record.stateTag);
      const playbackFpsValue =
        record.playbackFps === undefined ? undefined : toNumberValue(record.playbackFps);
      const frameCountValue =
        record.frameCount === undefined ? undefined : toNumberValue(record.frameCount);
      const playbackFps = playbackFpsValue === null ? undefined : playbackFpsValue;
      const frameCount = frameCountValue === null ? undefined : frameCountValue;
      return id &&
        assetId &&
        stateTag &&
        (playbackFps === undefined || Number.isInteger(playbackFps)) &&
        (frameCount === undefined || Number.isInteger(frameCount))
        ? {
            kind,
            id,
            assetId,
            stateTag,
            ...(playbackFps === undefined ? {} : { playbackFps }),
            ...(frameCount === undefined ? {} : { frameCount }),
          }
        : undefined;
    }
    case "queue-generation-job": {
      const jobKind = toGenerationJobKind(toStringValue(record.jobKind) ?? "");
      const prompt = toStringValue(record.prompt);
      return jobKind && prompt
        ? {
            kind,
            jobKind,
            prompt,
            targetId: toStringValue(record.targetId) ?? undefined,
          }
        : undefined;
    }
    case "attach-generated-artifact": {
      const sourceStepId = toStringValue(record.sourceStepId);
      return sourceStepId ? { kind, sourceStepId } : undefined;
    }
    default:
      return undefined;
  }
};

const parseAutomationStepSpec = (raw: string | null): AutomationStepSpec | undefined =>
  raw ? parseAutomationStepSpecValue(safeJsonParse<unknown>(raw, null, acceptUnknown)) : undefined;

const toAutomationRunsFromRows = (
  rows: readonly BuilderProjectAutomationRunRow[],
): Record<string, AutomationRun> =>
  toRecordFromEntries(
    rows.flatMap((row) => {
      const status = toAutomationRunStatus(row.status);
      if (!status) {
        return [];
      }

      const steps = row.steps.flatMap((step) => {
        const action = toAutomationStepAction(step.action);
        const stepStatus = toAutomationStepStatus(step.status);
        if (!action || !stepStatus) {
          return [];
        }

        return [
          {
            id: step.id,
            action,
            summary: step.summary,
            status: stepStatus,
            spec: parseAutomationStepSpec(step.specJson ?? null),
            evidenceSource: step.evidenceSource ?? undefined,
          } satisfies AutomationRunStep,
        ];
      });

      return [
        [
          row.id,
          {
            id: row.id,
            status,
            goal: row.goal,
            steps,
            artifactIds: row.artifacts.map((artifact) => artifact.artifactId),
            statusMessage: row.statusMessage,
            createdAtMs: row.createdAt.getTime(),
            updatedAtMs: row.updatedAt.getTime(),
          } satisfies AutomationRun,
        ],
      ];
    }),
  );

const withDraftWorkerState = (
  state: BuilderProjectState,
  generationJobs: Record<string, GenerationJob>,
  artifacts: Record<string, GenerationArtifact>,
  automationRuns: Record<string, AutomationRun>,
): BuilderProjectState => ({
  ...state,
  generationJobs,
  artifacts,
  automationRuns,
});

const normalizeBuilderAsset = (asset: BuilderAsset): BuilderAsset => {
  const sourceFormat =
    asset.sourceFormat?.trim().length > 0
      ? asset.sourceFormat
      : (asset.source.split(".").pop()?.trim().toLowerCase() ?? "dat");
  const sourceMimeType =
    asset.sourceMimeType ??
    asset.variants.find((variant) => typeof variant.mimeType === "string")?.mimeType;

  return {
    ...asset,
    sourceFormat,
    sourceMimeType,
    variants: asset.variants.map((variant) => ({
      ...variant,
      mimeType: variant.mimeType ?? sourceMimeType,
    })),
  };
};

const parseSceneDefinitionRecord = (sceneId: string, value: unknown): SceneDefinition | null => {
  const record = asRecord(value);
  const titleKey = toStringValue(record.titleKey);
  const background = toStringValue(record.background);
  const geometry = _toSceneGeometry(record.geometry);
  const spawn = _toVector2(record.spawn);
  if (!titleKey || !background || !geometry || !spawn) {
    return null;
  }

  const sceneMode =
    typeof record.sceneMode === "string" ? (toSceneMode(record.sceneMode) ?? undefined) : undefined;

  return {
    id: sceneId,
    sceneMode,
    displayTitle:
      typeof record.displayTitle === "string" && record.displayTitle.trim().length > 0
        ? record.displayTitle
        : titleKey,
    titleKey,
    background,
    geometry,
    spawn,
    npcs: _toSceneNpcs(record.npcs),
    nodes: _toSceneNodes(record.nodes, sceneMode),
    collisions: toCollisionMasks(record.collisions),
  };
};

const parseBuilderAssetRecord = (assetId: string, value: unknown): BuilderAsset | null => {
  const record = asRecord(value);
  const kind = toBuilderAssetKind(toStringValue(record.kind) ?? "");
  const label = toStringValue(record.label);
  const sceneMode = toSceneMode(toStringValue(record.sceneMode) ?? "");
  const source = toStringValue(record.source);
  const sourceFormat = toStringValue(record.sourceFormat);
  const approved = toBooleanValue(record.approved);
  const createdAtMs = toNumberValue(record.createdAtMs);
  const updatedAtMs = toNumberValue(record.updatedAtMs);
  const tags =
    Array.isArray(record.tags) && record.tags.every((entry) => typeof entry === "string")
      ? [...record.tags]
      : null;

  if (
    !kind ||
    !label ||
    !sceneMode ||
    !source ||
    !sourceFormat ||
    approved === null ||
    createdAtMs === null ||
    updatedAtMs === null ||
    tags === null
  ) {
    return null;
  }

  return normalizeBuilderAsset({
    id: assetId,
    kind,
    label,
    sceneMode,
    source,
    sourceFormat,
    sourceMimeType: toStringValue(record.sourceMimeType) ?? undefined,
    tags,
    variants: toAssetVariantArray(record.variants),
    approved,
    createdAtMs,
    updatedAtMs,
  });
};

const parseAnimationClipRecord = (clipId: string, value: unknown): AnimationClip | null => {
  const record = asRecord(value);
  const assetId = toStringValue(record.assetId);
  const label = toStringValue(record.label);
  const sceneMode = toSceneMode(toStringValue(record.sceneMode) ?? "");
  const stateTag = toStringValue(record.stateTag);
  const playbackFps = toNumberValue(record.playbackFps);
  const startFrame = toNumberValue(record.startFrame);
  const frameCount = toNumberValue(record.frameCount);
  const loop = toBooleanValue(record.loop);
  const createdAtMs = toNumberValue(record.createdAtMs);
  const updatedAtMs = toNumberValue(record.updatedAtMs);
  const direction = toStringValue(record.direction);

  if (
    !assetId ||
    !label ||
    !sceneMode ||
    !stateTag ||
    playbackFps === null ||
    startFrame === null ||
    frameCount === null ||
    loop === null ||
    createdAtMs === null ||
    updatedAtMs === null
  ) {
    return null;
  }

  return {
    id: clipId,
    assetId,
    label,
    sceneMode,
    stateTag,
    playbackFps,
    startFrame,
    frameCount,
    loop,
    direction:
      direction === "up" || direction === "down" || direction === "left" || direction === "right"
        ? direction
        : undefined,
    createdAtMs,
    updatedAtMs,
  };
};

const parseDialogueGraphRecord = (graphId: string, value: unknown): DialogueGraph | null => {
  const record = asRecord(value);
  const title = toStringValue(record.title);
  const rootNodeId = toStringValue(record.rootNodeId);
  const createdAtMs = toNumberValue(record.createdAtMs);
  const updatedAtMs = toNumberValue(record.updatedAtMs);
  if (!title || !rootNodeId || createdAtMs === null || updatedAtMs === null) {
    return null;
  }

  return {
    id: graphId,
    title,
    npcId: toStringValue(record.npcId) ?? undefined,
    rootNodeId,
    nodes: toDialogueGraphNodes(record.nodes),
    createdAtMs,
    updatedAtMs,
  };
};

const parseQuestRecord = (questId: string, value: unknown): QuestDefinition | null => {
  const record = asRecord(value);
  const title = toStringValue(record.title);
  const description = toStringValue(record.description);
  if (!title || !description) {
    return null;
  }

  return {
    id: questId,
    title,
    description,
    steps: toQuestSteps(record.steps),
  };
};

const parseTriggerRecord = (triggerId: string, value: unknown): TriggerDefinition | null => {
  const record = asRecord(value);
  const label = toStringValue(record.label);
  const event = toStringValue(record.event);
  if (
    !label ||
    (event !== "scene-enter" &&
      event !== "npc-interact" &&
      event !== "chat" &&
      event !== "dialogue-confirmed" &&
      event !== "combat-victory" &&
      event !== "item-acquired" &&
      event !== "cutscene-completed")
  ) {
    return null;
  }

  return {
    id: triggerId,
    label,
    event,
    sceneId: toStringValue(record.sceneId) ?? undefined,
    npcId: toStringValue(record.npcId) ?? undefined,
    nodeId: toStringValue(record.nodeId) ?? undefined,
    cutsceneId: toStringValue(record.cutsceneId) ?? undefined,
    requiredFlags: toFlagValueRecord(record.requiredFlags),
    setFlags: toFlagValueRecord(record.setFlags),
    questId: toStringValue(record.questId) ?? undefined,
    questStepId: toStringValue(record.questStepId) ?? undefined,
  };
};

const parseFlagRecord = (flagKey: string, value: unknown): GameFlagDefinition | null => {
  const record = asRecord(value);
  const label = toStringValue(record.label);
  const initialValue = record.initialValue;
  if (
    !label ||
    (typeof initialValue !== "string" &&
      typeof initialValue !== "number" &&
      typeof initialValue !== "boolean")
  ) {
    return null;
  }

  return {
    key: flagKey,
    label,
    initialValue,
  };
};

const parseGenerationJobRecord = (jobId: string, value: unknown): GenerationJob | null => {
  const record = asRecord(value);
  const kind = toGenerationJobKind(toStringValue(record.kind) ?? "");
  const status = toGenerationJobStatus(toStringValue(record.status) ?? "");
  const prompt = toStringValue(record.prompt);
  const statusMessage = toStringValue(record.statusMessage);
  const createdAtMs = toNumberValue(record.createdAtMs);
  const updatedAtMs = toNumberValue(record.updatedAtMs);
  const artifactIds =
    Array.isArray(record.artifactIds) &&
    record.artifactIds.every((entry) => typeof entry === "string")
      ? [...record.artifactIds]
      : null;
  if (
    !kind ||
    !status ||
    !prompt ||
    !statusMessage ||
    createdAtMs === null ||
    updatedAtMs === null ||
    artifactIds === null
  ) {
    return null;
  }

  return {
    id: jobId,
    kind,
    status,
    prompt,
    targetId: toStringValue(record.targetId) ?? undefined,
    artifactIds,
    statusMessage,
    createdAtMs,
    updatedAtMs,
  };
};

const parseGenerationArtifactRecord = (
  artifactId: string,
  value: unknown,
): GenerationArtifact | null => {
  const record = asRecord(value);
  const jobId = toStringValue(record.jobId);
  const kind = toGenerationArtifactKind(toStringValue(record.kind) ?? "");
  const label = toStringValue(record.label);
  const previewSource = toStringValue(record.previewSource);
  const summary = toStringValue(record.summary);
  const approved = toBooleanValue(record.approved);
  const createdAtMs = toNumberValue(record.createdAtMs);
  if (
    !jobId ||
    !kind ||
    !label ||
    !previewSource ||
    !summary ||
    approved === null ||
    createdAtMs === null
  ) {
    return null;
  }

  return {
    id: artifactId,
    jobId,
    kind,
    label,
    previewSource,
    summary,
    mimeType: toStringValue(record.mimeType) ?? undefined,
    metadata:
      toStringValue(asRecord(record.metadata).source) === "placeholder" ||
      toStringValue(asRecord(record.metadata).source) === "ai"
        ? {
            source: toStringValue(asRecord(record.metadata).source) as "ai" | "placeholder",
            reason: toStringValue(asRecord(record.metadata).reason) ?? undefined,
          }
        : undefined,
    approved,
    createdAtMs,
  };
};

const parseAutomationRunRecord = (runId: string, value: unknown): AutomationRun | null => {
  const record = asRecord(value);
  const goal = toStringValue(record.goal);
  const status = toAutomationRunStatus(toStringValue(record.status) ?? "");
  const statusMessage = toStringValue(record.statusMessage);
  const createdAtMs = toNumberValue(record.createdAtMs);
  const updatedAtMs = toNumberValue(record.updatedAtMs);
  const artifactIds =
    Array.isArray(record.artifactIds) &&
    record.artifactIds.every((entry) => typeof entry === "string")
      ? [...record.artifactIds]
      : null;
  const stepRecords = Array.isArray(record.steps) ? record.steps : null;
  if (
    !goal ||
    !status ||
    !statusMessage ||
    createdAtMs === null ||
    updatedAtMs === null ||
    artifactIds === null ||
    stepRecords === null
  ) {
    return null;
  }

  const steps = stepRecords.flatMap((stepValue) => {
    const stepRecord = asRecord(stepValue);
    const id = toStringValue(stepRecord.id);
    const action = toAutomationStepAction(toStringValue(stepRecord.action) ?? "");
    const summary = toStringValue(stepRecord.summary);
    const stepStatus = toAutomationStepStatus(toStringValue(stepRecord.status) ?? "");
    if (!id || !action || !summary || !stepStatus) {
      return [];
    }

    return [
      {
        id,
        action,
        summary,
        status: stepStatus,
        spec: parseAutomationStepSpecValue(stepRecord.spec),
        evidenceSource: toStringValue(stepRecord.evidenceSource) ?? undefined,
      } satisfies AutomationRunStep,
    ];
  });

  return {
    id: runId,
    status,
    goal,
    steps,
    artifactIds,
    statusMessage,
    createdAtMs,
    updatedAtMs,
  };
};

const parseProjectState = (state: Prisma.JsonValue): BuilderProjectState => {
  const parsed = safeJsonParse<unknown>(JSON.stringify(state), {}, acceptUnknown);
  const record = asRecord(parsed);
  const brandRecord = asRecord(record.brand);
  const scenesRecord = asRecord(record.scenes);
  const dialoguesRecord = asRecord(record.dialogues);
  const assetsRecord = asRecord(record.assets);
  const animationClipsRecord = asRecord(record.animationClips);
  const dialogueGraphsRecord = asRecord(record.dialogueGraphs);
  const questsRecord = asRecord(record.quests);
  const triggersRecord = asRecord(record.triggers);
  const flagsRecord = asRecord(record.flags);
  const generationJobsRecord = asRecord(record.generationJobs);
  const artifactsRecord = asRecord(record.artifacts);
  const automationRunsRecord = asRecord(record.automationRuns);

  const scenes = toRecordFromEntries(
    Object.entries(scenesRecord).flatMap(([sceneId, scene]) => {
      if (sceneId.length === 0) {
        return [];
      }
      const parsedScene = parseSceneDefinitionRecord(sceneId, scene);
      return parsedScene ? [[sceneId, parsedScene]] : [];
    }),
  );

  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": {},
    "zh-CN": {},
  };
  for (const locale of supportedLocales) {
    const localeCatalog = asRecord(dialoguesRecord[locale]);
    dialogues[locale] = Object.fromEntries(
      Object.entries(localeCatalog).filter(
        (entry): entry is [string, string] => entry[0].length > 0 && typeof entry[1] === "string",
      ),
    );
  }

  return {
    brand: normalizeProjectBranding(
      {
        appName: toStringValue(brandRecord.appName) ?? undefined,
        appSubtitle: toStringValue(brandRecord.appSubtitle) ?? undefined,
        logoMark: toStringValue(brandRecord.logoMark) ?? undefined,
        logoImagePath: toStringValue(brandRecord.logoImagePath) ?? undefined,
        builderShellName: toStringValue(brandRecord.builderShellName) ?? undefined,
        builderShellDescription: toStringValue(brandRecord.builderShellDescription) ?? undefined,
        playerShellName: toStringValue(brandRecord.playerShellName) ?? undefined,
        surfaceTheme: toStringValue(brandRecord.surfaceTheme) ?? undefined,
        headingFont: toStringValue(brandRecord.headingFont) ?? undefined,
        bodyFont: toStringValue(brandRecord.bodyFont) ?? undefined,
        monoFont: toStringValue(brandRecord.monoFont) ?? undefined,
        primaryColor: toStringValue(brandRecord.primaryColor) ?? undefined,
        secondaryColor: toStringValue(brandRecord.secondaryColor) ?? undefined,
        accentColor: toStringValue(brandRecord.accentColor) ?? undefined,
        neutralColor: toStringValue(brandRecord.neutralColor) ?? undefined,
        base100Color: toStringValue(brandRecord.base100Color) ?? undefined,
        baseContentColor: toStringValue(brandRecord.baseContentColor) ?? undefined,
      },
      createStarterProjectBranding("blank"),
    ),
    scenes,
    dialogues,
    assets: toRecordFromEntries(
      Object.entries(assetsRecord).flatMap(([assetId, asset]) => {
        if (assetId.length === 0) {
          return [];
        }
        const parsedAsset = parseBuilderAssetRecord(assetId, asset);
        return parsedAsset ? [[assetId, parsedAsset]] : [];
      }),
    ),
    animationClips: toRecordFromEntries(
      Object.entries(animationClipsRecord).flatMap(([clipId, clip]) => {
        if (clipId.length === 0) {
          return [];
        }
        const parsedClip = parseAnimationClipRecord(clipId, clip);
        return parsedClip ? [[clipId, parsedClip]] : [];
      }),
    ),
    animationTimelines: {},
    spriteAtlases: {},
    dialogueGraphs: toRecordFromEntries(
      Object.entries(dialogueGraphsRecord).flatMap(([graphId, graph]) => {
        if (graphId.length === 0) {
          return [];
        }
        const parsedGraph = parseDialogueGraphRecord(graphId, graph);
        return parsedGraph ? [[graphId, parsedGraph]] : [];
      }),
    ),
    quests: toRecordFromEntries(
      Object.entries(questsRecord).flatMap(([questId, quest]) => {
        if (questId.length === 0) {
          return [];
        }
        const parsedQuest = parseQuestRecord(questId, quest);
        return parsedQuest ? [[questId, parsedQuest]] : [];
      }),
    ),
    triggers: toRecordFromEntries(
      Object.entries(triggersRecord).flatMap(([triggerId, trigger]) => {
        if (triggerId.length === 0) {
          return [];
        }
        const parsedTrigger = parseTriggerRecord(triggerId, trigger);
        return parsedTrigger ? [[triggerId, parsedTrigger]] : [];
      }),
    ),
    flags: toRecordFromEntries(
      Object.entries(flagsRecord).flatMap(([flagKey, flag]) => {
        if (flagKey.length === 0) {
          return [];
        }
        const parsedFlag = parseFlagRecord(flagKey, flag);
        return parsedFlag ? [[flagKey, parsedFlag]] : [];
      }),
    ),
    generationJobs: toRecordFromEntries(
      Object.entries(generationJobsRecord).flatMap(([jobId, job]) => {
        if (jobId.length === 0) {
          return [];
        }
        const parsedJob = parseGenerationJobRecord(jobId, job);
        return parsedJob ? [[jobId, parsedJob]] : [];
      }),
    ),
    artifacts: toRecordFromEntries(
      Object.entries(artifactsRecord).flatMap(([artifactId, artifact]) => {
        if (artifactId.length === 0) {
          return [];
        }
        const parsedArtifact = parseGenerationArtifactRecord(artifactId, artifact);
        return parsedArtifact ? [[artifactId, parsedArtifact]] : [];
      }),
    ),
    automationRuns: toRecordFromEntries(
      Object.entries(automationRunsRecord).flatMap(([runId, run]) => {
        if (runId.length === 0) {
          return [];
        }
        const parsedRun = parseAutomationRunRecord(runId, run);
        return parsedRun ? [[runId, parsedRun]] : [];
      }),
    ),
  };
};

const toProjectSnapshot = (
  row: BuilderProjectRow,
  state: BuilderProjectState,
  published: boolean,
): BuilderProjectSnapshot => ({
  id: row.id,
  starterTemplateId: resolveStarterProjectTemplateId(row.source),
  brand: structuredClone(state.brand),
  scenes: new Map(
    Object.entries(state.scenes).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  ),
  dialogues: new Map(
    supportedLocales.map((locale) => [locale, new Map(Object.entries(state.dialogues[locale]))]),
  ),
  assets: new Map(Object.entries(state.assets).map(([id, asset]) => [id, structuredClone(asset)])),
  animationClips: new Map(
    Object.entries(state.animationClips).map(([id, clip]) => [id, structuredClone(clip)]),
  ),
  animationTimelines: new Map(
    Object.entries(state.animationTimelines).map(([id, tl]) => [id, structuredClone(tl)]),
  ),
  spriteAtlases: new Map(
    Object.entries(state.spriteAtlases).map(([id, sa]) => [id, structuredClone(sa)]),
  ),
  dialogueGraphs: new Map(
    Object.entries(state.dialogueGraphs).map(([id, graph]) => [id, structuredClone(graph)]),
  ),
  quests: new Map(Object.entries(state.quests).map(([id, quest]) => [id, structuredClone(quest)])),
  triggers: new Map(
    Object.entries(state.triggers).map(([id, trigger]) => [id, structuredClone(trigger)]),
  ),
  flags: new Map(Object.entries(state.flags).map(([id, flag]) => [id, structuredClone(flag)])),
  generationJobs: new Map(
    Object.entries(state.generationJobs).map(([id, job]) => [id, structuredClone(job)]),
  ),
  artifacts: new Map(
    Object.entries(state.artifacts).map(([id, artifact]) => [id, structuredClone(artifact)]),
  ),
  automationRuns: new Map(
    Object.entries(state.automationRuns).map(([id, run]) => [id, structuredClone(run)]),
  ),
  published,
  createdBy: row.createdBy,
  updatedBy: row.updatedBy,
  source: row.source,
  checksum: row.checksum,
  version: row.version,
  lastUpdatedAtMs: row.updatedAt.getTime(),
  latestReleaseVersion: row.latestReleaseVersion,
  publishedReleaseVersion: row.publishedReleaseVersion,
});

const toEntry = (row: BuilderProjectRow, state: BuilderProjectState): BuilderProjectStateEntry => ({
  row,
  state,
  published: row.publishedReleaseVersion !== null,
});

/**
 * Normalizes optional locale strings to one of the supported builder locales.
 *
 * @param value Locale candidate from route or payload input.
 * @returns Canonical supported locale code.
 */
export const normalizeBuilderLocale = (value: string | undefined): LocaleCode =>
  value === "zh-CN" || value === "en-US" ? value : "en-US";

/**
 * Shared typed persistence boundary for loading, mutating, and publishing builder project state.
 */
export class BuilderProjectStateStore {
  private readonly initPromise = Promise.resolve();

  private resolveUpdatedBy(updatedBy: string | undefined, fallback: string): string {
    const trimmed = (updatedBy ?? "").trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  private async readProjectRow(projectId: string): Promise<BuilderProjectRow | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    return prisma.builderProject.findStateRow(sanitized);
  }

  private async readDraftContent(projectId: string): Promise<{
    readonly scenes: Record<string, SceneDefinition>;
    readonly dialogues: BuilderProjectState["dialogues"];
  }> {
    const [sceneRows, dialogueRows] = await Promise.all([
      prisma.builderProjectScene.listProjectRows(projectId),
      prisma.builderProjectDialogueEntry.listProjectRows(projectId),
    ]);

    return {
      scenes: toScenesFromRows(sceneRows),
      dialogues: toDialoguesFromRows(dialogueRows),
    };
  }

  private async readDraftMedia(projectId: string): Promise<{
    readonly assets: Record<string, BuilderAsset>;
    readonly animationClips: Record<string, AnimationClip>;
    readonly animationTimelines: Record<string, AnimationTimeline>;
    readonly spriteAtlases: Record<string, SpriteAtlasManifest>;
  }> {
    const [assetRows, animationClipRows, animationTimelineRows, spriteAtlasRows] =
      await Promise.all([
        prisma.builderProjectAsset.listProjectRows(projectId),
        prisma.builderProjectAnimationClip.listProjectRows(projectId),
        prisma.builderProjectAnimationTimeline.listProjectRows(projectId),
        prisma.builderProjectSpriteAtlas.listProjectRows(projectId),
      ]);

    return {
      assets: toBuilderAssetsFromRows(assetRows),
      animationClips: toAnimationClipsFromRows(animationClipRows),
      animationTimelines: toAnimationTimelinesFromRows(animationTimelineRows),
      spriteAtlases: toSpriteAtlasFromRows(spriteAtlasRows),
    };
  }

  private async readDraftMechanics(projectId: string): Promise<{
    readonly dialogueGraphs: Record<string, DialogueGraph>;
    readonly quests: Record<string, QuestDefinition>;
    readonly triggers: Record<string, TriggerDefinition>;
    readonly flags: Record<string, GameFlagDefinition>;
  }> {
    const [dialogueGraphRows, questRows, triggerRows, flagRows] = await Promise.all([
      prisma.builderProjectDialogueGraph.listProjectRows(projectId),
      prisma.builderProjectQuest.listProjectRows(projectId),
      prisma.builderProjectTrigger.listProjectRows(projectId),
      prisma.builderProjectFlag.listProjectRows(projectId),
    ]);

    return {
      dialogueGraphs: toDialogueGraphsFromRows(dialogueGraphRows),
      quests: toQuestsFromRows(questRows),
      triggers: toTriggersFromRows(triggerRows),
      flags: toFlagsFromRows(flagRows),
    };
  }

  private async readDraftWorkerState(projectId: string): Promise<{
    readonly generationJobs: Record<string, GenerationJob>;
    readonly artifacts: Record<string, GenerationArtifact>;
    readonly automationRuns: Record<string, AutomationRun>;
  }> {
    const [jobRows, artifactRows, automationRunRows] = await Promise.all([
      prisma.builderProjectGenerationJob.listProjectRows(projectId),
      prisma.builderProjectArtifact.listProjectRows(projectId),
      prisma.builderProjectAutomationRun.listProjectRows(projectId),
    ]);

    return {
      generationJobs: toGenerationJobsFromRows(jobRows),
      artifacts: toGenerationArtifactsFromRows(artifactRows),
      automationRuns: toAutomationRunsFromRows(automationRunRows),
    };
  }

  private async saveProjectState(
    row: BuilderProjectRow,
    state: BuilderProjectState,
    updatedBy: string,
  ): Promise<BuilderProjectStateEntry | null> {
    const savedRow = await prisma.builderProject.saveStateVersioned(
      row.id,
      row.version,
      toDraftStateInput(state),
      checksumOf(state),
      updatedBy,
      {
        scenes: Object.values(state.scenes),
        dialogues: state.dialogues,
        assets: Object.values(state.assets),
        animationClips: Object.values(state.animationClips),
        dialogueGraphs: Object.values(state.dialogueGraphs),
        quests: Object.values(state.quests),
        triggers: Object.values(state.triggers),
        flags: Object.values(state.flags),
        generationJobs: Object.values(state.generationJobs),
        artifacts: Object.values(state.artifacts),
        automationRuns: Object.values(state.automationRuns),
      },
    );
    if (!savedRow) {
      return null;
    }

    return toEntry(savedRow, state);
  }

  private async materializeProjectEntry(
    row: BuilderProjectRow,
  ): Promise<BuilderProjectStateEntry | null> {
    const draftState = parseProjectState(row.state);
    const [content, media, mechanics, workerState] = await Promise.all([
      this.readDraftContent(row.id),
      this.readDraftMedia(row.id),
      this.readDraftMechanics(row.id),
      this.readDraftWorkerState(row.id),
    ]);

    return toEntry(
      row,
      withDraftWorkerState(
        withDraftMechanics(
          withDraftMedia(
            withDraftContent(draftState, content.scenes, content.dialogues),
            media.assets,
            media.animationClips,
            media.animationTimelines,
          ),
          mechanics.dialogueGraphs,
          mechanics.quests,
          mechanics.triggers,
          mechanics.flags,
        ),
        workerState.generationJobs,
        workerState.artifacts,
        workerState.automationRuns,
      ),
    );
  }

  private async materializeProjectEntries(
    rows: readonly BuilderProjectRow[],
  ): Promise<readonly BuilderProjectStateEntry[]> {
    const entries: BuilderProjectStateEntry[] = [];

    for (const row of rows) {
      const entry = await this.materializeProjectEntry(row);
      if (entry) {
        entries.push(entry);
      }
    }

    return entries;
  }

  private async listQueuedProjectRows(projectId?: string): Promise<readonly BuilderProjectRow[]> {
    const [queuedGenerationProjectIds, queuedAutomationProjectIds] = await Promise.all([
      prisma.builderProjectGenerationJob.listQueuedProjectIds(projectId),
      prisma.builderProjectAutomationRun.listQueuedProjectIds(projectId),
    ]);
    const queuedProjectIds = [
      ...new Set([...queuedGenerationProjectIds, ...queuedAutomationProjectIds]),
    ].sort((left, right) => left.localeCompare(right));

    if (queuedProjectIds.length === 0) {
      return [];
    }

    return prisma.builderProject.listStateRowsByIds(queuedProjectIds);
  }

  /**
   * Creates a project from baseline state or returns the existing snapshot when already present.
   *
   * @param projectId Target logical project id.
   * @returns Freshly created or existing snapshot.
   */
  public async createProject(
    projectId: string,
    starterTemplateId: StarterProjectTemplateId,
    createdBy?: string,
  ): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    const existing = await this.readProjectEntry(sanitized);
    if (existing) {
      return toProjectSnapshot(existing.row, existing.state, existing.published);
    }

    const baseline = createStarterProjectState(starterTemplateId);
    const actor = this.resolveUpdatedBy(createdBy, "builder-service");
    const created = await prisma.builderProject.createStateProject(
      sanitized,
      toDraftStateInput(baseline),
      checksumOf(baseline),
      actor,
      {
        scenes: Object.values(baseline.scenes),
        dialogues: baseline.dialogues,
        assets: Object.values(baseline.assets),
        animationClips: Object.values(baseline.animationClips),
        dialogueGraphs: Object.values(baseline.dialogueGraphs),
        quests: Object.values(baseline.quests),
        triggers: Object.values(baseline.triggers),
        flags: Object.values(baseline.flags),
        generationJobs: [],
        artifacts: [],
        automationRuns: [],
      },
      toStarterProjectSource(starterTemplateId),
    );

    return toProjectSnapshot(created, baseline, false);
  }

  /**
   * Loads one project row and decodes its canonical mutable state.
   *
   * @param projectId Logical project id.
   * @returns Normalized project entry or `null` when missing.
   */
  public async readProjectEntry(projectId: string): Promise<BuilderProjectStateEntry | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    return this.materializeProjectEntry(row);
  }

  /**
   * Loads many project entries for worker-style scans.
   *
   * @param projectId Optional project filter.
   * @returns Decoded project entries with normalized state.
   */
  public async listProjectEntries(
    projectId?: string,
  ): Promise<readonly BuilderProjectStateEntry[]> {
    await this.initPromise;
    const rows = await prisma.builderProject.listStateRows(projectId);
    return this.materializeProjectEntries(rows);
  }

  /**
   * Loads only projects that currently have queued generation or automation work.
   *
   * @param projectId Optional project filter.
   * @returns Decoded queued project entries with normalized state.
   */
  public async listQueuedProjectEntries(
    projectId?: string,
  ): Promise<readonly BuilderProjectStateEntry[]> {
    await this.initPromise;
    const rows = await this.listQueuedProjectRows(projectId);
    return this.materializeProjectEntries(rows);
  }

  /**
   * Projects a loaded draft entry into a snapshot suitable for views and routes.
   *
   * @param projectId Logical project id.
   * @returns Snapshot or `null` when missing.
   */
  public async readProjectSnapshot(projectId: string): Promise<BuilderProjectSnapshot | null> {
    const entry = await this.readProjectEntry(projectId);
    return entry ? toProjectSnapshot(entry.row, entry.state, entry.published) : null;
  }

  /**
   * Projects the current published release into a snapshot without mutating draft state.
   *
   * @param projectId Logical project id.
   * @returns Published snapshot or `null` when there is no published release.
   */
  public async readPublishedProjectSnapshot(
    projectId: string,
  ): Promise<BuilderProjectSnapshot | null> {
    const row = await this.readProjectRow(projectId);
    if (!row || row.publishedReleaseVersion === null) {
      return null;
    }

    const release = await prisma.builderProjectRelease.findStateRelease(
      row.id,
      row.publishedReleaseVersion,
    );
    if (!release) {
      return null;
    }

    return toProjectSnapshot(row, parseProjectState(release.state), true);
  }

  /**
   * Applies a versioned mutable-state update and returns the refreshed saved entry.
   *
   * @param projectId Logical project id.
   * @param updatedBy Audit owner marker.
   * @param mutate In-place state mutation callback.
   * @returns Saved entry with caller payload or `null` when missing/conflicted/aborted.
   */
  public async updateProject<T>(
    projectId: string,
    updatedBy: string,
    mutate: (state: BuilderProjectState) => BuilderProjectStateMutationDecision<T>,
  ): Promise<BuilderProjectStateMutation<T> | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    const decision = mutate(entry.state);
    if (!decision.ok) {
      return null;
    }

    const savedEntry = await this.saveProjectState(entry.row, entry.state, updatedBy);
    if (!savedEntry) {
      return null;
    }

    return {
      entry: savedEntry,
      payload: decision.payload,
    };
  }

  /**
   * Persists publish or unpublish state through the canonical Prisma release transaction.
   *
   * @param projectId Logical project id.
   * @param published Whether the draft should become the active published release.
   * @returns Updated snapshot or `null` when the project is missing.
   */
  public async publishProject(
    projectId: string,
    published: boolean,
    updatedBy?: string,
  ): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }
    const actor = this.resolveUpdatedBy(updatedBy, "builder-publish");

    if (!published) {
      const updated = await prisma.builderProject.publishStateSnapshot(
        sanitized,
        false,
        undefined,
        actor,
      );
      if (!updated) {
        return null;
      }
      const [content, media, mechanics, workerState] = await Promise.all([
        this.readDraftContent(updated.id),
        this.readDraftMedia(updated.id),
        this.readDraftMechanics(updated.id),
        this.readDraftWorkerState(updated.id),
      ]);
      return updated
        ? toProjectSnapshot(
            updated,
            withDraftWorkerState(
              withDraftMechanics(
                withDraftMedia(
                  withDraftContent(
                    parseProjectState(updated.state),
                    content.scenes,
                    content.dialogues,
                  ),
                  media.assets,
                  media.animationClips,
                  media.animationTimelines,
                ),
                mechanics.dialogueGraphs,
                mechanics.quests,
                mechanics.triggers,
                mechanics.flags,
              ),
              workerState.generationJobs,
              workerState.artifacts,
              workerState.automationRuns,
            ),
            false,
          )
        : null;
    }

    const entry = await this.readProjectEntry(sanitized);
    if (!entry) {
      return null;
    }
    const updated = await prisma.builderProject.publishStateSnapshot(
      sanitized,
      true,
      {
        state: safeJsonParse<Prisma.InputJsonValue>(
          JSON.stringify(entry.state),
          {},
          (v): v is Prisma.InputJsonValue => true,
        ),
        checksum: checksumOf(entry.state),
      },
      actor,
    );
    if (!updated) {
      return null;
    }

    return toProjectSnapshot(updated, entry.state, true);
  }
}

const sharedBuilderProjectStateStore = new BuilderProjectStateStore();

/**
 * Returns the shared builder project state store singleton.
 *
 * @returns Shared builder project state store.
 */
export const createBuilderProjectStateStore = (): BuilderProjectStateStore =>
  sharedBuilderProjectStateStore;

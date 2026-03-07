import type { Prisma } from "@prisma/client";
import type { LocaleCode } from "../../config/environment.ts";
import type {
  AnimationClip,
  AssetVariant,
  AutomationRun,
  AutomationRunStep,
  BuilderAsset,
  DialogueGraph,
  GameFlagDefinition,
  GenerationArtifact,
  GenerationJob,
  QuestDefinition,
  SceneDefinition,
  SceneNodeDefinition,
  SceneNpcDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import {
  type BuilderProjectAnimationClipRow,
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
  type BuilderProjectTriggerRow,
  prisma,
} from "../../shared/services/db.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import { gameTextByLocale } from "../game/data/game-text.ts";
import { gameScenes, gameSpriteManifests } from "../game/data/sprite-data.ts";

/**
 * Shared default project identifier for builder routes and API defaults.
 */
export const defaultBuilderProjectId = "default";

const supportedLocales = ["en-US", "zh-CN"] as const satisfies readonly LocaleCode[];
const baselineCreatedAtMs = 0;

/**
 * Canonical mutable builder project state materialized for the builder domain.
 * Draft project JSON stores scenes and dialogue catalogs, while authored media,
 * mechanics, and worker state are loaded from dedicated relational tables and
 * merged here.
 */
export interface BuilderProjectState {
  /** Scene definitions keyed by scene id. */
  readonly scenes: Record<string, SceneDefinition>;
  /** Dialogue catalogs keyed by locale and dialogue key. */
  readonly dialogues: Record<LocaleCode, Record<string, string>>;
  /** Authored asset registry. */
  readonly assets: Record<string, BuilderAsset>;
  /** Authored animation clips. */
  readonly animationClips: Record<string, AnimationClip>;
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
  /** Scene registry by stable scene id. */
  readonly scenes: Map<string, SceneDefinition>;
  /** Dialogue registry by locale -> key -> value. */
  readonly dialogues: Map<LocaleCode, Map<string, string>>;
  /** Authored asset registry. */
  readonly assets: Map<string, BuilderAsset>;
  /** Authored animation clips. */
  readonly animationClips: Map<string, AnimationClip>;
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
  /** Creation owner marker for audit trail compatibility. */
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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const cloneRecord = <T>(input: Record<string, T>): Record<string, T> =>
  structuredClone(input) as Record<string, T>;

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
  const backgroundAssets = Object.values(gameScenes).map((scene) => ({
    id: `asset.background.${scene.id}`,
    kind: "background" as const,
    label: scene.id,
    sceneMode: scene.sceneMode,
    source: scene.background,
    tags: ["baseline", scene.id],
    variants: [
      {
        id: `variant.background.${scene.id}.runtime`,
        format: "png",
        source: scene.background,
        usage: "runtime",
      },
    ],
    approved: true,
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  }));

  const spriteAssets = Object.entries(gameSpriteManifests).map(([characterKey, manifest]) => ({
    id: `asset.sprite.${characterKey}`,
    kind: "sprite-sheet" as const,
    label: characterKey,
    sceneMode: "2d" as const,
    source: manifest.sheet,
    tags: ["baseline", "sprite", characterKey],
    variants: [
      {
        id: `variant.sprite.${characterKey}.runtime`,
        format: "png",
        source: manifest.sheet,
        usage: "runtime",
      },
    ],
    approved: true,
    createdAtMs: baselineCreatedAtMs,
    updatedAtMs: baselineCreatedAtMs,
  }));

  return Object.fromEntries(
    [...backgroundAssets, ...spriteAssets].map((asset) => [asset.id, asset]),
  ) as Record<string, BuilderAsset>;
};

const buildBaselineAnimationClips = (): Record<string, AnimationClip> =>
  Object.fromEntries(
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
  ) as Record<string, AnimationClip>;

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
  const scenes = Object.fromEntries(
    Object.entries(gameScenes).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  ) as Record<string, SceneDefinition>;
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": Object.fromEntries(Object.entries(gameTextByLocale["en-US"].npcs)),
    "zh-CN": Object.fromEntries(Object.entries(gameTextByLocale["zh-CN"].npcs)),
  };

  return {
    scenes,
    dialogues,
    assets: buildBaselineAssets(),
    animationClips: buildBaselineAnimationClips(),
    dialogueGraphs: buildBaselineDialogueGraphs(),
    quests: buildBaselineQuests(),
    triggers: buildBaselineTriggers(),
    flags: buildBaselineFlags(),
    generationJobs: {},
    artifacts: {},
    automationRuns: {},
  };
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
  return JSON.parse(JSON.stringify(draftState)) as Prisma.InputJsonValue;
};

const hasLegacyDraftContent = (state: BuilderProjectState): boolean =>
  Object.keys(state.scenes).length > 0 ||
  Object.values(state.dialogues).some((catalog) => Object.keys(catalog).length > 0);

const hasLegacyDraftMedia = (state: BuilderProjectState): boolean =>
  Object.keys(state.assets).length > 0 || Object.keys(state.animationClips).length > 0;

const hasLegacyDraftWorkerState = (state: BuilderProjectState): boolean =>
  Object.keys(state.generationJobs).length > 0 ||
  Object.keys(state.artifacts).length > 0 ||
  Object.keys(state.automationRuns).length > 0;

const hasLegacyDraftMechanics = (state: BuilderProjectState): boolean =>
  Object.keys(state.dialogueGraphs).length > 0 ||
  Object.keys(state.quests).length > 0 ||
  Object.keys(state.triggers).length > 0 ||
  Object.keys(state.flags).length > 0;

const toNumberValue = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toVector2 = (value: unknown): { readonly x: number; readonly y: number } | null => {
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

const toSceneGeometry = (value: unknown): SceneDefinition["geometry"] | null => {
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

const toSceneNpcs = (value: unknown): SceneDefinition["npcs"] =>
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

const toSceneNodes = (
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

    const isThreeDimensionalNode =
      sceneMode === "3d" ||
      toVector3(record.position) !== null ||
      toVector3(record.rotation) !== null ||
      toVector3(record.scale) !== null;

    if (
      !isThreeDimensionalNode &&
      (record.nodeType === "sprite" ||
        record.nodeType === "tile" ||
        record.nodeType === "spawn" ||
        record.nodeType === "trigger" ||
        record.nodeType === "camera")
    ) {
      const position = toVector2(record.position);
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

const toScenesFromRows = (
  rows: readonly BuilderProjectSceneRow[],
): Record<string, SceneDefinition> =>
  Object.fromEntries(
    rows.flatMap((row) => {
      const sceneMode =
        row.sceneMode === "2d" || row.sceneMode === "3d" ? row.sceneMode : undefined;
      const geometry = toSceneGeometry(row.geometry);
      const spawn = toVector2(row.spawn);
      if (geometry === null || spawn === null) {
        return [];
      }

      return [
        [
          row.id,
          {
            id: row.id,
            sceneMode: row.sceneMode === "2d" || row.sceneMode === "3d" ? row.sceneMode : undefined,
            titleKey: row.titleKey,
            background: row.background,
            geometry,
            spawn,
            npcs: toSceneNpcs(row.npcs),
            nodes: toSceneNodes(row.nodes, sceneMode),
            collisions: toCollisionMasks(row.collisions),
          } satisfies SceneDefinition,
        ],
      ];
    }),
  ) as Record<string, SceneDefinition>;

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
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        kind: row.kind as BuilderAsset["kind"],
        label: row.label,
        sceneMode: row.sceneMode as BuilderAsset["sceneMode"],
        source: row.source,
        tags:
          Array.isArray(row.tags) && row.tags.every((tag): tag is string => typeof tag === "string")
            ? [...row.tags]
            : [],
        variants: toAssetVariantArray(row.variants),
        approved: row.approved,
        createdAtMs: row.createdAt.getTime(),
        updatedAtMs: row.updatedAt.getTime(),
      } satisfies BuilderAsset,
    ]),
  ) as Record<string, BuilderAsset>;

const toAnimationClipsFromRows = (
  rows: readonly BuilderProjectAnimationClipRow[],
): Record<string, AnimationClip> =>
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        assetId: row.assetId,
        label: row.label,
        sceneMode: row.sceneMode as AnimationClip["sceneMode"],
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
    ]),
  ) as Record<string, AnimationClip>;

const withDraftMedia = (
  state: BuilderProjectState,
  assets: Record<string, BuilderAsset>,
  animationClips: Record<string, AnimationClip>,
): BuilderProjectState => ({
  ...state,
  assets,
  animationClips,
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
              edges: (item.edges as readonly unknown[]).flatMap((edge) => {
                const edgeRecord =
                  edge && typeof edge === "object" && !Array.isArray(edge)
                    ? (edge as Record<string, unknown>)
                    : null;
                if (
                  edgeRecord &&
                  typeof edgeRecord.to === "string" &&
                  (edgeRecord.requiredFlag === undefined ||
                    typeof edgeRecord.requiredFlag === "string") &&
                  (edgeRecord.advanceQuestStepId === undefined ||
                    typeof edgeRecord.advanceQuestStepId === "string")
                ) {
                  return [
                    {
                      to: edgeRecord.to,
                      requiredFlag: edgeRecord.requiredFlag,
                      advanceQuestStepId: edgeRecord.advanceQuestStepId,
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
  Object.fromEntries(
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
  ) as Record<string, DialogueGraph>;

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
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        title: row.title,
        description: row.description,
        steps: toQuestSteps(row.steps),
      } satisfies QuestDefinition,
    ]),
  ) as Record<string, QuestDefinition>;

const toFlagValueRecord = (
  value: unknown,
): Readonly<Record<string, string | number | boolean>> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
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
  Object.fromEntries(
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
  ) as Record<string, TriggerDefinition>;

const toFlagsFromRows = (
  rows: readonly BuilderProjectFlagRow[],
): Record<string, GameFlagDefinition> =>
  Object.fromEntries(
    rows.flatMap((row) => {
      const initialValue = row.initialValue;
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
  ) as Record<string, GameFlagDefinition>;

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
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        kind: row.kind as GenerationJob["kind"],
        status: row.status as GenerationJob["status"],
        prompt: row.prompt,
        targetId: row.targetId ?? undefined,
        artifactIds:
          Array.isArray(row.artifactIds) &&
          row.artifactIds.every(
            (artifactId): artifactId is string => typeof artifactId === "string",
          )
            ? [...row.artifactIds]
            : [],
        statusMessage: row.statusMessage,
        createdAtMs: row.createdAt.getTime(),
        updatedAtMs: row.updatedAt.getTime(),
      } satisfies GenerationJob,
    ]),
  ) as Record<string, GenerationJob>;

const toGenerationArtifactsFromRows = (
  rows: readonly BuilderProjectArtifactRow[],
): Record<string, GenerationArtifact> =>
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        jobId: row.jobId,
        kind: row.kind as GenerationArtifact["kind"],
        label: row.label,
        previewSource: row.previewSource,
        summary: row.summary,
        mimeType: row.mimeType ?? undefined,
        approved: row.approved,
        createdAtMs: row.createdAt.getTime(),
      } satisfies GenerationArtifact,
    ]),
  ) as Record<string, GenerationArtifact>;

const toAutomationRunStepArray = (value: unknown): readonly AutomationRunStep[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        if (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          (item.action === "browser" ||
            item.action === "http" ||
            item.action === "builder" ||
            item.action === "attach-file") &&
          typeof item.summary === "string" &&
          (item.status === "pending" ||
            item.status === "running" ||
            item.status === "completed" ||
            item.status === "failed") &&
          (item.evidenceSource === undefined || typeof item.evidenceSource === "string")
        ) {
          return [
            {
              id: item.id,
              action: item.action,
              summary: item.summary,
              status: item.status,
              evidenceSource: item.evidenceSource,
            } satisfies AutomationRunStep,
          ];
        }

        return [];
      })
    : [];

const toAutomationRunsFromRows = (
  rows: readonly BuilderProjectAutomationRunRow[],
): Record<string, AutomationRun> =>
  Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        status: row.status as AutomationRun["status"],
        goal: row.goal,
        steps: toAutomationRunStepArray(row.steps),
        artifactIds:
          Array.isArray(row.artifactIds) &&
          row.artifactIds.every(
            (artifactId): artifactId is string => typeof artifactId === "string",
          )
            ? [...row.artifactIds]
            : [],
        statusMessage: row.statusMessage,
        createdAtMs: row.createdAt.getTime(),
        updatedAtMs: row.updatedAt.getTime(),
      } satisfies AutomationRun,
    ]),
  ) as Record<string, AutomationRun>;

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

const parseProjectState = (state: Prisma.JsonValue): BuilderProjectState => {
  const parsed = safeJsonParse<unknown>(JSON.stringify(state), {});
  const record = asRecord(parsed);
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

  const scenes = Object.fromEntries(
    Object.entries(scenesRecord)
      .filter((entry): entry is [string, SceneDefinition] => entry[0].length > 0)
      .map(([sceneId, scene]) => [sceneId, structuredClone(scene as SceneDefinition)]),
  ) as Record<string, SceneDefinition>;

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
    scenes,
    dialogues,
    assets: cloneRecord(assetsRecord as Record<string, BuilderAsset>),
    animationClips: cloneRecord(animationClipsRecord as Record<string, AnimationClip>),
    dialogueGraphs: cloneRecord(dialogueGraphsRecord as Record<string, DialogueGraph>),
    quests: cloneRecord(questsRecord as Record<string, QuestDefinition>),
    triggers: cloneRecord(triggersRecord as Record<string, TriggerDefinition>),
    flags: cloneRecord(flagsRecord as Record<string, GameFlagDefinition>),
    generationJobs: cloneRecord(generationJobsRecord as Record<string, GenerationJob>),
    artifacts: cloneRecord(artifactsRecord as Record<string, GenerationArtifact>),
    automationRuns: cloneRecord(automationRunsRecord as Record<string, AutomationRun>),
  };
};

const toProjectSnapshot = (
  row: BuilderProjectRow,
  state: BuilderProjectState,
  published: boolean,
): BuilderProjectSnapshot => ({
  id: row.id,
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
  private readonly initPromise = this.ensureDefaultProject();

  private async ensureDefaultProject(): Promise<void> {
    const existing = await prisma.builderProject.findStateRow(defaultBuilderProjectId);
    if (existing) {
      return;
    }

    const baseline = createBaselineState();
    await prisma.builderProject.createStateProject(
      defaultBuilderProjectId,
      toDraftStateInput(baseline),
      checksumOf(baseline),
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
    );
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
  }> {
    const [assetRows, animationClipRows] = await Promise.all([
      prisma.builderProjectAsset.listProjectRows(projectId),
      prisma.builderProjectAnimationClip.listProjectRows(projectId),
    ]);

    return {
      assets: toBuilderAssetsFromRows(assetRows),
      animationClips: toAnimationClipsFromRows(animationClipRows),
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

  private async promoteLegacyDraftRelationalState(
    row: BuilderProjectRow,
    state: BuilderProjectState,
  ): Promise<BuilderProjectStateEntry | null> {
    const migratedRow = await prisma.builderProject.saveStateVersioned(
      row.id,
      row.version,
      toDraftStateInput(state),
      checksumOf(state),
      "builder-media-migration",
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
    if (!migratedRow) {
      return this.readProjectEntry(row.id);
    }

    return toEntry(migratedRow, state);
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
    if (
      Object.keys(content.scenes).length === 0 &&
      Object.values(content.dialogues).every((catalog) => Object.keys(catalog).length === 0) &&
      hasLegacyDraftContent(draftState)
    ) {
      return this.promoteLegacyDraftRelationalState(row, draftState);
    }

    if (
      Object.keys(media.assets).length === 0 &&
      Object.keys(media.animationClips).length === 0 &&
      hasLegacyDraftMedia(draftState)
    ) {
      return this.promoteLegacyDraftRelationalState(row, draftState);
    }

    if (
      Object.keys(mechanics.dialogueGraphs).length === 0 &&
      Object.keys(mechanics.quests).length === 0 &&
      Object.keys(mechanics.triggers).length === 0 &&
      Object.keys(mechanics.flags).length === 0 &&
      hasLegacyDraftMechanics(draftState)
    ) {
      return this.promoteLegacyDraftRelationalState(row, draftState);
    }

    if (
      Object.keys(workerState.generationJobs).length === 0 &&
      Object.keys(workerState.artifacts).length === 0 &&
      Object.keys(workerState.automationRuns).length === 0 &&
      hasLegacyDraftWorkerState(draftState)
    ) {
      return this.promoteLegacyDraftRelationalState(row, draftState);
    }

    return toEntry(
      row,
      withDraftWorkerState(
        withDraftMechanics(
          withDraftMedia(
            withDraftContent(draftState, content.scenes, content.dialogues),
            media.assets,
            media.animationClips,
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

  /**
   * Creates a project from baseline state or returns the existing snapshot when already present.
   *
   * @param projectId Target logical project id.
   * @returns Freshly created or existing snapshot.
   */
  public async createProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    const existing = await this.readProjectEntry(sanitized);
    if (existing) {
      return toProjectSnapshot(existing.row, existing.state, existing.published);
    }

    const baseline = createBaselineState();
    const created = await prisma.builderProject.createStateProject(
      sanitized,
      toDraftStateInput(baseline),
      checksumOf(baseline),
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
    const entries = await Promise.all(rows.map((row) => this.materializeProjectEntry(row)));
    return entries.filter((entry): entry is BuilderProjectStateEntry => entry !== null);
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
  ): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    if (!published) {
      const updated = await prisma.builderProject.publishStateSnapshot(sanitized, false);
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
    const updated = await prisma.builderProject.publishStateSnapshot(sanitized, true, {
      state: JSON.parse(JSON.stringify(entry.state)) as Prisma.InputJsonValue,
      checksum: checksumOf(entry.state),
    });
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

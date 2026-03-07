import { PrismaLibSql } from "@prisma/adapter-libsql";
import { type Prisma, PrismaClient } from "@prisma/client";
import type { LocaleCode } from "../../config/environment.ts";
import { appConfig } from "../../config/environment.ts";
import { getLevel } from "../../domain/game/progression.ts";
import type {
  AnimationClip,
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
  titleKey: true,
  background: true,
  geometry: true,
  spawn: true,
  npcs: true,
  nodes: true,
  collisions: true,
} satisfies Prisma.BuilderProjectSceneSelect;

/**
 * Selected builder scene row contract shared across persistence helpers.
 */
export type BuilderProjectSceneRow = Prisma.BuilderProjectSceneGetPayload<{
  select: typeof builderProjectSceneRowSelect;
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
  tags: true,
  variants: true,
  approved: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectAssetSelect;

/**
 * Selected builder-project asset row contract shared across persistence helpers.
 */
export type BuilderProjectAssetRow = Prisma.BuilderProjectAssetGetPayload<{
  select: typeof builderProjectAssetRowSelect;
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
 * Canonical builder dialogue-graph row shape used by domain services.
 */
export const builderProjectDialogueGraphRowSelect = {
  projectId: true,
  id: true,
  title: true,
  npcId: true,
  rootNodeId: true,
  nodes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectDialogueGraphSelect;

/**
 * Selected builder dialogue-graph row contract shared across persistence helpers.
 */
export type BuilderProjectDialogueGraphRow = Prisma.BuilderProjectDialogueGraphGetPayload<{
  select: typeof builderProjectDialogueGraphRowSelect;
}>;

/**
 * Canonical builder quest row shape used by domain services.
 */
export const builderProjectQuestRowSelect = {
  projectId: true,
  id: true,
  title: true,
  description: true,
  steps: true,
} satisfies Prisma.BuilderProjectQuestSelect;

/**
 * Selected builder quest row contract shared across persistence helpers.
 */
export type BuilderProjectQuestRow = Prisma.BuilderProjectQuestGetPayload<{
  select: typeof builderProjectQuestRowSelect;
}>;

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
  requiredFlags: true,
  setFlags: true,
  questId: true,
  questStepId: true,
} satisfies Prisma.BuilderProjectTriggerSelect;

/**
 * Selected builder trigger row contract shared across persistence helpers.
 */
export type BuilderProjectTriggerRow = Prisma.BuilderProjectTriggerGetPayload<{
  select: typeof builderProjectTriggerRowSelect;
}>;

/**
 * Canonical builder flag row shape used by domain services.
 */
export const builderProjectFlagRowSelect = {
  projectId: true,
  key: true,
  label: true,
  initialValue: true,
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
  artifactIds: true,
  statusMessage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectGenerationJobSelect;

/**
 * Selected builder generation-job row contract shared across persistence helpers.
 */
export type BuilderProjectGenerationJobRow = Prisma.BuilderProjectGenerationJobGetPayload<{
  select: typeof builderProjectGenerationJobRowSelect;
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
  steps: true,
  artifactIds: true,
  statusMessage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BuilderProjectAutomationRunSelect;

/**
 * Selected builder automation-run row contract shared across persistence helpers.
 */
export type BuilderProjectAutomationRunRow = Prisma.BuilderProjectAutomationRunGetPayload<{
  select: typeof builderProjectAutomationRunRowSelect;
}>;

// ── Base client ───────────────────────────────────────────────────────────────

const createBaseClient = () => {
  const adapter = new PrismaLibSql({ url: appConfig.database.url });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
};

const toJsonValue = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

const toSceneCreateManyInput = (
  projectId: string,
  scenes: readonly SceneDefinition[],
): Prisma.BuilderProjectSceneCreateManyInput[] =>
  scenes.map((scene) => ({
    projectId,
    id: scene.id,
    sceneMode: scene.sceneMode,
    titleKey: scene.titleKey,
    background: scene.background,
    geometry: toJsonValue(scene.geometry),
    spawn: toJsonValue(scene.spawn),
    npcs: toJsonValue(scene.npcs),
    nodes: scene.nodes ? toJsonValue(scene.nodes) : undefined,
    collisions: toJsonValue(scene.collisions),
  }));

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
    tags: toJsonValue(asset.tags),
    variants: toJsonValue(asset.variants),
    approved: asset.approved,
    createdAt: new Date(asset.createdAtMs),
    updatedAt: new Date(asset.updatedAtMs),
  }));

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
    nodes: toJsonValue(graph.nodes),
    createdAt: new Date(graph.createdAtMs),
    updatedAt: new Date(graph.updatedAtMs),
  }));

const toQuestCreateManyInput = (
  projectId: string,
  quests: readonly QuestDefinition[],
): Prisma.BuilderProjectQuestCreateManyInput[] =>
  quests.map((quest) => ({
    projectId,
    id: quest.id,
    title: quest.title,
    description: quest.description,
    steps: toJsonValue(quest.steps),
  }));

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
    requiredFlags: trigger.requiredFlags ? toJsonValue(trigger.requiredFlags) : undefined,
    setFlags: trigger.setFlags ? toJsonValue(trigger.setFlags) : undefined,
    questId: trigger.questId,
    questStepId: trigger.questStepId,
  }));

const toFlagCreateManyInput = (
  projectId: string,
  flags: readonly GameFlagDefinition[],
): Prisma.BuilderProjectFlagCreateManyInput[] =>
  flags.map((flag) => ({
    projectId,
    key: flag.key,
    label: flag.label,
    initialValue: toJsonValue(flag.initialValue),
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
    artifactIds: toJsonValue(job.artifactIds),
    statusMessage: job.statusMessage,
    createdAt: new Date(job.createdAtMs),
    updatedAt: new Date(job.updatedAtMs),
  }));

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
    steps: toJsonValue(run.steps),
    artifactIds: toJsonValue(run.artifactIds),
    statusMessage: run.statusMessage,
    createdAt: new Date(run.createdAtMs),
    updatedAt: new Date(run.updatedAtMs),
  }));

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

const withDomainExtensions = (base: PrismaClient) =>
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

        /** Creates a builder project using the canonical selected row shape. */
        async createStateProject(
          id: string,
          state: Prisma.InputJsonValue,
          checksum: string,
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
        ): Promise<BuilderProjectRow> {
          return base.$transaction(async (tx) => {
            const row = await tx.builderProject.create({
              data: {
                id,
                state,
                checksum,
              },
              select: builderProjectRowSelect,
            });

            if (content) {
              if (content.scenes.length > 0) {
                await tx.builderProjectScene.createMany({
                  data: toSceneCreateManyInput(id, content.scenes),
                });
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
              }
              if (content.quests.length > 0) {
                await tx.builderProjectQuest.createMany({
                  data: toQuestCreateManyInput(id, content.quests),
                });
              }
              if (content.triggers.length > 0) {
                await tx.builderProjectTrigger.createMany({
                  data: toTriggerCreateManyInput(id, content.triggers),
                });
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
              await tx.builderProjectScene.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectArtifact.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAutomationRun.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectGenerationJob.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAnimationClip.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectDialogueGraph.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectQuest.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectTrigger.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectFlag.deleteMany({
                where: { projectId: id },
              });
              await tx.builderProjectAsset.deleteMany({
                where: { projectId: id },
              });

              if (content.scenes.length > 0) {
                await tx.builderProjectScene.createMany({
                  data: toSceneCreateManyInput(id, content.scenes),
                });
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
              }
              if (content.quests.length > 0) {
                await tx.builderProjectQuest.createMany({
                  data: toQuestCreateManyInput(id, content.quests),
                });
              }
              if (content.triggers.length > 0) {
                await tx.builderProjectTrigger.createMany({
                  data: toTriggerCreateManyInput(id, content.triggers),
                });
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
        ): Promise<BuilderProjectRow | null> {
          return base.$transaction(async (tx) => {
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
                    (JSON.parse(JSON.stringify(row.state ?? {})) as Prisma.InputJsonValue),
                },
              });

              await tx.builderProject.update({
                where: { id: row.id },
                data: {
                  latestReleaseVersion: nextReleaseVersion,
                  publishedReleaseVersion: nextReleaseVersion,
                  updatedBy: "builder-publish",
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
                  updatedBy: "builder-publish",
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
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectGenerationJobRow[]> {
          return base.builderProjectGenerationJob.findMany({
            where: { projectId },
            select: builderProjectGenerationJobRowSelect,
          });
        },
      },

      builderProjectArtifact: {
        async listProjectRows(projectId: string): Promise<readonly BuilderProjectArtifactRow[]> {
          return base.builderProjectArtifact.findMany({
            where: { projectId },
            select: builderProjectArtifactRowSelect,
          });
        },
      },

      builderProjectAutomationRun: {
        async listProjectRows(
          projectId: string,
        ): Promise<readonly BuilderProjectAutomationRunRow[]> {
          return base.builderProjectAutomationRun.findMany({
            where: { projectId },
            select: builderProjectAutomationRunRowSelect,
          });
        },
      },

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
              visitedScenes: [] satisfies Prisma.JsonArray,
              interactions: {} satisfies Prisma.JsonObject,
            },
            update: { xp: newXp, level: newLevel },
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

type ExtendedPrismaClient = ReturnType<typeof withDomainExtensions>;

// ── Singleton export ──────────────────────────────────────────────────────────

const createPrismaClient = (): ExtendedPrismaClient => {
  const base = createBaseClient();
  return withDomainExtensions(base);
};

export const prisma: ExtendedPrismaClient = globalThis._devPrisma ?? createPrismaClient();

if (appConfig.runtime.nodeEnv !== "production") globalThis._devPrisma = prisma;

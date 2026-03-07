import type { LocaleCode } from "../../config/environment.ts";
import type {
  AnimationClip,
  AutomationRun,
  BuilderAnimationClipPayload,
  BuilderArtifactPatch,
  BuilderAsset,
  BuilderAssetPayload,
  BuilderAutomationRunPayload,
  BuilderDialogueGraphPayload,
  BuilderDialoguePayload,
  BuilderGenerationJobPayload,
  BuilderMutationResult,
  BuilderNpcPayload,
  BuilderQuestPayload,
  BuilderScenePayload,
  BuilderTriggerPayload,
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
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import {
  type BuilderProjectSnapshot,
  type BuilderProjectState,
  type BuilderProjectStateEntry,
  type BuilderProjectStateMutation,
  createBuilderProjectStateStore,
  defaultBuilderProjectId,
  normalizeBuilderLocale,
} from "./builder-project-state-store.ts";
import { executeAutomationRun, executeGenerationJob } from "./creator-worker.ts";

/**
 * Result wrapper for write operations.
 */
export interface BuilderMutation<T> {
  /** Mutation result for envelope-style responses. */
  readonly result: BuilderMutationResult;
  /** The latest persisted payload after applying mutation. */
  readonly payload: T;
  /** Stable checksum for idempotent checks in UI or APIs. */
  readonly checksum: string;
}

/**
 * Per-operation preview for AI patch planning.
 */
export interface BuilderPatchPreviewOperation {
  /** Proposed patch operation. */
  readonly operation: BuilderArtifactPatch;
  /** Whether this operation can be applied safely. */
  readonly valid: boolean;
  /** Human-readable validation or preview hint. */
  readonly message: string;
  /** Existing value at the target location. */
  readonly before?: string;
  /** Value after applying this operation. */
  readonly after?: string;
}

/**
 * Structured preview for an AI patch plan.
 */
export interface BuilderPatchPreview {
  /** Target project identifier. */
  readonly projectId: string;
  /** Current project version. */
  readonly version: number;
  /** Current project checksum. */
  readonly checksum: string;
  /** Ordered operation preview list. */
  readonly operations: readonly BuilderPatchPreviewOperation[];
}

/**
 * Result envelope for transactional AI patch apply.
 */
export interface BuilderPatchApplyResult {
  /** Target project identifier. */
  readonly projectId: string;
  /** Updated project version after apply. */
  readonly version: number;
  /** Updated project checksum after apply. */
  readonly checksum: string;
  /** Number of operations applied. */
  readonly applied: number;
  /** Operation execution report. */
  readonly operations: readonly BuilderPatchPreviewOperation[];
}

/**
 * Form-style payload used to create or update one scene node.
 */
export interface BuilderSceneNodePayload {
  /** Stable scene identifier. */
  readonly sceneId: string;
  /** Stable node identifier. */
  readonly id: string;
  /** Optional explicit node-mode override for mixed editors. */
  readonly nodeKind?: string;
  /** Optional node-type update. */
  readonly nodeType?: string;
  /** Optional attached asset identifier. */
  readonly assetId?: string;
  /** Optional attached animation clip identifier. */
  readonly animationClipId?: string;
  /** Optional layer key for 2D nodes. */
  readonly layer?: string;
  /** Optional X position update. */
  readonly positionX?: string;
  /** Optional Y position update. */
  readonly positionY?: string;
  /** Optional Z position update. */
  readonly positionZ?: string;
  /** Optional X rotation update. */
  readonly rotationX?: string;
  /** Optional Y rotation update. */
  readonly rotationY?: string;
  /** Optional Z rotation update. */
  readonly rotationZ?: string;
  /** Optional X scale update. */
  readonly scaleX?: string;
  /** Optional Y scale update. */
  readonly scaleY?: string;
  /** Optional Z scale update. */
  readonly scaleZ?: string;
  /** Optional width update for 2D nodes. */
  readonly sizeWidth?: string;
  /** Optional height update for 2D nodes. */
  readonly sizeHeight?: string;
}

/**
 * Form-style payload used to update one authored scene without replacing nested state.
 */
export interface BuilderSceneFormPayload {
  /** Stable scene identifier. */
  readonly sceneId: string;
  /** Optional localized title key. */
  readonly titleKey?: string;
  /** Optional background asset path. */
  readonly background?: string;
  /** Optional scene mode override. */
  readonly sceneMode?: string;
  /** Optional geometry width update. */
  readonly geometryWidth?: string;
  /** Optional geometry height update. */
  readonly geometryHeight?: string;
  /** Optional spawn X update. */
  readonly spawnX?: string;
  /** Optional spawn Y update. */
  readonly spawnY?: string;
}

/**
 * Form-style payload used to update one authored NPC without replacing unspecified fields.
 */
export interface BuilderNpcFormPayload {
  /** Stable owning scene identifier. */
  readonly sceneId: string;
  /** Stable NPC identifier. */
  readonly npcId: string;
  /** Optional label-key update. */
  readonly labelKey?: string;
  /** Optional X coordinate update. */
  readonly x?: string;
  /** Optional Y coordinate update. */
  readonly y?: string;
  /** Optional interaction radius update. */
  readonly interactRadius?: string;
  /** Optional comma-separated dialogue key list. */
  readonly dialogueKeys?: string;
  /** Optional wander radius update. */
  readonly wanderRadius?: string;
  /** Optional wander speed update. */
  readonly wanderSpeed?: string;
  /** Optional minimum idle pause update. */
  readonly idlePauseMinMs?: string;
  /** Optional maximum idle pause update. */
  readonly idlePauseMaxMs?: string;
  /** Optional greet toggle update. */
  readonly greetOnApproach?: string;
  /** Optional greeting line update. */
  readonly greetLineKey?: string;
}

/**
 * Form-style payload used to update one quest without clobbering authored step graphs.
 */
export interface BuilderQuestFormPayload {
  /** Stable quest identifier. */
  readonly questId: string;
  /** Updated quest title. */
  readonly title: string;
  /** Updated quest description. */
  readonly description: string;
  /** Trigger for the editable primary step. */
  readonly triggerId: string;
}

/**
 * Form-style payload used to queue a generation job with canonical defaults.
 */
export interface BuilderGenerationJobCreatePayload {
  /** Requested output kind. */
  readonly kind: GenerationJob["kind"];
  /** User-authored generation prompt. */
  readonly prompt: string;
  /** Optional target asset/entity identifier. */
  readonly targetId?: string;
}

/**
 * Form-style payload used to queue an automation run with canonical steps.
 */
export interface BuilderAutomationRunCreatePayload {
  /** Human-readable automation goal. */
  readonly goal: string;
}

/**
 * Form-style payload used to create a quest with canonical initial step defaults.
 */
export interface BuilderQuestCreatePayload {
  /** Stable quest identifier. */
  readonly id: string;
  /** Initial authored quest title. */
  readonly title: string;
  /** Initial authored quest description. */
  readonly description: string;
  /** Trigger for the initial authored quest step. */
  readonly triggerId: string;
}

/**
 * Form-style payload used to create a trigger with canonical optional scope fields.
 */
export interface BuilderTriggerCreatePayload {
  /** Stable trigger identifier. */
  readonly id: string;
  /** Human-readable trigger label. */
  readonly label: string;
  /** Trigger event type. */
  readonly event: TriggerDefinition["event"];
  /** Optional scene scope. */
  readonly sceneId?: string;
  /** Optional NPC scope. */
  readonly npcId?: string;
}

/**
 * Form-style payload used to create a dialogue graph with canonical root-node defaults.
 */
export interface BuilderDialogueGraphCreatePayload {
  /** Stable dialogue graph identifier. */
  readonly id: string;
  /** Human-readable graph title. */
  readonly title: string;
  /** Optional owning NPC identifier. */
  readonly npcId?: string;
  /** Root authored line key or inline draft line. */
  readonly line: string;
}

/**
 * Service contract for builder persistence operations.
 */
export interface BuilderService {
  /** Creates a fresh project from game baseline data. */
  createProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one builder project snapshot by id. */
  getProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one existing project snapshot without implicitly creating it. */
  peekProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one published release snapshot without implicitly creating it. */
  getPublishedProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Persists any scene changes for a specific project. */
  saveScene(
    projectId: string,
    payload: BuilderScenePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Applies a partial scene form update without replacing nested authored state. */
  saveSceneForm(
    projectId: string,
    payload: BuilderSceneFormPayload,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Persists or updates one authored scene node without clobbering unspecified fields. */
  saveSceneNode(
    projectId: string,
    payload: BuilderSceneNodePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Removes one authored scene node from a scene. */
  removeSceneNode(
    projectId: string,
    sceneId: string,
    nodeId: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Removes a scene from a project. */
  removeScene(projectId: string, sceneId: string): Promise<BuilderMutation<null> | null>;
  /** Persists an NPC payload into a scene. */
  saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null>;
  /** Applies a partial NPC form update without replacing authored AI/dialogue defaults. */
  saveNpcForm(
    projectId: string,
    payload: BuilderNpcFormPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null>;
  /** Removes an NPC from a project. */
  removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null>;
  /** Persists dialogue text for locale-scoped catalog. */
  saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
  ): Promise<BuilderMutation<string> | null>;
  /** Removes dialogue key for locale-scoped catalog. */
  removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
  ): Promise<BuilderMutation<string | null> | null>;
  /** Publishes or unpublishes a project. */
  publishProject(projectId: string, published: boolean): Promise<BuilderProjectSnapshot | null>;
  /** Finds a scene by project and scene id. */
  getScene(projectId: string, sceneId: string): Promise<SceneDefinition | null>;
  /** Finds an NPC from any project scene by character key. */
  findNpc(projectId: string, npcId: string): Promise<SceneNpcDefinition | null>;
  /** Lists scenes in canonical project order. */
  listScenes(projectId: string): Promise<readonly SceneDefinition[]>;
  /** Returns locale dictionary for one catalog. */
  getDialogues(projectId: string, locale: LocaleCode): Promise<Record<string, string>>;
  /** Lists authored assets. */
  listAssets(projectId: string): Promise<readonly BuilderAsset[]>;
  /** Persists authored asset metadata. */
  saveAsset(
    projectId: string,
    payload: BuilderAssetPayload,
  ): Promise<BuilderMutation<BuilderAsset> | null>;
  /** Removes one asset. */
  removeAsset(projectId: string, assetId: string): Promise<BuilderMutation<null> | null>;
  /** Lists authored animation clips. */
  listAnimationClips(projectId: string): Promise<readonly AnimationClip[]>;
  /** Persists an animation clip. */
  saveAnimationClip(
    projectId: string,
    payload: BuilderAnimationClipPayload,
  ): Promise<BuilderMutation<AnimationClip> | null>;
  /** Removes an animation clip. */
  removeAnimationClip(projectId: string, clipId: string): Promise<BuilderMutation<null> | null>;
  /** Lists authored dialogue graphs. */
  listDialogueGraphs(projectId: string): Promise<readonly DialogueGraph[]>;
  /** Persists a dialogue graph. */
  saveDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphPayload,
  ): Promise<BuilderMutation<DialogueGraph> | null>;
  /** Creates a dialogue graph using canonical domain-owned root-node defaults. */
  createDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphCreatePayload,
  ): Promise<BuilderMutation<DialogueGraph> | null>;
  /** Removes a dialogue graph. */
  removeDialogueGraph(projectId: string, graphId: string): Promise<BuilderMutation<null> | null>;
  /** Lists authored quests. */
  listQuests(projectId: string): Promise<readonly QuestDefinition[]>;
  /** Persists a quest. */
  saveQuest(
    projectId: string,
    payload: BuilderQuestPayload,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Creates a quest using canonical domain-owned initial-step defaults. */
  createQuest(
    projectId: string,
    payload: BuilderQuestCreatePayload,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Applies a partial quest form update without replacing authored branching steps. */
  saveQuestForm(
    projectId: string,
    payload: BuilderQuestFormPayload,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Removes a quest. */
  removeQuest(projectId: string, questId: string): Promise<BuilderMutation<null> | null>;
  /** Lists authored triggers. */
  listTriggers(projectId: string): Promise<readonly TriggerDefinition[]>;
  /** Persists a trigger. */
  saveTrigger(
    projectId: string,
    payload: BuilderTriggerPayload,
  ): Promise<BuilderMutation<TriggerDefinition> | null>;
  /** Creates a trigger using canonical domain-owned scope defaults. */
  createTrigger(
    projectId: string,
    payload: BuilderTriggerCreatePayload,
  ): Promise<BuilderMutation<TriggerDefinition> | null>;
  /** Removes a trigger. */
  removeTrigger(projectId: string, triggerId: string): Promise<BuilderMutation<null> | null>;
  /** Lists authored flags. */
  listFlags(projectId: string): Promise<readonly GameFlagDefinition[]>;
  /** Lists generation jobs. */
  listGenerationJobs(projectId: string): Promise<readonly GenerationJob[]>;
  /** Creates or updates a generation job. */
  saveGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobPayload,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Queues a generation job using canonical domain-owned defaults. */
  createGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobCreatePayload,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Updates a generation job review status. */
  approveGenerationJob(
    projectId: string,
    jobId: string,
    approved: boolean,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Lists generated artifacts. */
  listArtifacts(projectId: string): Promise<readonly GenerationArtifact[]>;
  /** Lists automation runs. */
  listAutomationRuns(projectId: string): Promise<readonly AutomationRun[]>;
  /** Persists an automation run. */
  saveAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunPayload,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Queues an automation run using canonical domain-owned workflow steps. */
  createAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunCreatePayload,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Updates automation review status. */
  approveAutomationRun(
    projectId: string,
    runId: string,
    approved: boolean,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Processes queued generation and automation work for all or one project. */
  processQueuedWork(projectId?: string): Promise<number>;
  /** Builds a deterministic preview for proposed AI patch operations. */
  previewArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
  ): Promise<BuilderPatchPreview | null>;
  /** Applies AI patch operations transactionally with optional version precondition. */
  applyArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
    expectedVersion?: number,
  ): Promise<BuilderPatchApplyResult | null>;
}

/**
 * Clones scene definitions while preserving compile-time shape.
 */
const cloneScene = (scene: SceneDefinition): SceneDefinition =>
  structuredClone(scene) as SceneDefinition;

const parseBuilderInteger = (value: string | undefined, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseNodeFloat = (value: string | undefined, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBuilderBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (typeof value !== "string") {
    return fallback;
  }

  if (value === "true" || value === "on" || value === "1") {
    return true;
  }

  if (value === "false" || value === "off" || value === "0") {
    return false;
  }

  return fallback;
};

const trimOptionalField = (value: string | undefined, fallback?: string): string | undefined => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const trimOrFallback = (value: string | undefined, fallback: string): string => {
  const trimmed = trimOptionalField(value);
  return trimmed ?? fallback;
};

const isSceneNode3d = (
  node: SceneNodeDefinition | undefined,
): node is Extract<SceneNodeDefinition, { readonly rotation: { readonly x: number } }> =>
  Boolean(node && "rotation" in node && "scale" in node);

const buildSceneNodeDefinition = (
  scene: SceneDefinition,
  payload: BuilderSceneNodePayload,
  existingNode: SceneNodeDefinition | undefined,
): SceneNodeDefinition | null => {
  const nodeId = payload.id.trim();
  if (nodeId.length === 0) {
    return null;
  }

  const use3d =
    payload.nodeKind === "3d" || scene.sceneMode === "3d" || isSceneNode3d(existingNode);

  if (use3d) {
    const current = isSceneNode3d(existingNode)
      ? existingNode
      : {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };
    const nextNodeType =
      payload.nodeType === "light" ||
      payload.nodeType === "camera" ||
      payload.nodeType === "spawn" ||
      payload.nodeType === "trigger" ||
      payload.nodeType === "model"
        ? payload.nodeType
        : isSceneNode3d(existingNode)
          ? existingNode.nodeType
          : "model";

    return {
      id: nodeId,
      nodeType: nextNodeType,
      assetId: trimOptionalField(payload.assetId, existingNode?.assetId),
      animationClipId: trimOptionalField(payload.animationClipId, existingNode?.animationClipId),
      position: {
        x: parseNodeFloat(payload.positionX, current.position.x),
        y: parseNodeFloat(payload.positionY, current.position.y),
        z: parseNodeFloat(payload.positionZ, current.position.z),
      },
      rotation: {
        x: parseNodeFloat(payload.rotationX, current.rotation.x),
        y: parseNodeFloat(payload.rotationY, current.rotation.y),
        z: parseNodeFloat(payload.rotationZ, current.rotation.z),
      },
      scale: {
        x: Math.max(0.1, parseNodeFloat(payload.scaleX, current.scale.x)),
        y: Math.max(0.1, parseNodeFloat(payload.scaleY, current.scale.y)),
        z: Math.max(0.1, parseNodeFloat(payload.scaleZ, current.scale.z)),
      },
    };
  }

  const current =
    existingNode && !isSceneNode3d(existingNode)
      ? existingNode
      : {
          position: { x: 0, y: 0 },
          size: { width: 64, height: 64 },
          layer: "foreground",
        };
  const nextNodeType =
    payload.nodeType === "tile" ||
    payload.nodeType === "spawn" ||
    payload.nodeType === "trigger" ||
    payload.nodeType === "camera" ||
    payload.nodeType === "sprite"
      ? payload.nodeType
      : existingNode && !isSceneNode3d(existingNode)
        ? existingNode.nodeType
        : "sprite";

  return {
    id: nodeId,
    nodeType: nextNodeType,
    assetId: trimOptionalField(payload.assetId, existingNode?.assetId),
    animationClipId: trimOptionalField(payload.animationClipId, existingNode?.animationClipId),
    position: {
      x: parseNodeFloat(payload.positionX, current.position.x),
      y: parseNodeFloat(payload.positionY, current.position.y),
    },
    size: {
      width: Math.max(1, parseNodeFloat(payload.sizeWidth, current.size.width)),
      height: Math.max(1, parseNodeFloat(payload.sizeHeight, current.size.height)),
    },
    layer: trimOptionalField(payload.layer, current.layer) ?? current.layer,
  };
};

/**
 * Converts a scene mutation into a stable mutation result payload.
 */
const sceneMutationResult = (
  projectId: string,
  sceneId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "scene",
  resourceId: sceneId,
  action,
});

/**
 * Converts an NPC mutation into a stable mutation result payload.
 */
const npcMutationResult = (
  projectId: string,
  npcId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "npc",
  resourceId: npcId,
  action,
});

/**
 * Converts a dialogue mutation into a stable mutation result payload.
 */
const dialogueMutationResult = (
  projectId: string,
  key: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "dialogue",
  resourceId: key,
  action,
});

const assetMutationResult = (
  projectId: string,
  assetId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "asset",
  resourceId: assetId,
  action,
});

const animationClipMutationResult = (
  projectId: string,
  clipId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "animationClip",
  resourceId: clipId,
  action,
});

const dialogueGraphMutationResult = (
  projectId: string,
  graphId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "dialogueGraph",
  resourceId: graphId,
  action,
});

const questMutationResult = (
  projectId: string,
  questId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "quest",
  resourceId: questId,
  action,
});

const triggerMutationResult = (
  projectId: string,
  triggerId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "trigger",
  resourceId: triggerId,
  action,
});

const generationJobMutationResult = (
  projectId: string,
  jobId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "generationJob",
  resourceId: jobId,
  action,
});

const automationRunMutationResult = (
  projectId: string,
  runId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "automationRun",
  resourceId: runId,
  action,
});

/**
 * Parses JSON-like AI patch payload values into runtime values.
 */
const parsePatchValue = (value: string): unknown => safeJsonParse<unknown>(value, value);

type PatchTarget =
  | {
      readonly kind: "dialogue";
      readonly locale: LocaleCode;
      readonly key: string;
    }
  | {
      readonly kind: "scene";
      readonly sceneId: string;
    };

/**
 * Resolves a limited patch target from a JSON-pointer-like path.
 */
const parsePatchTarget = (path: string): PatchTarget | null => {
  const parts = path
    .split("/")
    .filter((part) => part.length > 0)
    .map((part) => decodeURIComponent(part));

  if (parts[0] === "dialogues" && parts.length >= 3) {
    const locale = normalizeBuilderLocale(parts[1]);
    const key = parts.slice(2).join("/");
    if (key.length === 0) {
      return null;
    }

    return { kind: "dialogue", locale, key };
  }

  if (parts[0] === "scenes" && parts.length === 2 && parts[1]) {
    return { kind: "scene", sceneId: parts[1] };
  }

  return null;
};

/**
 * Prisma-backed builder store with immutable release snapshots.
 */
class PrismaBuilderService implements BuilderService {
  private readonly stateStore = createBuilderProjectStateStore();

  private async readProjectEntry(projectId: string): Promise<BuilderProjectStateEntry | null> {
    return this.stateStore.readProjectEntry(projectId);
  }

  private async mutateProject<T>(
    projectId: string,
    updatedBy: string,
    mutate: (
      state: BuilderProjectState,
    ) => { readonly ok: true; readonly payload: T } | { readonly ok: false },
  ): Promise<BuilderProjectStateMutation<T> | null> {
    return this.stateStore.updateProject(projectId, updatedBy, mutate);
  }

  public async createProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return this.stateStore.createProject(projectId);
  }

  public async getProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return this.stateStore.readProjectSnapshot(projectId);
  }

  public async peekProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return this.getProject(projectId);
  }

  public async getPublishedProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return this.stateStore.readPublishedProjectSnapshot(projectId);
  }

  public async saveScene(
    projectId: string,
    payload: BuilderScenePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject(projectId, "builder-editor", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.scenes, payload.id)
        ? "updated"
        : "created";
      state.scenes[payload.id] = cloneScene(payload.scene);
      return {
        ok: true,
        payload: {
          action,
          scene: cloneScene(state.scenes[payload.id] as SceneDefinition),
        },
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.scene,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async saveSceneForm(
    projectId: string,
    payload: BuilderSceneFormPayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      "builder-editor",
      (state) => {
        const current = state.scenes[payload.sceneId];
        if (!current) {
          return { ok: false };
        }

        const updatedScene: SceneDefinition = {
          ...current,
          id: payload.sceneId,
          titleKey: trimOrFallback(payload.titleKey, current.titleKey),
          background: trimOrFallback(payload.background, current.background),
          sceneMode:
            payload.sceneMode === "3d"
              ? "3d"
              : payload.sceneMode === "2d"
                ? "2d"
                : current.sceneMode,
          geometry: {
            width: Math.max(1, parseBuilderInteger(payload.geometryWidth, current.geometry.width)),
            height: Math.max(
              1,
              parseBuilderInteger(payload.geometryHeight, current.geometry.height),
            ),
          },
          spawn: {
            x: parseBuilderInteger(payload.spawnX, current.spawn.x),
            y: parseBuilderInteger(payload.spawnY, current.spawn.y),
          },
        };

        state.scenes[payload.sceneId] = updatedScene;

        return {
          ok: true,
          payload: cloneScene(updatedScene),
        };
      },
    );
    if (!mutation) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, payload.sceneId, "updated"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async saveSceneNode(
    projectId: string,
    payload: BuilderSceneNodePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      "builder-editor",
      (state) => {
        const scene = state.scenes[payload.sceneId];
        if (!scene) {
          return { ok: false };
        }

        const existingNodes = [...(scene.nodes ?? [])];
        const existingIndex = existingNodes.findIndex((node) => node.id === payload.id);
        const existingNode = existingIndex >= 0 ? existingNodes[existingIndex] : undefined;
        const nextNode = buildSceneNodeDefinition(scene, payload, existingNode);
        if (!nextNode) {
          return { ok: false };
        }

        if (existingIndex >= 0) {
          existingNodes[existingIndex] = nextNode;
        } else {
          existingNodes.push(nextNode);
        }

        const nextScene: SceneDefinition = {
          ...scene,
          nodes: existingNodes,
        };
        state.scenes[payload.sceneId] = nextScene;

        return {
          ok: true,
          payload: cloneScene(nextScene),
        };
      },
    );
    if (!mutation) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, payload.sceneId, "updated"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeSceneNode(
    projectId: string,
    sceneId: string,
    nodeId: string,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      "builder-editor",
      (state) => {
        const scene = state.scenes[sceneId];
        if (!scene) {
          return { ok: false };
        }

        const nextNodes = (scene.nodes ?? []).filter((node) => node.id !== nodeId);
        if (nextNodes.length === (scene.nodes ?? []).length) {
          return { ok: false };
        }

        const nextScene: SceneDefinition = {
          ...scene,
          nodes: nextNodes,
        };
        state.scenes[sceneId] = nextScene;

        return {
          ok: true,
          payload: cloneScene(nextScene),
        };
      },
    );
    if (!mutation) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, sceneId, "updated"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeScene(
    projectId: string,
    sceneId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-editor", (state) => {
      if (!Object.hasOwn(state.scenes, sceneId)) {
        return { ok: false };
      }
      delete state.scenes[sceneId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, sceneId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const mutation = await this.mutateProject<{
      readonly action: BuilderMutationResult["action"];
      readonly npc: SceneNpcDefinition;
    }>(projectId, "builder-editor", (state) => {
      const scene = state.scenes[payload.sceneId];
      if (!scene) {
        return { ok: false };
      }

      const existingIndex = scene.npcs.findIndex(
        (candidate) => candidate.characterKey === payload.npc.characterKey,
      );
      const nextNpc = structuredClone(payload.npc) as SceneNpcDefinition;
      const nextNpcs = [...scene.npcs];
      if (existingIndex === -1) {
        nextNpcs.push(nextNpc);
      } else {
        nextNpcs[existingIndex] = nextNpc;
      }

      state.scenes[payload.sceneId] = {
        ...scene,
        npcs: nextNpcs,
      };
      const action: BuilderMutationResult["action"] = existingIndex === -1 ? "created" : "updated";

      return {
        ok: true,
        payload: {
          action,
          npc: nextNpc,
        },
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: npcMutationResult(projectId, payload.npc.characterKey, mutation.payload.action),
      payload: mutation.payload.npc,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async saveNpcForm(
    projectId: string,
    payload: BuilderNpcFormPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const mutation = await this.mutateProject<{
      readonly npc: SceneNpcDefinition;
    }>(projectId, "builder-editor", (state) => {
      const scene = state.scenes[payload.sceneId];
      if (!scene) {
        return { ok: false };
      }

      const existingIndex = scene.npcs.findIndex(
        (candidate) => candidate.characterKey === payload.npcId,
      );
      if (existingIndex < 0) {
        return { ok: false };
      }

      const currentNpc = scene.npcs[existingIndex] as SceneNpcDefinition;
      const nextDialogueKeys = (payload.dialogueKeys ?? "")
        .split(",")
        .map((key) => key.trim())
        .filter((key) => key.length > 0);

      const nextNpc: SceneNpcDefinition = {
        ...currentNpc,
        characterKey: payload.npcId,
        labelKey: trimOrFallback(payload.labelKey, currentNpc.labelKey),
        x: parseBuilderInteger(payload.x, currentNpc.x),
        y: parseBuilderInteger(payload.y, currentNpc.y),
        interactRadius: Math.max(
          1,
          parseBuilderInteger(payload.interactRadius, currentNpc.interactRadius),
        ),
        dialogueKeys: nextDialogueKeys.length > 0 ? nextDialogueKeys : [...currentNpc.dialogueKeys],
        ai: {
          ...currentNpc.ai,
          wanderRadius: Math.max(
            0,
            parseBuilderInteger(payload.wanderRadius, currentNpc.ai.wanderRadius),
          ),
          wanderSpeed: Math.max(0, parseNodeFloat(payload.wanderSpeed, currentNpc.ai.wanderSpeed)),
          idlePauseMs: [
            Math.max(0, parseBuilderInteger(payload.idlePauseMinMs, currentNpc.ai.idlePauseMs[0])),
            Math.max(0, parseBuilderInteger(payload.idlePauseMaxMs, currentNpc.ai.idlePauseMs[1])),
          ] as [number, number],
          greetOnApproach: parseBuilderBoolean(
            payload.greetOnApproach,
            currentNpc.ai.greetOnApproach,
          ),
          greetLineKey: trimOrFallback(payload.greetLineKey, currentNpc.ai.greetLineKey),
        },
      };

      const nextNpcs = [...scene.npcs];
      nextNpcs[existingIndex] = nextNpc;
      state.scenes[payload.sceneId] = {
        ...scene,
        npcs: nextNpcs,
      };

      return {
        ok: true,
        payload: {
          npc: structuredClone(nextNpc) as SceneNpcDefinition,
        },
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: npcMutationResult(projectId, payload.npcId, "updated"),
      payload: mutation.payload.npc,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null> {
    const mutation = await this.mutateProject<SceneNpcDefinition[]>(
      projectId,
      "builder-editor",
      (state) => {
        const scene = state.scenes[sceneId];
        if (!scene) {
          return { ok: false };
        }

        const nextNpcs = scene.npcs.filter((candidate) => candidate.characterKey !== npcId);
        if (nextNpcs.length === scene.npcs.length) {
          return { ok: false };
        }

        state.scenes[sceneId] = {
          ...scene,
          npcs: nextNpcs,
        };

        return {
          ok: true,
          payload: structuredClone(nextNpcs) as SceneNpcDefinition[],
        };
      },
    );
    if (!mutation) {
      return null;
    }

    return {
      result: npcMutationResult(projectId, npcId, "deleted"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
  ): Promise<BuilderMutation<string> | null> {
    const locale = normalizeBuilderLocale(payload.locale);
    const mutation = await this.mutateProject(projectId, "builder-editor", (state) => {
      const catalog = state.dialogues[locale];
      const action: BuilderMutationResult["action"] = Object.hasOwn(catalog, payload.key)
        ? "updated"
        : "created";
      catalog[payload.key] = payload.text;
      return {
        ok: true,
        payload: {
          action,
          text: payload.text,
        },
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: dialogueMutationResult(projectId, payload.key, mutation.payload.action),
      payload: mutation.payload.text,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
  ): Promise<BuilderMutation<string | null> | null> {
    const normalizedLocale = normalizeBuilderLocale(locale);
    const mutation = await this.mutateProject(projectId, "builder-editor", (state) => {
      const catalog = state.dialogues[normalizedLocale];
      if (!Object.hasOwn(catalog, key)) {
        return { ok: false };
      }

      delete catalog[key];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      result: dialogueMutationResult(projectId, key, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async publishProject(
    projectId: string,
    published: boolean,
  ): Promise<BuilderProjectSnapshot | null> {
    return this.stateStore.publishProject(projectId, published);
  }

  public async getScene(projectId: string, sceneId: string): Promise<SceneDefinition | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    const scene = entry.state.scenes[sceneId];
    return scene ? cloneScene(scene) : null;
  }

  public async findNpc(projectId: string, npcId: string): Promise<SceneNpcDefinition | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    for (const scene of Object.values(entry.state.scenes)) {
      const npc = scene.npcs.find((candidate) => candidate.characterKey === npcId);
      if (npc) {
        return structuredClone(npc) as SceneNpcDefinition;
      }
    }

    return null;
  }

  public async listScenes(projectId: string): Promise<readonly SceneDefinition[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }

    return Object.values(entry.state.scenes).map((scene) => cloneScene(scene));
  }

  public async getDialogues(
    projectId: string,
    locale: LocaleCode,
  ): Promise<Record<string, string>> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return {};
    }

    const normalizedLocale = normalizeBuilderLocale(locale);
    return {
      ...(entry.state.dialogues[normalizedLocale] ?? entry.state.dialogues["en-US"]),
    };
  }

  public async listAssets(projectId: string): Promise<readonly BuilderAsset[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.assets).map((asset) => structuredClone(asset));
  }

  public async saveAsset(
    projectId: string,
    payload: BuilderAssetPayload,
  ): Promise<BuilderMutation<BuilderAsset> | null> {
    const mutation = await this.mutateProject(projectId, "builder-assets", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.assets, payload.id)
        ? "updated"
        : "created";
      state.assets[payload.id] = structuredClone(payload.asset);
      return {
        ok: true,
        payload: {
          action,
          asset: structuredClone(state.assets[payload.id] as BuilderAsset),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: assetMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.asset,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeAsset(
    projectId: string,
    assetId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-assets", (state) => {
      if (!Object.hasOwn(state.assets, assetId)) {
        return { ok: false };
      }
      delete state.assets[assetId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: assetMutationResult(projectId, assetId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listAnimationClips(projectId: string): Promise<readonly AnimationClip[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.animationClips).map((clip) => structuredClone(clip));
  }

  public async saveAnimationClip(
    projectId: string,
    payload: BuilderAnimationClipPayload,
  ): Promise<BuilderMutation<AnimationClip> | null> {
    const mutation = await this.mutateProject(projectId, "builder-assets", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.animationClips,
        payload.id,
      )
        ? "updated"
        : "created";
      state.animationClips[payload.id] = structuredClone(payload.clip);
      return {
        ok: true,
        payload: {
          action,
          clip: structuredClone(state.animationClips[payload.id] as AnimationClip),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: animationClipMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.clip,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeAnimationClip(
    projectId: string,
    clipId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-assets", (state) => {
      if (!Object.hasOwn(state.animationClips, clipId)) {
        return { ok: false };
      }
      delete state.animationClips[clipId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: animationClipMutationResult(projectId, clipId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listDialogueGraphs(projectId: string): Promise<readonly DialogueGraph[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.dialogueGraphs).map((graph) => structuredClone(graph));
  }

  public async saveDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphPayload,
  ): Promise<BuilderMutation<DialogueGraph> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.dialogueGraphs,
        payload.id,
      )
        ? "updated"
        : "created";
      state.dialogueGraphs[payload.id] = structuredClone(payload.graph);
      return {
        ok: true,
        payload: {
          action,
          graph: structuredClone(state.dialogueGraphs[payload.id] as DialogueGraph),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: dialogueGraphMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.graph,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async createDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphCreatePayload,
  ): Promise<BuilderMutation<DialogueGraph> | null> {
    const graphId = payload.id.trim();
    const title = payload.title.trim();
    const line = payload.line.trim();
    const npcId = trimOptionalField(payload.npcId);
    const now = Date.now();

    return this.saveDialogueGraph(projectId, {
      id: graphId,
      graph: {
        id: graphId,
        title,
        npcId,
        rootNodeId: "root",
        nodes: [
          {
            id: "root",
            line,
            edges: [],
          },
        ],
        createdAtMs: now,
        updatedAtMs: now,
      },
    });
  }

  public async removeDialogueGraph(
    projectId: string,
    graphId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      if (!Object.hasOwn(state.dialogueGraphs, graphId)) {
        return { ok: false };
      }
      delete state.dialogueGraphs[graphId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: dialogueGraphMutationResult(projectId, graphId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listQuests(projectId: string): Promise<readonly QuestDefinition[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.quests).map((quest) => structuredClone(quest));
  }

  public async saveQuest(
    projectId: string,
    payload: BuilderQuestPayload,
  ): Promise<BuilderMutation<QuestDefinition> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.quests, payload.id)
        ? "updated"
        : "created";
      state.quests[payload.id] = structuredClone(payload.quest);
      return {
        ok: true,
        payload: {
          action,
          quest: structuredClone(state.quests[payload.id] as QuestDefinition),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: questMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.quest,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async createQuest(
    projectId: string,
    payload: BuilderQuestCreatePayload,
  ): Promise<BuilderMutation<QuestDefinition> | null> {
    const questId = payload.id.trim();
    const title = payload.title.trim();
    const description = payload.description.trim();
    const triggerId = payload.triggerId.trim();

    return this.saveQuest(projectId, {
      id: questId,
      quest: {
        id: questId,
        title,
        description,
        steps: [
          {
            id: `${questId}.step.1`,
            title,
            description,
            triggerId,
          },
        ],
      },
    });
  }

  public async saveQuestForm(
    projectId: string,
    payload: BuilderQuestFormPayload,
  ): Promise<BuilderMutation<QuestDefinition> | null> {
    const mutation = await this.mutateProject<QuestDefinition>(
      projectId,
      "builder-mechanics",
      (state) => {
        const existing = state.quests[payload.questId];
        if (!existing) {
          return { ok: false };
        }

        const currentPrimaryStep = existing.steps[0];
        const primaryStepId = currentPrimaryStep?.id ?? `${payload.questId}.step.1`;
        const nextSteps = existing.steps.length > 0 ? [...existing.steps] : [];
        const nextPrimaryStep = {
          id: primaryStepId,
          title: payload.title.trim(),
          description: payload.description.trim(),
          triggerId: payload.triggerId.trim(),
        };

        if (nextSteps.length > 0) {
          nextSteps[0] = nextPrimaryStep;
        } else {
          nextSteps.push(nextPrimaryStep);
        }

        const nextQuest: QuestDefinition = {
          ...existing,
          id: payload.questId,
          title: payload.title.trim(),
          description: payload.description.trim(),
          steps: nextSteps,
        };
        state.quests[payload.questId] = nextQuest;

        return {
          ok: true,
          payload: structuredClone(nextQuest) as QuestDefinition,
        };
      },
    );
    if (!mutation) {
      return null;
    }

    return {
      result: questMutationResult(projectId, payload.questId, "updated"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async removeQuest(
    projectId: string,
    questId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      if (!Object.hasOwn(state.quests, questId)) {
        return { ok: false };
      }
      delete state.quests[questId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: questMutationResult(projectId, questId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listTriggers(projectId: string): Promise<readonly TriggerDefinition[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.triggers).map((trigger) => structuredClone(trigger));
  }

  public async saveTrigger(
    projectId: string,
    payload: BuilderTriggerPayload,
  ): Promise<BuilderMutation<TriggerDefinition> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.triggers, payload.id)
        ? "updated"
        : "created";
      state.triggers[payload.id] = structuredClone(payload.trigger);
      return {
        ok: true,
        payload: {
          action,
          trigger: structuredClone(state.triggers[payload.id] as TriggerDefinition),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: triggerMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.trigger,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async createTrigger(
    projectId: string,
    payload: BuilderTriggerCreatePayload,
  ): Promise<BuilderMutation<TriggerDefinition> | null> {
    const triggerId = payload.id.trim();

    return this.saveTrigger(projectId, {
      id: triggerId,
      trigger: {
        id: triggerId,
        label: payload.label.trim(),
        event: payload.event,
        sceneId: trimOptionalField(payload.sceneId),
        npcId: trimOptionalField(payload.npcId),
      },
    });
  }

  public async removeTrigger(
    projectId: string,
    triggerId: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, "builder-mechanics", (state) => {
      if (!Object.hasOwn(state.triggers, triggerId)) {
        return { ok: false };
      }
      delete state.triggers[triggerId];
      return {
        ok: true,
        payload: null,
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: triggerMutationResult(projectId, triggerId, "deleted"),
      payload: null,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listFlags(projectId: string): Promise<readonly GameFlagDefinition[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.flags).map((flag) => structuredClone(flag));
  }

  public async listGenerationJobs(projectId: string): Promise<readonly GenerationJob[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.generationJobs).map((job) => structuredClone(job));
  }

  public async saveGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobPayload,
  ): Promise<BuilderMutation<GenerationJob> | null> {
    const mutation = await this.mutateProject(projectId, "builder-ai", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.generationJobs,
        payload.id,
      )
        ? "updated"
        : "queued";
      state.generationJobs[payload.id] = structuredClone(payload.job);
      return {
        ok: true,
        payload: {
          action,
          job: structuredClone(state.generationJobs[payload.id] as GenerationJob),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: generationJobMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.job,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async createGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobCreatePayload,
  ): Promise<BuilderMutation<GenerationJob> | null> {
    const jobId = `job.${crypto.randomUUID()}`;
    const now = Date.now();
    return this.saveGenerationJob(projectId, {
      id: jobId,
      job: {
        id: jobId,
        kind: payload.kind,
        status: "queued",
        prompt: payload.prompt.trim(),
        targetId: trimOptionalField(payload.targetId),
        artifactIds: [],
        statusMessage: "job.queued-for-processing",
        createdAtMs: now,
        updatedAtMs: now,
      },
    });
  }

  public async approveGenerationJob(
    projectId: string,
    jobId: string,
    approved: boolean,
  ): Promise<BuilderMutation<GenerationJob> | null> {
    const mutation = await this.mutateProject<GenerationJob>(projectId, "builder-ai", (state) => {
      const job = state.generationJobs[jobId];
      if (!job) {
        return { ok: false };
      }

      if (approved) {
        const primaryArtifact = job.artifactIds
          .map((artifactId) => state.artifacts[artifactId])
          .find((artifact): artifact is GenerationArtifact => artifact !== undefined);
        for (const artifactId of job.artifactIds) {
          const artifact = state.artifacts[artifactId];
          if (artifact) {
            state.artifacts[artifactId] = {
              ...artifact,
              approved: true,
            };
          }
        }
        if (job.kind !== "voice-line" && primaryArtifact?.previewSource) {
          const generatedAssetId = `asset.generated.${job.id}`;
          if (!state.assets[generatedAssetId]) {
            state.assets[generatedAssetId] = {
              id: generatedAssetId,
              kind: job.kind === "animation-plan" ? "sprite-sheet" : job.kind,
              label: `generation.asset.label.generated:${job.kind === "animation-plan" ? "sprite-sheet" : job.kind}:${job.id}`,
              sceneMode: "2d",
              source: primaryArtifact.previewSource,
              tags: ["generated", job.kind],
              variants: [
                {
                  id: `${generatedAssetId}.runtime`,
                  format: primaryArtifact.mimeType?.split("/")[1] ?? "dat",
                  source: primaryArtifact.previewSource,
                  usage: "runtime",
                },
              ],
              approved: true,
              createdAtMs: job.createdAtMs,
              updatedAtMs: Date.now(),
            };
          }
        }
      }

      state.generationJobs[jobId] = {
        ...job,
        status: approved ? "succeeded" : "canceled",
        statusMessage: approved ? "job.approved-and-attached" : "job.canceled-by-review",
        updatedAtMs: Date.now(),
      };

      return {
        ok: true,
        payload: structuredClone(state.generationJobs[jobId] as GenerationJob),
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: generationJobMutationResult(projectId, jobId, approved ? "approved" : "canceled"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async listArtifacts(projectId: string): Promise<readonly GenerationArtifact[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.artifacts).map((artifact) => structuredClone(artifact));
  }

  public async listAutomationRuns(projectId: string): Promise<readonly AutomationRun[]> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return [];
    }
    return Object.values(entry.state.automationRuns).map((run) => structuredClone(run));
  }

  public async saveAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunPayload,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const mutation = await this.mutateProject(projectId, "builder-automation", (state) => {
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.automationRuns,
        payload.id,
      )
        ? "updated"
        : "queued";
      state.automationRuns[payload.id] = structuredClone(payload.run);
      return {
        ok: true,
        payload: {
          action,
          run: structuredClone(state.automationRuns[payload.id] as AutomationRun),
        },
      };
    });
    if (!mutation) {
      return null;
    }
    return {
      result: automationRunMutationResult(projectId, payload.id, mutation.payload.action),
      payload: mutation.payload.run,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async createAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunCreatePayload,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const runId = `run.${crypto.randomUUID()}`;
    const now = Date.now();
    return this.saveAutomationRun(projectId, {
      id: runId,
      run: {
        id: runId,
        status: "queued",
        goal: payload.goal.trim(),
        steps: [
          {
            id: `${runId}.browser`,
            action: "browser",
            summary: "automation.step.capture-review-context",
            status: "pending",
          },
          {
            id: `${runId}.builder`,
            action: "builder",
            summary: "automation.step.prepare-draft-plan",
            status: "pending",
          },
          {
            id: `${runId}.attach`,
            action: "attach-file",
            summary: "automation.step.attach-review-evidence",
            status: "pending",
          },
        ],
        artifactIds: [],
        statusMessage: "automation.queued-for-processing",
        createdAtMs: now,
        updatedAtMs: now,
      },
    });
  }

  public async approveAutomationRun(
    projectId: string,
    runId: string,
    approved: boolean,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const mutation = await this.mutateProject<AutomationRun>(
      projectId,
      "builder-automation",
      (state) => {
        const run = state.automationRuns[runId];
        if (!run) {
          return { ok: false };
        }
        state.automationRuns[runId] = {
          ...run,
          status: approved ? "succeeded" : "canceled",
          statusMessage: approved
            ? "automation.approved-for-apply"
            : "automation.canceled-by-review",
          updatedAtMs: Date.now(),
        };
        return {
          ok: true,
          payload: structuredClone(state.automationRuns[runId] as AutomationRun),
        };
      },
    );
    if (!mutation) {
      return null;
    }
    return {
      result: automationRunMutationResult(projectId, runId, approved ? "approved" : "canceled"),
      payload: mutation.payload,
      checksum: mutation.entry.row.checksum,
    };
  }

  public async processQueuedWork(projectId?: string): Promise<number> {
    const entries = await this.stateStore.listProjectEntries(projectId);

    let processedCount = 0;
    for (const entry of entries) {
      const state = entry.state;
      let changed = false;
      for (const [jobId, job] of Object.entries(state.generationJobs)) {
        if (job.status !== "queued") {
          continue;
        }
        const runningJob: GenerationJob = {
          ...job,
          status: "running",
          statusMessage: "processing",
          updatedAtMs: Date.now(),
        };
        const result = await executeGenerationJob(entry.row.id, runningJob);
        if (result.ok) {
          for (const artifact of result.data.artifacts) {
            state.artifacts[artifact.id] = artifact;
          }
          state.generationJobs[jobId] = {
            ...runningJob,
            status: "blocked_for_approval",
            artifactIds: result.data.artifacts.map((artifact) => artifact.id),
            statusMessage: result.data.statusMessage,
            updatedAtMs: Date.now(),
          };
        } else {
          state.generationJobs[jobId] = {
            ...runningJob,
            status: "failed",
            artifactIds: [],
            statusMessage: result.error,
            updatedAtMs: Date.now(),
          };
        }
        processedCount += 1;
        changed = true;
      }

      for (const [runId, run] of Object.entries(state.automationRuns)) {
        if (run.status !== "queued") {
          continue;
        }
        const runningRun: AutomationRun = {
          ...run,
          status: "running",
          statusMessage: "processing",
          updatedAtMs: Date.now(),
        };
        const result = await executeAutomationRun(entry.row.id, runningRun);
        if (result.ok) {
          for (const artifact of result.data.artifacts) {
            state.artifacts[artifact.id] = artifact;
          }
          state.automationRuns[runId] = {
            ...runningRun,
            status: "blocked_for_approval",
            artifactIds: result.data.artifacts.map((artifact) => artifact.id),
            steps: result.data.steps,
            statusMessage: result.data.statusMessage,
            updatedAtMs: Date.now(),
          };
        } else {
          state.automationRuns[runId] = {
            ...runningRun,
            status: "failed",
            statusMessage: result.error,
            steps: runningRun.steps.map((step, index) => ({
              ...step,
              status: index === 0 ? "failed" : "pending",
            })),
            updatedAtMs: Date.now(),
          };
        }
        processedCount += 1;
        changed = true;
      }

      if (changed) {
        await this.stateStore.updateProject(entry.row.id, "builder-worker", (nextState) => {
          Object.assign(nextState, structuredClone(state));
          return {
            ok: true,
            payload: null,
          };
        });
      }
    }

    return processedCount;
  }

  public async previewArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
  ): Promise<BuilderPatchPreview | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    const previewState = structuredClone(entry.state) as BuilderProjectState;
    const reports: BuilderPatchPreviewOperation[] = [];

    for (const operation of operations) {
      const target = parsePatchTarget(operation.path);
      if (!target) {
        reports.push({
          operation,
          valid: false,
          message: "unsupported-path",
        });
        continue;
      }

      if (target.kind === "dialogue") {
        const catalog = previewState.dialogues[target.locale];
        const before = catalog[target.key];
        if (operation.op === "remove") {
          delete catalog[target.key];
          reports.push({
            operation,
            valid: true,
            message: "ok",
            before,
          });
          continue;
        }

        const nextValue = parsePatchValue(operation.value);
        const text = typeof nextValue === "string" ? nextValue : JSON.stringify(nextValue);
        catalog[target.key] = text;
        reports.push({
          operation,
          valid: true,
          message: "ok",
          before,
          after: text,
        });
        continue;
      }

      const beforeScene = previewState.scenes[target.sceneId];
      if (operation.op === "remove") {
        delete previewState.scenes[target.sceneId];
        reports.push({
          operation,
          valid: true,
          message: "ok",
          before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        });
        continue;
      }

      const parsed = parsePatchValue(operation.value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        reports.push({
          operation,
          valid: false,
          message: "invalid-scene-payload",
          before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        });
        continue;
      }

      const nextScene = {
        ...(parsed as SceneDefinition),
        id: target.sceneId,
      } as SceneDefinition;
      previewState.scenes[target.sceneId] = structuredClone(nextScene);
      reports.push({
        operation,
        valid: true,
        message: "ok",
        before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        after: JSON.stringify(nextScene),
      });
    }

    return {
      projectId: entry.row.id,
      version: entry.row.version,
      checksum: entry.row.checksum,
      operations: reports,
    };
  }

  public async applyArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
    expectedVersion?: number,
  ): Promise<BuilderPatchApplyResult | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }
    if (typeof expectedVersion === "number" && expectedVersion !== entry.row.version) {
      return null;
    }

    const preview = await this.previewArtifactPatch(entry.row.id, operations);
    if (!preview) {
      return null;
    }

    if (preview.operations.some((operation) => !operation.valid)) {
      return {
        projectId: entry.row.id,
        version: entry.row.version,
        checksum: entry.row.checksum,
        applied: 0,
        operations: preview.operations,
      };
    }

    const mutation = await this.mutateProject(projectId, "builder-ai", (nextState) => {
      for (const operation of operations) {
        const target = parsePatchTarget(operation.path);
        if (!target) {
          continue;
        }

        if (target.kind === "dialogue") {
          if (operation.op === "remove") {
            delete nextState.dialogues[target.locale][target.key];
            continue;
          }

          const parsed = parsePatchValue(operation.value);
          nextState.dialogues[target.locale][target.key] =
            typeof parsed === "string" ? parsed : JSON.stringify(parsed);
          continue;
        }

        if (operation.op === "remove") {
          delete nextState.scenes[target.sceneId];
          continue;
        }

        const parsed = parsePatchValue(operation.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          continue;
        }

        nextState.scenes[target.sceneId] = {
          ...(parsed as SceneDefinition),
          id: target.sceneId,
        };
      }

      return {
        ok: true,
        payload: operations.length,
      };
    });
    if (!mutation) {
      return null;
    }

    return {
      projectId: mutation.entry.row.id,
      version: mutation.entry.row.version,
      checksum: mutation.entry.row.checksum,
      applied: mutation.payload,
      operations: preview.operations,
    };
  }
}

const projects = new PrismaBuilderService();

/**
 * Shared builder service facade used by builder views and API routes.
 */
export const createBuilderService = (): BuilderService => projects;

/** Shared singleton for builder operations. */
export const builderService = createBuilderService();

/** Re-exported default project id for route and request-context callers. */
export { defaultBuilderProjectId };

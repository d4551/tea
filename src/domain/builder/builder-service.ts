import { appConfig, type LocaleCode } from "../../config/environment.ts";
import {
  AUTOMATION_STEP_KIND_UNSUPPORTED_ERROR,
  DEFAULT_ANIMATION_FRAME_COUNT,
  DEFAULT_ANIMATION_PLAYBACK_FPS,
  DEFAULT_SCENE_GEOMETRY_HEIGHT,
  DEFAULT_SCENE_GEOMETRY_WIDTH,
  DEFAULT_SCENE_NODE_SIZE,
  DEFAULT_SCENE_SPAWN_X,
  DEFAULT_SCENE_SPAWN_Y,
} from "../../shared/constants/builder-defaults.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AnimationClip,
  AutomationRun,
  AutomationRunStep,
  AutomationStepSpec,
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
  Facing,
  GameFlagDefinition,
  GenerationArtifact,
  GenerationJob,
  ParticleEmitterConfig,
  QuestDefinition,
  SceneDefinition,
  SceneNodeDefinition,
  SceneNpcDefinition,
  TilemapDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import { acceptUnknown, safeJsonParse } from "../../shared/utils/safe-json.ts";
import {
  type BuilderProjectSnapshot,
  type BuilderProjectState,
  type BuilderProjectStateEntry,
  type BuilderProjectStateMutation,
  createBuilderProjectStateStore,
  defaultBuilderProjectId,
  normalizeBuilderLocale,
} from "./builder-project-state-store.ts";
import {
  type BuilderPublishValidationIssue,
  validateBuilderProjectForPublish,
} from "./builder-publish-validation.ts";

/**
 * Result of attempting to publish a builder project.
 */
export type BuilderPublishResult =
  | {
      readonly ok: true;
      readonly snapshot: BuilderProjectSnapshot;
    }
  | {
      readonly ok: false;
      readonly issues: readonly BuilderPublishValidationIssue[];
    };

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
  /** Optional particle emitter config (JSON string). */
  readonly particleEmitter?: string;
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
  /** Optional tilemap definition (JSON string). */
  readonly tilemap?: string;
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
 * Form-style payload used to create one authored scene with canonical defaults.
 */
export interface BuilderSceneCreatePayload {
  /** Stable scene identifier. */
  readonly id: string;
  /** Localized title key. */
  readonly titleKey: string;
  /** Background asset path or key. */
  readonly background: string;
  /** Optional scene mode override. */
  readonly sceneMode?: string;
  /** Optional geometry width input. */
  readonly geometryWidth?: string;
  /** Optional geometry height input. */
  readonly geometryHeight?: string;
  /** Optional spawn X input. */
  readonly spawnX?: string;
  /** Optional spawn Y input. */
  readonly spawnY?: string;
}

/**
 * Form-style payload used to create one authored asset with canonical defaults.
 */
export interface BuilderAssetCreatePayload {
  /** Stable asset identifier. */
  readonly id?: string;
  /** Human-readable label. */
  readonly label?: string;
  /** Asset kind. */
  readonly kind?: BuilderAsset["kind"];
  /** Optional scene mode override. */
  readonly sceneMode?: string;
  /** Source URL or stored public path. */
  readonly source: string;
  /** Optional source filename for id derivation. */
  readonly sourceName?: string;
  /** Optional source MIME type from the transport layer. */
  readonly sourceMimeType?: string;
}

/**
 * Form-style payload used to create one animation clip with canonical defaults.
 */
export interface BuilderAnimationClipCreatePayload {
  /** Stable clip identifier. */
  readonly id: string;
  /** Target asset identifier. */
  readonly assetId: string;
  /** State-tag or animation label. */
  readonly stateTag: string;
  /** Optional playback FPS input. */
  readonly playbackFps?: string;
  /** Optional frame-count input. */
  readonly frameCount?: string;
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
  /** Optional JSON-encoded executable step plan. */
  readonly stepsJson?: string;
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
  createProject(projectId: string, updatedBy?: string): Promise<BuilderProjectSnapshot | null>;
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Creates a scene using canonical domain-owned defaults. */
  createScene(
    projectId: string,
    payload: BuilderSceneCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Applies a partial scene form update without replacing nested authored state. */
  saveSceneForm(
    projectId: string,
    payload: BuilderSceneFormPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Persists or updates one authored scene node without clobbering unspecified fields. */
  saveSceneNode(
    projectId: string,
    payload: BuilderSceneNodePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Removes one authored scene node from a scene. */
  removeSceneNode(
    projectId: string,
    sceneId: string,
    nodeId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Removes a scene from a project. */
  removeScene(
    projectId: string,
    sceneId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Persists an NPC payload into a scene. */
  saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null>;
  /** Applies a partial NPC form update without replacing authored AI/dialogue defaults. */
  saveNpcForm(
    projectId: string,
    payload: BuilderNpcFormPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null>;
  /** Removes an NPC from a project. */
  removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null>;
  /** Persists dialogue text for locale-scoped catalog. */
  saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<string> | null>;
  /** Removes dialogue key for locale-scoped catalog. */
  removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<string | null> | null>;
  /** Publishes or unpublishes a project. */
  publishProject(
    projectId: string,
    published: boolean,
    updatedBy?: string,
  ): Promise<BuilderPublishResult | null>;
  /** Resolves a transport publish flag into a canonical boolean state. */
  resolvePublishState(value: boolean | string): boolean;
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
    updatedBy?: string,
  ): Promise<BuilderMutation<BuilderAsset> | null>;
  /** Creates one authored asset using canonical source-derived defaults. */
  createAsset(
    projectId: string,
    payload: BuilderAssetCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<BuilderAsset> | null>;
  /** Removes one asset. */
  removeAsset(
    projectId: string,
    assetId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Lists authored animation clips. */
  listAnimationClips(projectId: string): Promise<readonly AnimationClip[]>;
  /** Persists an animation clip. */
  saveAnimationClip(
    projectId: string,
    payload: BuilderAnimationClipPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<AnimationClip> | null>;
  /** Creates one animation clip using canonical domain-owned defaults. */
  createAnimationClip(
    projectId: string,
    payload: BuilderAnimationClipCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<AnimationClip> | null>;
  /** Removes an animation clip. */
  removeAnimationClip(
    projectId: string,
    clipId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Lists authored dialogue graphs. */
  listDialogueGraphs(projectId: string): Promise<readonly DialogueGraph[]>;
  /** Persists a dialogue graph. */
  saveDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<DialogueGraph> | null>;
  /** Creates a dialogue graph using canonical domain-owned root-node defaults. */
  createDialogueGraph(
    projectId: string,
    payload: BuilderDialogueGraphCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<DialogueGraph> | null>;
  /** Removes a dialogue graph. */
  removeDialogueGraph(
    projectId: string,
    graphId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Lists authored quests. */
  listQuests(projectId: string): Promise<readonly QuestDefinition[]>;
  /** Persists a quest. */
  saveQuest(
    projectId: string,
    payload: BuilderQuestPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Creates a quest using canonical domain-owned initial-step defaults. */
  createQuest(
    projectId: string,
    payload: BuilderQuestCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Applies a partial quest form update without replacing authored branching steps. */
  saveQuestForm(
    projectId: string,
    payload: BuilderQuestFormPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<QuestDefinition> | null>;
  /** Removes a quest. */
  removeQuest(
    projectId: string,
    questId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Lists authored triggers. */
  listTriggers(projectId: string): Promise<readonly TriggerDefinition[]>;
  /** Persists a trigger. */
  saveTrigger(
    projectId: string,
    payload: BuilderTriggerPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<TriggerDefinition> | null>;
  /** Creates a trigger using canonical domain-owned scope defaults. */
  createTrigger(
    projectId: string,
    payload: BuilderTriggerCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<TriggerDefinition> | null>;
  /** Removes a trigger. */
  removeTrigger(
    projectId: string,
    triggerId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null>;
  /** Lists authored flags. */
  listFlags(projectId: string): Promise<readonly GameFlagDefinition[]>;
  /** Lists generation jobs. */
  listGenerationJobs(projectId: string): Promise<readonly GenerationJob[]>;
  /** Creates or updates a generation job. */
  saveGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Queues a generation job using canonical domain-owned defaults. */
  createGenerationJob(
    projectId: string,
    payload: BuilderGenerationJobCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Updates a generation job review status. */
  approveGenerationJob(
    projectId: string,
    jobId: string,
    approved: boolean,
    updatedBy?: string,
  ): Promise<BuilderMutation<GenerationJob> | null>;
  /** Lists generated artifacts. */
  listArtifacts(projectId: string): Promise<readonly GenerationArtifact[]>;
  /** Lists automation runs. */
  listAutomationRuns(projectId: string): Promise<readonly AutomationRun[]>;
  /** Persists an automation run. */
  saveAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Queues an automation run using canonical domain-owned workflow steps. */
  createAutomationRun(
    projectId: string,
    payload: BuilderAutomationRunCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Updates automation review status. */
  approveAutomationRun(
    projectId: string,
    runId: string,
    approved: boolean,
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null>;
  /** Processes queued generation and automation work for all or one project. */
  processQueuedWork(projectId?: string, updatedBy?: string): Promise<number>;
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
    updatedBy?: string,
  ): Promise<BuilderPatchApplyResult | null>;
}

/**
 * Clones scene definitions while preserving compile-time shape.
 */
const cloneScene = (scene: SceneDefinition): SceneDefinition => structuredClone(scene);

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const assertUnreachable = (_value: never): never => {
  throw new Error(AUTOMATION_STEP_KIND_UNSUPPORTED_ERROR);
};

const toAutomationStepSummary = (spec: AutomationStepSpec): string => {
  switch (spec.kind) {
    case "goto":
      return "automation.step.browser.goto";
    case "click":
      return "automation.step.browser.click";
    case "fill":
      return "automation.step.browser.fill";
    case "assert-text":
      return "automation.step.browser.assert-text";
    case "screenshot":
      return "automation.step.browser.screenshot";
    case "request":
      return "automation.step.http.request";
    case "create-scene":
      return "automation.step.builder.create-scene";
    case "create-trigger":
      return "automation.step.builder.create-trigger";
    case "create-quest":
      return "automation.step.builder.create-quest";
    case "create-dialogue-graph":
      return "automation.step.builder.create-dialogue-graph";
    case "create-asset":
      return "automation.step.builder.create-asset";
    case "create-animation-clip":
      return "automation.step.builder.create-animation-clip";
    case "queue-generation-job":
      return "automation.step.builder.queue-generation-job";
    case "attach-generated-artifact":
      return "automation.step.attach-generated-artifact";
    default:
      return assertUnreachable(spec);
  }
};

const inferAutomationStepAction = (spec: AutomationStepSpec): AutomationRunStep["action"] => {
  switch (spec.kind) {
    case "goto":
    case "click":
    case "fill":
    case "assert-text":
    case "screenshot":
      return "browser";
    case "request":
      return "http";
    case "create-scene":
    case "create-trigger":
    case "create-quest":
    case "create-dialogue-graph":
    case "create-asset":
    case "create-animation-clip":
    case "queue-generation-job":
      return "builder";
    case "attach-generated-artifact":
      return "attach-file";
    default:
      return assertUnreachable(spec);
  }
};

const isAutomationStepSpec = (value: unknown): value is AutomationStepSpec => {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return false;
  }

  switch (value.kind) {
    case "goto":
      return typeof value.path === "string";
    case "click":
      return (
        (value.role === "button" ||
          value.role === "link" ||
          value.role === "tab" ||
          value.role === "checkbox" ||
          value.role === "radio" ||
          value.role === "textbox") &&
        typeof value.name === "string"
      );
    case "fill":
      return (
        (value.role === "textbox" || value.role === "searchbox" || value.role === "combobox") &&
        typeof value.name === "string" &&
        typeof value.value === "string"
      );
    case "assert-text":
      return typeof value.text === "string";
    case "screenshot":
      return typeof value.fileStem === "string";
    case "request":
      return (
        (value.method === "GET" || value.method === "POST") &&
        typeof value.path === "string" &&
        (value.form === undefined ||
          (isRecord(value.form) &&
            Object.values(value.form).every((entry) => typeof entry === "string"))) &&
        (value.expectedStatus === undefined || typeof value.expectedStatus === "number") &&
        (value.responseFileStem === undefined || typeof value.responseFileStem === "string")
      );
    case "create-scene":
      return (
        typeof value.id === "string" &&
        typeof value.titleKey === "string" &&
        typeof value.background === "string" &&
        (value.sceneMode === "2d" || value.sceneMode === "3d")
      );
    case "create-trigger":
      return (
        typeof value.id === "string" &&
        typeof value.label === "string" &&
        typeof value.event === "string"
      );
    case "create-quest":
      return (
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.description === "string" &&
        typeof value.triggerId === "string"
      );
    case "create-dialogue-graph":
      return (
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.line === "string" &&
        (value.npcId === undefined || typeof value.npcId === "string")
      );
    case "create-asset":
      return (
        typeof value.id === "string" &&
        typeof value.label === "string" &&
        typeof value.assetKind === "string" &&
        (value.sceneMode === "2d" || value.sceneMode === "3d") &&
        typeof value.source === "string"
      );
    case "create-animation-clip":
      return (
        typeof value.id === "string" &&
        typeof value.assetId === "string" &&
        typeof value.stateTag === "string" &&
        (value.playbackFps === undefined || typeof value.playbackFps === "number") &&
        (value.frameCount === undefined || typeof value.frameCount === "number")
      );
    case "queue-generation-job":
      return (
        typeof value.jobKind === "string" &&
        typeof value.prompt === "string" &&
        (value.targetId === undefined || typeof value.targetId === "string")
      );
    case "attach-generated-artifact":
      return typeof value.sourceStepId === "string";
    default:
      return false;
  }
};

const parseAutomationStepSpecs = (value: string | undefined): readonly AutomationStepSpec[] => {
  const parsed = safeJsonParse<unknown>(value ?? "", [], acceptUnknown);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isAutomationStepSpec);
};

const buildDefaultAutomationStepSpecs = (projectId: string): readonly AutomationStepSpec[] => [
  {
    kind: "goto",
    path: withQueryParameters(appRoutes.builder, { projectId }),
  },
  {
    kind: "assert-text",
    text: projectId,
  },
  {
    kind: "screenshot",
    fileStem: `automation-${projectId}-workspace`,
    fullPage: true,
  },
  {
    kind: "attach-generated-artifact",
    sourceStepId: "step.capture-workspace",
  },
];

interface SuggestedAnimationPlanClip {
  readonly id: string;
  readonly stateTag: string;
  readonly frameCount: number;
  readonly playbackFps: number;
}

interface SuggestedAnimationPlanPayload {
  readonly targetId?: string;
  readonly suggestedClips: readonly SuggestedAnimationPlanClip[];
}

const isSuggestedAnimationPlanClip = (value: unknown): value is SuggestedAnimationPlanClip =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.stateTag === "string" &&
  typeof value.frameCount === "number" &&
  Number.isFinite(value.frameCount) &&
  typeof value.playbackFps === "number" &&
  Number.isFinite(value.playbackFps);

const parseSuggestedAnimationPlanPayload = (
  source: string,
): SuggestedAnimationPlanPayload | null => {
  const parsed = safeJsonParse<unknown>(source, null, acceptUnknown);
  if (!isRecord(parsed) || !Array.isArray(parsed.suggestedClips)) {
    return null;
  }

  const suggestedClips = parsed.suggestedClips.filter(isSuggestedAnimationPlanClip);
  if (suggestedClips.length === 0) {
    return null;
  }

  return {
    targetId: typeof parsed.targetId === "string" ? parsed.targetId : undefined,
    suggestedClips,
  };
};

const resolvePublicAssetFilePath = (publicUrl: string): string | null => {
  if (!publicUrl.startsWith(appConfig.staticAssets.publicPrefix)) {
    return null;
  }

  return `${appConfig.staticAssets.publicDirectory}${publicUrl.slice(appConfig.staticAssets.publicPrefix.length)}`;
};

const toGeneratedAssetKind = (
  kind: Exclude<GenerationJob["kind"], "voice-line" | "animation-plan">,
): BuilderAsset["kind"] => {
  if (kind === "tiles") return "tile-set";
  if (kind === "combat-encounter" || kind === "item-set" || kind === "cutscene-script")
    return "document";
  return kind;
};

const inferAssetSourceFormat = (source: string): string => {
  const normalized = source.trim().toLowerCase();
  const extension = normalized.split(".").pop()?.trim();
  return extension && extension.length > 0 ? extension : "dat";
};

const inferAssetMimeType = (format: string, fallback?: string): string | undefined => {
  const normalized = format.trim().toLowerCase();
  const mappedMimeType: Readonly<Record<string, string>> = {
    gltf: "model/gltf+json",
    glb: "model/gltf-binary",
    usd: "application/usd",
    usda: "model/vnd.usda",
    usdc: "model/vnd.usdc",
    usdz: "model/vnd.usd+zip",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    wav: "audio/wav",
    mp3: "audio/mpeg",
    json: "application/json",
  };
  return mappedMimeType[normalized] ?? fallback;
};

const buildAssetVariants = (
  id: string,
  source: string,
  sourceFormat: string,
  sourceMimeType: string | undefined,
): BuilderAsset["variants"] => {
  const normalizedFormat = sourceFormat.toLowerCase();
  if (normalizedFormat === "usd" || normalizedFormat === "usda" || normalizedFormat === "usdc") {
    return [
      {
        id: `${id}.source`,
        format: normalizedFormat,
        source,
        usage: "source",
        mimeType: sourceMimeType,
      },
    ];
  }

  return [
    {
      id: `${id}.runtime`,
      format: normalizedFormat,
      source,
      usage: "runtime",
      mimeType: sourceMimeType,
    },
  ];
};

const clipDirections: readonly Facing[] = ["up", "down", "left", "right"];

const inferClipDirection = (stateTag: string): Facing =>
  clipDirections.find((candidate) => stateTag.includes(candidate)) ?? "down";

const isSceneNode3d = (
  node: SceneNodeDefinition | undefined,
): node is Extract<SceneNodeDefinition, { readonly rotation: { readonly x: number } }> =>
  Boolean(node && "rotation" in node && "scale" in node);

const parseParticleEmitter = (
  raw: string | undefined,
  fallback: ParticleEmitterConfig | undefined,
): ParticleEmitterConfig | undefined => {
  if (!raw || raw.trim().length === 0) {
    return fallback;
  }
  const parsed = safeJsonParse<unknown>(raw, null, (v): v is unknown => v !== undefined);
  if (!parsed || typeof parsed !== "object") {
    return fallback;
  }
  const r = parsed as Record<string, unknown>;
  if (typeof r.maxCount !== "number" || typeof r.rate !== "number") {
    return fallback;
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

    const particleEmitter = parseParticleEmitter(
      payload.particleEmitter,
      existingNode?.particleEmitter,
    );
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
      ...(particleEmitter ? { particleEmitter } : {}),
    };
  }

  const current =
    existingNode && !isSceneNode3d(existingNode)
      ? existingNode
      : {
          position: { x: 0, y: 0 },
          size: { width: DEFAULT_SCENE_NODE_SIZE, height: DEFAULT_SCENE_NODE_SIZE },
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

  const particleEmitter = parseParticleEmitter(
    payload.particleEmitter,
    existingNode?.particleEmitter,
  );
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
    ...(particleEmitter ? { particleEmitter } : {}),
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
const parsePatchValue = (value: string): unknown =>
  safeJsonParse<unknown>(value, value, acceptUnknown);

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

const buildScenePatchFallback = (sceneId: string): SceneDefinition => ({
  id: sceneId,
  titleKey: "",
  background: "",
  geometry: {
    width: 1,
    height: 1,
  },
  spawn: {
    x: 0,
    y: 0,
  },
  npcs: [],
  collisions: [],
});

const parseScenePatch = (
  sceneId: string,
  payload: object,
  fallback?: SceneDefinition,
): SceneDefinition => {
  const base = safeJsonParse<SceneDefinition>(
    JSON.stringify(payload),
    fallback ?? buildScenePatchFallback(sceneId),
    (v): v is SceneDefinition => isRecord(v),
  );
  return structuredClone({
    ...base,
    id: sceneId,
  });
};

/**
 * Prisma-backed builder store with immutable release snapshots.
 */
class PrismaBuilderService implements BuilderService {
  private readonly stateStore = createBuilderProjectStateStore();

  private resolveUpdatedBy(updatedBy: string | undefined, fallback: string): string {
    const trimmed = (updatedBy ?? "").trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

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

  public async createProject(
    projectId: string,
    updatedBy?: string,
  ): Promise<BuilderProjectSnapshot | null> {
    return this.stateStore.createProject(projectId, updatedBy);
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
      (state) => {
      const nextScene = cloneScene(payload.scene);
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.scenes, payload.id)
        ? "updated"
        : "created";
      state.scenes[payload.id] = nextScene;
      return {
        ok: true,
        payload: {
          action,
          scene: nextScene,
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

  /**
   * Creates one authored scene using domain-owned defaults and coercion.
   */
  public async createScene(
    projectId: string,
    payload: BuilderSceneCreatePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const sceneId = payload.id.trim();
    return this.saveScene(projectId, {
      id: sceneId,
      scene: {
        id: sceneId,
        titleKey: payload.titleKey.trim(),
        background: payload.background.trim(),
        sceneMode: payload.sceneMode === "3d" ? "3d" : "2d",
        geometry: {
          width: Math.max(
            1,
            parseBuilderInteger(payload.geometryWidth, DEFAULT_SCENE_GEOMETRY_WIDTH),
          ),
          height: Math.max(
            1,
            parseBuilderInteger(payload.geometryHeight, DEFAULT_SCENE_GEOMETRY_HEIGHT),
          ),
        },
        spawn: {
          x: parseBuilderInteger(payload.spawnX, DEFAULT_SCENE_SPAWN_X),
          y: parseBuilderInteger(payload.spawnY, DEFAULT_SCENE_SPAWN_Y),
        },
        npcs: [],
        collisions: [],
        nodes: [],
      },
    });
  }

  public async saveSceneForm(
    projectId: string,
    payload: BuilderSceneFormPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
      (state) => {
        const current = state.scenes[payload.sceneId];
        if (!current) {
          return { ok: false };
        }

        let updatedScene: SceneDefinition = {
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

        if (payload.tilemap != null && payload.tilemap.trim() !== "") {
          const parsed = safeJsonParse<TilemapDefinition | null>(
            payload.tilemap,
            null,
            (v): v is TilemapDefinition =>
              v !== null &&
              typeof v === "object" &&
              Array.isArray((v as TilemapDefinition).layers) &&
              (v as TilemapDefinition).layers.length > 0,
          );
          if (parsed) {
            updatedScene = { ...updatedScene, tilemap: parsed };
          }
        }

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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const mutation = await this.mutateProject<SceneDefinition>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const mutation = await this.mutateProject<{
      readonly action: BuilderMutationResult["action"];
      readonly npc: SceneNpcDefinition;
    }>(projectId, this.resolveUpdatedBy(updatedBy, "builder-editor"), (state) => {
      const scene = state.scenes[payload.sceneId];
      if (!scene) {
        return { ok: false };
      }

      const existingIndex = scene.npcs.findIndex(
        (candidate) => candidate.characterKey === payload.npc.characterKey,
      );
      const nextNpc = structuredClone(payload.npc);
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const mutation = await this.mutateProject<{
      readonly npc: SceneNpcDefinition;
    }>(projectId, this.resolveUpdatedBy(updatedBy, "builder-editor"), (state) => {
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

      const currentNpc = scene.npcs[existingIndex];
      if (!currentNpc) {
        return { ok: false };
      }
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
          idlePauseMs: (() => {
            const nextIdlePause: readonly [number, number] = [
              Math.max(
                0,
                parseBuilderInteger(payload.idlePauseMinMs, currentNpc.ai.idlePauseMs[0]),
              ),
              Math.max(
                0,
                parseBuilderInteger(payload.idlePauseMaxMs, currentNpc.ai.idlePauseMs[1]),
              ),
            ];
            return nextIdlePause;
          })(),
          wanderRadius: Math.max(
            0,
            parseBuilderInteger(payload.wanderRadius, currentNpc.ai.wanderRadius),
          ),
          wanderSpeed: Math.max(0, parseNodeFloat(payload.wanderSpeed, currentNpc.ai.wanderSpeed)),
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
          npc: structuredClone(nextNpc),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null> {
    const mutation = await this.mutateProject<SceneNpcDefinition[]>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
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
          payload: structuredClone(nextNpcs),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<string> | null> {
    const locale = normalizeBuilderLocale(payload.locale);
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<string | null> | null> {
    const normalizedLocale = normalizeBuilderLocale(locale);
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-editor"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderPublishResult | null> {
    const actor = this.resolveUpdatedBy(updatedBy, "builder-api");
    if (!published) {
      const snapshot = await this.stateStore.publishProject(projectId, false, actor);
      return snapshot ? { ok: true, snapshot } : null;
    }

    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    const validation = validateBuilderProjectForPublish(entry.state);
    if (!validation.ok) {
      return { ok: false, issues: validation.issues };
    }

    const snapshot = await this.stateStore.publishProject(projectId, true, actor);
    return snapshot ? { ok: true, snapshot } : null;
  }

  /**
   * Resolves one transport publish flag into the canonical boolean project state.
   */
  public resolvePublishState(value: boolean | string): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    return parseBuilderBoolean(value, false);
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
        return structuredClone(npc);
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
    updatedBy?: string,
  ): Promise<BuilderMutation<BuilderAsset> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-assets"),
      (state) => {
      const nextAsset = structuredClone(payload.asset);
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.assets, payload.id)
        ? "updated"
        : "created";
      state.assets[payload.id] = nextAsset;
      return {
        ok: true,
        payload: {
          action,
          asset: nextAsset,
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

  /**
   * Creates one authored asset using domain-owned source and variant derivation.
   */
  public async createAsset(
    projectId: string,
    payload: BuilderAssetCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<BuilderAsset> | null> {
    const source = payload.source.trim();
    const sourceName = trimOptionalField(payload.sourceName);
    const sourceId =
      sourceName?.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, "-") ?? "asset";
    const id = trimOptionalField(payload.id, sourceId) ?? "asset";
    const label = trimOptionalField(payload.label, id) ?? id;
    const kind = payload.kind ?? "portrait";
    const sceneMode = payload.sceneMode === "3d" ? "3d" : "2d";
    const sourceFormat = inferAssetSourceFormat(source);
    const sourceMimeType = inferAssetMimeType(sourceFormat, payload.sourceMimeType);
    const now = Date.now();

    return this.saveAsset(projectId, {
      id,
      asset: {
        id,
        kind,
        label,
        sceneMode,
        source,
        sourceFormat,
        sourceMimeType,
        tags: [kind, sceneMode],
        variants: buildAssetVariants(id, source, sourceFormat, sourceMimeType),
        approved: false,
        createdAtMs: now,
        updatedAtMs: now,
      },
    }, updatedBy);
  }

  public async removeAsset(
    projectId: string,
    assetId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-assets"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<AnimationClip> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-assets"),
      (state) => {
      const nextClip = structuredClone(payload.clip);
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.animationClips,
        payload.id,
      )
        ? "updated"
        : "created";
      state.animationClips[payload.id] = nextClip;
      return {
        ok: true,
        payload: {
          action,
          clip: nextClip,
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

  /**
   * Creates one animation clip using canonical domain-owned defaults.
   */
  public async createAnimationClip(
    projectId: string,
    payload: BuilderAnimationClipCreatePayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<AnimationClip> | null> {
    const entry = await this.readProjectEntry(projectId);
    if (!entry) {
      return null;
    }

    const clipId = payload.id.trim();
    const assetId = payload.assetId.trim();
    const stateTag = payload.stateTag.trim();
    const asset = entry.state.assets[assetId];
    const now = Date.now();

    return this.saveAnimationClip(projectId, {
      id: clipId,
      clip: {
        id: clipId,
        assetId,
        label: clipId,
        sceneMode: asset?.sceneMode ?? "2d",
        stateTag,
        playbackFps: Math.max(
          1,
          parseBuilderInteger(payload.playbackFps, DEFAULT_ANIMATION_PLAYBACK_FPS),
        ),
        startFrame: 0,
        frameCount: Math.max(
          1,
          parseBuilderInteger(payload.frameCount, DEFAULT_ANIMATION_FRAME_COUNT),
        ),
        loop: true,
        direction: inferClipDirection(stateTag),
        createdAtMs: now,
        updatedAtMs: now,
      },
    }, updatedBy);
  }

  public async removeAnimationClip(
    projectId: string,
    clipId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-assets"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<DialogueGraph> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-mechanics"),
      (state) => {
      const nextGraph = structuredClone(payload.graph);
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.dialogueGraphs,
        payload.id,
      )
        ? "updated"
        : "created";
      state.dialogueGraphs[payload.id] = nextGraph;
      return {
        ok: true,
        payload: {
          action,
          graph: nextGraph,
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
    updatedBy?: string,
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
    }, updatedBy);
  }

  public async removeDialogueGraph(
    projectId: string,
    graphId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-mechanics"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<QuestDefinition> | null> {
    const mutation = await this.mutateProject(projectId, this.resolveUpdatedBy(updatedBy, "builder-mechanics"), (state) => {
      const nextQuest = structuredClone(payload.quest);
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.quests, payload.id)
        ? "updated"
        : "created";
      state.quests[payload.id] = nextQuest;
      return {
        ok: true,
        payload: {
          action,
          quest: nextQuest,
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
    updatedBy?: string,
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
    }, updatedBy);
  }

  public async saveQuestForm(
    projectId: string,
    payload: BuilderQuestFormPayload,
    updatedBy?: string,
  ): Promise<BuilderMutation<QuestDefinition> | null> {
    const mutation = await this.mutateProject<QuestDefinition>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-mechanics"),
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
          payload: structuredClone(nextQuest),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(projectId, this.resolveUpdatedBy(updatedBy, "builder-mechanics"), (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<TriggerDefinition> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-mechanics"),
      (state) => {
      const nextTrigger = structuredClone(payload.trigger);
      const action: BuilderMutationResult["action"] = Object.hasOwn(state.triggers, payload.id)
        ? "updated"
        : "created";
      state.triggers[payload.id] = nextTrigger;
      return {
        ok: true,
        payload: {
          action,
          trigger: nextTrigger,
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
    updatedBy?: string,
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
    }, updatedBy);
  }

  public async removeTrigger(
    projectId: string,
    triggerId: string,
    updatedBy?: string,
  ): Promise<BuilderMutation<null> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-mechanics"),
      (state) => {
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
    updatedBy?: string,
  ): Promise<BuilderMutation<GenerationJob> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-ai"),
      (state) => {
      const nextJob = structuredClone(payload.job);
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.generationJobs,
        payload.id,
      )
        ? "updated"
        : "queued";
      state.generationJobs[payload.id] = nextJob;
      return {
        ok: true,
        payload: {
          action,
          job: nextJob,
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
    updatedBy?: string,
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
    }, updatedBy);
  }

  public async approveGenerationJob(
    projectId: string,
    jobId: string,
    approved: boolean,
    updatedBy?: string,
  ): Promise<BuilderMutation<GenerationJob> | null> {
    const currentEntry = await this.readProjectEntry(projectId);
    let preParsedAnimationPlan: SuggestedAnimationPlanPayload | null = null;
    if (approved && currentEntry) {
      const currentState = currentEntry.state;
      const currentJob = currentState.generationJobs[jobId];
      if (currentJob?.kind === "animation-plan") {
        const currentPrimaryArtifact = currentJob.artifactIds
          .map((artifactId) => currentState.artifacts[artifactId])
          .find((artifact): artifact is GenerationArtifact => artifact !== undefined);
        const currentArtifactFilePath =
          currentPrimaryArtifact?.previewSource === undefined
            ? null
            : resolvePublicAssetFilePath(currentPrimaryArtifact.previewSource);
        if (currentArtifactFilePath !== null) {
          preParsedAnimationPlan = parseSuggestedAnimationPlanPayload(
            await Bun.file(currentArtifactFilePath).text(),
          );
        }
      }
    }

    const mutation = await this.mutateProject<GenerationJob>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-ai"),
      (state) => {
      const job = state.generationJobs[jobId];
      if (!job) {
        return { ok: false };
      }

      let nextStatus: GenerationJob["status"] = approved ? "succeeded" : "canceled";
      let nextStatusMessage = approved ? "job.approved-and-attached" : "job.canceled-by-review";

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
        if (job.kind === "animation-plan" && primaryArtifact?.previewSource) {
          const targetAssetId =
            trimOptionalField(job.targetId) ?? trimOptionalField(preParsedAnimationPlan?.targetId);
          const targetAsset = targetAssetId ? state.assets[targetAssetId] : undefined;

          if (!preParsedAnimationPlan || !targetAssetId || !targetAsset) {
            nextStatus = "failed";
            nextStatusMessage = "job.animation-plan-target-missing";
          } else {
            const now = Date.now();
            for (const clip of preParsedAnimationPlan.suggestedClips) {
              if (state.animationClips[clip.id]) {
                continue;
              }

              state.animationClips[clip.id] = {
                id: clip.id,
                assetId: targetAssetId,
                label: clip.id,
                sceneMode: targetAsset.sceneMode,
                stateTag: clip.stateTag,
                playbackFps: Math.max(1, Math.floor(clip.playbackFps)),
                startFrame: 0,
                frameCount: Math.max(1, Math.floor(clip.frameCount)),
                loop: true,
                direction: inferClipDirection(clip.stateTag),
                createdAtMs: now,
                updatedAtMs: now,
              };
            }
          }
        } else if (
          job.kind !== "voice-line" &&
          job.kind !== "animation-plan" &&
          primaryArtifact?.previewSource
        ) {
          const generatedAssetId = `asset.generated.${job.id}`;
          if (!state.assets[generatedAssetId]) {
            state.assets[generatedAssetId] = {
              id: generatedAssetId,
              kind: toGeneratedAssetKind(job.kind),
              label: `generation.asset.label.generated:${job.kind}:${job.id}`,
              sceneMode: "2d",
              source: primaryArtifact.previewSource,
              sourceFormat: primaryArtifact.mimeType?.split("/")[1] ?? "dat",
              sourceMimeType: primaryArtifact.mimeType,
              tags: ["generated", job.kind],
              variants: [
                {
                  id: `${generatedAssetId}.runtime`,
                  format: primaryArtifact.mimeType?.split("/")[1] ?? "dat",
                  source: primaryArtifact.previewSource,
                  usage: "runtime",
                  mimeType: primaryArtifact.mimeType,
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
        status: nextStatus,
        statusMessage: nextStatusMessage,
        updatedAtMs: Date.now(),
      };

      return {
        ok: true,
        payload: structuredClone(state.generationJobs[jobId]),
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
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-automation"),
      (state) => {
      const nextRun = structuredClone(payload.run);
      const action: BuilderMutationResult["action"] = Object.hasOwn(
        state.automationRuns,
        payload.id,
      )
        ? "updated"
        : "queued";
      state.automationRuns[payload.id] = nextRun;
      return {
        ok: true,
        payload: {
          action,
          run: nextRun,
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
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const runId = `run.${crypto.randomUUID()}`;
    const now = Date.now();
    const parsedSpecs = parseAutomationStepSpecs(payload.stepsJson);
    const resolvedSpecs =
      parsedSpecs.length > 0 ? parsedSpecs : buildDefaultAutomationStepSpecs(projectId);
    const steps: readonly AutomationRunStep[] = resolvedSpecs.map((spec, index) => ({
      id:
        spec.kind === "attach-generated-artifact"
          ? `step.attach-${index + 1}`
          : spec.kind === "goto"
            ? "step.open-builder"
            : spec.kind === "assert-text"
              ? "step.assert-context"
              : spec.kind === "screenshot"
                ? "step.capture-workspace"
                : `${runId}.step.${index + 1}`,
      action: inferAutomationStepAction(spec),
      summary: toAutomationStepSummary(spec),
      status: "pending",
      spec,
    }));

    return this.saveAutomationRun(projectId, {
      id: runId,
      run: {
        id: runId,
        status: "queued",
        goal: payload.goal.trim(),
        steps,
        artifactIds: [],
        statusMessage: "automation.queued-for-processing",
        createdAtMs: now,
        updatedAtMs: now,
      },
    }, updatedBy);
  }

  public async approveAutomationRun(
    projectId: string,
    runId: string,
    approved: boolean,
    updatedBy?: string,
  ): Promise<BuilderMutation<AutomationRun> | null> {
    const mutation = await this.mutateProject<AutomationRun>(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-automation"),
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
          payload: structuredClone(state.automationRuns[runId]),
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

  public async processQueuedWork(projectId?: string, updatedBy?: string): Promise<number> {
    const actor = this.resolveUpdatedBy(updatedBy, "builder-worker");
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
        await this.stateStore.updateProject(entry.row.id, actor, (nextState) => {
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

    const previewState = structuredClone(entry.state);
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

      const nextScene = parseScenePatch(target.sceneId, parsed, beforeScene);
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
    updatedBy?: string,
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

    const mutation = await this.mutateProject(
      projectId,
      this.resolveUpdatedBy(updatedBy, "builder-ai"),
      (nextState) => {
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

        nextState.scenes[target.sceneId] = parseScenePatch(
          target.sceneId,
          parsed,
          nextState.scenes[target.sceneId],
        );
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

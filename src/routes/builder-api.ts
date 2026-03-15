/**
 * Builder API Routes
 *
 * Persistent builder endpoints for scenes, NPCs, dialogue, and builder AI helpers.
 */
import { Elysia, t } from "elysia";
import { appConfig, type LocaleCode, normalizeLocale } from "../config/environment.ts";
import { deriveFeatureCapability } from "../domain/ai/capability-snapshot.ts";
import { knowledgeBaseService } from "../domain/ai/knowledge-base-service.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import { vectorStore } from "../domain/ai/vector-store.ts";
import { auditService } from "../domain/audit/audit-service.ts";
import {
  canPerformBuilderAction,
  type PrincipalIdentity,
  requireBuilderAction,
} from "../domain/auth/authorization.ts";
import { persistBuilderFile } from "../domain/builder/asset-storage.ts";
import {
  deriveAssetIdentity,
  deriveDialogueGraphIdentity,
  deriveDialogueIdentity,
  deriveNpcIdentity,
  deriveQuestIdentity,
  deriveSceneIdentity,
  deriveTriggerIdentity,
} from "../domain/builder/builder-display.ts";
import type { BuilderPublishValidationIssue } from "../domain/builder/builder-publish-validation.ts";
import {
  type BuilderAnimationClipCreatePayload,
  type BuilderAssetCreatePayload,
  type BuilderAutomationRunCreatePayload,
  type BuilderGenerationJobCreatePayload,
  type BuilderNpcFormPayload,
  type BuilderPatchPreviewOperation,
  type BuilderQuestFormPayload,
  type BuilderSceneCreatePayload,
  type BuilderSceneFormPayload,
  type BuilderSceneNodePayload,
  builderService,
} from "../domain/builder/builder-service.ts";
import { toCreatorCapabilities } from "../domain/builder/creator-capability-adapter.ts";
import {
  deriveBuilderReadinessAudit,
  evaluateBuilderPlatformReadiness,
} from "../domain/builder/platform-readiness.ts";
import {
  detectAvailableFeatures,
  generateNpcDialogue,
  suggestUserFlowStep,
} from "../domain/game/ai/game-ai-service.ts";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import type { AppErrorCode } from "../lib/error-envelope.ts";
import { ApplicationError, errorEnvelope, successEnvelope } from "../lib/error-envelope.ts";
import {
  builderRequestContextPlugin,
  readBuilderScopedContext,
} from "../plugins/builder-request-context.ts";
import { ssePlugin } from "../plugins/sse-plugin.ts";
import { defaultGameConfig, getGameContractValues } from "../shared/config/game-config.ts";
import {
  BUILDER_ARTIFACT_PATCH_PATH_DEFAULT_LAST_LINE,
  BUILDER_ARTIFACT_PATCH_PATH_DIALOGUE_TEST,
  DEFAULT_NPC_IDLE_PAUSE_MS,
  DEFAULT_NPC_INTERACT_RADIUS,
  DEFAULT_NPC_SPAWN_X,
  DEFAULT_NPC_SPAWN_Y,
  DEFAULT_NPC_WANDER_RADIUS,
  DEFAULT_NPC_WANDER_SPEED,
} from "../shared/constants/builder-defaults.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { interpolateRoutePath } from "../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../shared/constants/routes.ts";
import type {
  BuilderAIRequest,
  BuilderAIResponse,
  BuilderAIRunPlan,
  BuilderArtifactPatch,
  BuilderDialoguePayload,
  BuilderMutationResult,
  BuilderNpcPayload,
  BuilderScenePayload,
  FeatureCapability,
  SceneDefinition,
  SceneNpcDefinition,
} from "../shared/contracts/game.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { isRecord, safeDecodeUri, safeJsonParse } from "../shared/utils/safe-json.ts";
import {
  renderKnowledgeDocumentList,
  renderKnowledgeRetrievalResult,
  renderToolPlanPreview,
} from "../views/builder/ai-panel.ts";
import { renderAssetsEditor } from "../views/builder/assets-editor.ts";
import { renderAutomationPanel } from "../views/builder/automation-panel.ts";
import { renderBuilderProjectShell } from "../views/builder/builder-layout.ts";
import { renderDialogueDetail, renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import {
  renderDialogueGraphEditForm,
  renderMechanicsEditor,
  renderQuestEditForm,
  renderTriggerEditForm,
} from "../views/builder/mechanics-editor.ts";
import { renderNpcDetail, renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderSceneDetail, renderSceneEditor } from "../views/builder/scene-editor.ts";
import { escapeHtml } from "../views/layout.ts";
import { cardClasses, renderBuilderHiddenFields } from "../views/shared/ui-components.ts";

const route = (path: string): string => path.replace(/^\/api\/builder/, "");

const countProjectSpriteManifests = (_projectId: string): number =>
  Object.keys(gameSpriteManifests).length;

const isMutatingBuilderMethod = (method: string): boolean =>
  method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
const highCostGenerationKinds = new Set<BuilderGenerationJobCreatePayload["kind"]>([
  "sprite-sheet",
  "portrait",
  "voice-line",
  "animation-plan",
]);
const hasUnsafeAutomationKinds = (stepsJson: string | undefined): boolean =>
  typeof stepsJson === "string" &&
  (stepsJson.includes('"kind":"request"') || stepsJson.includes('"kind":"create-asset"'));
type HfTrainingMethod = "sft" | "dpo" | "grpo" | "reward";
const isHfRepoId = (value: string): boolean =>
  /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value);
const toHfTrainingMethod = (value: string | undefined): HfTrainingMethod =>
  value === "dpo" || value === "grpo" || value === "reward" ? value : "sft";
const toHfTrainingMethodLabel = (
  messages: ReturnType<typeof getMessages>,
  method: HfTrainingMethod,
) => {
  switch (method) {
    case "dpo":
      return messages.builder.hfTrainingMethodDpo;
    case "grpo":
      return messages.builder.hfTrainingMethodGrpo;
    case "reward":
      return messages.builder.hfTrainingMethodReward;
    default:
      return messages.builder.hfTrainingMethodSft;
  }
};

const hfTrainingMethodSchema = t.Union([
  t.Literal("sft"),
  t.Literal("dpo"),
  t.Literal("grpo"),
  t.Literal("reward"),
]);
const hfTrainingRequestFieldSchema = t.Union([t.String(), t.Number()]);
const hfTrainingRequestSchema = t.Object({
  projectId: t.Optional(t.String()),
  locale: t.Optional(t.String()),
  datasetId: t.String({ minLength: 1 }),
  datasetSplit: t.Optional(t.String()),
  baseModel: t.String({ minLength: 1 }),
  outputModel: t.String({ minLength: 1 }),
  method: t.Optional(hfTrainingMethodSchema),
  epochs: t.Optional(hfTrainingRequestFieldSchema),
  learningRate: t.Optional(hfTrainingRequestFieldSchema),
});

const resolveBuilderPrincipalFromContext = (context: {
  readonly builderPrincipalType: "anonymous" | "user";
  readonly builderPrincipalUserId: string | null;
  readonly builderPrincipalOrganizationId: string | null;
  readonly builderPrincipalRoleKeys: readonly string[];
}): PrincipalIdentity => ({
  actorType: context.builderPrincipalType,
  actorId: context.builderPrincipalUserId,
  organizationId: context.builderPrincipalOrganizationId,
  roleKeys: context.builderPrincipalRoleKeys,
});

const resolveBuilderUpdatedByFromContext = (context: {
  readonly builderPrincipalType: "anonymous" | "user";
  readonly builderPrincipalUserId: string | null;
  readonly builderPrincipalOrganizationId: string | null;
  readonly builderPrincipalRoleKeys: readonly string[];
}): string => {
  const identity = resolveBuilderPrincipalFromContext(context);
  const principalId = identity.actorId?.trim();
  const organizationId = identity.organizationId?.trim();
  if (principalId && principalId.length > 0) {
    return `${identity.actorType}:${principalId}`;
  }
  if (organizationId && organizationId.length > 0) {
    return `${identity.actorType}:${organizationId}`;
  }
  return `${identity.actorType}:guest`;
};

type CorrelationRequest = {
  request: Request;
  headers: Record<string, string | number | undefined>;
};

/** TypeBox schema for error envelope responses. */
const builderErrorResponse = t.Object({
  ok: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    retryable: t.Boolean(),
    correlationId: t.String(),
  }),
});

const builderNpcAiSchema = t.Object({
  wanderRadius: t.Number(),
  wanderSpeed: t.Number(),
  idlePauseMs: t.Tuple([t.Number(), t.Number()]),
  greetOnApproach: t.Boolean(),
  greetLineKey: t.String(),
});

const builderNpcSchema = t.Object({
  characterKey: t.String(),
  displayName: t.String(),
  x: t.Number(),
  y: t.Number(),
  labelKey: t.String(),
  dialogueKeys: t.Array(t.String()),
  interactRadius: t.Number(),
  ai: builderNpcAiSchema,
});

const builderCollisionSchema = t.Object({
  x: t.Number(),
  y: t.Number(),
  width: t.Number(),
  height: t.Number(),
});

const builderParticleEmitterSchema = t.Object({
  assetId: t.Optional(t.String()),
  maxCount: t.Number(),
  rate: t.Number(),
  lifetimeMs: t.Number(),
  speed: t.Tuple([t.Number(), t.Number()]),
  spread: t.Number(),
  size: t.Tuple([t.Number(), t.Number()]),
  gravity: t.Optional(t.Boolean()),
});

const builderTilemapLayerSchema = t.Object({
  id: t.String(),
  tileSetAssetId: t.String(),
  tileWidth: t.Number(),
  tileHeight: t.Number(),
  data: t.Array(t.Array(t.Number())),
  collision: t.Optional(t.Boolean()),
  layer: t.Optional(t.String()),
});

const builderTilemapSchema = t.Object({
  layers: t.Array(builderTilemapLayerSchema),
});

const builderSceneNode2dSchema = t.Object({
  id: t.String(),
  nodeType: t.Union([
    t.Literal("sprite"),
    t.Literal("tile"),
    t.Literal("spawn"),
    t.Literal("trigger"),
    t.Literal("camera"),
  ]),
  assetId: t.Optional(t.String()),
  animationClipId: t.Optional(t.String()),
  position: t.Object({ x: t.Number(), y: t.Number() }),
  size: t.Object({ width: t.Number(), height: t.Number() }),
  layer: t.String(),
  particleEmitter: t.Optional(builderParticleEmitterSchema),
});

const builderSceneNode3dSchema = t.Object({
  id: t.String(),
  nodeType: t.Union([
    t.Literal("model"),
    t.Literal("light"),
    t.Literal("camera"),
    t.Literal("spawn"),
    t.Literal("trigger"),
  ]),
  assetId: t.Optional(t.String()),
  animationClipId: t.Optional(t.String()),
  position: t.Object({ x: t.Number(), y: t.Number(), z: t.Number() }),
  rotation: t.Object({ x: t.Number(), y: t.Number(), z: t.Number() }),
  scale: t.Object({ x: t.Number(), y: t.Number(), z: t.Number() }),
  particleEmitter: t.Optional(builderParticleEmitterSchema),
});

const builderSceneSchema = t.Object({
  id: t.String(),
  displayTitle: t.String(),
  titleKey: t.String(),
  background: t.String(),
  sceneMode: t.Optional(t.Union([t.Literal("2d"), t.Literal("3d")])),
  geometry: t.Object({ width: t.Number(), height: t.Number() }),
  spawn: t.Object({ x: t.Number(), y: t.Number() }),
  npcs: t.Array(builderNpcSchema),
  collisions: t.Array(builderCollisionSchema),
  nodes: t.Optional(t.Array(t.Union([builderSceneNode2dSchema, builderSceneNode3dSchema]))),
  tilemap: t.Optional(builderTilemapSchema),
});

const builderSceneCatalogSchema = t.Record(t.String(), builderSceneSchema);
const builderDialogueCatalogSchema = t.Record(t.String(), t.String());

const builderArtifactPatchSchema = t.Object({
  op: t.Union([t.Literal("add"), t.Literal("replace"), t.Literal("remove")]),
  path: t.String(),
  value: t.String(),
  checksum: t.Optional(t.String()),
  confidence: t.Optional(t.Number()),
});

const builderMutationResultSchema = t.Object({
  projectId: t.String(),
  resourceType: t.Union([
    t.Literal("project"),
    t.Literal("scene"),
    t.Literal("npc"),
    t.Literal("dialogue"),
    t.Literal("asset"),
    t.Literal("animationClip"),
    t.Literal("dialogueGraph"),
    t.Literal("quest"),
    t.Literal("trigger"),
    t.Literal("generationJob"),
    t.Literal("artifact"),
    t.Literal("automationRun"),
  ]),
  resourceId: t.String(),
  action: t.Union([
    t.Literal("created"),
    t.Literal("updated"),
    t.Literal("deleted"),
    t.Literal("published"),
    t.Literal("queued"),
    t.Literal("approved"),
    t.Literal("canceled"),
  ]),
});

const builderFeatureCapabilitySchema = t.Object({
  assist: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
  test: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
  toolLikeSuggestions: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
  streaming: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
  knowledgeRetrieval: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
  offlineFallback: t.Object({
    status: t.Union([t.Literal("ready"), t.Literal("degraded"), t.Literal("unavailable")]),
    mode: t.Union([
      t.Literal("provider"),
      t.Literal("fallback"),
      t.Literal("surface"),
      t.Literal("none"),
    ]),
    reasonCode: t.Optional(t.String()),
  }),
});

const builderProviderCapabilitySchema = t.Object({
  key: t.Optional(t.String()),
  provider: t.String(),
  model: t.String(),
  capabilities: t.Array(t.String()),
  maxContextLength: t.Number(),
  supportsStreaming: t.Boolean(),
  runtime: t.String(),
  integration: t.String(),
  local: t.Boolean(),
  configurable: t.Boolean(),
});

const availableAiFeaturesSchema = t.Object({
  richDialogue: t.Boolean(),
  visionAnalysis: t.Boolean(),
  sentimentAnalysis: t.Boolean(),
  embeddings: t.Boolean(),
  speechToText: t.Boolean(),
  speechSynthesis: t.Boolean(),
  localInference: t.Boolean(),
  providers: t.Array(t.String()),
});

const appGameConfigSchema = t.Object({
  sessionStore: t.Union([t.Literal("prisma"), t.Literal("memory")]),
  defaultSceneId: t.String(),
  sessionTtlMs: t.Number(),
  tickMs: t.Number(),
  sessionPersistIntervalMs: t.Number(),
  maxInteractionsPerTick: t.Number(),
  maxChatCommandsPerWindow: t.Number(),
  chatRateLimitWindowMs: t.Number(),
  saveCooldownMs: t.Number(),
  maxMovePerTick: t.Number(),
  maxCommandsPerTick: t.Number(),
  maxChatMessageLength: t.Number(),
  viewportWidth: t.Number(),
  viewportHeight: t.Number(),
  hudPollIntervalMs: t.Number(),
  hudRetryDelayMs: t.Number(),
  sessionPurgeIntervalMs: t.Number(),
  sessionResumeWindowMs: t.Number(),
  commandSendIntervalMs: t.Number(),
  commandTtlMs: t.Number(),
  socketReconnectDelayMs: t.Number(),
  restoreRequestTimeoutMs: t.Number(),
  restoreMaxAttempts: t.Number(),
});

const runtimeGameConfigSchema = t.Object({
  sessionTtlMs: t.Number(),
  tickMs: t.Number(),
  sessionPersistIntervalMs: t.Number(),
  saveCooldownMs: t.Number(),
  maxMovePerTick: t.Number(),
  maxCommandsPerTick: t.Number(),
  maxInteractionsPerTick: t.Number(),
  maxChatCommandsPerWindow: t.Number(),
  chatRateLimitWindowMs: t.Number(),
  maxChatMessageLength: t.Number(),
  hudPollIntervalMs: t.Number(),
  hudRetryDelayMs: t.Number(),
  viewportWidth: t.Number(),
  viewportHeight: t.Number(),
  fallbackLocale: t.String(),
  assetBasePath: t.String(),
  defaultSceneId: t.String(),
  sessionResumeWindowMs: t.Number(),
  commandSendIntervalMs: t.Number(),
  commandTtlMs: t.Number(),
  socketReconnectDelayMs: t.Number(),
  restoreRequestTimeoutMs: t.Number(),
  restoreMaxAttempts: t.Number(),
});

const builderAiCapabilitiesDataSchema = t.Object({
  features: builderFeatureCapabilitySchema,
  capabilities: t.Array(builderProviderCapabilitySchema),
});

const builderAiResponseDataSchema = t.Object({
  intent: t.String(),
  rawText: t.String(),
  proposedOperations: t.Array(builderArtifactPatchSchema),
  riskFlags: t.Array(t.String()),
  validationHints: t.Array(t.String()),
  locale: t.String(),
  correlationId: t.String(),
});

const builderAiPlanDataSchema = t.Object({
  intent: t.String(),
  operations: t.Array(builderArtifactPatchSchema),
  riskFlags: t.Array(t.String()),
  requirements: t.Array(t.String()),
  correlationId: t.String(),
});

const builderHfTrainingRequestDataSchema = t.Object({
  runId: t.String(),
  status: t.String(),
  goal: t.String(),
  automationPath: t.String(),
});

const starterProjectTemplateIdSchema = t.Union([
  t.Literal("blank"),
  t.Literal("tea-house-story"),
  t.Literal("2d-game"),
  t.Literal("3d-game"),
]);

const builderProjectDataSchema = t.Object({
  id: t.String(),
  starterTemplateId: starterProjectTemplateIdSchema,
  createdBy: t.String(),
  updatedBy: t.String(),
  source: t.String(),
  checksum: t.String(),
  version: t.Number(),
  published: t.Boolean(),
  latestReleaseVersion: t.Number(),
  publishedReleaseVersion: t.Nullable(t.Number()),
  lastUpdatedAtMs: t.Number(),
  scenes: builderSceneCatalogSchema,
  dialogues: builderDialogueCatalogSchema,
});

const builderPublishDataSchema = t.Object({
  action: t.Union([t.Literal("publish"), t.Literal("unpublish")]),
  releaseVersion: t.Nullable(t.Number()),
  result: builderMutationResultSchema,
  checksum: t.String(),
});

const builderPatchPreviewOperationSchema = t.Object({
  operation: builderArtifactPatchSchema,
  valid: t.Boolean(),
  message: t.String(),
  before: t.Optional(t.String()),
  after: t.Optional(t.String()),
});

const builderPatchPreviewDataSchema = t.Object({
  projectId: t.String(),
  version: t.Number(),
  checksum: t.String(),
  operations: t.Array(builderPatchPreviewOperationSchema),
});

const builderPatchApplyDataSchema = t.Object({
  projectId: t.String(),
  version: t.Number(),
  checksum: t.String(),
  applied: t.Number(),
  operations: t.Array(builderPatchPreviewOperationSchema),
});

const builderSceneMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: builderSceneSchema,
  checksum: t.String(),
  detailHtml: t.Optional(t.String()),
});

const builderSceneDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Null(),
  checksum: t.String(),
});

const builderNpcMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Union([builderNpcSchema, t.Null()]),
  checksum: t.String(),
});

const builderNpcDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Array(builderNpcSchema),
  checksum: t.String(),
});

const builderDialogueMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Object({
    key: t.String(),
    text: t.String(),
  }),
  checksum: t.String(),
  detailHtml: t.Optional(t.String()),
});

const builderDialogueDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Nullable(t.String()),
  checksum: t.String(),
});

const builderStatusDataSchema = t.Object({
  status: appGameConfigSchema,
  features: availableAiFeaturesSchema,
  engine: runtimeGameConfigSchema,
  correlationId: t.String(),
});

const builderAssetUploadDataSchema = t.Object({
  id: t.String(),
  source: t.String(),
  byteLength: t.Number(),
});

const builderSuccessDataSchema = t.Union([
  builderAiCapabilitiesDataSchema,
  builderAiResponseDataSchema,
  builderAiPlanDataSchema,
  builderHfTrainingRequestDataSchema,
  builderProjectDataSchema,
  builderPublishDataSchema,
  builderSceneMutationDataSchema,
  builderSceneDeleteDataSchema,
  builderNpcMutationDataSchema,
  builderNpcDeleteDataSchema,
  builderDialogueMutationDataSchema,
  builderDialogueDeleteDataSchema,
  builderPatchPreviewDataSchema,
  builderPatchApplyDataSchema,
  builderStatusDataSchema,
  builderAssetUploadDataSchema,
]);

/** TypeBox schema for success envelopes across builder endpoints. */
const builderOkResponse = t.Object({
  ok: t.Literal(true),
  data: builderSuccessDataSchema,
});

/** TypeBox schema for mutation-only success envelopes. */
const builderMutationOkResponse = t.Object({
  ok: t.Literal(true),
  data: builderMutationResultSchema,
});

const decodePathValue = (value: string): string => safeDecodeUri(value);

const getBuilderMessages = (locale: string | undefined) =>
  getMessages(locale ? normalizeLocale(locale) : appConfig.defaultLocale).builder;

const buildBuilderNotFoundError = (
  request: Request,
  headers: Record<string, string | number | undefined>,
  locale: string | undefined,
  messageKey: "projectNotFound" | "sceneNotFound" | "npcNotFound" | "dialogueNotFound",
) =>
  buildError(
    request,
    headers,
    "NOT_FOUND",
    httpStatus.notFound,
    getBuilderMessages(locale)[messageKey],
  );

const toBuilderArtifactPatch = (patch: BuilderArtifactPatch) => ({
  op: patch.op,
  path: patch.path,
  value: patch.value,
  checksum: patch.checksum,
  confidence: patch.confidence,
});

const toIdlePauseMs = (x: readonly [number, number]): [number, number] => [x[0], x[1]];

const toBuilderNpc = (npc: SceneNpcDefinition) => ({
  characterKey: npc.characterKey,
  displayName: npc.displayName,
  x: npc.x,
  y: npc.y,
  labelKey: npc.labelKey,
  dialogueKeys: [...npc.dialogueKeys],
  interactRadius: npc.interactRadius,
  ai: {
    wanderRadius: npc.ai.wanderRadius,
    wanderSpeed: npc.ai.wanderSpeed,
    idlePauseMs: toIdlePauseMs(npc.ai.idlePauseMs),
    greetOnApproach: npc.ai.greetOnApproach,
    greetLineKey: npc.ai.greetLineKey,
  },
});

const toBuilderScene = (scene: SceneDefinition) => ({
  id: scene.id,
  displayTitle: scene.displayTitle,
  titleKey: scene.titleKey,
  background: scene.background,
  sceneMode: scene.sceneMode,
  geometry: {
    width: scene.geometry.width,
    height: scene.geometry.height,
  },
  spawn: {
    x: scene.spawn.x,
    y: scene.spawn.y,
  },
  npcs: scene.npcs.map(toBuilderNpc),
  collisions: scene.collisions.map((collision) => ({
    x: collision.x,
    y: collision.y,
    width: collision.width,
    height: collision.height,
  })),
  nodes: scene.nodes ? [...scene.nodes] : [],
});

const toBuilderScenesRecord = (input: ReadonlyMap<string, SceneDefinition>) =>
  Object.fromEntries(Array.from(input.entries(), ([id, scene]) => [id, toBuilderScene(scene)]));

const toBuilderMutationResult = (result: BuilderMutationResult) => ({
  projectId: result.projectId,
  resourceType: result.resourceType,
  resourceId: result.resourceId,
  action: result.action,
});

const toBuilderAiResponse = (response: BuilderAIResponse): BuilderAIResponse => ({
  intent: response.intent,
  rawText: response.rawText,
  proposedOperations: response.proposedOperations.map(toBuilderArtifactPatch),
  riskFlags: [...response.riskFlags],
  validationHints: [...response.validationHints],
});

const projectDialogues = async (
  projectId: string,
  locale: LocaleCode,
): Promise<Record<string, string>> => {
  const project = await builderService.getProject(projectId);
  if (!project) return {};
  const catalog = project.dialogues.get(locale) ?? new Map<string, string>();
  return Object.fromEntries(Array.from(catalog.entries()));
};

const toChromeProject = async (projectId: string) => {
  const project = await builderService.getProject(projectId);
  if (!project) {
    return null;
  }
  return {
    id: project.id,
    branding: project.brand,
    version: project.version,
    latestReleaseVersion: project.latestReleaseVersion,
    publishedReleaseVersion: project.publishedReleaseVersion,
    published: project.published,
    lastUpdatedAtMs: project.lastUpdatedAtMs,
  };
};

const createBuilderPatch = (
  operation: "add" | "replace" | "remove",
  value: string,
  confidence: number,
): BuilderArtifactPatch => ({
  op: operation,
  path: BUILDER_ARTIFACT_PATCH_PATH_DIALOGUE_TEST,
  value,
  confidence,
});

const renderSceneWorkspace = async (
  locale: LocaleCode,
  projectId: string,
  search = "",
  page = 1,
  selectedSceneId = "",
): Promise<string> => {
  const project = await builderService.getProject(projectId);
  const scenes = Object.fromEntries(project?.scenes.entries() ?? []);
  return renderSceneEditor(
    getMessages(locale),
    scenes,
    locale,
    projectId,
    search,
    page,
    selectedSceneId,
  );
};

const renderNpcWorkspace = async (locale: LocaleCode, projectId: string): Promise<string> => {
  const project = await builderService.getProject(projectId);
  const scenes = Object.fromEntries(project?.scenes.entries() ?? []);
  return renderNpcEditor(getMessages(locale), scenes, gameSpriteManifests, locale, projectId);
};

const renderDialogueWorkspace = async (
  locale: LocaleCode,
  projectId: string,
  search = "",
): Promise<string> =>
  renderDialogueEditor(
    getMessages(locale),
    await projectDialogues(projectId, locale),
    locale,
    projectId,
    search,
  );

const renderAssetsWorkspace = async (
  locale: LocaleCode,
  projectId: string,
  search = "",
  page = 1,
  selectedAssetId = "",
): Promise<string> => {
  const project = await builderService.getProject(projectId);
  return renderAssetsEditor(
    getMessages(locale),
    locale,
    projectId,
    Array.from(project?.assets.values() ?? []),
    Array.from(project?.animationClips.values() ?? []),
    search,
    page,
    selectedAssetId,
  );
};

const renderMechanicsWorkspace = async (locale: LocaleCode, projectId: string): Promise<string> => {
  const project = await builderService.getProject(projectId);
  return renderMechanicsEditor(
    getMessages(locale),
    locale,
    projectId,
    Array.from(project?.quests.values() ?? []),
    Array.from(project?.triggers.values() ?? []),
    Array.from(project?.dialogueGraphs.values() ?? []),
    Array.from(project?.flags.values() ?? []),
  );
};

const renderAutomationWorkspace = async (
  locale: LocaleCode,
  projectId: string,
): Promise<string> => {
  const project = await builderService.getProject(projectId);
  return renderAutomationPanel(
    getMessages(locale),
    locale,
    projectId,
    Array.from(project?.automationRuns.values() ?? []),
    Array.from(project?.artifacts.values() ?? []),
  );
};

const renderProjectChromeOob = async (
  locale: LocaleCode,
  projectId: string,
  currentPath: string,
): Promise<string> => {
  const chrome = renderBuilderProjectShell(
    getMessages(locale),
    locale,
    projectId,
    currentPath,
    await toChromeProject(projectId),
    resolveBuilderChromeTab(currentPath),
  );
  return chrome.replace(
    '<section id="builder-project-shell"',
    '<section id="builder-project-shell" hx-swap-oob="outerHTML"',
  );
};

const withProjectChromeRefresh = async (
  locale: LocaleCode,
  projectId: string,
  currentPath: string,
  html: string,
): Promise<string> => `${await renderProjectChromeOob(locale, projectId, currentPath)}${html}`;

const resolveBuilderChromeTab = (currentPath: string): string => {
  if (currentPath.includes("/settings")) {
    return "ai";
  }

  if (currentPath.includes("/operations")) {
    return "automation";
  }

  if (currentPath.includes("/assets")) {
    return "assets";
  }

  if (currentPath.includes("/systems")) {
    return "mechanics";
  }

  if (currentPath.includes("/story")) {
    return "dialogue";
  }

  if (currentPath.includes("/characters")) {
    return "npcs";
  }

  if (currentPath.includes("/playtest")) {
    return "play";
  }

  if (currentPath.includes("/start")) {
    return "dashboard";
  }

  return "scenes";
};

const toBuilderRedirectPath = (path: string): string => {
  const candidate = path.trim();
  if (!candidate) {
    return appRoutes.builderStart;
  }

  const pathOnly = candidate.split("#", 1)[0]?.split("?", 1)[0] ?? "";
  if (!pathOnly.startsWith("/")) {
    return appRoutes.builderStart;
  }

  const decodedPath = safeDecodeUri(pathOnly);

  if (decodedPath.includes("..")) {
    return appRoutes.builderStart;
  }

  if (decodedPath === appRoutes.builder) {
    return appRoutes.builderStart;
  }

  if (!decodedPath.startsWith("/projects/")) {
    return appRoutes.builderStart;
  }

  if (decodedPath.includes("//")) {
    return appRoutes.builderStart;
  }

  const projectPathMatch = decodedPath.match(/^\/projects\/([^/?#]+)(\/.*)?$/);
  if (!projectPathMatch) {
    return appRoutes.builderStart;
  }

  const genericPath = `/projects/:projectId${projectPathMatch[2] ?? ""}`.replace(/\/$/, "");
  if (genericPath === "/projects/:projectId") {
    return appRoutes.builderStart;
  }

  return genericPath;
};

const renderErrorHtml = (message: string): string =>
  `<div class="alert alert-error" role="alert">${escapeHtml(message)}</div>`;

const wantsHtml = (acceptHeader: string | null): boolean =>
  acceptHeader === null ||
  acceptHeader.includes("text/html") ||
  acceptHeader.includes("*/*") ||
  acceptHeader.includes("application/xhtml+xml");

const buildError = (
  request: Request,
  headers: Record<string, string | number | undefined>,
  code: AppErrorCode,
  status: number,
  message: string,
  retryable = false,
) => {
  const correlationId = ensureCorrelationIdHeader(request, headers);
  return errorEnvelope(new ApplicationError(code, message, status, retryable), correlationId);
};

const formatBuilderTemplate = (
  template: string,
  replacements: Readonly<Record<string, string>>,
): string =>
  Object.entries(replacements).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template,
  );

const describePublishValidationIssue = (
  locale: string | undefined,
  issue: BuilderPublishValidationIssue,
): string => {
  const messages = getBuilderMessages(locale);
  switch (issue.code) {
    case "no-scenes":
      return messages.publishValidationNoScenes;
    case "3d-scene-needs-webgpu":
      return formatBuilderTemplate(messages.publishValidation3dSceneNeedsWebgpu, {
        sceneId: issue.sceneId ?? "",
      });
    case "scene-spawn-out-of-bounds":
      return formatBuilderTemplate(messages.publishValidationSceneSpawnOutOfBounds, {
        sceneId: issue.sceneId ?? "",
      });
    case "scene-npc-out-of-bounds":
      return formatBuilderTemplate(messages.publishValidationSceneNpcOutOfBounds, {
        sceneId: issue.sceneId ?? "",
        npcId: issue.npcId ?? "",
      });
    case "scene-node-asset-missing":
      return formatBuilderTemplate(messages.publishValidationNodeAssetMissing, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        assetId: issue.assetId ?? "",
      });
    case "scene-node-asset-unapproved":
      return formatBuilderTemplate(messages.publishValidationNodeAssetUnapproved, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        assetId: issue.assetId ?? "",
      });
    case "scene-node-asset-scene-mode-mismatch":
      return formatBuilderTemplate(messages.publishValidationNodeAssetSceneModeMismatch, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        assetId: issue.assetId ?? "",
        expectedSceneMode: issue.expectedSceneMode ?? "",
        actualSceneMode: issue.actualSceneMode ?? "",
      });
    case "scene-node-asset-kind-mismatch":
      return formatBuilderTemplate(messages.publishValidationNodeAssetKindMismatch, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        assetId: issue.assetId ?? "",
        assetKind: issue.assetKind ?? "",
      });
    case "scene-node-asset-format-unsupported":
      return formatBuilderTemplate(messages.publishValidationNodeAssetFormatUnsupported, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        assetId: issue.assetId ?? "",
        sourceFormat: issue.sourceFormat ?? "",
      });
    case "scene-node-clip-missing":
      return formatBuilderTemplate(messages.publishValidationNodeClipMissing, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        clipId: issue.clipId ?? "",
      });
    case "scene-node-clip-scene-mode-mismatch":
      return formatBuilderTemplate(messages.publishValidationNodeClipSceneModeMismatch, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        clipId: issue.clipId ?? "",
        expectedSceneMode: issue.expectedSceneMode ?? "",
        actualSceneMode: issue.actualSceneMode ?? "",
      });
    case "scene-node-clip-asset-mismatch":
      return formatBuilderTemplate(messages.publishValidationNodeClipAssetMismatch, {
        sceneId: issue.sceneId ?? "",
        nodeId: issue.nodeId ?? "",
        clipId: issue.clipId ?? "",
        assetId: issue.assetId ?? "",
      });
    case "animation-clip-asset-missing":
      return formatBuilderTemplate(messages.publishValidationClipAssetMissing, {
        clipId: issue.clipId ?? "",
        assetId: issue.assetId ?? "",
      });
    case "animation-clip-asset-scene-mode-mismatch":
      return formatBuilderTemplate(messages.publishValidationClipAssetSceneModeMismatch, {
        clipId: issue.clipId ?? "",
        assetId: issue.assetId ?? "",
        expectedSceneMode: issue.expectedSceneMode ?? "",
        actualSceneMode: issue.actualSceneMode ?? "",
      });
  }
};

const describePublishValidationIssues = (
  locale: string | undefined,
  issues: readonly BuilderPublishValidationIssue[],
): string => {
  const messages = getBuilderMessages(locale);
  const details = issues.map((issue) => describePublishValidationIssue(locale, issue)).join(" ");
  return `${messages.publishValidationFailed} ${details}`.trim();
};

const parseOperation = (rawText: string): BuilderArtifactPatch[] => {
  const fallback: BuilderArtifactPatch = {
    op: "replace",
    path: BUILDER_ARTIFACT_PATCH_PATH_DEFAULT_LAST_LINE,
    value: "",
  };

  if (rawText.trim().length === 0) {
    return [fallback];
  }

  const parsed = safeJsonParse<readonly unknown[] | null>(rawText, null, (value) =>
    Array.isArray(value),
  );
  if (!Array.isArray(parsed)) {
    return [fallback];
  }

  return parsed
    .map((item): BuilderArtifactPatch | null => {
      if (!isRecord(item)) {
        return null;
      }

      if (typeof item.op !== "string") {
        return null;
      }
      if (typeof item.path !== "string" || item.path.length === 0) {
        return null;
      }

      const op = item.op === "add" || item.op === "remove" ? item.op : "replace";
      return {
        op,
        path: item.path,
        value: typeof item.value === "string" ? item.value : JSON.stringify(item.value ?? ""),
        checksum: typeof item.checksum === "string" ? item.checksum : undefined,
        confidence:
          typeof item.confidence === "number" && Number.isFinite(item.confidence)
            ? Math.max(0, Math.min(1, item.confidence))
            : undefined,
      };
    })
    .filter((item): item is BuilderArtifactPatch => item !== null);
};

const makeAiResult = async (request: BuilderAIRequest): Promise<BuilderAIResponse> => {
  if (request.mode === "assist" || request.mode === "compose") {
    const assistant = await suggestUserFlowStep(request.prompt, request.context);
    const operations = parseOperation(assistant.ok ? assistant.text : assistant.error);
    return {
      intent: request.mode,
      rawText: assistant.ok ? assistant.text : assistant.error,
      proposedOperations: operations,
      riskFlags: assistant.ok ? [] : [`${request.mode}-generation-failed`],
      validationHints: assistant.ok
        ? ["Validate operation shape before applying to the project."]
        : ["Retry with clearer constraints."],
    };
  }

  const generated = await generateNpcDialogue(
    {
      npcId: request.npcId ?? "guide",
      sceneId: request.sceneId ?? defaultGameConfig.defaultSceneId,
      playerMessage: request.prompt,
      history: request.context ? [request.context] : undefined,
    },
    request.locale ?? appConfig.defaultLocale,
  );

  const payload = generated.ok
    ? [createBuilderPatch("replace", generated.text, 0.62)]
    : [createBuilderPatch("replace", generated.error, 0)];

  return {
    intent: "test",
    rawText: generated.ok ? generated.text : generated.error,
    proposedOperations: payload,
    riskFlags: generated.ok ? [] : ["test-generation-failed"],
    validationHints: generated.ok
      ? ["Verify tone and locale before applying."]
      : ["Try again when AI providers recover."],
  };
};

const toAiResponseEnvelope = (
  request: BuilderAIRequest,
  response: BuilderAIResponse,
  requestContext: CorrelationRequest,
) => {
  const correlationId = ensureCorrelationIdHeader(requestContext.request, requestContext.headers);
  return successEnvelope({
    intent: response.intent,
    rawText: response.rawText,
    proposedOperations: response.proposedOperations.map(toBuilderArtifactPatch),
    riskFlags: [...response.riskFlags],
    validationHints: [...response.validationHints],
    locale: request.locale ?? appConfig.defaultLocale,
    correlationId,
  });
};

const serializeOperations = (operations: readonly BuilderArtifactPatch[]): string =>
  JSON.stringify(operations.map(toBuilderArtifactPatch));

const renderPatchPreviewHtml = (
  locale: LocaleCode,
  projectId: string,
  version: number,
  operations: readonly BuilderPatchPreviewOperation[],
) => {
  const messages = getMessages(locale);
  const builderMessages = getBuilderMessages(locale);
  const hasInvalidOperations = operations.some((operation) => !operation.valid);
  const serializedOperations = escapeHtml(
    serializeOperations(
      operations.map((operation) => ({
        ...operation.operation,
      })),
    ),
  );
  const rows = operations
    .map(
      (operation) => `<li class="rounded-box border border-base-300 bg-base-200/60 p-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge ${operation.valid ? "badge-success" : "badge-error"} badge-soft">${escapeHtml(operation.valid ? messages.builder.previewReady : messages.api.frameworkErrors.validation)}</span>
          <code>${escapeHtml(operation.operation.op)} ${escapeHtml(operation.operation.path)}</code>
        </div>
        <p class="mt-2 text-sm">${escapeHtml(operation.message)}</p>
        ${
          operation.before || operation.after
            ? `<div class="mt-2 grid gap-2 text-xs lg:grid-cols-2">
                <div class="rounded-box bg-base-100 p-2"><div class="mt-1 break-words">${escapeHtml(operation.before ?? messages.common.notApplicable)}</div></div>
                <div class="rounded-box bg-base-100 p-2"><div class="mt-1 break-words">${escapeHtml(operation.after ?? messages.common.notApplicable)}</div></div>
              </div>`
            : ""
        }
      </li>`,
    )
    .join("");

  return `<article class="${cardClasses.bordered}">
    <div class="card-body gap-4">
      <div>
        <h3 class="card-title">${escapeHtml(messages.builder.previewReady)}</h3>
        <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.patchOperations)}</p>
      </div>
      ${
        hasInvalidOperations
          ? `<div role="alert" class="alert alert-error alert-soft">
              <span>${escapeHtml(builderMessages.invalidPatchPlan)}</span>
            </div>`
          : ""
      }
      <ul class="space-y-3">${rows}</ul>
      ${
        hasInvalidOperations
          ? ""
          : `<form
              hx-post="${escapeHtml(appRoutes.aiBuilderPatchApplyForm)}"
              hx-target="#ai-patch-result"
              hx-swap="innerHTML"
              class="flex flex-wrap gap-2"
            >
              ${renderBuilderHiddenFields(projectId, locale)}
              <input type="hidden" name="expectedVersion" value="${escapeHtml(String(version))}" />
              <textarea name="operationsJson" class="hidden">${serializedOperations}</textarea>
              <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.applyChanges)}">${escapeHtml(messages.builder.applyChanges)}</button>
            </form>`
      }
    </div>
  </article>`;
};

const renderPatchApplyBlockedHtml = async (
  locale: LocaleCode,
  projectId: string,
  operations: readonly BuilderPatchPreviewOperation[],
): Promise<string> => {
  const messages = getMessages(locale);
  const builderMessages = getBuilderMessages(locale);
  const rows = operations
    .map(
      (operation) =>
        `<li class="rounded-box border border-base-300 bg-base-200/60 p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge ${operation.valid ? "badge-success" : "badge-error"} badge-soft">${escapeHtml(operation.valid ? messages.builder.previewReady : messages.api.frameworkErrors.validation)}</span>
            <code>${escapeHtml(operation.operation.op)} ${escapeHtml(operation.operation.path)}</code>
          </div>
          <p class="mt-2 text-sm">${escapeHtml(operation.message)}</p>
        </li>`,
    )
    .join("");

  return withProjectChromeRefresh(
    locale,
    projectId,
    appRoutes.builderAi,
    `<article class="${cardClasses.bordered}">
      <div class="card-body gap-4">
        <div role="alert" class="alert alert-error alert-soft">
          <span>${escapeHtml(builderMessages.invalidPatchPlan)}</span>
        </div>
        <ul class="space-y-3">${rows}</ul>
      </div>
    </article>`,
  );
};

export const builderApiRoutes = new Elysia({ name: "builder-api", prefix: "/api/builder" })
  .use(builderRequestContextPlugin)
  .use(ssePlugin)
  .onBeforeHandle(
    ({
      request,
      builderProjectId,
      builderPrincipalType,
      builderPrincipalUserId,
      builderPrincipalOrganizationId,
      builderPrincipalRoleKeys,
    }) => {
      if (!isMutatingBuilderMethod(request.method)) {
        return;
      }

      const identity = resolveBuilderPrincipalFromContext({
        builderPrincipalType,
        builderPrincipalUserId,
        builderPrincipalOrganizationId,
        builderPrincipalRoleKeys,
      });
      const allowed = canPerformBuilderAction(identity, builderProjectId, "write");
      if (!allowed) {
        return requireBuilderAction(identity, builderProjectId, "write");
      }
    },
  )
  .get(
    route(appRoutes.builderPlatformReadiness),
    async ({ params, builderLocale, builderProjectId, builderCurrentPath, status }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { params },
      );
      const project = await builderService.peekProject(actionContext.builderProjectId);
      const spriteManifestCount = countProjectSpriteManifests(actionContext.builderProjectId);
      const features = await detectAvailableFeatures();
      const readinessAudit =
        project === null
          ? undefined
          : deriveBuilderReadinessAudit({
              scenes: project.scenes.values(),
              assets: project.assets.values(),
              animationClips: project.animationClips.values(),
              animationTimelines: project.animationTimelines.values(),
              dialogueGraphs: project.dialogueGraphs.values(),
              quests: project.quests.values(),
              triggers: project.triggers.values(),
              flags: project.flags.values(),
              generationJobs: project.generationJobs.values(),
              automationRuns: project.automationRuns.values(),
              latestReleaseVersion: project.latestReleaseVersion,
              publishedReleaseVersion: project.publishedReleaseVersion,
            });
      const readiness = evaluateBuilderPlatformReadiness({
        sceneCount: project?.scenes.size ?? 0,
        spriteManifestCount,
        aiFeatures: features,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
        audit: readinessAudit,
      });

      return status(httpStatus.ok, successEnvelope(readiness));
    },
  )
  .get(
    "/ops/observability",
    async ({ params, builderLocale, builderProjectId, builderCurrentPath, status }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { params },
      );
      const project = await builderService.peekProject(actionContext.builderProjectId);
      const registry = await ProviderRegistry.getInstance();
      const aiStatus = await registry.getStatus();
      const readinessAudit =
        project === null
          ? undefined
          : deriveBuilderReadinessAudit({
              scenes: project.scenes.values(),
              assets: project.assets.values(),
              animationClips: project.animationClips.values(),
              animationTimelines: project.animationTimelines.values(),
              dialogueGraphs: project.dialogueGraphs.values(),
              quests: project.quests.values(),
              triggers: project.triggers.values(),
              flags: project.flags.values(),
              generationJobs: project.generationJobs.values(),
              automationRuns: project.automationRuns.values(),
              latestReleaseVersion: project.latestReleaseVersion,
              publishedReleaseVersion: project.publishedReleaseVersion,
            });
      const readiness = evaluateBuilderPlatformReadiness({
        sceneCount: project?.scenes.size ?? 0,
        spriteManifestCount: countProjectSpriteManifests(actionContext.builderProjectId),
        aiFeatures: await detectAvailableFeatures(),
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
        audit: readinessAudit,
      });
      const automationRunHistory = project
        ? [...project.automationRuns.values()]
            .sort((left, right) => right.updatedAtMs - left.updatedAtMs)
            .slice(0, 20)
        : [];
      return status(
        httpStatus.ok,
        successEnvelope({
          activeSessions: await gameLoop.countActiveSessions(),
          readiness,
          automationRunHistory,
          ai: {
            providers: aiStatus.providers,
            preferredProvider: aiStatus.preferredProvider,
            rag: {
              chunkSize: appConfig.ai.ragChunkSize,
              chunkOverlap: appConfig.ai.ragChunkOverlap,
              searchLimit: appConfig.ai.ragSearchLimit,
            },
          },
          recentAuditEvents: await auditService.listRecent(50),
        }),
      );
    },
  )
  .get("/ops/retention-export", async ({ status }) => {
    return status(
      httpStatus.ok,
      successEnvelope({
        retention: auditService.retentionPolicy(),
      }),
    );
  })
  .get(
    route(appRoutes.aiBuilderCapabilities),
    async ({ params, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { params },
      );
      const messages = getMessages(actionContext.builderLocale);
      const registry = await ProviderRegistry.getInstance();
      const registryStatus = await registry.getStatus();
      const aiFeatures = await detectAvailableFeatures();
      const project = actionContext.builderProjectId
        ? await builderService.peekProject(actionContext.builderProjectId)
        : null;
      const readinessAudit = project
        ? deriveBuilderReadinessAudit({
            scenes: project.scenes.values(),
            assets: project.assets.values(),
            animationClips: project.animationClips.values(),
            animationTimelines: project.animationTimelines.values(),
            dialogueGraphs: project.dialogueGraphs.values(),
            quests: project.quests.values(),
            triggers: project.triggers.values(),
            flags: project.flags.values(),
            generationJobs: project.generationJobs.values(),
            automationRuns: project.automationRuns.values(),
            latestReleaseVersion: project.latestReleaseVersion,
            publishedReleaseVersion: project.publishedReleaseVersion,
          })
        : undefined;
      const readiness = evaluateBuilderPlatformReadiness({
        sceneCount: project?.scenes.size ?? 0,
        spriteManifestCount: countProjectSpriteManifests(actionContext.builderProjectId),
        aiFeatures,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
        audit: readinessAudit,
      });
      const creatorCapabilities = toCreatorCapabilities(
        messages,
        registryStatus,
        readiness,
        vectorStore.available,
      );
      const features: FeatureCapability = deriveFeatureCapability(
        registryStatus,
        vectorStore.available,
      );

      return status(
        httpStatus.ok,
        successEnvelope({
          features,
          vectorStore: {
            available: vectorStore.available,
          },
          creatorCapabilities: {
            items: [...creatorCapabilities.items],
          },
          providerCount: registryStatus.providers.length,
        }),
      );
    },
    {
      response: {
        [httpStatus.ok]: t.Object({
          ok: t.Literal(true),
          data: t.Object({
            features: builderFeatureCapabilitySchema,
            vectorStore: t.Object({
              available: t.Boolean(),
            }),
            creatorCapabilities: t.Object({
              items: t.Array(
                t.Object({
                  key: t.String(),
                  label: t.String(),
                  status: t.Union([
                    t.Literal("ready"),
                    t.Literal("degraded"),
                    t.Literal("unavailable"),
                  ]),
                  mode: t.Union([
                    t.Literal("provider"),
                    t.Literal("fallback"),
                    t.Literal("surface"),
                    t.Literal("none"),
                  ]),
                  reasonCode: t.Optional(t.String()),
                }),
              ),
            }),
            providerCount: t.Number(),
          }),
        }),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderTest),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: actionLocale } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const text = body.prompt ?? body.message;
      if (typeof text !== "string" || text.trim().length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(actionLocale).missingPrompt,
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "test",
        prompt: text,
        npcId: body.npcId,
        sceneId: body.sceneId,
        target: body.target,
        context: body.context,
        locale: actionLocale,
      };

      const response = await makeAiResult(aiRequest);
      if (!wantsHtml(request.headers.get("accept"))) {
        return status(
          httpStatus.ok,
          toAiResponseEnvelope(aiRequest, response, { request, headers: set.headers }),
        );
      }

      return `<article class="space-y-2">
        <h3 class="font-semibold">${escapeHtml(response.intent)}</h3>
        <p>${escapeHtml(response.rawText)}</p>
        <ul class="list-disc ml-6 text-sm">
          ${response.validationHints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join("")}
        </ul>
      </article>`;
    },
    {
      body: t.Object({
        prompt: t.Optional(t.String()),
        message: t.Optional(t.String()),
        npcId: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        target: t.Optional(t.String()),
        context: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([t.String(), builderOkResponse]),
        [httpStatus.badRequest]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderAssist),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const requestText = body.prompt?.trim();
      if (!requestText) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(actionLocale).missingPrompt,
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "assist",
        prompt: requestText,
        context: body.context,
        target: body.target,
        locale: actionLocale,
      };
      const response = await makeAiResult(aiRequest);
      const payload = toBuilderAiResponse(response);

      if (!wantsHtml(request.headers.get("accept"))) {
        return status(
          httpStatus.ok,
          toAiResponseEnvelope(aiRequest, response, { request, headers: set.headers }),
        );
      }

      const plan: BuilderAIRunPlan = {
        intent: response.intent,
        operations: response.proposedOperations.map(toBuilderArtifactPatch),
        riskFlags: [...response.riskFlags],
        requirements: ["tool-calling", "schema-validation"],
      };
      const serializedOperations = escapeHtml(serializeOperations(response.proposedOperations));
      const operationRows = plan.operations
        .map(
          (operation) =>
            `<li class="rounded-box bg-base-200/60 p-2"><code>${escapeHtml(operation.op)} ${escapeHtml(operation.path)}</code></li>`,
        )
        .join("");

      return `<article class="${cardClasses.bordered}">
        <div class="card-body gap-4">
          <div>
            <h3 class="card-title">${escapeHtml(getMessages(actionLocale).builder.assistantReviewTitle)}</h3>
            <p class="text-sm text-base-content/70">${escapeHtml(payload.rawText)}</p>
          </div>
          <ul class="space-y-2 text-sm">${operationRows}</ul>
          <form
            hx-post="${escapeHtml(appRoutes.aiBuilderPatchPreviewForm)}"
            hx-target="#ai-patch-result"
            hx-swap="innerHTML"
            class="flex flex-wrap gap-2"
          >
            ${renderBuilderHiddenFields(actionProjectId, actionLocale)}
            <textarea name="operationsJson" class="hidden">${serializedOperations}</textarea>
            <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(getMessages(actionLocale).builder.previewChanges)}">${escapeHtml(getMessages(actionLocale).builder.previewChanges)}</button>
          </form>
        </div>
      </article>`;
    },
    {
      body: t.Object({
        prompt: t.String(),
        context: t.Optional(t.String()),
        target: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([t.String(), builderOkResponse]),
        [httpStatus.badRequest]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.aiBuilderKnowledgeList),
    async ({ builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        {
          builderLocale,
          builderProjectId,
          builderCurrentPath,
        },
        {},
      );
      return renderKnowledgeDocumentList(
        getMessages(actionContext.builderLocale),
        actionContext.builderLocale,
        actionContext.builderProjectId,
        await knowledgeBaseService.listDocuments(actionContext.builderProjectId),
      );
    },
    {
      response: {
        [httpStatus.ok]: t.String(),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderKnowledgeDocuments),
    async ({ body, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      await knowledgeBaseService.ingestDocument({
        projectId: actionContext.builderProjectId,
        title: body.title,
        source: body.source,
        text: body.text,
        locale: actionContext.builderLocale,
      });

      return renderKnowledgeDocumentList(
        getMessages(actionContext.builderLocale),
        actionContext.builderLocale,
        actionContext.builderProjectId,
        await knowledgeBaseService.listDocuments(actionContext.builderProjectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        title: t.String({ minLength: 1 }),
        source: t.String({ minLength: 1 }),
        text: t.String({ minLength: 1 }),
      }),
      response: {
        [httpStatus.ok]: t.String(),
      },
    },
  )
  .delete(
    route(appRoutes.aiBuilderKnowledgeDocumentDetail),
    async ({ params, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        {
          builderLocale,
          builderProjectId,
          builderCurrentPath,
        },
        { params },
      );
      await knowledgeBaseService.deleteDocument(params.documentId, actionContext.builderProjectId);
      return renderKnowledgeDocumentList(
        getMessages(actionContext.builderLocale),
        actionContext.builderLocale,
        actionContext.builderProjectId,
        await knowledgeBaseService.listDocuments(actionContext.builderProjectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String({ minLength: 1 }),
        documentId: t.String({ minLength: 1 }),
      }),
      response: {
        [httpStatus.ok]: t.String(),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderKnowledgeSearch),
    async ({ body, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const result = await knowledgeBaseService.assist(body.prompt, {
        projectId: actionContext.builderProjectId,
        locale: actionContext.builderLocale,
        limit: body.limit,
      });

      if (!result.ok) {
        const messages = getMessages(actionContext.builderLocale);
        return `<div role="alert" class="alert alert-error alert-soft">${escapeHtml(result.error ?? messages.ai.noProviderAvailable)}</div>`;
      }

      return renderKnowledgeRetrievalResult(getMessages(actionContext.builderLocale), {
        text: result.text ?? "",
        matches: result.matches,
        model: result.model ?? "unknown",
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        prompt: t.String({ minLength: 1 }),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 20 })),
      }),
      response: {
        [httpStatus.ok]: t.String(),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderToolPlan),
    async ({ body, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const registry = await ProviderRegistry.getInstance();
      const result = await registry.planTools({
        goal: body.goal,
        projectId: actionContext.builderProjectId,
      });

      if (!result.ok) {
        return `<div role="alert" class="alert alert-error alert-soft">${escapeHtml(result.error)}</div>`;
      }

      return renderToolPlanPreview(getMessages(actionContext.builderLocale), result);
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        goal: t.String({ minLength: 1 }),
      }),
      response: {
        [httpStatus.ok]: t.String(),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderHfTraining),
    async ({
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
      builderPrincipalType,
      builderPrincipalUserId,
      builderPrincipalOrganizationId,
      builderPrincipalRoleKeys,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const messages = getBuilderMessages(actionLocale);
      const raw =
        body instanceof FormData
          ? Object.fromEntries(
              Array.from(body.entries()).map(([key, value]) => [key, String(value)]),
            )
          : body && typeof body === "object"
            ? (body as Record<string, unknown>)
            : {};
      const toField = (key: string): string => {
        const value = raw[key];
        if (typeof value === "string") {
          return value.trim();
        }
        if (typeof value === "number") {
          return String(value);
        }
        return "";
      };
      const datasetId = toField("datasetId");
      const datasetSplit = toField("datasetSplit") || "train";
      const baseModel = toField("baseModel");
      const outputModel = toField("outputModel");
      const method = toHfTrainingMethod(toField("method") || undefined);
      const epochs = Math.max(1, Math.min(30, Number.parseInt(toField("epochs") || "3", 10) || 3));
      const learningRate = Math.max(
        0.000001,
        Math.min(1, Number.parseFloat(toField("learningRate") || "0.00002") || 0.00002),
      );

      if (!isHfRepoId(datasetId) || !isHfRepoId(outputModel) || baseModel.length < 3) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            messages.hfTrainingInvalidRequest,
          ),
        );
      }

      const actionUpdatedBy = resolveBuilderUpdatedByFromContext({
        builderPrincipalType,
        builderPrincipalUserId,
        builderPrincipalOrganizationId,
        builderPrincipalRoleKeys,
      });
      const runId = `run.hf-jobs.${crypto.randomUUID()}`;
      const now = Date.now();
      const methodLabel = toHfTrainingMethodLabel(getMessages(actionLocale), method);
      const goal = [
        `HF Jobs ${methodLabel}`,
        `dataset=${datasetId}:${datasetSplit}`,
        `base=${baseModel}`,
        `output=${outputModel}`,
        `epochs=${epochs}`,
        `lr=${learningRate.toFixed(6)}`,
      ].join(" | ");
      const created = await builderService.saveAutomationRun(
        actionProjectId,
        {
          id: runId,
          run: {
            id: runId,
            status: "blocked_for_approval",
            goal,
            steps: [
              {
                id: `${runId}.step.submit-hf-job`,
                action: "http",
                summary: "Submit fine-tuning run to Hugging Face Jobs",
                status: "pending",
              },
            ],
            artifactIds: [],
            statusMessage: "hf.training.requested",
            dryRun: true,
            signedBy: actionUpdatedBy,
            signedAtMs: now,
            createdAtMs: now,
            updatedAtMs: now,
          },
        },
        actionUpdatedBy,
      );
      if (!created) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, actionLocale, "projectNotFound"),
        );
      }

      if (!wantsHtml(request.headers.get("accept"))) {
        return status(
          httpStatus.ok,
          successEnvelope({
            runId,
            status: created.payload.status,
            goal: created.payload.goal,
            automationPath: withQueryParameters(
              interpolateRoutePath(appRoutes.builderAutomation, { projectId: actionProjectId }),
              { lang: actionLocale },
            ),
          }),
        );
      }

      return withProjectChromeRefresh(
        actionLocale,
        actionProjectId,
        appRoutes.builderAi,
        `<article class="${cardClasses.bordered}">
          <div class="card-body gap-4">
            <div role="alert" class="alert alert-success alert-soft">
              <span>${escapeHtml(messages.hfTrainingQueuedTitle)}</span>
            </div>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.hfTrainingQueuedDescription)}</p>
            <ul class="list rounded-box bg-base-200/60 text-sm">
              <li><strong>${escapeHtml(messages.hfTrainingDatasetLabel)}:</strong> <code>${escapeHtml(`${datasetId}:${datasetSplit}`)}</code></li>
              <li><strong>${escapeHtml(messages.hfTrainingBaseModelLabel)}:</strong> <code>${escapeHtml(baseModel)}</code></li>
              <li><strong>${escapeHtml(messages.hfTrainingOutputModelLabel)}:</strong> <code>${escapeHtml(outputModel)}</code></li>
              <li><strong>${escapeHtml(messages.hfTrainingMethodLabel)}:</strong> ${escapeHtml(methodLabel)}</li>
            </ul>
            <a
              class="btn btn-outline btn-sm w-fit"
              href="${escapeHtml(
                withQueryParameters(
                  interpolateRoutePath(appRoutes.builderAutomation, { projectId: actionProjectId }),
                  { lang: actionLocale },
                ),
              )}"
              aria-label="${escapeHtml(messages.operations)}"
            >
              ${escapeHtml(messages.operations)}
            </a>
          </div>
        </article>`,
      );
    },
    {
      body: hfTrainingRequestSchema,
      response: {
        [httpStatus.ok]: t.Union([t.String(), builderOkResponse]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderPatchPreviewForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const preview = await builderService.previewArtifactPatch(
        actionProjectId,
        parseOperation(body.operationsJson),
      );
      if (!preview) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, actionLocale, "projectNotFound"),
        );
      }
      return renderPatchPreviewHtml(
        actionLocale,
        actionProjectId,
        preview.version,
        preview.operations,
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        operationsJson: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderPatchApplyForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const applied = await builderService.applyArtifactPatch(
        actionProjectId,
        parseOperation(body.operationsJson),
        body.expectedVersion ? Number.parseInt(body.expectedVersion, 10) : undefined,
        actionUpdatedBy,
      );
      if (!applied) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, actionLocale, "projectNotFound"),
        );
      }

      if (applied.rejected) {
        return status(
          httpStatus.conflict,
          await renderPatchApplyBlockedHtml(actionLocale, actionProjectId, applied.operations),
        );
      }

      const messages = getMessages(actionLocale);
      const rows = applied.operations
        .map(
          (operation) =>
            `<li class="rounded-box bg-base-200/60 p-2"><code>${escapeHtml(operation.operation.op)} ${escapeHtml(operation.operation.path)}</code></li>`,
        )
        .join("");

      return withProjectChromeRefresh(
        actionLocale,
        actionProjectId,
        appRoutes.builderAi,
        `<article class="${cardClasses.bordered}">
          <div class="card-body gap-4">
            <div role="alert" class="alert alert-success alert-soft">
              <span>${escapeHtml(messages.builder.applyComplete)}: ${applied.applied}</span>
            </div>
            <ul class="space-y-2 text-sm">${rows}</ul>
          </div>
        </article>`,
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        expectedVersion: t.Optional(t.String()),
        operationsJson: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.conflict]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderCompose),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: locale } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const requestText = body.prompt?.trim();
      if (!requestText) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(locale).missingPrompt,
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "compose",
        prompt: requestText,
        context: body.context,
        sceneId: body.sceneId,
        locale,
      };

      const response = await makeAiResult(aiRequest);
      const plan = {
        intent: response.intent,
        operations: response.proposedOperations.map(toBuilderArtifactPatch),
        riskFlags: [...response.riskFlags],
        requirements: ["tool-calling", "schema-validation"],
      };

      return status(
        httpStatus.ok,
        successEnvelope({
          ...plan,
          correlationId: ensureCorrelationIdHeader(request, set.headers),
        }),
      );
    },
    {
      body: t.Object({
        prompt: t.String(),
        context: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        target: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderPatchPreview),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: actionLocale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const preview = await builderService.previewArtifactPatch(projectId, body.operations);
      if (!preview) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, actionLocale, "projectNotFound"),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          projectId: preview.projectId,
          version: preview.version,
          checksum: preview.checksum,
          operations: preview.operations.map((operation) => ({
            operation: toBuilderArtifactPatch(operation.operation),
            valid: operation.valid,
            message: operation.message,
            before: operation.before,
            after: operation.after,
          })),
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        operations: t.Array(builderArtifactPatchSchema),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderPatchApply),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: actionLocale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const applied = await builderService.applyArtifactPatch(
        projectId,
        body.operations,
        body.expectedVersion,
        actionUpdatedBy,
      );
      if (!applied) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, actionLocale, "projectNotFound"),
        );
      }

      if (applied.rejected) {
        return status(
          httpStatus.conflict,
          buildError(
            request,
            set.headers,
            "CONFLICT",
            httpStatus.conflict,
            getBuilderMessages(actionLocale).invalidPatchPlan,
            true,
          ),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          projectId: applied.projectId,
          version: applied.version,
          checksum: applied.checksum,
          applied: applied.applied,
          operations: applied.operations.map((operation) => ({
            operation: toBuilderArtifactPatch(operation.operation),
            valid: operation.valid,
            message: operation.message,
            before: operation.before,
            after: operation.after,
          })),
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        expectedVersion: t.Optional(t.Number()),
        operations: t.Array(builderArtifactPatchSchema),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.conflict]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiProjects),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const {
        builderLocale: actionLocale,
        builderProjectId: actionProjectId,
        builderCurrentPath: actionCurrentPath,
      } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const project = await builderService.createProject(
        actionProjectId,
        body.starterTemplateId,
        actionUpdatedBy,
      );
      if (!project) {
        return status(
          httpStatus.notFound,
          errorEnvelope(
            new ApplicationError(
              "NOT_FOUND",
              getBuilderMessages(undefined).projectNotFound,
              httpStatus.notFound,
              false,
            ),
            ensureCorrelationIdHeader(request, set.headers),
          ),
        );
      }
      if (wantsHtml(request.headers.get("accept"))) {
        const redirectPath = toBuilderRedirectPath(actionCurrentPath);
        set.headers["HX-Redirect"] = withQueryParameters(
          interpolateRoutePath(redirectPath, { projectId: project.id }),
          {
            lang: actionLocale,
          },
        );
        return status(httpStatus.ok, "");
      }
      return status(
        httpStatus.ok,
        successEnvelope({
          id: project.id,
          starterTemplateId: project.starterTemplateId,
          createdBy: project.createdBy,
          updatedBy: project.updatedBy,
          source: project.source,
          checksum: project.checksum,
          version: project.version,
          published: project.published,
          latestReleaseVersion: project.latestReleaseVersion,
          publishedReleaseVersion: project.publishedReleaseVersion,
          lastUpdatedAtMs: project.lastUpdatedAtMs,
          scenes: toBuilderScenesRecord(project.scenes),
          dialogues: Object.fromEntries(
            (project.dialogues.get(appConfig.defaultLocale) ?? new Map<string, string>()).entries(),
          ),
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        starterTemplateId: starterProjectTemplateIdSchema,
        locale: t.Optional(t.String()),
        redirectPath: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.unprocessableEntity]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiProjectDetail),
    async ({
      params,
      query,
      set,
      request,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const project = await builderService.getProject(actionProjectId);
      if (!project) {
        return status(
          httpStatus.notFound,
          errorEnvelope(
            new ApplicationError(
              "NOT_FOUND",
              getBuilderMessages(actionLocale).projectNotFound,
              httpStatus.notFound,
              false,
            ),
            ensureCorrelationIdHeader(request, set.headers),
          ),
        );
      }
      const dialogues = Object.fromEntries(project.dialogues.get(actionLocale)?.entries() ?? []);

      return status(
        httpStatus.ok,
        successEnvelope({
          id: project.id,
          starterTemplateId: project.starterTemplateId,
          published: project.published,
          latestReleaseVersion: project.latestReleaseVersion,
          publishedReleaseVersion: project.publishedReleaseVersion,
          scenes: toBuilderScenesRecord(project.scenes),
          dialogues,
          createdBy: project.createdBy,
          updatedBy: project.updatedBy,
          source: project.source,
          checksum: project.checksum,
          version: project.version,
          lastUpdatedAtMs: project.lastUpdatedAtMs,
        }),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      query: t.Object({ locale: t.Optional(t.String()) }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .patch(
    route(appRoutes.builderApiProjectPublish),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const {
        builderLocale: actionLocale,
        builderProjectId: actionProjectId,
        builderCurrentPath: actionCurrentPath,
      } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const shouldPublish = builderService.resolvePublishState(body.published);
      const result = await builderService.publishProject(
        actionProjectId,
        shouldPublish,
        actionUpdatedBy,
      );
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, undefined, "projectNotFound"),
        );
      }

      if (!result.ok) {
        return status(
          httpStatus.unprocessableEntity,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.unprocessableEntity,
            describePublishValidationIssues(actionLocale, result.issues),
          ),
        );
      }

      const project = result.snapshot;

      if (wantsHtml(request.headers.get("accept"))) {
        const redirectPath = interpolateRoutePath(toBuilderRedirectPath(actionCurrentPath), {
          projectId: project.id,
        });
        return renderBuilderProjectShell(
          getMessages(actionLocale),
          actionLocale,
          project.id,
          redirectPath,
          await toChromeProject(project.id),
          resolveBuilderChromeTab(redirectPath),
        );
      }

      const payload: BuilderMutationResult = {
        projectId: project.id,
        resourceType: "project",
        resourceId: project.id,
        action: "published",
      };

      return status(
        httpStatus.ok,
        successEnvelope({
          action: shouldPublish ? "publish" : "unpublish",
          releaseVersion: project.publishedReleaseVersion,
          result: toBuilderMutationResult(payload),
          checksum: project.checksum,
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String() }),
      body: t.Object({
        published: t.Union([t.Boolean(), t.String()]),
        locale: t.Optional(t.String()),
        currentPath: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.unprocessableEntity]: builderErrorResponse,
      },
    },
  )
  .patch(
    route(appRoutes.builderApiProjectBranding),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: actionLocale, builderProjectId: actionProjectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.saveProjectBranding(
        actionProjectId,
        {
          appName: body.appName,
          appSubtitle: body.appSubtitle,
          logoMark: body.logoMark,
          logoImagePath: body.logoImagePath,
          builderShellName: body.builderShellName,
          builderShellDescription: body.builderShellDescription,
          playerShellName: body.playerShellName,
          surfaceTheme: body.surfaceTheme,
          headingFont: body.headingFont,
          bodyFont: body.bodyFont,
          monoFont: body.monoFont,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          accentColor: body.accentColor,
          neutralColor: body.neutralColor,
          base100Color: body.base100Color,
          baseContentColor: body.baseContentColor,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      if (wantsHtml(request.headers.get("accept"))) {
        set.headers["HX-Redirect"] = `${withQueryParameters(
          interpolateRoutePath(appRoutes.builderAi, {
            projectId: actionProjectId,
          }),
          { lang: actionLocale },
        )}#builder-brand-control-plane`;
        return status(httpStatus.ok, "");
      }

      return status(httpStatus.ok, successEnvelope(toBuilderMutationResult(mutation.result)));
    },
    {
      params: t.Object({ projectId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        appName: t.Optional(t.String()),
        appSubtitle: t.Optional(t.String()),
        logoMark: t.Optional(t.String()),
        logoImagePath: t.Optional(t.String()),
        builderShellName: t.Optional(t.String()),
        builderShellDescription: t.Optional(t.String()),
        playerShellName: t.Optional(t.String()),
        surfaceTheme: t.Optional(t.String()),
        headingFont: t.Optional(t.String()),
        bodyFont: t.Optional(t.String()),
        monoFont: t.Optional(t.String()),
        primaryColor: t.Optional(t.String()),
        secondaryColor: t.Optional(t.String()),
        accentColor: t.Optional(t.String()),
        neutralColor: t.Optional(t.String()),
        base100Color: t.Optional(t.String()),
        baseContentColor: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderMutationOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiScenesCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const identity = deriveSceneIdentity({
        id: body.id,
        displayTitle: body.displayTitle,
        titleKey: body.titleKey,
      });
      if (identity.id.length === 0 || identity.titleKey.length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(locale).sceneTitleRequired,
          ),
        );
      }
      const createPayload: BuilderSceneCreatePayload = {
        id: identity.id,
        displayTitle: body.displayTitle,
        titleKey: identity.titleKey,
        background: body.background,
        sceneMode: body.sceneMode,
        geometryWidth: body.geometryWidth,
        geometryHeight: body.geometryHeight,
        spawnX: body.spawnX,
        spawnY: body.spawnY,
      };
      const result = await builderService.createScene(projectId, createPayload, actionUpdatedBy);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderScenes,
        await renderSceneWorkspace(locale, projectId, "", 1, result.payload.id),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        displayTitle: t.Optional(t.String()),
        titleKey: t.Optional(t.String()),
        background: t.String(),
        sceneMode: t.Optional(t.String()),
        geometryWidth: t.Optional(t.String()),
        geometryHeight: t.Optional(t.String()),
        spawnX: t.Optional(t.String()),
        spawnY: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiScenes),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const scenePayload: BuilderScenePayload = {
        id: body.scene.id,
        scene: body.scene,
        checksum: body.checksum,
      };

      const result = await builderService.saveScene(projectId, scenePayload, actionUpdatedBy);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(result.result),
          payload: toBuilderScene(result.payload),
          checksum: result.checksum,
          detailHtml: renderSceneDetail(getMessages(locale), result.payload, locale, projectId),
        }),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        scene: t.Object({
          id: t.String(),
          displayTitle: t.String(),
          titleKey: t.String(),
          background: t.String(),
          sceneMode: t.Optional(t.Union([t.Literal("2d"), t.Literal("3d")])),
          geometry: t.Object({ width: t.Number(), height: t.Number() }),
          spawn: t.Object({ x: t.Number(), y: t.Number() }),
          npcs: t.Array(
            t.Object({
              characterKey: t.String(),
              displayName: t.String(),
              x: t.Number(),
              y: t.Number(),
              labelKey: t.String(),
              dialogueKeys: t.Array(t.String()),
              interactRadius: t.Number(),
              ai: t.Object({
                wanderRadius: t.Number(),
                wanderSpeed: t.Number(),
                idlePauseMs: t.Tuple([t.Number(), t.Number()]),
                greetOnApproach: t.Boolean(),
                greetLineKey: t.String(),
              }),
            }),
          ),
          collisions: t.Array(
            t.Object({
              x: t.Number(),
              y: t.Number(),
              width: t.Number(),
              height: t.Number(),
            }),
          ),
          nodes: t.Optional(t.Array(t.Union([builderSceneNode2dSchema, builderSceneNode3dSchema]))),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.unprocessableEntity]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiSceneDetail),
    async ({ params, query, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const [scene, assets] = await Promise.all([
        builderService.getScene(projectId, params.sceneId),
        builderService.listAssets(projectId),
      ]);
      const messages = getMessages(locale);
      if (!scene) {
        return renderErrorHtml(messages.builder.sceneNotFound);
      }

      return renderSceneDetail(messages, scene, locale, projectId, assets);
    },
    {
      params: t.Object({ projectId: t.String(), sceneId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
    },
  )
  .post(
    route(appRoutes.builderApiSceneForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const payload: BuilderSceneFormPayload = {
        sceneId: params.sceneId,
        displayTitle: body.displayTitle,
        titleKey: body.titleKey,
        background: body.background,
        sceneMode: body.sceneMode,
        geometryWidth: body.geometryWidth,
        geometryHeight: body.geometryHeight,
        spawnX: body.spawnX,
        spawnY: body.spawnY,
        tilemap: body.tilemap,
      };
      const result = await builderService.saveSceneForm(projectId, payload, actionUpdatedBy);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      const assets = await builderService.listAssets(projectId);
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderScenes,
        renderSceneDetail(getMessages(locale), result.payload, locale, projectId, assets),
      );
    },
    {
      params: t.Object({ projectId: t.String(), sceneId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        displayTitle: t.Optional(t.String()),
        titleKey: t.Optional(t.String()),
        background: t.Optional(t.String()),
        sceneMode: t.Optional(t.String()),
        geometryWidth: t.Optional(t.String()),
        geometryHeight: t.Optional(t.String()),
        spawnX: t.Optional(t.String()),
        spawnY: t.Optional(t.String()),
        tilemap: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .put(
    "/:projectId/scenes/:sceneId",
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const payload: BuilderScenePayload = {
        id: params.sceneId,
        scene: { ...body.scene, id: params.sceneId },
        checksum: body.checksum,
      };

      const result = await builderService.saveScene(projectId, payload, actionUpdatedBy);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(result.result),
          payload: toBuilderScene(result.payload),
          checksum: result.checksum,
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String(), sceneId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        scene: t.Object({
          displayTitle: t.String(),
          titleKey: t.String(),
          background: t.String(),
          sceneMode: t.Optional(t.Union([t.Literal("2d"), t.Literal("3d")])),
          geometry: t.Object({ width: t.Number(), height: t.Number() }),
          spawn: t.Object({ x: t.Number(), y: t.Number() }),
          npcs: t.Array(
            t.Object({
              characterKey: t.String(),
              displayName: t.String(),
              x: t.Number(),
              y: t.Number(),
              labelKey: t.String(),
              dialogueKeys: t.Array(t.String()),
              interactRadius: t.Number(),
              ai: t.Object({
                wanderRadius: t.Number(),
                wanderSpeed: t.Number(),
                idlePauseMs: t.Tuple([t.Number(), t.Number()]),
                greetOnApproach: t.Boolean(),
                greetLineKey: t.String(),
              }),
            }),
          ),
          collisions: t.Array(
            t.Object({
              x: t.Number(),
              y: t.Number(),
              width: t.Number(),
              height: t.Number(),
            }),
          ),
          nodes: t.Optional(t.Array(t.Union([builderSceneNode2dSchema, builderSceneNode3dSchema]))),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiSceneDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.removeScene(projectId, params.sceneId, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }
      if (wantsHtml(request.headers.get("accept"))) {
        return withProjectChromeRefresh(
          locale,
          projectId,
          appRoutes.builderScenes,
          await renderSceneWorkspace(locale, projectId),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: mutation.payload,
          checksum: mutation.checksum,
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String(), sceneId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.unprocessableEntity]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiSceneNodes),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.saveSceneNode(
        projectId,
        {
          sceneId: params.sceneId,
          id: body.id,
          nodeKind: body.nodeKind,
          nodeType: body.nodeType,
          assetId: body.assetId,
          animationClipId: body.animationClipId,
          layer: body.layer,
          positionX: body.positionX,
          positionY: body.positionY,
          positionZ: body.positionZ,
          rotationX: body.rotationX,
          rotationY: body.rotationY,
          rotationZ: body.rotationZ,
          scaleX: body.scaleX,
          scaleY: body.scaleY,
          scaleZ: body.scaleZ,
          sizeWidth: body.sizeWidth,
          sizeHeight: body.sizeHeight,
        } satisfies BuilderSceneNodePayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderScenes,
        renderSceneDetail(getMessages(locale), mutation.payload, locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), sceneId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.String(),
        nodeKind: t.Optional(t.String()),
        nodeType: t.Optional(t.String()),
        assetId: t.Optional(t.String()),
        animationClipId: t.Optional(t.String()),
        layer: t.Optional(t.String()),
        positionX: t.Optional(t.String()),
        positionY: t.Optional(t.String()),
        positionZ: t.Optional(t.String()),
        rotationX: t.Optional(t.String()),
        rotationY: t.Optional(t.String()),
        rotationZ: t.Optional(t.String()),
        scaleX: t.Optional(t.String()),
        scaleY: t.Optional(t.String()),
        scaleZ: t.Optional(t.String()),
        sizeWidth: t.Optional(t.String()),
        sizeHeight: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiSceneNodeDelete),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.removeSceneNode(
        projectId,
        params.sceneId,
        params.nodeId,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderScenes,
        renderSceneDetail(getMessages(locale), mutation.payload, locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
        sceneId: t.String(),
        nodeId: t.String(),
      }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiNpcsCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const identity = deriveNpcIdentity({
        characterKey: body.characterKey,
        displayName: body.displayName,
        labelKey: body.labelKey,
      });
      if (identity.characterKey.length === 0 || identity.labelKey.length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(locale).npcNameRequired,
          ),
        );
      }
      const mutation = await builderService.saveNpc(
        projectId,
        {
          sceneId: body.sceneId,
          npc: {
            characterKey: identity.characterKey,
            displayName: body.displayName?.trim() || identity.labelKey,
            x: DEFAULT_NPC_SPAWN_X,
            y: DEFAULT_NPC_SPAWN_Y,
            labelKey: identity.labelKey,
            dialogueKeys: [],
            interactRadius: DEFAULT_NPC_INTERACT_RADIUS,
            ai: {
              wanderRadius: DEFAULT_NPC_WANDER_RADIUS,
              wanderSpeed: DEFAULT_NPC_WANDER_SPEED,
              idlePauseMs: [...DEFAULT_NPC_IDLE_PAUSE_MS],
              greetOnApproach: false,
              greetLineKey: identity.greetLineKey,
            },
          },
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderNpcs,
        await renderNpcWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        sceneId: t.String(),
        characterKey: t.Optional(t.String()),
        displayName: t.Optional(t.String()),
        labelKey: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiNpcs),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const payload: BuilderNpcPayload = {
        sceneId: body.sceneId,
        npc: body.npc,
      };

      const mutation = await builderService.saveNpc(projectId, payload, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, undefined, "sceneNotFound"),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: mutation.payload === null ? null : toBuilderNpc(mutation.payload),
          checksum: mutation.checksum,
        }),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        sceneId: t.String(),
        npc: t.Object({
          characterKey: t.String(),
          displayName: t.String(),
          x: t.Number(),
          y: t.Number(),
          labelKey: t.String(),
          dialogueKeys: t.Array(t.String()),
          interactRadius: t.Number(),
          ai: t.Object({
            wanderRadius: t.Number(),
            wanderSpeed: t.Number(),
            idlePauseMs: t.Tuple([t.Number(), t.Number()]),
            greetOnApproach: t.Boolean(),
            greetLineKey: t.String(),
          }),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiNpcDetail),
    async ({ params, query, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const npc = await builderService.findNpc(projectId, params.npcId);
      const messages = getMessages(locale);
      if (!npc) {
        return renderErrorHtml(messages.builder.npcNotFound);
      }

      const sceneIdFromQuery = query.sceneId?.trim();
      let ownerSceneId = sceneIdFromQuery && sceneIdFromQuery.length > 0 ? sceneIdFromQuery : null;
      if (!ownerSceneId) {
        const scenes = await builderService.listScenes(projectId);
        ownerSceneId =
          scenes.find((scene) =>
            scene.npcs.some((candidate) => candidate.characterKey === params.npcId),
          )?.id ?? null;
      }
      if (!ownerSceneId) {
        return renderErrorHtml(messages.builder.npcNotFound);
      }

      return renderNpcDetail(
        messages,
        npc,
        locale,
        projectId,
        ownerSceneId,
        gameSpriteManifests[npc.characterKey] ?? null,
      );
    },
    {
      params: t.Object({ projectId: t.String(), npcId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
      }),
    },
  )
  .post(
    route(appRoutes.builderApiNpcForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const sceneId = body.sceneId?.trim() ?? "";
      if (sceneId.length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            getBuilderMessages(locale).sceneIdRequired,
          ),
        );
      }

      const scene = await builderService.getScene(projectId, sceneId);
      if (!scene) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      const currentNpc = scene.npcs.find((candidate) => candidate.characterKey === params.npcId);
      if (!currentNpc) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      const mutation = await builderService.saveNpcForm(
        projectId,
        {
          sceneId,
          npcId: params.npcId,
          displayName: body.displayName,
          labelKey: body.labelKey,
          x: body.x,
          y: body.y,
          interactRadius: body.interactRadius,
          dialogueKeys: body.dialogueKeys,
          wanderRadius: body.wanderRadius,
          wanderSpeed: body.wanderSpeed,
          idlePauseMinMs: body.idlePauseMinMs,
          idlePauseMaxMs: body.idlePauseMaxMs,
          greetOnApproach: body.greetOnApproach,
          greetLineKey: body.greetLineKey,
        } satisfies BuilderNpcFormPayload,
        actionUpdatedBy,
      );
      if (!mutation || !mutation.payload) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderNpcs,
        renderNpcDetail(
          getMessages(locale),
          mutation.payload,
          locale,
          projectId,
          sceneId,
          gameSpriteManifests[mutation.payload.characterKey] ?? null,
        ),
      );
    },
    {
      params: t.Object({ projectId: t.String(), npcId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        displayName: t.Optional(t.String()),
        labelKey: t.Optional(t.String()),
        x: t.Optional(t.String()),
        y: t.Optional(t.String()),
        interactRadius: t.Optional(t.String()),
        wanderRadius: t.Optional(t.String()),
        wanderSpeed: t.Optional(t.String()),
        idlePauseMinMs: t.Optional(t.String()),
        idlePauseMaxMs: t.Optional(t.String()),
        greetOnApproach: t.Optional(t.String()),
        greetLineKey: t.Optional(t.String()),
        dialogueKeys: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .put(
    "/:projectId/npcs/:npcId",
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.saveNpc(
        projectId,
        {
          sceneId: body.sceneId,
          npc: {
            ...body.npc,
            characterKey: params.npcId,
          },
        },
        actionUpdatedBy,
      );

      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: mutation.payload === null ? null : toBuilderNpc(mutation.payload),
          checksum: mutation.checksum,
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String(), npcId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        sceneId: t.String(),
        npc: t.Object({
          characterKey: t.Optional(t.String()),
          displayName: t.String(),
          x: t.Number(),
          y: t.Number(),
          labelKey: t.String(),
          dialogueKeys: t.Array(t.String()),
          interactRadius: t.Number(),
          ai: t.Object({
            wanderRadius: t.Number(),
            wanderSpeed: t.Number(),
            idlePauseMs: t.Tuple([t.Number(), t.Number()]),
            greetOnApproach: t.Boolean(),
            greetLineKey: t.String(),
          }),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiNpcDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const scenes = await builderService.listScenes(projectId);
      const owner = scenes.find((scene) =>
        scene.npcs.some((candidate) => candidate.characterKey === params.npcId),
      );
      if (!owner) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      const mutation = await builderService.removeNpc(
        projectId,
        owner.id,
        params.npcId,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }
      if (wantsHtml(request.headers.get("accept"))) {
        return withProjectChromeRefresh(
          locale,
          projectId,
          appRoutes.builderNpcs,
          await renderNpcWorkspace(locale, projectId),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: mutation.payload.map(toBuilderNpc),
          checksum: mutation.checksum,
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String(), npcId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/dialogue/create/form",
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const key = deriveDialogueIdentity({
        key: body.key,
        speakerId: body.speakerId,
        lineReference: body.lineReference,
        text: body.text,
      }).key;
      const mutation = await builderService.saveDialogue(
        projectId,
        {
          key,
          text: body.text.trim(),
          locale,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderDialogue,
        await renderDialogueWorkspace(locale, projectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        key: t.Optional(t.String()),
        speakerId: t.Optional(t.String()),
        lineReference: t.Optional(t.String()),
        text: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiDialogueCreateForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const key = deriveDialogueIdentity({
        key: body.key,
        speakerId: body.speakerId,
        lineReference: body.lineReference,
        text: body.text,
      }).key;
      const mutation = await builderService.saveDialogue(
        projectId,
        {
          key,
          text: body.text.trim(),
          locale,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderDialogue,
        await renderDialogueWorkspace(locale, projectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        key: t.Optional(t.String()),
        speakerId: t.Optional(t.String()),
        lineReference: t.Optional(t.String()),
        text: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/dialogue",
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const payload: BuilderDialoguePayload = {
        key: body.key,
        text: body.text,
        locale: normalizeLocale(body.locale),
        checksum: body.checksum,
      };

      const mutation = await builderService.saveDialogue(projectId, payload, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: { key: payload.key, text: catalog[payload.key] ?? body.text },
          checksum: mutation.checksum,
          detailHtml: renderDialogueDetail(
            messages,
            payload.key,
            catalog[payload.key] ?? body.text,
            locale,
            projectId,
          ),
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.String(),
        locale: t.Optional(t.String()),
        key: t.String(),
        text: t.String(),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiDialogue),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const payload: BuilderDialoguePayload = {
        key: body.key,
        text: body.text,
        locale: normalizeLocale(body.locale),
        checksum: body.checksum,
      };

      const mutation = await builderService.saveDialogue(projectId, payload, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: { key: payload.key, text: catalog[payload.key] ?? body.text },
          checksum: mutation.checksum,
          detailHtml: renderDialogueDetail(
            messages,
            payload.key,
            catalog[payload.key] ?? body.text,
            locale,
            projectId,
          ),
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        key: t.String(),
        text: t.String(),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiDialogueEntry),
    async ({ params, query, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      const key = decodePathValue(params.key);
      const value = catalog[key];
      if (typeof value !== "string") {
        return renderErrorHtml(`${messages.builder.noDialogues}: ${escapeHtml(key)}`);
      }

      return renderDialogueDetail(messages, key, value, locale, projectId);
    },
    {
      params: t.Object({
        projectId: t.String(),
        key: t.String(),
      }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
    },
  )
  .post(
    route(appRoutes.builderApiDialogueEntryForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const key = decodePathValue(params.key);
      const mutation = await builderService.saveDialogue(
        projectId,
        {
          key,
          text: body.text ?? "",
          locale,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const catalog = await projectDialogues(projectId, locale);
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderDialogue,
        renderDialogueDetail(
          getMessages(locale),
          key,
          catalog[key] ?? body.text ?? "",
          locale,
          projectId,
        ),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
        key: t.String(),
      }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        text: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .put(
    "/:projectId/dialogue/:key",
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const key = decodePathValue(params.key);
      const mutation = await builderService.saveDialogue(
        projectId,
        {
          key,
          text: body.text,
          locale,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(mutation.result),
          payload: { key, text: catalog[key] ?? body.text },
          checksum: mutation.checksum,
          detailHtml: renderDialogueDetail(
            messages,
            key,
            catalog[key] ?? body.text,
            locale,
            projectId,
          ),
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String(), key: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        text: t.String(),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiDialogueEntry),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const key = decodePathValue(params.key);
      const removed = await builderService.removeDialogue(projectId, locale, key, actionUpdatedBy);
      if (!removed) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "dialogueNotFound"),
        );
      }
      if (wantsHtml(request.headers.get("accept"))) {
        return withProjectChromeRefresh(
          locale,
          projectId,
          appRoutes.builderDialogue,
          await renderDialogueWorkspace(locale, projectId),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          result: toBuilderMutationResult(removed.result),
          payload: removed.payload,
          checksum: removed.checksum,
        }),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
        key: t.String(),
      }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/assets/upload",
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const bytes = await body.file.arrayBuffer();
      const stored = await persistBuilderFile(
        projectId,
        "assets",
        (body.id ?? "").trim() ||
          body.file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, "-") ||
          "asset",
        bytes,
        body.file.name,
        body.file.type,
      );
      const createPayload: BuilderAssetCreatePayload = {
        id: body.id,
        label: body.label,
        kind: body.kind,
        sceneMode: body.sceneMode,
        source: stored.publicUrl,
        sourceName: body.file.name,
        sourceMimeType: body.file.type || undefined,
      };
      const mutation = await builderService.createAsset(projectId, createPayload, actionUpdatedBy);

      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      if (wantsHtml(request.headers.get("accept"))) {
        return withProjectChromeRefresh(
          locale,
          projectId,
          appRoutes.builderAssets,
          await renderAssetsWorkspace(locale, projectId, "", 1, mutation.payload.id),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          id: mutation.payload.id,
          source: stored.publicUrl,
          byteLength: stored.byteLength,
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        label: t.Optional(t.String()),
        kind: t.Optional(
          t.Union([
            t.Literal("background"),
            t.Literal("sprite-sheet"),
            t.Literal("audio"),
            t.Literal("model"),
            t.Literal("portrait"),
            t.Literal("tiles"),
            t.Literal("tile-set"),
            t.Literal("material"),
          ]),
        ),
        sceneMode: t.Optional(t.Union([t.Literal("2d"), t.Literal("3d")])),
        file: t.File(),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiAssetsUpload),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const bytes = await body.file.arrayBuffer();
      const stored = await persistBuilderFile(
        projectId,
        "assets",
        (body.id ?? "").trim() ||
          body.file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, "-") ||
          "asset",
        bytes,
        body.file.name,
        body.file.type,
      );
      const createPayload: BuilderAssetCreatePayload = {
        id: body.id,
        label: body.label,
        kind: body.kind,
        sceneMode: body.sceneMode,
        source: stored.publicUrl,
        sourceName: body.file.name,
        sourceMimeType: body.file.type || undefined,
      };
      const mutation = await builderService.createAsset(projectId, createPayload, actionUpdatedBy);

      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      if (wantsHtml(request.headers.get("accept"))) {
        return withProjectChromeRefresh(
          locale,
          projectId,
          appRoutes.builderAssets,
          await renderAssetsWorkspace(locale, projectId, "", 1, mutation.payload.id),
        );
      }

      return status(
        httpStatus.ok,
        successEnvelope({
          id: mutation.payload.id,
          source: stored.publicUrl,
          byteLength: stored.byteLength,
        }),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        label: t.Optional(t.String()),
        kind: t.Optional(
          t.Union([
            t.Literal("background"),
            t.Literal("sprite-sheet"),
            t.Literal("audio"),
            t.Literal("model"),
            t.Literal("portrait"),
            t.Literal("tiles"),
            t.Literal("tile-set"),
            t.Literal("material"),
          ]),
        ),
        sceneMode: t.Optional(t.Union([t.Literal("2d"), t.Literal("3d")])),
        file: t.File(),
      }),
      response: {
        [httpStatus.ok]: t.Union([builderOkResponse, t.String()]),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/assets/create/form",
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const assetIdentity = deriveAssetIdentity({
        id: body.id,
        label: body.label,
        source: body.source,
      });
      const createPayload: BuilderAssetCreatePayload = {
        id: assetIdentity.id,
        label: body.label,
        kind: body.kind,
        sceneMode: body.sceneMode,
        source: body.source,
      };
      const mutation = await builderService.createAsset(projectId, createPayload, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId, "", 1, mutation.payload.id),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        label: t.String(),
        kind: t.Union([
          t.Literal("background"),
          t.Literal("sprite-sheet"),
          t.Literal("audio"),
          t.Literal("model"),
          t.Literal("portrait"),
          t.Literal("tiles"),
          t.Literal("tile-set"),
          t.Literal("material"),
        ]),
        sceneMode: t.Union([t.Literal("2d"), t.Literal("3d")]),
        source: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiAssetsCreateForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const assetIdentity = deriveAssetIdentity({
        id: body.id,
        label: body.label,
        source: body.source,
      });
      const createPayload: BuilderAssetCreatePayload = {
        id: assetIdentity.id,
        label: body.label,
        kind: body.kind,
        sceneMode: body.sceneMode,
        source: body.source,
      };
      const mutation = await builderService.createAsset(projectId, createPayload, actionUpdatedBy);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId, "", 1, mutation.payload.id),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        label: t.String(),
        kind: t.Union([
          t.Literal("background"),
          t.Literal("sprite-sheet"),
          t.Literal("audio"),
          t.Literal("model"),
          t.Literal("portrait"),
          t.Literal("tiles"),
          t.Literal("tile-set"),
          t.Literal("material"),
        ]),
        sceneMode: t.Union([t.Literal("2d"), t.Literal("3d")]),
        source: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/animation-clips/create/form",
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const createPayload: BuilderAnimationClipCreatePayload = {
        id: body.id,
        assetId: body.assetId,
        stateTag: body.stateTag,
        playbackFps: body.playbackFps,
        frameCount: body.frameCount,
      };
      const mutation = await builderService.createAnimationClip(
        projectId,
        createPayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        assetId: t.String(),
        stateTag: t.String(),
        frameCount: t.Optional(t.String()),
        playbackFps: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiAnimationClipsCreateForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const createPayload: BuilderAnimationClipCreatePayload = {
        id: body.id,
        assetId: body.assetId,
        stateTag: body.stateTag,
        playbackFps: body.playbackFps,
        frameCount: body.frameCount,
      };
      const mutation = await builderService.createAnimationClip(
        projectId,
        createPayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        assetId: t.String(),
        stateTag: t.String(),
        frameCount: t.Optional(t.String()),
        playbackFps: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiGenerationJobsCreateForm),
    async ({ body, request, set, status, builderLocale, builderProjectId, builderCurrentPath }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const correlationId = ensureCorrelationIdHeader(request, set.headers);
      if (!appConfig.ai.allowHighCostGeneration && highCostGenerationKinds.has(body.kind)) {
        await auditService.tryRecord({
          correlationId,
          action: "builder.generation-job.create",
          requestSource: "builder-api",
          policyDecision: "deny",
          result: "failure",
          actor: {
            type: actionContext.builderPrincipalType,
            id: actionContext.builderPrincipalUserId,
            organizationId: actionContext.builderPrincipalOrganizationId,
            roleKeys: actionContext.builderPrincipalRoleKeys,
          },
          target: {
            type: "builder-project",
            id: projectId,
          },
          metadata: {
            reason: "high-cost-generation-disabled",
            kind: body.kind,
          },
        });
        return status(
          httpStatus.forbidden,
          buildError(
            request,
            set.headers,
            "UNAUTHORIZED",
            httpStatus.forbidden,
            "High-cost generation is currently disabled by policy.",
            false,
          ),
        );
      }
      const mutation = await builderService.createGenerationJob(
        projectId,
        {
          kind: body.kind,
          prompt: body.prompt,
          targetId: body.targetId,
        } satisfies BuilderGenerationJobCreatePayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        await auditService.tryRecord({
          correlationId,
          action: "builder.generation-job.create",
          requestSource: "builder-api",
          policyDecision: "allow",
          result: "failure",
          actor: {
            type: actionContext.builderPrincipalType,
            id: actionContext.builderPrincipalUserId,
            organizationId: actionContext.builderPrincipalOrganizationId,
            roleKeys: actionContext.builderPrincipalRoleKeys,
          },
          target: {
            type: "builder-project",
            id: projectId,
          },
          metadata: {
            kind: body.kind,
            reason: "project-not-found",
          },
        });
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      await builderService.processQueuedWork(projectId, actionUpdatedBy);
      await auditService.tryRecord({
        correlationId,
        action: "builder.generation-job.create",
        requestSource: "builder-api",
        policyDecision: "allow",
        result: "queued",
        actor: {
          type: actionContext.builderPrincipalType,
          id: actionContext.builderPrincipalUserId,
          organizationId: actionContext.builderPrincipalOrganizationId,
          roleKeys: actionContext.builderPrincipalRoleKeys,
        },
        target: {
          type: "builder-generation-job",
          id: mutation.payload.id,
        },
        metadata: {
          projectId,
          kind: body.kind,
        },
      });

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId),
      );
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        kind: t.Union([
          t.Literal("sprite-sheet"),
          t.Literal("portrait"),
          t.Literal("tiles"),
          t.Literal("voice-line"),
          t.Literal("animation-plan"),
          t.Literal("combat-encounter"),
          t.Literal("item-set"),
          t.Literal("cutscene-script"),
        ]),
        prompt: t.String(),
        targetId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiGenerationJobApprove),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const approved =
        typeof body.approved === "boolean" ? body.approved : body.approved === "true";
      const mutation = await builderService.approveGenerationJob(
        projectId,
        params.jobId,
        approved,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildError(
            request,
            set.headers,
            "NOT_FOUND",
            httpStatus.notFound,
            getMessages(locale).builder.projectNotFound,
          ),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAssets,
        await renderAssetsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
        jobId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        approved: t.Union([t.Boolean(), t.String()]),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiGenerationJobStream),
    async function* ({
      params,
      query,
      request,
      set,
      status,
      sse,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const job = (await builderService.listGenerationJobs(projectId)).find(
        (candidate) => candidate.id === params.jobId,
      );
      if (!job) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const artifacts = (await builderService.listArtifacts(projectId)).filter((artifact) =>
        job.artifactIds.includes(artifact.id),
      );
      const payload = JSON.stringify({
        ok: true,
        data: {
          job,
          artifacts,
        },
      });
      set.headers["cache-control"] = "no-cache, no-transform";
      set.headers.connection = "keep-alive";
      set.headers["content-type"] = "text/event-stream; charset=utf-8";
      yield sse.event("status", payload);
    },
    {
      params: t.Object({
        projectId: t.String(),
        jobId: t.String(),
      }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiQuestsCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.createQuest(
        projectId,
        {
          ...body,
          id: deriveQuestIdentity(body).id,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        title: t.String(),
        description: t.String(),
        triggerId: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiQuestDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const quests = await builderService.listQuests(projectId);
      const quest = quests.find((q) => q.id === decodePathValue(params.questId));
      if (!quest) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return renderQuestEditForm(getMessages(locale), locale, projectId, quest);
    },
    {
      params: t.Object({ projectId: t.String(), questId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiQuestForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const questId = decodePathValue(params.questId);
      const existing = (await builderService.listQuests(projectId)).find((q) => q.id === questId);
      if (!existing) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      const mutation = await builderService.saveQuestForm(
        projectId,
        {
          questId,
          title: body.title,
          description: body.description,
          triggerId: body.triggerId,
        } satisfies BuilderQuestFormPayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), questId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.String(),
        title: t.String(),
        description: t.String(),
        triggerId: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiQuestDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const questId = decodePathValue(params.questId);
      const removed = await builderService.removeQuest(projectId, questId, actionUpdatedBy);
      if (!removed) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), questId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiTriggersCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.createTrigger(
        projectId,
        {
          ...body,
          id: deriveTriggerIdentity(body).id,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        label: t.String(),
        event: t.Union([
          t.Literal("scene-enter"),
          t.Literal("npc-interact"),
          t.Literal("chat"),
          t.Literal("dialogue-confirmed"),
          t.Literal("combat-victory"),
          t.Literal("item-acquired"),
        ]),
        sceneId: t.Optional(t.String()),
        npcId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiTriggerDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const triggers = await builderService.listTriggers(projectId);
      const trigger = triggers.find((tr) => tr.id === decodePathValue(params.triggerId));
      if (!trigger) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return renderTriggerEditForm(getMessages(locale), locale, projectId, trigger);
    },
    {
      params: t.Object({ projectId: t.String(), triggerId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiTriggerForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const triggerId = decodePathValue(params.triggerId);
      const existing = (await builderService.listTriggers(projectId)).find(
        (tr) => tr.id === triggerId,
      );
      if (!existing) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      const mutation = await builderService.saveTrigger(
        projectId,
        {
          id: triggerId,
          trigger: {
            ...existing,
            label: body.label,
            event: body.event,
            sceneId: body.sceneId,
            npcId: body.npcId,
          },
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), triggerId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.String(),
        label: t.String(),
        event: t.Union([
          t.Literal("scene-enter"),
          t.Literal("npc-interact"),
          t.Literal("chat"),
          t.Literal("dialogue-confirmed"),
          t.Literal("combat-victory"),
          t.Literal("item-acquired"),
        ]),
        sceneId: t.Optional(t.String()),
        npcId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiTriggerDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const triggerId = decodePathValue(params.triggerId);
      const removed = await builderService.removeTrigger(projectId, triggerId, actionUpdatedBy);
      if (!removed) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), triggerId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiDialogueGraphsCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const mutation = await builderService.createDialogueGraph(
        projectId,
        {
          ...body,
          id: deriveDialogueGraphIdentity(body).id,
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.Optional(t.String()),
        title: t.String(),
        npcId: t.Optional(t.String()),
        line: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiDialogueGraphDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const graphs = await builderService.listDialogueGraphs(projectId);
      const graph = graphs.find((g) => g.id === decodePathValue(params.graphId));
      if (!graph) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return renderDialogueGraphEditForm(getMessages(locale), locale, projectId, graph);
    },
    {
      params: t.Object({ projectId: t.String(), graphId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiDialogueGraphForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const graphId = decodePathValue(params.graphId);
      const existing = (await builderService.listDialogueGraphs(projectId)).find(
        (g) => g.id === graphId,
      );
      if (!existing) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      const rootNodeId = existing.rootNodeId;
      const updatedNodes = existing.nodes.map((node) => {
        if (node.id === rootNodeId || node.id === "root") {
          return { ...node, line: body.line };
        }
        return node;
      });
      const mutation = await builderService.saveDialogueGraph(
        projectId,
        {
          id: graphId,
          graph: {
            ...existing,
            title: body.title,
            npcId: body.npcId,
            nodes: updatedNodes,
          },
        },
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), graphId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        id: t.String(),
        title: t.String(),
        npcId: t.Optional(t.String()),
        line: t.String(),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    route(appRoutes.builderApiDialogueGraphDetail),
    async ({
      params,
      query,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const graphId = decodePathValue(params.graphId);
      const removed = await builderService.removeDialogueGraph(projectId, graphId, actionUpdatedBy);
      if (!removed) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderMechanics,
        await renderMechanicsWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), graphId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiAutomationRunsCreateForm),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const correlationId = ensureCorrelationIdHeader(request, set.headers);
      if (
        !appConfig.controls.allowUnsafeAutomationActions &&
        hasUnsafeAutomationKinds(body.stepsJson)
      ) {
        await auditService.tryRecord({
          correlationId,
          action: "builder.automation-run.create",
          requestSource: "builder-api",
          policyDecision: "deny",
          result: "failure",
          actor: {
            type: actionContext.builderPrincipalType,
            id: actionContext.builderPrincipalUserId,
            organizationId: actionContext.builderPrincipalOrganizationId,
            roleKeys: actionContext.builderPrincipalRoleKeys,
          },
          target: {
            type: "builder-project",
            id: projectId,
          },
          metadata: {
            reason: "unsafe-automation-actions-disabled",
          },
        });
        return status(
          httpStatus.forbidden,
          buildError(
            request,
            set.headers,
            "UNAUTHORIZED",
            httpStatus.forbidden,
            "Unsafe automation actions are disabled by policy.",
            false,
          ),
        );
      }
      const mutation = await builderService.createAutomationRun(
        projectId,
        {
          goal: body.goal,
          stepsJson: body.stepsJson,
          dryRun: body.dryRun,
          maxRuntimeMs: body.maxRuntimeMs,
          maxSteps: body.maxSteps,
        } satisfies BuilderAutomationRunCreatePayload,
        actionUpdatedBy,
      );
      if (!mutation) {
        await auditService.tryRecord({
          correlationId,
          action: "builder.automation-run.create",
          requestSource: "builder-api",
          policyDecision: "allow",
          result: "failure",
          actor: {
            type: actionContext.builderPrincipalType,
            id: actionContext.builderPrincipalUserId,
            organizationId: actionContext.builderPrincipalOrganizationId,
            roleKeys: actionContext.builderPrincipalRoleKeys,
          },
          target: {
            type: "builder-project",
            id: projectId,
          },
          metadata: {
            reason: "project-not-found",
          },
        });
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }
      await auditService.tryRecord({
        correlationId,
        action: "builder.automation-run.create",
        requestSource: "builder-api",
        policyDecision: "allow",
        result: "queued",
        actor: {
          type: actionContext.builderPrincipalType,
          id: actionContext.builderPrincipalUserId,
          organizationId: actionContext.builderPrincipalOrganizationId,
          roleKeys: actionContext.builderPrincipalRoleKeys,
        },
        target: {
          type: "builder-automation-run",
          id: mutation.payload.id,
        },
        metadata: {
          projectId,
          dryRun: mutation.payload.dryRun ?? false,
          stepCount: mutation.payload.steps.length,
        },
      });

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAutomation,
        await renderAutomationWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({
        projectId: t.String(),
      }),
      body: t.Object({
        locale: t.Optional(t.String()),
        goal: t.String(),
        stepsJson: t.Optional(t.String()),
        dryRun: t.Optional(t.Boolean()),
        maxRuntimeMs: t.Optional(t.Number()),
        maxSteps: t.Optional(t.Number()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
        [httpStatus.forbidden]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiAutomationRunApprove),
    async ({
      params,
      body,
      request,
      set,
      status,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) => {
      const actionContext = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body, params },
      );
      const { builderLocale: locale, builderProjectId: projectId } = actionContext;
      const actionUpdatedBy = resolveBuilderUpdatedByFromContext(actionContext);
      const approved =
        typeof body.approved === "boolean" ? body.approved : body.approved === "true";
      const mutation = await builderService.approveAutomationRun(
        projectId,
        params.runId,
        approved,
        actionUpdatedBy,
      );
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildError(
            request,
            set.headers,
            "NOT_FOUND",
            httpStatus.notFound,
            getMessages(locale).builder.projectNotFound,
          ),
        );
      }

      return withProjectChromeRefresh(
        locale,
        projectId,
        appRoutes.builderAutomation,
        await renderAutomationWorkspace(locale, projectId),
      );
    },
    {
      params: t.Object({ projectId: t.String(), runId: t.String() }),
      body: t.Object({
        locale: t.Optional(t.String()),
        approved: t.Union([t.Boolean(), t.String()]),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    route(appRoutes.builderApiAutomationRunStream),
    async function* ({
      params,
      query,
      request,
      set,
      status,
      sse,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
    }) {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { query, params },
      );
      const run = (await builderService.listAutomationRuns(projectId)).find(
        (candidate) => candidate.id === params.runId,
      );
      if (!run) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const artifacts = (await builderService.listArtifacts(projectId)).filter((artifact) =>
        run.artifactIds.includes(artifact.id),
      );
      const payload = JSON.stringify({
        ok: true,
        data: {
          run,
          artifacts,
        },
      });
      set.headers["cache-control"] = "no-cache, no-transform";
      set.headers.connection = "keep-alive";
      set.headers["content-type"] = "text/event-stream; charset=utf-8";
      yield sse.event("status", payload);
    },
    {
      params: t.Object({ projectId: t.String(), runId: t.String() }),
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.builderApiDialogueGenerate),
    async ({ body, builderLocale, builderProjectId, builderCurrentPath }) => {
      const { builderLocale: locale, builderProjectId: projectId } = readBuilderScopedContext(
        { builderLocale, builderProjectId, builderCurrentPath },
        { body },
      );
      const messages = getMessages(locale);
      const sceneId = body.sceneId ?? defaultGameConfig.defaultSceneId;
      const generated = await generateNpcDialogue(
        {
          npcId: body.npcId,
          sceneId,
          playerMessage: body.message,
        },
        locale,
      );
      if (!generated.ok) {
        return `<div role="alert" class="alert ${generated.retryable ? "alert-warning" : "alert-info"} alert-soft"><span>${escapeHtml(
          messages.ai.dialogueGenerationUnavailable,
        )}</span></div>`;
      }
      const lineKey = `${body.npcId}.generated.lastMessage`;
      return renderDialogueDetail(messages, lineKey, generated.text, locale, projectId);
    },
    {
      body: t.Object({
        npcId: t.String(),
        locale: t.Optional(t.String()),
        message: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
      }),
      response: { [httpStatus.ok]: t.String() },
    },
  )
  .get(
    route(appRoutes.builderApiStatus),
    async ({ request, set, status }) => {
      const features = await detectAvailableFeatures();
      const gameContract = getGameContractValues();

      return status(
        httpStatus.ok,
        successEnvelope({
          status: appConfig.game,
          features: {
            richDialogue: features.richDialogue,
            visionAnalysis: features.visionAnalysis,
            sentimentAnalysis: features.sentimentAnalysis,
            embeddings: features.embeddings,
            speechToText: features.speechToText,
            speechSynthesis: features.speechSynthesis,
            localInference: features.localInference,
            providers: [...features.providers],
          },
          engine: gameContract.engine,
          correlationId: ensureCorrelationIdHeader(request, set.headers),
        }),
      );
    },
    {
      params: t.Object({ projectId: t.String() }),
      response: {
        [httpStatus.ok]: builderOkResponse,
      },
    },
  );

export type App = typeof builderApiRoutes;

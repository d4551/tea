import type {
  AnimationClip,
  AnimationTimeline,
  AutomationRun,
  BuilderAsset,
  DialogueGraph,
  GameFlagDefinition,
  GenerationJob,
  QuestDefinition,
  SceneDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import type { AvailableAiFeatures } from "../game/ai/game-ai-service.ts";

/**
 * Stable builder capability identifiers rendered in both HTML and JSON surfaces.
 */
export type BuilderCapabilityKey =
  | "releaseFlow"
  | "runtime2d"
  | "runtime3d"
  | "spritePipeline"
  | "animationPipeline"
  | "mechanics"
  | "aiAuthoring"
  | "automation"
  | "webgpuRenderer"
  | "aiOnnxGpu";

/**
 * User-facing readiness states for builder platform capabilities.
 */
export type BuilderCapabilityStatus = "implemented" | "partial" | "missing";

/**
 * Normalized readiness row for one product capability.
 */
export interface BuilderCapabilityReadiness {
  /** Stable capability identifier. */
  readonly key: BuilderCapabilityKey;
  /** Current implementation state. */
  readonly status: BuilderCapabilityStatus;
  /** Whether the required authored content exists in the project. */
  readonly inventoryPresent: boolean;
  /** Whether the capability has been validated through a real workflow path. */
  readonly workflowVerified: boolean;
}

/**
 * Aggregate readiness summary exposed to the builder UI and APIs.
 */
export interface BuilderPlatformReadiness {
  /** Number of authored baseline scenes available to the runtime. */
  readonly sceneCount: number;
  /** Number of runtime sprite manifests mounted into the client. */
  readonly spriteManifestCount: number;
  /** Number of currently available AI providers. */
  readonly aiProviderCount: number;
  /** Count of capabilities marked implemented. */
  readonly implementedCount: number;
  /** Count of capabilities marked partial. */
  readonly partialCount: number;
  /** Count of capabilities marked missing. */
  readonly missingCount: number;
  /** Ordered readiness rows for the current platform. */
  readonly capabilities: readonly BuilderCapabilityReadiness[];
}

/**
 * Input signals used to evaluate current platform readiness.
 */
export interface BuilderPlatformReadinessInput {
  /** Number of builder scenes. */
  readonly sceneCount: number;
  /** Number of mounted sprite manifests. */
  readonly spriteManifestCount: number;
  /** AI feature availability snapshot. */
  readonly aiFeatures: AvailableAiFeatures;
  /** Active renderer backend preference. */
  readonly rendererPreference: "webgpu" | "webgl";
  /** Active ONNX execution device. */
  readonly onnxDevice: "wasm" | "webgpu" | "cpu";
  /** Optional project-scoped audit signals. */
  readonly audit?: Partial<BuilderReadinessAuditSignals>;
}

/**
 * Project-derived signals that refine the coarse capability audit.
 */
export interface BuilderReadinessAuditSignals {
  /** Total authored asset count. */
  readonly assetCount: number;
  /** Number of authored sprite-sheet assets. */
  readonly spriteAssetCount: number;
  /** Number of authored tiles or tile-set assets. */
  readonly tileAssetCount: number;
  /** Number of authored 2D scenes. */
  readonly scenes2dCount: number;
  /** Number of authored 3D scenes. */
  readonly scenes3dCount: number;
  /** Number of authored model assets. */
  readonly modelAssetCount: number;
  /** Number of OpenUSD-backed assets. */
  readonly openUsdAssetCount: number;
  /** Number of authored animation clips. */
  readonly animationClipCount: number;
  /** Number of authored animation timelines. */
  readonly animationTimelineCount: number;
  /** Number of mechanics definitions across quests, triggers, dialogue graphs, and flags. */
  readonly mechanicCount: number;
  /** Number of queued generation jobs. */
  readonly generationJobCount: number;
  /** Number of automation runs. */
  readonly automationRunCount: number;
  /** Number of automation steps across all runs. */
  readonly automationStepCount: number;
  /** Latest immutable release version known for the project. */
  readonly latestReleaseVersion: number;
  /** Currently published immutable release version, if any. */
  readonly publishedReleaseVersion: number | null;
}

const sumCollectionLength = <T extends { readonly length: number }>(values: readonly T[]): number =>
  values.reduce((total, value) => total + value.length, 0);

/**
 * Derives project-scoped readiness signals from the canonical builder snapshot collections.
 *
 * @param input Project collections and release metadata.
 * @returns Normalized audit signals for capability evaluation and UI rendering.
 */
export const deriveBuilderReadinessAudit = (input: {
  readonly scenes: Iterable<SceneDefinition>;
  readonly assets: Iterable<BuilderAsset>;
  readonly animationClips: Iterable<AnimationClip>;
  readonly animationTimelines: Iterable<AnimationTimeline>;
  readonly dialogueGraphs: Iterable<DialogueGraph>;
  readonly quests: Iterable<QuestDefinition>;
  readonly triggers: Iterable<TriggerDefinition>;
  readonly flags: Iterable<GameFlagDefinition>;
  readonly generationJobs: Iterable<GenerationJob>;
  readonly automationRuns: Iterable<AutomationRun>;
  readonly latestReleaseVersion: number;
  readonly publishedReleaseVersion: number | null;
}): BuilderReadinessAuditSignals => {
  const scenes = Array.from(input.scenes);
  const assets = Array.from(input.assets);
  const automationRuns = Array.from(input.automationRuns);

  return {
    assetCount: assets.length,
    spriteAssetCount: assets.filter((asset) => asset.kind === "sprite-sheet").length,
    tileAssetCount: assets.filter((asset) => asset.kind === "tiles" || asset.kind === "tile-set")
      .length,
    scenes2dCount: scenes.filter((scene) => scene.sceneMode !== "3d").length,
    scenes3dCount: scenes.filter((scene) => scene.sceneMode === "3d").length,
    modelAssetCount: assets.filter((asset) => asset.kind === "model").length,
    openUsdAssetCount: assets.filter((asset) => asset.sourceFormat.startsWith("usd")).length,
    animationClipCount: Array.from(input.animationClips).length,
    animationTimelineCount: Array.from(input.animationTimelines).length,
    mechanicCount:
      Array.from(input.dialogueGraphs).length +
      Array.from(input.quests).length +
      Array.from(input.triggers).length +
      Array.from(input.flags).length,
    generationJobCount: Array.from(input.generationJobs).length,
    automationRunCount: automationRuns.length,
    automationStepCount: sumCollectionLength(automationRuns.map((run) => run.steps)),
    latestReleaseVersion: input.latestReleaseVersion,
    publishedReleaseVersion: input.publishedReleaseVersion,
  };
};

const countByStatus = (
  capabilities: readonly BuilderCapabilityReadiness[],
  status: BuilderCapabilityStatus,
): number => capabilities.filter((capability) => capability.status === status).length;

const toCapabilityStatus = (
  surfacePresent: boolean,
  workflowVerified: boolean,
): BuilderCapabilityStatus => {
  if (workflowVerified) {
    return "implemented";
  }

  return surfacePresent ? "partial" : "missing";
};

/**
 * Evaluates the current builder/platform capability surface.
 *
 * This intentionally reports the current product state conservatively:
 * the app can publish and validate a narrow browser runtime, but it does
 * not yet expose a full asset-generation, animation-authoring, mechanics,
 * or automation platform.
 *
 * @param input Runtime and builder signals available in-process.
 * @returns Stable readiness summary for HTML and JSON surfaces.
 */
export const evaluateBuilderPlatformReadiness = (
  input: BuilderPlatformReadinessInput,
): BuilderPlatformReadiness => {
  const aiProviderCount = input.aiFeatures.providers.length;
  const audit: BuilderReadinessAuditSignals = {
    assetCount: input.audit?.assetCount ?? 0,
    spriteAssetCount: input.audit?.spriteAssetCount ?? 0,
    tileAssetCount: input.audit?.tileAssetCount ?? 0,
    scenes2dCount: input.audit?.scenes2dCount ?? 0,
    scenes3dCount: input.audit?.scenes3dCount ?? 0,
    modelAssetCount: input.audit?.modelAssetCount ?? 0,
    openUsdAssetCount: input.audit?.openUsdAssetCount ?? 0,
    animationClipCount: input.audit?.animationClipCount ?? 0,
    animationTimelineCount: input.audit?.animationTimelineCount ?? 0,
    mechanicCount: input.audit?.mechanicCount ?? 0,
    generationJobCount: input.audit?.generationJobCount ?? 0,
    automationRunCount: input.audit?.automationRunCount ?? 0,
    automationStepCount: input.audit?.automationStepCount ?? 0,
    latestReleaseVersion: input.audit?.latestReleaseVersion ?? 0,
    publishedReleaseVersion: input.audit?.publishedReleaseVersion ?? null,
  };
  const hasBaselineRuntime = audit.scenes2dCount > 0;
  const hasAiAuthoringAssist =
    input.aiFeatures.richDialogue ||
    input.aiFeatures.visionAnalysis ||
    input.aiFeatures.speechToText ||
    input.aiFeatures.speechSynthesis;
  const has3dRuntimeSurface =
    audit.scenes3dCount > 0 || audit.modelAssetCount > 0 || audit.openUsdAssetCount > 0;
  const hasSpritePipelineSurface =
    input.spriteManifestCount > 0 || audit.spriteAssetCount > 0 || audit.tileAssetCount > 0;
  const hasAnimationSurface = audit.animationClipCount > 0 || audit.animationTimelineCount > 0;
  const hasMechanicsSurface = audit.mechanicCount > 0;
  const hasAutomationSurface = audit.automationRunCount > 0 || audit.automationStepCount > 0;
  const hasReleaseWorkflow =
    audit.latestReleaseVersion > 0 || audit.publishedReleaseVersion !== null;

  const capabilities: readonly BuilderCapabilityReadiness[] = [
    {
      key: "releaseFlow",
      status: toCapabilityStatus(hasReleaseWorkflow, true),
      inventoryPresent: hasReleaseWorkflow,
      workflowVerified: true,
    },
    {
      key: "runtime2d",
      status: toCapabilityStatus(hasBaselineRuntime, false),
      inventoryPresent: audit.scenes2dCount > 0,
      workflowVerified: false,
    },
    {
      key: "runtime3d",
      status: toCapabilityStatus(has3dRuntimeSurface, false),
      inventoryPresent: audit.scenes3dCount > 0 || audit.modelAssetCount > 0,
      workflowVerified: false,
    },
    {
      key: "spritePipeline",
      status: toCapabilityStatus(hasSpritePipelineSurface, false),
      inventoryPresent:
        input.spriteManifestCount > 0 || audit.spriteAssetCount > 0 || audit.tileAssetCount > 0,
      workflowVerified: false,
    },
    {
      key: "animationPipeline",
      status: toCapabilityStatus(hasAnimationSurface, false),
      inventoryPresent: audit.animationClipCount > 0 || audit.animationTimelineCount > 0,
      workflowVerified: false,
    },
    {
      key: "mechanics",
      status: toCapabilityStatus(hasMechanicsSurface, false),
      inventoryPresent: audit.mechanicCount > 0,
      workflowVerified: false,
    },
    {
      key: "aiAuthoring",
      status: toCapabilityStatus(hasAiAuthoringAssist, false),
      inventoryPresent: aiProviderCount > 0,
      workflowVerified: false,
    },
    {
      key: "automation",
      status: toCapabilityStatus(hasAutomationSurface, false),
      inventoryPresent: audit.automationRunCount > 0,
      workflowVerified: false,
    },
    {
      key: "webgpuRenderer",
      status: toCapabilityStatus(input.rendererPreference === "webgpu", false),
      inventoryPresent: input.rendererPreference === "webgpu",
      workflowVerified: false,
    },
    {
      key: "aiOnnxGpu",
      status: toCapabilityStatus(input.onnxDevice === "webgpu", false),
      inventoryPresent: input.onnxDevice === "webgpu",
      workflowVerified: false,
    },
  ];

  return {
    sceneCount: input.sceneCount,
    spriteManifestCount: input.spriteManifestCount,
    aiProviderCount,
    implementedCount: countByStatus(capabilities, "implemented"),
    partialCount: countByStatus(capabilities, "partial"),
    missingCount: countByStatus(capabilities, "missing"),
    capabilities,
  };
};

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
}

const countByStatus = (
  capabilities: readonly BuilderCapabilityReadiness[],
  status: BuilderCapabilityStatus,
): number => capabilities.filter((capability) => capability.status === status).length;

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
  const hasBaselineRuntime = input.sceneCount > 0 && input.spriteManifestCount > 0;
  const hasInteractiveSimulation = input.sceneCount > 0;
  const hasAiAuthoringAssist =
    input.aiFeatures.richDialogue ||
    input.aiFeatures.visionAnalysis ||
    input.aiFeatures.speechToText ||
    input.aiFeatures.speechSynthesis;

  const capabilities: readonly BuilderCapabilityReadiness[] = [
    {
      key: "releaseFlow",
      status: hasBaselineRuntime ? "implemented" : "partial",
    },
    {
      key: "runtime2d",
      status: hasBaselineRuntime ? "partial" : "missing",
    },
    {
      key: "runtime3d",
      status: "missing",
    },
    {
      key: "spritePipeline",
      status: input.spriteManifestCount > 0 ? "partial" : "missing",
    },
    {
      key: "animationPipeline",
      status: input.spriteManifestCount > 0 ? "partial" : "missing",
    },
    {
      key: "mechanics",
      status: hasInteractiveSimulation ? "partial" : "missing",
    },
    {
      key: "aiAuthoring",
      status: hasAiAuthoringAssist ? "partial" : "missing",
    },
    {
      key: "automation",
      status: hasInteractiveSimulation ? "partial" : "missing",
    },
    {
      key: "webgpuRenderer",
      status: input.rendererPreference === "webgpu" ? "partial" : "missing",
    },
    {
      key: "aiOnnxGpu",
      status: input.onnxDevice === "webgpu" ? "partial" : "missing",
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

import type {
  CapabilityState,
  CreatorCapabilities,
  CreatorCapability,
  FeatureCapability,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import type {
  BuilderCapabilityKey,
  BuilderPlatformReadiness,
} from "../builder/platform-readiness.ts";
import type { AiSystemStatus } from "./providers/provider-registry.ts";
import type { AiCapability, AiModelCapabilities } from "./providers/provider-types.ts";

type CapabilityKey = keyof FeatureCapability;

const unavailableState = (reasonCode: string): CapabilityState => ({
  status: "unavailable",
  mode: "none",
  reasonCode,
});

const degradedState = (
  mode: CapabilityState["mode"],
  reasonCode: string,
): CapabilityState => ({
  status: "degraded",
  mode,
  reasonCode,
});

const readyState = (mode: CapabilityState["mode"]): CapabilityState => ({
  status: "ready",
  mode,
});

const findCapabilityEntries = (
  status: AiSystemStatus,
  capability: AiCapability,
): readonly AiModelCapabilities[] =>
  status.capabilities.filter((entry) => entry.capabilities.has(capability));

const hasReadyEntry = (
  entries: readonly AiModelCapabilities[],
  readinessByProvider: ReadonlyMap<string, AiSystemStatus["providers"][number]["readiness"]>,
): boolean => entries.some((entry) => readinessByProvider.get(entry.provider) === "ready");

const hasDegradedEntry = (
  entries: readonly AiModelCapabilities[],
  readinessByProvider: ReadonlyMap<string, AiSystemStatus["providers"][number]["readiness"]>,
): boolean => entries.some((entry) => readinessByProvider.get(entry.provider) === "degraded");

const toProviderCapabilityState = (
  status: AiSystemStatus,
  capability: AiCapability,
): CapabilityState => {
  const entries = findCapabilityEntries(status, capability);
  const readinessByProvider = new Map(
    status.providers.map((provider) => [provider.name, provider.readiness] as const),
  );

  if (hasReadyEntry(entries, readinessByProvider)) {
    return readyState("provider");
  }
  if (hasDegradedEntry(entries, readinessByProvider)) {
    return degradedState("provider", "provider-degraded");
  }
  return unavailableState("provider-missing");
};

const toStreamingCapabilityState = (status: AiSystemStatus): CapabilityState => {
  const streamingEntries = status.capabilities.filter(
    (entry) => entry.capabilities.has("chat") && entry.supportsStreaming,
  );
  const readinessByProvider = new Map(
    status.providers.map((provider) => [provider.name, provider.readiness] as const),
  );

  if (hasReadyEntry(streamingEntries, readinessByProvider)) {
    return readyState("provider");
  }
  if (hasDegradedEntry(streamingEntries, readinessByProvider)) {
    return degradedState("provider", "provider-degraded");
  }

  const chatEntries = findCapabilityEntries(status, "chat");
  if (chatEntries.length > 0) {
    return unavailableState("streaming-unsupported");
  }
  return unavailableState("provider-missing");
};

const hasSurface = (
  readiness: BuilderPlatformReadiness,
  capabilityKey: BuilderCapabilityKey,
): boolean =>
  readiness.capabilities.some(
    (capability) => capability.key === capabilityKey && capability.status !== "missing",
  );

const combineSurfaceAndProviderState = (
  providerState: CapabilityState,
  surfacePresent: boolean,
): CapabilityState => {
  if (providerState.status === "ready" && surfacePresent) {
    return readyState("provider");
  }
  if (providerState.status === "degraded" && surfacePresent) {
    return providerState;
  }
  if (providerState.status === "ready" && !surfacePresent) {
    return degradedState("provider", "surface-missing");
  }
  if (providerState.status === "degraded" && !surfacePresent) {
    return degradedState("provider", "surface-missing");
  }
  if (surfacePresent) {
    return degradedState("surface", "provider-missing");
  }
  return unavailableState("surface-missing");
};

const toSpeechCapabilityState = (
  speechToText: CapabilityState,
  speechSynthesis: CapabilityState,
): CapabilityState => {
  if (speechToText.status === "ready" && speechSynthesis.status === "ready") {
    return readyState("provider");
  }
  if (speechToText.status === "unavailable" && speechSynthesis.status === "unavailable") {
    return unavailableState("provider-missing");
  }

  const mode =
    speechToText.status !== "unavailable" || speechSynthesis.status !== "unavailable"
      ? "provider"
      : "none";
  return degradedState(mode, "partial-speech-support");
};

/**
 * Derives the public builder/API feature capability matrix from provider discovery.
 *
 * @param status Registry status snapshot.
 * @returns Truthful feature capability state.
 */
export const deriveFeatureCapability = (status: AiSystemStatus): FeatureCapability => {
  const assist = toProviderCapabilityState(status, "chat");
  const toolLikeSuggestions = toProviderCapabilityState(status, "structured-planning");

  return {
    assist,
    test: assist,
    toolLikeSuggestions,
    streaming: toStreamingCapabilityState(status),
    offlineFallback: unavailableState("fallback-disabled"),
  };
};

const buildCreatorCapability = (
  key: CreatorCapability["key"],
  label: string,
  state: CapabilityState,
): CreatorCapability => ({
  key,
  label,
  status: state.status,
  mode: state.mode,
  reasonCode: state.reasonCode,
});

/**
 * Derives creator-facing capability rows from provider discovery plus explicit project surfaces.
 *
 * @param messages Locale-resolved labels.
 * @param status Registry status snapshot.
 * @param readiness Builder platform readiness summary.
 * @returns Creator-facing capability state.
 */
export const deriveCreatorCapabilities = (
  messages: Messages,
  status: AiSystemStatus,
  readiness: BuilderPlatformReadiness,
): CreatorCapabilities => {
  const featureCapabilities = deriveFeatureCapability(status);
  const dialogueGeneration = toProviderCapabilityState(status, "chat");
  const speechToText = toProviderCapabilityState(status, "speech-to-text");
  const speechSynthesis = toProviderCapabilityState(status, "text-to-speech");
  const imageGeneration = toProviderCapabilityState(status, "image-generation");
  const runtime3dReady = hasSurface(readiness, "runtime3d");
  const animationSurfaceReady = hasSurface(readiness, "animationPipeline");

  return {
    items: [
      buildCreatorCapability(
        "image-generation",
        messages.builder.creatorCapabilityImageGeneration,
        imageGeneration,
      ),
      buildCreatorCapability(
        "dialogue-generation",
        messages.builder.creatorCapabilityDialogueGeneration,
        dialogueGeneration,
      ),
      buildCreatorCapability(
        "speech",
        messages.builder.creatorCapabilitySpeech,
        toSpeechCapabilityState(speechToText, speechSynthesis),
      ),
      buildCreatorCapability(
        "automation-review",
        messages.builder.creatorCapabilityAutomationReview,
        featureCapabilities.toolLikeSuggestions,
      ),
      buildCreatorCapability(
        "import-3d",
        messages.builder.creatorCapability3dImport,
        runtime3dReady ? readyState("surface") : unavailableState("surface-missing"),
      ),
      buildCreatorCapability(
        "animation-assist",
        messages.builder.creatorCapabilityAnimationAssist,
        combineSurfaceAndProviderState(dialogueGeneration, animationSurfaceReady),
      ),
    ],
  };
};

/**
 * Counts the number of creator-facing capabilities that are currently ready.
 *
 * @param capabilities Creator capability snapshot.
 * @returns Number of ready capability rows.
 */
export const countReadyCreatorCapabilities = (capabilities: CreatorCapabilities): number =>
  capabilities.items.filter((capability) => capability.status === "ready").length;

/**
 * Counts the number of route-level feature capabilities that are currently ready.
 *
 * @param featureCapabilities Feature capability matrix.
 * @returns Number of ready features.
 */
export const countReadyFeatureCapabilities = (
  featureCapabilities: FeatureCapability,
): number =>
  (Object.keys(featureCapabilities) as CapabilityKey[]).filter(
    (key) => featureCapabilities[key].status === "ready",
  ).length;

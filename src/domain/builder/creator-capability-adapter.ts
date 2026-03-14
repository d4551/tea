import type {
  BuilderWorkflowStageStatus,
  CreatorCapabilities,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import type { AvailableAiFeatures } from "../game/ai/game-ai-service.ts";
import type { BuilderPlatformReadiness } from "./platform-readiness.ts";

/**
 * Maps platform readiness + feature flags into creator-safe capabilities.
 *
 * @param messages Locale-resolved strings.
 * @param features Runtime feature snapshot.
 * @param readiness Platform readiness summary.
 * @returns Creator-facing capability set.
 */
export const toCreatorCapabilities = (
  messages: Messages,
  features: AvailableAiFeatures,
  readiness: BuilderPlatformReadiness,
): CreatorCapabilities => {
  const capabilityState = new Map(readiness.capabilities.map((entry) => [entry.key, entry.status]));
  const statusLabel = (available: boolean): string =>
    available ? messages.ai.statusAvailable : messages.ai.statusUnavailable;

  return {
    items: [
      {
        key: "image-generation",
        label: messages.builder.creatorCapabilityImageGeneration,
        statusLabel: statusLabel((capabilityState.get("aiAuthoring") ?? "missing") !== "missing"),
        available: (capabilityState.get("aiAuthoring") ?? "missing") !== "missing",
      },
      {
        key: "dialogue-generation",
        label: messages.builder.creatorCapabilityDialogueGeneration,
        statusLabel: statusLabel(features.richDialogue),
        available: features.richDialogue,
      },
      {
        key: "speech",
        label: messages.builder.creatorCapabilitySpeech,
        statusLabel: statusLabel(features.speechSynthesis || features.speechToText),
        available: features.speechSynthesis || features.speechToText,
      },
      {
        key: "automation-review",
        label: messages.builder.creatorCapabilityAutomationReview,
        statusLabel: statusLabel((capabilityState.get("automation") ?? "missing") !== "missing"),
        available: (capabilityState.get("automation") ?? "missing") !== "missing",
      },
      {
        key: "import-3d",
        label: messages.builder.creatorCapability3dImport,
        statusLabel: statusLabel((capabilityState.get("runtime3d") ?? "missing") !== "missing"),
        available: (capabilityState.get("runtime3d") ?? "missing") !== "missing",
      },
      {
        key: "animation-assist",
        label: messages.builder.creatorCapabilityAnimationAssist,
        statusLabel: statusLabel(
          (capabilityState.get("animationPipeline") ?? "missing") !== "missing",
        ),
        available: (capabilityState.get("animationPipeline") ?? "missing") !== "missing",
      },
    ],
  };
};

/**
 * Shared helper retained for legacy imports that use workflow status type directly.
 */
export const toWorkflowStageStatus = (count: number): BuilderWorkflowStageStatus =>
  count <= 0 ? "ready" : count >= 2 ? "complete" : "in-progress";

import type {
  BuilderWorkflowStageStatus,
  CreatorCapabilities,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { deriveCreatorCapabilities as deriveCapabilitySnapshotCreatorCapabilities } from "../ai/capability-snapshot.ts";
import type { AiSystemStatus } from "../ai/providers/provider-registry.ts";
import type { BuilderPlatformReadiness } from "./platform-readiness.ts";

/**
 * Maps provider discovery + project surfaces into creator-safe capabilities.
 *
 * @param messages Locale-resolved strings.
 * @param status Registry status snapshot.
 * @param readiness Platform readiness summary.
 * @returns Creator-facing capability set.
 */
export const toCreatorCapabilities = (
  messages: Messages,
  status: AiSystemStatus,
  readiness: BuilderPlatformReadiness,
): CreatorCapabilities => {
  return deriveCapabilitySnapshotCreatorCapabilities(messages, status, readiness);
};

/**
 * Derives workflow stage status from a count of authored entities.
 *
 * @param count Number of entities authored for this stage.
 * @returns Workflow stage status.
 */
export const toWorkflowStageStatus = (count: number): BuilderWorkflowStageStatus =>
  count <= 0 ? "ready" : count >= 2 ? "complete" : "in-progress";

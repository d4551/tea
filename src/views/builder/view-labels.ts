import type {
  AutomationRun,
  AutomationRunStep,
  BuilderAsset,
  BuilderAssetKind,
  GenerationArtifact,
  GenerationJob,
  SceneNodeDefinition,
  TriggerEventType,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";

/**
 * Resolves a localized node type label for builder scene editing surfaces.
 *
 * @param messages Locale-resolved messages.
 * @param nodeType Scene node type identifier.
 * @returns Human-readable localized label.
 */
export const getSceneNodeTypeLabel = (
  messages: Messages,
  nodeType: SceneNodeDefinition["nodeType"],
): string => {
  switch (nodeType) {
    case "sprite":
      return messages.builder.sceneNodeTypeSprite;
    case "tile":
      return messages.builder.sceneNodeTypeTile;
    case "spawn":
      return messages.builder.sceneNodeTypeSpawn;
    case "trigger":
      return messages.builder.sceneNodeTypeTrigger;
    case "camera":
      return messages.builder.sceneNodeTypeCamera;
    case "model":
      return messages.builder.sceneNodeTypeModel;
    case "light":
      return messages.builder.sceneNodeTypeLight;
  }
};

/**
 * Resolves a localized asset kind label for builder asset and artifact surfaces.
 *
 * @param messages Locale-resolved messages.
 * @param kind Asset kind identifier.
 * @returns Human-readable localized label.
 */
export const getAssetKindLabel = (messages: Messages, kind: BuilderAssetKind): string => {
  switch (kind) {
    case "portrait":
      return messages.builder.assetKindPortrait;
    case "sprite-sheet":
      return messages.builder.assetKindSpriteSheet;
    case "background":
      return messages.builder.assetKindBackground;
    case "model":
      return messages.builder.assetKindModel;
    case "audio":
      return messages.builder.assetKindAudio;
    case "tiles":
    case "tile-set":
      return messages.builder.generationKindTiles;
    case "material":
      return messages.builder.assetKindModel;
  }
};

/**
 * Resolves a localized generation job kind label.
 *
 * @param messages Locale-resolved messages.
 * @param kind Generation job kind identifier.
 * @returns Human-readable localized label.
 */
export const getGenerationJobKindLabel = (
  messages: Messages,
  kind: GenerationJob["kind"],
): string => {
  switch (kind) {
    case "portrait":
      return messages.builder.generationKindPortrait;
    case "sprite-sheet":
      return messages.builder.generationKindSpriteSheet;
    case "tiles":
      return messages.builder.generationKindTiles;
    case "voice-line":
      return messages.builder.generationKindVoiceLine;
    case "animation-plan":
      return messages.builder.generationKindAnimationPlan;
  }
};

/**
 * Resolves a localized scene mode label.
 *
 * @param messages Locale-resolved messages.
 * @param sceneMode Scene mode identifier.
 * @returns Human-readable localized label.
 */
export const getSceneModeLabel = (messages: Messages, sceneMode: "2d" | "3d"): string =>
  sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d;

/**
 * Resolves a localized trigger event label.
 *
 * @param messages Locale-resolved messages.
 * @param event Trigger event identifier.
 * @returns Human-readable localized label.
 */
export const getTriggerEventLabel = (messages: Messages, event: TriggerEventType): string => {
  switch (event) {
    case "scene-enter":
      return messages.builder.triggerEventSceneEnter;
    case "npc-interact":
      return messages.builder.triggerEventNpcInteract;
    case "chat":
      return messages.builder.triggerEventChat;
    case "dialogue-confirmed":
      return messages.builder.triggerEventDialogueConfirmed;
    case "combat-victory":
      return messages.builder.triggerEventCombatVictory;
    case "item-acquired":
      return messages.builder.triggerEventItemAcquired;
    default:
      return String(event);
  }
};

/**
 * Resolves a localized yes/no label for boolean controls.
 *
 * @param messages Locale-resolved messages.
 * @param value Boolean value to present.
 * @returns Human-readable localized label.
 */
export const getBooleanLabel = (messages: Messages, value: boolean): string =>
  value ? messages.builder.yesLabel : messages.builder.noLabel;

/**
 * Resolves a localized long-running job status label.
 *
 * @param messages Locale-resolved messages.
 * @param status Shared generation or automation status.
 * @returns Human-readable localized label.
 */
export const getLongRunningStatusLabel = (
  messages: Messages,
  status: GenerationJob["status"] | AutomationRun["status"],
): string => {
  switch (status) {
    case "queued":
      return messages.builder.jobStatusQueued;
    case "running":
      return messages.builder.jobStatusRunning;
    case "blocked_for_approval":
      return messages.builder.jobStatusBlockedForApproval;
    case "succeeded":
      return messages.builder.jobStatusSucceeded;
    case "failed":
      return messages.builder.jobStatusFailed;
    case "canceled":
      return messages.builder.jobStatusCanceled;
  }
};

/**
 * Resolves a localized automation step action label.
 *
 * @param messages Locale-resolved messages.
 * @param action Automation step action identifier.
 * @returns Human-readable localized label.
 */
export const getAutomationStepActionLabel = (
  messages: Messages,
  action: AutomationRunStep["action"],
): string => {
  switch (action) {
    case "browser":
      return messages.builder.automationStepBrowser;
    case "http":
      return messages.builder.automationStepHttp;
    case "builder":
      return messages.builder.automationStepBuilder;
    case "attach-file":
      return messages.builder.automationStepAttachFile;
  }
};

/**
 * Resolves a localized automation step summary from a canonical workflow summary code.
 *
 * @param messages Locale-resolved messages.
 * @param summary Persisted workflow summary or summary code.
 * @returns Human-readable localized label.
 */
export const getAutomationStepSummaryLabel = (messages: Messages, summary: string): string => {
  switch (summary) {
    case "automation.step.browser.goto":
      return messages.builder.automationSummaryBrowserGoto;
    case "automation.step.browser.click":
      return messages.builder.automationSummaryBrowserClick;
    case "automation.step.browser.fill":
      return messages.builder.automationSummaryBrowserFill;
    case "automation.step.browser.assert-text":
      return messages.builder.automationSummaryBrowserAssertText;
    case "automation.step.browser.screenshot":
      return messages.builder.automationSummaryBrowserScreenshot;
    case "automation.step.http.request":
      return messages.builder.automationSummaryHttpRequest;
    case "automation.step.builder.create-scene":
      return messages.builder.automationSummaryBuilderCreateScene;
    case "automation.step.builder.create-trigger":
      return messages.builder.automationSummaryBuilderCreateTrigger;
    case "automation.step.builder.create-quest":
      return messages.builder.automationSummaryBuilderCreateQuest;
    case "automation.step.builder.create-dialogue-graph":
      return messages.builder.automationSummaryBuilderCreateDialogueGraph;
    case "automation.step.builder.create-asset":
      return messages.builder.automationSummaryBuilderCreateAsset;
    case "automation.step.builder.create-animation-clip":
      return messages.builder.automationSummaryBuilderCreateAnimationClip;
    case "automation.step.builder.queue-generation-job":
      return messages.builder.automationSummaryBuilderQueueGenerationJob;
    case "automation.step.attach-generated-artifact":
      return messages.builder.automationSummaryAttachGeneratedArtifact;
    default:
      return summary;
  }
};

/**
 * Resolves a localized artifact summary from a canonical generated summary code.
 *
 * @param messages Locale-resolved messages.
 * @param summary Persisted artifact summary or summary code.
 * @returns Human-readable localized label.
 */
export const getArtifactSummaryLabel = (messages: Messages, summary: string): string => {
  if (summary === "generation.artifact.summary.prompt") {
    return messages.builder.generatedArtifactSummaryFromPrompt;
  }

  const targetedPrefix = "generation.artifact.summary.target:";
  if (summary.startsWith(targetedPrefix)) {
    const targetId = summary.slice(targetedPrefix.length);
    return `${messages.builder.generatedArtifactSummaryTargetPrefix} ${targetId}`;
  }

  switch (summary) {
    case "automation.artifact.captured-review-evidence":
      return messages.builder.automationArtifactSummaryCapturedReviewEvidence;
    case "automation.artifact.captured-project-context":
      return messages.builder.automationArtifactSummaryCapturedProjectContext;
    case "automation.artifact.generated-tool-plan":
      return messages.builder.automationArtifactSummaryGeneratedToolPlan;
    case "automation.artifact.attached-execution-bundle":
      return messages.builder.automationArtifactSummaryAttachedExecutionBundle;
    default:
      return summary;
  }
};

/**
 * Resolves a localized artifact label from a canonical generated label code.
 *
 * @param messages Locale-resolved messages.
 * @param artifact Artifact metadata to present.
 * @returns Human-readable localized label.
 */
export const getArtifactLabel = (messages: Messages, artifact: GenerationArtifact): string => {
  if (artifact.label === "automation.artifact.label.evidence") {
    return messages.builder.automationEvidenceLabel;
  }
  if (artifact.label === "automation.artifact.label.context") {
    return messages.builder.automationContextLabel;
  }
  if (artifact.label === "automation.artifact.label.plan") {
    return messages.builder.automationPlanArtifactLabel;
  }
  if (artifact.label === "automation.artifact.label.bundle") {
    return messages.builder.automationBundleArtifactLabel;
  }

  const reviewPrefix = "generation.artifact.label.review:";
  if (artifact.label.startsWith(reviewPrefix)) {
    const kind = artifact.label.slice(reviewPrefix.length) as GenerationJob["kind"];
    return `${messages.builder.reviewLabelPrefix} ${getGenerationJobKindLabel(messages, kind)}`;
  }

  return artifact.label;
};

/**
 * Resolves a localized asset label from canonical generated asset label codes.
 *
 * @param messages Locale-resolved messages.
 * @param asset Asset metadata to present.
 * @returns Human-readable localized label.
 */
export const getAssetLabel = (messages: Messages, asset: BuilderAsset): string => {
  const generatedPrefix = "generation.asset.label.generated:";
  if (asset.label.startsWith(generatedPrefix)) {
    const [kind] = asset.label.slice(generatedPrefix.length).split(":", 1);
    return `${messages.builder.generatedLabelPrefix} ${getAssetKindLabel(
      messages,
      (kind ?? asset.kind) as BuilderAssetKind,
    )}`;
  }

  return asset.label;
};

/**
 * Resolves a localized automation run status note from a canonical workflow status code.
 *
 * @param messages Locale-resolved messages.
 * @param statusMessage Persisted workflow status note or code.
 * @returns Human-readable localized label.
 */
export const getAutomationStatusMessageLabel = (
  messages: Messages,
  statusMessage: string,
): string => {
  switch (statusMessage) {
    case "job.draft-ready-for-review":
    case "draft-ready-for-review":
      return messages.builder.generationStatusDraftReadyForReview;
    case "automation.queued-for-processing":
      return messages.builder.automationStatusQueuedForProcessing;
    case "automation.approved-for-apply":
      return messages.builder.automationStatusApprovedForApply;
    case "automation.canceled-by-review":
      return messages.builder.automationStatusCanceledByReview;
    case "automation.plan-ready-for-review":
    case "automation-plan-ready-for-review":
      return messages.builder.automationStatusPlanReadyForReview;
    case "automation-origin-unreachable":
      return messages.builder.automationStatusOriginUnavailable;
    case "automation.capturing-fallback-review-evidence":
    case "capturing-fallback-review-evidence":
      return messages.builder.automationStatusCapturingFallbackEvidence;
    case "processing":
      return messages.builder.longRunningStatusProcessing;
    default:
      return statusMessage;
  }
};

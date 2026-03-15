import type { LocaleCode } from "../../config/environment.ts";
import type { AiSystemStatus } from "../../domain/ai/providers/provider-registry.ts";
import {
  toCreatorCapabilities,
  toWorkflowStageStatus,
} from "../../domain/builder/creator-capability-adapter.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import type { AvailableAiFeatures } from "../../domain/game/ai/game-ai-service.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AnimationAuthoringContext,
  AutomationReviewContext,
  BuilderAssetKind,
  BuilderWorkflowStage,
  ContextualAiAction,
  CreatorAssistContext,
  CreatorCapabilities,
  RuntimeDiagnosticsContext,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";

// Contract types are now defined in shared/contracts/game.ts.

const withBuilderQuery = (path: string, locale: LocaleCode, projectId: string): string =>
  withQueryParameters(interpolateRoutePath(path, { projectId }), { lang: locale });

/**
 * Builds the shared creator workflow model for the builder landing page.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param counts Current authored content counts by stage.
 * @returns Ordered creator workflow stages.
 */
export const buildBuilderWorkflowStages = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  counts: {
    readonly scenes: number;
    readonly assets: number;
    readonly characters: number;
    readonly story: number;
    readonly systems: number;
    readonly playtest: number;
  },
): readonly BuilderWorkflowStage[] => {
  const worldHref = withBuilderQuery(appRoutes.builderScenes, locale, projectId);
  const characterHref = withBuilderQuery(appRoutes.builderNpcs, locale, projectId);
  const storyHref = withBuilderQuery(appRoutes.builderDialogue, locale, projectId);
  const systemsHref = withBuilderQuery(appRoutes.builderMechanics, locale, projectId);
  const assetsHref = withBuilderQuery(appRoutes.builderAssets, locale, projectId);
  const playtestHref = withBuilderQuery(appRoutes.game, locale, projectId);

  return [
    {
      id: "start",
      label: messages.builder.dashboard,
      description: messages.builder.workflowGuideDescription,
      status: toWorkflowStageStatus(
        counts.scenes + counts.assets + counts.characters + counts.story,
      ),
      completionLabel: messages.builder.creatorStageStartCompletion,
      completionRequirements: [messages.builder.creatorStageStartCompletion],
      nextAction: {
        label: messages.builder.creatorStageStartPrimary,
        href: worldHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageStartPrimary,
        href: worldHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageStartSecondary,
        href: assetsHref,
      },
    },
    {
      id: "world",
      label: messages.builder.scenes,
      description: messages.builder.workflowStartWithWorldDescription,
      status: toWorkflowStageStatus(counts.scenes),
      completionLabel: messages.builder.creatorStageWorldCompletion,
      completionRequirements: [messages.builder.creatorStageWorldCompletion],
      nextAction: {
        label: messages.builder.creatorStageWorldPrimary,
        href: worldHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageWorldPrimary,
        href: worldHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageWorldSecondary,
        href: assetsHref,
      },
    },
    {
      id: "visuals",
      label: messages.builder.assets,
      description: messages.builder.workflowPopulateWorldDescription,
      status: toWorkflowStageStatus(counts.assets),
      completionLabel: messages.builder.creatorStageAssetsCompletion,
      completionRequirements: [messages.builder.creatorStageAssetsCompletion],
      nextAction: {
        label: messages.builder.creatorStageAssetsPrimary,
        href: assetsHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageAssetsPrimary,
        href: assetsHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageAssetsSecondary,
        href: worldHref,
      },
    },
    {
      id: "characters",
      label: messages.builder.npcs,
      description: messages.builder.npcCreateDescription,
      status: toWorkflowStageStatus(counts.characters),
      completionLabel: messages.builder.creatorStageCharactersCompletion,
      completionRequirements: [messages.builder.creatorStageCharactersCompletion],
      nextAction: {
        label: messages.builder.creatorStageCharactersPrimary,
        href: characterHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageCharactersPrimary,
        href: characterHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageCharactersSecondary,
        href: storyHref,
      },
    },
    {
      id: "story",
      label: messages.builder.dialogue,
      description: messages.builder.dialogueCreateDescription,
      status: toWorkflowStageStatus(counts.story),
      completionLabel: messages.builder.creatorStageStoryCompletion,
      completionRequirements: [messages.builder.creatorStageStoryCompletion],
      nextAction: {
        label: messages.builder.creatorStageStoryPrimary,
        href: storyHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageStoryPrimary,
        href: storyHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageStorySecondary,
        href: characterHref,
      },
    },
    {
      id: "rules",
      label: messages.builder.mechanics,
      description: messages.builder.workflowWireProgressDescription,
      status: toWorkflowStageStatus(counts.systems),
      completionLabel: messages.builder.creatorStageSystemsCompletion,
      completionRequirements: [messages.builder.creatorStageSystemsCompletion],
      nextAction: {
        label: messages.builder.creatorStageSystemsPrimary,
        href: systemsHref,
      },
      primaryAction: {
        label: messages.builder.creatorStageSystemsPrimary,
        href: systemsHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStageSystemsSecondary,
        href: storyHref,
      },
    },
    {
      id: "playtest",
      label: messages.builder.playtest,
      description: messages.builder.workflowPlaytestDescription,
      status: toWorkflowStageStatus(counts.playtest),
      completionLabel: messages.builder.creatorStagePlaytestCompletion,
      completionRequirements: [messages.builder.creatorStagePlaytestCompletion],
      nextAction: {
        label: messages.builder.creatorStagePlaytestPrimary,
        href: playtestHref,
      },
      primaryAction: {
        label: messages.builder.creatorStagePlaytestPrimary,
        href: playtestHref,
      },
      secondaryAction: {
        label: messages.builder.creatorStagePlaytestSecondary,
        href: systemsHref,
      },
    },
  ];
};

/**
 * Derives creator-safe capabilities without leaking provider or model internals.
 *
 * @param messages Locale-resolved messages.
 * @param status Registry status snapshot.
 * @param readiness Platform readiness summary.
 * @returns Creator-safe capability state.
 */
export const deriveCreatorCapabilities = (
  messages: Messages,
  status: AiSystemStatus,
  readiness: BuilderPlatformReadiness,
): CreatorCapabilities => {
  return toCreatorCapabilities(messages, status, readiness);
};

/**
 * Builds entity-scoped AI actions for a selected creator context.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param input Selected entity context.
 * @returns Contextual creator assist model.
 */
export const buildCreatorAssistContext = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  input: {
    readonly entityType: CreatorAssistContext["entityType"];
    readonly entityId: string;
    readonly title: string;
    readonly targetId?: string;
    readonly assetKind?: BuilderAssetKind;
  },
): CreatorAssistContext => {
  const anchorHref = withBuilderQuery(
    input.entityType === "scene" ? appRoutes.builderScenes : appRoutes.builderAssets,
    locale,
    projectId,
  );
  const targetId = input.targetId ?? input.entityId;

  const actions: readonly ContextualAiAction[] =
    input.entityType === "scene"
      ? [
          {
            key: "generate-background",
            label: messages.builder.generateBackground,
            description: messages.builder.generateBackgroundDescription,
            href: `${anchorHref}#creator-ai-actions`,
            kind: "background",
          },
          {
            key: "generate-tileset",
            label: messages.builder.generateTileset,
            description: messages.builder.generateTilesetDescription,
            href: `${anchorHref}#creator-ai-actions`,
            kind: "tiles",
          },
        ]
      : input.entityType === "character"
        ? [
            {
              key: "generate-portrait",
              label: messages.builder.generatePortrait,
              description: messages.builder.generatePortraitDescription,
              href: `${anchorHref}#creator-ai-actions`,
              kind: "portrait",
            },
            {
              key: "generate-voice-line",
              label: messages.builder.generateVoiceLine,
              description: messages.builder.generateVoiceLineDescription,
              href: `${anchorHref}#creator-ai-actions`,
              kind: "voice-line",
            },
          ]
        : input.entityType === "animation"
          ? [
              {
                key: "generate-idle-animation",
                label: messages.builder.generateIdleAnimation,
                description: messages.builder.generateIdleAnimationDescription,
                href: `${anchorHref}#creator-ai-actions`,
                kind: "animation-plan",
              },
            ]
          : input.entityType === "asset"
            ? input.assetKind === "background"
              ? [
                  {
                    key: "generate-background",
                    label: messages.builder.generateBackground,
                    description: messages.builder.generateBackgroundDescription,
                    href: `${anchorHref}#creator-ai-actions`,
                    kind: "background",
                  },
                ]
              : input.assetKind === "sprite-sheet" ||
                  input.assetKind === "tiles" ||
                  input.assetKind === "tile-set"
                ? [
                    {
                      key: "generate-tileset",
                      label: messages.builder.generateTileset,
                      description: messages.builder.generateTilesetDescription,
                      href: `${anchorHref}#creator-ai-actions`,
                      kind: "tiles",
                    },
                    {
                      key: "generate-idle-animation",
                      label: messages.builder.generateIdleAnimation,
                      description: messages.builder.generateIdleAnimationDescription,
                      href: `${anchorHref}#creator-ai-actions`,
                      kind: "animation-plan",
                    },
                  ]
                : input.assetKind === "audio"
                  ? [
                      {
                        key: "generate-voice-line",
                        label: messages.builder.generateVoiceLine,
                        description: messages.builder.generateVoiceLineDescription,
                        href: `${anchorHref}#creator-ai-actions`,
                        kind: "voice-line",
                      },
                    ]
                  : [
                      {
                        key: "generate-idle-animation",
                        label: messages.builder.generateIdleAnimation,
                        description: messages.builder.generateIdleAnimationDescription,
                        href: `${anchorHref}#creator-ai-actions`,
                        kind: "animation-plan",
                      },
                    ]
            : [
                {
                  key: "generate-dialogue-pass",
                  label: messages.builder.generateDialogue,
                  description: messages.builder.generateInteractionDescription,
                  href: withBuilderQuery(appRoutes.builderDialogue, locale, projectId),
                  kind: "dialogue",
                },
              ];

  return {
    entityType: input.entityType,
    entityId: input.entityId,
    targetId,
    title: input.title,
    actions,
  };
};

/**
 * Builds a lightweight diagnostics summary reserved for the advanced AI/settings page.
 *
 * @param features Runtime feature snapshot.
 * @param readiness Platform readiness summary.
 * @returns Diagnostics summary.
 */
export const buildRuntimeDiagnosticsContext = (
  features: AvailableAiFeatures,
  readiness: BuilderPlatformReadiness,
): RuntimeDiagnosticsContext => ({
  aiAvailable: features.providers.length > 0,
  providerCount: features.providers.length,
  providerNames: [...features.providers],
  projectKnowledgeEnabled: features.embeddings,
  automationReviewEnabled:
    readiness.capabilities.find((entry) => entry.key === "automation")?.status !== "missing",
});

/**
 * Builds the advanced automation review summary.
 *
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param pendingRunCount Pending automation runs.
 * @param artifactCount Reviewable artifact count.
 * @returns Automation review summary.
 */
export const buildAutomationReviewContext = (
  locale: LocaleCode,
  projectId: string,
  pendingRunCount: number,
  artifactCount: number,
): AutomationReviewContext => ({
  pendingRunCount,
  artifactCount,
  href: withBuilderQuery(appRoutes.builderAutomation, locale, projectId),
});

/**
 * Builds animation authoring guidance for a selected asset.
 *
 * @param assetId Selected asset identifier.
 * @param sceneMode Selected asset scene mode.
 * @param messages Locale-resolved messages.
 * @returns Animation authoring context.
 */
export const buildAnimationAuthoringContext = (
  assetId: string,
  sceneMode: "2d" | "3d",
  messages: Messages,
): AnimationAuthoringContext => ({
  assetId,
  sceneMode,
  workflows:
    sceneMode === "3d"
      ? [
          {
            mode: "model-3d",
            actions: [
              messages.builder.animationActionBindCharacter,
              messages.builder.animationActionPreviewScene,
            ],
          },
        ]
      : [
          {
            mode: "sprite",
            actions: [
              messages.builder.animationActionIdleLoop,
              messages.builder.animationActionWalkCycle,
            ],
          },
          {
            mode: "timeline",
            actions: [messages.builder.animationActionPreviewScene],
          },
        ],
});

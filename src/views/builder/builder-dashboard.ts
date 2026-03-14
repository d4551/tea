import { appConfig, type LocaleCode } from "../../config/environment.ts";
import type {
  BuilderCapabilityKey,
  BuilderCapabilityReadiness,
  BuilderPlatformReadiness,
} from "../../domain/builder/platform-readiness.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

import { renderWorkspaceShell } from "./workspace-shell.ts";

/**
 * Summary metrics for the builder landing page.
 */
export interface DashboardStats {
  /** Number of active gameplay sessions observed by the builder. */
  readonly activeSessions: number;
  /** Total scenes in the current builder project. */
  readonly totalScenes: number;
  /** Number of scenes with sceneMode "2d". */
  readonly scenes2d: number;
  /** Number of scenes with sceneMode "3d". */
  readonly scenes3d: number;
  /** Total NPCs in the current builder project. */
  readonly totalNpcs: number;
  /** Total authored scene nodes. */
  readonly sceneNodeCount: number;
  /** Total authored collision masks. */
  readonly collisionMaskCount: number;
  /** Total authored assets. */
  readonly assetCount: number;
  /** Total authored sprite-facing assets. */
  readonly spriteAssetCount: number;
  /** Total authored model assets. */
  readonly modelAssetCount: number;
  /** Total authored OpenUSD assets. */
  readonly openUsdAssetCount: number;
  /** Total authored sprite atlases. */
  readonly spriteAtlasCount: number;
  /** Total animation clips. */
  readonly animationClipCount: number;
  /** Total animation timelines. */
  readonly animationTimelineCount: number;
  /** Total dialogue graphs. */
  readonly dialogueGraphCount: number;
  /** Total quests. */
  readonly questCount: number;
  /** Total triggers. */
  readonly triggerCount: number;
  /** Total flags. */
  readonly flagCount: number;
  /** Total generation jobs. */
  readonly generationJobCount: number;
  /** Total generated artifacts. */
  readonly artifactCount: number;
  /** Total automation runs. */
  readonly automationRunCount: number;
  /** Total automation steps. */
  readonly automationStepCount: number;
  /** Whether any AI provider is currently available. */
  readonly aiAvailable: boolean;
  /** Available provider names for the current runtime. */
  readonly providers: readonly string[];
  /** Number of available AI providers. */
  readonly aiProviderCount: number;
  /** Current mutable draft version. */
  readonly draftVersion: number;
  /** Latest immutable release version. */
  readonly latestReleaseVersion: number;
  /** Currently published immutable release version, if any. */
  readonly publishedReleaseVersion: number | null;
  /** Whether the project is currently published. */
  readonly published: boolean;
  /** Runtime renderer preference. */
  readonly rendererPreference: "webgpu" | "webgl";
  /** ONNX execution device preference. */
  readonly onnxDevice: "wasm" | "webgpu" | "cpu";
  /** Platform capability status summary. */
  readonly readiness: BuilderPlatformReadiness;
}

interface CapabilityMetric {
  readonly label: string;
  readonly value: string | number;
  readonly tone?: "default" | "primary" | "secondary" | "accent";
}

const capabilityTone = (status: BuilderCapabilityReadiness["status"]): string => {
  switch (status) {
    case "implemented":
      return "badge-success";
    case "partial":
      return "badge-warning";
    default:
      return "badge-error";
  }
};

const capabilityStatusLabel = (
  messages: Messages,
  status: BuilderCapabilityReadiness["status"],
): string => {
  switch (status) {
    case "implemented":
      return messages.builder.readinessImplemented;
    case "partial":
      return messages.builder.readinessPartial;
    default:
      return messages.builder.readinessMissing;
  }
};

const metricToneClass = (tone: CapabilityMetric["tone"]): string => {
  switch (tone) {
    case "primary":
      return "text-primary";
    case "secondary":
      return "text-secondary";
    case "accent":
      return "text-accent";
    default:
      return "text-base-content";
  }
};

const renderMetric = (metric: CapabilityMetric): string => `
  <div class="stat p-3">
    <div class="stat-title text-[0.7rem] font-semibold uppercase tracking-[0.22em]">${escapeHtml(metric.label)}</div>
    <div class="stat-value text-lg ${metricToneClass(metric.tone)}">${escapeHtml(String(metric.value))}</div>
  </div>`;

const capabilityHref = (
  capability: BuilderCapabilityKey,
  locale: LocaleCode,
  projectId: string,
): string => {
  switch (capability) {
    case "releaseFlow":
    case "webgpuRenderer":
      return withQueryParameters(appRoutes.builder, { lang: locale, projectId });
    case "runtime2d":
      return withQueryParameters(appRoutes.builderScenes, { lang: locale, projectId });
    case "runtime3d":
      return withQueryParameters(appRoutes.game, { lang: locale, projectId });
    case "spritePipeline":
    case "animationPipeline":
      return withQueryParameters(appRoutes.builderAssets, { lang: locale, projectId });
    case "mechanics":
      return withQueryParameters(appRoutes.builderMechanics, { lang: locale, projectId });
    case "aiAuthoring":
    case "aiOnnxGpu":
      return withQueryParameters(appRoutes.builderAi, { lang: locale, projectId });
    case "automation":
      return withQueryParameters(appRoutes.builderAutomation, { lang: locale, projectId });
  }
};

const capabilityCopy = (
  messages: Messages,
  capability: BuilderCapabilityKey,
): Readonly<{ title: string; description: string }> => {
  switch (capability) {
    case "releaseFlow":
      return {
        title: messages.builder.capabilityReleaseFlowTitle,
        description: messages.builder.capabilityReleaseFlowDescription,
      };
    case "runtime2d":
      return {
        title: messages.builder.capability2dRuntimeTitle,
        description: messages.builder.capability2dRuntimeDescription,
      };
    case "runtime3d":
      return {
        title: messages.builder.capability3dRuntimeTitle,
        description: messages.builder.capability3dRuntimeDescription,
      };
    case "spritePipeline":
      return {
        title: messages.builder.capabilitySpritePipelineTitle,
        description: messages.builder.capabilitySpritePipelineDescription,
      };
    case "animationPipeline":
      return {
        title: messages.builder.capabilityAnimationPipelineTitle,
        description: messages.builder.capabilityAnimationPipelineDescription,
      };
    case "mechanics":
      return {
        title: messages.builder.capabilityMechanicsTitle,
        description: messages.builder.capabilityMechanicsDescription,
      };
    case "aiAuthoring":
      return {
        title: messages.builder.capabilityAiAuthoringTitle,
        description: messages.builder.capabilityAiAuthoringDescription,
      };
    case "automation":
      return {
        title: messages.builder.capabilityAutomationTitle,
        description: messages.builder.capabilityAutomationDescription,
      };
    case "webgpuRenderer":
      return {
        title: messages.builder.capabilityWebgpuRendererTitle,
        description: messages.builder.capabilityWebgpuRendererDescription,
      };
    case "aiOnnxGpu":
      return {
        title: messages.builder.capabilityAiOnnxGpuTitle,
        description: messages.builder.capabilityAiOnnxGpuDescription,
      };
  }
};

const releaseValue = (value: number | null, fallback: string): string =>
  value === null ? fallback : String(value);

const capabilityMetrics = (
  messages: Messages,
  capability: BuilderCapabilityKey,
  stats: DashboardStats,
): readonly CapabilityMetric[] => {
  switch (capability) {
    case "releaseFlow":
      return [
        { label: messages.builder.draftVersionLabel, value: stats.draftVersion, tone: "primary" },
        {
          label: messages.builder.latestReleaseLabel,
          value: stats.latestReleaseVersion,
          tone: "secondary",
        },
        {
          label: messages.builder.publishedReleaseLabel,
          value: releaseValue(stats.publishedReleaseVersion, messages.builder.noPublishedRelease),
          tone: "accent",
        },
      ];
    case "runtime2d":
      return [
        { label: messages.builder.scenes, value: stats.scenes2d, tone: "primary" },
        { label: messages.builder.totalNpcs, value: stats.totalNpcs },
        { label: messages.builder.sceneNodeCountLabel, value: stats.sceneNodeCount },
        { label: messages.builder.collisionMaskCountLabel, value: stats.collisionMaskCount },
      ];
    case "runtime3d":
      return [
        { label: messages.builder.scenes, value: stats.scenes3d, tone: "secondary" },
        { label: messages.builder.modelAssetCountLabel, value: stats.modelAssetCount },
        { label: messages.builder.openUsdAssetCountLabel, value: stats.openUsdAssetCount },
      ];
    case "spritePipeline":
      return [
        { label: messages.builder.assets, value: stats.spriteAssetCount, tone: "primary" },
        { label: messages.builder.spriteManifestCountLabel, value: stats.spriteAtlasCount },
        { label: messages.builder.modelAssetCountLabel, value: stats.modelAssetCount },
      ];
    case "animationPipeline":
      return [
        { label: messages.builder.animations, value: stats.animationClipCount, tone: "primary" },
        {
          label: messages.builder.animationTimelineCountLabel,
          value: stats.animationTimelineCount,
        },
        { label: messages.builder.spriteManifestCountLabel, value: stats.spriteAtlasCount },
      ];
    case "mechanics":
      return [
        { label: messages.builder.dialogueGraphCountLabel, value: stats.dialogueGraphCount },
        { label: messages.builder.questCountLabel, value: stats.questCount, tone: "primary" },
        { label: messages.builder.triggerCountLabel, value: stats.triggerCount },
        { label: messages.builder.flagCountLabel, value: stats.flagCount },
      ];
    case "aiAuthoring":
      return [
        {
          label: messages.builder.providerCountLabel,
          value: stats.aiProviderCount,
          tone: "primary",
        },
        { label: messages.builder.generationJobCountLabel, value: stats.generationJobCount },
        { label: messages.builder.artifactCountLabel, value: stats.artifactCount },
      ];
    case "automation":
      return [
        { label: messages.builder.automationRunCountLabel, value: stats.automationRunCount },
        { label: messages.builder.automationStepCountLabel, value: stats.automationStepCount },
        { label: messages.builder.artifactCountLabel, value: stats.artifactCount, tone: "accent" },
      ];
    case "webgpuRenderer":
      return [
        {
          label: messages.builder.runtimeLabel,
          value: stats.rendererPreference.toUpperCase(),
          tone: "secondary",
        },
        { label: messages.builder.scenes, value: stats.totalScenes },
        { label: messages.builder.modelAssetCountLabel, value: stats.modelAssetCount },
      ];
    case "aiOnnxGpu":
      return [
        {
          label: messages.builder.modelLabel,
          value: stats.onnxDevice.toUpperCase(),
          tone: "secondary",
        },
        { label: messages.builder.providerCountLabel, value: stats.aiProviderCount },
        { label: messages.builder.generationJobCountLabel, value: stats.generationJobCount },
      ];
  }
};

const renderCapabilityCard = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  capability: BuilderCapabilityReadiness,
  stats: DashboardStats,
): string => {
  const copy = capabilityCopy(messages, capability.key);
  const metrics = capabilityMetrics(messages, capability.key, stats).map(renderMetric).join("");
  const href = capabilityHref(capability.key, locale, projectId);
  const statusLabel = capabilityStatusLabel(messages, capability.status);

  return `<article class="bg-base-200 card">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <h2 class="card-title text-xl">${escapeHtml(copy.title)}</h2>
          <p class="max-w-2xl text-sm leading-6 text-base-content/72">${escapeHtml(copy.description)}</p>
        </div>
        <span class="badge ${capabilityTone(capability.status)} badge-soft badge-lg" role="status" aria-label="${escapeHtml(statusLabel)}">${escapeHtml(statusLabel)}</span>
      </div>
      <dl class="stats stats-vertical sm:stats-horizontal bg-base-200/50 shadow-sm">${metrics}</dl>
      <div class="card-actions justify-end">
        <a class="btn btn-ghost btn-sm" href="${escapeHtml(href)}" aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(copy.title)}">${escapeHtml(messages.builder.openDetails)}</a>
      </div>
    </div>
  </article>`;
};

const findCapability = (
  readiness: BuilderPlatformReadiness,
  capability: BuilderCapabilityKey,
): BuilderCapabilityReadiness =>
  readiness.capabilities.find((entry) => entry.key === capability) ?? {
    key: capability,
    status: "missing",
  };

/**
 * Renders the builder dashboard landing view.
 *
 * @param messages Locale-resolved message catalog.
 * @param locale Active locale.
 * @param stats Current builder summary metrics.
 * @param projectId Current project identifier.
 * @param published Whether the project is currently published.
 * @returns HTML string for the dashboard surface.
 */
export const renderBuilderDashboard = (
  messages: Messages,
  locale: LocaleCode,
  stats: DashboardStats,
  projectId: string,
  published: boolean,
): string => {
  const builderHref = withQueryParameters(appRoutes.builderScenes, { lang: locale, projectId });
  const gameHref = withQueryParameters(appRoutes.game, { lang: locale, projectId });
  const docsHref = withLocaleQuery(appConfig.api.docsPath, locale);
  const providerSummary =
    stats.providers.length > 0 ? stats.providers.join(", ") : messages.ai.noProviderAvailable;
  const capabilityCards = (
    [
      "releaseFlow",
      "runtime2d",
      "runtime3d",
      "spritePipeline",
      "animationPipeline",
      "mechanics",
      "aiAuthoring",
      "automation",
      "webgpuRenderer",
      "aiOnnxGpu",
    ] as const satisfies readonly BuilderCapabilityKey[]
  ).map((key) =>
    renderCapabilityCard(messages, locale, projectId, findCapability(stats.readiness, key), stats),
  );

  return `
    <div class="grid gap-4">
      ${renderWorkspaceShell({
        eyebrow: published
          ? messages.builder.projectStatusPublished
          : messages.builder.projectStatusDraft,
        title: messages.builder.dashboard,
        description: messages.builder.platformReadinessDescription,
        facets: [
          {
            label: `${messages.builder.implementedCountLabel}: ${stats.readiness.implementedCount}`,
            badgeClassName: "badge-success badge-soft",
          },
          {
            label: `${messages.builder.partialCountLabel}: ${stats.readiness.partialCount}`,
            badgeClassName: "badge-warning badge-soft",
          },
          {
            label: `${messages.builder.missingCountLabel}: ${stats.readiness.missingCount}`,
            badgeClassName: "badge-error badge-soft",
          },
          {
            label: providerSummary,
            badgeClassName: stats.aiAvailable ? "badge-secondary badge-soft" : "badge-ghost",
          },
        ],
        metrics: [
          {
            label: messages.builder.scenes,
            value: stats.totalScenes,
            toneClassName: "text-primary",
          },
          {
            label: messages.builder.assets,
            value: stats.assetCount,
            toneClassName: "text-secondary",
          },
          {
            label: messages.builder.automation,
            value: stats.automationRunCount,
            toneClassName: "text-accent",
          },
          { label: messages.builder.activeSessions, value: stats.activeSessions },
        ],
        actions: `
          <a class="btn btn-primary btn-sm" href="${escapeHtml(published ? gameHref : builderHref)}" aria-label="${escapeHtml(published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring)}">
            ${escapeHtml(published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring)}
          </a>
          <a class="btn btn-ghost btn-sm" href="${escapeHtml(docsHref)}" aria-label="${escapeHtml(messages.builder.docsLabel)}">
            ${escapeHtml(messages.builder.docsLabel)}
          </a>
        `,
      })}

      <section class="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <article class="bg-base-200 card">
          <div class="card-body gap-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-2">
                <h2 class="card-title text-xl">${escapeHtml(messages.builder.flowTitle)}</h2>
                <p class="max-w-3xl text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.flowDescription)}</p>
              </div>
              <span class="badge ${published ? "badge-success" : "badge-warning"} badge-soft">${escapeHtml(published ? messages.builder.projectStatusPublished : messages.builder.projectStatusDraft)}</span>
            </div>
            <ul class="steps steps-vertical gap-3 lg:steps-horizontal lg:gap-0" aria-label="${escapeHtml(messages.builder.flowTitle)}">
              <li class="step step-primary">${escapeHtml(messages.builder.scenes)}</li>
              <li class="step step-secondary">${escapeHtml(messages.builder.assets)}</li>
              <li class="step step-accent">${escapeHtml(messages.builder.mechanics)}</li>
              <li class="step ${published ? "step-success" : ""}">${escapeHtml(messages.builder.playPublishedBuild)}</li>
            </ul>
            <dl class="grid gap-3 md:grid-cols-3">
              ${renderMetric({ label: messages.builder.draftVersionLabel, value: stats.draftVersion, tone: "primary" })}
              ${renderMetric({ label: messages.builder.latestReleaseLabel, value: stats.latestReleaseVersion, tone: "secondary" })}
              ${renderMetric({
                label: messages.builder.publishedReleaseLabel,
                value: releaseValue(
                  stats.publishedReleaseVersion,
                  messages.builder.noPublishedRelease,
                ),
                tone: "accent",
              })}
            </dl>
          </div>
        </article>

        <article class="bg-base-200 card">
          <div class="card-body gap-4">
            <div class="space-y-2">
              <h2 class="card-title text-xl">${escapeHtml(messages.builder.localRuntimeTitle)}</h2>
              <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.platformReadinessWarning)}</p>
            </div>
            <dl class="grid gap-3">
              ${renderMetric({ label: messages.builder.providerCountLabel, value: stats.aiProviderCount, tone: "primary" })}
              ${renderMetric({ label: messages.builder.runtimeLabel, value: stats.rendererPreference.toUpperCase(), tone: "secondary" })}
              ${renderMetric({ label: messages.builder.modelLabel, value: stats.onnxDevice.toUpperCase(), tone: "accent" })}
              ${renderMetric({ label: messages.builder.generationJobCountLabel, value: stats.generationJobCount })}
            </dl>
          </div>
        </article>
      </section>

      <section id="builder-platform-readiness" class="space-y-4" aria-labelledby="builder-platform-readiness-heading">
        <details class="group">
          <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden" aria-label="${escapeHtml(messages.builder.readinessSummaryExpand)}">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 id="builder-platform-readiness-heading" class="text-2xl font-semibold tracking-tight">${escapeHtml(messages.builder.platformReadinessTitle)}</h2>
              <span class="flex items-center gap-2">
                <span class="badge badge-ghost badge-sm">
                  ${stats.readiness.implementedCount} of ${stats.readiness.implementedCount + stats.readiness.partialCount + stats.readiness.missingCount} ready
                </span>
                <span class="text-base-content/50 -rotate-90 group-open:rotate-0 transition-transform inline-block" aria-hidden="true">▾</span>
              </span>
            </div>
          </summary>
          <div class="mt-4 space-y-4">
            <p class="max-w-4xl text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.platformReadinessDescription)}</p>
            <div class="grid gap-4 2xl:grid-cols-2">
              ${capabilityCards.join("")}
            </div>
          </div>
        </details>
      </section>
    </div>`;
};

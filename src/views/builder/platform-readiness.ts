import type { LocaleCode } from "../../config/environment.ts";
import type {
  BuilderCapabilityKey,
  BuilderCapabilityReadiness,
  BuilderCapabilityStatus,
  BuilderPlatformReadiness,
} from "../../domain/builder/platform-readiness.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { cardClasses } from "../shared/ui-components.ts";

/**
 * Rendering options for the platform readiness section.
 */
export interface RenderPlatformReadinessOptions {
  /** Localized messages for the current request. */
  readonly messages: Messages;
  /** Active locale. */
  readonly locale: LocaleCode;
  /** Active builder project identifier. */
  readonly projectId: string;
  /** Current platform readiness summary. */
  readonly readiness: BuilderPlatformReadiness;
  /** Optional subset of readiness cards to show. */
  readonly keys?: readonly BuilderCapabilityKey[];
}

const statusBadgeClass = (status: BuilderCapabilityStatus): string => {
  switch (status) {
    case "implemented":
      return "badge-success";
    case "partial":
      return "badge-warning";
    default:
      return "badge-error";
  }
};

const statusLabel = (messages: Messages, status: BuilderCapabilityStatus): string => {
  switch (status) {
    case "implemented":
      return messages.builder.readinessImplemented;
    case "partial":
      return messages.builder.readinessPartial;
    default:
      return messages.builder.readinessMissing;
  }
};

const capabilityCopy = (
  messages: Messages,
  key: BuilderCapabilityKey,
): Readonly<{ title: string; description: string; href: string }> => {
  switch (key) {
    case "releaseFlow":
      return {
        title: messages.builder.capabilityReleaseFlowTitle,
        description: messages.builder.capabilityReleaseFlowDescription,
        href: appRoutes.builder,
      };
    case "runtime2d":
      return {
        title: messages.builder.capability2dRuntimeTitle,
        description: messages.builder.capability2dRuntimeDescription,
        href: appRoutes.builderScenes,
      };
    case "runtime3d":
      return {
        title: messages.builder.capability3dRuntimeTitle,
        description: messages.builder.capability3dRuntimeDescription,
        href: appRoutes.game,
      };
    case "spritePipeline":
      return {
        title: messages.builder.capabilitySpritePipelineTitle,
        description: messages.builder.capabilitySpritePipelineDescription,
        href: appRoutes.builderAssets,
      };
    case "animationPipeline":
      return {
        title: messages.builder.capabilityAnimationPipelineTitle,
        description: messages.builder.capabilityAnimationPipelineDescription,
        href: appRoutes.builderAssets,
      };
    case "mechanics":
      return {
        title: messages.builder.capabilityMechanicsTitle,
        description: messages.builder.capabilityMechanicsDescription,
        href: appRoutes.builderMechanics,
      };
    case "aiAuthoring":
      return {
        title: messages.builder.capabilityAiAuthoringTitle,
        description: messages.builder.capabilityAiAuthoringDescription,
        href: appRoutes.builderAi,
      };
    case "automation":
      return {
        title: messages.builder.capabilityAutomationTitle,
        description: messages.builder.capabilityAutomationDescription,
        href: appRoutes.builderAutomation,
      };
    case "webgpuRenderer":
      return {
        title: messages.builder.capabilityWebgpuRendererTitle,
        description: messages.builder.capabilityWebgpuRendererDescription,
        href: appRoutes.builder,
      };
    case "aiOnnxGpu":
      return {
        title: messages.builder.capabilityAiOnnxGpuTitle,
        description: messages.builder.capabilityAiOnnxGpuDescription,
        href: appRoutes.builderAi,
      };
  }
};

const renderCapabilityCard = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  capability: BuilderCapabilityReadiness,
): string => {
  const copy = capabilityCopy(messages, capability.key);
  const href = withQueryParameters(copy.href, { lang: locale, projectId });
  const statusText = statusLabel(messages, capability.status);
  return `<article class="${cardClasses.bordered}" role="listitem" aria-label="${escapeHtml(copy.title)} — ${escapeHtml(statusText)}">
    <div class="card-body gap-3">
      <div class="flex items-start justify-between gap-3">
        <h3 class="card-title text-lg" id="readiness-${escapeHtml(capability.key)}">${escapeHtml(copy.title)}</h3>
        <span class="badge ${statusBadgeClass(capability.status)} badge-soft" role="status" aria-label="${escapeHtml(statusText)}">${escapeHtml(statusText)}</span>
      </div>
      <p class="text-sm text-base-content/75">${escapeHtml(copy.description)}</p>
      <div class="card-actions justify-end">
        <a class="btn btn-ghost btn-sm" href="${escapeHtml(href)}" aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(copy.title)}">${escapeHtml(messages.builder.openDetails)}</a>
      </div>
    </div>
  </article>`;
};

/**
 * Renders a reusable platform-readiness section for builder surfaces.
 *
 * @param options Rendering inputs.
 * @returns HTML fragment for the readiness summary.
 */
export const renderPlatformReadinessSection = (options: RenderPlatformReadinessOptions): string => {
  const { messages, locale, projectId, readiness } = options;
  const capabilityFilter = new Set(
    options.keys ?? readiness.capabilities.map((capability) => capability.key),
  );
  const cards = readiness.capabilities
    .filter((capability) => capabilityFilter.has(capability.key))
    .map((capability) => renderCapabilityCard(messages, locale, projectId, capability))
    .join("");

  return `<section id="builder-platform-readiness" class="space-y-4" role="region" aria-labelledby="readiness-heading">
    <div class="flex flex-col gap-2">
      <h2 id="readiness-heading" class="text-2xl font-semibold">${escapeHtml(messages.builder.platformReadinessTitle)}</h2>
      <p class="max-w-3xl text-sm text-base-content/75">${escapeHtml(
        messages.builder.platformReadinessDescription,
      )}</p>
    </div>

    <div class="stats stats-vertical border border-base-300 bg-base-100 lg:stats-horizontal" role="group" aria-label="${escapeHtml(messages.builder.platformReadinessTitle)}">
      <div class="stat">
        <div class="stat-title">${escapeHtml(messages.builder.sceneBaselineCountLabel)}</div>
        <div class="stat-value text-lg" aria-live="polite">${readiness.sceneCount}</div>
      </div>
      <div class="stat">
        <div class="stat-title">${escapeHtml(messages.builder.spriteManifestCountLabel)}</div>
        <div class="stat-value text-lg" aria-live="polite">${readiness.spriteManifestCount}</div>
      </div>
      <div class="stat">
        <div class="stat-title">${escapeHtml(messages.builder.partialCountLabel)}</div>
        <div class="stat-value text-warning text-lg" aria-live="polite">${readiness.partialCount}</div>
      </div>
      <div class="stat">
        <div class="stat-title">${escapeHtml(messages.builder.missingCountLabel)}</div>
        <div class="stat-value text-error text-lg" aria-live="polite">${readiness.missingCount}</div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-2" role="list" aria-label="${escapeHtml(messages.builder.platformReadinessTitle)}">${cards}</div>
  </section>`;
};

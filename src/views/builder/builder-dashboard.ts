import { appConfig, type LocaleCode } from "../../config/environment.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderPlatformReadinessSection } from "./platform-readiness.ts";

/**
 * Summary metrics for the builder landing page.
 */
export interface DashboardStats {
  /** Number of active gameplay sessions observed by the builder. */
  readonly activeSessions: number;
  /** Total scenes in the current builder project. */
  readonly totalScenes: number;
  /** Total NPCs in the current builder project. */
  readonly totalNpcs: number;
  /** Whether any AI provider is currently available. */
  readonly aiAvailable: boolean;
  /** Available provider names for the current runtime. */
  readonly providers: readonly string[];
  /** Platform capability status summary. */
  readonly readiness: BuilderPlatformReadiness;
}

/**
 * Renders the builder dashboard landing view.
 *
 * @param messages Locale-resolved message catalog.
 * @param locale Active locale.
 * @param stats Current builder summary metrics.
 * @returns HTML string for the dashboard surface.
 */
export const renderBuilderDashboard = (
  messages: Messages,
  locale: LocaleCode,
  stats: DashboardStats,
  projectId: string,
  published: boolean,
): string => {
  const docsHref = withLocaleQuery(appConfig.api.docsPath, locale);
  const scenesHref = withQueryParameters(appRoutes.builderScenes, { lang: locale, projectId });
  const npcsHref = withQueryParameters(appRoutes.builderNpcs, { lang: locale, projectId });
  const aiHref = withQueryParameters(appRoutes.builderAi, { lang: locale, projectId });
  const gameHref = published
    ? withQueryParameters(appRoutes.game, { lang: locale, projectId })
    : scenesHref;
  const primaryCtaLabel = published
    ? messages.builder.playPublishedBuild
    : messages.builder.continueAuthoring;
  const builderStatusHref = withQueryParameters(appRoutes.aiBuilderCapabilities, {
    locale,
  });
  const aiStatusLabel = stats.aiAvailable
    ? messages.ai.statusAvailable
    : messages.ai.statusUnavailable;
  const providersLabel =
    stats.providers.length > 0 ? stats.providers.join(", ") : messages.ai.noProviderAvailable;
  const flowSteps = messages.builder.flowSteps
    .map(
      (step, index) =>
        `<li class="list-row"><span class="badge badge-outline">${index + 1}</span> ${escapeHtml(step)}</li>`,
    )
    .join("");
  const readinessAlert =
    stats.readiness.partialCount > 0 || stats.readiness.missingCount > 0
      ? `<div role="alert" class="alert alert-warning alert-soft">
          <span>${escapeHtml(messages.builder.platformReadinessWarning)}</span>
        </div>`
      : "";

  return `
    <div class="space-y-6">
      <section class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <h1 class="card-title text-3xl">${escapeHtml(messages.builder.dashboard)}</h1>
              <p class="max-w-3xl text-base-content/80">${escapeHtml(messages.builder.flowDescription)}</p>
            </div>
            <div class="card-actions flex-wrap">
              <a class="btn btn-primary btn-sm" href="${escapeHtml(gameHref)}" aria-label="${escapeHtml(primaryCtaLabel)}">
                ${escapeHtml(primaryCtaLabel)}
              </a>
              <a class="btn btn-outline btn-sm" href="${escapeHtml(docsHref)}" aria-label="${escapeHtml(messages.builder.docsLabel)}">
                ${escapeHtml(messages.builder.docsLabel)}
              </a>
            </div>
          </div>

          <div class="stats stats-vertical border border-base-300 bg-base-100 lg:stats-horizontal">
            <div class="stat">
              <div class="stat-title">${escapeHtml(messages.builder.activeSessions)}</div>
              <div class="stat-value text-primary">${stats.activeSessions}</div>
            </div>
            <div class="stat">
              <div class="stat-title">${escapeHtml(messages.builder.totalScenes)}</div>
              <div class="stat-value">${stats.totalScenes}</div>
            </div>
            <div class="stat">
              <div class="stat-title">${escapeHtml(messages.builder.totalNpcs)}</div>
              <div class="stat-value">${stats.totalNpcs}</div>
            </div>
            <div class="stat">
              <div class="stat-title">${escapeHtml(messages.builder.aiStatus)}</div>
              <div class="stat-value text-lg">${escapeHtml(aiStatusLabel)}</div>
              <div class="stat-desc">${escapeHtml(providersLabel)}</div>
            </div>
          </div>

          ${readinessAlert}
        </div>
      </section>

      ${renderPlatformReadinessSection({
        messages,
        locale,
        projectId,
        readiness: stats.readiness,
      })}

      <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <h2 class="card-title">${escapeHtml(messages.builder.flowTitle)}</h2>
            <p class="text-base-content/80">${escapeHtml(messages.builder.flowDescription)}</p>
            <ul class="list rounded-box bg-base-200 p-3">
              ${flowSteps}
            </ul>
          </div>
        </article>

        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <div role="alert" class="alert ${stats.aiAvailable ? "alert-success" : "alert-warning"}">
              <span>${escapeHtml(aiStatusLabel)}</span>
            </div>
            <div class="space-y-2">
              <h2 class="card-title">${escapeHtml(messages.builder.localRuntimeTitle)}</h2>
              <p class="text-base-content/80">${escapeHtml(messages.builder.localRuntimeDescription)}</p>
            </div>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                <span>${escapeHtml(messages.builder.runtimeLabel)}</span>
                <span class="badge badge-outline">${escapeHtml(messages.builder.runtimeStackValue)}</span>
              </div>
              <div class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                <span>${escapeHtml(messages.builder.modelLabel)}</span>
                <span class="badge badge-outline">${escapeHtml(providersLabel)}</span>
              </div>
              <div class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                <span>${escapeHtml(messages.builder.configKeyLabel)}</span>
                <span class="font-mono text-xs">${escapeHtml(messages.builder.aiConfigPatternValue)}</span>
              </div>
            </div>
            <div class="card-actions">
              <a class="btn btn-outline btn-sm" href="${escapeHtml(builderStatusHref)}" aria-label="${escapeHtml(messages.builder.apiSurfaceTitle)}">
                ${escapeHtml(messages.builder.apiSurfaceTitle)}
              </a>
            </div>
          </div>
        </article>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.runtimeLaneTitle)}</h2>
            <p class="text-base-content/80">${escapeHtml(messages.builder.runtimeLaneDescription)}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-primary btn-sm" href="${escapeHtml(scenesHref)}" aria-label="${escapeHtml(messages.builder.scenes)}">
                ${escapeHtml(messages.builder.scenes)}
              </a>
            </div>
          </div>
        </article>

        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.pluginLaneTitle)}</h2>
            <p class="text-base-content/80">${escapeHtml(messages.builder.pluginLaneDescription)}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-outline btn-sm" href="${escapeHtml(npcsHref)}" aria-label="${escapeHtml(messages.builder.npcs)}">
                ${escapeHtml(messages.builder.npcs)}
              </a>
            </div>
          </div>
        </article>

        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.aiLaneTitle)}</h2>
            <p class="text-base-content/80">${escapeHtml(messages.builder.aiLaneDescription)}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-secondary btn-sm" href="${escapeHtml(aiHref)}" aria-label="${escapeHtml(messages.builder.ai)}">
                ${escapeHtml(messages.builder.ai)}
              </a>
            </div>
          </div>
        </article>
      </section>
    </div>`;
};

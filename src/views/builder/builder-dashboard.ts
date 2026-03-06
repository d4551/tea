/**
 * Builder Dashboard View
 *
 * Stats overview with scene count, NPC count, active sessions, and AI status.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withLocaleQuery } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Dashboard stats used for rendering.
 */
export interface DashboardStats {
  /** Number of active game sessions. */
  readonly activeSessions: number;
  /** Number of total scenes in the project workspace. */
  readonly totalScenes: number;
  /** Number of NPCs across all scenes. */
  readonly totalNpcs: number;
  /** Whether any AI provider is currently available. */
  readonly aiAvailable: boolean;
  /** Names of available providers. */
  readonly providers: readonly string[];
}

/**
 * Renders the builder dashboard overview.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale code.
 * @param stats Dashboard statistics.
 * @returns HTML string for the dashboard panel.
 */
export const renderBuilderDashboard = (
  messages: Messages,
  locale: LocaleCode,
  stats: DashboardStats,
): string => {
  const aiStatusClass = stats.aiAvailable ? "badge-success" : "badge-error";
  const aiStatusText = stats.aiAvailable
    ? messages.ai.statusAvailable
    : messages.ai.statusUnavailable;
  const sceneSummary = stats.totalScenes > 0 ? stats.totalScenes.toString() : "0";
  const npcSummary = stats.totalNpcs > 0 ? `${stats.totalNpcs}` : messages.builder.noNpcs;
  const sceneSummaryText =
    stats.totalScenes > 0
      ? `${stats.totalScenes} ${messages.builder.scenes}`
      : messages.builder.noScenes;
  const sceneHref = withLocaleQuery(appRoutes.builderScenes, locale);
  const npcHref = withLocaleQuery(appRoutes.builderNpcs, locale);
  const aiHref = withLocaleQuery(appRoutes.builderAi, locale);
  const providerSummary = stats.providers.join(", ") || messages.ai.noProviderAvailable;

  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.dashboard)}</h1>

      <!-- Stats row -->
      <div class="stats stats-vertical lg:stats-horizontal shadow bg-base-100 w-full">
        <div class="stat">
          <div class="stat-title">${escapeHtml(messages.builder.activeSessions)}</div>
          <div class="stat-value">${stats.activeSessions}</div>
        </div>
        <div class="stat">
          <div class="stat-title">${escapeHtml(messages.builder.totalScenes)}</div>
          <div class="stat-value">${escapeHtml(sceneSummary)}</div>
        </div>
        <div class="stat">
          <div class="stat-title">${escapeHtml(messages.builder.totalNpcs)}</div>
          <div class="stat-value">${escapeHtml(stats.totalNpcs.toString())}</div>
        </div>
        <div class="stat">
          <div class="stat-title">${escapeHtml(messages.builder.aiStatus)}</div>
          <div class="stat-value text-lg">
            <span class="badge ${aiStatusClass} gap-1">${escapeHtml(aiStatusText)}</span>
          </div>
          <div class="stat-desc">${escapeHtml(providerSummary)}</div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">
              <span aria-hidden="true">🏯</span> ${escapeHtml(messages.builder.scenes)}
            </h2>
            <p>${escapeHtml(sceneSummaryText)}</p>
            <div class="card-actions justify-end">
              <a href="${escapeHtml(sceneHref)}" class="btn btn-primary btn-sm" hx-get="${escapeHtml(sceneHref)}" hx-target="#builder-content" hx-push-url="true" aria-label="${escapeHtml(messages.builder.scenes)}">
                ${escapeHtml(messages.builder.scenes)} →
              </a>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">
              <span aria-hidden="true">👤</span> ${escapeHtml(messages.builder.npcs)}
            </h2>
            <p>${escapeHtml(npcSummary)}</p>
            <div class="card-actions justify-end">
              <a href="${escapeHtml(npcHref)}" class="btn btn-primary btn-sm" hx-get="${escapeHtml(npcHref)}" hx-target="#builder-content" hx-push-url="true" aria-label="${escapeHtml(messages.builder.npcs)}">
                ${escapeHtml(messages.builder.npcs)} →
              </a>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">
              <span aria-hidden="true">🤖</span> ${escapeHtml(messages.builder.ai)}
            </h2>
            <p>${escapeHtml(aiStatusText)}</p>
            <div class="card-actions justify-end">
              <a href="${escapeHtml(aiHref)}" class="btn btn-primary btn-sm" hx-get="${escapeHtml(aiHref)}" hx-target="#builder-content" hx-push-url="true" aria-label="${escapeHtml(messages.builder.ai)}">
                ${escapeHtml(messages.builder.ai)} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

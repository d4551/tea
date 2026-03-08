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
  /** Number of scenes with sceneMode "2d". */
  readonly scenes2d: number;
  /** Number of scenes with sceneMode "3d". */
  readonly scenes3d: number;
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
  const scenesHref = withQueryParameters(appRoutes.builderScenes, { lang: locale, projectId });
  const npcsHref = withQueryParameters(appRoutes.builderNpcs, { lang: locale, projectId });
  const dialogueHref = withQueryParameters(appRoutes.builderDialogue, { lang: locale, projectId });
  const aiHref = withQueryParameters(appRoutes.builderAi, { lang: locale, projectId });
  const assetsHref = withQueryParameters(appRoutes.builderAssets, { lang: locale, projectId });
  const animationsHref = withQueryParameters(appRoutes.builderAnimations, {
    lang: locale,
    projectId,
  });
  const mechanicsHref = withQueryParameters(appRoutes.builderMechanics, {
    lang: locale,
    projectId,
  });
  const automationHref = withQueryParameters(appRoutes.builderAutomation, {
    lang: locale,
    projectId,
  });
  const gameHref = published
    ? withQueryParameters(appRoutes.game, { lang: locale, projectId })
    : scenesHref;
  const primaryCtaLabel = published
    ? messages.builder.playPublishedBuild
    : messages.builder.continueAuthoring;
  const aiStatusLabel = stats.aiAvailable
    ? messages.ai.statusAvailable
    : messages.ai.statusUnavailable;
  const providersLabel =
    stats.providers.length > 0 ? stats.providers.join(", ") : messages.ai.noProviderAvailable;

  return `
    <div class="space-y-6 animate-fade-in-up">

      <!-- Hero welcome strip -->
      <section class="card border border-primary/20 bg-gradient-to-r from-primary/8 via-base-100 to-base-100 shadow-lg">
        <div class="card-body gap-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.dashboard)}</h1>
                <span class="badge ${published ? "badge-success" : "badge-warning"} badge-soft text-xs">${escapeHtml(published ? messages.builder.projectStatusPublished : messages.builder.projectStatusDraft)}</span>
              </div>
              <p class="text-sm text-base-content/60">${escapeHtml(messages.builder.flowDescription)}</p>
            </div>
            <div class="flex flex-wrap gap-2 self-start">
              <a class="btn btn-primary btn-sm shadow-md hover:shadow-primary/25 transition-all" href="${escapeHtml(gameHref)}" aria-label="${escapeHtml(primaryCtaLabel)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ${escapeHtml(primaryCtaLabel)}
              </a>
              <a class="btn btn-ghost btn-sm" href="${escapeHtml(withLocaleQuery(appConfig.api.docsPath, locale))}" aria-label="${escapeHtml(messages.builder.docsLabel)}">
                ${escapeHtml(messages.builder.docsLabel)}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Live stats strip -->
      <section class="stats stats-vertical border border-base-300/50 bg-base-100/50 shadow-md lg:stats-horizontal w-full" aria-label="${escapeHtml(messages.builder.dashboard)}">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.builder.activeSessions)}</div>
          <div class="stat-value text-primary">${stats.activeSessions}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.builder.totalScenes)}</div>
          <div class="stat-value">${stats.totalScenes}</div>
          <div class="stat-desc">${escapeHtml(messages.builder.sceneMode2d)} ${stats.scenes2d} · ${escapeHtml(messages.builder.sceneMode3d)} ${stats.scenes3d}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.builder.totalNpcs)}</div>
          <div class="stat-value">${stats.totalNpcs}</div>
        </div>
        <div class="stat">
          <div class="stat-figure ${stats.aiAvailable ? "text-success" : "text-warning"}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.builder.aiStatus)}</div>
          <div class="stat-value text-lg">${escapeHtml(aiStatusLabel)}</div>
          <div class="stat-desc">${escapeHtml(providersLabel)}</div>
        </div>
      </section>

      <!-- Quick actions grid with counts -->
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
        ${renderQuickAction({
          href: scenesHref,
          label: messages.builder.quickActionScene,
          desc: messages.builder.quickActionSceneDesc,
          count: stats.totalScenes,
          colorToken: "primary",
          icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`,
        })}
        ${renderQuickAction({
          href: npcsHref,
          label: messages.builder.quickActionNpc,
          desc: messages.builder.quickActionNpcDesc,
          count: stats.totalNpcs,
          colorToken: "secondary",
          icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />`,
        })}
        ${renderQuickAction({
          href: dialogueHref,
          label: messages.builder.quickActionDialogue,
          desc: messages.builder.quickActionDialogueDesc,
          colorToken: "accent",
          icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />`,
        })}
        ${renderQuickAction({
          href: aiHref,
          label: messages.builder.quickActionAi,
          desc: messages.builder.quickActionAiDesc,
          colorToken: "warning",
          icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`,
        })}
      </section>

      <!-- Two-column workspace grid -->
      <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">

        <!-- Workspace navigation -->
        <article class="card border border-base-300/50 bg-base-100/50 shadow-md">
          <div class="card-body gap-4">
            <h2 class="card-title text-lg">${escapeHtml(messages.builder.flowTitle)}</h2>
            <div class="grid gap-2 sm:grid-cols-2">
              ${renderWorkspaceLink({
                href: scenesHref,
                label: messages.builder.scenes,
                colorToken: "primary",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />`,
              })}
              ${renderWorkspaceLink({
                href: assetsHref,
                label: messages.builder.assets,
                colorToken: "secondary",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
              })}
              ${renderWorkspaceLink({
                href: animationsHref,
                label: messages.builder.animations,
                colorToken: "accent",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />`,
              })}
              ${renderWorkspaceLink({
                href: mechanicsHref,
                label: messages.builder.mechanics,
                colorToken: "info",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
              })}
              ${renderWorkspaceLink({
                href: automationHref,
                label: messages.builder.automation,
                colorToken: "warning",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />`,
              })}
              ${renderWorkspaceLink({
                href: aiHref,
                label: messages.builder.ai,
                colorToken: "error",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`,
              })}
            </div>
          </div>
        </article>

        <!-- AI co-pilot status -->
        <article class="card border border-base-300/50 bg-base-100/50 shadow-md">
          <div class="card-body gap-4">
            <div role="alert" class="alert ${stats.aiAvailable ? "alert-success" : "alert-warning"} alert-soft">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <span>${escapeHtml(aiStatusLabel)}</span>
            </div>
            <div class="space-y-2">
              <h2 class="card-title text-lg">${escapeHtml(messages.builder.localRuntimeTitle)}</h2>
              <p class="text-sm text-base-content/60">${escapeHtml(messages.builder.localRuntimeDescription)}</p>
            </div>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between rounded-box bg-base-200/60 px-3 py-2">
                <span>${escapeHtml(messages.builder.runtimeLabel)}</span>
                <span class="badge badge-primary badge-soft badge-sm">${escapeHtml(messages.builder.runtimeStackValue)}</span>
              </div>
              <div class="flex items-center justify-between rounded-box bg-base-200/60 px-3 py-2">
                <span>${escapeHtml(messages.builder.modelLabel)}</span>
                <span class="badge badge-secondary badge-soft badge-sm">${escapeHtml(providersLabel)}</span>
              </div>
            </div>
            <div class="card-actions">
              <a class="btn btn-primary btn-soft btn-sm w-full" href="${escapeHtml(aiHref)}" aria-label="${escapeHtml(messages.builder.ai)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ${escapeHtml(messages.builder.quickActionAi)}
              </a>
            </div>
          </div>
        </article>
      </section>

      ${renderPlatformReadinessSection({
        messages,
        locale,
        projectId,
        readiness: stats.readiness,
      })}
    </div>`;
};

/**
 * Quick action card configuration.
 */
interface QuickActionConfig {
  readonly href: string;
  readonly label: string;
  readonly desc: string;
  readonly count?: number;
  readonly colorToken: string;
  readonly icon: string;
}

/**
 * Renders a single quick action card.
 *
 * @param config Quick action configuration.
 * @returns HTML string for the card.
 */
const renderQuickAction = (config: QuickActionConfig): string => `
  <a href="${escapeHtml(config.href)}" class="card border border-${config.colorToken}/15 bg-gradient-to-br from-${config.colorToken}/5 via-base-100 to-base-100 shadow-sm hover:shadow-lg hover:border-${config.colorToken}/30 transition-all group" aria-label="${escapeHtml(config.label)}">
    <div class="card-body gap-3 p-4">
      <div class="flex items-center justify-between">
        <div class="rounded-btn bg-${config.colorToken}/15 p-2.5 group-hover:bg-${config.colorToken}/25 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-${config.colorToken}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">${config.icon}</svg>
        </div>
        ${config.count !== undefined ? `<span class="badge badge-${config.colorToken} badge-soft badge-sm">${config.count}</span>` : ""}
      </div>
      <div>
        <h3 class="font-semibold">${escapeHtml(config.label)}</h3>
        <p class="text-xs text-base-content/60 mt-0.5">${escapeHtml(config.desc)}</p>
      </div>
    </div>
  </a>`;

/**
 * Workspace link configuration.
 */
interface WorkspaceLinkConfig {
  readonly href: string;
  readonly label: string;
  readonly colorToken: string;
  readonly icon: string;
}

/**
 * Renders a workspace navigation link.
 *
 * @param config Workspace link configuration.
 * @returns HTML string for the link.
 */
const renderWorkspaceLink = (config: WorkspaceLinkConfig): string => `
  <a href="${escapeHtml(config.href)}" class="flex items-center gap-3 rounded-btn px-3 py-2.5 hover:bg-${config.colorToken}/10 transition-colors group" aria-label="${escapeHtml(config.label)}">
    <div class="rounded-btn bg-${config.colorToken}/10 p-1.5 group-hover:bg-${config.colorToken}/20 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-${config.colorToken}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">${config.icon}</svg>
    </div>
    <span class="text-sm font-medium">${escapeHtml(config.label)}</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
  </a>`;

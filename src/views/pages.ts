import { appConfig } from "../config/environment.ts";
import { joinUrlPath } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../shared/constants/routes.ts";
import {
  escapeHtml,
  type LayoutContext,
  type LayoutScript,
  renderDocument,
  renderDrawerToggleControl,
} from "./layout.ts";
import { cardClasses, renderEmptyState } from "./shared/ui-components.ts";

const homePageScripts: readonly LayoutScript[] = [
  {
    src: joinUrlPath(appConfig.staticAssets.publicPrefix, "js/welcome-strip.js"),
    type: "module",
  },
];

/**
 * Parameters for rendering a full page shell.
 */
export interface PageRenderInput {
  readonly layout: LayoutContext;
}

const workspaceStatusIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 4l9 6.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>';

const activityEmptyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6v6l4 2"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>';

/**
 * Renders the Game Forge home page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderHomePage = (input: PageRenderInput): string => {
  const { layout } = input;
  const { locale, messages } = layout;
  const teaHouseLaunchUrl = withQueryParameters(withLocaleQuery(appRoutes.game, locale), {
    sceneId: "teaHouse",
  });
  const crystalCavernLaunchUrl = withQueryParameters(withLocaleQuery(appRoutes.game, locale), {
    sceneId: "crystalCavern",
  });

  const body = `
  <div class="grid p-4 gap-4">

    <!-- Hero Section -->
    <section class="hero bg-base-200 rounded-box min-h-[28vh]" aria-label="${escapeHtml(messages.builder.dashboard)}">
      <div class="hero-content flex-col lg:flex-row-reverse gap-8 w-full py-10 px-6 lg:px-10">
        <div class="lg:max-w-sm shrink-0">
          <article class="${cardClasses.borderedGlass}" role="status" aria-label="${escapeHtml(messages.common.noProjectBound)}">
            <div class="card-body gap-3">
              ${renderEmptyState(
                workspaceStatusIcon,
                messages.common.noProjectBound,
                messages.builder.workspaceJumpBack,
                `<a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">${escapeHtml(messages.pages.home.openUnifiedBuilder)}</a>`,
              )}
            </div>
          </article>
        </div>
        <div class="space-y-4 flex-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl w-12 h-12 flex items-center justify-center bg-primary/15 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </div>
            <div>
              <h1 class="text-display font-bold tracking-tight">${escapeHtml(messages.builder.dashboard)}</h1>
              <p class="text-base-content/60 text-body">${escapeHtml(messages.pages.home.welcomeBack)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div id="welcome-strip" class="hidden rounded-box border border-primary/30 bg-primary/5 p-4 text-sm" role="status">
      <p class="font-medium">${escapeHtml(messages.pages.home.welcomeBack)}</p>
      <p class="text-base-content/70 mt-1">${escapeHtml(messages.pages.home.quickStartHint)}</p>
      <button type="button" class="btn btn-ghost btn-sm mt-2" aria-label="${escapeHtml(messages.common.dismiss)}">${escapeHtml(messages.common.dismiss)}</button>
    </div>

    <!-- Stats Bar -->
    <div class="stats stats-vertical lg:stats-horizontal bg-base-200 shadow" role="region" aria-label="${escapeHtml(messages.pages.home.statsScenes)}">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="stat-title">${escapeHtml(messages.pages.home.statsScenes)}</div>
        <div class="stat-value text-primary">0</div>
        <div class="stat-desc">${escapeHtml(messages.common.noProjectBound)}</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-title">${escapeHtml(messages.builder.npcs)}</div>
        <div class="stat-value text-secondary">0</div>
        <div class="stat-desc">${escapeHtml(messages.common.noProjectBound)}</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="stat-title">${escapeHtml(messages.pages.home.projectActivity)}</div>
        <div class="stat-value text-accent">—</div>
        <div class="stat-desc">${escapeHtml(messages.pages.home.activityEmptyTitle)}</div>
      </div>
    </div>

    <!-- Bento Grid -->
    <div class="grid lg:grid-cols-2 gap-4">

      <!-- Create: Builder Workspace -->
      <article role="group" aria-label="${escapeHtml(messages.navigation.builder)}" class="bg-base-200 card">
        <div class="card-body gap-3">
          <div class="flex items-start justify-between">
            <div class="rounded-xl w-11 h-11 flex items-center justify-center bg-primary/15 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span class="badge badge-primary badge-soft badge-sm">${escapeHtml(messages.pages.home.statsScenes)}</span>
          </div>
          <div class="space-y-1">
            <h2 class="card-title text-lg">${escapeHtml(messages.builder.workspaceTitle)}</h2>
            <p class="text-base-content/65 text-sm leading-relaxed">${escapeHtml(messages.builder.workspaceJumpBack)}</p>
          </div>
          <div class="card-actions justify-stretch mt-auto pt-3 flex-col gap-2">
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary btn-block gap-2 group min-h-11" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">
              ${escapeHtml(messages.pages.home.openUnifiedBuilder)}
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            ${renderDrawerToggleControl({
              targetId: "ai-chat-drawer",
              label: messages.pages.home.talkToAiOracle,
              className: "btn btn-outline btn-block gap-2",
              hasPopup: "dialog",
              content: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>${escapeHtml(messages.pages.home.talkToAiOracle)}`,
            })}
          </div>
        </div>
      </article>

      <!-- Play: Playtest + Scene Launchers -->
      <article role="group" aria-label="${escapeHtml(messages.navigation.game)}" class="bg-base-200 card">
        <div class="card-body gap-3">
          <div class="flex items-start justify-between">
            <div class="rounded-xl w-11 h-11 flex items-center justify-center bg-secondary/15 text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <span class="badge badge-secondary badge-soft badge-sm">${escapeHtml(messages.pages.home.playtestBuild)}</span>
          </div>
          <div class="space-y-1">
            <h2 class="card-title text-lg">${escapeHtml(messages.pages.home.playtestBuild)}</h2>
            <p class="text-base-content/65 text-sm leading-relaxed">${escapeHtml(messages.pages.home.playtestBuildDescription)}</p>
          </div>

          <div class="bg-base-200/60 rounded-box p-5 flex-1 flex flex-col items-center justify-center text-center gap-3 border border-base-300/40" role="status" aria-label="${escapeHtml(messages.common.noProjectBound)}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-base-content/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M3 19h4"/><path d="M13 11l4 2-4 2v-4z"/></svg>
            <span class="text-xs font-semibold uppercase tracking-wider text-base-content/50">${escapeHtml(messages.common.noProjectBound)}</span>
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-outline btn-sm min-h-11" aria-label="${escapeHtml(messages.builder.createProject)}">${escapeHtml(messages.builder.createProject)}</a>
          </div>

          <div class="card-actions justify-stretch mt-auto pt-3">
            <div class="space-y-2 w-full">
              <p class="text-xs uppercase tracking-wider text-base-content/50">${escapeHtml(messages.pages.home.sceneLauncherTitle)}</p>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.sceneLauncherDescription)}</p>
            </div>
            <a href="${teaHouseLaunchUrl}" class="btn btn-secondary btn-block gap-2 group" aria-label="${escapeHtml(messages.pages.home.launch2dScene)}">
              <span class="text-left">
                <span class="text-xs uppercase tracking-wide text-secondary">${escapeHtml(messages.game.sceneMode2d)}</span><br />
                ${escapeHtml(messages.pages.home.launch2dScene)}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="${crystalCavernLaunchUrl}" class="btn btn-outline btn-block gap-2 group" aria-label="${escapeHtml(messages.pages.home.launch3dScene)}">
              <span class="text-left">
                <span class="text-xs uppercase tracking-wide text-primary">${escapeHtml(messages.game.sceneMode3d)}</span><br />
                ${escapeHtml(messages.pages.home.launch3dScene)}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </article>

      <!-- Activity -->
      <article role="group" aria-label="${escapeHtml(messages.pages.home.projectActivity)}" class="bg-base-200 card lg:col-span-2">
        <div class="card-body gap-3">
          <div class="flex items-center gap-2">
            <div class="rounded-lg w-8 h-8 flex items-center justify-center bg-accent/15 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 class="card-title text-lg">${escapeHtml(messages.pages.home.projectActivity)}</h2>
          </div>
          <details class="collapse collapse-arrow bg-base-200/40 rounded-box border border-dashed border-base-300">
            <summary class="collapse-title font-medium text-sm">${escapeHtml(messages.pages.home.activityEmptyTitle)}</summary>
            <div class="collapse-content">
              ${renderEmptyState(
                activityEmptyIcon,
                messages.pages.home.activityEmptyTitle,
                messages.pages.home.activityEmptyDescription,
                `<a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">${escapeHtml(messages.pages.home.openUnifiedBuilder)}</a>`,
              )}
            </div>
          </details>
        </div>
      </article>

    </div>
  </div>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

import { appConfig } from "../config/environment.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import {
  escapeHtml,
  type LayoutContext,
  renderDocument,
  renderDrawerToggleControl,
} from "./layout.ts";
import { renderEmptyState } from "./shared/ui-components.ts";

const homePageScripts: readonly {
  readonly src: string;
}[] = [
  {
    src: toPublicAssetUrl(
      appConfig.staticAssets.publicPrefix,
      assetRelativePaths.htmxExtensionOracleIndicatorFile,
    ),
  },
  {
    src: toPublicAssetUrl(
      appConfig.staticAssets.publicPrefix,
      assetRelativePaths.htmxExtensionFocusPanelFile,
    ),
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

  const body = `
  <div class="flex flex-col gap-8 w-full max-w-7xl mx-auto pt-4 lg:pt-8 min-h-[60vh]">
    
    <!-- Welcome Header & Quick Stats -->
    <section class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between animate-fade-in-up">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="rounded-xl w-12 h-12 flex items-center justify-center bg-primary/15 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold tracking-tight lg:text-4xl">${escapeHtml(messages.builder.dashboard)}</h1>
            <p class="text-base-content/60 text-base">${escapeHtml(messages.pages.home.welcomeBack)}</p>
          </div>
        </div>
      </div>
      
      <article class="card border border-base-300/50 bg-base-100/80 shadow-md backdrop-blur-sm shrink-0 xl:max-w-md" role="status" aria-label="${escapeHtml(messages.common.noProjectBound)}">
        <div class="card-body">
          ${renderEmptyState(
            workspaceStatusIcon,
            messages.common.noProjectBound,
            messages.builder.workspaceJumpBack,
            `<a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">${escapeHtml(messages.pages.home.openUnifiedBuilder)}</a>`,
          )}
        </div>
      </article>
    </section>

    <!-- Bento Grid Structure -->
    <section class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 mt-2 stagger-children">
      
      <!-- Create New Action -->
      <article class="card card-elevated card-interactive bg-gradient-to-br from-primary/8 via-base-100 to-base-100 border border-primary/15 col-span-1 min-h-[300px]">
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
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary btn-block gap-2 group" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">
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

      <!-- Playtesting Mode -->
      <article class="card card-elevated card-interactive bg-base-100 border border-base-300/60 col-span-1 min-h-[300px]">
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
          
          <div class="bg-base-200/60 rounded-box p-5 flex-1 flex flex-col items-center justify-center text-center gap-2 border border-base-300/40" role="status" aria-label="${escapeHtml(messages.common.noProjectBound)}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-base-content/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M3 19h4"/><path d="M13 11l4 2-4 2v-4z"/></svg>
            <span class="text-xs font-semibold uppercase tracking-wider text-base-content/50">${escapeHtml(messages.common.noProjectBound)}</span>
          </div>
          
          <div class="card-actions justify-stretch mt-auto pt-3">
            <a href="${withLocaleQuery(appRoutes.game, locale)}" class="btn btn-secondary btn-block gap-2 group" aria-label="${escapeHtml(messages.pages.home.launchPlayerSurface)}">
              ${escapeHtml(messages.pages.home.launchPlayerSurface)}
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </article>
      
      <!-- Recent Activity / Info -->
      <article class="card card-elevated bg-base-100 border border-base-300/60 col-span-1 lg:col-span-2 2xl:col-span-1 min-h-[300px]">
        <div class="card-body gap-3">
          <div class="flex items-center gap-2">
            <div class="rounded-lg w-8 h-8 flex items-center justify-center bg-accent/15 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 class="card-title text-lg">${escapeHtml(messages.pages.home.projectActivity)}</h2>
          </div>
          <div class="rounded-box border border-dashed border-base-300 bg-base-200/40 p-6" role="status" aria-label="${escapeHtml(messages.pages.home.activityEmptyTitle)}">
            ${renderEmptyState(
              activityEmptyIcon,
              messages.pages.home.activityEmptyTitle,
              messages.pages.home.activityEmptyDescription,
              `<a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">${escapeHtml(messages.pages.home.openUnifiedBuilder)}</a>`,
            )}
          </div>
        </div>
      </article>
      
    </section>
  </div>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

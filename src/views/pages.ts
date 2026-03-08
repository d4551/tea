import { appConfig } from "../config/environment.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import { escapeHtml, type LayoutContext, renderDocument } from "./layout.ts";
import type { OraclePanelState } from "./oracle.ts";

const homePageScripts = [
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
] as const;

/**
 * Parameters for rendering a full page shell.
 */
export interface PageRenderInput {
  readonly layout: LayoutContext;
}

/**
 * Renders the Game Forge home page.
 *
 * @param input Shared page input values.
 * @param oraclePanelState Current oracle panel state.
 * @returns Complete HTML document.
 */
export const renderHomePage = (
  input: PageRenderInput,
  _oraclePanelState: OraclePanelState,
): string => {
  const { layout } = input;
  const { locale, messages } = layout;
  const _flowItems = messages.pages.home.loopSteps
    .map(
      (step, index) =>
        `<li class="step ${index === 0 ? "step-primary" : index === 1 ? "step-secondary" : "step-accent"}">${escapeHtml(step)}</li>`,
    )
    .join("");

  const body = `
  <div class="flex flex-col gap-8 w-full max-w-7xl mx-auto pt-4 lg:pt-8 min-h-[60vh]">
    
    <!-- Welcome Header & Quick Stats -->
    <section class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between animate-fade-in-up">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight lg:text-5xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-8 lg:size-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          ${escapeHtml(messages.builder.dashboard)}
        </h1>
        <p class="text-base-content/70 text-lg">${escapeHtml(messages.pages.home.welcomeBack)}</p>
      </div>
      
      <div class="stats stats-vertical sm:stats-horizontal shadow-sm bg-base-200/50 border border-base-300 shrink-0" role="region" aria-label="${escapeHtml(messages.builder.dashboard)}">
        <div class="stat px-6 py-4">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.pages.home.statsScenes)}</div>
          <div class="stat-value text-primary">0</div>
        </div>
        
        <div class="stat px-6 py-4 border-t sm:border-t-0 sm:border-l border-base-300">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.pages.home.statsNpcs)}</div>
          <div class="stat-value text-secondary">0</div>
        </div>
        
        <div class="stat px-6 py-4 border-t sm:border-t-0 sm:border-l border-base-300">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div class="stat-title">${escapeHtml(messages.pages.home.statsGenerations)}</div>
          <div class="stat-value text-accent">0</div>
        </div>
      </div>
    </section>

    <!-- Bento Grid Structure -->
    <section class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mt-4">
      
      <!-- Create New Action -->
      <div class="card bg-gradient-to-br from-primary/10 via-base-100 to-base-200 border border-primary/20 shadow-sm col-span-1 min-h-[280px]">
        <div class="card-body">
          <div class="rounded-xl w-12 h-12 flex items-center justify-center bg-primary/20 text-primary mb-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h2 class="card-title text-xl mb-1">${escapeHtml(messages.builder.workspaceTitle)}</h2>
          <p class="text-base-content/80 text-sm">${escapeHtml(messages.builder.workspaceJumpBack)}</p>
          <div class="card-actions justify-end mt-auto pt-4 flex-col gap-2">
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary btn-block shadow-lg gap-2" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">
              ${escapeHtml(messages.pages.home.openUnifiedBuilder)}
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <button type="button" class="btn btn-outline btn-block mb-2 bg-base-100/50 gap-2" aria-controls="ai-chat-drawer" aria-expanded="false" aria-label="${escapeHtml(messages.pages.home.talkToAiOracle)}" data-drawer-toggle-target="ai-chat-drawer" data-drawer-toggle-mode="toggle">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              ${escapeHtml(messages.pages.home.talkToAiOracle)}
            </button>
          </div>
        </div>
      </div>

      <!-- Playtesting Mode -->
      <div class="card bg-base-200 border border-base-300 shadow-sm col-span-1 min-h-[280px]">
        <div class="card-body">
          <div class="rounded-xl w-12 h-12 flex items-center justify-center bg-secondary/20 text-secondary mb-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
          <h2 class="card-title text-xl mb-1">${escapeHtml(messages.pages.home.playtestBuild)}</h2>
          <p class="text-base-content/80 text-sm">${escapeHtml(messages.pages.home.playtestBuildDescription)}</p>
          
          <div class="bg-base-300/50 rounded-box p-4 mt-2 mb-4 flex-1 flex flex-col items-center justify-center text-center gap-2 border border-base-content/5" role="status">
             <svg xmlns="http://www.w3.org/2000/svg" class="size-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M3 19h4"/><path d="M13 11l4 2-4 2v-4z"/></svg>
             <span class="text-xs font-semibold uppercase tracking-wider opacity-60 mt-1">${escapeHtml(messages.pages.home.statusUnpublishedDraft)}</span>
          </div>
          
          <div class="card-actions justify-end mt-auto pt-2">
            <a href="${withLocaleQuery(appRoutes.game, locale)}" class="btn btn-secondary btn-block shadow-lg gap-2" aria-label="${escapeHtml(messages.pages.home.launchPlayerSurface)}">
              ${escapeHtml(messages.pages.home.launchPlayerSurface)}
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity / Info -->
      <div class="card bg-base-200 border border-base-300 shadow-sm col-span-1 lg:col-span-2 2xl:col-span-1 min-h-[280px]">
        <div class="card-body p-4 lg:p-6">
          <h2 class="card-title text-xl mb-4">${escapeHtml(messages.pages.home.projectActivity)}</h2>
          
          <ul class="timeline timeline-vertical timeline-compact max-md:timeline-snap-icon w-full gap-2 overflow-hidden" role="list" aria-label="${escapeHtml(messages.pages.home.projectActivity)}">
            <li>
              <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 text-primary" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
              </div>
              <div class="timeline-end timeline-box bg-base-100 border-none shadow-sm pb-1 text-sm font-medium">${escapeHtml(messages.pages.home.projectCreatedInWorkspace)}</div>
              <hr class="bg-primary/20" />
            </li>
            <li>
              <hr class="bg-primary/20" />
              <div class="timeline-middle text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
              </div>
              <div class="timeline-end timeline-box bg-transparent text-sm border-none opacity-50 pb-1 w-full max-w-[200px] whitespace-normal truncate">${escapeHtml(messages.pages.home.waitingForInitialSceneDraft)}</div>
              <hr class="bg-base-300" />
            </li>
            <li>
              <hr class="bg-base-300" />
              <div class="timeline-middle text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" /></svg>
              </div>
              <div class="timeline-end timeline-box border-none text-sm bg-transparent opacity-50 pb-1">${escapeHtml(messages.pages.home.awaitingPublication)}</div>
            </li>
          </ul>
        </div>
      </div>
      
    </section>
  </div>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

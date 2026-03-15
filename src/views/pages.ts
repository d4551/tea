import { appConfig } from "../config/environment.ts";
import { joinUrlPath } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import {
  escapeHtml,
  type LayoutContext,
  type LayoutScript,
  renderDocument,
  renderDrawerToggleControl,
} from "./layout.ts";
import {
  renderCollapse,
  renderEmptyState,
  renderHero,
  renderStats,
} from "./shared/ui-components.ts";

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
 * Renders the TEA home page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderHomePage = (input: PageRenderInput): string => {
  const { layout } = input;
  const { locale, messages } = layout;
  const teaHouseLaunchUrl = withLocaleQuery(appRoutes.builder, locale);
  const crystalCavernLaunchUrl = withLocaleQuery(appRoutes.builder, locale);
  const builderUrl = withLocaleQuery(appRoutes.builder, locale);

  const sceneLauncher = renderCollapse({
    title: messages.pages.home.sceneLauncherTitle,
    ariaLabel: messages.pages.home.sceneLauncherTitle,
    className: "rounded-box border border-base-300/50 bg-base-100/70",
    content: `<div class="grid gap-2">
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
    </div>`,
    open: true,
  });

  const heroContent = renderHero({
    title: messages.pages.home.heroTitle,
    subtitle: messages.pages.home.heroDescription,
    actions: `${renderDrawerToggleControl({
      targetId: "ai-chat-drawer",
      label: messages.pages.home.talkToAiOracle,
      className: "btn btn-outline gap-2 min-h-11",
      hasPopup: "dialog",
      content: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>${escapeHtml(messages.pages.home.talkToAiOracle)}`,
    })}
      <a href="${builderUrl}" class="btn btn-primary gap-2 min-h-11" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">
        ${escapeHtml(messages.pages.home.openUnifiedBuilder)}
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>`,
    media: `<article class="card card-border bg-base-100/85 shadow-xl lg:max-w-md" role="status" aria-label="${escapeHtml(messages.pages.home.statusUnpublishedDraft)}">
      <div class="card-body gap-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2">
            <span class="badge badge-primary badge-soft">${escapeHtml(messages.pages.home.statusUnpublishedDraft)}</span>
            <h2 class="card-title text-xl">${escapeHtml(messages.pages.home.welcomeBack)}</h2>
          </div>
          ${workspaceStatusIcon}
        </div>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(messages.pages.home.quickStartHint)}</p>
        ${renderStats({
          stats: [
            {
              title: messages.pages.home.statsScenes,
              value: "SSR",
              description: messages.pages.home.architectureTitle,
            },
            {
              title: messages.pages.home.statsNpcs,
              value: "HTMX",
              description: messages.pages.home.reliabilityTitle,
            },
            {
              title: messages.pages.home.statsGenerations,
              value: "Local",
              description: messages.pages.home.progressiveEnhancementTitle,
            },
          ],
          vertical: true,
          className: "bg-base-200/70",
          ariaLabel: messages.pages.home.projectActivity,
        })}
        <div class="card-actions justify-start">
          <a href="${builderUrl}" class="btn btn-primary btn-sm min-h-11" aria-label="${escapeHtml(messages.pages.home.builderCardCta)}">${escapeHtml(messages.pages.home.builderCardCta)}</a>
          <a href="#release-standard" class="btn btn-ghost btn-sm min-h-11" aria-label="${escapeHtml(messages.pages.home.projectActivity)}">${escapeHtml(messages.pages.home.projectActivity)}</a>
        </div>
      </div>
    </article>`,
    className: "rounded-box hero-shell hero-home-shell",
    minHeightClass: "min-h-[50vh]",
    contentClassName: "max-w-6xl items-start gap-6 py-10 lg:gap-10 lg:flex-row",
  });

  const body = `
  <div class="grid gap-4 p-4 md:p-6">
    ${heroContent}

    <div id="welcome-strip" class="hidden rounded-box border border-primary/30 bg-primary/5 p-4 text-sm" role="status">
      <p class="font-medium">${escapeHtml(messages.pages.home.welcomeBack)}</p>
      <p class="text-base-content/70 mt-1">${escapeHtml(messages.pages.home.quickStartHint)}</p>
      <button type="button" class="btn btn-ghost btn-sm mt-2" aria-label="${escapeHtml(messages.common.dismiss)}">${escapeHtml(messages.common.dismiss)}</button>
    </div>

    ${renderStats({
      stats: [
        {
          title: messages.pages.home.statsScenes,
          value: "Author",
          description: messages.pages.home.architectureDescription,
          figure: `<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        },
        {
          title: messages.builder.npcs,
          value: "Refine",
          description: messages.pages.home.reliabilityDescription,
          figure: `<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        },
        {
          title: messages.pages.home.statsGenerations,
          value: "Deploy",
          description: messages.pages.home.progressiveEnhancementDescription,
          figure: `<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        },
      ],
      className: "w-full bg-base-100/80 shadow-sm",
      ariaLabel: messages.pages.home.loopTitle,
    })}

    <div class="grid lg:grid-cols-2 gap-4">
      <article role="group" aria-label="${escapeHtml(messages.navigation.builder)}" class="card card-elevated card-glow-primary bg-base-200/75">
        <div class="card-body gap-3">
          <div class="flex items-start justify-between">
            <div class="rounded-xl w-11 h-11 flex items-center justify-center bg-primary/15 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span class="badge badge-primary badge-soft badge-sm">${escapeHtml(messages.pages.home.statsScenes)}</span>
          </div>
          <div class="space-y-1">
            <h2 class="card-title text-lg">${escapeHtml(messages.pages.home.builderCardTitle)}</h2>
            <p class="text-base-content/65 text-sm leading-relaxed">${escapeHtml(messages.pages.home.builderCardDescription)}</p>
          </div>
          <ul class="space-y-2 text-sm text-base-content/70">
            ${messages.pages.home.loopSteps
              .map(
                (step) => `<li class="flex items-start gap-2">
              <span class="badge badge-outline badge-sm mt-0.5">•</span>
              <span>${escapeHtml(step)}</span>
            </li>`,
              )
              .join("")}
          </ul>
          <div class="card-actions justify-stretch mt-auto pt-3 flex-col gap-2">
            <a href="${builderUrl}" class="btn btn-primary btn-block gap-2 group min-h-11" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">
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
      <article role="group" aria-label="${escapeHtml(messages.navigation.game)}" class="card card-elevated card-glow-secondary bg-base-200/75">
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

          <div class="bg-base-100/70 rounded-box p-5 flex-1 flex flex-col gap-3 border border-base-300/40" role="status" aria-label="${escapeHtml(messages.pages.home.playerCardTitle)}">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-secondary/15 p-3 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M3 19h4"/><path d="M13 11l4 2-4 2v-4z"/></svg>
              </div>
              <div>
                <p class="font-semibold">${escapeHtml(messages.pages.home.playerCardTitle)}</p>
                <p class="text-sm text-base-content/65">${escapeHtml(messages.pages.home.playerCardDescription)}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="badge badge-secondary badge-soft">${escapeHtml(messages.game.sceneMode2d)}</span>
              <span class="badge badge-outline">${escapeHtml(messages.game.sceneMode3d)}</span>
              <span class="badge badge-outline">${escapeHtml(messages.pages.home.launchPlayerSurface)}</span>
            </div>
            <a href="${builderUrl}" class="btn btn-outline btn-sm min-h-11 self-start" aria-label="${escapeHtml(messages.pages.home.playerCardCta)}">${escapeHtml(messages.pages.home.playerCardCta)}</a>
          </div>

          <div class="card-actions justify-stretch mt-auto pt-3">
            <div class="space-y-2 w-full">
              <p class="text-xs uppercase tracking-wider text-base-content/50">${escapeHtml(messages.pages.home.sceneLauncherTitle)}</p>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.sceneLauncherDescription)}</p>
            </div>
            ${sceneLauncher}
          </div>
        </div>
      </article>

        <article id="release-standard" role="group" aria-label="${escapeHtml(messages.pages.home.projectActivity)}" class="card card-elevated card-glow-primary bg-base-200/85 lg:col-span-2">
        <div class="card-body gap-3">
          <div class="flex items-center gap-2">
            <div class="rounded-lg w-8 h-8 flex items-center justify-center bg-accent/15 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 class="card-title text-lg">${escapeHtml(messages.pages.home.projectActivity)}</h2>
          </div>
          ${renderCollapse({
            title: messages.pages.home.activityEmptyTitle,
            ariaLabel: messages.pages.home.activityEmptyTitle,
            className:
              "collapse collapse-arrow bg-base-100/60 rounded-box border border-base-300/60",
            content: `
              ${renderEmptyState(
                activityEmptyIcon,
                messages.pages.home.activityEmptyTitle,
                messages.pages.home.activityEmptyDescription,
                `<a href="${builderUrl}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.pages.home.openUnifiedBuilder)}">${escapeHtml(messages.pages.home.openUnifiedBuilder)}</a>`,
              )}
              <div class="grid gap-3 pt-4 lg:grid-cols-3">
                <article class="card card-border bg-base-100/80">
                  <div class="card-body gap-2">
                    <span class="badge badge-primary badge-soft badge-sm">${escapeHtml(messages.pages.home.architectureTitle)}</span>
                    <h3 class="card-title text-base">${escapeHtml(messages.pages.home.projectCreatedInWorkspace)}</h3>
                    <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.architectureDescription)}</p>
                  </div>
                </article>
                <article class="card card-border bg-base-100/80">
                  <div class="card-body gap-2">
                    <span class="badge badge-secondary badge-soft badge-sm">${escapeHtml(messages.pages.home.reliabilityTitle)}</span>
                    <h3 class="card-title text-base">${escapeHtml(messages.pages.home.waitingForInitialSceneDraft)}</h3>
                    <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.reliabilityDescription)}</p>
                  </div>
                </article>
                <article class="card card-border bg-base-100/80">
                  <div class="card-body gap-2">
                    <span class="badge badge-accent badge-soft badge-sm">${escapeHtml(messages.pages.home.progressiveEnhancementTitle)}</span>
                    <h3 class="card-title text-base">${escapeHtml(messages.pages.home.awaitingPublication)}</h3>
                    <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.progressiveEnhancementDescription)}</p>
                  </div>
                </article>
              </div>`,
            open: true,
          })}
        </div>
      </article>

    </div>
  </div>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

import { appConfig } from "../config/environment.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import { escapeHtml, type LayoutContext, renderDocument } from "./layout.ts";
import { type OraclePanelState, renderOracleSection } from "./oracle.ts";

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
 * Renders the architecture home page.
 *
 * @param input Shared page input values.
 * @param oraclePanelState Current oracle panel state.
 * @returns Complete HTML document.
 */
export const renderHomePage = (
  input: PageRenderInput,
  oraclePanelState: OraclePanelState,
): string => {
  const { layout } = input;
  const { locale, messages } = layout;
  const runtimeProfile = getAiRuntimeProfile();
  const catalogItems = runtimeProfile.catalog
    .filter((entry) => entry.enabled)
    .map(
      (entry) => `<li class="list-row">
        <span class="font-medium">${escapeHtml(entry.label)}</span>
        <code>${escapeHtml(entry.model)}</code>
      </li>`,
    )
    .join("");
  const flowItems = messages.pages.home.loopSteps
    .map(
      (step, index) =>
        `<li class="step ${index < 2 ? "step-primary" : index === 2 ? "step-secondary" : "step-accent"}">${escapeHtml(step)}</li>`,
    )
    .join("");


  const body = `<section class="hero overflow-hidden rounded-[2rem] border border-base-300/50 bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-6 shadow-xl lg:p-10">
    <div class="hero-content px-0">
      <div class="grid items-end gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div class="max-w-3xl space-y-4 animate-fade-in-up">
          <p class="badge badge-primary badge-soft">${escapeHtml(messages.pages.home.title)}</p>
          <h1 class="text-3xl font-semibold leading-tight lg:text-5xl">${escapeHtml(
            messages.pages.home.heroTitle,
          )}</h1>
          <p class="text-base opacity-90 lg:text-lg">${escapeHtml(messages.pages.home.heroDescription)}</p>
          <div class="flex flex-wrap gap-3">
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary transition-all hover:scale-105">${escapeHtml(messages.pages.home.builderCardCta)}</a>
            <a href="${withLocaleQuery(appRoutes.game, locale)}" class="btn btn-secondary transition-all hover:scale-105">${escapeHtml(messages.pages.home.playerCardCta)}</a>
            <a href="${withLocaleQuery(appConfig.api.docsPath, locale)}" class="btn btn-outline transition-all hover:scale-105">${escapeHtml(messages.pages.home.docsCta)}</a>
          </div>
        </div>
        <div class="glass-card rounded-box p-5 shadow-xl">
          <div class="space-y-3">
            <h2 class="text-lg font-semibold">${escapeHtml(messages.pages.home.statusTitle)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.builderOptionsDescription)}</p>
            <ul class="list rounded-box bg-base-200/40">${catalogItems}</ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="grid gap-4 lg:grid-cols-2 stagger-children">
    <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="card gradient-card-primary shadow-md hover-lift card-glow-primary" aria-label="${escapeHtml(messages.pages.home.builderCardTitle)}">
      <div class="card-body gap-3">
        <div class="flex items-center gap-3">
          <div class="rounded-btn bg-primary/15 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <span class="badge badge-primary badge-soft">${escapeHtml(messages.navigation.builder)}</span>
        </div>
        <h2 class="card-title text-2xl">${escapeHtml(messages.pages.home.builderCardTitle)}</h2>
        <p class="text-base-content/75">${escapeHtml(messages.pages.home.builderCardDescription)}</p>
        <div class="card-actions justify-end">
          <span class="btn btn-primary btn-soft btn-sm">${escapeHtml(messages.pages.home.builderCardCta)}</span>
        </div>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.game, locale)}" class="card gradient-card-secondary shadow-md hover-lift card-glow-secondary" aria-label="${escapeHtml(messages.pages.home.playerCardTitle)}">
      <div class="card-body gap-3">
        <div class="flex items-center gap-3">
          <div class="rounded-btn bg-secondary/15 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span class="badge badge-secondary badge-soft">${escapeHtml(messages.navigation.game)}</span>
        </div>
        <h2 class="card-title text-2xl">${escapeHtml(messages.pages.home.playerCardTitle)}</h2>
        <p class="text-base-content/75">${escapeHtml(messages.pages.home.playerCardDescription)}</p>
        <div class="card-actions justify-end">
          <span class="btn btn-secondary btn-soft btn-sm">${escapeHtml(messages.pages.home.playerCardCta)}</span>
        </div>
      </div>
    </a>
  </section>

  <section id="architecture" class="grid gap-4 md:grid-cols-3 stagger-children">
    <article class="card card-dash shadow-md border-t-4 border-t-primary">
      <div class="card-body">
        <h2 class="card-title"><span aria-hidden="true">🌍</span> ${escapeHtml(messages.pages.home.architectureTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.architectureDescription)}</p>
      </div>
    </article>
    <article class="card card-dash shadow-md border-t-4 border-t-secondary">
      <div class="card-body">
        <h2 class="card-title"><span aria-hidden="true">👤</span> ${escapeHtml(messages.pages.home.reliabilityTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.reliabilityDescription)}</p>
      </div>
    </article>
    <article class="card card-dash shadow-md border-t-4 border-t-accent">
      <div class="card-body">
        <h2 class="card-title"><span aria-hidden="true">✨</span> ${escapeHtml(messages.pages.home.progressiveEnhancementTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.progressiveEnhancementDescription)}</p>
      </div>
    </article>
  </section>

  <section class="glass-card rounded-box shadow-lg">
    <div class="p-6 space-y-5 lg:p-8">
      <div>
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.pages.home.loopTitle)}</h2>
        <p class="text-base-content/70">${escapeHtml(messages.pages.home.loopDescription)}</p>
      </div>
      <div class="overflow-x-auto">
        <ul class="steps min-w-3xl lg:steps-horizontal">${flowItems}</ul>
      </div>
    </div>
  </section>

  ${renderOracleSection(messages, oraclePanelState, locale)}

  <section class="grid gap-4 lg:grid-cols-3 stagger-children">
    <article class="card gradient-card-primary shadow-md hover-lift">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.builderOptionsTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.builderOptionsDescription)}</p>
      </div>
    </article>
    <article class="card gradient-card-secondary shadow-md hover-lift">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.aiLaneTitle)}</h2>
        <p>${escapeHtml(messages.builder.aiLaneDescription)}</p>
      </div>
    </article>
    <article class="card gradient-card-accent shadow-md hover-lift">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.apiSurfaceTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.apiSurfaceDescription)}</p>
      </div>
    </article>
  </section>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

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
  const apiItems = [
    appRoutes.aiStatus,
    appRoutes.aiCatalog,
    appRoutes.aiTranscribe,
    appRoutes.aiSynthesize,
    appRoutes.builderApiScenes,
    appConfig.api.docsPath,
  ]
    .map((route) => `<li class="list-row"><code>${escapeHtml(route)}</code></li>`)
    .join("");

  const body = `<section class="hero overflow-hidden rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-6 shadow-xl lg:p-10">
    <div class="hero-content px-0">
      <div class="grid items-end gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div class="max-w-3xl space-y-4">
          <p class="badge badge-primary badge-soft">${escapeHtml(messages.pages.home.title)}</p>
          <h1 class="text-3xl font-semibold leading-tight lg:text-5xl">${escapeHtml(
            messages.pages.home.heroTitle,
          )}</h1>
          <p class="text-base opacity-90 lg:text-lg">${escapeHtml(messages.pages.home.heroDescription)}</p>
          <div class="flex flex-wrap gap-3">
            <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="btn btn-primary">${escapeHtml(messages.pages.home.builderCardCta)}</a>
            <a href="${withLocaleQuery(appRoutes.game, locale)}" class="btn btn-secondary">${escapeHtml(messages.pages.home.playerCardCta)}</a>
            <a href="${withLocaleQuery(appConfig.api.docsPath, locale)}" class="btn btn-outline">${escapeHtml(messages.pages.home.docsCta)}</a>
          </div>
        </div>
        <div class="card card-border bg-base-100/90 shadow-sm">
          <div class="card-body gap-3">
            <h2 class="card-title">${escapeHtml(messages.pages.home.statusTitle)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.pages.home.builderOptionsDescription)}</p>
            <ul class="list rounded-box bg-base-200/60">${catalogItems}</ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="grid gap-4 lg:grid-cols-2">
    <a href="${withLocaleQuery(appRoutes.builder, locale)}" class="card card-border bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.pages.home.builderCardTitle)}">
      <div class="card-body gap-3">
        <span class="badge badge-primary badge-soft w-max">${escapeHtml(messages.navigation.builder)}</span>
        <h2 class="card-title text-2xl">${escapeHtml(messages.pages.home.builderCardTitle)}</h2>
        <p class="text-base-content/75">${escapeHtml(messages.pages.home.builderCardDescription)}</p>
        <div class="card-actions justify-end">
          <span class="btn btn-primary btn-sm">${escapeHtml(messages.pages.home.builderCardCta)}</span>
        </div>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.game, locale)}" class="card card-border bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.pages.home.playerCardTitle)}">
      <div class="card-body gap-3">
        <span class="badge badge-secondary badge-soft w-max">${escapeHtml(messages.navigation.game)}</span>
        <h2 class="card-title text-2xl">${escapeHtml(messages.pages.home.playerCardTitle)}</h2>
        <p class="text-base-content/75">${escapeHtml(messages.pages.home.playerCardDescription)}</p>
        <div class="card-actions justify-end">
          <span class="btn btn-secondary btn-sm">${escapeHtml(messages.pages.home.playerCardCta)}</span>
        </div>
      </div>
    </a>
  </section>

  <section id="architecture" class="grid gap-4 md:grid-cols-3">
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.architectureTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.architectureDescription)}</p>
      </div>
    </article>
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.reliabilityTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.reliabilityDescription)}</p>
      </div>
    </article>
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.progressiveEnhancementTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.progressiveEnhancementDescription)}</p>
      </div>
    </article>
  </section>

  <section class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-5">
      <div>
        <h2 class="card-title text-2xl">${escapeHtml(messages.pages.home.loopTitle)}</h2>
        <p class="text-base-content/70">${escapeHtml(messages.pages.home.loopDescription)}</p>
      </div>
      <div class="overflow-x-auto">
        <ul class="steps min-w-3xl lg:steps-horizontal">${flowItems}</ul>
      </div>
    </div>
  </section>

  ${renderOracleSection(messages, oraclePanelState, locale)}

  <section class="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.builderOptionsTitle)}</h2>
        <p>${escapeHtml(messages.builder.runtimeLaneDescription)}</p>
      </div>
    </article>
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.aiLaneTitle)}</h2>
        <p>${escapeHtml(messages.builder.aiLaneDescription)}</p>
      </div>
    </article>
    <article class="card card-border bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.apiSurfaceTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.apiSurfaceDescription)}</p>
        <ul class="list rounded-box bg-base-200/60">${apiItems}</ul>
      </div>
    </article>
  </section>

  <section class="grid gap-4 sm:grid-cols-3">
    <article class="card card-border bg-base-100 shadow-sm sm:col-span-3">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.supportingDocsTitle)}</h2>
        <p class="text-base-content/75">${escapeHtml(messages.pages.home.supportingDocsDescription)}</p>
      </div>
    </article>
    <a href="${withLocaleQuery(appRoutes.pitchDeck, locale)}" class="card card-border bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.pitchDeck)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.pitchDeck)}</h2>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.narrativeBible, locale)}" class="card card-border bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.narrativeBible)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.narrativeBible)}</h2>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.developmentPlan, locale)}" class="card card-border bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.developmentPlan)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.developmentPlan)}</h2>
      </div>
    </a>
  </section>`;

  return renderDocument(layout, messages.pages.home.title, body, homePageScripts);
};

/**
 * Renders the pitch deck page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderPitchDeckPage = (input: PageRenderInput): string => {
  const { layout } = input;
  const { messages } = layout;
  const sections = messages.pages.pitchDeck.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.pitchDeck.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.pitchDeck.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderDocument(layout, messages.pages.pitchDeck.title, body);
};

/**
 * Renders the narrative bible page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderNarrativeBiblePage = (input: PageRenderInput): string => {
  const { layout } = input;
  const { messages } = layout;
  const sections = messages.pages.narrativeBible.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.narrativeBible.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.narrativeBible.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderDocument(layout, messages.pages.narrativeBible.title, body);
};

/**
 * Renders the development plan page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderDevelopmentPlanPage = (input: PageRenderInput): string => {
  const { layout } = input;
  const { messages } = layout;
  const sections = messages.pages.developmentPlan.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.developmentPlan.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.developmentPlan.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderDocument(layout, messages.pages.developmentPlan.title, body);
};

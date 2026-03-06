import type { LocaleCode } from "../config/environment.ts";
import { appConfig } from "../config/environment.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { escapeHtml, renderLayout } from "./layout.ts";
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
  readonly locale: LocaleCode;
  readonly messages: Messages;
  readonly currentPathWithQuery: string;
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
  const { locale, messages, currentPathWithQuery } = input;

  const body = `<section class="hero rounded-box border border-base-300 bg-gradient-to-br from-base-200 to-base-100 p-6 lg:p-10">
    <div class="hero-content px-0">
      <div class="max-w-3xl space-y-4">
        <p class="badge badge-primary badge-soft">${escapeHtml(messages.pages.home.title)}</p>
        <h1 class="text-3xl font-semibold leading-tight lg:text-4xl">${escapeHtml(
          messages.pages.home.heroTitle,
        )}</h1>
        <p class="text-base opacity-90">${escapeHtml(messages.pages.home.heroDescription)}</p>
      </div>
    </div>
  </section>

  <section id="architecture" class="grid gap-4 md:grid-cols-3">
    <article class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.architectureTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.architectureDescription)}</p>
      </div>
    </article>
    <article class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.reliabilityTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.reliabilityDescription)}</p>
      </div>
    </article>
    <article class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.pages.home.progressiveEnhancementTitle)}</h2>
        <p>${escapeHtml(messages.pages.home.progressiveEnhancementDescription)}</p>
      </div>
    </article>
  </section>

  ${renderOracleSection(messages, oraclePanelState, locale)}

  <section class="grid gap-4 sm:grid-cols-3">
    <a href="${withLocaleQuery(appRoutes.pitchDeck, locale)}" class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.pitchDeck)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.pitchDeck)}</h2>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.narrativeBible, locale)}" class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.narrativeBible)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.narrativeBible)}</h2>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.developmentPlan, locale)}" class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.developmentPlan)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.developmentPlan)}</h2>
      </div>
    </a>
    <a href="${withLocaleQuery(appRoutes.game, locale)}" class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="${escapeHtml(messages.navigation.game)}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.navigation.game)}</h2>
      </div>
    </a>
  </section>`;

  return renderLayout({
    locale,
    title: messages.pages.home.title,
    messages,
    activeRoute: "home",
    currentPathWithQuery,
    body,
    scripts: homePageScripts,
  });
};

/**
 * Renders the pitch deck page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderPitchDeckPage = (input: PageRenderInput): string => {
  const { locale, messages, currentPathWithQuery } = input;
  const sections = messages.pages.pitchDeck.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.pitchDeck.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.pitchDeck.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderLayout({
    locale,
    title: messages.pages.pitchDeck.title,
    messages,
    activeRoute: "pitchDeck",
    currentPathWithQuery,
    body,
  });
};

/**
 * Renders the narrative bible page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderNarrativeBiblePage = (input: PageRenderInput): string => {
  const { locale, messages, currentPathWithQuery } = input;
  const sections = messages.pages.narrativeBible.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.narrativeBible.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.narrativeBible.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderLayout({
    locale,
    title: messages.pages.narrativeBible.title,
    messages,
    activeRoute: "narrativeBible",
    currentPathWithQuery,
    body,
  });
};

/**
 * Renders the development plan page.
 *
 * @param input Shared page input values.
 * @returns Complete HTML document.
 */
export const renderDevelopmentPlanPage = (input: PageRenderInput): string => {
  const { locale, messages, currentPathWithQuery } = input;
  const sections = messages.pages.developmentPlan.sections
    .map((section) => `<li class="list-row">${escapeHtml(section)}</li>`)
    .join("");

  const body = `<section class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h1 class="card-title text-3xl">${escapeHtml(messages.pages.developmentPlan.title)}</h1>
      <p class="opacity-90">${escapeHtml(messages.pages.developmentPlan.subtitle)}</p>
      <ul class="list bg-base-200 rounded-box p-3">${sections}</ul>
    </div>
  </section>`;

  return renderLayout({
    locale,
    title: messages.pages.developmentPlan.title,
    messages,
    activeRoute: "developmentPlan",
    currentPathWithQuery,
    body,
  });
};

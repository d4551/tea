import { appConfig, type LocaleCode } from "../config/environment.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";

/**
 * Escapes raw text for safe HTML interpolation.
 *
 * @param value Raw text value.
 * @returns Escaped HTML-safe string.
 */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * External script descriptor for feature-scoped page assets.
 */
export interface LayoutScript {
  readonly src: string;
  readonly type?: "module";
}

/**
 * Shared view layout input.
 */
export interface LayoutInput {
  readonly locale: LocaleCode;
  readonly title: string;
  readonly messages: Messages;
  readonly activeRoute: keyof typeof appRoutes;
  readonly currentPathWithQuery: string;
  readonly body: string;
  readonly scripts?: readonly LayoutScript[];
}

/**
 * Renders the shared application layout.
 *
 * @param input Layout values.
 * @returns Full HTML document.
 */
export const renderLayout = (input: LayoutInput): string => {
  const { locale, title, messages, body, activeRoute, currentPathWithQuery, scripts = [] } = input;
  const languageSwitch = locale === "en-US" ? "zh-CN" : "en-US";
  const containerClass = `mx-auto flex w-full ${appConfig.ui.maxContentWidthClass} flex-col gap-8 px-4 pb-16 pt-8 lg:px-8`;
  const pageScripts = scripts
    .map((script) => {
      const typeAttribute = script.type ? ` type="${script.type}"` : "";
      const deferAttribute = script.type === "module" ? "" : " defer";
      return `<script src="${escapeHtml(script.src)}"${typeAttribute}${deferAttribute}></script>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" data-theme="${escapeHtml(appConfig.ui.defaultTheme)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} · ${escapeHtml(messages.metadata.appName)}</title>
    <meta name="description" content="${escapeHtml(messages.metadata.appSubtitle)}" />
    <link rel="stylesheet" href="${escapeHtml(appConfig.stylesheetPath)}" />
    <script src="${escapeHtml(appConfig.htmxScriptPath)}" defer></script>
    ${pageScripts}
  </head>
  <body class="min-h-screen bg-base-100 text-base-content" hx-boost="true">
    <a
      href="#main-content"
      class="sr-only z-50 m-2 inline-flex rounded-md border border-base-content bg-base-100 px-3 py-2 text-sm font-semibold text-base-content focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      ${escapeHtml(messages.common.skipToContent)}
    </a>
    ${renderNavigation(messages, activeRoute, locale, languageSwitch, currentPathWithQuery)}
    <main id="main-content" class="${escapeHtml(containerClass)}">
      ${body}
    </main>
    ${renderFooter(messages, locale)}
  </body>
</html>`;
};

const renderNavigation = (
  messages: Messages,
  activeRoute: keyof typeof appRoutes,
  locale: LocaleCode,
  languageSwitch: LocaleCode,
  currentPathWithQuery: string,
): string => {
  const currentUrl = new URL(currentPathWithQuery, "https://app.local");
  const persistentProjectId = currentUrl.searchParams.get("projectId")?.trim() ?? "";
  const projectScopedRoutes = new Set([appRoutes.builder, appRoutes.game]);
  const navigationItems = [
    {
      key: "home",
      label: messages.navigation.home,
      href: appRoutes.home,
    },
    {
      key: "game",
      label: messages.navigation.game,
      href: appRoutes.game,
    },
    {
      key: "builder",
      label: messages.navigation.builder,
      href: appRoutes.builder,
    },
  ] as const;

  const renderNavItem = (item: (typeof navigationItems)[number]): string => {
    const isActive = item.key === activeRoute;
    const classes = isActive ? "menu-active font-semibold" : "";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    const localizedHref = withLocaleQuery(item.href, locale);
    const href =
      persistentProjectId.length > 0 && projectScopedRoutes.has(item.href)
        ? withQueryParameters(localizedHref, { projectId: persistentProjectId })
        : localizedHref;

    return `<li><a class="${classes}" href="${href}" aria-label="${escapeHtml(item.label)}"${ariaCurrent}>${escapeHtml(item.label)}</a></li>`;
  };

  const desktopItems = navigationItems.map((item) => renderNavItem(item)).join("");
  const mobileItems = navigationItems.map((item) => renderNavItem(item)).join("");
  const localeSwitchButtonText =
    languageSwitch === "en-US"
      ? messages.navigation.localeNameEnglish
      : messages.navigation.localeNameChinese;
  const localeSwitchAriaLabel =
    languageSwitch === "en-US"
      ? messages.navigation.switchToEnglish
      : messages.navigation.switchToChinese;
  const localeSwitchHref = withLocaleQuery(currentPathWithQuery, languageSwitch);

  return `<header class="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur" role="banner">
    <div class="navbar mx-auto w-full ${escapeHtml(appConfig.ui.maxContentWidthClass)} px-4 lg:px-8">
      <div class="navbar-start">
        <details class="dropdown">
          <summary class="btn btn-ghost list-none lg:hidden" aria-label="${escapeHtml(
            messages.common.openMenu,
          )}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </summary>
          <ul
            class="menu menu-sm dropdown-content z-20 mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow"
            aria-label="${escapeHtml(messages.common.mobileNavigation)}"
          >
            ${mobileItems}
          </ul>
        </details>
        <a href="${withLocaleQuery(appRoutes.home, locale)}" class="btn btn-ghost text-lg font-semibold" aria-label="${escapeHtml(messages.metadata.appName)}">
          ${escapeHtml(messages.metadata.appName)}
        </a>
      </div>
      <nav aria-label="${escapeHtml(messages.common.primaryNavigation)}" class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal gap-2 rounded-box bg-base-200/80 px-2 py-1">${desktopItems}</ul>
      </nav>
      <div class="navbar-end">
        <a href="${escapeHtml(localeSwitchHref)}" class="btn btn-outline btn-sm" aria-label="${escapeHtml(
          localeSwitchAriaLabel,
        )}">${escapeHtml(localeSwitchButtonText)}</a>
      </div>
    </div>
  </header>`;
};

const renderFooter = (messages: Messages, locale: LocaleCode): string => {
  const secondaryLinks = [
    {
      label: messages.navigation.pitchDeck,
      href: withLocaleQuery(appRoutes.pitchDeck, locale),
    },
    {
      label: messages.navigation.narrativeBible,
      href: withLocaleQuery(appRoutes.narrativeBible, locale),
    },
    {
      label: messages.navigation.developmentPlan,
      href: withLocaleQuery(appRoutes.developmentPlan, locale),
    },
    {
      label: messages.pages.home.docsCta,
      href: withLocaleQuery(appConfig.api.docsPath, locale),
    },
  ]
    .map(
      (item) =>
        `<a class="link link-hover text-sm" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`,
    )
    .join("");

  return `<footer class="border-t border-base-300 bg-base-200/70">
    <div class="mx-auto flex w-full ${escapeHtml(appConfig.ui.maxContentWidthClass)} flex-col gap-4 px-4 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <p class="text-lg font-semibold">${escapeHtml(messages.footer.title)}</p>
        <p class="text-sm opacity-80">${escapeHtml(messages.footer.copy)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        ${secondaryLinks}
      </div>
    </div>
  </footer>`;
};

import { appConfig, type LocaleCode } from "../config/environment.ts";
import { assetRelativePaths, joinUrlPath } from "../shared/constants/assets.ts";
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
 * Shared route-derived layout context for SSR views.
 */
export interface LayoutContext {
  readonly locale: LocaleCode;
  readonly messages: Messages;
  readonly activeRoute: keyof typeof appRoutes;
  readonly currentPathWithQuery: string;
  readonly persistentProjectId?: string;
}

/**
 * Shared view layout input.
 */
export interface LayoutInput extends LayoutContext {
  readonly title: string;
  readonly body: string;
  readonly scripts?: readonly LayoutScript[];
}

/**
 * Renders the shared application layout from a route-derived context.
 *
 * @param context Shared route-derived layout context.
 * @param title Page title.
 * @param body Page body markup.
 * @param scripts Optional page-scoped scripts.
 * @returns Full HTML document.
 */
export const renderDocument = (
  context: LayoutContext,
  title: string,
  body: string,
  scripts: readonly LayoutScript[] = [],
): string =>
  renderLayout({
    ...context,
    title,
    body,
    scripts,
  });

/**
 * Renders the shared application layout.
 *
 * @param input Layout values.
 * @returns Full HTML document.
 */
export const renderLayout = (input: LayoutInput): string => {
  const {
    locale,
    title,
    messages,
    body,
    activeRoute,
    currentPathWithQuery,
    persistentProjectId,
    scripts = [],
  } = input;
  const languageSwitch = locale === "en-US" ? "zh-CN" : "en-US";
  const containerClass = `mx-auto flex w-full ${appConfig.ui.maxContentWidthClass} flex-col gap-8 px-4 pb-16 pt-8 lg:px-8`;
  const pageScripts = scripts
    .map((script) => {
      const typeAttribute = script.type ? ` type="${script.type}"` : "";
      const deferAttribute = script.type === "module" ? "" : " defer";
      return `<script src="${escapeHtml(script.src)}"${typeAttribute}${deferAttribute}></script>`;
    })
    .join("");
  const boostEnabled = activeRoute === "game" ? "false" : "true";

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" data-theme="${escapeHtml(appConfig.ui.defaultTheme)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} · ${escapeHtml(messages.metadata.appName)}</title>
    <meta name="description" content="${escapeHtml(messages.metadata.appSubtitle)}" />
    <link rel="stylesheet" href="${escapeHtml(appConfig.stylesheetPath)}" />
    <script src="${escapeHtml(appConfig.htmxScriptPath)}" defer></script>
  </head>
  <body class="min-h-screen bg-base-100 text-base-content" hx-boost="${boostEnabled}">
    <a
      href="#main-content"
      class="sr-only z-50 m-2 inline-flex rounded-md border border-base-content bg-base-100 px-3 py-2 text-sm font-semibold text-base-content focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      ${escapeHtml(messages.common.skipToContent)}
    </a>
    ${renderNavigation(
      messages,
      activeRoute,
      locale,
      languageSwitch,
      currentPathWithQuery,
      persistentProjectId ?? "",
    )}
    <main id="main-content" class="${escapeHtml(containerClass)}">
      ${body}
    </main>
    ${renderFooter(messages, locale)}
    <div id="toast-container" class="toast toast-end toast-bottom z-50" aria-live="polite"></div>
    <script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, `${assetRelativePaths.htmxExtensionsOutputDirectory}/server-toast.js`))}" defer></script>
    ${pageScripts}
  </body>
</html>`;
};

const renderNavigation = (
  messages: Messages,
  activeRoute: keyof typeof appRoutes,
  locale: LocaleCode,
  languageSwitch: LocaleCode,
  currentPathWithQuery: string,
  persistentProjectId: string,
): string => {
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

    return `<li><a class="${classes}" href="${escapeHtml(href)}" aria-label="${escapeHtml(item.label)}"${ariaCurrent}>${escapeHtml(item.label)}</a></li>`;
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

  return `<header class="sticky top-0 z-30 border-b border-base-300/50 glass-header" role="banner">
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
            class="menu menu-sm dropdown-content z-20 mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            aria-label="${escapeHtml(messages.common.mobileNavigation)}"
          >
            ${mobileItems}
          </ul>
        </details>
        <a href="${withLocaleQuery(appRoutes.home, locale)}" class="btn btn-ghost gap-1 text-lg font-semibold" aria-label="${escapeHtml(messages.metadata.appName)}">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ${escapeHtml(messages.metadata.appName)}
        </a>
      </div>
      <nav aria-label="${escapeHtml(messages.common.primaryNavigation)}" class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal gap-1 rounded-box bg-base-200/60 px-2 py-1">${desktopItems}</ul>
      </nav>
      <div class="navbar-end gap-2">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1" aria-label="${escapeHtml(
            messages.common.themeLabel,
          )}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span class="hidden sm:inline text-xs">${escapeHtml(messages.common.themeLabel)}</span>
          </div>
          <ul tabindex="-1" class="dropdown-content z-30 w-48 rounded-box border border-base-300 glass-card p-2 shadow-xl">
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="${escapeHtml(messages.common.themeSilk)}"
                value="silk" />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="${escapeHtml(messages.common.themeAutumn)}"
                value="autumn" />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="${escapeHtml(messages.common.themeLotfk)}"
                value="lotfk" />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="${escapeHtml(messages.common.themeLotfkLight)}"
                value="lotfk-light" />
            </li>
          </ul>
        </div>
        <a href="${escapeHtml(localeSwitchHref)}" class="btn btn-outline btn-sm transition-all" aria-label="${escapeHtml(
          localeSwitchAriaLabel,
        )}">${escapeHtml(localeSwitchButtonText)}</a>
      </div>
    </div>
  </header>`;
};

const renderFooter = (messages: Messages, locale: LocaleCode): string => {
  const resourceLinks = [
    {
      label: messages.navigation.builder,
      href: withLocaleQuery(appRoutes.builder, locale),
    },
    {
      label: messages.navigation.game,
      href: withLocaleQuery(appRoutes.game, locale),
    },
    {
      label: messages.pages.home.docsCta,
      href: withLocaleQuery(appConfig.api.docsPath, locale),
    },
  ]
    .map(
      (item) =>
        `<a class="link link-hover" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`,
    )
    .join("");

  return `<footer class="footer sm:footer-horizontal bg-neutral text-neutral-content border-t border-base-300/30 p-6 lg:p-10">
    <nav class="mx-auto w-full ${escapeHtml(appConfig.ui.maxContentWidthClass)}">
      <div class="grid w-full gap-8 sm:grid-cols-[1fr_auto]">
        <aside>
          <p class="footer-title opacity-100">${escapeHtml(messages.footer.title)}</p>
          <p class="text-sm opacity-70">${escapeHtml(messages.footer.copy)}</p>
        </aside>
        <div class="flex flex-wrap items-start gap-x-6 gap-y-2 text-sm">
          ${resourceLinks}
        </div>
      </div>
    </nav>
  </footer>`;
};

import { appConfig, type LocaleCode } from "../config/environment.ts";
import { assetRelativePaths, joinUrlPath } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { type OraclePanelState, renderOracleSection } from "./oracle.ts";

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
/**
 * Single breadcrumb entry for hierarchical navigation.
 */
export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

export interface LayoutContext {
  readonly locale: LocaleCode;
  readonly messages: Messages;
  readonly activeRoute: keyof typeof appRoutes;
  readonly currentPathWithQuery: string;
  readonly persistentProjectId?: string;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly customSidebarHtml?: string;
  readonly hideFooter?: boolean;
  readonly hideTopBar?: boolean;
  readonly oraclePanelState?: OraclePanelState;
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
    breadcrumbs,
    scripts = [],
    customSidebarHtml,
    hideTopBar,
    hideFooter,
  } = input;
  const languageSwitch = locale === "en-US" ? "zh-CN" : "en-US";
  const containerClass = `mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 lg:px-8 py-8`;
  const pageScripts = scripts
    .map((script) => {
      const typeAttribute = script.type ? ` type="${script.type}"` : "";
      const deferAttribute = script.type === "module" ? "" : " defer";
      return `<script src="${escapeHtml(script.src)}"${typeAttribute}${deferAttribute}></script>`;
    })
    .join("");
  const globalEnhancementScripts = [
    assetRelativePaths.htmxExtensionLayoutControlsFile,
    `${assetRelativePaths.htmxExtensionsOutputDirectory}/server-toast.js`,
  ]
    .map((relativePath) => {
      const scriptUrl = joinUrlPath(appConfig.staticAssets.publicPrefix, relativePath);
      return `<script src="${escapeHtml(scriptUrl)}" defer></script>`;
    })
    .join("");
  const boostEnabled = activeRoute === "game" ? "false" : "true";

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" data-theme="${escapeHtml(appConfig.ui.defaultTheme)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="view-transition" content="same-origin" />
    <title>${escapeHtml(title)} · ${escapeHtml(messages.metadata.appName)}</title>
    <meta name="description" content="${escapeHtml(messages.metadata.appSubtitle)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap" />
    <link rel="stylesheet" href="${escapeHtml(appConfig.stylesheetPath)}" />
    <script src="${escapeHtml(appConfig.htmxScriptPath)}" defer></script>
  </head>
  <body class="min-h-screen bg-base-100 text-base-content" hx-boost="${boostEnabled}">
    <a
      href="#main-content"
      class="sr-only z-[100] m-2 inline-flex rounded-md border border-base-content bg-base-100 px-3 py-2 text-sm font-semibold text-base-content focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      ${escapeHtml(messages.common.skipToContent)}
    </a>
    
    <!-- AI Chat Wrapper (Right Drawer) -->
    <div class="drawer drawer-end">
      <input id="ai-chat-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col min-h-screen relative">
        
        <!-- Main Nav Wrapper (Left Drawer) -->
        <div class="drawer lg:drawer-open flex-1">
          <input id="main-nav-drawer" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content flex flex-col w-full max-w-[100vw]">
            
            <!-- Mobile Top Bar & Desktop Breadcrumbs -->
            ${hideTopBar ? "" : renderTopBar(messages, locale, languageSwitch, currentPathWithQuery, breadcrumbs)}
            
            <main id="main-content" class="${escapeHtml(containerClass)} vt-main flex-1">
              ${body}
            </main>
            
            ${hideFooter ? "" : renderFooter(messages, locale)}
          </div>
          
          <!-- Main Nav Sidebar (Left) -->
          <div class="drawer-side z-40">
            <label for="main-nav-drawer" aria-label="${escapeHtml(messages.common.closeSidebar)}" class="drawer-overlay"></label>
            ${
              customSidebarHtml
                ? `${customSidebarHtml}<div class="sr-only">${renderNavigation(messages, activeRoute, locale, persistentProjectId ?? "")}</div>`
                : renderNavigation(messages, activeRoute, locale, persistentProjectId ?? "")
            }
          </div>
        </div>

        <!-- Global FAB for AI Chat -->
        <div class="fab fixed bottom-6 right-6 z-50">
          <button
            type="button"
            class="btn btn-circle btn-primary h-16 w-16 shrink-0 shadow-2xl"
            aria-controls="ai-chat-drawer"
            aria-expanded="false"
            aria-label="${escapeHtml(messages.common.openAiAssistant)}"
            data-drawer-toggle-target="ai-chat-drawer"
            data-drawer-toggle-mode="toggle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </button>
        </div>
      </div>
      
      <!-- AI Chat Sidebar (Right) -->
      <div class="drawer-side z-[60]">
        <label for="ai-chat-drawer" aria-label="${escapeHtml(messages.common.closeAiChat)}" class="drawer-overlay"></label>
        <div class="menu min-h-full w-80 border-l border-base-300 bg-base-100 p-0 text-base-content sm:w-96">
          <div class="flex items-center justify-end border-b border-base-300 px-4 py-3">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              aria-label="${escapeHtml(messages.common.closeAiChat)}"
              data-drawer-toggle-target="ai-chat-drawer"
              data-drawer-toggle-mode="close"
            >
              ${escapeHtml(messages.common.closeAiChat)}
            </button>
          </div>
          ${renderOracleSection(
            messages,
            input.oraclePanelState ?? { state: "idle", mode: "auto", question: "" },
            locale,
          )}
        </div>
      </div>
    </div>
    
    <div id="toast-container" class="toast toast-end toast-bottom z-[100]" aria-live="polite"></div>
    ${globalEnhancementScripts}
    ${pageScripts}
  </body>
</html>`;
};

const renderTopBar = (
  messages: Messages,
  _locale: LocaleCode,
  languageSwitch: LocaleCode,
  currentPathWithQuery: string,
  breadcrumbs?: readonly BreadcrumbItem[],
): string => {
  const localeSwitchButtonText =
    languageSwitch === "en-US"
      ? messages.navigation.localeNameEnglish
      : messages.navigation.localeNameChinese;
  const localeSwitchAriaLabel =
    languageSwitch === "en-US"
      ? messages.navigation.switchToEnglish
      : messages.navigation.switchToChinese;
  const localeSwitchHref = withLocaleQuery(currentPathWithQuery, languageSwitch);

  return `<nav aria-label="${escapeHtml(messages.common.mobileNavigation)}" class="navbar sticky top-0 z-30 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-md px-4">
    <div class="flex-none lg:hidden mr-2">
      <button
        type="button"
        class="btn btn-square btn-ghost btn-sm"
        aria-controls="main-nav-drawer"
        aria-expanded="false"
        aria-label="${escapeHtml(messages.common.openMenu)}"
        data-drawer-toggle-target="main-nav-drawer"
        data-drawer-toggle-mode="toggle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>
    <div class="flex-1">
      ${breadcrumbs && breadcrumbs.length > 0 ? renderBreadcrumbs(messages, breadcrumbs) : `<span class="font-bold text-lg lg:hidden">${escapeHtml(messages.metadata.appName)}</span>`}
    </div>
    <div class="flex-none gap-2">
      ${renderThemeDropdown(messages)}
      <a href="${escapeHtml(localeSwitchHref)}" class="btn btn-outline btn-xs font-medium" aria-label="${escapeHtml(localeSwitchAriaLabel)}">${escapeHtml(localeSwitchButtonText)}</a>
    </div>
  </div>`;
};

const renderThemeDropdown = (messages: Messages): string => {
  return `<details class="dropdown dropdown-end">
    <summary class="btn btn-ghost btn-xs gap-1" aria-label="${escapeHtml(messages.common.themeLabel)}">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
      <span class="hidden sm:inline">${escapeHtml(messages.common.themeLabel)}</span>
    </summary>
    <div class="dropdown-content z-30 mt-4 w-56 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">${escapeHtml(messages.common.themeLabel)}</legend>
        <label class="btn btn-ghost btn-sm justify-start">
          <input type="radio" name="theme-dropdown" class="theme-controller" value="silk" aria-label="${escapeHtml(messages.common.themeSilk)}" />
          <span>${escapeHtml(messages.common.themeSilk)}</span>
        </label>
        <label class="btn btn-ghost btn-sm justify-start">
          <input type="radio" name="theme-dropdown" class="theme-controller" value="autumn" aria-label="${escapeHtml(messages.common.themeAutumn)}" />
          <span>${escapeHtml(messages.common.themeAutumn)}</span>
        </label>
        <label class="btn btn-ghost btn-sm justify-start">
          <input type="radio" name="theme-dropdown" class="theme-controller" value="forge-dark" aria-label="${escapeHtml(messages.common.themeForgeDark)}" />
          <span>${escapeHtml(messages.common.themeForgeDark)}</span>
        </label>
        <label class="btn btn-ghost btn-sm justify-start">
          <input type="radio" name="theme-dropdown" class="theme-controller" value="forge-light" aria-label="${escapeHtml(messages.common.themeForgeLight)}" />
          <span>${escapeHtml(messages.common.themeForgeLight)}</span>
        </label>
      </fieldset>
    </div>
  </details>`;
};

const renderNavigation = (
  messages: Messages,
  activeRoute: keyof typeof appRoutes,
  locale: LocaleCode,
  persistentProjectId: string,
): string => {
  const projectScopedRoutes = new Set([appRoutes.builder, appRoutes.game]);

  const items = [
    {
      key: "home",
      label: messages.navigation.home,
      href: appRoutes.home,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    },
    {
      key: "builder",
      label: messages.builder.scenes,
      href: appRoutes.builder,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    },
    {
      key: "game",
      label: messages.navigation.game,
      href: appRoutes.game,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    },
  ] as const;

  const renderItem = (item: (typeof items)[number]): string => {
    const isActive = item.key === activeRoute;
    const classes = isActive
      ? "active font-bold bg-base-300/50"
      : "font-medium hover:bg-base-300/30";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    const localizedHref = withLocaleQuery(item.href, locale);
    const href =
      persistentProjectId.length > 0 && projectScopedRoutes.has(item.href)
        ? withQueryParameters(localizedHref, { projectId: persistentProjectId })
        : localizedHref;

    return `<li><a class="${classes} flex gap-3 rounded-xl py-3" href="${escapeHtml(href)}" aria-label="${escapeHtml(item.label)}"${ariaCurrent}>${item.icon} ${escapeHtml(item.label)}</a></li>`;
  };

  const listItems = items.map(renderItem).join("");

  return `<nav aria-label="${escapeHtml(messages.common.primaryNavigation)}" class="menu w-72 lg:w-80 min-h-full bg-base-200/80 backdrop-blur-3xl text-base-content border-r border-base-300 p-4 flex flex-col gap-8 shadow-2xl lg:shadow-none">
    <div class="px-2 pt-2">
      <a href="${withLocaleQuery(appRoutes.home, locale)}" class="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity tracking-tight" aria-label="${escapeHtml(messages.metadata.appName)}">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
        ${escapeHtml(messages.metadata.appName)}
      </a>
    </div>
    <ul class="flex flex-col gap-2 flex-1 menu-md">
      ${listItems}
    </ul>
    <div class="mt-auto pt-4 border-t border-base-300/50">
      <div class="bg-base-100/50 rounded-box p-4 border border-base-300/50 flex flex-col gap-1">
        <div class="text-xs font-bold uppercase tracking-widest text-primary/70">${escapeHtml(messages.common.contextLabel)}</div>
        <div class="text-sm font-semibold truncate opacity-80">${persistentProjectId ? escapeHtml(messages.common.projectConfigured) : escapeHtml(messages.common.noProjectBound)}</div>
      </div>
    </div>
  </nav>`;
};

const renderBreadcrumbs = (messages: Messages, items: readonly BreadcrumbItem[]): string => {
  const crumbs = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      if (isLast || !item.href) {
        return `<li><span aria-current="page">${escapeHtml(item.label)}</span></li>`;
      }
      return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `<nav aria-label="${escapeHtml(messages.common.breadcrumbLabel)}" class="breadcrumbs text-sm">
    <ul class="m-0">${crumbs}</ul>
  </nav>`;
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
  const socialLinks = [
    {
      href: appConfig.ui.socialLinks.githubUrl,
      label: messages.common.githubLabel,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
    },
    {
      href: appConfig.ui.socialLinks.discordUrl,
      label: messages.common.discordLabel,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
    },
    {
      href: appConfig.ui.socialLinks.twitterUrl,
      label: messages.common.twitterLabel,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    },
  ]
    .filter(
      (item): item is { readonly href: string; readonly label: string; readonly icon: string } =>
        item.href !== null,
    )
    .map(
      (item) =>
        `<a href="${escapeHtml(item.href)}" class="opacity-70 transition-opacity hover:opacity-100" aria-label="${escapeHtml(item.label)}" rel="noreferrer" target="_blank">${item.icon}</a>`,
    )
    .join("");
  const socialNav =
    socialLinks.length > 0
      ? `<nav aria-label="${escapeHtml(messages.common.socialNavLabel)}" class="flex gap-4">${socialLinks}</nav>`
      : "";

  return `<footer class="bg-neutral text-neutral-content border-t border-base-300/30">
    <div class="footer sm:footer-horizontal mx-auto w-full ${escapeHtml(appConfig.ui.maxContentWidthClass)} p-6 lg:p-10">
      <aside>
        <p class="footer-title flex items-center gap-2 opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          ${escapeHtml(messages.footer.title)}
        </p>
        <p class="text-sm opacity-70">${escapeHtml(messages.footer.copy)}</p>
      </aside>
      <nav class="flex flex-wrap items-start gap-x-6 gap-y-2 text-sm">
        ${resourceLinks}
      </nav>
      ${socialNav}
    </div>
    <div class="footer footer-center p-4 border-t border-base-content/10">
      <p class="text-xs opacity-50">${escapeHtml(messages.footer.copy)}</p>
    </div>
  </footer>`;
};

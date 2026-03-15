import { appConfig, type LocaleCode } from "../config/environment.ts";
import {
  PROJECT_BRAND_FONTS_STYLESHEET_HREF,
  type ProjectBranding,
  resolveProjectBrandingStyleVariables,
} from "../shared/branding/project-branding.ts";

import { assetRelativePaths, joinUrlPath } from "../shared/constants/assets.ts";
import { appRoutes, withLocaleQuery } from "../shared/constants/routes.ts";
import { supportedUiThemes, type UiTheme } from "../shared/constants/ui-theme.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { type OraclePanelState, renderOracleSection } from "./oracle.ts";
import { renderLinkMetadataAttrs } from "./shared/link-attrs.ts";
import {
  buildPublicPrimaryNavigation,
  type NavigationAction,
  type NavigationBreadcrumbItem,
  type NavigationGroup,
  type NavigationItem,
  renderActionDropdown,
  renderBreadcrumbRow,
  renderHeaderNavbar,
  renderMobileDrawerMenu,
} from "./shared/navigation.ts";

export type { OraclePanelState } from "./oracle.ts";

/**
 * Escapes raw text for safe HTML interpolation.
 *
 * @param value Raw text value.
 * @returns Escaped HTML-safe string.
 */
export const escapeHtml = (value: unknown): string =>
  String(value ?? "")
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
 * Progressive-enhancement drawer toggle control rendered as a native label.
 *
 * The associated checkbox keeps DaisyUI drawers usable before the HTMX
 * enhancement layer loads, while `layout-controls` upgrades keyboard and
 * aria-expanded handling once JavaScript is available.
 */
export interface DrawerToggleControlInput {
  readonly targetId: string;
  readonly label: string;
  readonly className: string;
  readonly content: string;
  readonly mode?: "toggle" | "close";
  readonly controls?: string;
  readonly expanded?: boolean;
  readonly hasPopup?: "dialog" | "menu";
}

/**
 * Renders a shared drawer toggle control for DaisyUI drawer shells.
 *
 * @param input Drawer toggle metadata and inner markup.
 * @returns Progressive-enhancement drawer toggle markup.
 */
export const renderDrawerToggleControl = (input: DrawerToggleControlInput): string => {
  const mode = input.mode ?? "toggle";
  const attributes = [
    `for="${escapeHtml(input.targetId)}"`,
    `class="${escapeHtml(input.className)}"`,
    'role="button"',
    'tabindex="0"',
    `aria-controls="${escapeHtml(input.controls ?? input.targetId)}"`,
    `aria-label="${escapeHtml(input.label)}"`,
    `data-drawer-toggle-target="${escapeHtml(input.targetId)}"`,
    `data-drawer-toggle-mode="${mode}"`,
  ];

  if (mode === "toggle") {
    attributes.push(`aria-expanded="${String(input.expanded ?? false)}"`);
  }

  if (input.hasPopup) {
    attributes.push(`aria-haspopup="${escapeHtml(input.hasPopup)}"`);
  }

  return `<label ${attributes.join(" ")}>${input.content}</label>`;
};

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
  readonly brand?: ProjectBranding;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly customSidebarHtml?: string;
  readonly hideFooter?: boolean;
  readonly hideTopBar?: boolean;
  readonly isHtmxRequest?: boolean;
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
): string => {
  if (context.isHtmxRequest) {
    const baseContainer =
      "mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 lg:px-8 py-6 lg:py-8";
    const layoutModifier =
      context.activeRoute === "game"
        ? "game-page-layout items-start"
        : "layout-asymmetric gap-8 lg:gap-12";
    const containerClass = `${baseContainer} vt-main flex-1 ${layoutModifier}`;

    return `<title>${escapeHtml(title)} · ${escapeHtml(context.brand?.appName ?? context.messages.metadata.appName)}</title><main id="main-content" tabindex="-1" class="${escapeHtml(`${containerClass} min-w-0 section-stack`)}">${body}</main>`;
  }

  return renderLayout({
    ...context,
    title,
    body,
    scripts,
  });
};

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
    brand,
    breadcrumbs,
    scripts = [],
    customSidebarHtml,
    hideTopBar,
    hideFooter,
    oraclePanelState = {
      state: "idle",
      mode: "auto",
      question: "",
    },
  } = input;
  const isOracleDrawerOpen =
    oraclePanelState.state !== "idle" || oraclePanelState.question.trim().length > 0;
  const languageSwitch = locale === "en-US" ? "zh-CN" : "en-US";
  const baseContainer =
    "mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 lg:px-8 py-6 lg:py-8";
  const layoutModifier =
    activeRoute === "game" ? "game-page-layout items-start" : "layout-asymmetric gap-8 lg:gap-12";
  const containerClass = `${baseContainer} vt-main flex-1 ${layoutModifier}`;
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
    `${assetRelativePaths.clientModulesOutputDirectory}/scene-editor-tabs.js`,
  ]
    .map((relativePath) => {
      const scriptUrl = joinUrlPath(appConfig.staticAssets.publicPrefix, relativePath);
      return `<script src="${escapeHtml(scriptUrl)}" type="module"></script>`;
    })
    .join("");
  const boostEnabled = activeRoute === "game" ? "false" : "true";
  const publicPrimaryItems = buildPublicPrimaryNavigation(
    locale,
    activeRoute,
    {
      home: messages.navigation.home,
      controlPlane: messages.navigation.controlPlane,
      builder: messages.navigation.builder,
      game: messages.navigation.game,
    },
    {
      home: iconHome(),
      controlPlane: iconControlPlane(),
      builder: iconBuilder(),
      game: iconGame(),
    },
    persistentProjectId,
  );
  const publicNavigationGroups: readonly NavigationGroup[] = [
    {
      title: messages.common.primaryNavigation,
      items: publicPrimaryItems,
    },
  ];
  const drawerClassName = customSidebarHtml ? "drawer lg:drawer-open flex-1" : "drawer flex-1";
  const appName = brand?.appName ?? messages.metadata.appName;
  const appSubtitle = brand?.appSubtitle ?? messages.metadata.appSubtitle;
  const documentTheme = brand?.surfaceTheme ?? appConfig.ui.defaultTheme;
  const englishHref = withLocaleQuery(currentPathWithQuery, "en-US");
  const chineseHref = withLocaleQuery(currentPathWithQuery, "zh-CN");
  const bodyStyleAttribute = brand
    ? ` style="${escapeHtml(resolveProjectBrandingStyleVariables(brand))}"`
    : "";
  const themeLockAttribute = brand ? ' data-theme-lock="project"' : "";
  const breadcrumbItems: readonly NavigationBreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs.map((item) => ({ label: item.label, href: item.href }))
      : [{ label: appName }];

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" data-theme="${escapeHtml(documentTheme)}"${themeLockAttribute}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="view-transition" content="same-origin" />
    <title>${escapeHtml(title)} · ${escapeHtml(appName)}</title>
    <meta name="description" content="${escapeHtml(appSubtitle)}" />
    <link rel="alternate" hreflang="en-US" href="${escapeHtml(englishHref)}" />
    <link rel="alternate" hreflang="zh-CN" href="${escapeHtml(chineseHref)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(englishHref)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${escapeHtml(PROJECT_BRAND_FONTS_STYLESHEET_HREF)}" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="${escapeHtml(PROJECT_BRAND_FONTS_STYLESHEET_HREF)}" /></noscript>
    <link rel="stylesheet" href="${escapeHtml(appConfig.stylesheetPath)}" />
    <script src="${escapeHtml(appConfig.htmxScriptPath)}" defer></script>
    <script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, assetRelativePaths.htmxExtensionSseFile))}" defer></script>
    <script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, assetRelativePaths.htmxExtensionOracleIndicatorFile))}" type="module"></script>
    <script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, assetRelativePaths.htmxExtensionFocusPanelFile))}" type="module"></script>
  </head>
  <body class="min-h-screen bg-base-100 text-base-content antialiased" hx-boost="${boostEnabled}" hx-target="#main-content" hx-select="#main-content" hx-ext="layout-controls,focus-panel"${bodyStyleAttribute}>
    <a
      href="#main-content"
      class="sr-only z-[100] m-2 inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-base-100 px-4 py-3 text-sm font-semibold text-primary shadow-lg transition-all duration-200 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary hover:text-primary-content"
      aria-label="${escapeHtml(messages.common.skipToContent)}"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      ${escapeHtml(messages.common.skipToContent)}
    </a>
    
    <!-- AI Chat Wrapper (Right Drawer) -->
    <div class="drawer drawer-end touch-pan-y">
      <input
        id="ai-chat-drawer"
        type="checkbox"
        class="drawer-toggle"
        aria-label="${escapeHtml(messages.common.openAiAssistant)}"
        ${isOracleDrawerOpen ? "checked" : ""}
      />
      <div class="drawer-content relative flex min-h-screen flex-col">

        <!-- Main Nav Wrapper (Left Drawer) -->
        <div class="${escapeHtml(`${drawerClassName} min-w-0`)}">
          <input id="main-nav-drawer" type="checkbox" class="drawer-toggle" aria-label="${escapeHtml(messages.common.openMenu)}" />
          <div class="drawer-content flex w-full max-w-[100vw] min-w-0 flex-col">

            ${
              hideTopBar
                ? ""
                : `${renderTopBar(messages, locale, languageSwitch, currentPathWithQuery, publicPrimaryItems, isOracleDrawerOpen, brand)}${renderBreadcrumbRow(messages.common.breadcrumbLabel, breadcrumbItems)}`
            }

            <main id="main-content" tabindex="-1" class="${escapeHtml(`${containerClass} min-w-0 section-stack`)}">
              ${body}
            </main>

            ${hideFooter ? "" : renderFooter(messages, locale)}
          </div>

          <!-- Main Nav Sidebar (Left) -->
          <div class="drawer-side z-40 ${customSidebarHtml ? "is-drawer-close:overflow-visible" : ""}">
            <label for="main-nav-drawer" aria-label="${escapeHtml(messages.common.closeSidebar)}" class="drawer-overlay"></label>
            ${
              customSidebarHtml
                ? customSidebarHtml
                : renderMobileDrawerMenu(publicNavigationGroups, {
                    ariaLabel: messages.common.mobileNavigation,
                    brandHtml: renderBrand(messages, locale, brand),
                  })
            }
          </div>
        </div>

        <!-- Global FAB for AI Chat (z-[90] ensures visibility above game canvas) -->
        <div class="fab fixed right-6 ${activeRoute === "builder" ? "bottom-24 sm:bottom-6" : "bottom-6"} z-[90]">
          ${renderDrawerToggleControl({
            targetId: "ai-chat-drawer",
            label: messages.common.openAiAssistant,
            className:
              "btn btn-circle btn-primary drawer-button h-14 w-14 sm:h-16 sm:w-16 shrink-0 shadow-2xl fab-attention-pulse",
            hasPopup: "dialog",
            expanded: isOracleDrawerOpen,
            content:
              '<svg xmlns="http://www.w3.org/2000/svg" class="size-6 sm:size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
          })}
        </div>
      </div>
      
      <!-- AI Chat Sidebar (Right) (z-[95] ensures visibility above game canvas) -->
      <div class="drawer-side z-[95]">
        <label for="ai-chat-drawer" aria-label="${escapeHtml(messages.common.closeAiChat)}" class="drawer-overlay"></label>
        <aside class="surface-shell surface-section flex min-h-full w-80 flex-col border-l border-base-300 bg-base-100 text-base-content sm:w-96" role="dialog" aria-modal="false" aria-label="${escapeHtml(messages.common.openAiAssistant)}">
          <div class="flex shrink-0 items-center justify-end border-b border-base-300 px-4 py-3">
            ${renderDrawerToggleControl({
              targetId: "ai-chat-drawer",
              label: messages.common.closeAiChat,
              className: "btn btn-ghost btn-sm",
              mode: "close",
              content: escapeHtml(messages.common.closeAiChat),
            })}
          </div>
          <div class="surface-scroll surface-scroll-y surface-scroll-fade-y touch-pan-y flex-1 overflow-y-auto p-4">
          ${renderOracleSection(messages, oraclePanelState, locale, {
            variant: "drawer",
            pageContext: {
              currentPath: currentPathWithQuery,
              activeRoute,
              projectId: persistentProjectId,
            },
          })}
          </div>
        </aside>
      </div>
    </div>
    
    <div id="toast-container" class="toast toast-end toast-bottom z-[100]" aria-live="polite" data-fallback-error-message="${escapeHtml(messages.common.requestFailed)}"></div>
    ${globalEnhancementScripts}
    ${pageScripts}
  </body>
</html>`;
};

const renderTopBar = (
  messages: Messages,
  locale: LocaleCode,
  languageSwitch: LocaleCode,
  currentPathWithQuery: string,
  navigationItems: readonly NavigationItem[],
  isOracleDrawerOpen: boolean,
  brand?: ProjectBranding,
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
  const headerActions: readonly NavigationAction[] = [
    {
      key: "locale",
      label: localeSwitchAriaLabel,
      href: localeSwitchHref,
      linkLanguage: languageSwitch,
      className: "btn btn-outline btn-sm font-medium",
      content: escapeHtml(localeSwitchButtonText),
    },
    {
      key: "theme",
      label: messages.common.themeLabel,
      html: renderThemeDropdown(messages),
      content: "",
    },
    {
      key: "ai",
      label: messages.common.openAiAssistant,
      className: "btn btn-primary btn-sm gap-2",
      hasPopup: "dialog",
      drawerToggle: {
        targetId: "ai-chat-drawer",
        expanded: isOracleDrawerOpen,
      },
      content: `${iconAiSpark()}<span class="hidden sm:inline">${escapeHtml(messages.common.openAiAssistant)}</span>`,
    },
  ];

  return `<div class="sticky top-0 z-30">
    ${renderHeaderNavbar(renderBrand(messages, locale, brand), navigationItems, headerActions, {
      ariaLabel: messages.common.primaryNavigation,
      className:
        "navbar surface-tappable navbar-glass w-full border-b border-base-300/80 bg-base-100/88 px-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/72 sm:px-4 lg:px-8",
      mobileLead: `<div class="lg:hidden">${renderDrawerToggleControl({
        targetId: "main-nav-drawer",
        label: messages.common.openMenu,
        className: "btn btn-square btn-ghost",
        content: iconMenu(),
      })}</div>`,
    })}
  </div>`;
};

const renderThemeDropdown = (messages: Messages): string => {
  const themeItems = supportedUiThemes.map((theme) => {
    const label =
      theme === "tea-light" ? messages.common.themeTeaLight : messages.common.themeTeaDark;

    return {
      key: theme,
      label,
      contentHtml: `<label class="btn btn-ghost btn-sm justify-start gap-2">
          <input type="radio" name="theme-dropdown" class="theme-controller" value="${escapeHtml(theme)}" aria-label="${escapeHtml(label)}" />
          <span>${escapeHtml(label)}</span>
        </label>`,
    };
  }) satisfies readonly {
    readonly key: UiTheme;
    readonly label: string;
    readonly contentHtml: string;
  }[];

  return renderActionDropdown(
    messages.common.themeLabel,
    `<span class="btn btn-ghost btn-sm gap-2">
      <span class="hidden sm:inline">${escapeHtml(messages.common.themeLabel)}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2M12 19v2M5.64 5.64l1.41 1.42M16.95 16.96l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.04l1.41-1.41M12 9a3 3 0 100 6 3 3 0 000-6z" /></svg>
    </span>`,
    themeItems,
    {
      align: "end",
      widthClass: "w-48",
      menuClassName: "p-2",
    },
  );
};

const renderBrand = (messages: Messages, locale: LocaleCode, brand?: ProjectBranding): string =>
  `<a href="${withLocaleQuery(appRoutes.home, locale)}" class="btn btn-ghost px-2 text-base font-bold tracking-tight gap-2 normal-case">
    ${
      brand?.logoImagePath
        ? `<span class="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm"><img src="${escapeHtml(brand.logoImagePath)}" alt="${escapeHtml(brand.appName)}" class="size-full object-cover" /></span>`
        : `<span class="rounded-lg bg-gradient-to-br from-primary to-secondary px-2 py-1 text-lg leading-none text-primary-content" aria-hidden="true">${escapeHtml(brand?.logoMark ?? "🍵")}</span>`
    }
    <span>${escapeHtml(brand?.appName ?? messages.metadata.appName)}</span>
  </a>`;

const iconMenu = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4" aria-hidden="true"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>';

const iconHome = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>';

const iconBuilder = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>';

const iconControlPlane = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4" aria-hidden="true"><path d="M4 7h16"></path><path d="M4 12h10"></path><path d="M4 17h16"></path><circle cx="17" cy="12" r="3"></circle></svg>';

const iconGame = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';

const iconAiSpark = (): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>';

const renderFooter = (messages: Messages, locale: LocaleCode): string => {
  const resourceLinks = [
    {
      label: messages.navigation.controlPlane,
      href: withLocaleQuery(appRoutes.platformGames, locale),
    },
    {
      label: messages.navigation.builder,
      href: withLocaleQuery(appRoutes.builder, locale),
    },
    {
      label: messages.navigation.game,
      href: withLocaleQuery(appRoutes.home, locale),
    },
    {
      label: messages.pages.home.docsCta,
      href: withLocaleQuery(appConfig.api.docsPath, locale),
    },
  ]
    .map(
      (item) =>
        `<a class="link link-hover"${renderLinkMetadataAttrs({
          href: item.href,
          ariaLabel: item.label,
          linkLanguage: locale,
        })}>${escapeHtml(item.label)}</a>`,
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
      ? `<nav aria-label="${escapeHtml(messages.common.socialNavLabel)}" class="grid grid-flow-col gap-3">${socialLinks}</nav>`
      : "";

  return `<footer class="border-t border-base-300/30 bg-neutral text-neutral-content sm:footer-horizontal" style="border-image: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent)) 1">
    <div class="footer mx-auto w-full ${escapeHtml(appConfig.ui.maxContentWidthClass)} gap-8 p-6 lg:p-8">
      <aside>
        <div class="footer-title flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          ${escapeHtml(messages.footer.title)}
        </div>
        <p class="text-xs opacity-70 max-w-xs leading-relaxed">${escapeHtml(messages.footer.copy)}</p>
      </aside>
      <nav aria-label="${escapeHtml(messages.common.resourcesNavLabel)}">
        <h6 class="footer-title">${escapeHtml(messages.common.resourcesNavLabel)}</h6>
        ${resourceLinks}
      </nav>
      <nav aria-label="${escapeHtml(messages.common.socialNavLabel)}">
        <h6 class="footer-title">${escapeHtml(messages.common.socialNavLabel)}</h6>
        ${socialNav}
      </nav>
    </div>
    <div class="footer footer-center p-4 border-t border-base-content/10">
      <p class="text-xs opacity-50">${escapeHtml(messages.footer.copy)}</p>
    </div>
  </footer>`;
};

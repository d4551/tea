/**
 * Builder Layout
 *
 * Server-rendered DaisyUI drawer layout for the builder workspace.
 * Provides persistent project chrome plus sidebar navigation.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml, renderDrawerToggleControl } from "../layout.ts";
import { spinnerClasses } from "../shared/ui-components.ts";
import {
  iconAi,
  iconAssets,
  iconAutomation,
  iconDashboard,
  iconDialogue,
  iconMechanics,
  iconMenu,
  iconNpcs,
  iconPlay,
  iconScenes,
} from "./builder-icons.ts";

/**
 * Project summary used by the persistent builder chrome.
 */
export interface BuilderChromeProject {
  /** Stable project identifier. */
  readonly id: string;
  /** Current mutable draft version. */
  readonly version: number;
  /** Latest immutable release version. */
  readonly latestReleaseVersion: number;
  /** Currently published immutable release version. */
  readonly publishedReleaseVersion: number | null;
  /** Whether any release is published now. */
  readonly published: boolean;
  /** Last mutation time in epoch milliseconds. */
  readonly lastUpdatedAtMs: number;
}

/**
 * Layout props for the builder shell.
 */
export interface BuilderLayoutProps {
  /** Active locale. */
  readonly locale: LocaleCode;
  /** Localized messages. */
  readonly messages: Messages;
  /** Active tab key. */
  readonly activeTab: string;
  /** Current route pathname without query string. */
  readonly currentPath: string;
  /** Project id from the current route context. */
  readonly projectId: string;
  /** Current project snapshot, if resolved. */
  readonly project: BuilderChromeProject | null;
  /** Inner builder panel body. */
  readonly body: string;
  /** Optional navigation badge counts by section key. */
  readonly navCounts?: Readonly<Record<string, number>>;
}

/**
 * Sidebar navigation items for the builder.
 */
/**
 * Sidebar navigation item descriptor.
 */
interface BuilderNavItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly icon: () => string;
}

/**
 * Builds the ordered list of sidebar navigation items.
 *
 * @param messages Localized messages.
 * @returns Array of navigation item descriptors.
 */
const builderNavItems = (messages: Messages): readonly BuilderNavItem[] => [
  {
    key: "dashboard",
    label: messages.builder.dashboard,
    href: appRoutes.builder,
    icon: iconDashboard,
  },
  {
    key: "scenes",
    label: messages.builder.scenes,
    href: appRoutes.builderScenes,
    icon: iconScenes,
  },
  { key: "npcs", label: messages.builder.npcs, href: appRoutes.builderNpcs, icon: iconNpcs },
  {
    key: "dialogue",
    label: messages.builder.dialogue,
    href: appRoutes.builderDialogue,
    icon: iconDialogue,
  },
  {
    key: "assets",
    label: messages.builder.assets,
    href: appRoutes.builderAssets,
    icon: iconAssets,
  },
  {
    key: "mechanics",
    label: messages.builder.mechanics,
    href: appRoutes.builderMechanics,
    icon: iconMechanics,
  },
  {
    key: "automation",
    label: messages.builder.automation,
    href: appRoutes.builderAutomation,
    icon: iconAutomation,
  },
  { key: "ai", label: messages.builder.ai, href: appRoutes.builderAi, icon: iconAi },
];

const withBuilderQuery = (path: string, locale: LocaleCode, projectId: string): string =>
  withQueryParameters(path, {
    lang: locale,
    projectId,
  });

const _formatProjectTimestamp = (locale: LocaleCode, timestamp: number): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

/**
 * Renders a compact project bar for the builder header.
 *
 * Replaces the old full-page project shell with a single-line bar showing
 * project identity, status, and key actions. Detailed stats live on the
 * dashboard only.
 *
 * @param messages Localized messages.
 * @param locale Active locale.
 * @param projectId Requested project id.
 * @param currentPath Current builder pathname.
 * @param project Current project snapshot if available.
 * @returns HTML string for the compact project bar.
 */
export const renderBuilderProjectShell = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  currentPath: string,
  project: BuilderChromeProject | null,
): string => {
  const switchAction = withQueryParameters(currentPath, { lang: locale });
  const createAction = appRoutes.builderApiProjects;
  const playHref =
    project && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : null;
  const publishAction =
    project !== null
      ? `${appRoutes.builderApiProjects}/${encodeURIComponent(project.id)}/publish`
      : null;
  const statusLabel =
    project?.publishedReleaseVersion !== null
      ? messages.builder.projectStatusPublished
      : project
        ? messages.builder.projectStatusUnpublished
        : messages.builder.projectStatusDraft;
  const statusTone = project?.publishedReleaseVersion !== null ? "badge-success" : "badge-warning";

  const publishForm =
    project === null || publishAction === null
      ? ""
      : `<form hx-patch="${escapeHtml(publishAction)}" hx-target="#builder-project-shell" hx-swap="outerHTML" hx-disabled-elt="button" hx-indicator="#publish-spinner" class="contents">
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <input type="hidden" name="currentPath" value="${escapeHtml(currentPath)}" />
          <input type="hidden" name="published" value="${project.publishedReleaseVersion === null ? "true" : "false"}" />
          <button type="submit" class="btn ${project.publishedReleaseVersion === null ? "btn-primary" : "btn-warning"} btn-xs" aria-label="${escapeHtml(project.publishedReleaseVersion === null ? messages.builder.publishProject : messages.builder.unpublishProject)}">
            ${escapeHtml(project.publishedReleaseVersion === null ? messages.builder.publishProject : messages.builder.unpublishProject)}
          </button>
          <span id="publish-spinner" class="${spinnerClasses.xs}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </form>`;

  const playBtn =
    playHref === null
      ? ""
      : `<a href="${escapeHtml(playHref)}" class="btn btn-secondary btn-xs" aria-label="${escapeHtml(messages.builder.playPublishedBuild)}">${escapeHtml(messages.builder.playPublishedBuild)}</a>`;

  return `<section id="builder-project-shell" class="border-b border-base-300/80 bg-base-100/80 backdrop-blur">
    <div class="flex flex-wrap items-center gap-3 px-6 py-2.5">
      <span class="font-semibold text-sm">${escapeHtml(project?.id ?? projectId)}</span>
      <span class="badge ${statusTone} badge-soft badge-xs">${escapeHtml(statusLabel)}</span>
      ${
        project !== null
          ? `<span class="text-xs text-base-content/50">${escapeHtml(messages.builder.versionPrefix)}${project.version}</span>`
          : ""
      }
      <div class="flex-1"></div>
      <div class="flex items-center gap-2">
        ${publishForm}
        ${playBtn}
        <details class="dropdown dropdown-end">
          <summary class="btn btn-ghost btn-xs" aria-label="${escapeHtml(messages.builder.switchProject)}">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
          </summary>
          <div class="dropdown-content z-10 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-4 shadow-xl">
            <div class="space-y-4">
              <form method="get" action="${escapeHtml(switchAction)}" class="space-y-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend text-xs">${escapeHtml(messages.builder.switchProject)}</legend>
                  <input name="projectId" type="text" value="${escapeHtml(project?.id ?? projectId)}" class="input w-full input-sm" placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.projectIdLabel)}" />
                  <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
                  <button type="submit" class="btn btn-outline btn-xs w-full" aria-label="${escapeHtml(messages.builder.switchProject)}">${escapeHtml(messages.builder.switchProject)}</button>
                </fieldset>
              </form>
              <div class="divider my-0"></div>
              <form hx-post="${escapeHtml(createAction)}" hx-indicator="#builder-project-create-spinner" hx-disabled-elt="button, input, select, textarea" class="space-y-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend text-xs">${escapeHtml(messages.builder.createProject)}</legend>
                  <input name="projectId" type="text" class="input w-full input-sm" required minlength="1" maxlength="64" placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.projectIdLabel)}" />
                  <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                  <input type="hidden" name="redirectPath" value="${escapeHtml(currentPath)}" />
                  <div class="flex items-center gap-2">
                    <button type="submit" class="btn btn-primary btn-xs w-full" aria-label="${escapeHtml(messages.builder.createProject)}">${escapeHtml(messages.builder.createProject)}</button>
                    <span id="builder-project-create-spinner" class="${spinnerClasses.xs}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>`;
};

/**
 * Renders the builder drawer layout wrapping page content.
 *
 * @param props Layout inputs.
 * @returns HTML string with DaisyUI drawer and sidebar navigation.
 */
export const renderBuilderSidebar = (props: BuilderLayoutProps): string => {
  const { locale, messages, activeTab, projectId, project, navCounts } = props;
  const navItems = builderNavItems(messages);

  const renderNavItem = (item: BuilderNavItem): string => {
    const isActive = item.key === activeTab;
    const activeClass = isActive
      ? "menu-active bg-primary/12 text-primary font-semibold is-drawer-open:bg-primary/10"
      : "";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    const href = withBuilderQuery(item.href, locale, project?.id ?? projectId);
    const count = navCounts?.[item.key];
    return `<li>
      <a class="is-drawer-close:tooltip is-drawer-close:tooltip-right${isActive ? " active" : ""} ${activeClass}" href="${escapeHtml(href)}"${ariaCurrent}
         aria-label="${escapeHtml(item.label)}" data-tip="${escapeHtml(item.label)}"
         hx-get="${escapeHtml(href)}" hx-target="#main-content" hx-push-url="true" hx-swap="innerHTML">
        ${item.icon()}
        <span class="menu-item-label is-drawer-close:hidden">${escapeHtml(item.label)}</span>
        ${count !== undefined ? `<span class="badge badge-xs badge-neutral is-drawer-close:hidden">${count}</span>` : ""}
      </a>
    </li>`;
  };

  const contentItems = navItems.slice(1, 5).map(renderNavItem).join("");
  const systemsItems = navItems.slice(5).map(renderNavItem).join("");
  const dashboard = navItems[0];
  const sidebarItems = `${dashboard ? renderNavItem(dashboard) : ""}<li class="menu-title"><span class="is-drawer-close:hidden">${escapeHtml(messages.builder.navGroupContent)}</span></li>${contentItems}<li class="menu-title"><span class="is-drawer-close:hidden">${escapeHtml(messages.builder.navGroupSystems)}</span></li>${systemsItems}`;

  return `
    <aside class="flex min-h-full flex-col items-start bg-base-200/85 backdrop-blur is-drawer-close:w-14 is-drawer-open:w-72 is-drawer-close:overflow-visible border-r border-base-300/70" aria-label="${escapeHtml(messages.builder.title)}">
      <div class="w-full p-3 is-drawer-close:p-2 border-b border-base-300">
        <a href="${escapeHtml(withQueryParameters(appRoutes.home, { lang: locale }))}" class="is-drawer-close:tooltip is-drawer-close:tooltip-right group flex items-center gap-2 px-2 py-1 text-xl font-bold" data-tip="${escapeHtml(messages.metadata.appName)}" aria-label="${escapeHtml(messages.metadata.appName)}">
          <span class="inline-flex size-8 items-center justify-center rounded-xl bg-primary/15 text-lg shadow-sm shadow-primary/30" aria-hidden="true">🍵</span>
          <span class="is-drawer-close:hidden">${escapeHtml(messages.metadata.appName)}</span>
          <span class="is-drawer-close:hidden ml-auto rounded-full border border-primary/30 px-2 py-1 text-xs uppercase tracking-[0.18em] text-primary/85">v1</span>
        </a>
      </div>

      <div class="w-full p-3 is-drawer-close:p-2 border-b border-base-300/70">
        <div class="is-drawer-close:justify-center flex items-center gap-2 rounded-lg bg-base-100/60 px-2 py-2 is-drawer-close:py-1">
          <span class="status ${project === null ? "status-warning" : "status-success"} status-xs"></span>
          <span class="text-sm font-medium truncate is-drawer-close:hidden">${escapeHtml(project === null ? messages.common.noProjectBound : messages.common.projectConfigured)}</span>
        </div>
      </div>

      <ul class="menu w-full grow gap-1 px-2">
        ${sidebarItems}
      </ul>

      <div class="w-full p-3 is-drawer-close:p-2 border-t border-base-300/70">
        <a href="${escapeHtml(withQueryParameters(appRoutes.home, { lang: locale }))}" class="btn btn-outline btn-block btn-sm gap-2 is-drawer-close:btn-square" aria-label="${escapeHtml(messages.builder.exitBuilder)}">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span class="is-drawer-close:hidden">${escapeHtml(messages.builder.exitBuilder)}</span>
        </a>
      </div>
    </aside>
  `;
};

export const renderBuilderLayout = (props: BuilderLayoutProps): string => {
  const { locale, messages, projectId, project, currentPath, body, activeTab } = props;

  const playHref =
    project !== null && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : withBuilderQuery(appRoutes.game, locale, project?.id ?? projectId);

  return `
    <div class="flex min-h-[calc(100vh-4rem)] flex-col">

      <!-- Mobile Builder Top Bar -->
      <div class="flex flex-col flex-1 w-full max-w-[100vw]">
        <nav class="navbar bg-base-100/90 border-b border-base-300/80 lg:hidden backdrop-blur" role="navigation" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="flex-none">
            ${renderDrawerToggleControl({
              targetId: "main-nav-drawer",
              label: messages.common.openMenu,
              className: "btn btn-square btn-ghost",
              content: iconMenu(),
            })}
          </div>
          <div class="flex-1">
            <span class="text-heading-3 font-semibold">${escapeHtml(messages.builder.title)}</span>
          </div>
          <div class="flex-none">
            <a href="${escapeHtml(playHref)}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.navigation.game)}">
              ${iconPlay()} <span class="hidden sm:inline">${escapeHtml(messages.navigation.game)}</span>
            </a>
          </div>
        </nav>

        ${renderBuilderProjectShell(messages, locale, projectId, currentPath, project)}
        <div id="builder-content" class="flex-1 p-4" role="region" aria-live="polite">
          ${body}
        </div>

        <footer class="sticky bottom-0 z-40 border-t border-base-300/80 bg-base-100/90 backdrop-blur px-4 py-2" role="status" aria-label="${escapeHtml(messages.builder.statusBarProject)}">
          <div class="flex flex-wrap items-center gap-4 text-xs text-base-content/70">
            <div class="flex items-center gap-1.5">
              <span class="status status-primary"></span>
              <span class="font-medium">${escapeHtml(messages.builder.statusBarProject)}:</span>
              <span>${escapeHtml(project?.id ?? projectId)}</span>
            </div>
            <div class="divider divider-horizontal mx-0 h-4"></div>
            <div class="flex items-center gap-1.5"
              hx-ext="sse"
              sse-connect="${escapeHtml(appRoutes.aiHealthStream)}?locale=${escapeHtml(locale)}"
              sse-swap="health"
              hx-swap="innerHTML"
            >
              <span class="status status-warning"></span>
              <span class="font-medium">${escapeHtml(messages.builder.statusBarAi)}:</span>
              <span>${escapeHtml(messages.ai.statusUnavailable)}</span>
            </div>
            <div class="flex-1"></div>
            <div class="flex items-center gap-1.5">
              <span class="font-medium">${escapeHtml(messages.builder.statusBarJobs)}:</span>
              <span class="badge badge-ghost badge-xs">0</span>
            </div>
          </div>
        </footer>
        <nav class="dock dock-sm bg-base-100/90 border-t border-base-300/80 lg:hidden" aria-label="${escapeHtml(messages.builder.title)}">
          <a href="${escapeHtml(withBuilderQuery(appRoutes.builder, locale, project?.id ?? projectId))}" class="dock-item ${activeTab === "dashboard" ? "dock-active" : ""}" aria-label="${escapeHtml(messages.builder.dashboard)}">
            ${iconDashboard()}
            <span class="dock-label">${escapeHtml(messages.builder.dashboard)}</span>
          </a>
          <a href="${escapeHtml(withBuilderQuery(appRoutes.builderScenes, locale, project?.id ?? projectId))}" class="dock-item ${activeTab === "scenes" ? "dock-active" : ""}" aria-label="${escapeHtml(messages.builder.scenes)}">
            ${iconScenes()}
            <span class="dock-label">${escapeHtml(messages.builder.scenes)}</span>
          </a>
          <a href="${escapeHtml(withBuilderQuery(appRoutes.builderNpcs, locale, project?.id ?? projectId))}" class="dock-item ${activeTab === "npcs" ? "dock-active" : ""}" aria-label="${escapeHtml(messages.builder.npcs)}">
            ${iconNpcs()}
            <span class="dock-label">${escapeHtml(messages.builder.npcs)}</span>
          </a>
          <a href="${escapeHtml(withBuilderQuery(appRoutes.builderAi, locale, project?.id ?? projectId))}" class="dock-item ${activeTab === "ai" ? "dock-active" : ""}" aria-label="${escapeHtml(messages.builder.ai)}">
            ${iconAi()}
            <span class="dock-label">${escapeHtml(messages.builder.ai)}</span>
          </a>
          <a href="${escapeHtml(playHref)}" class="dock-item" aria-label="${escapeHtml(messages.navigation.game)}">
            ${iconPlay()}
            <span class="dock-label">${escapeHtml(messages.navigation.game)}</span>
          </a>
        </nav>
      </div>
    </div>`;
};

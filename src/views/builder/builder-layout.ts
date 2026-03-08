/**
 * Builder Layout
 *
 * Server-rendered DaisyUI drawer layout for the builder workspace.
 * Provides persistent project chrome plus sidebar navigation.
 */
import { appConfig, type LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import {
  iconAi,
  iconAnimations,
  iconAssets,
  iconAutomation,
  iconDashboard,
  iconDialogue,
  iconDocs,
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
  { key: "dashboard", label: messages.builder.dashboard, href: appRoutes.builder, icon: iconDashboard },
  { key: "scenes", label: messages.builder.scenes, href: appRoutes.builderScenes, icon: iconScenes },
  { key: "npcs", label: messages.builder.npcs, href: appRoutes.builderNpcs, icon: iconNpcs },
  { key: "dialogue", label: messages.builder.dialogue, href: appRoutes.builderDialogue, icon: iconDialogue },
  { key: "assets", label: messages.builder.assets, href: appRoutes.builderAssets, icon: iconAssets },
  { key: "mechanics", label: messages.builder.mechanics, href: appRoutes.builderMechanics, icon: iconMechanics },
  { key: "automation", label: messages.builder.automation, href: appRoutes.builderAutomation, icon: iconAutomation },
  { key: "ai", label: messages.builder.ai, href: appRoutes.builderAi, icon: iconAi },
  { key: "animations", label: messages.builder.animations, href: appRoutes.builderAnimations, icon: iconAnimations },
];

const withBuilderQuery = (path: string, locale: LocaleCode, projectId: string): string =>
  withQueryParameters(path, {
    lang: locale,
    projectId,
  });

const formatProjectTimestamp = (locale: LocaleCode, timestamp: number): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

/**
 * Renders the persistent project chrome used across builder routes.
 *
 * @param messages Localized messages.
 * @param locale Active locale.
 * @param projectId Requested project id.
 * @param currentPath Current builder pathname.
 * @param project Current project snapshot if available.
 * @returns HTML string for the project chrome.
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
  const projectStatusLabel =
    project?.publishedReleaseVersion !== null
      ? messages.builder.projectStatusPublished
      : project
        ? messages.builder.projectStatusUnpublished
        : messages.builder.projectStatusDraft;
  const projectStatusTone =
    project?.publishedReleaseVersion !== null ? "badge-success" : "badge-warning";

  const projectMetrics =
    project === null
      ? `<div role="alert" class="alert alert-warning alert-soft">
          <span>${escapeHtml(messages.builder.activeProjectMissing)}</span>
        </div>`
      : `<div class="stats stats-vertical sm:stats-horizontal shadow bg-base-100 border border-base-300 w-full">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div class="stat-title">${escapeHtml(messages.builder.projectDraftVersion)}</div>
            <div class="stat-value text-primary">${project.version}</div>
          </div>
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div class="stat-title">${escapeHtml(messages.builder.projectPublishedVersion)}</div>
            <div class="stat-value text-secondary">${project.publishedReleaseVersion ?? "—"}</div>
          </div>
          <div class="stat">
            <div class="stat-title">${escapeHtml(messages.builder.projectStatus)}</div>
            <div class="stat-value text-lg"><span class="badge ${projectStatusTone} badge-soft">${escapeHtml(projectStatusLabel)}</span></div>
          </div>
          <div class="stat">
            <div class="stat-title">${escapeHtml(messages.builder.projectLastUpdated)}</div>
            <div class="stat-value text-sm">${escapeHtml(formatProjectTimestamp(locale, project.lastUpdatedAtMs))}</div>
          </div>
        </div>`;

  const publishButton =
    project === null || publishAction === null
      ? ""
      : `<form
          hx-patch="${escapeHtml(publishAction)}"
          hx-target="#builder-project-shell"
          hx-swap="outerHTML"
          class="contents"
        >
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <input type="hidden" name="currentPath" value="${escapeHtml(currentPath)}" />
          <input type="hidden" name="published" value="${project.publishedReleaseVersion === null ? "true" : "false"}" />
          <button type="submit" class="btn ${project.publishedReleaseVersion === null ? "btn-primary" : "btn-warning"} btn-sm">
            ${escapeHtml(
              project.publishedReleaseVersion === null
                ? messages.builder.publishProject
                : messages.builder.unpublishProject,
            )}
          </button>
        </form>`;

  const playButton =
    playHref === null
      ? `<button type="button" class="btn btn-secondary btn-sm btn-disabled" disabled aria-disabled="true">${escapeHtml(messages.builder.noPublishedRelease)}</button>`
      : `<a href="${escapeHtml(playHref)}" class="btn btn-secondary btn-sm">${escapeHtml(messages.builder.playPublishedBuild)}</a>`;

  return `<section id="builder-project-shell" class="glass-card rounded-box shadow-lg">
    <div class="p-5 space-y-5 lg:p-6">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <span class="badge badge-primary badge-soft">${escapeHtml(messages.builder.currentProject)}</span>
            <h1 class="text-2xl font-semibold">${escapeHtml(project?.id ?? projectId)}</h1>
          </div>
          <p class="max-w-3xl text-sm text-base-content/70">${escapeHtml(messages.builder.createProjectHelp)}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          ${publishButton}
          ${playButton}
        </div>
      </div>

      ${projectMetrics}

      <div class="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <form
          method="get"
          action="${escapeHtml(switchAction)}"
          class="rounded-box border border-base-300/50 bg-base-200/30 p-4"
        >
          <div class="space-y-3">
            <label class="label" for="builder-project-switch">${escapeHtml(messages.builder.projectIdLabel)}</label>
            <input
              id="builder-project-switch"
              name="projectId"
              type="text"
              value="${escapeHtml(project?.id ?? projectId)}"
              class="input input-bordered w-full"
              placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}"
            />
            <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
            <button type="submit" class="btn btn-outline btn-sm w-full">${escapeHtml(messages.builder.switchProject)}</button>
          </div>
        </form>

        <form
          hx-post="${escapeHtml(createAction)}"
          hx-indicator="#builder-project-create-spinner"
          hx-disabled-elt="button, input, select, textarea"
          class="rounded-box border border-base-300/50 bg-base-200/30 p-4"
        >
          <div class="space-y-3">
            <label class="label" for="builder-project-create">${escapeHtml(messages.builder.createProject)}</label>
            <input
              id="builder-project-create"
              name="projectId"
              type="text"
              class="input input-bordered w-full"
              placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}"
            />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <input type="hidden" name="redirectPath" value="${escapeHtml(currentPath)}" />
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm w-full">${escapeHtml(messages.builder.createProject)}</button>
              <span id="builder-project-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </div>
        </form>

        <div class="rounded-box border border-base-300/50 bg-base-200/30 p-4 text-sm text-base-content/70">
          <div class="font-medium text-base-content">${escapeHtml(messages.builder.projectPlayHint)}</div>
          <div class="mt-2">${escapeHtml(messages.builder.localRuntimeTitle)}</div>
          <div class="mt-1 font-mono text-xs">${escapeHtml(appConfig.ai.transformersCacheDirectory)}</div>
        </div>
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
export const renderBuilderLayout = (props: BuilderLayoutProps): string => {
  const { locale, messages, activeTab, projectId, project, currentPath, body } = props;
  const navItems = builderNavItems(messages);

  const sidebarItems = navItems
    .map((item) => {
      const isActive = item.key === activeTab;
      const activeClass = isActive ? "menu-active bg-primary/10 text-primary font-semibold" : "";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";
      const href = withBuilderQuery(item.href, locale, project?.id ?? projectId);
      return `<li>
        <a class="${activeClass} is-drawer-close:tooltip is-drawer-close:tooltip-right" href="${escapeHtml(href)}"${ariaCurrent}
           aria-label="${escapeHtml(item.label)}" data-tip="${escapeHtml(item.label)}"
           hx-get="${escapeHtml(href)}" hx-target="#builder-content" hx-push-url="true" hx-swap="innerHTML">
          ${item.icon()}
          <span class="is-drawer-close:hidden">${escapeHtml(item.label)}</span>
        </a>
      </li>`;
    })
    .join("");

  const playHref =
    project !== null && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : withBuilderQuery(appRoutes.game, locale, project?.id ?? projectId);

  return `
    <div class="drawer bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-base-200)_42%,transparent),transparent)] lg:drawer-open">
      <input id="builder-drawer" type="checkbox" class="drawer-toggle" aria-label="${escapeHtml(messages.common.openMenu)}" />

      <div class="drawer-content flex min-h-screen flex-col">
        <nav class="navbar border-b border-base-300/50 glass-header lg:hidden" role="navigation" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="flex-none">
            <label for="builder-drawer" class="btn btn-square btn-ghost" aria-label="${escapeHtml(messages.common.openMenu)}">
              ${iconMenu()}
            </label>
          </div>
          <div class="flex-1">
            <span class="text-lg font-semibold">${escapeHtml(messages.builder.title)}</span>
          </div>
          <div class="flex-none">
            <a href="${escapeHtml(playHref)}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.navigation.game)}">
              ${iconPlay()} <span class="hidden sm:inline">${escapeHtml(messages.navigation.game)}</span>
            </a>
          </div>
        </nav>

        <div class="space-y-6 p-6">
          ${renderBuilderProjectShell(messages, locale, projectId, currentPath, project)}
          <main id="builder-content" class="flex-1 animate-fade-in-up" role="main" aria-live="polite">
            ${body}
          </main>
        </div>
      </div>

      <div class="drawer-side z-99">
        <label for="builder-drawer" class="drawer-overlay" aria-label="${escapeHtml(messages.builder.closeSidebar)}"></label>
        <aside class="flex min-h-full flex-col border-r border-base-300/50 bg-base-200/80 backdrop-blur-sm transition-[width] duration-300 is-drawer-close:w-16 is-drawer-open:w-72" role="complementary" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="flex items-center gap-2 border-b border-base-300 p-4">
            <a href="${escapeHtml(withBuilderQuery(appRoutes.builder, locale, project?.id ?? projectId))}" class="flex items-center gap-2 text-xl font-bold" aria-label="${escapeHtml(messages.builder.title)}">
              ${iconDashboard()}
              <span class="is-drawer-close:hidden">${escapeHtml(messages.builder.title)}</span>
            </a>
          </div>
          <div class="is-drawer-close:hidden border-b border-base-300 px-4 py-2">
            <p class="text-sm text-base-content/65">${escapeHtml(messages.builder.flowDescription)}</p>
          </div>
          <nav aria-label="${escapeHtml(messages.builder.title)}" class="flex-1 overflow-y-auto">
            <ul class="menu gap-1 p-2 is-drawer-close:px-1">
              ${sidebarItems}
            </ul>
          </nav>
          <div class="space-y-2 border-t border-base-300 p-2 is-drawer-close:p-1">
            <div class="is-drawer-close:hidden rounded-box border border-base-300 bg-base-100/80 p-3 text-sm">
              <div class="font-medium">${escapeHtml(messages.builder.localRuntimeTitle)}</div>
              <div class="mt-1 text-base-content/65">${escapeHtml(appConfig.ai.transformersCacheDirectory)}</div>
            </div>
            <div class="grid gap-1 is-drawer-close:grid-cols-1 is-drawer-open:grid-cols-2">
              <a href="${escapeHtml(playHref)}" class="btn btn-primary btn-sm w-full is-drawer-close:btn-square is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="${escapeHtml(messages.navigation.game)}" aria-label="${escapeHtml(messages.navigation.game)}">
                ${iconPlay()}
                <span class="is-drawer-close:hidden">${escapeHtml(messages.navigation.game)}</span>
              </a>
              <a href="${escapeHtml(withQueryParameters(appConfig.api.docsPath, { lang: locale }))}" class="btn btn-outline btn-sm w-full is-drawer-close:btn-square is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="${escapeHtml(messages.builder.docsLabel)}" aria-label="${escapeHtml(messages.builder.docsLabel)}">
                ${iconDocs()}
                <span class="is-drawer-close:hidden">${escapeHtml(messages.builder.docsLabel)}</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>`;
};

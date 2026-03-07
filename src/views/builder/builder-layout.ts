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
const builderNavItems = (messages: Messages) =>
  [
    { key: "dashboard", label: messages.builder.dashboard, href: appRoutes.builder, icon: "📊" },
    { key: "scenes", label: messages.builder.scenes, href: appRoutes.builderScenes, icon: "🏯" },
    { key: "npcs", label: messages.builder.npcs, href: appRoutes.builderNpcs, icon: "👤" },
    {
      key: "dialogue",
      label: messages.builder.dialogue,
      href: appRoutes.builderDialogue,
      icon: "💬",
    },
    { key: "assets", label: messages.builder.assets, href: appRoutes.builderAssets, icon: "🎨" },
    {
      key: "mechanics",
      label: messages.builder.mechanics,
      href: appRoutes.builderMechanics,
      icon: "🧭",
    },
    {
      key: "automation",
      label: messages.builder.automation,
      href: appRoutes.builderAutomation,
      icon: "🛠️",
    },
    { key: "ai", label: messages.builder.ai, href: appRoutes.builderAi, icon: "🤖" },
  ] as const;

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
      : `<div class="grid gap-3 md:grid-cols-4">
          <div class="rounded-box bg-base-200/70 p-3">
            <div class="text-xs uppercase tracking-[0.2em] text-base-content/60">${escapeHtml(messages.builder.projectDraftVersion)}</div>
            <div class="mt-1 text-2xl font-semibold">${project.version}</div>
          </div>
          <div class="rounded-box bg-base-200/70 p-3">
            <div class="text-xs uppercase tracking-[0.2em] text-base-content/60">${escapeHtml(messages.builder.projectPublishedVersion)}</div>
            <div class="mt-1 text-2xl font-semibold">${project.publishedReleaseVersion ?? "—"}</div>
          </div>
          <div class="rounded-box bg-base-200/70 p-3">
            <div class="text-xs uppercase tracking-[0.2em] text-base-content/60">${escapeHtml(messages.builder.projectStatus)}</div>
            <div class="mt-2"><span class="badge ${projectStatusTone} badge-soft">${escapeHtml(projectStatusLabel)}</span></div>
          </div>
          <div class="rounded-box bg-base-200/70 p-3">
            <div class="text-xs uppercase tracking-[0.2em] text-base-content/60">${escapeHtml(messages.builder.projectLastUpdated)}</div>
            <div class="mt-1 text-sm font-medium">${escapeHtml(formatProjectTimestamp(locale, project.lastUpdatedAtMs))}</div>
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

  return `<section id="builder-project-shell" class="card card-border bg-base-100/95 shadow-sm">
    <div class="card-body gap-5">
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
          class="rounded-box border border-base-300 bg-base-200/40 p-4"
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
          class="rounded-box border border-base-300 bg-base-200/40 p-4"
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

        <div class="rounded-box border border-base-300 bg-base-200/40 p-4 text-sm text-base-content/70">
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
      const activeClass = isActive ? "menu-active font-semibold" : "";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";
      const href = withBuilderQuery(item.href, locale, project?.id ?? projectId);
      return `<li>
        <a class="${activeClass}" href="${escapeHtml(href)}"${ariaCurrent}
           aria-label="${escapeHtml(item.label)}"
           hx-get="${escapeHtml(href)}" hx-target="#builder-content" hx-push-url="true" hx-swap="innerHTML">
          <span aria-hidden="true">${item.icon}</span> ${escapeHtml(item.label)}
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
        <nav class="navbar border-b border-base-300 bg-base-100/90 backdrop-blur lg:hidden" role="navigation" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="flex-none">
            <label for="builder-drawer" class="btn btn-square btn-ghost" aria-label="${escapeHtml(messages.common.openMenu)}">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <span class="text-lg font-semibold">${escapeHtml(messages.builder.title)}</span>
          </div>
          <div class="flex-none">
            <a href="${escapeHtml(playHref)}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.navigation.game)}">
              <span aria-hidden="true">🎮</span> ${escapeHtml(messages.navigation.game)}
            </a>
          </div>
        </nav>

        <div class="space-y-6 p-6">
          ${renderBuilderProjectShell(messages, locale, projectId, currentPath, project)}
          <main id="builder-content" class="flex-1" role="main" aria-live="polite">
            ${body}
          </main>
        </div>
      </div>

      <div class="drawer-side z-99">
        <label for="builder-drawer" class="drawer-overlay" aria-label="${escapeHtml(messages.builder.closeSidebar)}"></label>
        <aside class="min-h-full w-72 border-r border-base-300 bg-base-200/85 backdrop-blur" role="complementary" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="border-b border-base-300 p-4">
            <a href="${escapeHtml(withBuilderQuery(appRoutes.builder, locale, project?.id ?? projectId))}" class="flex items-center gap-2 text-xl font-bold" aria-label="${escapeHtml(messages.builder.title)}">
              <span aria-hidden="true">🏗️</span> ${escapeHtml(messages.builder.title)}
            </a>
            <p class="mt-2 text-sm text-base-content/65">${escapeHtml(messages.builder.flowDescription)}</p>
          </div>
          <nav aria-label="${escapeHtml(messages.builder.title)}">
            <ul class="menu gap-1 p-4">
              ${sidebarItems}
            </ul>
          </nav>
          <div class="mt-auto space-y-3 border-t border-base-300 p-4">
            <div class="rounded-box border border-base-300 bg-base-100/80 p-3 text-sm">
              <div class="font-medium">${escapeHtml(messages.builder.localRuntimeTitle)}</div>
              <div class="mt-1 text-base-content/65">${escapeHtml(appConfig.ai.transformersCacheDirectory)}</div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <a href="${escapeHtml(playHref)}" class="btn btn-primary btn-sm w-full" aria-label="${escapeHtml(messages.navigation.game)}">
                <span aria-hidden="true">🎮</span> ${escapeHtml(messages.navigation.game)}
              </a>
              <a href="${escapeHtml(withQueryParameters(appConfig.api.docsPath, { lang: locale }))}" class="btn btn-outline btn-sm w-full" aria-label="${escapeHtml(messages.builder.docsLabel)}">
                ${escapeHtml(messages.builder.docsLabel)}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>`;
};

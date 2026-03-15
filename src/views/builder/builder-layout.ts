/**
 * Builder Layout
 *
 * Server-rendered DaisyUI drawer layout for the builder workspace.
 * Provides persistent project chrome plus sidebar navigation.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml, renderDrawerToggleControl } from "../layout.ts";
import {
  type MenuActionItem,
  type NavigationGroup,
  type NavigationItem,
  renderActionDropdown,
  renderCollapsibleSidebarMenu,
} from "../shared/navigation.ts";
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
import { renderStarterProjectPicker } from "./starter-project-picker.ts";

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
  readonly group: "overview" | "authoring" | "runtime";
}

/**
 * Builds the ordered list of sidebar navigation items.
 *
 * @param messages Localized messages.
 * @returns Array of navigation item descriptors.
 */
const builderNavItems = (messages: Messages): readonly BuilderNavItem[] => [
  {
    key: "start",
    label: messages.builder.dashboard,
    href: appRoutes.builderStart,
    icon: iconDashboard,
    group: "overview",
  },
  {
    key: "world",
    label: messages.builder.scenes,
    href: appRoutes.builderScenes,
    icon: iconScenes,
    group: "authoring",
  },
  {
    key: "characters",
    label: messages.builder.npcs,
    href: appRoutes.builderNpcs,
    icon: iconNpcs,
    group: "authoring",
  },
  {
    key: "story",
    label: messages.builder.dialogue,
    href: appRoutes.builderDialogue,
    icon: iconDialogue,
    group: "authoring",
  },
  {
    key: "assets",
    label: messages.builder.assets,
    href: appRoutes.builderAssets,
    icon: iconAssets,
    group: "authoring",
  },
  {
    key: "systems",
    label: messages.builder.mechanics,
    href: appRoutes.builderMechanics,
    icon: iconMechanics,
    group: "authoring",
  },
  {
    key: "playtest",
    label: messages.builder.playtest,
    href: appRoutes.game,
    icon: iconPlay,
    group: "runtime",
  },
];

const withBuilderQuery = (path: string, locale: LocaleCode, projectId: string): string =>
  withQueryParameters(interpolateRoutePath(path, { projectId }), {
    lang: locale,
  });

const buildProjectConsoleNavigationGroups = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  activeTab: string,
): readonly NavigationGroup[] => [
  {
    title: messages.builder.projectSettings,
    items: [
      {
        key: "settings",
        label: messages.builder.projectSettings,
        shortLabel: messages.builder.projectSettings,
        href: withBuilderQuery(appRoutes.builderAi, locale, projectId),
        icon: iconAi(),
        active: activeTab === "ai" || activeTab === "settings",
      },
      {
        key: "operations",
        label: messages.builder.operations,
        shortLabel: messages.builder.operations,
        href: withBuilderQuery(appRoutes.builderAutomation, locale, projectId),
        icon: iconAutomation(),
        active: activeTab === "automation" || activeTab === "operations",
      },
    ],
  },
];

const _formatProjectTimestamp = (locale: LocaleCode, timestamp: number): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

const toNavigationItem = (
  item: BuilderNavItem,
  locale: LocaleCode,
  projectId: string,
  activeTab: string,
  navCounts?: Readonly<Record<string, number>>,
): NavigationItem => ({
  key: item.key,
  label: item.label,
  shortLabel: item.label,
  href: withBuilderQuery(item.href, locale, projectId),
  icon: item.icon(),
  active:
    item.key === activeTab ||
    (item.key === "start" && activeTab === "dashboard") ||
    (item.key === "world" && activeTab === "scenes") ||
    (item.key === "characters" && activeTab === "npcs") ||
    (item.key === "story" && activeTab === "dialogue") ||
    (item.key === "systems" && activeTab === "mechanics") ||
    (item.key === "playtest" && activeTab === "play"),
  badge: navCounts?.[item.key],
  htmx:
    item.key === "playtest"
      ? undefined
      : {
          target: "#main-content",
          swap: "innerHTML",
          pushUrl: true,
        },
});

const buildBuilderNavigationGroups = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  activeTab: string,
  navCounts?: Readonly<Record<string, number>>,
): readonly NavigationGroup[] => {
  const items = builderNavItems(messages).map((item) =>
    toNavigationItem(item, locale, projectId, activeTab, navCounts),
  );

  return [
    {
      title: messages.builder.navGroupOverview,
      items: items.filter((item) => item.key === "start"),
    },
    {
      title: messages.builder.navGroupAuthoring,
      items: items.filter((item) =>
        ["world", "characters", "story", "assets", "systems"].includes(item.key),
      ),
    },
    {
      title: messages.builder.navGroupRuntime,
      items: items.filter((item) => item.key === "playtest"),
    },
  ];
};

/**
 * Resolves the human-readable workspace label for the creator mobile nav bar.
 *
 * @param messages Localized messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param activeTab Active tab key.
 * @returns Localized workspace label.
 */
const resolveCreatorWorkspaceLabel = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  activeTab: string,
): string => {
  const items = builderNavItems(messages).map((item) =>
    toNavigationItem(item, locale, projectId, activeTab),
  );
  const activeItem = items.find((item) => item.active);
  return activeItem?.label ?? messages.builder.title;
};

/**
 * Resolves the human-readable workspace label for the console mobile nav bar.
 *
 * @param messages Localized messages.
 * @param activeTab Active tab key.
 * @returns Localized workspace label.
 */
const resolveConsoleWorkspaceLabel = (messages: Messages, activeTab: string): string => {
  if (activeTab === "automation" || activeTab === "operations") {
    return messages.builder.operations;
  }
  return messages.builder.projectSettings;
};

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
  const playHref =
    project && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : null;
  const publishAction =
    project !== null
      ? interpolateRoutePath(appRoutes.builderApiProjectPublish, { projectId: project.id })
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

  const projectMenuItems: readonly MenuActionItem[] = [
    {
      key: "switch",
      label: messages.builder.switchProject,
      contentHtml: `<div class="divider my-1"></div><form method="get" action="${escapeHtml(switchAction)}" class="space-y-2 px-1 py-1">
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">${escapeHtml(messages.builder.switchProject)}</legend>
          <input name="projectId" type="text" value="${escapeHtml(project?.id ?? projectId)}" class="input input-sm w-full" placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.projectIdLabel)}" />
          <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
          <button type="submit" class="btn btn-outline btn-xs w-full">${escapeHtml(messages.builder.switchProject)}</button>
        </fieldset>
      </form>`,
    },
    {
      key: "create",
      label: messages.builder.createProject,
      contentHtml: `<div class="divider my-1"></div>${renderStarterProjectPicker({
        messages,
        locale,
        redirectPath: currentPath,
        compact: true,
      })}`,
    },
  ];

  return `<section id="builder-project-shell" class="border-b border-base-300/80 bg-base-100/80 backdrop-blur">
    <div class="flex flex-col gap-3 px-4 py-3 lg:px-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-sm">${escapeHtml(project?.id ?? projectId)}</span>
            <span class="badge ${statusTone} badge-soft badge-xs">${escapeHtml(statusLabel)}</span>
            ${
              project !== null
                ? `<span class="text-xs text-base-content/50">${escapeHtml(messages.builder.versionPrefix)}${project.version}</span>`
                : ""
            }
          </div>
          <p class="text-xs text-base-content/60">${escapeHtml(project?.publishedReleaseVersion !== null ? messages.builder.projectStatusPublished : messages.builder.workspaceJumpBack)}</p>
        </div>
        <div class="flex-1"></div>
        <div class="flex flex-wrap items-center gap-2">
          ${publishForm}
          ${playBtn}
          ${renderActionDropdown(
            messages.builder.advancedTools,
            `<span class="btn btn-ghost btn-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
            </span>`,
            projectMenuItems,
            { align: "end", widthClass: "w-72", menuClassName: "p-3" },
          )}
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
/**
 * Renders the creator-shell sidebar navigation.
 *
 * @param props Layout inputs.
 * @returns HTML string for the creator sidebar.
 */
export const renderBuilderSidebar = (props: BuilderLayoutProps): string => {
  const { locale, messages, activeTab, projectId, project, navCounts } = props;
  const resolvedProjectId = project?.id ?? projectId;
  const navGroups = buildBuilderNavigationGroups(
    messages,
    locale,
    resolvedProjectId,
    activeTab,
    navCounts,
  );

  return renderSidebarShell(
    messages,
    locale,
    project,
    navGroups,
    messages.builder.title,
    messages.builder.creatorSafeAiDescription,
  );
};

/**
 * Renders the console-shell sidebar navigation.
 *
 * @param props Layout inputs.
 * @returns HTML string for the console sidebar.
 */
export const renderConsoleSidebar = (props: BuilderLayoutProps): string => {
  const { locale, messages, activeTab, projectId, project } = props;
  const resolvedProjectId = project?.id ?? projectId;
  const navGroups = buildProjectConsoleNavigationGroups(
    messages,
    locale,
    resolvedProjectId,
    activeTab,
  );

  return renderSidebarShell(
    messages,
    locale,
    project,
    navGroups,
    messages.builder.advancedTools,
    messages.builder.advancedAutomationDescription,
  );
};

/**
 * Shared sidebar chrome used by both creator and console shells.
 *
 * @param messages Localized messages.
 * @param locale Active locale.
 * @param project Current project snapshot.
 * @param navGroups Ordered navigation groups.
 * @param shellLabel Shell name shown under brand.
 * @param shellDescription Shell description in masthead.
 * @returns HTML string for the sidebar.
 */
const renderSidebarShell = (
  messages: Messages,
  locale: LocaleCode,
  project: BuilderChromeProject | null,
  navGroups: readonly NavigationGroup[],
  shellLabel: string,
  shellDescription: string,
): string =>
  renderCollapsibleSidebarMenu(navGroups, {
    ariaLabel: shellLabel,
    brandHtml: `<a href="${escapeHtml(withQueryParameters(appRoutes.home, { lang: locale }))}" class="group flex items-center gap-3" aria-label="${escapeHtml(messages.metadata.appName)}">
      <span class="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-content text-lg shadow-sm" aria-hidden="true">🍵</span>
      <span class="min-w-0">
        <span class="block truncate text-lg font-bold">${escapeHtml(messages.metadata.appName)}</span>
        <span class="block text-xs uppercase tracking-[0.22em] text-primary/80">${escapeHtml(shellLabel)}</span>
      </span>
    </a>`,
    mastheadHtml: `<div class="space-y-3 rounded-[1.25rem] border border-base-300 bg-base-100 p-3">
      <div class="flex items-center gap-2">
        <span class="status ${project === null ? "status-warning" : "status-success"} status-xs"></span>
        <span class="truncate text-sm font-medium">${escapeHtml(project === null ? messages.common.noProjectBound : messages.common.projectConfigured)}</span>
      </div>
      <p class="text-xs leading-5 text-base-content/60">${escapeHtml(shellDescription)}</p>
    </div>`,
    footerHtml: `<a href="${escapeHtml(withQueryParameters(appRoutes.home, { lang: locale }))}" class="btn btn-outline btn-block btn-sm gap-2" aria-label="${escapeHtml(messages.builder.exitBuilder)}">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      <span>${escapeHtml(messages.builder.exitBuilder)}</span>
    </a>`,
  });

/**
 * Renders the creator-shell layout wrapping authoring content.
 *
 * @param props Layout inputs.
 * @returns HTML string with DaisyUI drawer and creator-only navigation.
 */
export const renderBuilderLayout = (props: BuilderLayoutProps): string => {
  const { locale, messages, projectId, project, currentPath, body, activeTab } = props;
  const resolvedProjectId = project?.id ?? projectId;
  const navGroups = buildBuilderNavigationGroups(
    messages,
    locale,
    resolvedProjectId,
    activeTab,
    props.navCounts,
  );
  const dockItems = navGroups
    .flatMap((group) => group.items)
    .filter((item) =>
      ["start", "world", "characters", "assets", "story", "systems", "playtest"].includes(item.key),
    );

  const playHref =
    project !== null && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : withBuilderQuery(appRoutes.game, locale, resolvedProjectId);
  const activeWorkspaceLabel = resolveCreatorWorkspaceLabel(
    messages,
    locale,
    resolvedProjectId,
    activeTab,
  );

  return renderShellFrame({
    messages,
    locale,
    projectId,
    project,
    currentPath,
    body,
    shellLabel: messages.builder.title,
    activeWorkspaceLabel,
    playHref,
    dockHtml: `<nav class="dock dock-sm fixed inset-x-0 bottom-0 z-30 border-t border-base-300/80 bg-base-100/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur lg:hidden" aria-label="${escapeHtml(messages.builder.title)}">
      ${dockItems
        .map(
          (
            item,
          ) => `<a href="${escapeHtml(item.href)}" class="dock-item min-h-16 ${item.active ? "dock-active" : ""}" aria-label="${escapeHtml(item.label)}">
        ${item.icon ?? ""}
        <span class="dock-label">${escapeHtml(item.label)}</span>
      </a>`,
        )
        .join("")}
    </nav>`,
  });
};

/**
 * Renders the console-shell layout wrapping settings/operations content.
 *
 * @param props Layout inputs.
 * @returns HTML string with DaisyUI drawer and console-only navigation.
 */
export const renderConsoleLayout = (props: BuilderLayoutProps): string => {
  const { locale, messages, projectId, project, currentPath, body, activeTab } = props;
  const resolvedProjectId = project?.id ?? projectId;

  const playHref =
    project !== null && project.publishedReleaseVersion !== null
      ? withBuilderQuery(appRoutes.game, locale, project.id)
      : withBuilderQuery(appRoutes.game, locale, resolvedProjectId);
  const activeWorkspaceLabel = resolveConsoleWorkspaceLabel(messages, activeTab);

  return renderShellFrame({
    messages,
    locale,
    projectId,
    project,
    currentPath,
    body,
    shellLabel: messages.builder.advancedTools,
    activeWorkspaceLabel,
    playHref,
    dockHtml: "",
  });
};

/**
 * Shared frame chrome used by both creator and console shells.
 */
interface ShellFrameConfig {
  readonly messages: Messages;
  readonly locale: LocaleCode;
  readonly projectId: string;
  readonly project: BuilderChromeProject | null;
  readonly currentPath: string;
  readonly body: string;
  readonly shellLabel: string;
  readonly activeWorkspaceLabel: string;
  readonly playHref: string;
  readonly dockHtml: string;
}

/**
 * Renders the shared builder frame used by both creator and console shells.
 *
 * @param config Shell frame configuration.
 * @returns HTML string for the builder frame.
 */
const renderShellFrame = (config: ShellFrameConfig): string => {
  const {
    messages,
    locale,
    projectId,
    project,
    currentPath,
    body,
    shellLabel,
    activeWorkspaceLabel,
    playHref,
    dockHtml,
  } = config;

  return `
    <div class="isolate flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-[1.75rem] border border-base-300/80 bg-base-100/85 shadow-xl backdrop-blur">

      <!-- Mobile Builder Top Bar -->
      <div class="flex flex-col flex-1 w-full max-w-[100vw]">
        <nav class="navbar border-b border-base-300/80 bg-base-100 lg:hidden" role="navigation" aria-label="${escapeHtml(shellLabel)}">
          <div class="flex-none">
            ${renderDrawerToggleControl({
              targetId: "main-nav-drawer",
              label: messages.common.openMenu,
              className: "btn btn-square btn-ghost",
              content: iconMenu(),
            })}
          </div>
          <div class="flex-1">
            <div class="flex flex-col">
              <span class="text-[11px] font-medium uppercase tracking-[0.22em] text-base-content/45">${escapeHtml(shellLabel)}</span>
              <span class="text-base font-semibold tracking-wide">${escapeHtml(activeWorkspaceLabel)}</span>
            </div>
          </div>
          <div class="flex-none">
            <a href="${escapeHtml(playHref)}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.navigation.game)}">
              ${iconPlay()} <span class="hidden sm:inline">${escapeHtml(messages.navigation.game)}</span>
            </a>
          </div>
        </nav>

        ${renderBuilderProjectShell(messages, locale, projectId, currentPath, project)}
        <div id="builder-content" class="flex-1 overflow-x-clip px-4 py-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-36 lg:px-6 lg:py-6 lg:pb-6" role="region" aria-live="polite">
          ${body}
        </div>

        <footer class="hidden border-t border-base-300/80 bg-base-100 px-4 py-3 lg:block" role="status" aria-label="${escapeHtml(messages.builder.statusBarProject)}">
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
              <span class="badge badge-ghost badge-xs">${escapeHtml(messages.common.noActiveJobs)}</span>
            </div>
          </div>
        </footer>
        ${dockHtml}
      </div>
    </div>`;
};

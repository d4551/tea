import type { LocaleCode } from "../../config/environment.ts";
import { BUILDER_QUERY_PARAM_TEMPLATE_ID } from "../../shared/constants/builder-query.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AssetLibrary,
  CapabilityProfile,
  ControlPlaneSnapshot,
  ControlPlaneWorkspaceId,
  PlatformGameSummary,
  ProjectTemplate,
  ReleaseRecord,
  ReviewQueueItem,
  SharedAsset,
} from "../../shared/contracts/platform-control-plane.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { renderWorkspaceFrame, renderWorkspaceShell } from "../builder/workspace-shell.ts";
import { escapeHtml } from "../layout.ts";
import { renderLinkAttrs } from "../shared/link-attrs.ts";
import { renderSecondaryNav, type SecondaryNavItem } from "../shared/navigation.ts";
import { renderEmptyState } from "../shared/ui-components.ts";

/**
 * Rendering input for the top-level platform control plane.
 */
export interface ControlPlanePageInput {
  /** Localized message catalog. */
  readonly messages: Messages;
  /** Active locale. */
  readonly locale: LocaleCode;
  /** Current control-plane workspace. */
  readonly workspace: ControlPlaneWorkspaceId;
  /** Aggregated platform snapshot. */
  readonly snapshot: ControlPlaneSnapshot;
  /** Optional currently focused project id. */
  readonly projectId?: string;
}

const controlPlaneWorkspaceRouteMap: Readonly<Record<ControlPlaneWorkspaceId, string>> = {
  games: appRoutes.platformGames,
  libraries: appRoutes.platformLibraries,
  templates: appRoutes.platformTemplates,
  capabilities: appRoutes.platformCapabilities,
  releases: appRoutes.platformReleases,
  review: appRoutes.platformReview,
};

const controlPlaneWorkspaceOrder: readonly ControlPlaneWorkspaceId[] = [
  "games",
  "libraries",
  "templates",
  "capabilities",
  "releases",
  "review",
];

const platformEmptyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-base-content/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><path d="M7 9h10"/><path d="M7 13h6"/></svg>';

const formatTimestamp = (locale: LocaleCode, timestamp: number): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

const withPlatformQuery = (path: string, locale: LocaleCode, projectId?: string): string =>
  withQueryParameters(withLocaleQuery(path, locale), projectId ? { projectId } : {});

const buildWorkspaceHref = (
  workspace: ControlPlaneWorkspaceId,
  locale: LocaleCode,
  projectId?: string,
): string => withPlatformQuery(controlPlaneWorkspaceRouteMap[workspace], locale, projectId);

const buildProjectRoute = (
  path: string,
  locale: LocaleCode,
  projectId: string,
  hash?: string,
): string =>
  withQueryParameters(`${interpolateRoutePath(path, { projectId })}${hash ? `#${hash}` : ""}`, {
    lang: locale,
  });

const resolveWorkspaceLabel = (messages: Messages, workspace: ControlPlaneWorkspaceId): string => {
  switch (workspace) {
    case "games":
      return messages.pages.controlPlane.gamesTitle;
    case "libraries":
      return messages.pages.controlPlane.librariesTitle;
    case "templates":
      return messages.pages.controlPlane.templatesTitle;
    case "capabilities":
      return messages.pages.controlPlane.capabilitiesTitle;
    case "releases":
      return messages.pages.controlPlane.releasesTitle;
    case "review":
      return messages.pages.controlPlane.reviewTitle;
  }
};

const resolveWorkspaceDescription = (
  messages: Messages,
  workspace: ControlPlaneWorkspaceId,
): string => {
  switch (workspace) {
    case "games":
      return messages.pages.controlPlane.gamesDescription;
    case "libraries":
      return messages.pages.controlPlane.librariesDescription;
    case "templates":
      return messages.pages.controlPlane.templatesDescription;
    case "capabilities":
      return messages.pages.controlPlane.capabilitiesDescription;
    case "releases":
      return messages.pages.controlPlane.releasesDescription;
    case "review":
      return messages.pages.controlPlane.reviewDescription;
  }
};

const renderWorkspaceTabs = (
  messages: Messages,
  locale: LocaleCode,
  activeWorkspace: ControlPlaneWorkspaceId,
  projectId?: string,
): string => {
  const tabs: readonly SecondaryNavItem[] = controlPlaneWorkspaceOrder.map((workspace) => ({
    key: workspace,
    label: resolveWorkspaceLabel(messages, workspace),
    href: buildWorkspaceHref(workspace, locale, projectId),
    htmx: {
      get: buildWorkspaceHref(workspace, locale, projectId),
      target: "#main-content",
      swap: "innerHTML",
      pushUrl: true,
    },
  }));

  return renderSecondaryNav(
    tabs,
    activeWorkspace,
    messages.pages.controlPlane.workspaceLabel,
    "secondary",
  );
};

const renderNavigatorLinks = (
  messages: Messages,
  locale: LocaleCode,
  activeWorkspace: ControlPlaneWorkspaceId,
  projectId?: string,
): string =>
  controlPlaneWorkspaceOrder
    .map((workspace) => {
      const activeClass =
        workspace === activeWorkspace
          ? "border-primary bg-primary/10 text-primary"
          : "border-base-300 bg-base-100 text-base-content";
      return `<a${renderLinkAttrs({
        href: buildWorkspaceHref(workspace, locale, projectId),
        ariaLabel: resolveWorkspaceLabel(messages, workspace),
        active: workspace === activeWorkspace,
        linkLanguage: locale,
      })} class="interactive-surface surface-tappable flex items-start justify-between gap-3 rounded-[1.25rem] border px-4 py-3 transition hover:border-primary/40 hover:bg-base-200/50 ${activeClass}">
        <span class="space-y-1">
          <span class="block font-semibold">${escapeHtml(resolveWorkspaceLabel(messages, workspace))}</span>
          <span class="block text-sm leading-6 text-base-content/68">${escapeHtml(resolveWorkspaceDescription(messages, workspace))}</span>
        </span>
      </a>`;
    })
    .join("");

const renderScopeCards = (messages: Messages): string =>
  [
    messages.pages.controlPlane.scopeGlobal,
    messages.pages.controlPlane.scopeOrganization,
    messages.pages.controlPlane.scopeProject,
    messages.pages.controlPlane.scopeRelease,
    messages.pages.controlPlane.scopeSession,
  ]
    .map(
      (label) =>
        `<div class="rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/72">${escapeHtml(
          label,
        )}</div>`,
    )
    .join("");

const renderGameCard = (
  messages: Messages,
  locale: LocaleCode,
  game: PlatformGameSummary,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="card-title text-lg">${escapeHtml(game.name)}</h3>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(game.subtitle)}</p>
      </div>
      <span class="badge ${game.published ? "badge-success" : "badge-warning"} badge-soft">${escapeHtml(
        game.published
          ? messages.pages.controlPlane.publishedLabel
          : messages.pages.controlPlane.draftLabel,
      )}</span>
    </div>
    <dl class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.sceneCountLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${game.sceneCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.assetCountLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${game.assetCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.reviewCountLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${game.reviewCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.releaseLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">v${game.latestReleaseVersion}</dd>
      </div>
    </dl>
    <div class="card-actions flex-wrap justify-start">
      <a href="${escapeHtml(buildProjectRoute(appRoutes.builderStart, locale, game.id))}" class="btn btn-primary btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBuilder)}: ${escapeHtml(game.name)}">${escapeHtml(messages.pages.controlPlane.openBuilder)}</a>
      <a href="${escapeHtml(buildProjectRoute(appRoutes.builderAi, locale, game.id, "builder-brand-control-plane"))}" class="btn btn-outline btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBrandControl)}: ${escapeHtml(game.name)}">${escapeHtml(messages.pages.controlPlane.openBrandControl)}</a>
      <a href="${escapeHtml(buildProjectRoute(appRoutes.builderAutomation, locale, game.id, "builder-review-queue"))}" class="btn btn-ghost btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openReviewQueue)}: ${escapeHtml(game.name)}">${escapeHtml(messages.pages.controlPlane.openReviewQueue)}</a>
      <a href="${escapeHtml(buildWorkspaceHref("games", locale, game.id))}" class="btn btn-ghost btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.focusProject)}: ${escapeHtml(game.name)}">${escapeHtml(messages.pages.controlPlane.focusProject)}</a>
    </div>
    <p class="text-xs uppercase tracking-[0.2em] text-base-content/45">${escapeHtml(messages.pages.controlPlane.lastUpdatedLabel)} ${escapeHtml(
      formatTimestamp(locale, game.lastUpdatedAtMs),
    )}</p>
  </div>
</article>`;

const renderLibraryCard = (
  messages: Messages,
  library: AssetLibrary,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-3">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="card-title text-lg">${escapeHtml(library.name)}</h3>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(library.description)}</p>
      </div>
      <span class="badge badge-secondary badge-soft">${escapeHtml(library.scope.scope)}</span>
    </div>
    <dl class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.libraryAssetsLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${library.assetCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.libraryProjectsLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${library.attachedProjectCount}</dd>
      </div>
    </dl>
  </div>
</article>`;

const renderSharedAssetRow = (
  messages: Messages,
  asset: SharedAsset,
): string => `<article class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4 shadow-sm">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="font-semibold">${escapeHtml(asset.label)}</h3>
        <span class="badge badge-outline badge-sm">${escapeHtml(asset.kind)}</span>
        <span class="badge badge-outline badge-sm">${escapeHtml(asset.sceneMode)}</span>
      </div>
      <p class="text-sm leading-6 text-base-content/70">${escapeHtml(asset.scope.label)}</p>
    </div>
    <span class="badge ${asset.approved ? "badge-success" : "badge-warning"} badge-soft">${escapeHtml(
      asset.approved
        ? messages.pages.controlPlane.approvedLabel
        : messages.pages.controlPlane.pendingReviewLabel,
    )}</span>
  </div>
  <div class="mt-3 flex flex-wrap gap-2">
    ${asset.attachments
      .map(
        (attachment) =>
          `<span class="badge badge-ghost badge-sm">${escapeHtml(attachment.source.label)}</span>`,
      )
      .join("")}
  </div>
</article>`;

const renderTemplateCard = (
  messages: Messages,
  locale: LocaleCode,
  template: ProjectTemplate,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="card-title text-lg">${escapeHtml(template.name)}</h3>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(template.description)}</p>
      </div>
      ${
        template.recommended
          ? `<span class="badge badge-primary badge-soft">${escapeHtml(messages.pages.controlPlane.recommendedLabel)}</span>`
          : ""
      }
    </div>
    <div class="flex flex-wrap gap-2">
      <span class="badge badge-outline">${escapeHtml(template.starterTemplateId)}</span>
      <span class="badge badge-outline">${escapeHtml(template.defaultSceneMode)}</span>
    </div>
    <div class="card-actions justify-start">
      <a href="${escapeHtml(
        withQueryParameters(withLocaleQuery(appRoutes.builder, locale), {
          [BUILDER_QUERY_PARAM_TEMPLATE_ID]: template.starterTemplateId,
        }),
      )}" class="btn btn-outline btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.createFromTemplate)}: ${escapeHtml(template.name)}">${escapeHtml(messages.pages.controlPlane.createFromTemplate)}</a>
    </div>
  </div>
</article>`;

const renderCapabilityCard = (
  messages: Messages,
  profile: CapabilityProfile,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="card-title text-lg">${escapeHtml(profile.name)}</h3>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(profile.description)}</p>
      </div>
      <span class="badge ${
        profile.status === "ready"
          ? "badge-success"
          : profile.status === "degraded"
            ? "badge-warning"
            : "badge-error"
      } badge-soft">${escapeHtml(profile.status)}</span>
    </div>
    <dl class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.capabilitySettingsLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${profile.settingCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.capabilityReadyLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${profile.readyLaneCount}</dd>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
        <dt class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.capabilityIssuesLabel)}</dt>
        <dd class="mt-2 text-xl font-semibold">${profile.issueLaneCount}</dd>
      </div>
    </dl>
    <div class="flex flex-wrap gap-2">
      ${profile.lanes.map((lane) => `<span class="badge badge-ghost">${escapeHtml(lane)}</span>`).join("")}
    </div>
  </div>
</article>`;

const renderReleaseCard = (
  messages: Messages,
  locale: LocaleCode,
  release: ReleaseRecord,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="card-title text-lg">${escapeHtml(release.projectName)}</h3>
        <p class="text-sm leading-6 text-base-content/70">${escapeHtml(messages.pages.controlPlane.releaseVersionPrefix)} ${escapeHtml(
          String(release.version),
        )}</p>
      </div>
      <span class="badge ${release.published ? "badge-success" : "badge-ghost"} badge-soft">${escapeHtml(
        release.published
          ? messages.pages.controlPlane.activeReleaseLabel
          : messages.pages.controlPlane.archivedReleaseLabel,
      )}</span>
    </div>
    <div class="card-actions justify-start">
      <a href="${escapeHtml(buildProjectRoute(appRoutes.builderStart, locale, release.projectId))}" class="btn btn-outline btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBuilder)}: ${escapeHtml(release.projectName)}">${escapeHtml(messages.pages.controlPlane.openBuilder)}</a>
      <a href="${escapeHtml(buildWorkspaceHref("releases", locale, release.projectId))}" class="btn btn-ghost btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.focusProject)}: ${escapeHtml(release.projectName)}">${escapeHtml(messages.pages.controlPlane.focusProject)}</a>
    </div>
    <p class="text-xs uppercase tracking-[0.2em] text-base-content/45">${escapeHtml(messages.pages.controlPlane.lastUpdatedLabel)} ${escapeHtml(
      formatTimestamp(locale, release.updatedAtMs),
    )}</p>
  </div>
</article>`;

const renderReviewItem = (
  messages: Messages,
  locale: LocaleCode,
  item: ReviewQueueItem,
): string => `<article class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4 shadow-sm">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="font-semibold">${escapeHtml(item.title)}</h3>
        <span class="badge badge-outline badge-sm">${escapeHtml(item.lane)}</span>
      </div>
      <p class="text-sm leading-6 text-base-content/70">${escapeHtml(item.projectName)}</p>
      <p class="text-sm leading-6 text-base-content/68">${escapeHtml(item.summary)}</p>
    </div>
    <span class="badge badge-warning badge-soft">${escapeHtml(item.status)}</span>
  </div>
  <div class="mt-3 flex flex-wrap gap-2">
    <a href="${escapeHtml(buildProjectRoute(appRoutes.builderAutomation, locale, item.projectId, "builder-review-queue"))}" class="btn btn-outline btn-xs min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openReviewQueue)}: ${escapeHtml(item.title)}">${escapeHtml(messages.pages.controlPlane.openReviewQueue)}</a>
    <a href="${escapeHtml(buildWorkspaceHref("review", locale, item.projectId))}" class="btn btn-ghost btn-xs min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.focusProject)}: ${escapeHtml(item.projectName)}">${escapeHtml(messages.pages.controlPlane.focusProject)}</a>
  </div>
</article>`;

const renderWorkspaceMain = (input: ControlPlanePageInput): string => {
  const { messages, locale, workspace, snapshot } = input;

  switch (workspace) {
    case "games":
      return snapshot.games.length > 0
        ? `<div class="grid gap-4 xl:grid-cols-2">${snapshot.games
            .map((game) => renderGameCard(messages, locale, game))
            .join("")}</div>`
        : renderEmptyState(
            platformEmptyIcon,
            messages.pages.controlPlane.emptyGamesTitle,
            messages.pages.controlPlane.emptyGamesDescription,
            `<a href="${escapeHtml(withLocaleQuery(appRoutes.builder, locale))}" class="btn btn-primary btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBuilder)}">${escapeHtml(messages.pages.controlPlane.openBuilder)}</a>`,
          );
    case "libraries":
      return `<div class="space-y-4">
        <div class="grid gap-4 xl:grid-cols-2">${snapshot.libraries.map((library) => renderLibraryCard(messages, library)).join("")}</div>
        <section class="space-y-3">
          <h2 class="text-lg font-semibold tracking-tight">${escapeHtml(messages.pages.controlPlane.sharedAssetsTitle)}</h2>
          ${
            snapshot.sharedAssets.length > 0
              ? snapshot.sharedAssets.map((asset) => renderSharedAssetRow(messages, asset)).join("")
              : renderEmptyState(
                  platformEmptyIcon,
                  messages.pages.controlPlane.emptyLibrariesTitle,
                  messages.pages.controlPlane.emptyLibrariesDescription,
                )
          }
        </section>
      </div>`;
    case "templates":
      return `<div class="grid gap-4 xl:grid-cols-2">${snapshot.templates
        .map((template) => renderTemplateCard(messages, locale, template))
        .join("")}</div>`;
    case "capabilities":
      return snapshot.capabilityProfiles.length > 0
        ? `<div class="grid gap-4 xl:grid-cols-2">${snapshot.capabilityProfiles
            .map((profile) => renderCapabilityCard(messages, profile))
            .join("")}</div>`
        : renderEmptyState(
            platformEmptyIcon,
            messages.pages.controlPlane.emptyCapabilitiesTitle,
            messages.pages.controlPlane.emptyCapabilitiesDescription,
          );
    case "releases":
      return snapshot.releases.length > 0
        ? `<div class="grid gap-4 xl:grid-cols-2">${snapshot.releases
            .map((release) => renderReleaseCard(messages, locale, release))
            .join("")}</div>`
        : renderEmptyState(
            platformEmptyIcon,
            messages.pages.controlPlane.emptyReleasesTitle,
            messages.pages.controlPlane.emptyReleasesDescription,
          );
    case "review":
      return snapshot.reviewQueue.length > 0
        ? `<div class="space-y-3">${snapshot.reviewQueue
            .map((item) => renderReviewItem(messages, locale, item))
            .join("")}</div>`
        : renderEmptyState(
            platformEmptyIcon,
            messages.pages.controlPlane.emptyReviewTitle,
            messages.pages.controlPlane.emptyReviewDescription,
          );
  }
};

/**
 * Renders the top-level platform control plane with workspace tabs and aggregated platform data.
 *
 * @param input Rendering input.
 * @returns HTML string for the control-plane page.
 */
export const renderControlPlanePage = (input: ControlPlanePageInput): string => {
  const { messages, locale, workspace, snapshot, projectId } = input;
  const focusedProject = projectId
    ? (snapshot.games.find((game) => game.id === projectId) ?? null)
    : null;

  const actions = [
    `<a href="${escapeHtml(withLocaleQuery(appRoutes.builder, locale))}" class="btn btn-primary btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.createProject)}">${escapeHtml(messages.pages.controlPlane.createProject)}</a>`,
    focusedProject
      ? `<a href="${escapeHtml(buildProjectRoute(appRoutes.builderStart, locale, focusedProject.id))}" class="btn btn-outline btn-sm min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBuilder)}: ${escapeHtml(focusedProject.name)}">${escapeHtml(messages.pages.controlPlane.openBuilder)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const hero = renderWorkspaceShell({
    eyebrow: messages.navigation.controlPlane,
    title: resolveWorkspaceLabel(messages, workspace),
    description: resolveWorkspaceDescription(messages, workspace),
    actions,
    facets: [
      {
        label: focusedProject
          ? `${messages.pages.controlPlane.focusedProjectLabel}: ${focusedProject.name}`
          : messages.pages.controlPlane.allProjectsLabel,
      },
      { label: `${messages.pages.controlPlane.scopeContractLabel}: global → session` },
      {
        label: `${messages.pages.controlPlane.globalKnowledgeLabel}: ${snapshot.globalKnowledgeDocumentCount}`,
      },
    ],
    metrics: [
      { label: messages.pages.controlPlane.gamesMetric, value: snapshot.games.length },
      { label: messages.pages.controlPlane.librariesMetric, value: snapshot.libraries.length },
      { label: messages.pages.controlPlane.templatesMetric, value: snapshot.templates.length },
      { label: messages.pages.controlPlane.reviewMetric, value: snapshot.reviewQueue.length },
    ],
  });

  const navigatorBody = `${renderWorkspaceTabs(messages, locale, workspace, projectId)}
    <div class="space-y-3">
      ${renderNavigatorLinks(messages, locale, workspace, projectId)}
    </div>`;

  const currentProjectRail = focusedProject
    ? `<div class="space-y-3">
        <div class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(messages.pages.controlPlane.focusedProjectLabel)}</p>
          <h3 class="mt-2 text-lg font-semibold">${escapeHtml(focusedProject.name)}</h3>
          <p class="mt-1 text-sm leading-6 text-base-content/70">${escapeHtml(focusedProject.subtitle)}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <a href="${escapeHtml(buildProjectRoute(appRoutes.builderAi, locale, focusedProject.id, "builder-brand-control-plane"))}" class="btn btn-outline btn-xs min-h-11 surface-tappable" aria-label="${escapeHtml(messages.pages.controlPlane.openBrandControl)}: ${escapeHtml(focusedProject.name)}">${escapeHtml(messages.pages.controlPlane.openBrandControl)}</a>
            <a href="${escapeHtml(buildProjectRoute(appRoutes.game, locale, focusedProject.id))}" class="btn btn-ghost btn-xs min-h-11 surface-tappable" aria-label="${escapeHtml(messages.builder.playtest)}: ${escapeHtml(focusedProject.name)}">${escapeHtml(messages.builder.playtest)}</a>
          </div>
        </div>
      </div>`
    : renderEmptyState(
        platformEmptyIcon,
        messages.pages.controlPlane.allProjectsLabel,
        messages.pages.controlPlane.focusedProjectDescription,
      );

  return `<div class="space-y-6">
    ${hero}
    <div class="xl:grid-cols-[22rem_minmax(0,1fr)] 2xl:grid-cols-[22rem_minmax(0,1fr)_22rem]">
      ${renderWorkspaceFrame({
        navigatorTitle: messages.pages.controlPlane.workspaceLabel,
        navigatorDescription: messages.pages.controlPlane.workspaceDescription,
        navigatorBody,
        mainBody: `<section class="space-y-4">
          <header class="space-y-2">
            <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(resolveWorkspaceLabel(messages, workspace))}</h2>
            <p class="text-sm leading-6 text-base-content/72">${escapeHtml(resolveWorkspaceDescription(messages, workspace))}</p>
          </header>
          ${renderWorkspaceMain(input)}
        </section>`,
        sideSections: [
          {
            title: messages.pages.controlPlane.ownershipModelTitle,
            description: messages.pages.controlPlane.ownershipModelDescription,
            body: `<div class="grid gap-2">${renderScopeCards(messages)}</div>`,
          },
          {
            title: messages.pages.controlPlane.focusedProjectTitle,
            description: messages.pages.controlPlane.focusedProjectDescription,
            body: currentProjectRail,
          },
        ],
      })}
    </div>
  </div>`;
};

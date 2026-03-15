import { escapeHtml } from "../layout.ts";
import type { NavigationBreadcrumbItem, SecondaryNavItem } from "../shared/navigation.ts";
import { renderBreadcrumbRow, renderSecondaryNav } from "../shared/navigation.ts";
import { renderSpinner } from "../shared/ui-components.ts";

/**
 * Summary metric shown in the shared builder workspace hero.
 */
export interface WorkspaceMetric {
  /** Short metric label. */
  readonly label: string;
  /** Display value. */
  readonly value: string | number;
  /** Optional accent class for the value text. */
  readonly toneClassName?: string;
}

/**
 * Non-interactive capability or context chip shown in the workspace hero.
 */
export interface WorkspaceFacet {
  /** Chip label. */
  readonly label: string;
  /** Optional badge class override. */
  readonly badgeClassName?: string;
}

/**
 * Previous or next creator journey link shown in the shared workspace hero.
 */
export interface WorkspaceJourneyAction {
  /** Step label. */
  readonly label: string;
  /** Target href. */
  readonly href: string;
  /** Optional HTMX metadata for progressive enhancement. */
  readonly htmx?: {
    readonly get?: string;
    readonly target?: string;
    readonly swap?: string;
    readonly pushUrl?: boolean;
  };
}

/**
 * Shared creator journey metadata rendered above workspace-specific content.
 */
export interface WorkspaceJourneyConfig {
  /** Ordered creator workflow steps. */
  readonly steps: readonly SecondaryNavItem[];
  /** Currently active workflow step key. */
  readonly activeStepKey: string;
  /** Accessible tab list label. */
  readonly ariaLabel: string;
  /** Optional current-step summary. */
  readonly description?: string;
  /** Optional breadcrumb trail. */
  readonly breadcrumbs?: readonly NavigationBreadcrumbItem[];
  /** Optional previous step action. */
  readonly previousStep?: WorkspaceJourneyAction;
  /** Optional next step action. */
  readonly nextStep?: WorkspaceJourneyAction;
}

/**
 * Shared builder workspace hero configuration.
 */
export interface WorkspaceShellConfig {
  /** Optional eyebrow badge text. */
  readonly eyebrow?: string;
  /** Workspace title. */
  readonly title: string;
  /** Workspace description. */
  readonly description: string;
  /** Summary metrics. */
  readonly metrics?: readonly WorkspaceMetric[];
  /** Optional contextual chips. */
  readonly facets?: readonly WorkspaceFacet[];
  /** Optional trailing action HTML. */
  readonly actions?: string;
  /** Optional shared creator journey metadata. */
  readonly journey?: WorkspaceJourneyConfig;
}

/**
 * Secondary workspace rail section used for navigation, review, or preview.
 */
export interface WorkspaceRailSection {
  /** Section heading. */
  readonly title: string;
  /** Optional supporting copy. */
  readonly description?: string;
  /** Section body HTML. */
  readonly body: string;
}

/**
 * Shared three-column workspace frame for large editor surfaces.
 */
export interface WorkspaceFrameConfig {
  /** Left rail title. */
  readonly navigatorTitle: string;
  /** Optional left rail description. */
  readonly navigatorDescription?: string;
  /** Left rail HTML. */
  readonly navigatorBody: string;
  /** Main authoring content HTML. */
  readonly mainBody: string;
  /** Optional right-rail sections. */
  readonly sideSections?: readonly WorkspaceRailSection[];
}

/**
 * Configuration for a server-driven search and pagination toolbar.
 */
export interface WorkspaceBrowseControlsConfig {
  /** Form action used for GET filtering. */
  readonly action: string;
  /** Current filter text. */
  readonly search: string;
  /** Accessible label for the search input. */
  readonly searchLabel: string;
  /** Input placeholder text. */
  readonly searchPlaceholder: string;
  /** Submit button label. */
  readonly submitLabel: string;
  /** Summary label shown above the pager. */
  readonly resultsLabel: string;
  /** Previous-page button label. */
  readonly previousLabel: string;
  /** Next-page button label. */
  readonly nextLabel: string;
  /** Current page label. */
  readonly pageLabel: string;
  /** Current page number. */
  readonly page: number;
  /** Total number of pages. */
  readonly totalPages: number;
  /** Total number of matching items. */
  readonly totalItems: number;
  /** One-based starting result index. */
  readonly startIndex: number;
  /** One-based ending result index. */
  readonly endIndex: number;
  /** Optional hidden form fields. */
  readonly hiddenFields?: Readonly<Record<string, string>>;
  /** Optional target for HTMX progressive enhancement. */
  readonly htmxTarget?: string;
  /** Optional swap strategy for HTMX progressive enhancement. */
  readonly htmxSwap?: string;
  /** Previous page href when available. */
  readonly previousHref?: string;
  /** Next page href when available. */
  readonly nextHref?: string;
}

/**
 * Paginated builder workspace items.
 */
export interface WorkspacePaginatedItems<T> {
  /** Paginated slice for the active page. */
  readonly items: readonly T[];
  /** Current page number after bounds-clamping. */
  readonly page: number;
  /** Total number of pages. */
  readonly totalPages: number;
  /** Total number of items before slicing. */
  readonly totalItems: number;
  /** One-based starting result index. */
  readonly startIndex: number;
  /** One-based ending result index. */
  readonly endIndex: number;
}

/**
 * Renders the canonical hero section used across builder workspaces.
 *
 * @param config Workspace shell configuration.
 * @returns HTML string for the workspace hero.
 */
export const renderWorkspaceShell = (config: WorkspaceShellConfig): string => {
  const metrics = (config.metrics ?? [])
    .map(
      (
        metric,
      ) => `<div class="interactive-surface surface-tappable rounded-box border border-base-300/70 bg-base-100/80 px-4 py-3">
        <dt class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(metric.label)}</dt>
        <dd class="mt-2 text-2xl font-semibold ${escapeHtml(metric.toneClassName ?? "text-base-content")}">${escapeHtml(String(metric.value))}</dd>
      </div>`,
    )
    .join("");

  const facets = (config.facets ?? [])
    .map(
      (facet) =>
        `<span class="badge badge-outline surface-tappable ${escapeHtml(facet.badgeClassName ?? "")}">${escapeHtml(facet.label)}</span>`,
    )
    .join("");

  const breadcrumbHtml =
    config.journey?.breadcrumbs && config.journey.breadcrumbs.length > 0
      ? renderBreadcrumbRow(config.journey.ariaLabel, config.journey.breadcrumbs, {
          className: "border-none bg-transparent px-0 py-0",
        })
      : "";

  const renderJourneyAction = (
    action: WorkspaceJourneyAction,
    className: string,
    iconHtml: string,
    iconAfter = false,
  ): string => {
    const htmxAttrs = action.htmx
      ? [
          action.htmx.get ? `hx-get="${escapeHtml(action.htmx.get)}"` : "",
          action.htmx.target ? `hx-target="${escapeHtml(action.htmx.target)}"` : "",
          action.htmx.swap ? `hx-swap="${escapeHtml(action.htmx.swap)}"` : "",
          action.htmx.pushUrl === false ? "" : 'hx-push-url="true"',
        ]
          .filter(Boolean)
          .join(" ")
      : "";

    return `<a class="${escapeHtml(`${className} surface-tappable`)}" href="${escapeHtml(action.href)}" aria-label="${escapeHtml(action.label)}" ${htmxAttrs}>
      ${iconAfter ? `<span>${escapeHtml(action.label)}</span>${iconHtml}` : `${iconHtml}<span>${escapeHtml(action.label)}</span>`}
    </a>`;
  };

  const journeyActions = [
    config.journey?.previousStep
      ? renderJourneyAction(
          config.journey.previousStep,
          "btn btn-ghost btn-sm",
          '<span aria-hidden="true">←</span>',
        )
      : "",
    config.journey?.nextStep
      ? renderJourneyAction(
          config.journey.nextStep,
          "btn btn-primary btn-sm",
          '<span aria-hidden="true">→</span>',
          true,
        )
      : "",
  ]
    .filter(Boolean)
    .join("");

  const journeyHtml = config.journey
    ? `<section class="surface-shell surface-section interactive-surface rounded-[1.5rem] border border-base-300/80 bg-base-100/85 p-4 shadow-sm">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              ${breadcrumbHtml}
              ${
                config.journey.description
                  ? `<p class="text-sm leading-6 text-base-content/72">${escapeHtml(config.journey.description)}</p>`
                  : ""
              }
            </div>
            ${journeyActions ? `<div class="flex flex-wrap gap-2">${journeyActions}</div>` : ""}
          </div>
          ${renderSecondaryNav(
            config.journey.steps,
            config.journey.activeStepKey,
            config.journey.ariaLabel,
          )}
        </div>
      </section>`
    : "";

  return `<section class="surface-shell surface-section section-stack rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-200 via-base-100 to-base-100 shadow-sm">
    <div class="flex flex-col gap-5 p-5 sm:p-6 lg:p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-3">
          ${
            config.eyebrow
              ? `<span class="badge badge-primary badge-soft">${escapeHtml(config.eyebrow)}</span>`
              : ""
          }
          <div class="space-y-2">
            <h1 class="text-heading-1 font-semibold tracking-tight">${escapeHtml(config.title)}</h1>
            <p class="max-w-3xl text-sm leading-6 text-base-content/72">${escapeHtml(config.description)}</p>
          </div>
        </div>
        ${config.actions ? `<div class="flex flex-wrap gap-2 self-start">${config.actions}</div>` : ""}
      </div>
      ${journeyHtml}
      ${facets ? `<div class="flex flex-wrap gap-2">${facets}</div>` : ""}
      ${metrics ? `<dl class="workspace-card-grid">${metrics}</dl>` : ""}
    </div>
  </section>`;
};

/**
 * Paginates workspace items for SSR list/detail surfaces.
 *
 * @param items Full item list.
 * @param page Requested page number.
 * @param pageSize Number of items per page.
 * @returns Clamped page metadata and item slice.
 */
export const paginateWorkspaceItems = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): WorkspacePaginatedItems<T> => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startOffset = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(startOffset, startOffset + pageSize);
  const startIndex = totalItems === 0 ? 0 : startOffset + 1;
  const endIndex = totalItems === 0 ? 0 : startOffset + pagedItems.length;

  return {
    items: pagedItems,
    page: currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };
};

/**
 * Renders a server-driven search and pagination toolbar for builder library surfaces.
 *
 * @param config Toolbar configuration.
 * @returns HTML string for browse controls.
 */
export const renderWorkspaceBrowseControls = (config: WorkspaceBrowseControlsConfig): string => {
  const indicatorId = `browse-indicator-${config.searchLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  const hiddenFields = Object.entries(config.hiddenFields ?? {})
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`,
    )
    .join("");
  const htmxAttributes = config.htmxTarget
    ? [
        `hx-get="${escapeHtml(config.action)}"`,
        `hx-target="${escapeHtml(config.htmxTarget)}"`,
        `hx-swap="${escapeHtml(config.htmxSwap ?? "innerHTML")}"`,
        'hx-push-url="true"',
        `hx-indicator="#${escapeHtml(indicatorId)}"`,
      ].join(" ")
    : "";
  const pagerSummary =
    config.totalItems === 0
      ? `0 / ${config.totalItems}`
      : `${config.startIndex}-${config.endIndex} / ${config.totalItems}`;

  const renderPagerLink = (
    href: string | undefined,
    label: string,
    className: string,
    ariaLabel: string,
  ): string =>
    href
      ? `<a class="${escapeHtml(className)}" href="${escapeHtml(href)}"${
          config.htmxTarget
            ? ` hx-get="${escapeHtml(href)}" hx-target="${escapeHtml(config.htmxTarget)}" hx-swap="${escapeHtml(
                config.htmxSwap ?? "innerHTML",
              )}" hx-push-url="true" hx-indicator="#${escapeHtml(indicatorId)}"`
            : ""
        } aria-label="${escapeHtml(ariaLabel)}">${escapeHtml(label)}</a>`
      : `<span class="${escapeHtml(`${className} btn-disabled`)}" aria-disabled="true" aria-label="${escapeHtml(
          ariaLabel,
        )}" role="link">${escapeHtml(label)}</span>`;

  return `<section class="surface-shell surface-section section-stack space-y-3 rounded-[1.25rem] border border-base-300 bg-base-200/40 p-4">
    <form method="get" action="${escapeHtml(config.action)}" class="space-y-3" aria-label="${escapeHtml(config.searchLabel)}" ${htmxAttributes}>
      ${hiddenFields}
      <input type="hidden" name="page" value="1" />
      <fieldset class="fieldset">
        <legend class="fieldset-legend">${escapeHtml(config.searchLabel)}</legend>
        <div class="join join-vertical w-full gap-2 sm:join-horizontal">
          <input name="search" type="search" class="input join-item w-full" value="${escapeHtml(config.search)}" placeholder="${escapeHtml(config.searchPlaceholder)}" aria-label="${escapeHtml(config.searchLabel)}" />
          <button type="submit" class="btn btn-outline btn-sm join-item" aria-label="${escapeHtml(config.submitLabel)}">${escapeHtml(config.submitLabel)}</button>
        </div>
      </fieldset>
      <div class="flex items-center gap-2 text-xs text-base-content/60" role="status" aria-live="polite" aria-label="${escapeHtml(config.resultsLabel)}">
        <span>${escapeHtml(config.resultsLabel)}: ${escapeHtml(pagerSummary)}</span>
        ${renderSpinner("xs", { id: indicatorId, ariaLabel: config.submitLabel })}
      </div>
    </form>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs uppercase tracking-[0.2em] text-base-content/50">${escapeHtml(config.pageLabel)} ${config.page} / ${config.totalPages}</p>
      <div class="join join-horizontal surface-tappable">
        ${renderPagerLink(
          config.previousHref,
          config.previousLabel,
          "btn btn-outline btn-sm join-item",
          config.previousLabel,
        )}
        ${renderPagerLink(
          config.nextHref,
          config.nextLabel,
          "btn btn-outline btn-sm join-item",
          config.nextLabel,
        )}
      </div>
    </div>
  </section>`;
};

/**
 * Renders a scalable builder editor frame with navigator, main editor, and side rail.
 *
 * @param config Workspace frame content.
 * @returns HTML string for the editor frame.
 */
export const renderWorkspaceFrame = (config: WorkspaceFrameConfig): string => {
  const sideRail = (config.sideSections ?? [])
    .map(
      (
        section,
      ) => `<section class="surface-shell surface-section interactive-surface rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
        <div class="flex min-h-0 flex-col gap-3 p-5">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold tracking-tight">${escapeHtml(section.title)}</h2>
            ${
              section.description
                ? `<p class="text-sm leading-6 text-base-content/72">${escapeHtml(section.description)}</p>`
                : ""
            }
          </div>
          <div class="surface-scroll surface-scroll-y surface-scroll-fade-y touch-pan-y space-y-3 2xl:max-h-[calc(100vh-14rem)] 2xl:overflow-auto 2xl:pr-1">${section.body}</div>
        </div>
      </section>`,
    )
    .join("");

  return `<section class="workspace-grid min-h-0 ${sideRail ? "has-side-rail" : ""}">
    <aside class="space-y-4 min-h-0 xl:surface-sticky">
      <section class="surface-shell surface-section interactive-surface rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
        <div class="flex flex-col gap-3 p-5">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold tracking-tight">${escapeHtml(config.navigatorTitle)}</h2>
            ${
              config.navigatorDescription
                ? `<p class="text-sm leading-6 text-base-content/72">${escapeHtml(config.navigatorDescription)}</p>`
                : ""
            }
          </div>
          <div class="surface-scroll surface-scroll-y surface-scroll-fade-y touch-pan-y space-y-4 xl:max-h-[calc(100vh-14rem)] xl:overflow-auto xl:pr-1">${config.navigatorBody}</div>
        </div>
      </section>
    </aside>
    <div class="min-w-0 min-h-0 space-y-4">
      ${config.mainBody}
    </div>
    ${sideRail ? `<aside class="space-y-4 min-h-0 2xl:surface-sticky">${sideRail}</aside>` : ""}
  </section>`;
};

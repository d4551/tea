/**
 * Builder Workspace Header
 *
 * Shared header component for builder editor views. Provides a title,
 * description, and contextual workspace sub-tabs using DaisyUI v5 best practices.
 */
import { escapeHtml } from "../layout.ts";
import { renderSecondaryNav, type SecondaryNavItem } from "../shared/navigation.ts";
import type { ColorToken } from "../shared/ui-components.ts";

/**
 * Single tab descriptor for the workspace header.
 */
export type WorkspaceTab = SecondaryNavItem;

/**
 * Configuration for the workspace header component.
 */
export interface WorkspaceHeaderConfig {
  /** Localized workspace title. */
  readonly title: string;
  /** Optional workspace description. */
  readonly description?: string;
  /** Available sub-tabs. */
  readonly tabs: readonly WorkspaceTab[];
  /** Currently active tab key. */
  readonly activeTab: string;
  /** Color token for the active tab (e.g. "primary", "secondary"). */
  readonly colorToken?: ColorToken;
  /** Optional trailing action HTML. */
  readonly actions?: string;
  /** Optional eyebrow badge text. */
  readonly eyebrow?: string;
  /** Optional metrics to display. */
  readonly metrics?: readonly {
    readonly label: string;
    readonly value: string | number;
    readonly colorToken?: ColorToken;
  }[];
}

/**
 * Renders a workspace header with title, optional description,
 * contextual sub-tabs, and optional trailing actions.
 *
 * Uses DaisyUI v5 tabs with proper ARIA attributes for accessibility.
 *
 * @param config Workspace header configuration.
 * @returns HTML string for the workspace header.
 */
export const renderWorkspaceHeader = (config: WorkspaceHeaderConfig): string => {
  const colorToken = config.colorToken ?? "primary";

  const descriptionHtml = config.description
    ? `<p class="text-sm text-base-content/60 mt-1">${escapeHtml(config.description)}</p>`
    : "";

  const eyebrowHtml = config.eyebrow
    ? `<span class="badge badge-${colorToken} badge-soft mb-2">${escapeHtml(config.eyebrow)}</span>`
    : "";

  const metricsHtml =
    config.metrics && config.metrics.length > 0
      ? `<div class="workspace-card-grid mt-3">
        ${config.metrics
          .map((metric) => {
            const valueClass = metric.colorToken
              ? `text-${metric.colorToken}`
              : "text-base-content";
            return `<div class="interactive-surface rounded-box border border-base-300/70 bg-base-100/80 px-3 py-2">
            <dt class="text-xs font-semibold uppercase tracking-wider text-base-content/55">${escapeHtml(metric.label)}</dt>
            <dd class="mt-1 text-xl font-semibold ${valueClass}">${escapeHtml(String(metric.value))}</dd>
          </div>`;
          })
          .join("")}
      </div>`
      : "";

  const actionsHtml = config.actions
    ? `<div class="flex flex-wrap gap-2 self-start">${config.actions}</div>`
    : "";

  return `
    <header class="surface-shell surface-section section-stack mb-6 space-y-3 rounded-[1.5rem] border border-base-300 bg-base-100/80 p-5 shadow-sm sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          ${eyebrowHtml}
          <h2 class="text-xl font-bold">${escapeHtml(config.title)}</h2>
          ${descriptionHtml}
          ${metricsHtml}
        </div>
        ${actionsHtml}
      </div>
      ${
        config.tabs.length > 0
          ? `
        ${renderSecondaryNav(config.tabs, config.activeTab, `${config.title} tabs`, colorToken)}
      `
          : ""
      }
    </header>`;
};

/**
 * Builder Workspace Header
 *
 * Shared header component for builder editor views. Provides a title,
 * description, and contextual workspace sub-tabs using DaisyUI tab styles.
 */
import { escapeHtml } from "../layout.ts";

/**
 * Single tab descriptor for the workspace header.
 */
export interface WorkspaceTab {
  /** Unique key for this tab. */
  readonly key: string;
  /** Display label. */
  readonly label: string;
  /** SVG icon string. */
  readonly icon: string;
}

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
  readonly colorToken?: string;
  /** Optional trailing action HTML. */
  readonly actions?: string;
}

/**
 * Renders a workspace header with title, optional description,
 * contextual sub-tabs, and optional trailing actions.
 *
 * @param config Workspace header configuration.
 * @returns HTML string for the workspace header.
 */
export const renderWorkspaceHeader = (config: WorkspaceHeaderConfig): string => {
  const colorToken = config.colorToken ?? "primary";
  const tabItems = config.tabs
    .map((tab) => {
      const isActive = tab.key === config.activeTab;
      const activeClass = isActive
        ? `badge-primary text-primary-content border-transparent`
        : `badge-ghost text-${colorToken}`;
      return `<li>
        <span class="badge badge-lg gap-1.5 px-3 py-4 ${activeClass}" ${isActive ? 'aria-current="page"' : ""}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">${tab.icon}</svg>
        <span>${escapeHtml(tab.label)}</span>
        </span>
      </li>`;
    })
    .join("");

  const descriptionHtml = config.description
    ? `<p class="text-sm text-base-content/60 mt-1">${escapeHtml(config.description)}</p>`
    : "";

  return `
    <div class="space-y-3 mb-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold">${escapeHtml(config.title)}</h2>
          ${descriptionHtml}
        </div>
        ${config.actions ? `<div class="flex flex-wrap gap-2 self-start">${config.actions}</div>` : ""}
      </div>
      <nav aria-label="${escapeHtml(config.title)}">
        <ul class="flex flex-wrap gap-2">${tabItems}</ul>
      </nav>
    </div>`;
};

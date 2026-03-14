import { escapeHtml } from "../layout.ts";

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
      (metric) => `<div class="rounded-box border border-base-300/70 bg-base-100/80 px-4 py-3">
        <dt class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(metric.label)}</dt>
        <dd class="mt-2 text-2xl font-semibold ${escapeHtml(metric.toneClassName ?? "text-base-content")}">${escapeHtml(String(metric.value))}</dd>
      </div>`,
    )
    .join("");

  const facets = (config.facets ?? [])
    .map(
      (facet) =>
        `<span class="badge badge-outline ${escapeHtml(facet.badgeClassName ?? "")}">${escapeHtml(facet.label)}</span>`,
    )
    .join("");

  return `<section class="rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-200 via-base-100 to-base-100 shadow-sm">
    <div class="flex flex-col gap-5 p-6 lg:p-8">
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
      ${facets ? `<div class="flex flex-wrap gap-2">${facets}</div>` : ""}
      ${metrics ? `<dl class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">${metrics}</dl>` : ""}
    </div>
  </section>`;
};

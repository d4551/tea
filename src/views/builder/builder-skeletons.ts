/**
 * Builder Skeleton Components
 *
 * DaisyUI 5 skeleton placeholder components rendered during async tab loads.
 * Used as fallback content while HTMX fetches editor panels.
 */
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Renders a generic card skeleton placeholder.
 *
 * @param rows Number of text-line skeletons inside the card.
 * @returns HTML string with DaisyUI skeleton components.
 */
export const renderCardSkeleton = (rows = 3): string => {
  const lines = Array.from({ length: rows }, () => `<div class="skeleton h-4 w-full"></div>`).join(
    "",
  );
  return `<div class="card card-border bg-base-100">
    <div class="card-body gap-4">
      <div class="skeleton h-6 w-1/3"></div>
      ${lines}
    </div>
  </div>`;
};

/**
 * Renders a full editor skeleton matching the typical editor layout.
 *
 * @param messages Localized messages.
 * @returns HTML string with skeleton layout.
 */
export const renderEditorSkeleton = (messages: Messages): string => `
  <div class="space-y-6" aria-busy="true" aria-label="${escapeHtml(messages.common.loading)}">
    <div class="flex items-center justify-between">
      <div class="skeleton h-8 w-48"></div>
      <div class="skeleton h-10 w-32"></div>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      ${renderCardSkeleton(4)}
      ${renderCardSkeleton(3)}
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      ${renderCardSkeleton(2)}
      ${renderCardSkeleton(2)}
      ${renderCardSkeleton(2)}
    </div>
  </div>`;

/**
 * Renders a list skeleton with repeating row placeholders.
 *
 * @param rowCount Number of list item skeletons.
 * @returns HTML string with skeleton list.
 */
export const renderListSkeleton = (rowCount = 5): string => {
  const rows = Array.from(
    { length: rowCount },
    () => `<div class="flex items-center gap-3 p-3">
      <div class="skeleton size-10 shrink-0 rounded-full"></div>
      <div class="flex flex-1 flex-col gap-2">
        <div class="skeleton h-4 w-2/3"></div>
        <div class="skeleton h-3 w-1/3"></div>
      </div>
    </div>`,
  ).join("");

  return `<div class="card card-border bg-base-100">
    <div class="card-body p-0 divide-y divide-base-300" aria-busy="true">
      ${rows}
    </div>
  </div>`;
};

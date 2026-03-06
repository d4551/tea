import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { AutomationRun } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Renders the automation review and orchestration workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param runs Automation runs for the project.
 * @returns HTML for the automation workspace.
 */
export const renderAutomationPanel = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  runs: readonly AutomationRun[],
): string => {
  const createRunAction = `${appRoutes.builderApiAutomationRuns}/create/form`;
  const runCards = runs
    .map((run) => {
      const reviewAction = withQueryParameters(
        `${appRoutes.builderApiAutomationRuns}/${encodeURIComponent(run.id)}/approve`,
        {
          locale,
          projectId,
        },
      );
      const runSpinnerId = `automation-run-${run.id.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner`;
      const reviewActions =
        run.status === "blocked_for_approval"
          ? `<div class="card-actions justify-end gap-2">
              <form hx-post="${escapeHtml(reviewAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${runSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="true" />
                <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.approveAction)}</button>
              </form>
              <form hx-post="${escapeHtml(reviewAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${runSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="false" />
                <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.cancelAction)}</button>
              </form>
              <span id="${runSpinnerId}" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>`
          : "";

      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(run.goal)}</h3>
            <span class="badge badge-outline">${escapeHtml(run.status)}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(run.statusMessage)}</p>
          <div class="space-y-2">
            ${run.steps
              .map(
                (step) => `<div class="rounded-box bg-base-200/70 px-3 py-2 text-sm">
                  <span class="font-medium">${escapeHtml(step.action)}</span>: ${escapeHtml(step.summary)}
                </div>`,
              )
              .join("")}
          </div>
          ${reviewActions}
        </div>
      </article>`;
    })
    .join("");

  return `<section class="space-y-6">
    <article class="card card-border bg-base-100 shadow-sm">
      <form class="card-body gap-3" hx-post="${escapeHtml(createRunAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#automation-create-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
        <h1 class="card-title text-2xl">${escapeHtml(messages.builder.automationWorkspaceTitle)}</h1>
        <textarea name="goal" class="textarea textarea-bordered w-full" rows="4" placeholder="Collect review evidence for the current scene, queue attachments, and prepare a draft apply plan." required></textarea>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.createAutomationRun)}</button>
          <span id="automation-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
        </div>
      </form>
    </article>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.automation)}</h2>
        <span class="badge badge-outline">${runs.length}</span>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">${runCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.automationWorkspaceTitle)}</span></div>`}</div>
    </section>
  </section>`;
};

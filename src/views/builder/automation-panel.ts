import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { AutomationRun, GenerationArtifact } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { cardClasses, renderBuilderHiddenFields, spinnerClasses } from "../shared/ui-components.ts";
import {
  getArtifactLabel,
  getArtifactSummaryLabel,
  getAutomationStatusMessageLabel,
  getAutomationStepActionLabel,
  getAutomationStepSummaryLabel,
  getLongRunningStatusLabel,
} from "./view-labels.ts";
import { renderWorkspaceShell } from "./workspace-shell.ts";

/**
 * Renders the automation review and orchestration workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param runs Automation runs for the project.
 * @param artifacts Reviewable artifacts for the project.
 * @returns HTML for the automation workspace.
 */
export const renderAutomationPanel = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  runs: readonly AutomationRun[],
  artifacts: readonly GenerationArtifact[],
): string => {
  const createRunAction = `${appRoutes.builderApiAutomationRuns}/create/form`;
  const artifactLookup = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const blockedRuns = runs.filter((run) => run.status === "blocked_for_approval").length;
  const completedRuns = runs.filter((run) => run.status === "succeeded").length;
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
      const linkedArtifacts = run.artifactIds
        .map((artifactId) => artifactLookup.get(artifactId))
        .filter((artifact): artifact is GenerationArtifact => Boolean(artifact));
      const reviewActions =
        run.status === "blocked_for_approval"
          ? `<div class="card-actions justify-end gap-2">
              <form hx-post="${escapeHtml(reviewAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${runSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="true" />
                <button
                  type="submit"
                  class="btn btn-primary btn-sm"
                  aria-label="${escapeHtml(messages.builder.approveAction)}: ${escapeHtml(run.goal)}"
                >${escapeHtml(messages.builder.approveAction)}</button>
              </form>
              <form hx-post="${escapeHtml(reviewAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${runSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="false" />
                <button
                  type="submit"
                  class="btn btn-outline btn-sm"
                  aria-label="${escapeHtml(messages.builder.cancelAction)}: ${escapeHtml(run.goal)}"
                >${escapeHtml(messages.builder.cancelAction)}</button>
              </form>
              <span id="${runSpinnerId}" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>`
          : "";

      return `<article class="${cardClasses.bordered}">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(run.goal)}</h3>
            <span class="badge badge-outline">${escapeHtml(getLongRunningStatusLabel(messages, run.status))}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(getAutomationStatusMessageLabel(messages, run.statusMessage))}</p>
          <div class="space-y-2">
            ${run.steps
              .map(
                (step) => `<div class="rounded-box bg-base-200/70 px-3 py-2 text-sm">
                  <span class="font-medium">${escapeHtml(getAutomationStepActionLabel(messages, step.action))}</span>: ${escapeHtml(getAutomationStepSummaryLabel(messages, step.summary))}
                  ${
                    step.evidenceSource
                      ? `<div class="mt-2">
                          <a class="link link-primary text-xs" href="${escapeHtml(step.evidenceSource)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(messages.builder.openAutomationEvidence)}: ${escapeHtml(getAutomationStepSummaryLabel(messages, step.summary))}">${escapeHtml(messages.builder.openAutomationEvidence)}</a>
                        </div>`
                      : ""
                  }
                </div>`,
              )
              .join("")}
          </div>
          ${
            linkedArtifacts.length > 0
              ? `<div class="space-y-2">
                  <h4 class="text-sm font-semibold">${escapeHtml(messages.builder.automationArtifactsLabel)}</h4>
                  ${linkedArtifacts
                    .map(
                      (
                        artifact,
                      ) => `<div class="rounded-box bg-base-200/70 px-3 py-2 text-sm" data-summary="${escapeHtml(artifact.summary)}">
                        <div class="font-medium">${escapeHtml(getArtifactLabel(messages, artifact))}</div>
                        <div class="text-base-content/75">${escapeHtml(getArtifactSummaryLabel(messages, artifact.summary))}</div>
                        <a class="link link-primary text-xs" href="${escapeHtml(artifact.previewSource)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(messages.builder.openAutomationEvidence)}: ${escapeHtml(getArtifactLabel(messages, artifact))}">${escapeHtml(messages.builder.openAutomationEvidence)}</a>
                      </div>`,
                    )
                    .join("")}
                </div>`
              : ""
          }
          ${reviewActions}
        </div>
      </article>`;
    })
    .join("");

  const emptyRunAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noAutomationRuns)}</span></div>`;

  return `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.automation,
      title: messages.builder.automation,
      description: messages.builder.advancedAutomationDescription,
      facets: [
        { label: messages.builder.readinessPartial, badgeClassName: "badge-warning" },
        { label: messages.builder.automationArtifactsLabel, badgeClassName: "badge-secondary" },
      ],
      metrics: [
        { label: messages.builder.automation, value: runs.length, toneClassName: "text-primary" },
        { label: messages.builder.automationArtifactsLabel, value: artifacts.length },
        {
          label: messages.builder.readinessPartial,
          value: blockedRuns,
          toneClassName: blockedRuns > 0 ? "text-warning" : "text-base-content",
        },
        { label: messages.builder.readinessImplemented, value: completedRuns },
      ],
    })}
    <article class="${cardClasses.bordered}">
      <form class="card-body gap-3" hx-post="${escapeHtml(createRunAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#automation-create-spinner" hx-disabled-elt="button, input, select, textarea">
        ${renderBuilderHiddenFields(projectId, locale)}
        <h2 class="card-title text-2xl">${escapeHtml(messages.builder.createAutomationRun)}</h2>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.automationGoalLabel)}</legend>
          <textarea name="goal" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.automationGoalPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.automationGoalLabel)}"></textarea>
        </fieldset>
        <div class="rounded-box border border-base-300/80 bg-base-200/45 p-3 text-xs text-base-content/70">
          ${escapeHtml(messages.builder.advancedAutomationDescription)}
        </div>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.createAutomationRun)}">${escapeHtml(messages.builder.createAutomationRun)}</button>
          <span id="automation-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
    </article>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.automation)}</h2>
        <span class="badge badge-outline">${runs.length}</span>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">${runs.length === 0 ? emptyRunAlert : runCards}</div>
    </section>
  </section>`;
};

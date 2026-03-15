import type { LocaleCode } from "../../config/environment.ts";
import { BUILDER_LIBRARY_PAGE_SIZE } from "../../shared/constants/builder-defaults.ts";
import { BUILDER_QUERY_PARAM_PAGE } from "../../shared/constants/builder-query.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
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
import {
  paginateWorkspaceItems,
  renderWorkspaceBrowseControls,
  renderWorkspaceFrame,
  renderWorkspaceShell,
} from "./workspace-shell.ts";

const renderWorkbenchJumpLinks = (
  ariaLabel: string,
  links: ReadonlyArray<{ label: string; href: string; tone?: "primary" | "ghost" | "outline" }>,
): string => `<nav class="overflow-x-auto" aria-label="${escapeHtml(ariaLabel)}">
  <div class="flex min-w-max flex-wrap gap-2">
    ${links
      .map(
        (link) =>
          `<a class="btn btn-${escapeHtml(link.tone ?? "ghost")} btn-sm" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
      )
      .join("")}
  </div>
</nav>`;

const renderWorkbenchSummaryCard = (
  title: string,
  description: string,
  actions: ReadonlyArray<{ label: string; href: string; tone?: "primary" | "ghost" | "outline" }>,
): string => `<article class="${cardClasses.bordered}">
  <div class="card-body gap-4">
    <div class="space-y-2">
      <h3 class="card-title text-base">${escapeHtml(title)}</h3>
      <p class="text-sm leading-6 text-base-content/72">${escapeHtml(description)}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      ${actions
        .map(
          (action) =>
            `<a class="btn btn-${escapeHtml(action.tone ?? "ghost")} btn-sm" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`,
        )
        .join("")}
    </div>
  </div>
</article>`;

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
  runs: ReadonlyArray<AutomationRun>,
  artifacts: ReadonlyArray<GenerationArtifact>,
  page = 1,
): string => {
  const createRunAction = interpolateRoutePath(appRoutes.builderApiAutomationRunsCreateForm, {
    projectId,
  });
  const settingsHref = withQueryParameters(
    interpolateRoutePath(appRoutes.builderAi, { projectId }),
    {
      lang: locale,
    },
  );
  const playtestHref = withQueryParameters(interpolateRoutePath(appRoutes.game, { projectId }), {
    lang: locale,
  });
  const artifactLookup = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const blockedRuns = runs.filter((run) => run.status === "blocked_for_approval").length;
  const completedRuns = runs.filter((run) => run.status === "succeeded").length;
  const runCards = runs
    .map((run) => {
      const reviewAction = withQueryParameters(
        interpolateRoutePath(appRoutes.builderApiAutomationRunApprove, {
          projectId,
          runId: run.id,
        }),
        {
          locale,
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

  const operationsPath = interpolateRoutePath(appRoutes.builderAutomation, { projectId });
  const operationsAction = withQueryParameters(operationsPath, { lang: locale });
  const reviewQueueHref = withQueryParameters(`${operationsPath}#builder-review-queue`, {
    lang: locale,
  });
  const composerHref = withQueryParameters(`${operationsPath}#builder-automation-composer`, {
    lang: locale,
  });
  const paginatedRuns = paginateWorkspaceItems(Array.from(runs), page, BUILDER_LIBRARY_PAGE_SIZE);
  const previousHref =
    paginatedRuns.page > 1
      ? withQueryParameters(operationsAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedRuns.page - 1),
        })
      : undefined;
  const nextHref =
    paginatedRuns.page < paginatedRuns.totalPages
      ? withQueryParameters(operationsAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedRuns.page + 1),
        })
      : undefined;
  const browseControls = renderWorkspaceBrowseControls({
    action: operationsAction,
    search: "",
    searchLabel: messages.builder.operations,
    searchPlaceholder: messages.builder.automationGoalPlaceholder,
    submitLabel: messages.builder.filterAction,
    resultsLabel: messages.builder.resultsLabel,
    previousLabel: messages.builder.previousPage,
    nextLabel: messages.builder.nextPage,
    pageLabel: messages.builder.pageLabel,
    page: paginatedRuns.page,
    totalPages: paginatedRuns.totalPages,
    totalItems: paginatedRuns.totalItems,
    startIndex: paginatedRuns.startIndex,
    endIndex: paginatedRuns.endIndex,
    hiddenFields: { lang: locale, projectId },
    htmxTarget: "#builder-content",
    previousHref,
    nextHref,
  });
  const jumpLinks = renderWorkbenchJumpLinks(messages.builder.operations, [
    { label: messages.builder.createAutomationRun, href: composerHref, tone: "primary" },
    { label: messages.builder.automationArtifactsLabel, href: reviewQueueHref },
    { label: messages.builder.projectSettings, href: settingsHref },
    { label: messages.builder.playtest, href: playtestHref, tone: "outline" },
  ]);
  const workbenchCards = [
    renderWorkbenchSummaryCard(
      messages.builder.createAutomationRun,
      messages.builder.advancedAutomationDescription,
      [
        { label: messages.builder.createAutomationRun, href: composerHref, tone: "primary" },
        { label: messages.builder.projectSettings, href: settingsHref },
      ],
    ),
    renderWorkbenchSummaryCard(
      messages.builder.automationArtifactsLabel,
      messages.builder.previewReady,
      [
        { label: messages.builder.automationArtifactsLabel, href: reviewQueueHref, tone: "primary" },
        { label: messages.builder.operations, href: operationsAction },
      ],
    ),
    renderWorkbenchSummaryCard(
      messages.builder.playtest,
      messages.builder.projectPlayHint,
      [
        { label: messages.builder.playtest, href: playtestHref, tone: "outline" },
        { label: messages.builder.projectSettings, href: settingsHref, tone: "ghost" },
      ],
    ),
  ].join("");

  return `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.advancedTools,
      title: messages.builder.operations,
      description: messages.builder.advancedAutomationDescription,
      facets: [
        { label: messages.builder.advancedAutomationDescription, badgeClassName: "badge-outline" },
        { label: messages.builder.automationArtifactsLabel, badgeClassName: "badge-secondary" },
      ],
      metrics: [
        { label: messages.builder.automation, value: runs.length, toneClassName: "text-primary" },
        { label: messages.builder.automationArtifactsLabel, value: artifacts.length },
        {
          label: messages.builder.jobStatusBlockedForApproval,
          value: blockedRuns,
          toneClassName: blockedRuns > 0 ? "text-warning" : "text-base-content",
        },
        { label: messages.builder.jobStatusSucceeded, value: completedRuns },
      ],
      actions: `
        <a class="btn btn-outline btn-sm" href="${escapeHtml(settingsHref)}" aria-label="${escapeHtml(messages.builder.projectSettings)}">
          ${escapeHtml(messages.builder.projectSettings)}
        </a>
        <a class="btn btn-primary btn-sm" href="${escapeHtml(playtestHref)}" aria-label="${escapeHtml(messages.builder.playtest)}">
          ${escapeHtml(messages.builder.playtest)}
        </a>
        `,
    })}
    ${renderWorkspaceFrame({
      navigatorTitle: messages.builder.createAutomationRun,
      navigatorDescription: messages.builder.advancedAutomationDescription,
      navigatorBody: `<div class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4 shadow-sm">
          ${jumpLinks}
        </div>
        <article id="builder-automation-composer" class="${cardClasses.bordered}">
          <form class="card-body gap-3" hx-post="${escapeHtml(createRunAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#automation-create-spinner" hx-disabled-elt="button, input, select, textarea">
            ${renderBuilderHiddenFields(projectId, locale)}
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
        </article>`,
      mainBody: `<div class="space-y-4">
          <section class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-4 p-5 lg:p-6">
              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.operations)}</h2>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.advancedAutomationDescription)}</p>
              </div>
              <div class="grid gap-4 xl:grid-cols-3">
                ${workbenchCards}
              </div>
            </div>
          </section>
          <section id="builder-review-queue" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.operations)}</h2>
            <span class="badge badge-outline">${runs.length}</span>
          </div>
          ${browseControls}
          <div class="grid gap-4 xl:grid-cols-2">${paginatedRuns.items.length === 0 ? emptyRunAlert : paginatedRuns.items.map((run) => {
            const reviewAction = withQueryParameters(
              interpolateRoutePath(appRoutes.builderApiAutomationRunApprove, {
                projectId,
                runId: run.id,
              }),
              { locale },
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
                      <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.approveAction)}: ${escapeHtml(run.goal)}">${escapeHtml(messages.builder.approveAction)}</button>
                    </form>
                    <form hx-post="${escapeHtml(reviewAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${runSpinnerId}" hx-disabled-elt="button">
                      <input type="hidden" name="approved" value="false" />
                      <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.cancelAction)}: ${escapeHtml(run.goal)}">${escapeHtml(messages.builder.cancelAction)}</button>
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
                ${reviewActions}
              </div>
            </article>`;
          }).join("")}</div>
        </section>
      </div>`,
      sideSections: [
        {
          title: messages.builder.reviewLabelPrefix,
          description: messages.builder.previewReady,
          body: `<div class="space-y-3 text-sm leading-6 text-base-content/72">
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.advancedAutomationDescription)}</div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.automationArtifactsLabel)}: ${artifacts.length}</div>
          </div>`,
        },
      ],
    })}
  </section>`;
};

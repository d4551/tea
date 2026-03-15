import type { LocaleCode } from "../../config/environment.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withLocaleQuery } from "../../shared/constants/routes.ts";
import type {
  BuilderWorkflowStage,
  CreatorCapability,
  CreatorDashboardContext,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { type ColorToken, cardClasses, renderStats } from "../shared/ui-components.ts";
import { buildBuilderWorkflowStages } from "./builder-flow.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";
import { getCapabilityStatusBadgeClass, getCapabilityStatusLabel } from "./capability-state.ts";

import { renderWorkspaceFrame, renderWorkspaceShell } from "./workspace-shell.ts";

interface CapabilityMetric {
  readonly label: string;
  readonly value: string | number;
  readonly tone?: "default" | "primary" | "secondary" | "accent";
}

const metricToneToken = (tone: CapabilityMetric["tone"]): ColorToken | undefined => {
  switch (tone) {
    case "primary":
      return "primary";
    case "secondary":
      return "secondary";
    case "accent":
      return "accent";
    default:
      return undefined;
  }
};

const renderMetricStats = (
  metrics: readonly CapabilityMetric[],
  className = "bg-base-200",
): string =>
  renderStats({
    stats: metrics.map((metric) => ({
      title: metric.label,
      value: String(metric.value),
      description: "",
      colorToken: metricToneToken(metric.tone),
    })),
    vertical: true,
    ariaLabel: metrics.map((metric) => metric.label).join(", "),
    className,
  });

const renderGuidedWorkflowCard = (
  title: string,
  description: string,
  href: string,
  actionLabel: string,
  toneClassName: string,
): string => `<article class="${cardClasses.bordered} surface-tappable transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
  <div class="card-body gap-4">
    <div class="space-y-2">
      <h3 class="card-title text-lg ${toneClassName}">${escapeHtml(title)}</h3>
      <p class="text-sm leading-6 text-base-content/72">${escapeHtml(description)}</p>
    </div>
    <div class="card-actions justify-start">
      <a class="btn btn-outline btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
        href,
      )}" aria-label="${escapeHtml(actionLabel)}">${escapeHtml(actionLabel)}</a>
    </div>
  </div>
</article>`;

const renderWorkflowStageCard = (stage: BuilderWorkflowStage, messages: Messages): string => {
  const statusTone =
    stage.status === "complete"
      ? "badge-success"
      : stage.status === "in-progress"
        ? "badge-warning"
        : "badge-ghost";
  const statusLabel =
    stage.status === "complete"
      ? messages.builder.workflowStatusReady
      : stage.status === "in-progress"
        ? messages.builder.workflowStatusInProgress
        : messages.builder.workflowStatusStart;

  return `<article class="${cardClasses.bordered} surface-tappable transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <h3 class="card-title text-lg">${escapeHtml(stage.label)}</h3>
          <p class="text-sm leading-6 text-base-content/72">${escapeHtml(stage.description)}</p>
        </div>
        <span class="badge ${statusTone} badge-soft">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="rounded-box border border-base-300/80 bg-base-200/55 p-3 text-sm leading-6 text-base-content/72">
        ${escapeHtml(stage.completionLabel)}
      </div>
      <div class="card-actions justify-start gap-2">
        <a class="btn btn-primary btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
          stage.primaryAction.href,
        )}" aria-label="${escapeHtml(stage.primaryAction.label)}">${escapeHtml(stage.primaryAction.label)}</a>
        ${
          stage.secondaryAction
            ? `<a class="btn btn-ghost btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                stage.secondaryAction.href,
              )}" aria-label="${escapeHtml(stage.secondaryAction.label)}">${escapeHtml(stage.secondaryAction.label)}</a>`
            : ""
        }
      </div>
    </div>
  </article>`;
};

const renderCreatorCapabilityCard = (
  messages: Messages,
  capability: CreatorCapability,
): string => `<article class="${cardClasses.bordered} surface-tappable transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
  <div class="card-body gap-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="card-title text-base">${escapeHtml(capability.label)}</h3>
      <span class="badge ${getCapabilityStatusBadgeClass(capability.status)} badge-soft">${escapeHtml(
        getCapabilityStatusLabel(messages, capability.status),
      )}</span>
    </div>
  </div>
</article>`;

const renderWorkflowNavigatorItem = (
  stage: BuilderWorkflowStage,
  href: string,
  messages: Messages,
  stepNumber: number,
): string => {
  const toneClassName =
    stage.status === "complete"
      ? "badge-success"
      : stage.status === "in-progress"
        ? "badge-warning"
        : "badge-ghost";
  const statusLabel =
    stage.status === "complete"
      ? messages.builder.workflowStatusReady
      : stage.status === "in-progress"
        ? messages.builder.workflowStatusInProgress
        : messages.builder.workflowStatusStart;

  return `<a href="${escapeHtml(href)}" class="group surface-tappable flex items-start gap-3 rounded-[1.25rem] border border-base-300 bg-base-100 px-4 py-3 transition hover:border-primary/40 hover:bg-base-200/50" aria-label="${escapeHtml(stage.label)}">
    <span class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-semibold text-base-content/70">${escapeHtml(String(stepNumber))}</span>
    <span class="min-w-0 flex-1 space-y-1">
      <span class="flex flex-wrap items-center gap-2">
        <span class="font-semibold text-base-content group-hover:text-primary">${escapeHtml(stage.label)}</span>
        <span class="badge ${toneClassName} badge-soft badge-xs">${escapeHtml(statusLabel)}</span>
      </span>
      <span class="block text-sm leading-6 text-base-content/68">${escapeHtml(stage.description)}</span>
    </span>
  </a>`;
};

const renderWorkbenchSurfaceCard = (
  title: string,
  description: string,
  badge: string,
  actions: ReadonlyArray<{ label: string; href: string; tone?: "primary" | "ghost" | "outline" }>,
): string => `<article class="${cardClasses.bordered} surface-tappable transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-2">
        <h3 class="card-title text-lg">${escapeHtml(title)}</h3>
        <p class="text-sm leading-6 text-base-content/72">${escapeHtml(description)}</p>
      </div>
      <span class="badge badge-soft badge-secondary">${escapeHtml(badge)}</span>
    </div>
    <div class="flex flex-wrap gap-2">
      ${actions
        .map(
          (action) =>
            `<a class="btn btn-${escapeHtml(action.tone ?? "ghost")} btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
              action.href,
            )}" aria-label="${escapeHtml(action.label)}">${escapeHtml(action.label)}</a>`,
        )
        .join("")}
    </div>
  </div>
</article>`;

/**
 * Renders the builder dashboard landing view.
 *
 * @param messages Locale-resolved message catalog.
 * @param locale Active locale.
 * @param stats Current builder summary metrics.
 * @param projectId Current project identifier.
 * @param published Whether the project is currently published.
 * @returns HTML string for the dashboard surface.
 */
export const renderBuilderDashboard = (
  messages: Messages,
  locale: LocaleCode,
  context: CreatorDashboardContext,
  projectId: string,
  published: boolean,
): string => {
  const withProjectLocale = (path: string): string =>
    withLocaleQuery(interpolateRoutePath(path, { projectId }), locale);
  const withProjectSection = (path: string, sectionId: string): string =>
    `${withProjectLocale(path)}#${sectionId}`;

  const worldHref = withProjectLocale(appRoutes.builderScenes);
  const npcHref = withProjectLocale(appRoutes.builderNpcs);
  const dialogueHref = withProjectLocale(appRoutes.builderDialogue);
  const assetsHref = withProjectLocale(appRoutes.builderAssets);
  const systemsHref = withProjectLocale(appRoutes.builderMechanics);
  const settingsHref = withProjectLocale(appRoutes.builderAi);
  const brandingHref = withProjectSection(appRoutes.builderAi, "builder-brand-control-plane");
  const knowledgeHref = withProjectSection(appRoutes.builderAi, "builder-knowledge-workspace");
  const providerHref = withProjectSection(appRoutes.builderAi, "builder-provider-workbench");
  const operationsHref = withProjectLocale(appRoutes.builderAutomation);
  const reviewQueueHref = withProjectSection(appRoutes.builderAutomation, "builder-review-queue");
  const gameHref = withProjectLocale(appRoutes.game);
  const workflowStages = buildBuilderWorkflowStages(messages, locale, projectId, {
    scenes: context.totalScenes,
    assets: context.assetCount + context.animationClipCount,
    characters: context.totalNpcs,
    story: context.dialogueGraphCount,
    systems: context.questCount,
    playtest: context.activeSessions + (published ? 1 : 0),
  });
  const creatorJourney = buildBuilderJourneyConfig(messages, locale, projectId, "start");
  const workflowNavigator = workflowStages
    .map((stage, index) =>
      renderWorkflowNavigatorItem(
        stage,
        creatorJourney.steps[index]?.href ?? stage.primaryAction.href,
        messages,
        index + 1,
      ),
    )
    .join("");
  const creatorCapabilityCards = context.creatorCapabilities.items
    .map((capability) => renderCreatorCapabilityCard(messages, capability))
    .join("");

  const quickStartCards = [
    renderGuidedWorkflowCard(
      messages.builder.quickActionScene,
      messages.builder.quickActionSceneDesc,
      worldHref,
      messages.builder.scenes,
      "text-primary",
    ),
    renderGuidedWorkflowCard(
      messages.builder.quickActionNpc,
      messages.builder.quickActionNpcDesc,
      npcHref,
      messages.builder.npcs,
      "text-secondary",
    ),
    renderGuidedWorkflowCard(
      messages.builder.quickActionDialogue,
      messages.builder.quickActionDialogueDesc,
      dialogueHref,
      messages.builder.dialogue,
      "text-accent",
    ),
    renderGuidedWorkflowCard(
      messages.builder.assets,
      messages.builder.assetsWorkspaceDescription,
      assetsHref,
      messages.builder.assets,
      "text-success",
    ),
    renderGuidedWorkflowCard(
      messages.builder.mechanics,
      messages.builder.workflowWireProgressDescription,
      systemsHref,
      messages.builder.mechanics,
      "text-warning",
    ),
    renderGuidedWorkflowCard(
      messages.builder.playtest,
      messages.builder.workflowPlaytestDescription,
      published ? gameHref : worldHref,
      published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring,
      "text-accent",
    ),
  ].join("");

  const projectSnapshot = renderMetricStats(
    [
      { label: messages.builder.scenes, value: context.totalScenes, tone: "primary" },
      { label: messages.builder.assets, value: context.assetCount, tone: "secondary" },
      { label: messages.builder.totalNpcs, value: context.totalNpcs, tone: "accent" },
      { label: messages.builder.dialogueGraphCountLabel, value: context.dialogueGraphCount },
      { label: messages.builder.questCountLabel, value: context.questCount },
      { label: messages.builder.activeSessions, value: context.activeSessions },
    ],
    "bg-base-200/60",
  );
  const workbenchCards = [
    renderWorkbenchSurfaceCard(
      messages.builder.creatorWorkflowTitle,
      messages.builder.creatorWorkflowDescription,
      messages.builder.navGroupAuthoring,
      [
        { label: messages.builder.scenes, href: worldHref, tone: "primary" },
        { label: messages.builder.npcs, href: npcHref, tone: "ghost" },
        { label: messages.builder.dialogue, href: dialogueHref, tone: "ghost" },
        { label: messages.builder.assets, href: assetsHref, tone: "ghost" },
        { label: messages.builder.mechanics, href: systemsHref, tone: "ghost" },
      ],
    ),
    renderWorkbenchSurfaceCard(
      messages.builder.projectSettings,
      messages.builder.advancedSettingsDescription,
      messages.builder.brandControlPlaneTitle,
      [
        { label: messages.builder.projectSettings, href: settingsHref, tone: "primary" },
        { label: messages.builder.brandControlPlaneTitle, href: brandingHref, tone: "ghost" },
        { label: messages.builder.knowledgeWorkspaceTitle, href: knowledgeHref, tone: "ghost" },
        { label: messages.builder.providerStatus, href: providerHref, tone: "ghost" },
      ],
    ),
    renderWorkbenchSurfaceCard(
      messages.builder.operations,
      messages.builder.advancedAutomationDescription,
      messages.builder.navGroupRuntime,
      [
        { label: messages.builder.operations, href: operationsHref, tone: "primary" },
        { label: messages.builder.automationArtifactsLabel, href: reviewQueueHref, tone: "ghost" },
        {
          label: published ? messages.builder.playPublishedBuild : messages.builder.playtest,
          href: gameHref,
          tone: "outline",
        },
      ],
    ),
  ].join("");

  return `
    <section class="space-y-6">
      ${renderWorkspaceShell({
        eyebrow: published
          ? messages.builder.projectStatusPublished
          : messages.builder.projectStatusDraft,
        title: messages.builder.creatorWorkflowTitle,
        description: messages.builder.creatorWorkflowDescription,
        journey: creatorJourney,
        facets: [
          {
            label: messages.builder.creatorSafeAiDescription,
            badgeClassName: "badge-outline",
          },
        ],
        metrics: [
          {
            label: messages.builder.scenes,
            value: context.totalScenes,
            toneClassName: "text-primary",
          },
          {
            label: messages.builder.animations,
            value: context.animationClipCount,
            toneClassName: "text-secondary",
          },
          {
            label: messages.builder.totalNpcs,
            value: context.totalNpcs,
            toneClassName: "text-accent",
          },
          {
            label: messages.builder.playtest,
            value: published ? messages.builder.projectStatusPublished : context.activeSessions,
          },
        ],
        actions: `
        <a class="btn btn-primary btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
          published ? gameHref : (workflowStages[0]?.primaryAction.href ?? worldHref),
        )}" aria-label="${escapeHtml(published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring)}">
            ${escapeHtml(published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring)}
          </a>
          <a class="btn btn-ghost btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(settingsHref)}" aria-label="${escapeHtml(messages.builder.projectSettings)}">
            ${escapeHtml(messages.builder.projectSettings)}
          </a>
          <a class="btn btn-ghost btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(operationsHref)}" aria-label="${escapeHtml(messages.builder.operations)}">
            ${escapeHtml(messages.builder.operations)}
          </a>
        `,
      })}
      ${renderWorkspaceFrame({
        navigatorTitle: messages.builder.creatorWorkflowTitle,
        navigatorDescription: messages.builder.creatorWorkflowDescription,
        navigatorBody: `<div class="space-y-3">
          <div class="rounded-[1.25rem] border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">
            ${escapeHtml(messages.builder.workflowGuideDescription)}
          </div>
          ${workflowNavigator}
        </div>`,
        mainBody: `<div class="space-y-4">
          <section id="builder-workbench-map" class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-4 p-5 lg:p-6">
              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.workspaceTitle)}</h2>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workspaceJumpBack)}</p>
              </div>
              <div class="grid gap-4 xl:grid-cols-3">
                ${workbenchCards}
              </div>
            </div>
          </section>
          <section class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-4 p-5 lg:p-6">
              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.creatorWorkflowTitle)}</h2>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.creatorWorkflowDescription)}</p>
              </div>
              <div class="grid gap-3 xl:grid-cols-2">
                ${workflowStages.map((stage) => renderWorkflowStageCard(stage, messages)).join("")}
              </div>
            </div>
          </section>
          <section class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-4 p-5 lg:p-6">
              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.creatorSupportTitle)}</h2>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.creatorSupportDescription)}</p>
              </div>
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                ${quickStartCards}
              </div>
            </div>
          </section>
        </div>`,
        sideSections: [
          {
            title: messages.builder.workspaceTitle,
            description: messages.builder.workspaceJumpBack,
            body: `<div class="space-y-3">
              ${projectSnapshot}
              <div class="flex flex-wrap gap-2 pt-1">
                <a class="btn btn-primary btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                  published ? gameHref : (workflowStages[0]?.primaryAction.href ?? worldHref),
                )}" aria-label="${escapeHtml(
                  published
                    ? messages.builder.playPublishedBuild
                    : messages.builder.continueAuthoring,
                )}">${escapeHtml(published ? messages.builder.playPublishedBuild : messages.builder.continueAuthoring)}</a>
                <a class="btn btn-outline btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                  settingsHref,
                )}" aria-label="${escapeHtml(messages.builder.projectSettings)}">${escapeHtml(messages.builder.projectSettings)}</a>
                <a class="btn btn-ghost btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                  operationsHref,
                )}" aria-label="${escapeHtml(messages.builder.operations)}">${escapeHtml(messages.builder.operations)}</a>
              </div>
            </div>`,
          },
          {
            title: messages.builder.projectSettings,
            description: messages.builder.advancedSettingsDescription,
            body: `<div class="space-y-3">
              ${creatorCapabilityCards}
              <div class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4 shadow-sm">
                <div class="space-y-2">
                  <h3 class="text-base font-semibold tracking-tight">${escapeHtml(messages.builder.operations)}</h3>
                  <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.advancedAutomationDescription)}</p>
                  <div class="flex flex-wrap gap-2 pt-1">
                    <a class="btn btn-primary btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                      settingsHref,
                    )}" aria-label="${escapeHtml(messages.builder.projectSettings)}">${escapeHtml(messages.builder.projectSettings)}</a>
                    <a class="btn btn-outline btn-sm transition hover:-translate-y-0.5 hover:shadow-sm" href="${escapeHtml(
                      operationsHref,
                    )}" aria-label="${escapeHtml(messages.builder.operations)}">${escapeHtml(messages.builder.operations)}</a>
                  </div>
                </div>
              </div>
            </div>`,
          },
        ],
      })}
    </section>`;
};

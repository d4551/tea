import type { LocaleCode } from "../../config/environment.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { BuilderWorkflowStageIdAny } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { buildBuilderWorkflowStages } from "./builder-flow.ts";
import type { WorkspaceJourneyConfig } from "./workspace-shell.ts";

const builderJourneyTarget = "#main-content";
const emptyWorkflowCounts = {
  scenes: 0,
  assets: 0,
  characters: 0,
  story: 0,
  systems: 0,
  playtest: 0,
} as const;

const normalizeBuilderJourneyStageId = (
  stageId: BuilderWorkflowStageIdAny,
): WorkspaceJourneyConfig["activeStepKey"] => {
  if (stageId === "assets") {
    return "visuals";
  }

  if (stageId === "mechanics") {
    return "rules";
  }

  return stageId;
};

const resolveJourneyStageHref = (
  stageId: WorkspaceJourneyConfig["activeStepKey"],
  locale: LocaleCode,
  projectId: string,
): string => {
  if (stageId === "start") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderStart, { projectId }), {
      lang: locale,
    });
  }

  if (stageId === "world") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderScenes, { projectId }), {
      lang: locale,
    });
  }

  if (stageId === "visuals") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderAssets, { projectId }), {
      lang: locale,
    });
  }

  if (stageId === "characters") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderNpcs, { projectId }), {
      lang: locale,
    });
  }

  if (stageId === "story") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderDialogue, { projectId }), {
      lang: locale,
    });
  }

  if (stageId === "rules") {
    return withQueryParameters(interpolateRoutePath(appRoutes.builderMechanics, { projectId }), {
      lang: locale,
    });
  }

  return withQueryParameters(interpolateRoutePath(appRoutes.game, { projectId }), { lang: locale });
};

const buildJourneyHtmx = (href: string) =>
  href.startsWith("/projects/")
    ? {
        get: href,
        target: builderJourneyTarget,
        swap: "innerHTML" as const,
        pushUrl: true,
      }
    : undefined;

/**
 * Builds the shared creator journey metadata used by builder workspaces.
 *
 * The stage order, labels, and hrefs are derived from the canonical builder
 * workflow model so the dashboard and editor pages cannot drift.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param activeStageId Current creator workflow stage.
 * @returns Shared workspace journey configuration.
 */
export const buildBuilderJourneyConfig = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  activeStageId: BuilderWorkflowStageIdAny,
): WorkspaceJourneyConfig => {
  const stages = buildBuilderWorkflowStages(messages, locale, projectId, emptyWorkflowCounts);
  const normalizedStageId = normalizeBuilderJourneyStageId(activeStageId);
  const currentIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === normalizedStageId),
  );
  const currentStage = stages[currentIndex] ?? stages[0];
  const previousStage = currentIndex > 0 ? (stages[currentIndex - 1] ?? null) : null;
  const nextStage = currentIndex < stages.length - 1 ? (stages[currentIndex + 1] ?? null) : null;

  return {
    activeStepKey: normalizedStageId,
    ariaLabel: messages.builder.creatorWorkflowTitle,
    description: currentStage?.description ?? messages.builder.creatorWorkflowDescription,
    breadcrumbs: [
      {
        label: messages.builder.title,
        href: withQueryParameters(interpolateRoutePath(appRoutes.builderStart, { projectId }), {
          lang: locale,
        }),
      },
      {
        label: currentStage?.label ?? messages.builder.title,
      },
    ],
    steps: stages.map((stage) => ({
      key: String(stage.id),
      label: stage.label,
      href: resolveJourneyStageHref(stage.id, locale, projectId),
      htmx: buildJourneyHtmx(resolveJourneyStageHref(stage.id, locale, projectId)),
    })),
    previousStep:
      previousStage === null
        ? undefined
        : {
            label: previousStage.label,
            href: resolveJourneyStageHref(previousStage.id, locale, projectId),
            htmx: buildJourneyHtmx(resolveJourneyStageHref(previousStage.id, locale, projectId)),
          },
    nextStep:
      nextStage === null
        ? undefined
        : {
            label: nextStage.label,
            href: resolveJourneyStageHref(nextStage.id, locale, projectId),
            htmx: buildJourneyHtmx(resolveJourneyStageHref(nextStage.id, locale, projectId)),
          },
  };
};

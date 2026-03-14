import type { LocaleCode } from "../../config/environment.ts";
import { defaultBuilderProjectId } from "../../domain/builder/builder-project-state-store.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderStarterProjectPicker } from "./starter-project-picker.ts";
import { renderWorkspaceFrame, renderWorkspaceShell } from "./workspace-shell.ts";

/**
 * Renders the first-run builder workspace shown when no project is selected yet.
 *
 * @param messages Localized message catalog.
 * @param locale Active locale.
 * @param projectId Requested project identifier.
 * @param currentPath Current builder path for redirect preservation.
 * @returns HTML string for the starter selection workspace.
 */
export const renderBuilderStarterWorkspace = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  currentPath: string,
): string =>
  `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.createProject,
      title: messages.builder.starterProjectTitle,
      description: messages.builder.starterProjectDescription,
      facets: [
        { label: messages.builder.starterProjectRecommendedLabel, badgeClassName: "badge-primary" },
      ],
      metrics: [
        { label: messages.builder.scenes, value: 0, toneClassName: "text-primary" },
        { label: messages.builder.assets, value: 0 },
        { label: messages.builder.totalNpcs, value: 0 },
      ],
    })}
    ${renderWorkspaceFrame({
      navigatorTitle: messages.builder.starterProjectTitle,
      navigatorDescription: messages.builder.starterProjectDescription,
      navigatorBody: `<div class="rounded-[1.5rem] border border-base-300 bg-base-100 p-5 shadow-sm">
        ${renderStarterProjectPicker({
          messages,
          locale,
          redirectPath: currentPath,
          projectId: projectId === defaultBuilderProjectId ? "" : projectId,
        })}
      </div>`,
      mainBody: `<section class="rounded-[1.5rem] border border-base-300 bg-base-100 p-5 shadow-sm">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.creatorWorkflowTitle)}</h2>
          <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workflowGuideDescription)}</p>
          <div class="grid gap-3 lg:grid-cols-2">
            <div class="rounded-box border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workflowStartWithWorldDescription)}</div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workflowPopulateWorldDescription)}</div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workflowWireProgressDescription)}</div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.workflowPlaytestDescription)}</div>
          </div>
        </div>
      </section>`,
      sideSections: [
        {
          title: messages.builder.starterProjectTemplateLegend,
          description: messages.builder.starterProjectDescription,
          body: `<div class="space-y-3 text-sm leading-6 text-base-content/72">
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.starterProjectTemplateBlankDescription)}</div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.starterProjectTemplateStoryDescription)}</div>
          </div>`,
        },
      ],
    })}
  </section>`;

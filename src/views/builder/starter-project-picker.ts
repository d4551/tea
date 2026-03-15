import type { LocaleCode } from "../../config/environment.ts";
import { recommendedStarterProjectTemplateId } from "../../domain/builder/starter-projects.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type { StarterProjectTemplate } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { spinnerClasses } from "../shared/ui-components.ts";

/**
 * Inputs for rendering the starter-project picker.
 */
export interface StarterProjectPickerProps {
  /** Localized message catalog. */
  readonly messages: Messages;
  /** Active locale. */
  readonly locale: LocaleCode;
  /** Redirect path after successful project creation. */
  readonly redirectPath: string;
  /** Suggested project id value. */
  readonly projectId?: string;
  /** Whether to render the compact dropdown variant. */
  readonly compact?: boolean;
}

/**
 * Localizes the supported starter templates for the current request.
 *
 * @param messages Localized message catalog.
 * @returns Ordered starter template list.
 */
export const buildStarterProjectTemplates = (
  messages: Messages,
): readonly StarterProjectTemplate[] => [
  {
    id: "blank",
    label: messages.builder.starterProjectTemplateBlankLabel,
    description: messages.builder.starterProjectTemplateBlankDescription,
    defaultSceneMode: "2d",
    recommended: recommendedStarterProjectTemplateId === "blank",
  },
  {
    id: "tea-house-story",
    label: messages.builder.starterProjectTemplateStoryLabel,
    description: messages.builder.starterProjectTemplateStoryDescription,
    defaultSceneMode: "2d",
    recommended: recommendedStarterProjectTemplateId === "tea-house-story",
  },
  {
    id: "2d-game",
    label: messages.builder.starterProjectTemplate2dLabel,
    description: messages.builder.starterProjectTemplate2dDescription,
    defaultSceneMode: "2d",
    recommended: recommendedStarterProjectTemplateId === "2d-game",
  },
  {
    id: "3d-game",
    label: messages.builder.starterProjectTemplate3dLabel,
    description: messages.builder.starterProjectTemplate3dDescription,
    defaultSceneMode: "3d",
    recommended: recommendedStarterProjectTemplateId === "3d-game",
  },
];

const renderCompactTemplateOptions = (
  templates: readonly StarterProjectTemplate[],
  messages: Messages,
): string =>
  templates
    .map(
      (
        template,
      ) => `<label class="flex cursor-pointer items-start gap-3 rounded-box border border-base-300 bg-base-100 px-3 py-2">
        <input
          type="radio"
          name="starterTemplateId"
          required
          class="radio radio-sm radio-primary mt-1"
          value="${escapeHtml(template.id)}"
          aria-label="${escapeHtml(template.label)}"
        />
        <span class="space-y-1">
          <span class="flex flex-wrap items-center gap-2">
            <span class="font-medium">${escapeHtml(template.label)}</span>
            ${
              template.recommended
                ? `<span class="badge badge-primary badge-soft badge-xs">${escapeHtml(messages.builder.starterProjectRecommendedLabel)}</span>`
                : ""
            }
          </span>
          <span class="block text-xs leading-5 text-base-content/70">${escapeHtml(template.description)}</span>
        </span>
      </label>`,
    )
    .join("");

const renderCardTemplateOptions = (
  templates: readonly StarterProjectTemplate[],
  messages: Messages,
): string =>
  templates
    .map(
      (
        template,
      ) => `<label class="card cursor-pointer border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:bg-base-200/40">
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="card-title text-lg">${escapeHtml(template.label)}</span>
                ${
                  template.recommended
                    ? `<span class="badge badge-primary badge-soft">${escapeHtml(messages.builder.starterProjectRecommendedLabel)}</span>`
                    : ""
                }
              </div>
              <p class="text-sm leading-6 text-base-content/72">${escapeHtml(template.description)}</p>
            </div>
            <input
              type="radio"
              name="starterTemplateId"
              required
              class="radio radio-primary"
              value="${escapeHtml(template.id)}"
              aria-label="${escapeHtml(template.label)}"
            />
          </div>
        </div>
      </label>`,
    )
    .join("");

/**
 * Renders the shared starter-project picker used by first-run builder flows.
 *
 * @param props Rendering inputs.
 * @returns HTML string for the starter-project picker form.
 */
export const renderStarterProjectPicker = (props: StarterProjectPickerProps): string => {
  const { messages, locale, redirectPath, compact = false } = props;
  const templates = buildStarterProjectTemplates(messages);
  const templateOptions = compact
    ? renderCompactTemplateOptions(templates, messages)
    : renderCardTemplateOptions(templates, messages);

  return `<form
    class="${compact ? "space-y-3 px-1 py-1" : "space-y-5"}"
    hx-post="${escapeHtml(appRoutes.builderApiProjects)}"
    hx-indicator="#builder-project-create-spinner"
    hx-disabled-elt="button, input, select, textarea"
  >
    <fieldset class="fieldset">
      <legend class="fieldset-legend ${compact ? "text-xs" : ""}">${escapeHtml(messages.builder.createProject)}</legend>
      <input
        name="projectId"
        type="text"
        class="input ${compact ? "input-sm" : ""} w-full"
        required
        minlength="1"
        maxlength="64"
        value="${escapeHtml(props.projectId ?? "")}"
        placeholder="${escapeHtml(messages.builder.projectIdPlaceholder)}"
        aria-label="${escapeHtml(messages.builder.projectIdLabel)}"
      />
      <div class="text-xs leading-5 text-base-content/65">${escapeHtml(messages.builder.createProjectHelp)}</div>
    </fieldset>
    <fieldset class="fieldset">
      <legend class="fieldset-legend ${compact ? "text-xs" : ""}">${escapeHtml(messages.builder.starterProjectTemplateLegend)}</legend>
      <div class="${compact ? "space-y-2" : "grid gap-4 lg:grid-cols-2"}">
        ${templateOptions}
      </div>
    </fieldset>
    <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
    <input type="hidden" name="redirectPath" value="${escapeHtml(redirectPath)}" />
    <div class="flex items-center gap-2">
      <button type="submit" class="btn btn-primary ${compact ? "btn-xs" : "btn-sm"} w-full">
        ${escapeHtml(messages.builder.createProject)}
      </button>
      <span id="builder-project-create-spinner" class="${compact ? spinnerClasses.xs : spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
    </div>
  </form>`;
};

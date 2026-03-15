import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type { CreatorAssistContext } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderBuilderHiddenFields, spinnerClasses } from "../shared/ui-components.ts";

const buildAssistSpinnerId = (entityId: string, actionKey: string): string =>
  `creator-assist-${entityId}-${actionKey}`.replace(/[^a-zA-Z0-9_-]/g, "-");

/**
 * Renders contextual creator-assist actions as explicit, server-driven draft forms.
 *
 * Non-generation actions still render as direct navigation links, while generation
 * actions submit a scoped draft request bound to the selected entity.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param context Selected creator-assist context.
 * @returns HTML for the contextual creator-assist panel.
 */
export const renderCreatorAssistPanel = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  context: CreatorAssistContext,
): string => {
  const createJobAction = appRoutes.builderApiGenerationJobsCreateForm;

  return `<div id="creator-ai-actions" class="grid gap-3">
    ${context.actions
      .map((action) => {
        if (action.kind === "dialogue") {
          return `<article class="rounded-[1.25rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="space-y-3 p-4">
              <div class="space-y-2">
                <h3 class="text-base font-semibold">${escapeHtml(action.label)}</h3>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(action.description)}</p>
              </div>
              <div class="flex justify-start">
                <a class="btn btn-primary btn-sm" href="${escapeHtml(action.href)}" aria-label="${escapeHtml(action.label)}">
                  ${escapeHtml(action.label)}
                </a>
              </div>
            </div>
          </article>`;
        }

        const spinnerId = buildAssistSpinnerId(context.entityId, action.key);
        return `<article class="rounded-[1.25rem] border border-base-300 bg-base-100 shadow-sm">
          <form
            class="space-y-3 p-4"
            hx-post="${escapeHtml(createJobAction)}"
            hx-target="#builder-content"
            hx-swap="innerHTML"
            hx-indicator="#${spinnerId}"
            hx-disabled-elt="button, input, textarea"
          >
            ${renderBuilderHiddenFields(projectId, locale)}
            <input type="hidden" name="kind" value="${escapeHtml(action.kind)}" />
            <input type="hidden" name="targetId" value="${escapeHtml(context.targetId ?? context.entityId)}" />
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-base font-semibold">${escapeHtml(action.label)}</h3>
                <span class="badge badge-outline badge-sm">${escapeHtml(context.title)}</span>
              </div>
              <p class="text-sm leading-6 text-base-content/72">${escapeHtml(action.description)}</p>
            </div>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.generationPromptLabel)}</legend>
              <textarea
                name="prompt"
                class="textarea w-full"
                rows="3"
                placeholder="${escapeHtml(messages.builder.generationPromptPlaceholder)}"
                aria-required="true"
                required
                aria-label="${escapeHtml(messages.builder.generationPromptLabel)}"
              ></textarea>
            </fieldset>
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(action.label)}">
                ${escapeHtml(action.label)}
              </button>
              <span id="${spinnerId}" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>
          </form>
        </article>`;
      })
      .join("")}
  </div>`;
};

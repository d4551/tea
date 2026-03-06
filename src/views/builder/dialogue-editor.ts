/**
 * Dialogue Editor View
 *
 * Tree view of dialogue keys per NPC with AI generation support.
 */

import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Renders the dialogue editor panel.
 *
 * @param messages Locale-resolved messages.
 * @param catalog Game text catalog for the active locale.
 * @param locale Active locale code.
 * @returns HTML string for the dialogue editor panel.
 */
export const renderDialogueEditor = (
  messages: Messages,
  catalog: Record<string, string>,
  locale: LocaleCode,
  projectId: string,
): string => {
  const npcKeys = Object.keys(catalog);

  if (npcKeys.length === 0) {
    return `
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.dialogue)}</h1>
        <article class="card border border-dashed border-base-300 bg-base-200/60">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.noDialogues)}</h2>
            <p>${escapeHtml(messages.builder.generateDialogue)}</p>
          </div>
        </article>
        <div id="dialogue-detail" class="mt-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel"></div>
      </div>`;
  }

  const npcGroups = new Map<string, Array<{ key: string; text: string }>>();
  for (const key of npcKeys) {
    const npcId = key.split(".").slice(0, 2).join(".");
    const existing = npcGroups.get(npcId) ?? [];
    existing.push({ key, text: catalog[key] ?? key });
    npcGroups.set(npcId, existing);
  }

  const groupHtml = Array.from(npcGroups.entries())
    .map(([npcId, lines]) => {
      const npcName = npcId.split(".")[1] ?? npcId;
      const generateHref = withQueryParameters(`${appRoutes.builderApiDialogue}/generate`, {
        locale,
        projectId,
      });
      const lineRows = lines
        .map((line) => {
          const detailHref = withQueryParameters(
            `${appRoutes.builderApiDialogue}/${encodeURIComponent(line.key)}`,
            {
              locale,
              projectId,
            },
          );
          return `
          <tr>
            <td class="font-mono text-xs">${escapeHtml(line.key)}</td>
            <td>${escapeHtml(line.text)}</td>
            <td>
              <button
                class="btn btn-ghost btn-xs"
                hx-get="${escapeHtml(detailHref)}"
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                aria-label="${escapeHtml(messages.builder.preview)}: ${escapeHtml(line.key)}"
              >${escapeHtml(messages.builder.preview)}</button>
            </td>
          </tr>`;
        })
        .join("");

      return `
        <div class="collapse collapse-arrow bg-base-100 shadow-sm mb-2">
          <input type="checkbox" aria-label="${escapeHtml(npcId)}" />
          <div class="collapse-title font-semibold">
            <span aria-hidden="true">👤</span> ${escapeHtml(npcId)}
            <span class="badge badge-sm badge-ghost ml-2">${lines.length}</span>
          </div>
          <div class="collapse-content">
            <table class="table table-xs" aria-label="${escapeHtml(npcId)} ${escapeHtml(messages.builder.dialogue)}">
              <thead>
                <tr>
                  <th scope="col">${escapeHtml(messages.builder.dialogueKey)}</th>
                  <th scope="col">${escapeHtml(messages.builder.dialogueLine)}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>${lineRows}</tbody>
            </table>
            <div class="mt-2">
              <button
                class="btn btn-secondary btn-sm"
                hx-post="${escapeHtml(generateHref)}"
                hx-vals='{"npcId": "${escapeHtml(npcName)}", "locale": "${escapeHtml(locale)}", "projectId": "${escapeHtml(projectId)}"}'
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                aria-label="${escapeHtml(messages.builder.generateDialogue)}: ${escapeHtml(npcId)}"
              >
                <span aria-hidden="true">✨</span> ${escapeHtml(messages.builder.generateDialogue)}
              </button>
            </div>
          </div>
        </div>`;
    })
    .join("");

  return `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.dialogue)}</h1>
      ${groupHtml}
      <div id="dialogue-detail" class="mt-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        <!-- Dialogue detail / AI generation result swapped here -->
      </div>
    </div>`;
};
/**
 * Renders an editable dialogue detail form for HTMX updates.
 *
 * @param messages Locale-resolved messages.
 * @param key Dialogue key.
 * @param text Dialogue content.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for editable dialogue detail.
 */
export const renderDialogueDetail = (
  messages: Messages,
  key: string,
  text: string,
  locale: LocaleCode,
  projectId: string,
): string => {
  const formAction = withQueryParameters(
    `${appRoutes.builderApiDialogue}/${encodeURIComponent(key)}/form`,
    {
      locale,
      projectId,
    },
  );

  return `
    <div class="card bg-base-100 shadow-sm">
      <form
        class="card-body gap-4"
        hx-post="${escapeHtml(formAction)}"
        hx-target="#dialogue-detail"
        hx-swap="innerHTML"
      >
        <h3 class="card-title text-sm">${escapeHtml(messages.builder.dialogueKey)}: <code>${escapeHtml(key)}</code></h3>
        <textarea
          name="text"
          class="textarea textarea-bordered w-full min-h-28"
          required
        >${escapeHtml(text)}</textarea>
        <div class="flex items-center justify-end">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
        </div>
      </form>
    </div>`;
};

/**
 * Dialogue Editor View
 *
 * NPC-first dialogue workspace with filtering and AI generation hooks.
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
 * @param projectId Active project id.
 * @param search Current filter text.
 * @returns HTML string for the dialogue editor panel.
 */
export const renderDialogueEditor = (
  messages: Messages,
  catalog: Record<string, string>,
  locale: LocaleCode,
  projectId: string,
  search = "",
): string => {
  const npcGroups = new Map<string, Array<{ key: string; text: string }>>();
  for (const key of Object.keys(catalog)) {
    const lineText = catalog[key] ?? key;
    const normalizedSearch = search.trim().toLowerCase();
    if (
      normalizedSearch.length > 0 &&
      !key.toLowerCase().includes(normalizedSearch) &&
      !lineText.toLowerCase().includes(normalizedSearch)
    ) {
      continue;
    }
    const npcId = key.split(".").slice(0, 2).join(".");
    const existing = npcGroups.get(npcId) ?? [];
    existing.push({ key, text: lineText });
    npcGroups.set(npcId, existing);
  }

  const selectedGroup = Array.from(npcGroups.entries())[0] ?? null;
  const selectedLine = selectedGroup?.[1][0] ?? null;
  const searchAction = withQueryParameters(appRoutes.builderDialogue, {
    lang: locale,
    projectId,
  });
  const createAction = `${appRoutes.builderApiDialogue}/create/form`;
  const generateHref = withQueryParameters(`${appRoutes.builderApiDialogue}/generate`, {
    locale,
    projectId,
  });

  const groupHtml = Array.from(npcGroups.entries())
    .map(([npcId, lines]) => {
      const npcName = npcId.split(".")[1] ?? npcId;
      const lineRows = lines
        .map((line) => {
          const detailHref = withQueryParameters(
            `${appRoutes.builderApiDialogue}/${encodeURIComponent(line.key)}`,
            {
              locale,
              projectId,
            },
          );
          return `<div class="rounded-box bg-base-200/60 p-3">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="font-mono text-xs text-base-content/70">${escapeHtml(line.key)}</div>
                <p class="mt-2 text-sm">${escapeHtml(line.text)}</p>
              </div>
              <button
                class="btn btn-outline btn-xs"
                hx-get="${escapeHtml(detailHref)}"
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                aria-label="${escapeHtml(messages.builder.preview)}: ${escapeHtml(line.key)}"
              >${escapeHtml(messages.builder.preview)}</button>
            </div>
          </div>`;
        })
        .join("");

      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="card-title text-lg">${escapeHtml(npcId)}</h2>
              <p class="text-sm text-base-content/70">${lines.length} ${escapeHtml(messages.builder.dialogue)}</p>
            </div>
            <span class="flex items-center gap-2">
              <button
                class="btn btn-secondary btn-sm"
                hx-post="${escapeHtml(generateHref)}"
                hx-vals='{"npcId": "${escapeHtml(npcName)}", "locale": "${escapeHtml(locale)}", "projectId": "${escapeHtml(projectId)}"}'
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                hx-indicator="#dialogue-generate-${npcId.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner"
                hx-disabled-elt="this"
                aria-label="${escapeHtml(messages.builder.generateDialogue)}: ${escapeHtml(npcId)}"
              >
                <span aria-hidden="true">✨</span> ${escapeHtml(messages.builder.generateDialogue)}
              </button>
              <span id="dialogue-generate-${npcId.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </span>
          </div>
          <div class="space-y-3">${lineRows}</div>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div class="space-y-4">
        <article class="card card-border bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <div class="space-y-1">
              <h1 class="card-title text-2xl">${escapeHtml(messages.builder.dialogueWorkspaceTitle)}</h1>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.dialogueCreateDescription)}</p>
            </div>

            <form method="get" action="${escapeHtml(searchAction)}" class="space-y-3">
              <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
              <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueSearchLabel)}</legend>
                <input name="search" type="text" class="input input-bordered w-full" value="${escapeHtml(search)}" placeholder="${escapeHtml(messages.builder.dialogueSearchPlaceholder)}" />
              </fieldset>
              <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.preview)}</button>
            </form>

            <form
              class="space-y-3"
              hx-post="${escapeHtml(createAction)}"
              hx-target="#builder-content"
              hx-swap="innerHTML"
              hx-indicator="#dialogue-create-spinner"
              hx-disabled-elt="button, input, select, textarea"
            >
              <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
              <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueKey)}</legend>
                <input name="key" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.dialogueKeyPlaceholder)}" required />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueLine)}</legend>
                <textarea name="text" class="textarea textarea-bordered w-full" rows="3" placeholder="${escapeHtml(messages.builder.addLinePlaceholder)}" required></textarea>
              </fieldset>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.addDialogue)}</button>
                <span id="dialogue-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
              </div>
            </form>
          </div>
        </article>

        ${
          groupHtml.length > 0
            ? `<div class="space-y-4">${groupHtml}</div>`
            : `<div role="alert" class="alert alert-warning alert-soft"><span>${escapeHtml(messages.builder.noDialogues)}</span></div>`
        }
      </div>

      <div id="dialogue-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        ${
          selectedLine
            ? renderDialogueDetail(messages, selectedLine.key, selectedLine.text, locale, projectId)
            : `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noDialogues)}</span></div>`
        }
      </div>
    </section>`;
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
  const deleteAction = withQueryParameters(
    `${appRoutes.builderApiDialogue}/${encodeURIComponent(key)}`,
    {
      locale,
      projectId,
    },
  );

  return `
    <div class="card card-border bg-base-100 shadow-sm">
      <form
        class="card-body gap-4"
        hx-post="${escapeHtml(formAction)}"
        hx-target="#dialogue-detail"
        hx-swap="innerHTML"
        hx-indicator="#dialogue-detail-spinner"
        hx-disabled-elt="button, input, select, textarea"
      >
        <div class="flex items-center justify-between gap-3">
          <h3 class="card-title text-sm">${escapeHtml(messages.builder.dialogueKey)}: <code>${escapeHtml(key)}</code></h3>
          <button
            type="button"
            class="btn btn-error btn-outline btn-xs"
            hx-delete="${escapeHtml(deleteAction)}"
            hx-target="#builder-content"
            hx-swap="innerHTML"
            hx-indicator="#dialogue-delete-spinner"
            hx-disabled-elt="this"
          >${escapeHtml(messages.builder.delete)}</button>
          <span id="dialogue-delete-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
        </div>
        <textarea
          name="text"
          class="textarea textarea-bordered w-full min-h-28"
          required
        >${escapeHtml(text)}</textarea>
        <div class="flex items-center justify-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
          <span id="dialogue-detail-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
        </div>
      </form>
    </div>`;
};

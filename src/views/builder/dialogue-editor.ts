/**
 * Dialogue Editor View
 *
 * NPC-first dialogue workspace with filtering and AI generation hooks.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { humanizeBuilderIdentifier } from "../../domain/builder/builder-display.ts";
import { BUILDER_LIBRARY_PAGE_SIZE } from "../../shared/constants/builder-defaults.ts";
import { BUILDER_QUERY_PARAM_PAGE } from "../../shared/constants/builder-query.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { cardClasses, renderEmptyStateCompact, spinnerClasses } from "../shared/ui-components.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";
import {
  paginateWorkspaceItems,
  renderWorkspaceBrowseControls,
  renderWorkspaceFrame,
  renderWorkspaceShell,
} from "./workspace-shell.ts";

const getDialogueSpeakerId = (key: string): string => {
  const segments = key.split(".");
  if (segments[0] === "npc" && segments.length >= 4) {
    return segments[1] ?? key;
  }
  return segments[1] ?? key;
};

const getDialogueReference = (key: string): string => key.split(".").at(-1) ?? key;

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
  page = 1,
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
    const npcId = getDialogueSpeakerId(key);
    const existing = npcGroups.get(npcId) ?? [];
    existing.push({ key, text: lineText });
    npcGroups.set(npcId, existing);
  }

  const totalLines = Array.from(npcGroups.values()).reduce(
    (total, lines) => total + lines.length,
    0,
  );

  const dialoguePath = interpolateRoutePath(appRoutes.builderDialogue, { projectId });
  const searchAction = withQueryParameters(dialoguePath, { lang: locale });
  const createAction = interpolateRoutePath(appRoutes.builderApiDialogueCreateForm, {
    projectId,
  });
  const generateHref = interpolateRoutePath(appRoutes.builderApiDialogueGenerate, {
    projectId,
  });
  const creatorJourney = buildBuilderJourneyConfig(messages, locale, projectId, "story");

  const groupEntries = Array.from(npcGroups.entries());
  const paginatedGroups = paginateWorkspaceItems(groupEntries, page, BUILDER_LIBRARY_PAGE_SIZE);
  const selectedGroup = paginatedGroups.items[0] ?? null;
  const selectedLine = selectedGroup?.[1][0] ?? null;

  const previousHref =
    paginatedGroups.page > 1
      ? withQueryParameters(searchAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedGroups.page - 1),
          ...(search ? { search } : {}),
        })
      : undefined;
  const nextHref =
    paginatedGroups.page < paginatedGroups.totalPages
      ? withQueryParameters(searchAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedGroups.page + 1),
          ...(search ? { search } : {}),
        })
      : undefined;
  const browseControls = renderWorkspaceBrowseControls({
    action: searchAction,
    search,
    searchLabel: messages.builder.dialogueSearchLabel,
    searchPlaceholder: messages.builder.dialogueSearchPlaceholder,
    submitLabel: messages.builder.filterAction,
    resultsLabel: messages.builder.resultsLabel,
    previousLabel: messages.builder.previousPage,
    nextLabel: messages.builder.nextPage,
    pageLabel: messages.builder.pageLabel,
    page: paginatedGroups.page,
    totalPages: paginatedGroups.totalPages,
    totalItems: paginatedGroups.totalItems,
    startIndex: paginatedGroups.startIndex,
    endIndex: paginatedGroups.endIndex,
    hiddenFields: {},
    htmxTarget: "#builder-content",
    previousHref,
    nextHref,
  });

  const groupHtml = paginatedGroups.items
    .map(([npcId, lines]) => {
      const npcLabel = humanizeBuilderIdentifier(npcId);
      const lineRows = lines
        .map((line) => {
          const detailPath = interpolateRoutePath(appRoutes.builderApiDialogueEntry, {
            projectId,
            key: line.key,
          });
          const detailHref = detailPath;
          return `<div class="rounded-box bg-base-200/60 p-3">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="text-xs font-medium uppercase tracking-wide text-base-content/60">${escapeHtml(
                  humanizeBuilderIdentifier(getDialogueReference(line.key)),
                )}</div>
                <div class="font-mono text-[11px] text-base-content/50">${escapeHtml(
                  humanizeBuilderIdentifier(getDialogueReference(line.key)),
                )}</div>
                <p class="mt-2 text-sm">${escapeHtml(line.text)}</p>
              </div>
              <button
                class="btn btn-outline btn-xs"
                hx-get="${escapeHtml(detailHref)}"
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(
                  humanizeBuilderIdentifier(getDialogueReference(line.key)),
                )}"
              >${escapeHtml(messages.builder.openDetails)}</button>
            </div>
          </div>`;
        })
        .join("");

      return `<article class="${cardClasses.bordered}">
        <div class="card-body gap-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="card-title text-lg">${escapeHtml(npcLabel)}</h2>
              <p class="text-sm text-base-content/70">${lines.length} ${escapeHtml(messages.builder.dialogue)}</p>
            </div>
            <span class="flex items-center gap-2">
              <button
                class="btn btn-secondary btn-sm"
                hx-post="${escapeHtml(generateHref)}"
                hx-vals='{"npcId": "${escapeHtml(npcId)}"}'
                hx-target="#dialogue-detail"
                hx-swap="innerHTML"
                hx-indicator="#dialogue-generate-${npcId.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner"
                hx-disabled-elt="this"
                aria-label="${escapeHtml(messages.builder.generateDialogue)}: ${escapeHtml(npcId)}"
              >
                <span aria-hidden="true">✨</span> ${escapeHtml(messages.builder.generateDialogue)}
              </button>
              <span id="dialogue-generate-${npcId.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </span>
          </div>
          <div class="space-y-3">${lineRows}</div>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="space-y-6 animate-fade-in-up">
      ${renderWorkspaceShell({
        eyebrow: messages.builder.dialogue,
        title: messages.builder.dialogueWorkspaceTitle,
        description: messages.builder.dialogueCreateDescription,
        journey: creatorJourney,
        facets: [
          { label: locale, badgeClassName: "badge-secondary" },
          { label: messages.builder.generateDialogue, badgeClassName: "badge-accent" },
        ],
        metrics: [
          { label: messages.builder.dialogue, value: totalLines, toneClassName: "text-primary" },
          { label: messages.builder.npcs, value: npcGroups.size },
          { label: messages.navigation.localeLabel, value: locale },
        ],
      })}
      ${renderWorkspaceFrame({
        navigatorTitle: messages.builder.dialogueWorkspaceTitle,
        navigatorDescription: messages.builder.dialogueCreateDescription,
        navigatorBody: `<article class="${cardClasses.bordered}">
            <div class="card-body gap-4">
              <form method="get" action="${escapeHtml(searchAction)}" class="space-y-3" hx-get="${escapeHtml(searchAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-push-url="true">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueSearchLabel)}</legend>
                  <input name="search" type="text" class="input w-full" value="${escapeHtml(search)}" placeholder="${escapeHtml(messages.builder.dialogueSearchPlaceholder)}" aria-label="${escapeHtml(messages.builder.dialogueSearchLabel)}" />
                </fieldset>
                <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.filterAction)}">${escapeHtml(messages.builder.filterAction)}</button>
              </form>

              <form
                class="space-y-3"
                hx-post="${escapeHtml(createAction)}"
                hx-target="#builder-content"
                hx-swap="innerHTML"
                hx-indicator="#dialogue-create-spinner"
                hx-disabled-elt="button, input, select, textarea"
              >
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueSpeakerLabel)}</legend>
                  <input name="speakerId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.dialogueSpeakerPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.dialogueSpeakerLabel)}" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueMomentLabel)}</legend>
                  <input name="lineReference" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.dialogueMomentPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.dialogueMomentLabel)}" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueLine)}</legend>
                  <textarea name="text" class="textarea w-full" rows="3" placeholder="${escapeHtml(messages.builder.addLinePlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.dialogueLine)}"></textarea>
                </fieldset>
                <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                  <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                  <div class="collapse-content pt-2">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueKey)}</legend>
                      <input name="key" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.dialogueKeyPlaceholder)}" aria-label="${escapeHtml(messages.builder.dialogueKey)}" />
                    </fieldset>
                  </div>
                </details>
                <div class="flex items-center gap-2">
                  <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addDialogue)}">${escapeHtml(messages.builder.addDialogue)}</button>
                  <span id="dialogue-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                </div>
              </form>
            </div>
          </article>

          ${browseControls}

          ${
            groupHtml.length > 0
              ? `<div class="space-y-4">${groupHtml}</div>`
              : renderEmptyStateCompact(
                  messages.builder.noDialogues,
                  messages.builder.dialogueCreateDescription,
                )
          }`,
        mainBody: `<div id="dialogue-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
          ${
            selectedLine
              ? renderDialogueDetail(
                  messages,
                  selectedLine.key,
                  selectedLine.text,
                  locale,
                  projectId,
                )
              : renderEmptyStateCompact(
                  messages.builder.noDialogues,
                  messages.builder.dialogueCreateDescription,
                )
          }
        </div>`,
        sideSections: [
          {
            title: messages.builder.preview,
            description: selectedLine
              ? humanizeBuilderIdentifier(getDialogueReference(selectedLine.key))
              : messages.builder.dialogueCreateDescription,
            body: `<div class="rounded-box border border-base-300 bg-base-200/55 p-4 text-sm leading-6 text-base-content/72">${
              selectedLine
                ? escapeHtml(selectedLine.text)
                : escapeHtml(messages.builder.noDialogues)
            }</div>`,
          },
          {
            title: messages.builder.creatorSupportTitle,
            description: messages.builder.dialogueCreateDescription,
            body: `<div class="space-y-3 text-sm leading-6 text-base-content/72">
              <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.dialogueCreateDescription)}</div>
              <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.creatorAssistDescription)}</div>
            </div>`,
          },
        ],
      })}
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
  _locale: LocaleCode,
  projectId: string,
): string => {
  const formAction = interpolateRoutePath(appRoutes.builderApiDialogueEntryForm, {
    projectId,
    key,
  });
  const deleteAction = interpolateRoutePath(appRoutes.builderApiDialogueEntry, { projectId, key });

  return `
    <div class="${cardClasses.bordered}">
      <form
        class="card-body gap-4"
        hx-post="${escapeHtml(formAction)}"
        hx-target="#dialogue-detail"
        hx-swap="innerHTML"
        hx-indicator="#dialogue-detail-spinner"
        hx-disabled-elt="button, input, select, textarea"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="card-title text-sm">${escapeHtml(humanizeBuilderIdentifier(getDialogueReference(key)))}</h3>
            <div class="font-mono text-xs text-base-content/60">${escapeHtml(key)}</div>
          </div>
          <button
            type="button"
            class="btn btn-error btn-outline btn-xs"
            hx-delete="${escapeHtml(deleteAction)}"
            hx-target="#builder-content"
            hx-swap="innerHTML"
            hx-indicator="#dialogue-delete-spinner"
            hx-disabled-elt="this"
            aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(humanizeBuilderIdentifier(getDialogueReference(key)))}"
        >${escapeHtml(messages.builder.delete)}</button>
          <span id="dialogue-delete-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
        <div class="form-control">
          <label class="label" for="dialogue-text"><span class="label-text">${escapeHtml(messages.builder.dialogueLine)}</span></label>
          <textarea
            id="dialogue-text"
            name="text"
            class="textarea textarea-bordered w-full min-h-28"
            required
            aria-required="true"
            aria-label="${escapeHtml(messages.builder.dialogueLine)}"
          >${escapeHtml(text)}</textarea>
        </div>
        <div class="flex items-center justify-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
          <span id="dialogue-detail-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
    </div>`;
};

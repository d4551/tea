/**
 * NPC Editor View
 *
 * NPC roster workspace with scene-aware creation and detail editing.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { resolveCreatorFacingText } from "../../domain/builder/builder-display.ts";
import { resolveGameText } from "../../domain/game/data/game-text.ts";
import { BUILDER_LIBRARY_PAGE_SIZE } from "../../shared/constants/builder-defaults.ts";
import { BUILDER_QUERY_PARAM_PAGE } from "../../shared/constants/builder-query.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  SceneDefinition,
  SceneNpcDefinition,
  SpriteManifest,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import {
  cardClasses,
  renderEmptyStateCompact,
  spinnerClasses,
} from "../shared/ui-components.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";
import { getBooleanLabel } from "./view-labels.ts";
import {
  paginateWorkspaceItems,
  renderWorkspaceBrowseControls,
  renderWorkspaceFrame,
  renderWorkspaceShell,
} from "./workspace-shell.ts";

const resolveNpcDisplayName = (locale: LocaleCode, npc: SceneNpcDefinition): string =>
  resolveCreatorFacingText(
    resolveGameText(locale, npc.labelKey),
    npc.displayName || npc.labelKey,
    npc.characterKey,
  );

const resolveSceneDisplayName = (locale: LocaleCode, scene: SceneDefinition): string =>
  resolveCreatorFacingText(
    resolveGameText(locale, scene.titleKey),
    scene.displayTitle || scene.titleKey,
    scene.id,
  );

/**
 * Renders the NPC roster workspace.
 *
 * @param messages Locale-resolved messages.
 * @param scenes All scene definitions.
 * @param manifests Available sprite manifests.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for NPC editor panel.
 */
export const renderNpcEditor = (
  messages: Messages,
  scenes: Record<string, SceneDefinition>,
  manifests: Record<string, SpriteManifest>,
  locale: LocaleCode,
  projectId: string,
  search = "",
  page = 1,
): string => {
  const normalizedSearch = search.trim().toLowerCase();
  const allNpcs: Array<{ sceneId: string; npc: SceneNpcDefinition }> = [];
  for (const [sceneId, scene] of Object.entries(scenes)) {
    for (const npc of scene.npcs) {
      if (
        normalizedSearch.length > 0 &&
        !resolveNpcDisplayName(locale, npc).toLowerCase().includes(normalizedSearch) &&
        !npc.characterKey.toLowerCase().includes(normalizedSearch)
      ) {
        continue;
      }
      allNpcs.push({ sceneId, npc });
    }
  }

  const paginated = paginateWorkspaceItems(allNpcs, page, BUILDER_LIBRARY_PAGE_SIZE);
  const selectedNpc = paginated.items[0] ?? null;
  const createAction = interpolateRoutePath(appRoutes.builderApiNpcsCreateForm, { projectId });
  const sceneCount = Object.keys(scenes).length;
  const manifestCount = Object.keys(manifests).length;
  const creatorJourney = buildBuilderJourneyConfig(messages, locale, projectId, "characters");
  const sceneOptions = Object.values(scenes)
    .map(
      (scene) =>
        `<option value="${escapeHtml(scene.id)}">${escapeHtml(resolveSceneDisplayName(locale, scene))} (${scene.npcs.length})</option>`,
    )
    .join("");

  const npcPath = interpolateRoutePath(appRoutes.builderNpcs, { projectId });
  const searchAction = npcPath;
  const previousHref =
    paginated.page > 1
      ? withQueryParameters(searchAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginated.page - 1),
          ...(search ? { search } : {}),
        })
      : undefined;
  const nextHref =
    paginated.page < paginated.totalPages
      ? withQueryParameters(searchAction, {
          [BUILDER_QUERY_PARAM_PAGE]: String(paginated.page + 1),
          ...(search ? { search } : {}),
        })
      : undefined;

  const browseControls = renderWorkspaceBrowseControls({
    action: searchAction,
    search,
    searchLabel: messages.builder.npcRosterTitle,
    searchPlaceholder: messages.builder.npcCreateLabelPlaceholder,
    submitLabel: messages.builder.filterAction,
    resultsLabel: messages.builder.resultsLabel,
    previousLabel: messages.builder.previousPage,
    nextLabel: messages.builder.nextPage,
    pageLabel: messages.builder.pageLabel,
    page: paginated.page,
    totalPages: paginated.totalPages,
    totalItems: paginated.totalItems,
    startIndex: paginated.startIndex,
    endIndex: paginated.endIndex,
    hiddenFields: {},
    htmxTarget: "#builder-content",
    previousHref,
    nextHref,
  });

  const rosterCards = paginated.items
    .map(({ sceneId, npc }) => {
      const manifest = manifests[npc.characterKey];
      const scene = scenes[sceneId];
      const sceneDisplayName = scene ? resolveSceneDisplayName(locale, scene) : sceneId;
      const npcDisplayName = resolveNpcDisplayName(locale, npc);
      const detailHref = interpolateRoutePath(appRoutes.builderApiNpcDetail, {
        projectId,
        npcId: npc.characterKey,
      });
      return `<article class="${cardClasses.bordered}">
        <div class="card-body gap-3">
          <div class="flex items-start gap-3">
            ${
              manifest
                ? `<div class="avatar">
                    <div class="mask mask-squircle h-14 w-14 bg-base-200">
                      <img src="${escapeHtml(manifest.sheet)}" alt="${escapeHtml(npcDisplayName)}" loading="lazy" />
                    </div>
                  </div>`
                : ""
            }
            <div class="min-w-0 flex-1">
              <h2 class="card-title text-lg">${escapeHtml(npcDisplayName)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(sceneDisplayName)}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 text-sm">
            <span class="badge badge-soft">${npc.x}, ${npc.y}</span>
            <span class="badge badge-soft">${escapeHtml(messages.builder.wanderRadius)} ${npc.ai.wanderRadius}</span>
            <span class="badge badge-soft">${escapeHtml(messages.builder.dialogue)} ${npc.dialogueKeys.length}</span>
          </div>
          <button
            class="btn btn-outline btn-sm"
            hx-get="${escapeHtml(detailHref)}"
            hx-target="#npc-detail"
            hx-swap="innerHTML"
            aria-label="${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npcDisplayName)}"
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`;
    })
    .join("");

  const selectedNpcManifest =
    selectedNpc === null ? null : (manifests[selectedNpc.npc.characterKey] ?? null);
  const selectedNpcScene = selectedNpc === null ? null : (scenes[selectedNpc.sceneId] ?? null);

  return `
    <section class="space-y-6 animate-fade-in-up">
      ${renderWorkspaceShell({
        eyebrow: messages.builder.npcs,
        title: messages.builder.npcRosterTitle,
        description: messages.builder.npcCreateDescription,
        journey: creatorJourney,
        facets: [
          { label: messages.builder.sceneMode2d, badgeClassName: "badge-primary" },
          { label: messages.builder.dialogue, badgeClassName: "badge-secondary" },
        ],
        metrics: [
          { label: messages.builder.npcs, value: allNpcs.length, toneClassName: "text-primary" },
          { label: messages.builder.totalScenes, value: sceneCount },
          { label: messages.builder.spriteManifestCountLabel, value: manifestCount },
        ],
      })}
      ${renderWorkspaceFrame({
        navigatorTitle: messages.builder.npcRosterTitle,
        navigatorDescription: messages.builder.npcCreateDescription,
        navigatorBody: `<article class="${cardClasses.bordered}">
            <form
              class="card-body gap-4"
              hx-post="${escapeHtml(createAction)}"
              hx-target="#builder-content"
              hx-swap="innerHTML"
              hx-indicator="#npc-create-spinner"
              hx-disabled-elt="button, input, select, textarea"
            >
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.npcCreateSceneLabel)}</legend>
                <select name="sceneId" class="select w-full" aria-label="${escapeHtml(messages.builder.sceneId)}">${sceneOptions}</select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.npcName)}</legend>
                <input name="displayName" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.npcCreateLabelPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.npcName)}" />
              </fieldset>
              <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                <div class="collapse-content pt-2">
                  <div class="rounded-box border border-dashed border-base-300 bg-base-200/45 p-3 text-sm text-base-content/70">
                    ${escapeHtml(messages.builder.advancedTools)}
                  </div>
                </div>
              </details>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addNpc)}">${escapeHtml(messages.builder.addNpc)}</button>
                <span id="npc-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
              </div>
            </form>
          </article>
          ${browseControls}
          ${
            rosterCards.length > 0
              ? `<div class="grid gap-4">${rosterCards}</div>`
              : renderEmptyStateCompact(
                  messages.builder.noNpcs,
                  messages.builder.npcCreateDescription,
                )
          }`,
        mainBody: `<div id="npc-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
          ${
            selectedNpc
              ? renderNpcDetail(
                  messages,
                  selectedNpc.npc,
                  locale,
                  projectId,
                  selectedNpc.sceneId,
                  selectedNpcManifest,
                )
              : renderEmptyStateCompact(
                  messages.builder.noNpcs,
                  messages.builder.npcCreateDescription,
                )
          }
        </div>`,
        sideSections: selectedNpc
          ? [
              {
                title: messages.builder.preview,
                description: resolveNpcDisplayName(locale, selectedNpc.npc),
                body: `${
                  selectedNpcManifest
                    ? `<div class="avatar">
                      <div class="mask mask-squircle h-32 w-32 bg-base-200">
                        <img src="${escapeHtml(selectedNpcManifest.sheet)}" alt="${escapeHtml(resolveNpcDisplayName(locale, selectedNpc.npc))}" loading="lazy" />
                      </div>
                    </div>`
                    : `<div class="flex h-32 items-center justify-center rounded-box border border-dashed border-base-300 bg-base-200/45 text-sm text-base-content/60">${escapeHtml(messages.builder.assetPlaceholder)}</div>`
                }
                  <div class="flex flex-wrap gap-2">
                    <span class="badge badge-outline">${escapeHtml(selectedNpcScene ? resolveSceneDisplayName(locale, selectedNpcScene) : selectedNpc.sceneId)}</span>
                    <span class="badge badge-soft">${escapeHtml(getBooleanLabel(messages, selectedNpc.npc.ai.greetOnApproach))}</span>
                  </div>`,
              },
              {
                title: messages.builder.creatorSupportTitle,
                description: messages.builder.npcCreateDescription,
                body: `<div class="space-y-3 text-sm leading-6 text-base-content/72">
                  <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.dialogueCreateDescription)}</div>
                  <div class="rounded-box border border-base-300 bg-base-200/55 p-3">${escapeHtml(messages.builder.sceneCreateDescription)}</div>
                </div>`,
              },
            ]
          : [
              {
                title: messages.builder.creatorSupportTitle,
                description: messages.builder.npcCreateDescription,
                body: `<div class="rounded-box border border-base-300 bg-base-200/55 p-3 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.dialogueCreateDescription)}</div>`,
              },
            ],
      })}
    </section>`;
};

/**
 * Renders an editable NPC detail form for HTMX updates.
 *
 * @param messages Locale-resolved messages.
 * @param npc NPC to edit.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @param sceneId Owning scene id.
 * @param manifest Available sprite manifest for the NPC.
 * @returns HTML string for the editable NPC card.
 */
export const renderNpcDetail = (
  messages: Messages,
  npc: SceneNpcDefinition,
  locale: LocaleCode,
  projectId: string,
  sceneId: string,
  manifest: SpriteManifest | null,
): string => {
  const formAction = interpolateRoutePath(appRoutes.builderApiNpcForm, { projectId, npcId: npc.characterKey });
  const deleteAction = interpolateRoutePath(appRoutes.builderApiNpcDetail, { projectId, npcId: npc.characterKey });
  const dialogueKeys = npc.dialogueKeys.join(", ");
  const npcDisplayName = resolveNpcDisplayName(locale, npc);

  return `
    <div class="${cardClasses.bordered}">
      <div class="card-body gap-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex items-start gap-3">
            ${
              manifest
                ? `<div class="avatar">
                    <div class="mask mask-squircle h-18 w-18 bg-base-200">
                      <img src="${escapeHtml(manifest.sheet)}" alt="${escapeHtml(npcDisplayName)}" loading="lazy" />
                    </div>
                  </div>`
                : ""
            }
            <div>
              <h2 class="card-title text-2xl">${escapeHtml(npcDisplayName)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.sceneId)} · ${escapeHtml(sceneId)}</p>
            </div>
          </div>
          <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#npc-delete-spinner" hx-disabled-elt="button">
            <span class="flex items-center gap-2">
              <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(npcDisplayName)}">${escapeHtml(messages.builder.delete)}</button>
              <span id="npc-delete-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </span>
          </form>
        </div>

        <form
          class="grid gap-4 lg:grid-cols-2"
          hx-post="${escapeHtml(formAction)}"
          hx-target="#npc-detail"
          hx-swap="innerHTML"
          hx-indicator="#npc-detail-spinner"
          hx-disabled-elt="button, input, select, textarea"
        >
          <input type="hidden" name="sceneId" value="${escapeHtml(sceneId)}" />
          <div class="form-control">
            <label class="label" for="npc-display-name"><span class="label-text">${escapeHtml(messages.builder.npcName)}</span></label>
            <input id="npc-display-name" name="displayName" type="text" class="input input-bordered w-full" value="${escapeHtml(npcDisplayName)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.npcName)}" />
          </div>

          <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100 lg:col-span-2">
            <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
            <div class="collapse-content grid gap-4 pt-2 lg:grid-cols-2">
              <input type="hidden" name="labelKey" value="${escapeHtml(npc.labelKey)}" />
              <div class="form-control">
                <label class="label" for="npc-stable-id"><span class="label-text">${escapeHtml(messages.builder.idLabel)}</span></label>
                <input id="npc-stable-id" type="text" class="input input-bordered w-full builder-mono" value="${escapeHtml(npc.characterKey)}" readonly aria-label="${escapeHtml(messages.builder.idLabel)}" />
              </div>
              <div class="form-control">
                <label class="label" for="npc-label-key"><span class="label-text">${escapeHtml(messages.builder.idLabel)}</span></label>
                <input id="npc-label-key" type="text" class="input input-bordered w-full builder-mono" value="${escapeHtml(npc.labelKey)}" readonly aria-label="${escapeHtml(messages.builder.idLabel)}" />
              </div>
            </div>
          </details>

          <div class="form-control">
            <label class="label" for="npc-x"><span class="label-text">${escapeHtml(messages.builder.npcPosition)} · ${escapeHtml(messages.builder.xLabel)}</span></label>
            <input id="npc-x" name="x" type="number" class="input input-bordered w-full" value="${npc.x}" required aria-required="true" aria-label="${escapeHtml(messages.builder.xLabel)}" />
          </div>
          <div class="form-control">
            <label class="label" for="npc-y"><span class="label-text">${escapeHtml(messages.builder.yLabel)}</span></label>
            <input id="npc-y" name="y" type="number" class="input input-bordered w-full" value="${npc.y}" required aria-required="true" aria-label="${escapeHtml(messages.builder.yLabel)}" />
          </div>

          <div class="form-control">
            <label class="label" for="npc-interact-radius"><span class="label-text">${escapeHtml(messages.builder.interactRadius)}</span></label>
            <input id="npc-interact-radius" name="interactRadius" type="number" class="input input-bordered w-full" value="${npc.interactRadius}" min="1" required aria-required="true" aria-label="${escapeHtml(messages.builder.interactRadius)}" />
          </div>
          <div class="form-control">
            <label class="label" for="npc-wander-radius"><span class="label-text">${escapeHtml(messages.builder.wanderRadius)}</span></label>
            <input id="npc-wander-radius" name="wanderRadius" type="number" class="input input-bordered w-full" value="${npc.ai.wanderRadius}" min="0" required aria-required="true" aria-label="${escapeHtml(messages.builder.wanderRadius)}" />
          </div>

          <div class="form-control">
            <label class="label" for="npc-wander-speed"><span class="label-text">${escapeHtml(messages.builder.wanderSpeed)}</span></label>
            <input id="npc-wander-speed" name="wanderSpeed" type="number" class="input input-bordered w-full" value="${npc.ai.wanderSpeed}" min="0" step="0.1" required aria-required="true" aria-label="${escapeHtml(messages.builder.wanderSpeed)}" />
          </div>
          <div class="form-control">
            <label class="label" for="npc-idle-min"><span class="label-text">${escapeHtml(messages.builder.idlePauseMinMs)}</span></label>
            <input id="npc-idle-min" name="idlePauseMinMs" type="number" class="input input-bordered w-full" value="${npc.ai.idlePauseMs[0]}" min="0" step="1" required aria-required="true" aria-label="${escapeHtml(messages.builder.idlePauseMinMs)}" />
          </div>
          <div class="form-control">
            <label class="label" for="npc-idle-max"><span class="label-text">${escapeHtml(messages.builder.idlePauseMaxMs)}</span></label>
            <input id="npc-idle-max" name="idlePauseMaxMs" type="number" class="input input-bordered w-full" value="${npc.ai.idlePauseMs[1]}" min="0" step="1" required aria-required="true" aria-label="${escapeHtml(messages.builder.idlePauseMaxMs)}" />
          </div>

          <div class="form-control lg:col-span-2">
            <label class="label" for="npc-dialogue-keys"><span class="label-text">${escapeHtml(messages.builder.dialogue)} · ${escapeHtml(messages.builder.dialogueKey)}</span></label>
            <textarea id="npc-dialogue-keys" name="dialogueKeys" class="textarea textarea-bordered w-full" rows="3" aria-label="${escapeHtml(messages.builder.dialogueSearchLabel)}">${escapeHtml(dialogueKeys)}</textarea>
          </div>
          <div class="form-control">
            <label class="label" for="npc-greet-line-key"><span class="label-text">${escapeHtml(messages.builder.greetLineKey)}</span></label>
            <input id="npc-greet-line-key" name="greetLineKey" type="text" class="input input-bordered w-full" value="${escapeHtml(npc.ai.greetLineKey)}" aria-label="${escapeHtml(messages.builder.greetLineKey)}" />
          </div>
          <div class="form-control">
            <label class="label" for="npc-greet-enabled"><span class="label-text">${escapeHtml(messages.builder.greetOnApproach)}</span></label>
            <select id="npc-greet-enabled" name="greetOnApproach" class="select select-bordered w-full" aria-label="${escapeHtml(messages.builder.greetOnApproach)}">
              <option value="true"${npc.ai.greetOnApproach ? " selected" : ""}>${escapeHtml(getBooleanLabel(messages, true))}</option>
              <option value="false"${npc.ai.greetOnApproach ? "" : " selected"}>${escapeHtml(getBooleanLabel(messages, false))}</option>
            </select>
          </div>

          <div class="lg:col-span-2 flex items-center justify-end gap-2">
            <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
            <span id="npc-detail-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
      </div>
    </div>`;
};

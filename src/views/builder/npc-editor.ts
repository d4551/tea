/**
 * NPC Editor View
 *
 * NPC roster workspace with scene-aware creation and detail editing.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  SceneDefinition,
  SceneNpcDefinition,
  SpriteManifest,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { getBooleanLabel } from "./view-labels.ts";
import { renderWorkspaceShell } from "./workspace-shell.ts";

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
): string => {
  const allNpcs: Array<{ sceneId: string; npc: SceneNpcDefinition }> = [];
  for (const [sceneId, scene] of Object.entries(scenes)) {
    for (const npc of scene.npcs) {
      allNpcs.push({ sceneId, npc });
    }
  }

  const selectedNpc = allNpcs[0] ?? null;
  const createAction = `${appRoutes.builderApiNpcs}/create/form`;
  const sceneCount = Object.keys(scenes).length;
  const manifestCount = Object.keys(manifests).length;
  const sceneOptions = Object.values(scenes)
    .map(
      (scene) =>
        `<option value="${escapeHtml(scene.id)}">${escapeHtml(scene.id)} (${scene.npcs.length})</option>`,
    )
    .join("");

  const rosterCards = allNpcs
    .map(({ sceneId, npc }) => {
      const manifest = manifests[npc.characterKey];
      const detailHref = withQueryParameters(
        `${appRoutes.builderApiNpcs}/${encodeURIComponent(npc.characterKey)}`,
        {
          locale,
          projectId,
          sceneId,
        },
      );
      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-start gap-3">
            ${
              manifest
                ? `<div class="avatar">
                    <div class="mask mask-squircle h-14 w-14 bg-base-200">
                      <img src="${escapeHtml(manifest.sheet)}" alt="${escapeHtml(npc.characterKey)}" loading="lazy" />
                    </div>
                  </div>`
                : ""
            }
            <div class="min-w-0 flex-1">
              <h2 class="card-title text-lg">${escapeHtml(npc.characterKey)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(sceneId)} · ${escapeHtml(npc.labelKey)}</p>
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
            aria-label="${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npc.characterKey)}"
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="space-y-6 animate-fade-in-up">
      ${renderWorkspaceShell({
        eyebrow: messages.builder.npcs,
        title: messages.builder.npcRosterTitle,
        description: messages.builder.npcCreateDescription,
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
      <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div class="space-y-4">
        <article class="card card-border bg-base-100 shadow-sm">
          <form
            class="card-body gap-4"
            hx-post="${escapeHtml(createAction)}"
            hx-target="#builder-content"
            hx-swap="innerHTML"
            hx-indicator="#npc-create-spinner"
            hx-disabled-elt="button, input, select, textarea"
          >
            <div class="space-y-1">
              <h1 class="card-title text-2xl">${escapeHtml(messages.builder.npcRosterTitle)}</h1>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.npcCreateDescription)}</p>
            </div>
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.npcCreateSceneLabel)}</legend>
              <select name="sceneId" class="select w-full">${sceneOptions}</select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.npcName)}</legend>
              <input name="characterKey" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.npcCreateKeyPlaceholder)}" aria-required="true" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.npcLabel)}</legend>
              <input name="labelKey" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.npcCreateLabelPlaceholder)}" aria-required="true" required />
            </fieldset>
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addNpc)}">${escapeHtml(messages.builder.addNpc)}</button>
              <span id="npc-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>
          </form>
        </article>

        ${
          rosterCards.length > 0
            ? `<div class="grid gap-4">${rosterCards}</div>`
            : `<div role="alert" class="alert alert-warning alert-soft"><span>${escapeHtml(messages.builder.noNpcs)}</span></div>`
        }
      </div>

      <div id="npc-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        ${
          selectedNpc
            ? renderNpcDetail(
                messages,
                selectedNpc.npc,
                locale,
                projectId,
                selectedNpc.sceneId,
                manifests[selectedNpc.npc.characterKey] ?? null,
              )
            : `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noNpcs)}</span></div>`
        }
      </div>
    </section>
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
  const formAction = withQueryParameters(
    `${appRoutes.builderApiNpcs}/${encodeURIComponent(npc.characterKey)}/form`,
    {
      locale,
      projectId,
      sceneId,
    },
  );
  const deleteAction = withQueryParameters(
    `${appRoutes.builderApiNpcs}/${encodeURIComponent(npc.characterKey)}`,
    {
      locale,
      projectId,
    },
  );
  const dialogueKeys = npc.dialogueKeys.join(", ");

  return `
    <div class="card card-border bg-base-100 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex items-start gap-3">
            ${
              manifest
                ? `<div class="avatar">
                    <div class="mask mask-squircle h-18 w-18 bg-base-200">
                      <img src="${escapeHtml(manifest.sheet)}" alt="${escapeHtml(npc.characterKey)}" loading="lazy" />
                    </div>
                  </div>`
                : ""
            }
            <div>
              <h2 class="card-title text-2xl">${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npc.characterKey)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(sceneId)}</p>
            </div>
          </div>
          <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#npc-delete-spinner" hx-disabled-elt="button">
            <span class="flex items-center gap-2">
              <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(npc.characterKey)}">${escapeHtml(messages.builder.delete)}</button>
              <span id="npc-delete-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
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
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.npcLabel)}</legend>
            <input name="labelKey" type="text" class="input w-full" value="${escapeHtml(npc.labelKey)}" aria-required="true" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.npcPosition)}</legend>
            <label class="label" for="npc-x">${escapeHtml(messages.builder.xLabel)}</label>
            <input id="npc-x" name="x" type="number" class="input w-full" value="${npc.x}" aria-required="true" required />
            <label class="label" for="npc-y">${escapeHtml(messages.builder.yLabel)}</label>
            <input id="npc-y" name="y" type="number" class="input w-full" value="${npc.y}" aria-required="true" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
            <label class="label" for="npc-interact-radius">${escapeHtml(messages.builder.interactRadius)}</label>
            <input id="npc-interact-radius" name="interactRadius" type="number" class="input w-full" value="${npc.interactRadius}" min="1" aria-required="true" required />
            <label class="label" for="npc-wander-radius">${escapeHtml(messages.builder.wanderRadius)}</label>
            <input id="npc-wander-radius" name="wanderRadius" type="number" class="input w-full" value="${npc.ai.wanderRadius}" min="0" aria-required="true" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.wanderSpeed)}</legend>
            <label class="label" for="npc-wander-speed">${escapeHtml(messages.builder.wanderSpeed)}</label>
            <input id="npc-wander-speed" name="wanderSpeed" type="number" class="input w-full" value="${npc.ai.wanderSpeed}" min="0" step="0.1" aria-required="true" required />
            <label class="label" for="npc-idle-min">${escapeHtml(messages.builder.idlePauseMinMs)}</label>
            <input id="npc-idle-min" name="idlePauseMinMs" type="number" class="input w-full" value="${npc.ai.idlePauseMs[0]}" min="0" step="1" aria-required="true" required />
            <label class="label" for="npc-idle-max">${escapeHtml(messages.builder.idlePauseMaxMs)}</label>
            <input id="npc-idle-max" name="idlePauseMaxMs" type="number" class="input w-full" value="${npc.ai.idlePauseMs[1]}" min="0" step="1" aria-required="true" required />
          </fieldset>

          <fieldset class="fieldset lg:col-span-2">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogue)}</legend>
            <label class="label" for="npc-dialogue-keys">${escapeHtml(messages.builder.dialogueKey)}</label>
            <textarea id="npc-dialogue-keys" name="dialogueKeys" class="textarea w-full" rows="3">${escapeHtml(dialogueKeys)}</textarea>
            <div class="grid gap-4 lg:grid-cols-2">
              <div>
                <label class="label" for="npc-greet-line-key">${escapeHtml(messages.builder.greetLineKey)}</label>
                <input id="npc-greet-line-key" name="greetLineKey" type="text" class="input w-full" value="${escapeHtml(npc.ai.greetLineKey)}" />
              </div>
              <div>
                <label class="label" for="npc-greet-enabled">${escapeHtml(messages.builder.greetOnApproach)}</label>
                <select id="npc-greet-enabled" name="greetOnApproach" class="select w-full">
                  <option value="true"${npc.ai.greetOnApproach ? " selected" : ""}>${escapeHtml(getBooleanLabel(messages, true))}</option>
                  <option value="false"${npc.ai.greetOnApproach ? "" : " selected"}>${escapeHtml(getBooleanLabel(messages, false))}</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div class="lg:col-span-2 flex items-center justify-end gap-2">
            <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
            <span id="npc-detail-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
      </div>
    </div>`;
};

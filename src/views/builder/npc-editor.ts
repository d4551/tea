/**
 * NPC Editor View
 *
 * Table-based NPC configuration with AI tuning controls.
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

/**
 * Renders the NPC editor table across all scenes.
 *
 * @param messages Locale-resolved messages.
 * @param scenes All scene definitions.
 * @param manifests Available sprite manifests.
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

  if (allNpcs.length === 0) {
    return `
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.npcs)}</h1>
        <div class="alert" role="alert">
          <span>${escapeHtml(messages.builder.noNpcs)}</span>
        </div>
      </div>`;
  }

  const rows = allNpcs
    .map(({ sceneId, npc }) => {
      const manifest = manifests[npc.characterKey];
      const sheetThumb = manifest ? escapeHtml(manifest.sheet) : "—";
      const detailHref = withQueryParameters(
        `${appRoutes.builderApiNpcs}/${encodeURIComponent(npc.characterKey)}`,
        {
          locale,
          projectId,
          sceneId,
        },
      );
      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              ${manifest ? `<div class="avatar"><div class="mask mask-squircle h-10 w-10 bg-base-300"><img src="${sheetThumb}" alt="${escapeHtml(npc.characterKey)}" loading="lazy" /></div></div>` : ""}
              <div class="font-bold">${escapeHtml(npc.characterKey)}</div>
            </div>
          </td>
          <td class="font-mono text-xs">${escapeHtml(sceneId)}</td>
          <td>${npc.x}, ${npc.y}</td>
          <td>${npc.ai.wanderRadius}</td>
          <td>${npc.ai.wanderSpeed.toFixed(2)}</td>
          <td>${npc.dialogueKeys.length}</td>
          <td>
            <button
              class="btn btn-ghost btn-xs"
              hx-get="${escapeHtml(detailHref)}"
              hx-target="#npc-detail"
              hx-swap="innerHTML"
              aria-label="${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npc.characterKey)}"
            >${escapeHtml(messages.builder.preview)}</button>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.npcs)}</h1>

      <div class="overflow-x-auto">
        <table class="table table-zebra bg-base-100" aria-label="${escapeHtml(messages.builder.npcs)}">
          <caption class="sr-only">${escapeHtml(messages.builder.npcs)}</caption>
          <thead>
            <tr>
              <th scope="col">${escapeHtml(messages.builder.npcName)}</th>
              <th scope="col">${escapeHtml(messages.builder.scenes)}</th>
              <th scope="col">${escapeHtml(messages.builder.npcPosition)}</th>
              <th scope="col">${escapeHtml(messages.builder.wanderRadius)}</th>
              <th scope="col">${escapeHtml(messages.builder.wanderSpeed)}</th>
              <th scope="col">${escapeHtml(messages.builder.dialogue)}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div id="npc-detail" class="mt-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        <!-- NPC detail panel swapped here via HTMX -->
      </div>
    </div>`;
};
/**
 * Renders an editable NPC detail form for HTMX updates.
 *
 * @param messages Locale-resolved messages.
 * @param npc NPC to edit.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @param sceneId Owning scene id.
 * @returns HTML string for the editable NPC card.
 */
export const renderNpcDetail = (
  messages: Messages,
  npc: SceneNpcDefinition,
  locale: LocaleCode,
  projectId: string,
  sceneId: string,
): string => {
  const formAction = withQueryParameters(
    `${appRoutes.builderApiNpcs}/${encodeURIComponent(npc.characterKey)}/form`,
    {
      locale,
      projectId,
      sceneId,
    },
  );
  const dialogueKeys = npc.dialogueKeys.join(", ");

  return `
    <div class="card bg-base-100 shadow-sm">
      <form
        class="card-body gap-4"
        hx-post="${escapeHtml(formAction)}"
        hx-target="#npc-detail"
        hx-swap="innerHTML"
      >
        <h2 class="card-title">${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npc.characterKey)}</h2>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.npcName)}</legend>
          <input name="labelKey" type="text" class="input input-bordered w-full" value="${escapeHtml(npc.labelKey)}" required />
        </fieldset>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.npcPosition)}</legend>
            <label class="label" for="npc-x">${escapeHtml(messages.builder.xLabel)}</label>
            <input id="npc-x" name="x" type="number" class="input input-bordered w-full" value="${npc.x}" required />
            <label class="label" for="npc-y">${escapeHtml(messages.builder.yLabel)}</label>
            <input id="npc-y" name="y" type="number" class="input input-bordered w-full" value="${npc.y}" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
            <label class="label" for="npc-interact-radius">${escapeHtml(messages.builder.wanderRadius)}</label>
            <input id="npc-interact-radius" name="interactRadius" type="number" class="input input-bordered w-full" value="${npc.interactRadius}" min="1" required />
            <label class="label" for="npc-wander-radius">${escapeHtml(messages.builder.wanderRadius)}</label>
            <input id="npc-wander-radius" name="wanderRadius" type="number" class="input input-bordered w-full" value="${npc.ai.wanderRadius}" min="0" required />
          </fieldset>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.wanderSpeed)}</legend>
            <input name="wanderSpeed" type="number" class="input input-bordered w-full" value="${npc.ai.wanderSpeed}" min="0" step="0.1" required />
            <label class="label" for="npc-idle-min">Idle pause min (ms)</label>
            <input id="npc-idle-min" name="idlePauseMinMs" type="number" class="input input-bordered w-full" value="${npc.ai.idlePauseMs[0]}" min="0" step="1" required />
            <label class="label" for="npc-idle-max">Idle pause max (ms)</label>
            <input id="npc-idle-max" name="idlePauseMaxMs" type="number" class="input input-bordered w-full" value="${npc.ai.idlePauseMs[1]}" min="0" step="1" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogue)}</legend>
            <label class="label" for="npc-dialogue-keys">${escapeHtml(messages.builder.dialogueKey)}</label>
            <textarea id="npc-dialogue-keys" name="dialogueKeys" class="textarea textarea-bordered w-full" rows="3">${escapeHtml(dialogueKeys)}</textarea>
            <label class="label" for="npc-greet-line-key">Greeting line key</label>
            <input id="npc-greet-line-key" name="greetLineKey" type="text" class="input input-bordered w-full" value="${escapeHtml(npc.ai.greetLineKey)}" />
            <label class="label" for="npc-greet-enabled">Greet on approach</label>
            <select id="npc-greet-enabled" name="greetOnApproach" class="select select-bordered w-full">
              <option value="true"${npc.ai.greetOnApproach ? " selected" : ""}>true</option>
              <option value="false"${npc.ai.greetOnApproach ? "" : " selected"}>false</option>
            </select>
          </fieldset>
        </div>

        <div class="flex items-center justify-end">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
        </div>
      </form>
    </div>`;
};

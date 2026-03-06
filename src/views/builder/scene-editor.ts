/**
 * Scene Editor View
 *
 * Lists all scenes in a DaisyUI table and provides inline editing via HTMX.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { SceneDefinition } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Renders the scene list table.
 *
 * @param messages Locale-resolved messages.
 * @param scenes Scene definitions keyed by ID.
 * @returns HTML string for the scene editor panel.
 */
export const renderSceneEditor = (
  messages: Messages,
  scenes: Record<string, SceneDefinition>,
  locale: LocaleCode,
  projectId: string,
): string => {
  const sceneIds = Object.keys(scenes);

  if (sceneIds.length === 0) {
    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.scenes)}</h1>
        </div>
        <div class="alert" role="alert">
          <span>${escapeHtml(messages.builder.noScenes)}</span>
        </div>
      </div>`;
  }

  const rows = sceneIds
    .map((id) => {
      const scene = scenes[id];
      if (!scene) return "";
      const detailHref = withQueryParameters(`${appRoutes.builderApiScenes}/${scene.id}`, {
        locale,
        projectId,
      });
      return `
        <tr>
          <td class="font-mono text-sm">${escapeHtml(scene.id)}</td>
          <td>${escapeHtml(scene.titleKey)}</td>
          <td>${scene.geometry.width} × ${scene.geometry.height}</td>
          <td>${scene.npcs.length}</td>
          <td>${scene.collisions.length}</td>
          <td>
            <button
              class="btn btn-ghost btn-xs"
              hx-get="${escapeHtml(detailHref)}"
              hx-target="#scene-detail"
              hx-swap="innerHTML"
              aria-label="${escapeHtml(messages.builder.editScene)}: ${escapeHtml(scene.id)}"
            >${escapeHtml(messages.builder.preview)}</button>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.scenes)}</h1>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-zebra bg-base-100" aria-label="${escapeHtml(messages.builder.scenes)}">
          <caption class="sr-only">${escapeHtml(messages.builder.scenes)}</caption>
          <thead>
            <tr>
              <th scope="col">${escapeHtml(messages.builder.sceneId)}</th>
              <th scope="col">${escapeHtml(messages.builder.sceneTitle)}</th>
              <th scope="col">${escapeHtml(messages.builder.geometry)}</th>
              <th scope="col">${escapeHtml(messages.builder.npcs)}</th>
              <th scope="col">${escapeHtml(messages.builder.collisions)}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div id="scene-detail" class="mt-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        <!-- Scene detail panel swapped here via HTMX -->
      </div>
    </div>`;
};

/**
 * Renders a single scene's detail panel for inline editing.
 *
 * @param messages Locale-resolved messages.
 * @param scene Scene to render.
 * @returns HTML string for the scene detail panel.
 */
export const renderSceneDetail = (messages: Messages, scene: SceneDefinition): string => `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.editScene)}: ${escapeHtml(scene.id)}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
          <label class="label" for="scene-width">${escapeHtml(messages.builder.widthLabel)}</label>
          <input id="scene-width" type="number" class="input input-bordered w-full" value="${scene.geometry.width}" readonly aria-describedby="scene-width-desc" />
          <span id="scene-width-desc" class="sr-only">${escapeHtml(messages.builder.sceneWidthDesc)}</span>

          <label class="label" for="scene-height">${escapeHtml(messages.builder.heightLabel)}</label>
          <input id="scene-height" type="number" class="input input-bordered w-full" value="${scene.geometry.height}" readonly aria-describedby="scene-height-desc" />
          <span id="scene-height-desc" class="sr-only">${escapeHtml(messages.builder.sceneHeightDesc)}</span>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.spawnPoint)}</legend>
          <label class="label" for="spawn-x">${escapeHtml(messages.builder.xLabel)}</label>
          <input id="spawn-x" type="number" class="input input-bordered w-full" value="${scene.spawn.x}" readonly />

          <label class="label" for="spawn-y">${escapeHtml(messages.builder.yLabel)}</label>
          <input id="spawn-y" type="number" class="input input-bordered w-full" value="${scene.spawn.y}" readonly />
        </fieldset>
      </div>

      <div class="mt-4">
        <h3 class="font-semibold mb-2">${escapeHtml(messages.builder.npcs)} (${scene.npcs.length})</h3>
        <div class="flex flex-wrap gap-2">
          ${scene.npcs.map((npc) => `<span class="badge badge-outline">${escapeHtml(npc.characterKey)} (${npc.x}, ${npc.y})</span>`).join("")}
        </div>
      </div>

      <div class="mt-4">
        <h3 class="font-semibold mb-2">${escapeHtml(messages.builder.collisions)} (${scene.collisions.length})</h3>
        <div class="flex flex-wrap gap-2">
          ${scene.collisions.map((c) => `<span class="badge badge-ghost text-xs">${c.x},${c.y} ${c.width}×${c.height}</span>`).join("")}
        </div>
      </div>
    </div>
  </div>`;

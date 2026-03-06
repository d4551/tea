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
 * Renders a scene detail form that persists via HTMX.
 *
 * @param messages Locale-resolved messages.
 * @param scene Scene to edit.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for the editable scene detail panel.
 */
export const renderSceneDetail = (
  messages: Messages,
  scene: SceneDefinition,
  locale: LocaleCode,
  projectId: string,
): string => {
  const formAction = withQueryParameters(
    `${appRoutes.builderApiScenes}/${encodeURIComponent(scene.id)}/form`,
    {
      locale,
      projectId,
    },
  );
  const npcBadges = scene.npcs
    .map(
      (npc) =>
        `<span class="badge badge-outline">${escapeHtml(npc.characterKey)} (${npc.x}, ${npc.y})</span>`,
    )
    .join("");
  const collisionBadges = scene.collisions
    .map(
      (collision) =>
        `<span class="badge badge-ghost text-xs">${collision.x},${collision.y} ${collision.width}×${collision.height}</span>`,
    )
    .join("");

  return `
    <div class="card bg-base-100 shadow-sm">
      <form
        class="card-body gap-4"
        hx-post="${escapeHtml(formAction)}"
        hx-target="#scene-detail"
        hx-swap="innerHTML"
      >
        <h2 class="card-title">${escapeHtml(messages.builder.editScene)}: ${escapeHtml(scene.id)}</h2>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneTitle)}</legend>
          <input
            id="scene-title-key"
            name="titleKey"
            type="text"
            class="input input-bordered w-full"
            value="${escapeHtml(scene.titleKey)}"
            required
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.assetPlaceholder)}</legend>
          <input
            id="scene-background"
            name="background"
            type="text"
            class="input input-bordered w-full"
            value="${escapeHtml(scene.background)}"
            required
          />
        </fieldset>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
            <label class="label" for="scene-width">${escapeHtml(messages.builder.widthLabel)}</label>
            <input
              id="scene-width"
              name="geometryWidth"
              type="number"
              class="input input-bordered w-full"
              value="${scene.geometry.width}"
              min="1"
              step="1"
              required
            />
            <label class="label" for="scene-height">${escapeHtml(messages.builder.heightLabel)}</label>
            <input
              id="scene-height"
              name="geometryHeight"
              type="number"
              class="input input-bordered w-full"
              value="${scene.geometry.height}"
              min="1"
              step="1"
              required
            />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.spawnPoint)}</legend>
            <label class="label" for="spawn-x">${escapeHtml(messages.builder.xLabel)}</label>
            <input
              id="spawn-x"
              name="spawnX"
              type="number"
              class="input input-bordered w-full"
              value="${scene.spawn.x}"
              step="1"
              required
            />
            <label class="label" for="spawn-y">${escapeHtml(messages.builder.yLabel)}</label>
            <input
              id="spawn-y"
              name="spawnY"
              type="number"
              class="input input-bordered w-full"
              value="${scene.spawn.y}"
              step="1"
              required
            />
          </fieldset>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
        </div>
      </form>
    </div>
    <div class="card bg-base-100 shadow-sm mt-4">
      <div class="card-body">
        <h3 class="card-title text-base">${escapeHtml(messages.builder.npcs)} (${scene.npcs.length})</h3>
        <div class="flex flex-wrap gap-2">${npcBadges}</div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-sm mt-4">
      <div class="card-body">
        <h3 class="card-title text-base">${escapeHtml(messages.builder.collisions)} (${scene.collisions.length})</h3>
        <div class="flex flex-wrap gap-2">${collisionBadges}</div>
      </div>
    </div>`;
};

/**
 * Scene Editor View
 *
 * Scene library and detail workspace with inline HTMX editing.
 */
import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { SceneDefinition, SceneNodeDefinition } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

const renderScenePreview = (scene: SceneDefinition, spawnLabel: string): string => {
  const npcMarkers = scene.npcs
    .map((npc) => {
      const labelY = Math.max(20, npc.y - 14);
      return `<g>
        <circle cx="${npc.x}" cy="${npc.y}" r="10" fill="oklch(var(--s))" fill-opacity="0.85"></circle>
        <circle cx="${npc.x}" cy="${npc.y}" r="20" fill="oklch(var(--s))" fill-opacity="0.12"></circle>
        <text x="${npc.x}" y="${labelY}" fill="oklch(var(--bc))" font-size="14" font-weight="600" text-anchor="middle">${escapeHtml(npc.characterKey)}</text>
      </g>`;
    })
    .join("");
  const collisions = scene.collisions
    .map((collision) => {
      return `<rect
        x="${collision.x}"
        y="${collision.y}"
        width="${collision.width}"
        height="${collision.height}"
        rx="8"
        fill="oklch(var(--wa))"
        fill-opacity="0.18"
        stroke="oklch(var(--wa))"
        stroke-opacity="0.75"
        stroke-width="3"
      ></rect>`;
    })
    .join("");

  return `<div class="relative overflow-hidden rounded-box border border-base-300 bg-base-200 aspect-video">
    <img src="${escapeHtml(scene.background)}" alt="${escapeHtml(scene.id)}" class="h-full w-full object-cover opacity-70" />
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 ${scene.geometry.width} ${scene.geometry.height}"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      ${collisions}
      ${npcMarkers}
      <g>
        <circle cx="${scene.spawn.x}" cy="${scene.spawn.y}" r="12" fill="oklch(var(--p))"></circle>
        <path
          d="M ${scene.spawn.x} ${scene.spawn.y - 20} L ${scene.spawn.x + 12} ${scene.spawn.y + 4} L ${scene.spawn.x - 12} ${scene.spawn.y + 4} Z"
          fill="oklch(var(--p))"
        ></path>
        <text
          x="${scene.spawn.x}"
          y="${Math.max(26, scene.spawn.y - 28)}"
          fill="oklch(var(--pc))"
          font-size="14"
          font-weight="700"
          text-anchor="middle"
        >${escapeHtml(spawnLabel)}</text>
      </g>
    </svg>
  </div>`;
};

const renderSceneModeBadge = (messages: Messages, sceneMode: SceneDefinition["sceneMode"]): string =>
  `<span class="badge badge-outline">${
    escapeHtml(sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d)
  }</span>`;

const renderNodeBadge = (node: SceneNodeDefinition): string =>
  `<span class="badge badge-ghost">${escapeHtml(node.nodeType)}</span>`;

const renderNodeForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  sceneId: string,
  node: SceneNodeDefinition,
): string => {
  const formAction = withQueryParameters(
    appRoutes.builderApiSceneNodes.replace(":sceneId", encodeURIComponent(sceneId)),
    { locale, projectId },
  );
  const deleteAction = withQueryParameters(
    `${appRoutes.builderApiSceneNodes.replace(":sceneId", encodeURIComponent(sceneId))}/${encodeURIComponent(node.id)}`,
    { locale, projectId },
  );

  const nodeSpinnerId = `scene-node-${node.id.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner`;
  if ("size" in node) {
    return `<article class="card card-border bg-base-100 shadow-sm">
      <form class="card-body gap-3" hx-post="${escapeHtml(formAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
        <input type="hidden" name="id" value="${escapeHtml(node.id)}" />
        <input type="hidden" name="nodeKind" value="2d" />
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="card-title text-base">${escapeHtml(node.id)}</h3>
            <p class="text-xs text-base-content/60">${escapeHtml(node.layer)}</p>
          </div>
          <div class="flex gap-2">${renderNodeBadge(node)}
            <button type="button" class="btn btn-ghost btn-xs" data-scene-node-select="${escapeHtml(node.id)}">${escapeHtml(messages.builder.preview)}</button>
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <input name="nodeType" type="text" class="input input-bordered w-full" value="${escapeHtml(node.nodeType)}" />
          <input name="layer" type="text" class="input input-bordered w-full" value="${escapeHtml(node.layer)}" />
          <input name="assetId" type="text" class="input input-bordered w-full" value="${escapeHtml(node.assetId ?? "")}" placeholder="asset id" />
          <input name="animationClipId" type="text" class="input input-bordered w-full" value="${escapeHtml(node.animationClipId ?? "")}" placeholder="clip id" />
          <input name="positionX" type="number" class="input input-bordered w-full" value="${node.position.x}" />
          <input name="positionY" type="number" class="input input-bordered w-full" value="${node.position.y}" />
          <input name="sizeWidth" type="number" class="input input-bordered w-full" value="${node.size.width}" min="1" />
          <input name="sizeHeight" type="number" class="input input-bordered w-full" value="${node.size.height}" min="1" />
        </div>
        <div class="card-actions justify-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
          <span id="${nodeSpinnerId}" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
        </div>
      </form>
      <div class="px-6 pb-6">
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button" class="flex justify-end">
          <button type="submit" class="btn btn-error btn-outline btn-sm">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
    </article>`;
  }

  return `<article class="card card-border bg-base-100 shadow-sm">
    <form class="card-body gap-3" hx-post="${escapeHtml(formAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button, input, select, textarea">
      <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
      <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
      <input type="hidden" name="id" value="${escapeHtml(node.id)}" />
      <input type="hidden" name="nodeKind" value="3d" />
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title text-base">${escapeHtml(node.id)}</h3>
        <div class="flex gap-2">${renderNodeBadge(node)}
          <button type="button" class="btn btn-ghost btn-xs" data-scene-node-select="${escapeHtml(node.id)}">${escapeHtml(messages.builder.preview)}</button>
        </div>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <input name="nodeType" type="text" class="input input-bordered w-full" value="${escapeHtml(node.nodeType)}" />
        <input name="assetId" type="text" class="input input-bordered w-full" value="${escapeHtml(node.assetId ?? "")}" placeholder="asset id" />
        <input name="animationClipId" type="text" class="input input-bordered w-full" value="${escapeHtml(node.animationClipId ?? "")}" placeholder="clip id" />
        <input name="positionX" type="number" class="input input-bordered w-full" value="${node.position.x}" step="0.1" />
        <input name="positionY" type="number" class="input input-bordered w-full" value="${node.position.y}" step="0.1" />
        <input name="positionZ" type="number" class="input input-bordered w-full" value="${node.position.z}" step="0.1" />
        <input name="rotationX" type="number" class="input input-bordered w-full" value="${node.rotation.x}" step="0.1" />
        <input name="rotationY" type="number" class="input input-bordered w-full" value="${node.rotation.y}" step="0.1" />
        <input name="rotationZ" type="number" class="input input-bordered w-full" value="${node.rotation.z}" step="0.1" />
        <input name="scaleX" type="number" class="input input-bordered w-full" value="${node.scale.x}" step="0.1" />
        <input name="scaleY" type="number" class="input input-bordered w-full" value="${node.scale.y}" step="0.1" />
        <input name="scaleZ" type="number" class="input input-bordered w-full" value="${node.scale.z}" step="0.1" />
      </div>
      <div class="card-actions justify-end gap-2">
        <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
        <span id="${nodeSpinnerId}" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
      </div>
    </form>
  </article>`;
};

/**
 * Renders the scene library workspace.
 *
 * @param messages Locale-resolved messages.
 * @param scenes Scene definitions keyed by ID.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for the scene editor panel.
 */
export const renderSceneEditor = (
  messages: Messages,
  scenes: Record<string, SceneDefinition>,
  locale: LocaleCode,
  projectId: string,
): string => {
  const sceneIds = Object.keys(scenes);
  const selectedSceneId = sceneIds[0] ?? null;
  const selectedScene = selectedSceneId ? scenes[selectedSceneId] ?? null : null;
  const sceneCards = sceneIds
    .map((id) => {
      const scene = scenes[id];
      if (!scene) {
        return "";
      }
      const detailHref = withQueryParameters(`${appRoutes.builderApiScenes}/${scene.id}`, {
        locale,
        projectId,
      });
      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="card-title text-lg">${escapeHtml(scene.id)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(scene.titleKey)}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              ${renderSceneModeBadge(messages, scene.sceneMode)}
              <span class="badge badge-outline">${scene.geometry.width}×${scene.geometry.height}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 text-sm">
            <span class="badge badge-soft">${scene.npcs.length} ${escapeHtml(messages.builder.npcs)}</span>
            <span class="badge badge-soft">${scene.collisions.length} ${escapeHtml(messages.builder.collisions)}</span>
            <span class="badge badge-soft">${scene.nodes?.length ?? 0} ${escapeHtml(messages.builder.sceneNodes)}</span>
          </div>
          <button
            class="btn btn-outline btn-sm"
            hx-get="${escapeHtml(detailHref)}"
            hx-target="#scene-detail"
            hx-swap="innerHTML"
            aria-label="${escapeHtml(messages.builder.editScene)}: ${escapeHtml(scene.id)}"
          >${escapeHtml(messages.builder.preview)}</button>
        </div>
      </article>`;
    })
    .join("");

  const createAction = `${appRoutes.builderApiScenes}/create/form`;

  return `
    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div class="space-y-4">
        <article class="card card-border bg-base-100 shadow-sm">
          <form
            class="card-body gap-4"
            hx-post="${escapeHtml(createAction)}"
            hx-target="#builder-content"
            hx-swap="innerHTML"
            hx-indicator="#scene-create-spinner"
            hx-disabled-elt="button, input, select, textarea"
          >
            <div class="space-y-1">
              <h1 class="card-title text-2xl">${escapeHtml(messages.builder.sceneLibraryTitle)}</h1>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.sceneCreateDescription)}</p>
            </div>
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneId)}</legend>
            <input name="id" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.sceneCreateTitlePlaceholder)}" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneTitle)}</legend>
              <input name="titleKey" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.sceneCreateTitlePlaceholder)}" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.assetPlaceholder)}</legend>
              <input name="background" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.sceneBackgroundPlaceholder)}" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
              <select name="sceneMode" class="select select-bordered w-full">
                <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
                <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
              </select>
            </fieldset>
            <input type="hidden" name="geometryWidth" value="640" />
            <input type="hidden" name="geometryHeight" value="360" />
            <input type="hidden" name="spawnX" value="320" />
            <input type="hidden" name="spawnY" value="180" />
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.addScene)}</button>
              <span id="scene-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
        </article>

        ${
          sceneCards.length > 0
            ? `<div class="grid gap-4">${sceneCards}</div>`
            : `<div role="alert" class="alert alert-warning alert-soft"><span>${escapeHtml(messages.builder.noScenes)}</span></div>`
        }
      </div>

      <div id="scene-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        ${
          selectedScene
            ? renderSceneDetail(messages, selectedScene, locale, projectId)
            : `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noScenes)}</span></div>`
        }
      </div>
    </section>`;
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
  const deleteAction = withQueryParameters(
    `${appRoutes.builderApiScenes}/${encodeURIComponent(scene.id)}`,
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
  const createNodeAction = withQueryParameters(
    appRoutes.builderApiSceneNodes.replace(":sceneId", encodeURIComponent(scene.id)),
    {
      locale,
      projectId,
    },
  );
  const nodeCards = (scene.nodes ?? [])
    .map((node) => renderNodeForm(messages, locale, projectId, scene.id, node))
    .join("");
  const scenePayload = escapeHtml(JSON.stringify({ scene }));

  return `
    <div class="card card-border bg-base-100 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 class="card-title text-2xl">${escapeHtml(messages.builder.editScene)}: ${escapeHtml(scene.id)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(scene.titleKey)}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            ${renderSceneModeBadge(messages, scene.sceneMode)}
            <span class="badge badge-soft">${scene.nodes?.length ?? 0} ${escapeHtml(messages.builder.sceneNodes)}</span>
            <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#scene-delete-spinner" hx-disabled-elt="button">
              <span class="flex items-center gap-2">
                <button type="submit" class="btn btn-error btn-outline btn-sm">${escapeHtml(messages.builder.delete)}</button>
                <span id="scene-delete-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
              </span>
            </form>
          </div>
        </div>

        ${renderScenePreview(scene, messages.builder.spawnPoint)}

        <section class="grid gap-4 xl:grid-cols-[0.28fr_0.44fr_0.28fr]">
          <article class="card card-border bg-base-100 shadow-sm">
            <div class="card-body gap-3">
              <h3 class="card-title text-base">${escapeHtml(messages.builder.assets)}</h3>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.assetPlaceholder)}</p>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-soft">sprite</span>
                <span class="badge badge-soft">trigger</span>
                <span class="badge badge-soft">camera</span>
                <span class="badge badge-soft">light</span>
                <span class="badge badge-soft">model</span>
              </div>
            </div>
          </article>
          <article class="card card-border bg-base-100 shadow-sm" data-scene-editor>
            <div class="card-body gap-3">
              <div class="flex items-center justify-between gap-3">
                <h3 class="card-title text-base">${escapeHtml(messages.builder.preview)}</h3>
                ${renderSceneModeBadge(messages, scene.sceneMode)}
              </div>
              <div class="aspect-video overflow-hidden rounded-box border border-base-300 bg-base-200" data-scene-viewport></div>
              <script type="application/json">${scenePayload}</script>
            </div>
          </article>
          <article class="card card-border bg-base-100 shadow-sm">
            <form class="card-body gap-3" hx-post="${escapeHtml(createNodeAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#scene-node-create-spinner" hx-disabled-elt="button, input, select, textarea">
              <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
              <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
              <h3 class="card-title text-base">${escapeHtml(messages.builder.sceneNodes)}</h3>
              <input name="id" type="text" class="input input-bordered w-full" placeholder="node.id" required />
              <input name="assetId" type="text" class="input input-bordered w-full" placeholder="asset id" />
              <input name="animationClipId" type="text" class="input input-bordered w-full" placeholder="clip id" />
              <input name="layer" type="text" class="input input-bordered w-full" placeholder="foreground" value="foreground" />
              <select name="nodeType" class="select select-bordered w-full">
                ${
                  scene.sceneMode === "3d"
                    ? `
                      <option value="model">model</option>
                      <option value="light">light</option>
                      <option value="camera">camera</option>
                      <option value="spawn">spawn</option>
                      <option value="trigger">trigger</option>`
                    : `
                      <option value="sprite">sprite</option>
                      <option value="tile">tile</option>
                      <option value="spawn">spawn</option>
                      <option value="trigger">trigger</option>
                      <option value="camera">camera</option>`
                }
              </select>
              <div class="grid gap-2 md:grid-cols-2">
                <input name="positionX" type="number" class="input input-bordered w-full" value="0" step="0.1" />
                <input name="positionY" type="number" class="input input-bordered w-full" value="0" step="0.1" />
                ${
                  scene.sceneMode === "3d"
                    ? `<input name="positionZ" type="number" class="input input-bordered w-full md:col-span-2" value="0" step="0.1" />`
                    : `<input name="sizeWidth" type="number" class="input input-bordered w-full" value="64" min="1" />
                      <input name="sizeHeight" type="number" class="input input-bordered w-full" value="64" min="1" />`
                }
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.addScene)}</button>
                <span id="scene-node-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
              </div>
            </form>
          </article>
        </section>

        <form
          class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"
          hx-post="${escapeHtml(formAction)}"
          hx-target="#scene-detail"
          hx-swap="innerHTML"
          hx-indicator="#scene-detail-spinner"
          hx-disabled-elt="button, input, select, textarea"
        >
          <div class="space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneTitle)}</legend>
              <input id="scene-title-key" name="titleKey" type="text" class="input input-bordered w-full" value="${escapeHtml(scene.titleKey)}" required />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.assetPlaceholder)}</legend>
              <input id="scene-background" name="background" type="text" class="input input-bordered w-full" value="${escapeHtml(scene.background)}" required />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
              <select id="scene-mode" name="sceneMode" class="select select-bordered w-full">
                <option value="2d"${scene.sceneMode !== "3d" ? " selected" : ""}>${escapeHtml(messages.builder.sceneMode2d)}</option>
                <option value="3d"${scene.sceneMode === "3d" ? " selected" : ""}>${escapeHtml(messages.builder.sceneMode3d)}</option>
              </select>
            </fieldset>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
              <label class="label" for="scene-width">${escapeHtml(messages.builder.widthLabel)}</label>
              <input id="scene-width" name="geometryWidth" type="number" class="input input-bordered w-full" value="${scene.geometry.width}" min="1" step="1" required />
              <label class="label" for="scene-height">${escapeHtml(messages.builder.heightLabel)}</label>
              <input id="scene-height" name="geometryHeight" type="number" class="input input-bordered w-full" value="${scene.geometry.height}" min="1" step="1" required />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.spawnPoint)}</legend>
              <label class="label" for="spawn-x">${escapeHtml(messages.builder.xLabel)}</label>
              <input id="spawn-x" name="spawnX" type="number" class="input input-bordered w-full" value="${scene.spawn.x}" step="1" required />
              <label class="label" for="spawn-y">${escapeHtml(messages.builder.yLabel)}</label>
              <input id="spawn-y" name="spawnY" type="number" class="input input-bordered w-full" value="${scene.spawn.y}" step="1" required />
            </fieldset>
          </div>

          <div class="lg:col-span-2 flex items-center justify-end gap-2">
            <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
            <span id="scene-detail-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </div>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card card-border bg-base-100 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-base">${escapeHtml(messages.builder.npcs)} (${scene.npcs.length})</h3>
          <div class="flex flex-wrap gap-2">${npcBadges || `<span class="text-sm text-base-content/60">${escapeHtml(messages.builder.noNpcs)}</span>`}</div>
        </div>
      </div>
      <div class="card card-border bg-base-100 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-base">${escapeHtml(messages.builder.collisions)} (${scene.collisions.length})</h3>
          <div class="flex flex-wrap gap-2">${collisionBadges || `<span class="text-sm text-base-content/60">0</span>`}</div>
        </div>
      </div>
      <div class="card card-border bg-base-100 shadow-sm lg:col-span-2">
        <div class="card-body gap-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(messages.builder.sceneNodes)} (${scene.nodes?.length ?? 0})</h3>
            <span class="badge badge-soft">${escapeHtml(scene.sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d)}</span>
          </div>
          <div class="grid gap-4 xl:grid-cols-2">${nodeCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.sceneNodes)}</span></div>`}</div>
          <div class="rounded-box border border-dashed border-base-300 bg-base-200/50 p-3 text-sm text-base-content/70">
            ${escapeHtml(messages.builder.preview)}
          </div>
        </div>
      </div>
    </div>`;
};

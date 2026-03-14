/**
 * Scene Editor View
 *
 * Scene library and detail workspace with inline HTMX editing.
 */
import type { LocaleCode } from "../../config/environment.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import {
  DEFAULT_SCENE_GEOMETRY_HEIGHT,
  DEFAULT_SCENE_GEOMETRY_WIDTH,
  DEFAULT_SCENE_NODE_SIZE,
  DEFAULT_SCENE_SPAWN_X,
  DEFAULT_SCENE_SPAWN_Y,
} from "../../shared/constants/builder-defaults.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  BuilderAsset,
  SceneDefinition,
  SceneNodeDefinition,
  TilemapLayer,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import {
  cardClasses,
  renderBuilderHiddenFields,
  renderEmptyStateCompact,
  spinnerClasses,
} from "../shared/ui-components.ts";
import { renderPlatformReadinessSection } from "./platform-readiness.ts";
import { getSceneNodeTypeLabel } from "./view-labels.ts";
import { renderWorkspaceShell } from "./workspace-shell.ts";

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

const renderSceneModeBadge = (
  messages: Messages,
  sceneMode: SceneDefinition["sceneMode"],
): string =>
  `<span class="badge badge-outline">${escapeHtml(
    sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d,
  )}</span>`;

const renderNodeBadge = (messages: Messages, node: SceneNodeDefinition): string =>
  `<span class="badge badge-ghost">${escapeHtml(getSceneNodeTypeLabel(messages, node.nodeType))}</span>`;

const renderSceneNodeTypeOptions = (
  messages: Messages,
  sceneMode: SceneDefinition["sceneMode"],
  selectedNodeType?: SceneNodeDefinition["nodeType"],
): string => {
  const options =
    sceneMode === "3d"
      ? [
          { value: "model", label: messages.builder.sceneNodeTypeModel },
          { value: "light", label: messages.builder.sceneNodeTypeLight },
          { value: "camera", label: messages.builder.sceneNodeTypeCamera },
          { value: "spawn", label: messages.builder.sceneNodeTypeSpawn },
          { value: "trigger", label: messages.builder.sceneNodeTypeTrigger },
        ]
      : [
          { value: "sprite", label: messages.builder.sceneNodeTypeSprite },
          { value: "tile", label: messages.builder.sceneNodeTypeTile },
          { value: "spawn", label: messages.builder.sceneNodeTypeSpawn },
          { value: "trigger", label: messages.builder.sceneNodeTypeTrigger },
          { value: "camera", label: messages.builder.sceneNodeTypeCamera },
        ];

  return options
    .map(
      (option) =>
        `<option value="${option.value}"${selectedNodeType === option.value ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
    )
    .join("");
};

const renderScenePaletteBadges = (
  messages: Messages,
  sceneMode: SceneDefinition["sceneMode"],
): string => {
  const paletteNodeTypes: readonly SceneNodeDefinition["nodeType"][] =
    sceneMode === "3d"
      ? ["model", "light", "camera", "spawn", "trigger"]
      : ["sprite", "tile", "camera", "spawn", "trigger"];

  return paletteNodeTypes
    .map(
      (nodeType) =>
        `<span class="badge badge-soft">${escapeHtml(getSceneNodeTypeLabel(messages, nodeType))}</span>`,
    )
    .join("");
};

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
    return `<article class="${cardClasses.bordered}">
      <form class="card-body gap-3" data-scene-node-form data-scene-node-id="${escapeHtml(node.id)}" data-scene-node-kind="2d" hx-post="${escapeHtml(formAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button, input, select, textarea">
        ${renderBuilderHiddenFields(projectId, locale)}
        <input type="hidden" name="id" value="${escapeHtml(node.id)}" />
        <input type="hidden" name="nodeKind" value="2d" />
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="card-title text-base">${escapeHtml(node.id)}</h3>
            <p class="text-xs text-base-content/60">${escapeHtml(node.layer)}</p>
          </div>
          <div class="flex gap-2">${renderNodeBadge(messages, node)}
            <button type="button" class="btn btn-ghost btn-xs" data-scene-node-select="${escapeHtml(node.id)}" aria-pressed="false" aria-label="${escapeHtml(messages.builder.selectNode)}: ${escapeHtml(node.id)}">${escapeHtml(messages.builder.selectNode)}</button>
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.nodeTypeLabel)}</legend>
            <select name="nodeType" class="select w-full" aria-label="${escapeHtml(messages.builder.nodeTypeLabel)}">${renderSceneNodeTypeOptions(messages, "2d", node.nodeType)}</select>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.layerLabel)}</legend>
            <input name="layer" type="text" class="input w-full" value="${escapeHtml(node.layer)}" aria-label="${escapeHtml(messages.builder.layerLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
            <input name="assetId" type="text" class="input w-full" value="${escapeHtml(node.assetId ?? "")}" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.animationClipIdFieldLabel)}</legend>
            <input name="animationClipId" type="text" class="input w-full" value="${escapeHtml(node.animationClipId ?? "")}" placeholder="${escapeHtml(messages.builder.clipIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.animationClipIdFieldLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.xLabel)}</legend>
            <input name="positionX" type="number" class="input w-full" value="${node.position.x}" aria-label="${escapeHtml(messages.builder.xLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.yLabel)}</legend>
            <input name="positionY" type="number" class="input w-full" value="${node.position.y}" aria-label="${escapeHtml(messages.builder.yLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.widthLabel)}</legend>
            <input name="sizeWidth" type="number" class="input w-full" value="${node.size.width}" min="1" aria-label="${escapeHtml(messages.builder.widthLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.heightLabel)}</legend>
            <input name="sizeHeight" type="number" class="input w-full" value="${node.size.height}" min="1" aria-label="${escapeHtml(messages.builder.heightLabel)}" />
          </fieldset>
        </div>
        <div class="card-actions justify-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}: ${escapeHtml(node.id)}">${escapeHtml(messages.builder.save)}</button>
          <span id="${nodeSpinnerId}" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
      <div class="px-6 pb-6">
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button" class="flex justify-end">
          <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(node.id)}">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
    </article>`;
  }

  return `<article class="${cardClasses.bordered}">
    <form class="card-body gap-3" data-scene-node-form data-scene-node-id="${escapeHtml(node.id)}" data-scene-node-kind="3d" hx-post="${escapeHtml(formAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#${nodeSpinnerId}" hx-disabled-elt="button, input, select, textarea">
      <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
      <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
      <input type="hidden" name="id" value="${escapeHtml(node.id)}" />
      <input type="hidden" name="nodeKind" value="3d" />
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title text-base">${escapeHtml(node.id)}</h3>
        <div class="flex gap-2">${renderNodeBadge(messages, node)}
            <button type="button" class="btn btn-ghost btn-xs" data-scene-node-select="${escapeHtml(node.id)}" aria-pressed="false" aria-label="${escapeHtml(messages.builder.selectNode)}: ${escapeHtml(node.id)}">${escapeHtml(messages.builder.selectNode)}</button>
        </div>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.nodeTypeLabel)}</legend>
          <select name="nodeType" class="select w-full" aria-label="${escapeHtml(messages.builder.nodeTypeLabel)}">${renderSceneNodeTypeOptions(messages, "3d", node.nodeType)}</select>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${node.nodeType === "model" ? escapeHtml(messages.builder.modelPathLabel) : escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
          <input name="assetId" type="text" class="input w-full" value="${escapeHtml(node.assetId ?? "")}" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.animationClipIdFieldLabel)}</legend>
          <input name="animationClipId" type="text" class="input w-full" value="${escapeHtml(node.animationClipId ?? "")}" placeholder="${escapeHtml(messages.builder.clipIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.animationClipIdFieldLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.xLabel)}</legend>
          <input name="positionX" type="number" class="input w-full" value="${node.position.x}" step="0.1" aria-label="${escapeHtml(messages.builder.xLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.yLabel)}</legend>
          <input name="positionY" type="number" class="input w-full" value="${node.position.y}" step="0.1" aria-label="${escapeHtml(messages.builder.yLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.zLabel)}</legend>
          <input name="positionZ" type="number" class="input w-full" value="${node.position.z}" step="0.1" aria-label="${escapeHtml(messages.builder.zLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.rotationXLabel)}</legend>
          <input name="rotationX" type="number" class="input w-full" value="${node.rotation.x}" step="0.1" aria-label="${escapeHtml(messages.builder.rotationXLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.rotationYLabel)}</legend>
          <input name="rotationY" type="number" class="input w-full" value="${node.rotation.y}" step="0.1" aria-label="${escapeHtml(messages.builder.rotationYLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.rotationZLabel)}</legend>
          <input name="rotationZ" type="number" class="input w-full" value="${node.rotation.z}" step="0.1" aria-label="${escapeHtml(messages.builder.rotationZLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.scaleXLabel)}</legend>
          <input name="scaleX" type="number" class="input w-full" value="${node.scale.x}" step="0.1" aria-label="${escapeHtml(messages.builder.scaleXLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.scaleYLabel)}</legend>
          <input name="scaleY" type="number" class="input w-full" value="${node.scale.y}" step="0.1" aria-label="${escapeHtml(messages.builder.scaleYLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.scaleZLabel)}</legend>
          <input name="scaleZ" type="number" class="input w-full" value="${node.scale.z}" step="0.1" aria-label="${escapeHtml(messages.builder.scaleZLabel)}" />
        </fieldset>
      </div>
      <div class="card-actions justify-end gap-2">
        <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}: ${escapeHtml(node.id)}">${escapeHtml(messages.builder.save)}</button>
        <span id="${nodeSpinnerId}" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
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
  readiness?: BuilderPlatformReadiness,
): string => {
  const sceneIds = Object.keys(scenes);
  const selectedSceneId = sceneIds[0] ?? null;
  const selectedScene = selectedSceneId ? (scenes[selectedSceneId] ?? null) : null;
  const sceneValues = Object.values(scenes);
  const scenes2d = sceneValues.filter((scene) => scene.sceneMode !== "3d").length;
  const scenes3d = sceneValues.filter((scene) => scene.sceneMode === "3d").length;
  const nodeCount = sceneValues.reduce((total, scene) => total + (scene.nodes?.length ?? 0), 0);
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
      return `<article class="${cardClasses.bordered}">
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
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`;
    })
    .join("");

  const createAction = `${appRoutes.builderApiScenes}/create/form`;

  return `
    <section class="space-y-6 animate-fade-in-up">
      ${renderWorkspaceShell({
        eyebrow: messages.builder.scenes,
        title: messages.builder.sceneLibraryTitle,
        description: messages.builder.sceneCreateDescription,
        facets: [
          {
            label: `${messages.builder.sceneMode2d}: ${[
              messages.builder.sceneNodeTypeSprite,
              messages.builder.sceneNodeTypeTile,
              messages.builder.sceneNodeTypeCamera,
              messages.builder.sceneNodeTypeSpawn,
              messages.builder.sceneNodeTypeTrigger,
            ].join(" / ")}`,
          },
          {
            label: `${messages.builder.sceneMode3d}: ${[
              messages.builder.sceneNodeTypeModel,
              messages.builder.sceneNodeTypeLight,
              messages.builder.sceneNodeTypeCamera,
              messages.builder.sceneNodeTypeSpawn,
              messages.builder.sceneNodeTypeTrigger,
            ].join(" / ")}`,
          },
        ],
        metrics: [
          {
            label: messages.builder.totalScenes,
            value: sceneValues.length,
            toneClassName: "text-primary",
          },
          { label: messages.builder.sceneMode2d, value: scenes2d },
          {
            label: messages.builder.sceneMode3d,
            value: scenes3d,
            toneClassName: scenes3d > 0 ? "text-secondary" : "text-base-content",
          },
          { label: messages.builder.sceneNodes, value: nodeCount },
        ],
      })}
      ${
        readiness
          ? renderPlatformReadinessSection({
              messages,
              locale,
              projectId,
              readiness,
              keys: ["runtime2d", "runtime3d", "mechanics"],
            })
          : ""
      }
      <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div class="space-y-4">
        <article class="${cardClasses.bordered}">
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
            ${renderBuilderHiddenFields(projectId, locale)}
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneId)}</legend>
            <input name="id" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.sceneIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.sceneId)}" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneTitle)}</legend>
              <input name="titleKey" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.sceneCreateTitlePlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.sceneTitle)}" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneBackgroundLabel)}</legend>
              <input name="background" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.sceneBackgroundPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.sceneBackgroundLabel)}" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
              <select name="sceneMode" class="select w-full" aria-label="${escapeHtml(messages.builder.sceneModeLabel)}">
                <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
                <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
              </select>
            </fieldset>
            <input type="hidden" name="geometryWidth" value="${DEFAULT_SCENE_GEOMETRY_WIDTH}" />
            <input type="hidden" name="geometryHeight" value="${DEFAULT_SCENE_GEOMETRY_HEIGHT}" />
            <input type="hidden" name="spawnX" value="${DEFAULT_SCENE_SPAWN_X}" />
            <input type="hidden" name="spawnY" value="${DEFAULT_SCENE_SPAWN_Y}" />
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addScene)}">${escapeHtml(messages.builder.addScene)}</button>
              <span id="scene-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>
          </form>
        </article>

        ${
          sceneCards.length > 0
            ? `<div class="grid gap-4">${sceneCards}</div>`
            : renderEmptyStateCompact(
                messages.builder.noScenes,
                messages.builder.sceneCreateDescription,
              )
        }
      </div>

      <div id="scene-detail" class="space-y-4" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
        ${
          selectedScene
            ? renderSceneDetail(messages, selectedScene, locale, projectId)
            : renderEmptyStateCompact(
                messages.builder.noScenes,
                messages.builder.sceneCreateDescription,
              )
        }
      </div>
    </section>
    </section>`;
};

/**
 * Renders a scene detail form that persists via HTMX.
 *
 * @param messages Locale-resolved messages.
 * @param scene Scene to edit.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @param assets Optional project assets for tileset palette resolution.
 * @returns HTML string for the editable scene detail panel.
 */
export const renderSceneDetail = (
  messages: Messages,
  scene: SceneDefinition,
  locale: LocaleCode,
  projectId: string,
  assets: readonly BuilderAsset[] = [],
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
  const emptyNodesAlert = renderEmptyStateCompact(
    messages.builder.noSceneNodes,
    messages.builder.selectNode,
  );
  const scenePayload = escapeHtml(JSON.stringify({ scene }));

  return `
    <div class="${cardClasses.bordered}">
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
              <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(scene.id)}">${escapeHtml(messages.builder.delete)}</button>
                <span id="scene-delete-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
              </span>
            </form>
          </div>
        </div>

        <section class="space-y-2">
          <h3 class="card-title text-base">${escapeHtml(messages.builder.scenePreviewTitle)}</h3>
          ${renderScenePreview(scene, messages.builder.spawnPoint)}
        </section>

        <section class="grid gap-4 xl:grid-cols-[0.28fr_0.44fr_0.28fr]">
          <article class="${cardClasses.bordered}">
            <div class="card-body gap-3">
              <h3 class="card-title text-base">${escapeHtml(messages.builder.assets)}</h3>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.assetPlaceholder)}</p>
              <div class="flex flex-wrap gap-2">
                ${renderScenePaletteBadges(messages, scene.sceneMode)}
              </div>
            </div>
          </article>
          <article class="${cardClasses.bordered}" data-scene-editor data-scene-id="${escapeHtml(scene.id)}" data-scene-mode="${escapeHtml(scene.sceneMode ?? "2d")}">
            <div class="card-body gap-3">
              <div class="builder-toolbar flex items-center justify-between gap-2 flex-wrap">
                <h3 class="card-title text-base font-semibold">${escapeHtml(messages.builder.runtimePreviewTitle)}</h3>
                <div class="flex items-center gap-1" role="toolbar" aria-label="${escapeHtml(messages.builder.runtimePreviewTitle)}">
                  ${
                    scene.sceneMode === "3d"
                      ? `<button type="button" class="btn btn-square btn-xs btn-ghost join-item btn-active" data-scene-transform-mode="translate" aria-pressed="true" aria-label="${escapeHtml(messages.builder.transformModeTranslate)}" title="${escapeHtml(messages.builder.transformModeTranslate)}">
                           <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                         </button>
                         <button type="button" class="btn btn-square btn-xs btn-ghost join-item" data-scene-transform-mode="rotate" aria-pressed="false" aria-label="${escapeHtml(messages.builder.transformModeRotate)}" title="${escapeHtml(messages.builder.transformModeRotate)}">
                           <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                         </button>
                         <button type="button" class="btn btn-square btn-xs btn-ghost join-item" data-scene-transform-mode="scale" aria-pressed="false" aria-label="${escapeHtml(messages.builder.transformModeScale)}" title="${escapeHtml(messages.builder.transformModeScale)}">
                           <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                         </button>`
                      : `<button type="button" class="btn btn-square btn-xs btn-ghost" data-scene-transform-mode="translate" aria-pressed="true" aria-label="${escapeHtml(messages.builder.selectNode)}" title="${escapeHtml(messages.builder.selectNode)}">
                           <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                         </button>`
                  }
                  ${renderSceneModeBadge(messages, scene.sceneMode)}
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                <span class="font-medium">${escapeHtml(messages.builder.selectedNodeLabel)}:</span>
                <span class="badge badge-outline" data-scene-selected-node data-empty-label="${escapeHtml(messages.builder.noNodeSelected)}">${escapeHtml(messages.builder.noNodeSelected)}</span>
              </div>
              <div class="aspect-video overflow-hidden rounded-box border border-base-300 bg-base-200" data-scene-viewport aria-label="${escapeHtml(messages.builder.runtimePreviewTitle)}"></div>
              <script type="application/json">${scenePayload}</script>
            </div>
          </article>
          <article class="${cardClasses.bordered}">
            <form class="card-body gap-3" hx-post="${escapeHtml(createNodeAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#scene-node-create-spinner" hx-disabled-elt="button, input, select, textarea">
              ${renderBuilderHiddenFields(projectId, locale)}
              <h3 class="card-title text-base">${escapeHtml(messages.builder.sceneNodes)}</h3>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.nodeIdLabel)}</legend>
                <input name="id" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.nodeIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.nodeIdLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
                <input name="assetId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.animationClipIdFieldLabel)}</legend>
                <input name="animationClipId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.clipIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.animationClipIdFieldLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.layerLabel)}</legend>
                <input name="layer" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.layerPlaceholder)}" aria-label="${escapeHtml(messages.builder.layerLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.nodeTypeLabel)}</legend>
                <select name="nodeType" class="select w-full" aria-label="${escapeHtml(messages.builder.nodeTypeLabel)}">${renderSceneNodeTypeOptions(messages, scene.sceneMode)}</select>
              </fieldset>
              <div class="grid gap-2 md:grid-cols-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.xLabel)}</legend>
                  <input name="positionX" type="number" class="input w-full" value="0" step="0.1" aria-label="${escapeHtml(messages.builder.xLabel)}" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.yLabel)}</legend>
                  <input name="positionY" type="number" class="input w-full" value="0" step="0.1" aria-label="${escapeHtml(messages.builder.yLabel)}" />
                </fieldset>
                ${
                  scene.sceneMode === "3d"
                    ? `<fieldset class="fieldset md:col-span-2">
                         <legend class="fieldset-legend">${escapeHtml(messages.builder.zLabel)}</legend>
                         <input name="positionZ" type="number" class="input w-full" value="0" step="0.1" aria-label="${escapeHtml(messages.builder.zLabel)}" />
                       </fieldset>`
                    : `<fieldset class="fieldset">
                         <legend class="fieldset-legend">${escapeHtml(messages.builder.widthLabel)}</legend>
                         <input name="sizeWidth" type="number" class="input w-full" value="${DEFAULT_SCENE_NODE_SIZE}" min="1" aria-label="${escapeHtml(messages.builder.widthLabel)}" />
                       </fieldset>
                       <fieldset class="fieldset">
                         <legend class="fieldset-legend">${escapeHtml(messages.builder.heightLabel)}</legend>
                         <input name="sizeHeight" type="number" class="input w-full" value="${DEFAULT_SCENE_NODE_SIZE}" min="1" aria-label="${escapeHtml(messages.builder.heightLabel)}" />
                       </fieldset>`
                }
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.createSceneNode)}">${escapeHtml(messages.builder.createSceneNode)}</button>
                <span id="scene-node-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
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
              <input id="scene-title-key" name="titleKey" type="text" class="input w-full" value="${escapeHtml(scene.titleKey)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.sceneTitle)}" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneBackgroundLabel)}</legend>
              <input id="scene-background" name="background" type="text" class="input w-full" value="${escapeHtml(scene.background)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.sceneBackgroundLabel)}" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
              <select id="scene-mode" name="sceneMode" class="select w-full" aria-label="${escapeHtml(messages.builder.sceneModeLabel)}">
                <option value="2d"${scene.sceneMode !== "3d" ? " selected" : ""}>${escapeHtml(messages.builder.sceneMode2d)}</option>
                <option value="3d"${scene.sceneMode === "3d" ? " selected" : ""}>${escapeHtml(messages.builder.sceneMode3d)}</option>
              </select>
            </fieldset>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.geometry)}</legend>
              <label class="label" for="scene-width">${escapeHtml(messages.builder.widthLabel)}</label>
              <input id="scene-width" name="geometryWidth" type="number" class="input w-full" value="${scene.geometry.width}" min="1" step="1" aria-required="true" required aria-label="${escapeHtml(messages.builder.widthLabel)}" />
              <label class="label" for="scene-height">${escapeHtml(messages.builder.heightLabel)}</label>
              <input id="scene-height" name="geometryHeight" type="number" class="input w-full" value="${scene.geometry.height}" min="1" step="1" aria-required="true" required aria-label="${escapeHtml(messages.builder.heightLabel)}" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.spawnPoint)}</legend>
              <label class="label" for="spawn-x">${escapeHtml(messages.builder.xLabel)}</label>
              <input id="spawn-x" name="spawnX" type="number" class="input w-full" value="${scene.spawn.x}" step="1" aria-required="true" required aria-label="${escapeHtml(messages.builder.xLabel)}" />
              <label class="label" for="spawn-y">${escapeHtml(messages.builder.yLabel)}</label>
              <input id="spawn-y" name="spawnY" type="number" class="input w-full" value="${scene.spawn.y}" step="1" aria-required="true" required aria-label="${escapeHtml(messages.builder.yLabel)}" />
            </fieldset>
          </div>

          <div class="lg:col-span-2 flex items-center justify-end gap-2">
            <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}: ${escapeHtml(scene.id)}">${escapeHtml(messages.builder.save)}</button>
            <span id="scene-detail-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
      </div>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="${cardClasses.bordered}">
        <div class="card-body">
          <h3 class="card-title text-base">${escapeHtml(messages.builder.npcs)} (${scene.npcs.length})</h3>
          <div class="flex flex-wrap gap-2">${npcBadges || `<span class="text-sm text-base-content/60">${escapeHtml(messages.builder.noNpcs)}</span>`}</div>
        </div>
      </div>
      <div class="${cardClasses.bordered}">
        <div class="card-body">
          <h3 class="card-title text-base">${escapeHtml(messages.builder.collisions)} (${scene.collisions.length})</h3>
          <div class="flex flex-wrap gap-2">${collisionBadges || `<span class="text-sm text-base-content/60">${escapeHtml(messages.builder.noCollisions)}</span>`}</div>
        </div>
      </div>
      <div class="${cardClasses.bordered} lg:col-span-2">
        <div class="card-body gap-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(messages.builder.sceneNodes)} (${scene.nodes?.length ?? 0})</h3>
            <span class="badge badge-soft">${escapeHtml(scene.sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d)}</span>
          </div>
          ${
            scene.sceneMode !== "3d"
              ? `<div class="tabs tabs-boxed" role="tablist">
                   <button type="button" class="tab tab-active" role="tab" aria-selected="true" data-scene-tab="nodes">${escapeHtml(messages.builder.sceneNodes)}</button>
                   <button type="button" class="tab" role="tab" aria-selected="false" data-scene-tab="tilemap">${escapeHtml(messages.builder.tilemapTabLabel)}</button>
                 </div>`
              : ""
          }
          <div data-scene-tab-panel="nodes" class="space-y-4">
            <div class="grid gap-4 xl:grid-cols-2">${(scene.nodes ?? []).length === 0 ? emptyNodesAlert : nodeCards}</div>
            <div class="rounded-box border border-dashed border-base-300 bg-base-200/50 p-3 text-sm text-base-content/70">
              ${escapeHtml(messages.builder.selectNode)}
            </div>
          </div>
          ${
            scene.sceneMode !== "3d"
              ? (
                  () => {
                    const defaultLayer: TilemapLayer = {
                      id: "default",
                      tileSetAssetId: "",
                      tileWidth: 32,
                      tileHeight: 32,
                      data: Array.from({ length: 8 }, () => Array.from({ length: 12 }, () => -1)),
                      collision: false,
                      layer: "ground",
                    };
                    const existingLayer = scene.tilemap?.layers?.[0];
                    const gridCols = 12;
                    const gridRows = 8;
                    const normalizedData = existingLayer?.data
                      ? Array.from({ length: gridRows }, (_, r) =>
                          Array.from(
                            { length: gridCols },
                            (_, c) => (existingLayer.data[r]?.[c] ?? -1) as number,
                          ),
                        )
                      : defaultLayer.data;
                    const layer: TilemapLayer = existingLayer
                      ? {
                          id: existingLayer.id,
                          tileSetAssetId: existingLayer.tileSetAssetId,
                          tileWidth: existingLayer.tileWidth,
                          tileHeight: existingLayer.tileHeight,
                          data: normalizedData,
                          collision: existingLayer.collision,
                          layer: existingLayer.layer,
                        }
                      : defaultLayer;
                    const assetsPayload = escapeHtml(
                      JSON.stringify(assets.map((a) => ({ id: a.id, source: a.source }))),
                    );
                    const layerPayload = escapeHtml(JSON.stringify(layer));
                    const gridCells = Array.from({ length: gridRows * gridCols }, (_, i) => {
                      const row = Math.floor(i / gridCols);
                      const col = i % gridCols;
                      const tileValue = layer.data[row]?.[col] ?? -1;
                      const bgClass = tileValue >= 0 ? "bg-primary/30" : "bg-base-300/30";
                      return `<div class="${bgClass} rounded-sm min-h-4 cursor-crosshair select-none" data-tile-row="${row}" data-tile-col="${col}" data-tile-value="${tileValue}" role="button" tabindex="0" aria-label="Tile ${row},${col}"></div>`;
                    }).join("");
                    return `<div data-scene-tab-panel="tilemap" class="hidden space-y-4" data-tilemap-assets="${assetsPayload}" data-tilemap-layer="${layerPayload}" data-tilemap-cols="${gridCols}" data-tilemap-rows="${gridRows}" data-tilemap-form-action="${escapeHtml(formAction)}">
                   <div class="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Tilemap tools">
                     <button type="button" class="badge badge-soft badge-lg cursor-pointer hover:badge-primary" data-tilemap-mode="brush" aria-pressed="true" aria-label="${escapeHtml(messages.builder.tilemapBrushLabel)}">${escapeHtml(messages.builder.tilemapBrushLabel)}</button>
                     <button type="button" class="badge badge-soft badge-lg cursor-pointer hover:badge-primary" data-tilemap-mode="fill" aria-pressed="false" aria-label="${escapeHtml(messages.builder.tilemapFillLabel)}">${escapeHtml(messages.builder.tilemapFillLabel)}</button>
                   </div>
                   <fieldset class="fieldset">
                     <legend class="fieldset-legend">${escapeHtml(messages.builder.tilemapTileSetLabel)}</legend>
                     <input type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.tilemapTileSetLabel)}" data-tilemap-tileset value="${escapeHtml(layer.tileSetAssetId)}" />
                   </fieldset>
                   <div class="rounded-box border border-base-300 bg-base-200/50 p-2" data-tilemap-palette-container>
                     <p class="text-xs text-base-content/60 mb-2">${escapeHtml(messages.builder.tilemapTileSetLabel)} palette</p>
                     <div class="flex flex-wrap gap-1 min-h-12 max-h-24 overflow-auto" data-tilemap-palette aria-label="Tile palette"></div>
                   </div>
                   <div class="aspect-video overflow-hidden rounded-box border border-base-300 bg-base-200/50 grid grid-cols-12 grid-rows-8 gap-px p-2 min-h-32" data-tilemap-grid aria-label="${escapeHtml(messages.builder.tilemapTabLabel)}">
                     ${gridCells}
                   </div>
                   <form class="hidden" data-tilemap-persist-form hx-post="${escapeHtml(formAction)}" hx-target="#scene-detail" hx-swap="innerHTML" hx-indicator="#scene-detail-spinner" hx-disabled-elt="button, input">
                     ${renderBuilderHiddenFields(projectId, locale)}
                     <input type="hidden" name="tilemap" data-tilemap-json value="" />
                   </form>
                   <p class="text-sm text-base-content/60">${escapeHtml(messages.builder.tilemapTileSetLabel)}: ${escapeHtml(messages.builder.assetIdPlaceholder)}. Brush: drag to paint. Fill: click to flood-fill.</p>
                 </div>`;
                  }
                )()
              : ""
          }
        </div>
      </div>
    </div>
    `;
};

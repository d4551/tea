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
 * Renders the NPC detail card for a single NPC.
 *
 * @param messages Locale-resolved messages.
 * @param npc NPC definition to render.
 * @returns HTML string for NPC detail card.
 */
export const renderNpcDetail = (messages: Messages, npc: SceneNpcDefinition): string => `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.editNpc)}: ${escapeHtml(npc.characterKey)}</h2>
      <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <dt class="text-sm font-semibold text-base-content/70">${escapeHtml(messages.builder.npcPosition)}</dt>
          <dd>${npc.x}, ${npc.y}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-base-content/70">${escapeHtml(messages.builder.wanderRadius)}</dt>
          <dd>${npc.ai.wanderRadius} px</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-base-content/70">${escapeHtml(messages.builder.wanderSpeed)}</dt>
          <dd>${npc.ai.wanderSpeed.toFixed(2)}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-base-content/70">${escapeHtml(messages.builder.dialogue)}</dt>
          <dd>${npc.dialogueKeys.map((key) => escapeHtml(key)).join(", ")}</dd>
        </div>
      </dl>
    </div>
  </div>`;

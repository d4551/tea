/**
 * HTMX Game HUD Extension
 *
 * Transforms JSON GameSceneState payloads from SSE into DOM-ready HTML fragments
 * for the game HUD slots: xp badge, dialogue panel, and scene title.
 *
 * Element contract: the receiving element must have `data-hud-slot` matching one
 * of "hud-xp", "hud-dialogue", or "hud-scene". Data attributes on the element
 * control localised label text.
 */

import { safeJsonParse } from "../shared/utils/safe-json.ts";
import { escapeHtml, getHtmx } from "./shared.ts";

interface HudProgress {
  readonly xp?: number;
  readonly level?: number;
}

interface HudDialogue {
  readonly npcLabel?: string;
  readonly line?: string;
}

interface HudPayload {
  readonly sceneId?: unknown;
  readonly progress?: HudProgress;
  readonly dialogue?: HudDialogue;
}

const htmx = getHtmx();
if (htmx) {
  htmx.defineExtension("game-hud", {
    transformResponse(text: string, _xhr: XMLHttpRequest, element: HTMLElement): string {
      const json = safeJsonParse<HudPayload | null>(text, null);
      if (!json) return text;

      const slot = element.dataset.hudSlot ?? element.id;
      const xpLabel = escapeHtml(element.dataset.xpLabel ?? "");
      const levelLabel = escapeHtml(element.dataset.levelLabel ?? "");

      if (slot === "hud-xp") {
        const xp = json.progress?.xp ?? 0;
        const level = json.progress?.level ?? 1;
        return `<span class="badge badge-primary badge-lg shadow-sm">${xpLabel}: ${xp} · ${levelLabel}${level}</span>`;
      }

      if (slot === "hud-dialogue") {
        const d = json.dialogue;
        if (!d?.line) return '<div id="hud-dialogue" class="hidden"></div>';
        return `<div id="hud-dialogue" class="card bg-base-200 shadow-md p-3 text-sm">
  <p class="font-semibold text-primary mb-1">${escapeHtml(d.npcLabel ?? "")}</p>
  <p>${escapeHtml(d.line)}</p>
</div>`;
      }

      if (slot === "hud-scene") {
        return `<span class="text-xl font-bold tracking-wide">${escapeHtml(String(json.sceneId ?? ""))}</span>`;
      }

      return text;
    },
  });
}

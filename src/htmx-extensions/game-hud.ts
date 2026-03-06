import { safeJsonParse } from "../shared/utils/safe-json.ts";
import { escapeHtml, getHtmx } from "./shared.ts";

const htmx = getHtmx();

if (htmx) {
  htmx.defineExtension("game-hud", {
    transformResponse(text, _xhr, element) {
      const payload = safeJsonParse<Record<string, unknown> | null>(text, null);

      if (!payload) {
        return text;
      }

      const slot = element.dataset.hudSlot ?? element.id;
      if (slot === "hud-xp") {
        const progress = payload.progress as { xp?: number; level?: number } | undefined;
        const xp = progress?.xp ?? 0;
        const level = progress?.level ?? 1;
        const xpLabel = escapeHtml(element.dataset.xpLabel ?? "XP");
        const levelLabel = escapeHtml(element.dataset.levelLabel ?? "Lv");
        return `<span class="badge badge-primary badge-lg shadow-sm">${xpLabel}: ${xp} · ${levelLabel}${level}</span>`;
      }

      if (slot === "hud-dialogue") {
        const dialogue = payload.dialogue as { npcLabel?: string; line?: string } | undefined;
        if (!dialogue?.line) {
          return `<div id="hud-dialogue" class="hidden"></div>`;
        }

        return `<div id="hud-dialogue" class="card bg-base-200 shadow-md p-3 text-sm">
  <p class="font-semibold text-primary mb-1">${escapeHtml(dialogue.npcLabel ?? "")}</p>
  <p>${escapeHtml(dialogue.line)}</p>
</div>`;
      }

      if (slot === "hud-scene") {
        return `<span class="text-xl font-bold tracking-wide">${escapeHtml(
          String(payload.sceneId ?? ""),
        )}</span>`;
      }

      return text;
    },
  });
}

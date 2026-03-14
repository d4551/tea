/**
 * Scene editor tab switching and tilemap paint tooling.
 *
 * Handles:
 * - Tab toggling between "nodes" and "tilemap" panels
 * - Tilemap brush/fill paint modes with debounced HTMX persistence
 * - Tileset palette rendering from sprite sheet images
 *
 * Bootstraps on DOMContentLoaded and re-runs after htmx:afterSwap for partial updates.
 */
import { acceptUnknown, safeJsonParse } from "../shared/utils/safe-json.ts";

interface TilemapLayer {
  readonly id: string;
  tileSetAssetId: string;
  readonly tileWidth: number;
  readonly tileHeight: number;
  data: number[][];
  readonly collision: boolean;
  readonly layer: string;
}

interface TilemapAsset {
  readonly id: string;
  readonly source: string;
}

declare global {
  interface Window {
    htmx?: {
      readonly ajax: (method: string, url: string, options: Record<string, unknown>) => void;
    };
  }
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const parseTilemapAssets = (raw: string): TilemapAsset[] => {
  const parsed = safeJsonParse(raw, [] as unknown[], isArray);
  return parsed.filter(
    (item): item is TilemapAsset =>
      item !== null &&
      typeof item === "object" &&
      typeof (item as TilemapAsset).id === "string" &&
      typeof (item as TilemapAsset).source === "string",
  );
};

const parseTilemapLayer = (raw: string): TilemapLayer => {
  const fallback: TilemapLayer = {
    id: "default",
    tileSetAssetId: "",
    tileWidth: 32,
    tileHeight: 32,
    data: [],
    collision: false,
    layer: "ground",
  };
  const parsed = safeJsonParse(raw, fallback as unknown, acceptUnknown);

  if (parsed !== null && typeof parsed === "object" && "tileWidth" in (parsed as object)) {
    return parsed as TilemapLayer;
  }

  return fallback;
};

const wireTabSwitching = (detail: HTMLElement): void => {
  detail.addEventListener("click", (event) => {
    const tab = (event.target as Element | null)?.closest?.("[data-scene-tab]");
    if (!tab || tab.getAttribute("role") !== "tab") {
      return;
    }

    const tabId = tab.getAttribute("data-scene-tab");
    const parent = tab.closest(".card-body");
    if (!parent) {
      return;
    }

    for (const tabElement of parent.querySelectorAll("[data-scene-tab]")) {
      const isActive = tabElement.getAttribute("data-scene-tab") === tabId;
      tabElement.classList.toggle("tab-active", isActive);
      tabElement.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    for (const panelElement of parent.querySelectorAll("[data-scene-tab-panel]")) {
      panelElement.classList.toggle(
        "hidden",
        panelElement.getAttribute("data-scene-tab-panel") !== tabId,
      );
    }
  });
};

const wireTilemapEditor = (panel: HTMLElement): void => {
  const assets = parseTilemapAssets(panel.getAttribute("data-tilemap-assets") ?? "[]");
  const layer = parseTilemapLayer(panel.getAttribute("data-tilemap-layer") ?? "{}");
  const cols = parseInt(panel.getAttribute("data-tilemap-cols") ?? "12", 10);
  const rows = parseInt(panel.getAttribute("data-tilemap-rows") ?? "8", 10);

  if (!layer.data || layer.data.length === 0) {
    layer.data = Array.from({ length: rows }, () => Array.from({ length: cols }, () => -1));
  }

  let mode = "brush";
  let selectedTile = 0;
  let isDrawing = false;
  const persistForm = panel.querySelector<HTMLFormElement>("[data-tilemap-persist-form]");
  const persistInput = panel.querySelector<HTMLInputElement>("[data-tilemap-json]");
  let debounceTimer = 0;

  const getAssetSource = (id: string): string => {
    for (const asset of assets) {
      if (asset.id === id) {
        return asset.source;
      }
    }
    return id && (id.startsWith("/") || id.startsWith("http")) ? id : "";
  };

  const renderPalette = (source: string, tileWidth: number, tileHeight: number): void => {
    const palette = panel.querySelector<HTMLElement>("[data-tilemap-palette]");
    if (!palette) {
      return;
    }
    palette.innerHTML = "";

    if (!source) {
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = (): void => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const tileCols = Math.max(1, Math.floor(w / (tileWidth || 32)));
      const tileRows = Math.max(1, Math.floor(h / (tileHeight || 32)));
      const count = tileCols * tileRows;

      for (let i = 0; i < count; i++) {
        const tc = i % tileCols;
        const tr = Math.floor(i / tileCols);
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "btn btn-sm btn-ghost p-0.5 border border-base-300 rounded overflow-hidden";
        button.setAttribute("data-tile-index", String(i));
        button.style.width = "28px";
        button.style.height = "28px";
        button.style.backgroundImage = `url(${source})`;
        button.style.backgroundPosition = `${-tc * (tileWidth || 32)}px ${-tr * (tileHeight || 32)}px`;
        button.style.backgroundSize = `${w}px ${h}px`;
        button.addEventListener("click", () => {
          selectedTile = parseInt(button.getAttribute("data-tile-index") ?? "0", 10);
        });
        palette.appendChild(button);
      }
    };
    img.onerror = (): void => {};
    img.src = source;
  };

  const persistTilemap = (): void => {
    if (!persistForm || !persistInput) {
      return;
    }

    const tilemap = {
      layers: [
        {
          id: "default",
          tileSetAssetId: layer.tileSetAssetId,
          tileWidth: layer.tileWidth,
          tileHeight: layer.tileHeight,
          data: layer.data.map((r) => r.slice()),
          collision: false,
          layer: "background",
        },
      ],
    };

    persistInput.value = JSON.stringify(tilemap);

    if (window.htmx) {
      const action = persistForm.getAttribute("hx-post") ?? "";
      const projectIdInput = persistForm.querySelector<HTMLInputElement>("[name=projectId]");
      const localeInput = persistForm.querySelector<HTMLInputElement>("[name=locale]");
      window.htmx.ajax("POST", action, {
        target: "#scene-detail",
        swap: "innerHTML",
        values: {
          projectId: projectIdInput?.value ?? "",
          locale: localeInput?.value ?? "",
          tilemap: persistInput.value,
        },
      });
    } else {
      persistForm.requestSubmit();
    }
  };

  const schedulePersist = (): void => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(persistTilemap, 400);
  };

  const setTile = (r: number, c: number, v: number): void => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
      return;
    }

    const targetRow = layer.data[r];
    if (!targetRow) {
      return;
    }
    targetRow[c] = v;
    const cell = panel.querySelector<HTMLElement>(`[data-tile-row="${r}"][data-tile-col="${c}"]`);
    if (cell) {
      cell.setAttribute("data-tile-value", String(v));
      cell.classList.toggle("bg-primary/30", v >= 0);
      cell.classList.toggle("bg-base-300/30", v < 0);
    }
    schedulePersist();
  };

  const floodFill = (startR: number, startC: number, replaceWith: number): void => {
    const targetRow = layer.data[startR];
    if (!targetRow) {
      return;
    }
    const target = targetRow[startC] ?? -1;
    if (target === replaceWith) {
      return;
    }

    const stack: [number, number][] = [[startR, startC]];
    const visited = new Set<string>();
    let count = 0;

    while (stack.length > 0 && count < 500) {
      const point = stack.pop();
      if (!point) {
        break;
      }

      const [r, c] = point;
      const key = `${r},${c}`;
      const row = layer.data[r];

      if (
        r < 0 ||
        r >= rows ||
        c < 0 ||
        c >= cols ||
        visited.has(key) ||
        !row ||
        row[c] !== target
      ) {
        continue;
      }

      visited.add(key);
      setTile(r, c, replaceWith);
      count++;
      stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
    }
  };

  const tilesetInput = panel.querySelector<HTMLInputElement>("[data-tilemap-tileset]");
  if (tilesetInput) {
    tilesetInput.addEventListener("change", () => {
      layer.tileSetAssetId = tilesetInput.value.trim();
      const source = getAssetSource(layer.tileSetAssetId);
      if (source) {
        renderPalette(source, layer.tileWidth, layer.tileHeight);
      }
    });
  }

  if (layer.tileSetAssetId) {
    const source = getAssetSource(layer.tileSetAssetId);
    if (source) {
      renderPalette(source, layer.tileWidth, layer.tileHeight);
    }
  }

  for (const button of panel.querySelectorAll<HTMLElement>("[data-tilemap-mode]")) {
    button.addEventListener("click", () => {
      mode = button.getAttribute("data-tilemap-mode") ?? "brush";
      for (const b of panel.querySelectorAll<HTMLElement>("[data-tilemap-mode]")) {
        b.setAttribute("aria-pressed", b === button ? "true" : "false");
      }
    });
  }

  const grid = panel.querySelector<HTMLElement>("[data-tilemap-grid]");
  if (grid) {
    grid.addEventListener("mousedown", (event) => {
      const cell = (event.target as Element)?.closest<HTMLElement>(
        "[data-tile-row][data-tile-col]",
      );
      if (!cell) {
        return;
      }

      event.preventDefault();
      const r = parseInt(cell.getAttribute("data-tile-row") ?? "0", 10);
      const c = parseInt(cell.getAttribute("data-tile-col") ?? "0", 10);

      if (mode === "fill") {
        floodFill(r, c, selectedTile);
      } else {
        isDrawing = true;
        setTile(r, c, selectedTile);
      }
    });

    grid.addEventListener("mousemove", (event) => {
      if (!isDrawing || mode !== "brush") {
        return;
      }

      const cell = (event.target as Element)?.closest<HTMLElement>(
        "[data-tile-row][data-tile-col]",
      );
      if (!cell) {
        return;
      }

      const r = parseInt(cell.getAttribute("data-tile-row") ?? "0", 10);
      const c = parseInt(cell.getAttribute("data-tile-col") ?? "0", 10);
      setTile(r, c, selectedTile);
    });
  }

  document.addEventListener("mouseup", () => {
    isDrawing = false;
  });
};

const boot = (): void => {
  const detail = document.getElementById("scene-detail");
  if (!detail) {
    return;
  }

  wireTabSwitching(detail);

  const tilemapPanel = detail.querySelector<HTMLElement>("[data-scene-tab-panel='tilemap']");
  if (tilemapPanel) {
    wireTilemapEditor(tilemapPanel);
  }
};

const refresh = (): void => {
  boot();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

document.addEventListener("htmx:afterSwap", refresh);

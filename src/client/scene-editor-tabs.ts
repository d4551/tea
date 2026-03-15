/**
 * Scene editor tab switching and tilemap paint tooling.
 *
 * Handles:
 * - Keyboard-accessible tab toggling between "nodes" and "tilemap" panels
 * - Tilemap brush/fill paint modes with debounced HTMX persistence
 * - Tile palette rendering from sprite sheet images without inline styles
 * - Keyboard and pointer painting, including an eraser state
 *
 * Bootstraps on DOMContentLoaded and re-runs after htmx:afterSwap for partial updates.
 */
import {
  DEFAULT_TILEMAP_EMPTY_VALUE,
  DEFAULT_TILEMAP_GRID_COLUMNS,
  DEFAULT_TILEMAP_GRID_ROWS,
  DEFAULT_TILEMAP_LAYER_ID,
  DEFAULT_TILEMAP_LAYER_NAME,
  DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX,
  DEFAULT_TILEMAP_TILE_SIZE_PX,
  TILEMAP_FILL_OPERATION_LIMIT,
  TILEMAP_PERSIST_DEBOUNCE_MS,
} from "../shared/constants/builder-defaults.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";

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

interface GridPosition {
  readonly row: number;
  readonly col: number;
}

declare global {
  interface Window {
    htmx?: {
      readonly ajax: (method: string, url: string, options: Record<string, unknown>) => void;
    };
  }
}

const wiredDetails = new WeakSet<HTMLElement>();
const wiredTilemapPanels = new WeakSet<HTMLElement>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value);

const isTileGrid = (value: unknown): value is number[][] =>
  Array.isArray(value) &&
  value.every((row) => Array.isArray(row) && row.every((tileValue) => isInteger(tileValue)));

const isTilemapAsset = (value: unknown): value is TilemapAsset =>
  isRecord(value) && typeof value.id === "string" && typeof value.source === "string";

const isTilemapAssetArray = (value: unknown): value is TilemapAsset[] =>
  Array.isArray(value) && value.every((entry) => isTilemapAsset(entry));

const isTilemapLayer = (value: unknown): value is TilemapLayer =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.tileSetAssetId === "string" &&
  isInteger(value.tileWidth) &&
  isInteger(value.tileHeight) &&
  isTileGrid(value.data) &&
  typeof value.collision === "boolean" &&
  typeof value.layer === "string";

const createDefaultTilemapLayer = (): TilemapLayer => ({
  id: DEFAULT_TILEMAP_LAYER_ID,
  tileSetAssetId: "",
  tileWidth: DEFAULT_TILEMAP_TILE_SIZE_PX,
  tileHeight: DEFAULT_TILEMAP_TILE_SIZE_PX,
  data: [],
  collision: false,
  layer: DEFAULT_TILEMAP_LAYER_NAME,
});

const parseTilemapAssets = (raw: string): TilemapAsset[] =>
  safeJsonParse(raw, [], isTilemapAssetArray);

const parseTilemapLayer = (raw: string): TilemapLayer =>
  safeJsonParse(raw, createDefaultTilemapLayer(), isTilemapLayer);

const resolveTileCell = (target: EventTarget | null): HTMLButtonElement | null => {
  if (!(target instanceof Element)) {
    return null;
  }

  const cell = target.closest<HTMLButtonElement>("[data-tile-row][data-tile-col]");
  return cell instanceof HTMLButtonElement ? cell : null;
};

const resolveGridPosition = (cell: HTMLElement): GridPosition | null => {
  const row = Number.parseInt(cell.getAttribute("data-tile-row") ?? "", 10);
  const col = Number.parseInt(cell.getAttribute("data-tile-col") ?? "", 10);
  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return null;
  }

  return { row, col };
};

const resolveLabelValue = (panel: HTMLElement, attribute: string, fallback: string): string => {
  const value = panel.getAttribute(attribute);
  return value?.trim() ? value : fallback;
};

const updateSceneTabState = (detail: HTMLElement, activeTabId: string): void => {
  const parent = detail.querySelector(".card-body");
  if (!parent) {
    return;
  }

  for (const tabElement of parent.querySelectorAll<HTMLElement>("[data-scene-tab]")) {
    const isActive = tabElement.getAttribute("data-scene-tab") === activeTabId;
    tabElement.classList.toggle("tab-active", isActive);
    tabElement.setAttribute("aria-selected", isActive ? "true" : "false");
    tabElement.tabIndex = isActive ? 0 : -1;
  }

  for (const panelElement of parent.querySelectorAll<HTMLElement>("[data-scene-tab-panel]")) {
    panelElement.classList.toggle(
      "hidden",
      panelElement.getAttribute("data-scene-tab-panel") !== activeTabId,
    );
  }
};

const wireTabSwitching = (detail: HTMLElement): void => {
  if (wiredDetails.has(detail)) {
    return;
  }

  wiredDetails.add(detail);
  detail.addEventListener("click", (event) => {
    const tab =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-scene-tab]")
        : null;
    if (!tab || tab.getAttribute("role") !== "tab") {
      return;
    }

    const tabId = tab.getAttribute("data-scene-tab");
    if (!tabId) {
      return;
    }

    updateSceneTabState(detail, tabId);
  });

  detail.addEventListener("keydown", (event) => {
    const tab =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-scene-tab]")
        : null;
    if (!tab || tab.getAttribute("role") !== "tab") {
      return;
    }

    const parent = tab.closest(".card-body");
    if (!parent) {
      return;
    }

    const tabs = Array.from(parent.querySelectorAll<HTMLElement>("[data-scene-tab]"));
    const activeIndex = tabs.indexOf(tab);
    if (activeIndex < 0) {
      return;
    }

    let nextIndex = activeIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    const nextTabId = nextTab?.getAttribute("data-scene-tab");
    if (!nextTab || !nextTabId) {
      return;
    }

    updateSceneTabState(detail, nextTabId);
    nextTab.focus();
  });
};

const updateSelectionStatus = (panel: HTMLElement, selectedTile: number): void => {
  const status = panel.querySelector<HTMLElement>("[data-tilemap-selection]");
  if (!status) {
    return;
  }

  const selectedTileLabel = resolveLabelValue(
    panel,
    "data-tilemap-selected-label",
    "Selected tile",
  );
  const emptyTileLabel = resolveLabelValue(panel, "data-tilemap-empty-label", "Empty tile");
  const tileLabel =
    selectedTile === DEFAULT_TILEMAP_EMPTY_VALUE ? emptyTileLabel : `#${selectedTile + 1}`;
  status.textContent = `${selectedTileLabel}: ${tileLabel}`;
};

const updatePaletteSelection = (panel: HTMLElement, selectedTile: number): void => {
  for (const button of panel.querySelectorAll<HTMLButtonElement>("[data-tile-select-value]")) {
    const rawValue = button.getAttribute("data-tile-select-value");
    const buttonValue = Number.parseInt(rawValue ?? "", 10);
    const isActive = Number.isInteger(buttonValue) && buttonValue === selectedTile;
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.classList.toggle("btn-primary", isActive);
    button.classList.toggle("btn-soft", !isActive);
    button.classList.toggle("ring-2", isActive);
    button.classList.toggle("ring-primary/40", isActive);
  }
};

const updatePaletteEmptyState = (panel: HTMLElement, isEmpty: boolean): void => {
  const emptyState = panel.querySelector<HTMLElement>("[data-tilemap-palette-empty]");
  if (!emptyState) {
    return;
  }

  emptyState.classList.toggle("hidden", !isEmpty);
};

const updateCellAppearance = (cell: HTMLButtonElement, value: number): void => {
  cell.setAttribute("data-tile-value", String(value));
  const isPainted = value >= 0;
  cell.classList.toggle("bg-primary/25", isPainted);
  cell.classList.toggle("hover:bg-primary/35", isPainted);
  cell.classList.toggle("bg-base-300/35", !isPainted);
  cell.classList.toggle("hover:bg-base-300/55", !isPainted);
};

const focusGridCell = (panel: HTMLElement, row: number, col: number): void => {
  const cell = panel.querySelector<HTMLButtonElement>(
    `[data-tile-row="${row}"][data-tile-col="${col}"]`,
  );
  cell?.focus();
};

const createPaletteButton = (
  tileValue: number,
  label: string,
  onSelect: (value: number) => void,
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-square btn-sm btn-soft h-10 w-10 p-1";
  button.setAttribute("data-tile-select-value", String(tileValue));
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => onSelect(tileValue));
  return button;
};

const appendPalettePreview = (
  button: HTMLButtonElement,
  image: HTMLImageElement,
  tileColumn: number,
  tileRow: number,
  tileWidth: number,
  tileHeight: number,
): void => {
  const canvas = document.createElement("canvas");
  canvas.width = DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX;
  canvas.height = DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX;
  canvas.className = "h-7 w-7 rounded-sm bg-base-200/70";
  canvas.setAttribute("aria-hidden", "true");
  const context = canvas.getContext("2d");
  if (context) {
    context.imageSmoothingEnabled = false;
    context.drawImage(
      image,
      tileColumn * tileWidth,
      tileRow * tileHeight,
      tileWidth,
      tileHeight,
      0,
      0,
      DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX,
      DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX,
    );
  } else {
    button.append(document.createTextNode(String(tileColumn + tileRow + 1)));
    return;
  }
  button.appendChild(canvas);
};

const wireTilemapEditor = (panel: HTMLElement): void => {
  if (wiredTilemapPanels.has(panel)) {
    return;
  }

  wiredTilemapPanels.add(panel);
  const assets = parseTilemapAssets(panel.getAttribute("data-tilemap-assets") ?? "[]");
  const layer = parseTilemapLayer(panel.getAttribute("data-tilemap-layer") ?? "{}");
  const cols = Number.parseInt(
    panel.getAttribute("data-tilemap-cols") ?? String(DEFAULT_TILEMAP_GRID_COLUMNS),
    10,
  );
  const rows = Number.parseInt(
    panel.getAttribute("data-tilemap-rows") ?? String(DEFAULT_TILEMAP_GRID_ROWS),
    10,
  );

  if (!layer.data || layer.data.length === 0) {
    layer.data = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => DEFAULT_TILEMAP_EMPTY_VALUE),
    );
  }

  let mode: "brush" | "fill" = "brush";
  let selectedTile = DEFAULT_TILEMAP_EMPTY_VALUE;
  let isDrawing = false;
  let paletteRequestId = 0;
  const persistForm = panel.querySelector<HTMLFormElement>("[data-tilemap-persist-form]");
  const persistInput = panel.querySelector<HTMLInputElement>("[data-tilemap-json]");
  const palette = panel.querySelector<HTMLElement>("[data-tilemap-palette]");
  const grid = panel.querySelector<HTMLElement>("[data-tilemap-grid]");
  const paletteLabel =
    palette?.getAttribute("aria-label") ??
    resolveLabelValue(panel, "data-tilemap-palette-label", "Tile palette");

  const getAssetSource = (id: string): string => {
    for (const asset of assets) {
      if (asset.id === id) {
        return asset.source;
      }
    }
    return id && (id.startsWith("/") || id.startsWith("http")) ? id : "";
  };

  const setSelectedTile = (value: number): void => {
    selectedTile = value;
    updateSelectionStatus(panel, selectedTile);
    updatePaletteSelection(panel, selectedTile);
  };

  const persistTilemap = (): void => {
    if (!persistForm || !persistInput) {
      return;
    }

    const tilemap = {
      layers: [
        {
          id: layer.id,
          tileSetAssetId: layer.tileSetAssetId,
          tileWidth: layer.tileWidth,
          tileHeight: layer.tileHeight,
          data: layer.data.map((row) => row.slice()),
          collision: layer.collision,
          layer: layer.layer,
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
    clearTimeout(Number(panel.dataset.tilemapPersistTimer ?? "0"));
    const timerId = window.setTimeout(persistTilemap, TILEMAP_PERSIST_DEBOUNCE_MS);
    panel.dataset.tilemapPersistTimer = String(timerId);
  };

  const setTile = (row: number, col: number, value: number): void => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return;
    }

    const targetRow = layer.data[row];
    if (!targetRow || targetRow[col] === value) {
      return;
    }

    targetRow[col] = value;
    const cell = panel.querySelector<HTMLButtonElement>(
      `[data-tile-row="${row}"][data-tile-col="${col}"]`,
    );
    if (cell) {
      updateCellAppearance(cell, value);
    }
    schedulePersist();
  };

  const floodFill = (startRow: number, startCol: number, nextValue: number): void => {
    const initialRow = layer.data[startRow];
    if (!initialRow) {
      return;
    }

    const targetValue = initialRow[startCol] ?? DEFAULT_TILEMAP_EMPTY_VALUE;
    if (targetValue === nextValue) {
      return;
    }

    const stack: GridPosition[] = [{ row: startRow, col: startCol }];
    const visited = new Set<string>();
    let operations = 0;

    while (stack.length > 0 && operations < TILEMAP_FILL_OPERATION_LIMIT) {
      const position = stack.pop();
      if (!position) {
        break;
      }

      const { row, col } = position;
      const key = `${row},${col}`;
      const currentRow = layer.data[row];
      if (
        row < 0 ||
        row >= rows ||
        col < 0 ||
        col >= cols ||
        visited.has(key) ||
        !currentRow ||
        currentRow[col] !== targetValue
      ) {
        continue;
      }

      visited.add(key);
      setTile(row, col, nextValue);
      operations += 1;
      stack.push(
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
      );
    }
  };

  const paintPosition = (position: GridPosition): void => {
    if (mode === "fill") {
      floodFill(position.row, position.col, selectedTile);
      return;
    }

    setTile(position.row, position.col, selectedTile);
  };

  const renderPalette = (source: string, tileWidth: number, tileHeight: number): void => {
    if (!palette) {
      return;
    }

    const eraserLabel = resolveLabelValue(panel, "data-tilemap-eraser-label", "Eraser");
    palette.innerHTML = "";
    const eraserButton = createPaletteButton(
      DEFAULT_TILEMAP_EMPTY_VALUE,
      `${paletteLabel}: ${eraserLabel}`,
      setSelectedTile,
    );
    eraserButton.append(document.createTextNode(eraserLabel.slice(0, 1).toUpperCase()));
    palette.appendChild(eraserButton);

    if (!source) {
      updatePaletteEmptyState(panel, true);
      updatePaletteSelection(panel, selectedTile);
      return;
    }

    const requestId = paletteRequestId + 1;
    paletteRequestId = requestId;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = (): void => {
      if (paletteRequestId !== requestId) {
        return;
      }

      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      const normalizedTileWidth = tileWidth > 0 ? tileWidth : DEFAULT_TILEMAP_TILE_SIZE_PX;
      const normalizedTileHeight = tileHeight > 0 ? tileHeight : DEFAULT_TILEMAP_TILE_SIZE_PX;
      const tileColumns = Math.max(1, Math.floor(sourceWidth / normalizedTileWidth));
      const tileRows = Math.max(1, Math.floor(sourceHeight / normalizedTileHeight));
      const tileCount = tileColumns * tileRows;

      for (let index = 0; index < tileCount; index += 1) {
        const tileColumn = index % tileColumns;
        const tileRow = Math.floor(index / tileColumns);
        const label = `${paletteLabel} #${index + 1}`;
        const button = createPaletteButton(index, label, setSelectedTile);
        appendPalettePreview(
          button,
          image,
          tileColumn,
          tileRow,
          normalizedTileWidth,
          normalizedTileHeight,
        );
        palette.appendChild(button);
      }

      updatePaletteEmptyState(panel, false);
      updatePaletteSelection(panel, selectedTile);
    };
    image.onerror = (): void => {
      if (paletteRequestId !== requestId) {
        return;
      }

      updatePaletteEmptyState(panel, true);
      updatePaletteSelection(panel, selectedTile);
    };
    image.src = source;
  };

  const tilesetInput = panel.querySelector<HTMLInputElement>("[data-tilemap-tileset]");
  tilesetInput?.addEventListener("change", () => {
    layer.tileSetAssetId = tilesetInput.value.trim();
    renderPalette(getAssetSource(layer.tileSetAssetId), layer.tileWidth, layer.tileHeight);
  });

  for (const button of panel.querySelectorAll<HTMLButtonElement>("[data-tilemap-mode]")) {
    button.addEventListener("click", () => {
      mode = button.getAttribute("data-tilemap-mode") === "fill" ? "fill" : "brush";
      for (const candidate of panel.querySelectorAll<HTMLButtonElement>("[data-tilemap-mode]")) {
        const isActive = candidate === button;
        candidate.setAttribute("aria-pressed", isActive ? "true" : "false");
        candidate.classList.toggle("btn-primary", isActive);
        candidate.classList.toggle("btn-soft", !isActive);
      }
    });
  }

  if (grid) {
    grid.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const cell = resolveTileCell(event.target);
      const position = cell ? resolveGridPosition(cell) : null;
      if (!cell || !position) {
        return;
      }

      event.preventDefault();
      paintPosition(position);
      isDrawing = mode === "brush";
      cell.focus();
    });

    grid.addEventListener("pointermove", (event) => {
      if (!isDrawing || mode !== "brush") {
        return;
      }

      if (event.buttons === 0) {
        isDrawing = false;
        return;
      }

      const cell = resolveTileCell(event.target);
      const position = cell ? resolveGridPosition(cell) : null;
      if (!position) {
        return;
      }

      paintPosition(position);
    });

    grid.addEventListener("pointerleave", () => {
      isDrawing = false;
    });

    grid.addEventListener("pointerup", () => {
      isDrawing = false;
    });

    grid.addEventListener("keydown", (event) => {
      const cell = resolveTileCell(event.target);
      const position = cell ? resolveGridPosition(cell) : null;
      if (!cell || !position) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        paintPosition(position);
        return;
      }

      let nextPosition: GridPosition | null = null;
      if (event.key === "ArrowUp") {
        nextPosition = { row: Math.max(0, position.row - 1), col: position.col };
      } else if (event.key === "ArrowDown") {
        nextPosition = { row: Math.min(rows - 1, position.row + 1), col: position.col };
      } else if (event.key === "ArrowLeft") {
        nextPosition = { row: position.row, col: Math.max(0, position.col - 1) };
      } else if (event.key === "ArrowRight") {
        nextPosition = { row: position.row, col: Math.min(cols - 1, position.col + 1) };
      }

      if (!nextPosition) {
        return;
      }

      event.preventDefault();
      focusGridCell(panel, nextPosition.row, nextPosition.col);
    });
  }

  renderPalette(getAssetSource(layer.tileSetAssetId), layer.tileWidth, layer.tileHeight);
  setSelectedTile(DEFAULT_TILEMAP_EMPTY_VALUE);
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

document.addEventListener("htmx:afterSwap", boot);

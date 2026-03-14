/**
 * Key-bindings configuration modal for the game page.
 *
 * Manages localStorage-persisted input bindings, key capture, display refresh,
 * and reset-to-defaults functionality.
 */
import { readLocalStorage, writeLocalStorage } from "../shared/utils/browser-storage.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";

const STORAGE_KEY = "lotfk:game:input-config";

type InputConfig = Record<string, readonly string[]>;

const DEFAULTS: InputConfig = {
  "move-up": ["w", "ArrowUp"],
  "move-down": ["s", "ArrowDown"],
  "move-left": ["a", "ArrowLeft"],
  "move-right": ["d", "ArrowRight"],
  interact: ["e", "Enter", " "],
  menu: ["i", "Tab"],
  close: ["Escape"],
};

const ACTIONS: readonly string[] = [
  "move-up",
  "move-down",
  "move-left",
  "move-right",
  "interact",
  "menu",
  "close",
];

const isInputConfig = (value: unknown): value is InputConfig => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  for (const action of ACTIONS) {
    const keys = record[action];
    if (!Array.isArray(keys) || !keys.every((k): k is string => typeof k === "string")) {
      return false;
    }
  }

  return true;
};

const readConfig = (): InputConfig => {
  const raw = readLocalStorage(STORAGE_KEY);
  if (raw === null) {
    return { ...DEFAULTS };
  }

  return safeJsonParse(raw, { ...DEFAULTS }, isInputConfig);
};

const writeConfig = (config: InputConfig): void => {
  writeLocalStorage(STORAGE_KEY, JSON.stringify(config));
};

const escapeDisplayHtml = (text: string): string =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const refreshDisplays = (): void => {
  const config = readConfig();

  for (const action of ACTIONS) {
    const row = document.querySelector<HTMLElement>(`.key-binding-row[data-action="${action}"]`);
    if (!row) {
      continue;
    }

    const container = row.querySelector<HTMLElement>(".key-binding-keys");
    if (!container) {
      continue;
    }

    const keys = config[action] ?? [];
    container.innerHTML =
      keys
        .map((key) => {
          const display = key === " " ? "Space" : key;
          return `<kbd class="kbd kbd-sm">${escapeDisplayHtml(display)}</kbd>`;
        })
        .join(" ") || '<span class="text-base-content/50">—</span>';
  }
};

const boot = (): void => {
  const modal = document.getElementById("key_bindings_modal") as HTMLDialogElement | null;
  if (!modal) {
    return;
  }

  modal.addEventListener("toggle", () => {
    if (modal.open) {
      refreshDisplays();
    }
  });

  modal.addEventListener("click", (event) => {
    const setButton = (event.target as Element)?.closest<HTMLElement>("[data-action-set]");
    if (!setButton) {
      return;
    }

    const action = setButton.getAttribute("data-action-set");
    if (!action) {
      return;
    }

    const listeningHint = modal.getAttribute("data-listening-hint") ?? "Press any key...";
    const setLabel = modal.getAttribute("data-set-label") ?? "Set";

    setButton.textContent = listeningHint;
    (setButton as HTMLButtonElement).disabled = true;

    const onKey = (keyEvent: KeyboardEvent): void => {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        document.removeEventListener("keydown", onKey);
        setButton.textContent = setLabel;
        (setButton as HTMLButtonElement).disabled = false;
        return;
      }

      if (keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey) {
        return;
      }

      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      document.removeEventListener("keydown", onKey);

      const config = readConfig();
      config[action] = [keyEvent.key];
      writeConfig(config);
      refreshDisplays();
      setButton.textContent = setLabel;
      (setButton as HTMLButtonElement).disabled = false;
    };

    document.addEventListener("keydown", onKey, { once: true });
  });

  modal.addEventListener("click", (event) => {
    const resetButton = (event.target as Element)?.closest<HTMLElement>("[data-reset-bindings]");
    if (!resetButton) {
      return;
    }

    writeConfig({ ...DEFAULTS });
    refreshDisplays();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

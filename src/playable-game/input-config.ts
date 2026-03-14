import { safeJsonParse } from "../shared/utils/safe-json.ts";

export const INPUT_CONFIG_STORAGE_KEY = "lotfk:game:input-config";

export type InputAction =
  | "move-up"
  | "move-down"
  | "move-left"
  | "move-right"
  | "interact"
  | "menu"
  | "close";

export type InputConfig = Readonly<Record<InputAction, readonly string[]>>;

const DEFAULT_INPUT_CONFIG: InputConfig = {
  "move-up": ["w", "ArrowUp"],
  "move-down": ["s", "ArrowDown"],
  "move-left": ["a", "ArrowLeft"],
  "move-right": ["d", "ArrowRight"],
  interact: ["e", "Enter", " "],
  menu: ["i", "Tab"],
  close: ["Escape"],
};

export const getDefaultInputConfig = (): InputConfig => ({ ...DEFAULT_INPUT_CONFIG });

const INPUT_ACTION_KEYS: readonly InputAction[] = [
  "move-up",
  "move-down",
  "move-left",
  "move-right",
  "interact",
  "menu",
  "close",
];

const isValidInputConfig = (value: unknown): value is InputConfig => {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return INPUT_ACTION_KEYS.every((k) => {
    const v = obj[k];
    return Array.isArray(v) && v.every((x) => typeof x === "string");
  });
};

const parseStoredConfig = (raw: string | null): InputConfig | null => {
  if (!raw) {
    return null;
  }
  const parsed = safeJsonParse(raw, null, isValidInputConfig);
  return parsed;
};

/**
 * Reads input config from localStorage, falling back to defaults.
 */
export const readInputConfig = (): InputConfig => {
  const raw =
    typeof globalThis.localStorage !== "undefined"
      ? globalThis.localStorage.getItem(INPUT_CONFIG_STORAGE_KEY)
      : null;
  const parsed = parseStoredConfig(raw);
  return parsed ?? getDefaultInputConfig();
};

/**
 * Persists input config to localStorage.
 */
export const writeInputConfig = (config: InputConfig): void => {
  if (typeof globalThis.localStorage === "undefined") return;
  globalThis.localStorage.setItem(INPUT_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

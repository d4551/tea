/**
 * Canonical UI theme identifiers and normalization helpers.
 */

/** Supported application theme identifiers. */
export const supportedUiThemes = ["tea-dark", "tea-light"] as const;

/** Concrete UI theme union. */
export type UiTheme = (typeof supportedUiThemes)[number];

/** Default theme used when configuration or storage is empty or invalid. */
export const DEFAULT_UI_THEME: UiTheme = "tea-dark";

/** Shared localStorage key for persisted theme preference. */
export const UI_THEME_STORAGE_KEY = "app-theme-preference";

const uiThemeAliases: Readonly<Record<string, UiTheme>> = {
  silk: "tea-light",
  autumn: "tea-dark",
  "forge-light": "tea-light",
  "forge-dark": "tea-dark",
};

/**
 * Returns true when a raw string is a supported UI theme identifier.
 *
 * @param value Raw candidate theme identifier.
 * @returns Whether the value is a supported theme.
 */
export const isUiTheme = (value: string): value is UiTheme =>
  supportedUiThemes.some((theme) => theme === value);

/**
 * Resolves an incoming theme string to a supported theme.
 *
 * @param value Raw theme string.
 * @returns Supported theme or null when the input is empty or unknown.
 */
export const matchUiTheme = (value: string | null | undefined): UiTheme | null => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const aliased = uiThemeAliases[normalized] ?? normalized;
  return isUiTheme(aliased) ? aliased : null;
};

/**
 * Normalizes a raw theme string into a supported theme with a deterministic fallback.
 *
 * @param value Raw theme string.
 * @param fallback Fallback theme when the value is empty or unsupported.
 * @returns Supported UI theme.
 */
export const normalizeUiTheme = (
  value: string | null | undefined,
  fallback: UiTheme = DEFAULT_UI_THEME,
): UiTheme => matchUiTheme(value) ?? fallback;

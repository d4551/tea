import { DEFAULT_UI_THEME, normalizeUiTheme, type UiTheme } from "../constants/ui-theme.ts";
import type { StarterProjectTemplateId } from "../contracts/game.ts";

/** Supported heading-font presets for project branding. */
export const supportedProjectHeadingFonts = ["sora", "outfit", "manrope", "fraunces"] as const;

/** Supported body-font presets for project branding. */
export const supportedProjectBodyFonts = [
  "dm-sans",
  "manrope",
  "ibm-plex-sans",
  "newsreader",
] as const;

/** Supported mono-font presets for project branding. */
export const supportedProjectMonoFonts = ["space-mono", "jetbrains-mono", "ibm-plex-mono"] as const;

/** Concrete heading-font preset union. */
export type ProjectHeadingFont = (typeof supportedProjectHeadingFonts)[number];

/** Concrete body-font preset union. */
export type ProjectBodyFont = (typeof supportedProjectBodyFonts)[number];

/** Concrete mono-font preset union. */
export type ProjectMonoFont = (typeof supportedProjectMonoFonts)[number];

/**
 * Project-owned branding profile rendered by builder and playable shells.
 */
export interface ProjectBranding {
  /** Public-facing app or world name. */
  readonly appName: string;
  /** Short subtitle used in chrome and metadata. */
  readonly appSubtitle: string;
  /** Compact text or emoji mark used when no image logo is configured. */
  readonly logoMark: string;
  /** Optional image path or URL for the brand mark. */
  readonly logoImagePath: string;
  /** Label shown for the branded builder shell. */
  readonly builderShellName: string;
  /** Supporting copy shown in the builder masthead. */
  readonly builderShellDescription: string;
  /** Label shown for the playable shell. */
  readonly playerShellName: string;
  /** DaisyUI surface theme used as the base light/dark layer. */
  readonly surfaceTheme: UiTheme;
  /** Heading font preset. */
  readonly headingFont: ProjectHeadingFont;
  /** Body font preset. */
  readonly bodyFont: ProjectBodyFont;
  /** Monospace font preset. */
  readonly monoFont: ProjectMonoFont;
  /** Primary accent color. */
  readonly primaryColor: string;
  /** Secondary accent color. */
  readonly secondaryColor: string;
  /** Accent/support color. */
  readonly accentColor: string;
  /** Neutral color used for shell surfaces and contrast accents. */
  readonly neutralColor: string;
  /** Base surface background color. */
  readonly base100Color: string;
  /** Base foreground/content color. */
  readonly baseContentColor: string;
}

/**
 * Partial patch payload accepted by the branding control plane.
 */
export interface ProjectBrandingInput {
  readonly appName?: string;
  readonly appSubtitle?: string;
  readonly logoMark?: string;
  readonly logoImagePath?: string;
  readonly builderShellName?: string;
  readonly builderShellDescription?: string;
  readonly playerShellName?: string;
  readonly surfaceTheme?: string;
  readonly headingFont?: string;
  readonly bodyFont?: string;
  readonly monoFont?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly accentColor?: string;
  readonly neutralColor?: string;
  readonly base100Color?: string;
  readonly baseContentColor?: string;
}

/**
 * Curated Google Fonts stylesheet that covers all supported project-brand presets.
 */
export const PROJECT_BRAND_FONTS_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Outfit:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap";

/**
 * Human-readable labels for heading-font presets.
 */
export const projectHeadingFontLabels: Readonly<Record<ProjectHeadingFont, string>> = {
  sora: "Sora",
  outfit: "Outfit",
  manrope: "Manrope",
  fraunces: "Fraunces",
};

/**
 * Human-readable labels for body-font presets.
 */
export const projectBodyFontLabels: Readonly<Record<ProjectBodyFont, string>> = {
  "dm-sans": "DM Sans",
  manrope: "Manrope",
  "ibm-plex-sans": "IBM Plex Sans",
  newsreader: "Newsreader",
};

/**
 * Human-readable labels for mono-font presets.
 */
export const projectMonoFontLabels: Readonly<Record<ProjectMonoFont, string>> = {
  "space-mono": "Space Mono",
  "jetbrains-mono": "JetBrains Mono",
  "ibm-plex-mono": "IBM Plex Mono",
};

const headingFontFamilies: Readonly<Record<ProjectHeadingFont, string>> = {
  sora: '"Sora", sans-serif',
  outfit: '"Outfit", sans-serif',
  manrope: '"Manrope", sans-serif',
  fraunces: '"Fraunces", serif',
};

const bodyFontFamilies: Readonly<Record<ProjectBodyFont, string>> = {
  "dm-sans": '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  manrope: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "ibm-plex-sans": '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  newsreader: '"Newsreader", Georgia, serif',
};

const monoFontFamilies: Readonly<Record<ProjectMonoFont, string>> = {
  "space-mono": '"Space Mono", "IBM Plex Mono", ui-monospace, monospace',
  "jetbrains-mono": '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
  "ibm-plex-mono": '"IBM Plex Mono", ui-monospace, monospace',
};

const defaultProjectBranding: ProjectBranding = {
  appName: "TEA Project",
  appSubtitle: "Editorial game-operations platform for playable worlds",
  logoMark: "TEA",
  logoImagePath: "",
  builderShellName: "Creator Control Plane",
  builderShellDescription:
    "Shape the brand, world, and release surfaces from one project-owned control plane.",
  playerShellName: "Playable World",
  surfaceTheme: DEFAULT_UI_THEME,
  headingFont: "sora",
  bodyFont: "dm-sans",
  monoFont: "space-mono",
  primaryColor: "#7C5CFF",
  secondaryColor: "#2EC5CE",
  accentColor: "#F59E0B",
  neutralColor: "#1F2937",
  base100Color: "#0F172A",
  baseContentColor: "#F8FAFC",
};

const starterBrandingPresets: Readonly<Record<StarterProjectTemplateId, ProjectBranding>> = {
  blank: defaultProjectBranding,
  "tea-house-story": {
    appName: "River Tea Chronicle",
    appSubtitle: "A contemplative story world shaped around ritual, trade, and memory.",
    logoMark: "茶",
    logoImagePath: "",
    builderShellName: "Story Atelier",
    builderShellDescription:
      "Tune the narrative shell, tone, and play surface before shipping your next scene.",
    playerShellName: "Tea House Realm",
    surfaceTheme: "tea-dark",
    headingFont: "fraunces",
    bodyFont: "newsreader",
    monoFont: "space-mono",
    primaryColor: "#C27A3F",
    secondaryColor: "#4B8B7B",
    accentColor: "#F2C14E",
    neutralColor: "#3E2A1F",
    base100Color: "#1C140F",
    baseContentColor: "#F7F1E8",
  },
  "2d-game": {
    appName: "Pixel Garden",
    appSubtitle: "A bright 2D world with expressive sprite stories and playful systems.",
    logoMark: "PG",
    logoImagePath: "",
    builderShellName: "Sprite Studio",
    builderShellDescription:
      "Dial in the visual system, palette, and creator surfaces for a reusable 2D brand kit.",
    playerShellName: "Garden Arcade",
    surfaceTheme: "tea-light",
    headingFont: "outfit",
    bodyFont: "manrope",
    monoFont: "jetbrains-mono",
    primaryColor: "#22C55E",
    secondaryColor: "#38BDF8",
    accentColor: "#F97316",
    neutralColor: "#334155",
    base100Color: "#F6FFFB",
    baseContentColor: "#0F172A",
  },
  "3d-game": {
    appName: "Orbital Foundry",
    appSubtitle: "A sleek control surface for cinematic spaces, systems, and missions.",
    logoMark: "OF",
    logoImagePath: "",
    builderShellName: "Launch Console",
    builderShellDescription:
      "Coordinate identity, interface motion, and runtime surfaces from one spacecraft-grade panel.",
    playerShellName: "Station Runtime",
    surfaceTheme: "tea-dark",
    headingFont: "manrope",
    bodyFont: "ibm-plex-sans",
    monoFont: "ibm-plex-mono",
    primaryColor: "#60A5FA",
    secondaryColor: "#A855F7",
    accentColor: "#22D3EE",
    neutralColor: "#111827",
    base100Color: "#020617",
    baseContentColor: "#E2E8F0",
  },
};

const hexColorPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu;

const isProjectHeadingFont = (value: string): value is ProjectHeadingFont =>
  supportedProjectHeadingFonts.includes(value as ProjectHeadingFont);

const isProjectBodyFont = (value: string): value is ProjectBodyFont =>
  supportedProjectBodyFonts.includes(value as ProjectBodyFont);

const isProjectMonoFont = (value: string): value is ProjectMonoFont =>
  supportedProjectMonoFonts.includes(value as ProjectMonoFont);

const trimNormalized = (value: string | undefined, fallback: string, maxLength: number): string => {
  const normalized = value?.trim().replace(/\s+/gu, " ");
  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, maxLength);
};

const trimLogoMark = (value: string | undefined, fallback: string): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }

  return Array.from(normalized).slice(0, 3).join("");
};

const normalizeLogoImagePath = (value: string | undefined): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return "";
  }

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("http://")
  ) {
    return normalized.slice(0, 512);
  }

  return "";
};

const normalizeHexColor = (value: string | undefined, fallback: string): string => {
  const normalized = value?.trim();
  if (!normalized || !hexColorPattern.test(normalized)) {
    return fallback;
  }

  if (normalized.length === 4) {
    const [hash, r, g, b] = normalized;
    return `${hash}${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return normalized.toUpperCase();
};

const hexToRgb = (
  value: string,
): { readonly r: number; readonly g: number; readonly b: number } => {
  const normalized = normalizeHexColor(value, "#000000");
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const mixHexColors = (left: string, right: string, weight: number): string => {
  const leftRgb = hexToRgb(left);
  const rightRgb = hexToRgb(right);
  const clampedWeight = Math.max(0, Math.min(1, weight));
  const blend = (from: number, to: number): number =>
    Math.round(from * (1 - clampedWeight) + to * clampedWeight);
  return `#${blend(leftRgb.r, rightRgb.r).toString(16).padStart(2, "0")}${blend(
    leftRgb.g,
    rightRgb.g,
  )
    .toString(16)
    .padStart(2, "0")}${blend(leftRgb.b, rightRgb.b).toString(16).padStart(2, "0")}`.toUpperCase();
};

const relativeChannel = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

const resolveReadableContentColor = (backgroundColor: string): string => {
  const { r, g, b } = hexToRgb(backgroundColor);
  const luminance =
    0.2126 * relativeChannel(r) + 0.7152 * relativeChannel(g) + 0.0722 * relativeChannel(b);
  return luminance > 0.44 ? "#0F172A" : "#F8FAFC";
};

/**
 * Creates the default branding preset for one starter project template.
 *
 * @param templateId Starter template identifier.
 * @returns Fully normalized branding preset.
 */
export const createStarterProjectBranding = (
  templateId: StarterProjectTemplateId,
): ProjectBranding => structuredClone(starterBrandingPresets[templateId] ?? defaultProjectBranding);

/**
 * Normalizes a partial branding payload into a complete project-brand profile.
 *
 * @param input Raw partial input from persistence or forms.
 * @param fallback Fallback brand values to retain when fields are omitted.
 * @returns Safe, fully normalized branding profile.
 */
export const normalizeProjectBranding = (
  input: ProjectBrandingInput | ProjectBranding | null | undefined,
  fallback: ProjectBranding = defaultProjectBranding,
): ProjectBranding => ({
  appName: trimNormalized(input?.appName, fallback.appName, 80),
  appSubtitle: trimNormalized(input?.appSubtitle, fallback.appSubtitle, 180),
  logoMark: trimLogoMark(input?.logoMark, fallback.logoMark),
  logoImagePath: normalizeLogoImagePath(input?.logoImagePath ?? fallback.logoImagePath),
  builderShellName: trimNormalized(input?.builderShellName, fallback.builderShellName, 60),
  builderShellDescription: trimNormalized(
    input?.builderShellDescription,
    fallback.builderShellDescription,
    220,
  ),
  playerShellName: trimNormalized(input?.playerShellName, fallback.playerShellName, 60),
  surfaceTheme: normalizeUiTheme(input?.surfaceTheme, fallback.surfaceTheme),
  headingFont:
    typeof input?.headingFont === "string" && isProjectHeadingFont(input.headingFont)
      ? input.headingFont
      : fallback.headingFont,
  bodyFont:
    typeof input?.bodyFont === "string" && isProjectBodyFont(input.bodyFont)
      ? input.bodyFont
      : fallback.bodyFont,
  monoFont:
    typeof input?.monoFont === "string" && isProjectMonoFont(input.monoFont)
      ? input.monoFont
      : fallback.monoFont,
  primaryColor: normalizeHexColor(input?.primaryColor, fallback.primaryColor),
  secondaryColor: normalizeHexColor(input?.secondaryColor, fallback.secondaryColor),
  accentColor: normalizeHexColor(input?.accentColor, fallback.accentColor),
  neutralColor: normalizeHexColor(input?.neutralColor, fallback.neutralColor),
  base100Color: normalizeHexColor(input?.base100Color, fallback.base100Color),
  baseContentColor: normalizeHexColor(input?.baseContentColor, fallback.baseContentColor),
});

/**
 * Resolves the inline CSS custom-property string for a branded page or preview scope.
 *
 * @param branding Normalized branding profile.
 * @returns Safe CSS variable declarations suitable for an inline `style` attribute.
 */
export const resolveProjectBrandingStyleVariables = (branding: ProjectBranding): string => {
  const normalized = normalizeProjectBranding(branding);
  const base200Color = mixHexColors(normalized.base100Color, normalized.neutralColor, 0.08);
  const base300Color = mixHexColors(normalized.base100Color, normalized.neutralColor, 0.18);

  return [
    `--app-heading-font:${headingFontFamilies[normalized.headingFont]}`,
    `--app-body-font:${bodyFontFamilies[normalized.bodyFont]}`,
    `--app-mono-font:${monoFontFamilies[normalized.monoFont]}`,
    `--app-code-font:${monoFontFamilies[normalized.monoFont]}`,
    `--color-primary:${normalized.primaryColor}`,
    `--color-primary-content:${resolveReadableContentColor(normalized.primaryColor)}`,
    `--color-secondary:${normalized.secondaryColor}`,
    `--color-secondary-content:${resolveReadableContentColor(normalized.secondaryColor)}`,
    `--color-accent:${normalized.accentColor}`,
    `--color-accent-content:${resolveReadableContentColor(normalized.accentColor)}`,
    `--color-neutral:${normalized.neutralColor}`,
    `--color-neutral-content:${resolveReadableContentColor(normalized.neutralColor)}`,
    `--color-base-100:${normalized.base100Color}`,
    `--color-base-200:${base200Color}`,
    `--color-base-300:${base300Color}`,
    `--color-base-content:${normalized.baseContentColor}`,
    `--color-focus-ring:${normalized.primaryColor}`,
  ].join("; ");
};

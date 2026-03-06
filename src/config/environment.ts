import {
  assetRelativePaths,
  joinLocalPath,
  joinUrlPath,
  toPublicAssetUrl,
} from "../shared/constants/assets.ts";

/**
 * Supported locale codes for server rendering and API responses.
 */
export const supportedLocales = ["en-US", "zh-CN"] as const;

/**
 * Locale code union for i18n-aware routes and components.
 */
export type LocaleCode = (typeof supportedLocales)[number];

/**
 * Top-level application configuration.
 */
export interface AppConfig {
  readonly applicationName: string;
  readonly applicationVersion: string;
  readonly host: string;
  readonly port: number;
  readonly defaultLocale: LocaleCode;
  readonly stylesheetPath: string;
  readonly htmxScriptPath: string;
  readonly staticAssets: {
    readonly publicPrefix: string;
    readonly assetsPrefix: string;
    readonly rmmzPackPrefix: string;
    readonly publicDirectory: string;
    readonly assetsDirectory: string;
    readonly rmmzPackDirectory: string;
  };
  readonly api: {
    readonly docsPath: string;
  };
  readonly ui: {
    readonly defaultTheme: string;
    readonly maxContentWidthClass: string;
  };
  readonly playableGame: {
    readonly mountPath: string;
    readonly assetPrefix: string;
    readonly sourceDirectory: string;
    readonly clientScriptPath: string;
  };
  readonly auth: {
    readonly sessionCookieName: string;
    readonly sessionCookieValue: string;
  };
  readonly oracle: {
    readonly requireSession: boolean;
    readonly responseDelayMs: number;
    readonly maxQuestionLength: number;
    readonly answerHashMultiplier: number;
  };
  readonly game: {
    readonly sessionStore: "prisma" | "memory";
    readonly defaultSceneId: string;
    readonly sessionTtlMs: number;
    readonly tickMs: number;
    readonly maxInteractionsPerTick: number;
    readonly saveCooldownMs: number;
    readonly maxMovePerTick: number;
    readonly maxCommandsPerTick: number;
    readonly maxChatMessageLength: number;
    readonly viewportWidth: number;
    readonly viewportHeight: number;
    readonly hudPollIntervalMs: number;
    readonly hudRetryDelayMs: number;
    readonly sessionPurgeIntervalMs: number;
    readonly sessionResumeWindowMs: number;
  };
  readonly ai: {
    readonly modelWarmupTimeoutMs: number;
    readonly pipelineTimeoutMs: number;
    readonly transformersCacheDirectory: string;
    readonly onnxWasmPath: string;
    readonly onnxThreadCount: number;
    readonly ollamaBaseUrl: string;
    readonly ollamaEnabled: boolean;
    readonly ollamaChatModel: string;
    readonly ollamaVisionModel: string;
    readonly ollamaTimeoutMs: number;
    readonly ollamaKeepAliveMs: number;
    readonly preferredProvider: "auto" | "ollama" | "transformers";
    readonly capabilityRefreshIntervalMs: number;
    readonly ollamaAvailabilityTimeoutMs: number;
    readonly requestTimeoutMs: number;
    readonly commandRetryBudgetMs: number;
    readonly retryBackoffBaseMs: number;
  };
  readonly spriteProcessing: {
    readonly sourceDirectory: string;
    readonly outputDirectory: string;
    readonly floodFillTolerance: number;
    readonly interiorGraySpreadThreshold: number;
    readonly interiorGrayLuminanceMin: number;
    readonly interiorGrayLuminanceMax: number;
    readonly aiModel: string;
    readonly chaJiangSourceFile: string;
    readonly chaJiangOutputFile: string;
    readonly npcSheetSourceFile: string;
    readonly npcSheetOutputFile: string;
  };
}

const DEFAULT_PORT = 3000;
const DEFAULT_RESPONSE_DELAY_MS = 180;
const DEFAULT_MAX_QUESTION_LENGTH = 240;
const DEFAULT_FLOOD_FILL_TOLERANCE = 40;
const DEFAULT_INTERIOR_GRAY_SPREAD_THRESHOLD = 8;
const DEFAULT_INTERIOR_GRAY_LUMINANCE_MIN = 120;
const DEFAULT_INTERIOR_GRAY_LUMINANCE_MAX = 230;
const DEFAULT_GAME_SESSION_STORE = "prisma";
const DEFAULT_GAME_SESSION_TTL_MS = 1000 * 60 * 60;
const DEFAULT_GAME_TICK_MS = 16;
const DEFAULT_GAME_SAVE_COOLDOWN_MS = 2500;
const DEFAULT_GAME_MAX_MOVE_PER_TICK = 12;
const DEFAULT_GAME_MAX_COMMANDS_PER_TICK = 6;
const DEFAULT_GAME_MAX_INTERACTIONS_PER_TICK = 3;
const DEFAULT_GAME_MAX_CHAT_MESSAGE_LENGTH = 500;
const DEFAULT_GAME_VIEWPORT_WIDTH = 640;
const DEFAULT_GAME_VIEWPORT_HEIGHT = 360;
const DEFAULT_GAME_HUD_POLL_MS = 500;
const DEFAULT_GAME_HUD_RETRY_MS = 2000;
const DEFAULT_GAME_SESSION_RESUME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GAME_DEFAULT_SCENE_ID = "teaHouse";
const DEFAULT_AI_MODEL_WARMUP_TIMEOUT_MS = 5000;
const DEFAULT_AI_PIPELINE_TIMEOUT_MS = 2500;
const DEFAULT_AI_TRANSFORMERS_CACHE_DIRECTORY = "./.cache/hf-models";
const DEFAULT_AI_ONNX_THREAD_COUNT = 2;
const DEFAULT_AI_REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_AI_COMMAND_RETRY_BUDGET_MS = 30_000;
const DEFAULT_AI_RETRY_BACKOFF_BASE_MS = 350;
const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_CHAT_MODEL = "llama3.2";
const DEFAULT_OLLAMA_VISION_MODEL = "llava";
const DEFAULT_OLLAMA_TIMEOUT_MS = 30_000;
const DEFAULT_OLLAMA_KEEP_ALIVE_MS = 300_000;
const DEFAULT_AI_PREFERRED_PROVIDER = "auto";
const DEFAULT_AI_CAPABILITY_REFRESH_INTERVAL_MS = 60_000;
const DEFAULT_SPRITE_AI_MODEL = "Xenova/modnet";
const DEFAULT_CHA_JIANG_SOURCE_FILE = "cha-jiang-source.png";
const DEFAULT_CHA_JIANG_OUTPUT_FILE = "cha-jiang-sprite.png";
const DEFAULT_NPC_SHEET_SOURCE_FILE = "npc-sprites-source.png";
const DEFAULT_NPC_SHEET_OUTPUT_FILE = "npc-sprites.png";
const DEFAULT_PUBLIC_PREFIX = "/public";
const DEFAULT_ASSETS_PREFIX = "/assets";
const DEFAULT_RMMZ_PACK_PREFIX = "/rmmz-pack";
const DEFAULT_PUBLIC_DIRECTORY = "public";
const DEFAULT_ASSETS_DIRECTORY = "assets";
const DEFAULT_RMMZ_PACK_DIRECTORY = "LOTFK_RMMZ_Agentic_Pack";
const DEFAULT_DOCS_PATH = "/docs";
const DEFAULT_PLAYABLE_GAME_MOUNT_PATH = "/game";
const DEFAULT_PLAYABLE_GAME_SOURCE_DIRECTORY = "public/game";
const DEFAULT_THEME = "silk";
const DEFAULT_MAX_CONTENT_WIDTH_CLASS = "max-w-6xl";
const DEFAULT_SESSION_COOKIE_NAME = "lotfk_session";
const DEFAULT_SESSION_COOKIE_VALUE = "active";
const DEFAULT_ANSWER_HASH_MULTIPLIER = 7;
const DEFAULT_LOCALE: LocaleCode = "en-US";
const resolvedPublicPrefix = Bun.env.PUBLIC_ASSET_PREFIX ?? DEFAULT_PUBLIC_PREFIX;
const resolvedAssetsPrefix = Bun.env.IMAGES_ASSET_PREFIX ?? DEFAULT_ASSETS_PREFIX;
const resolvedRmmzPackPrefix = Bun.env.RMMZ_PACK_PREFIX ?? DEFAULT_RMMZ_PACK_PREFIX;
const resolvedPublicDirectory = Bun.env.PUBLIC_ASSET_DIR ?? DEFAULT_PUBLIC_DIRECTORY;
const resolvedAssetsDirectory = Bun.env.IMAGES_ASSET_DIR ?? DEFAULT_ASSETS_DIRECTORY;
const resolvedRmmzPackDirectory = Bun.env.RMMZ_PACK_DIR ?? DEFAULT_RMMZ_PACK_DIRECTORY;
const resolvedPlayableGameMountPath =
  Bun.env.PLAYABLE_GAME_MOUNT_PATH ?? DEFAULT_PLAYABLE_GAME_MOUNT_PATH;
const resolvedPlayableGameAssetPrefix = joinUrlPath(resolvedPlayableGameMountPath, "assets");
const resolvedPlayableGameSourceDirectory =
  Bun.env.PLAYABLE_GAME_SOURCE_DIRECTORY ?? DEFAULT_PLAYABLE_GAME_SOURCE_DIRECTORY;
const resolvedStylesheetPath =
  Bun.env.STYLESHEET_PATH ??
  joinUrlPath(resolvedPublicPrefix, assetRelativePaths.stylesheetOutputFile);
const resolvedHtmxScriptPath =
  Bun.env.HTMX_SCRIPT_PATH ??
  joinUrlPath(resolvedPublicPrefix, assetRelativePaths.htmxPublicBundleFile);
const resolvedPlayableGameClientScriptPath =
  Bun.env.PLAYABLE_GAME_CLIENT_SCRIPT_PATH ??
  joinUrlPath(resolvedPlayableGameAssetPrefix, assetRelativePaths.gameClientBundleFile);
const resolvedOnnxWasmPath =
  Bun.env.AI_ONNX_WASM_PATH ??
  `${toPublicAssetUrl(resolvedPublicPrefix, assetRelativePaths.onnxPublicDirectory)}/`;

interface LocaleMatcher {
  readonly locale: LocaleCode;
  readonly normalizedLocale: string;
  readonly normalizedLanguage: string;
}

const localeMatchers: readonly LocaleMatcher[] = supportedLocales.map((locale) => ({
  locale,
  normalizedLocale: locale.toLowerCase(),
  normalizedLanguage: locale.toLowerCase().split("-")[0] ?? locale.toLowerCase(),
}));

/**
 * Parses an environment boolean in a strict and explicit way.
 *
 * @param value Raw environment value.
 * @param fallback Fallback when the value is missing.
 * @returns Parsed boolean value.
 */
export const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

/**
 * Parses an integer environment value and applies bounds.
 *
 * @param value Raw environment value.
 * @param fallback Fallback numeric value.
 * @param min Minimum allowed value.
 * @returns Parsed bounded integer.
 */
export const parseInteger = (value: string | undefined, fallback: number, min: number): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(parsed, min);
};

type GameSessionStoreMode = "prisma" | "memory";
type PreferredAiProvider = "auto" | "ollama" | "transformers";

const parseGameSessionStore = (value: string | undefined): GameSessionStoreMode => {
  if (value === "memory") {
    return "memory";
  }

  if (value === "prisma") {
    return "prisma";
  }

  return DEFAULT_GAME_SESSION_STORE;
};

const parsePreferredAiProvider = (value: string | undefined): PreferredAiProvider => {
  if (value === "ollama" || value === "transformers" || value === "auto") {
    return value;
  }

  return DEFAULT_AI_PREFERRED_PROVIDER;
};

/**
 * Converts an incoming locale string into a supported locale.
 *
 * @param value Raw locale string.
 * @returns Supported locale code.
 */
export const normalizeLocale = (value: string | undefined): LocaleCode => {
  return matchLocale(value) ?? DEFAULT_LOCALE;
};

/**
 * Matches a locale-like input value to a supported locale code.
 *
 * @param value Raw locale string.
 * @returns Matching supported locale, if any.
 */
export const matchLocale = (value: string | undefined | null): LocaleCode | null => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const matcher of localeMatchers) {
    if (normalized.startsWith(matcher.normalizedLocale)) {
      return matcher.locale;
    }

    if (normalized === matcher.normalizedLanguage) {
      return matcher.locale;
    }

    if (normalized.startsWith(`${matcher.normalizedLanguage}-`)) {
      return matcher.locale;
    }
  }

  return null;
};

/**
 * Fully resolved application configuration from environment variables.
 */
export const appConfig: AppConfig = {
  applicationName: Bun.env.APP_NAME ?? "Leaves of the Fallen Kingdom",
  applicationVersion: Bun.env.APP_VERSION ?? "1.0.0",
  host: Bun.env.HOST ?? "0.0.0.0",
  port: parseInteger(Bun.env.PORT, DEFAULT_PORT, 1),
  defaultLocale: normalizeLocale(Bun.env.DEFAULT_LOCALE),
  stylesheetPath: resolvedStylesheetPath,
  htmxScriptPath: resolvedHtmxScriptPath,
  staticAssets: {
    publicPrefix: resolvedPublicPrefix,
    assetsPrefix: resolvedAssetsPrefix,
    rmmzPackPrefix: resolvedRmmzPackPrefix,
    publicDirectory: resolvedPublicDirectory,
    assetsDirectory: resolvedAssetsDirectory,
    rmmzPackDirectory: resolvedRmmzPackDirectory,
  },
  api: {
    docsPath: Bun.env.API_DOCS_PATH ?? DEFAULT_DOCS_PATH,
  },
  ui: {
    defaultTheme: Bun.env.APP_THEME ?? DEFAULT_THEME,
    maxContentWidthClass: Bun.env.MAX_CONTENT_WIDTH_CLASS ?? DEFAULT_MAX_CONTENT_WIDTH_CLASS,
  },
  playableGame: {
    mountPath: resolvedPlayableGameMountPath,
    assetPrefix: resolvedPlayableGameAssetPrefix,
    sourceDirectory: resolvedPlayableGameSourceDirectory,
    clientScriptPath: resolvedPlayableGameClientScriptPath,
  },
  auth: {
    sessionCookieName: Bun.env.SESSION_COOKIE_NAME ?? DEFAULT_SESSION_COOKIE_NAME,
    sessionCookieValue: Bun.env.SESSION_COOKIE_VALUE ?? DEFAULT_SESSION_COOKIE_VALUE,
  },
  oracle: {
    requireSession: parseBoolean(Bun.env.ORACLE_REQUIRE_SESSION, false),
    responseDelayMs: parseInteger(Bun.env.ORACLE_RESPONSE_DELAY_MS, DEFAULT_RESPONSE_DELAY_MS, 0),
    maxQuestionLength: parseInteger(
      Bun.env.ORACLE_MAX_QUESTION_LENGTH,
      DEFAULT_MAX_QUESTION_LENGTH,
      1,
    ),
    answerHashMultiplier: parseInteger(
      Bun.env.ORACLE_ANSWER_HASH_MULTIPLIER,
      DEFAULT_ANSWER_HASH_MULTIPLIER,
      1,
    ),
  },
  game: {
    sessionStore: parseGameSessionStore(Bun.env.GAME_SESSION_STORE),
    defaultSceneId: Bun.env.GAME_DEFAULT_SCENE_ID ?? DEFAULT_GAME_DEFAULT_SCENE_ID,
    sessionTtlMs: parseInteger(Bun.env.GAME_SESSION_TTL_MS, DEFAULT_GAME_SESSION_TTL_MS, 1000),
    tickMs: parseInteger(Bun.env.GAME_TICK_MS, DEFAULT_GAME_TICK_MS, 1),
    saveCooldownMs: parseInteger(Bun.env.GAME_SAVE_COOLDOWN_MS, DEFAULT_GAME_SAVE_COOLDOWN_MS, 0),
    maxMovePerTick: parseInteger(Bun.env.GAME_MAX_MOVE_PER_TICK, DEFAULT_GAME_MAX_MOVE_PER_TICK, 1),
    maxCommandsPerTick: parseInteger(
      Bun.env.GAME_MAX_COMMANDS_PER_TICK,
      DEFAULT_GAME_MAX_COMMANDS_PER_TICK,
      1,
    ),
    maxInteractionsPerTick: parseInteger(
      Bun.env.GAME_MAX_INTERACTIONS_PER_TICK,
      DEFAULT_GAME_MAX_INTERACTIONS_PER_TICK,
      1,
    ),
    maxChatMessageLength: parseInteger(
      Bun.env.GAME_MAX_CHAT_MESSAGE_LENGTH,
      DEFAULT_GAME_MAX_CHAT_MESSAGE_LENGTH,
      1,
    ),
    viewportWidth: parseInteger(Bun.env.GAME_VIEWPORT_WIDTH, DEFAULT_GAME_VIEWPORT_WIDTH, 1),
    viewportHeight: parseInteger(Bun.env.GAME_VIEWPORT_HEIGHT, DEFAULT_GAME_VIEWPORT_HEIGHT, 1),
    hudPollIntervalMs: parseInteger(
      Bun.env.GAME_HUD_POLL_INTERVAL_MS,
      DEFAULT_GAME_HUD_POLL_MS,
      100,
    ),
    hudRetryDelayMs: parseInteger(Bun.env.GAME_HUD_RETRY_MS, DEFAULT_GAME_HUD_RETRY_MS, 0),
    sessionPurgeIntervalMs: parseInteger(Bun.env.GAME_SESSION_PURGE_INTERVAL_MS, 60_000, 1000),
    sessionResumeWindowMs: parseInteger(
      Bun.env.GAME_SESSION_RESUME_WINDOW_MS,
      DEFAULT_GAME_SESSION_RESUME_WINDOW_MS,
      1000,
    ),
  },
  ai: {
    modelWarmupTimeoutMs: parseInteger(
      Bun.env.AI_MODEL_WARMUP_TIMEOUT_MS,
      DEFAULT_AI_MODEL_WARMUP_TIMEOUT_MS,
      500,
    ),
    pipelineTimeoutMs: parseInteger(
      Bun.env.AI_PIPELINE_TIMEOUT_MS,
      DEFAULT_AI_PIPELINE_TIMEOUT_MS,
      500,
    ),
    transformersCacheDirectory:
      Bun.env.AI_TRANSFORMERS_CACHE_DIR ?? DEFAULT_AI_TRANSFORMERS_CACHE_DIRECTORY,
    onnxWasmPath: resolvedOnnxWasmPath,
    onnxThreadCount: parseInteger(Bun.env.AI_ONNX_THREAD_COUNT, DEFAULT_AI_ONNX_THREAD_COUNT, 1),
    ollamaBaseUrl: Bun.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL,
    ollamaEnabled: parseBoolean(Bun.env.OLLAMA_ENABLED, true),
    ollamaChatModel: Bun.env.OLLAMA_CHAT_MODEL ?? DEFAULT_OLLAMA_CHAT_MODEL,
    ollamaVisionModel: Bun.env.OLLAMA_VISION_MODEL ?? DEFAULT_OLLAMA_VISION_MODEL,
    ollamaTimeoutMs: parseInteger(Bun.env.OLLAMA_TIMEOUT_MS, DEFAULT_OLLAMA_TIMEOUT_MS, 1000),
    ollamaKeepAliveMs: parseInteger(Bun.env.OLLAMA_KEEP_ALIVE_MS, DEFAULT_OLLAMA_KEEP_ALIVE_MS, 0),
    preferredProvider: parsePreferredAiProvider(Bun.env.AI_PREFERRED_PROVIDER),
    capabilityRefreshIntervalMs: parseInteger(
      Bun.env.AI_CAPABILITY_REFRESH_INTERVAL_MS,
      DEFAULT_AI_CAPABILITY_REFRESH_INTERVAL_MS,
      5000,
    ),
    ollamaAvailabilityTimeoutMs: parseInteger(Bun.env.OLLAMA_AVAILABILITY_TIMEOUT_MS, 3_000, 500),
    requestTimeoutMs: parseInteger(
      Bun.env.AI_REQUEST_TIMEOUT_MS,
      DEFAULT_AI_REQUEST_TIMEOUT_MS,
      500,
    ),
    commandRetryBudgetMs: parseInteger(
      Bun.env.AI_COMMAND_RETRY_BUDGET_MS,
      DEFAULT_AI_COMMAND_RETRY_BUDGET_MS,
      1_000,
    ),
    retryBackoffBaseMs: parseInteger(
      Bun.env.AI_RETRY_BACKOFF_BASE_MS,
      DEFAULT_AI_RETRY_BACKOFF_BASE_MS,
      50,
    ),
  },
  spriteProcessing: {
    sourceDirectory: Bun.env.SPRITE_SOURCE_DIR ?? "assets/source",
    outputDirectory:
      Bun.env.SPRITE_OUTPUT_DIR ?? joinLocalPath(resolvedAssetsDirectory, "images/sprites"),
    floodFillTolerance: parseInteger(
      Bun.env.SPRITE_FLOOD_FILL_TOLERANCE,
      DEFAULT_FLOOD_FILL_TOLERANCE,
      0,
    ),
    interiorGraySpreadThreshold: parseInteger(
      Bun.env.SPRITE_INTERIOR_GRAY_SPREAD_THRESHOLD,
      DEFAULT_INTERIOR_GRAY_SPREAD_THRESHOLD,
      0,
    ),
    interiorGrayLuminanceMin: parseInteger(
      Bun.env.SPRITE_INTERIOR_GRAY_LUMINANCE_MIN,
      DEFAULT_INTERIOR_GRAY_LUMINANCE_MIN,
      0,
    ),
    interiorGrayLuminanceMax: parseInteger(
      Bun.env.SPRITE_INTERIOR_GRAY_LUMINANCE_MAX,
      DEFAULT_INTERIOR_GRAY_LUMINANCE_MAX,
      0,
    ),
    aiModel: Bun.env.SPRITE_AI_MODEL ?? DEFAULT_SPRITE_AI_MODEL,
    chaJiangSourceFile: Bun.env.SPRITE_SOURCE_CHA_JIANG ?? DEFAULT_CHA_JIANG_SOURCE_FILE,
    chaJiangOutputFile: Bun.env.SPRITE_OUTPUT_CHA_JIANG ?? DEFAULT_CHA_JIANG_OUTPUT_FILE,
    npcSheetSourceFile: Bun.env.SPRITE_SOURCE_NPC_SHEET ?? DEFAULT_NPC_SHEET_SOURCE_FILE,
    npcSheetOutputFile: Bun.env.SPRITE_OUTPUT_NPC_SHEET ?? DEFAULT_NPC_SHEET_OUTPUT_FILE,
  },
};

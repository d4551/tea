import { assetRelativePaths, joinUrlPath, toPublicAssetUrl } from "../shared/constants/assets.ts";

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
    readonly rendererPreference: RendererPreference;
  };
  readonly auth: {
    readonly sessionCookieName: string;
    readonly sessionMaxAgeSeconds: number;
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
    readonly sessionPersistIntervalMs: number;
    readonly maxInteractionsPerTick: number;
    readonly maxChatCommandsPerWindow: number;
    readonly chatRateLimitWindowMs: number;
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
    readonly commandSendIntervalMs: number;
    readonly commandTtlMs: number;
    readonly socketReconnectDelayMs: number;
    readonly restoreRequestTimeoutMs: number;
    readonly restoreMaxAttempts: number;
  };
  readonly ai: {
    readonly warmupOnBoot: boolean;
    readonly modelWarmupTimeoutMs: number;
    readonly pipelineTimeoutMs: number;
    readonly transformersCacheDirectory: string;
    readonly transformersLocalModelPath: string;
    readonly transformersAllowRemoteModels: boolean;
    readonly transformersAllowLocalModels: boolean;
    readonly onnxWasmPath: string;
    readonly onnxThreadCount: number;
    readonly onnxProxyEnabled: boolean;
    readonly onnxDevice: OnnxDevicePreference;
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
    readonly localSentimentModel: string;
    readonly localTextGenerationModel: string;
    readonly localNpcDialogueModel: string;
    readonly localEmbeddingModel: string;
    readonly localSpeechToTextModel: string;
    readonly localTextToSpeechModel: string;
    readonly localSpeechToTextEnabled: boolean;
    readonly localTextToSpeechEnabled: boolean;
    readonly localEmbeddingsEnabled: boolean;
    readonly audioInputSampleRateHz: number;
    readonly audioUploadMaxBytes: number;
    readonly textToSpeechSpeakerEmbeddings: string;
  };
}

const DEFAULT_PORT = 3000;
const DEFAULT_RESPONSE_DELAY_MS = 180;
const DEFAULT_MAX_QUESTION_LENGTH = 240;
const DEFAULT_GAME_SESSION_STORE = "prisma";
const DEFAULT_GAME_SESSION_TTL_MS = 1000 * 60 * 60;
const DEFAULT_GAME_TICK_MS = 16;
const DEFAULT_GAME_PERSIST_INTERVAL_MS = 250;
const DEFAULT_GAME_SAVE_COOLDOWN_MS = 2500;
const DEFAULT_GAME_MAX_MOVE_PER_TICK = 12;
const DEFAULT_GAME_MAX_COMMANDS_PER_TICK = 6;
const DEFAULT_GAME_MAX_INTERACTIONS_PER_TICK = 3;
const DEFAULT_GAME_MAX_CHAT_COMMANDS_PER_WINDOW = 8;
const DEFAULT_GAME_CHAT_RATE_LIMIT_WINDOW_MS = 4_000;
const DEFAULT_GAME_MAX_CHAT_MESSAGE_LENGTH = 500;
const DEFAULT_GAME_VIEWPORT_WIDTH = 640;
const DEFAULT_GAME_VIEWPORT_HEIGHT = 360;
const DEFAULT_GAME_HUD_POLL_MS = 500;
const DEFAULT_GAME_HUD_RETRY_MS = 2000;
const DEFAULT_GAME_SESSION_RESUME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GAME_COMMAND_SEND_INTERVAL_MS = 50;
const DEFAULT_GAME_COMMAND_TTL_MS = 60_000;
const DEFAULT_GAME_SOCKET_RECONNECT_DELAY_MS = 1000;
const DEFAULT_GAME_RESTORE_REQUEST_TIMEOUT_MS = 5_000;
const DEFAULT_GAME_RESTORE_MAX_ATTEMPTS = 2;
const DEFAULT_GAME_DEFAULT_SCENE_ID = "teaHouse";
const DEFAULT_AI_WARMUP_ON_BOOT = false;
const DEFAULT_AI_MODEL_WARMUP_TIMEOUT_MS = 5000;
const DEFAULT_AI_PIPELINE_TIMEOUT_MS = 2500;
const DEFAULT_AI_TRANSFORMERS_CACHE_DIRECTORY = "./.cache/hf-models";
const DEFAULT_AI_TRANSFORMERS_LOCAL_MODEL_PATH = "./.cache/hf-models";
const DEFAULT_AI_ONNX_THREAD_COUNT = 2;
const DEFAULT_AI_AUDIO_INPUT_SAMPLE_RATE_HZ = 16_000;
const DEFAULT_AI_AUDIO_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;
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
const DEFAULT_AI_LOCAL_SENTIMENT_MODEL = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
const DEFAULT_AI_LOCAL_TEXT_GENERATION_MODEL = "Xenova/gpt2";
const DEFAULT_AI_LOCAL_NPC_DIALOGUE_MODEL = "Xenova/gpt2";
const DEFAULT_AI_LOCAL_EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const DEFAULT_AI_LOCAL_SPEECH_TO_TEXT_MODEL = "onnx-community/whisper-tiny.en";
const DEFAULT_AI_LOCAL_TEXT_TO_SPEECH_MODEL = "Xenova/speecht5_tts";
const DEFAULT_AI_LOCAL_TTS_SPEAKER_EMBEDDINGS =
  "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
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
const DEFAULT_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
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

/**
 * Renderer backend preference for the playable game client.
 */
export type RendererPreference = "webgpu" | "webgl";

/**
 * ONNX Runtime execution device preference.
 */
export type OnnxDevicePreference = "wasm" | "webgpu" | "cpu";

const parseRendererPreference = (value: string | undefined): RendererPreference => {
  if (value === "webgl") {
    return "webgl";
  }

  return "webgpu";
};

const parseOnnxDevice = (value: string | undefined): OnnxDevicePreference => {
  if (value === "webgpu" || value === "cpu") {
    return value;
  }

  return "wasm";
};

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
const resolvedApplicationName = Bun.env.APP_NAME ?? "Leaves of the Fallen Kingdom";
const resolvedApplicationVersion = Bun.env.APP_VERSION ?? "1.0.0";

export const appConfig: AppConfig = {
  applicationName: resolvedApplicationName,
  applicationVersion: resolvedApplicationVersion,
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
    rendererPreference: parseRendererPreference(Bun.env.RENDERER_PREFERENCE),
  },
  auth: {
    sessionCookieName: Bun.env.SESSION_COOKIE_NAME ?? DEFAULT_SESSION_COOKIE_NAME,
    sessionMaxAgeSeconds: parseInteger(
      Bun.env.SESSION_MAX_AGE_SECONDS,
      DEFAULT_SESSION_MAX_AGE_SECONDS,
      1,
    ),
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
    sessionPersistIntervalMs: parseInteger(
      Bun.env.GAME_SESSION_PERSIST_INTERVAL_MS,
      DEFAULT_GAME_PERSIST_INTERVAL_MS,
      1,
    ),
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
    maxChatCommandsPerWindow: parseInteger(
      Bun.env.GAME_MAX_CHAT_COMMANDS_PER_WINDOW,
      DEFAULT_GAME_MAX_CHAT_COMMANDS_PER_WINDOW,
      1,
    ),
    chatRateLimitWindowMs: parseInteger(
      Bun.env.GAME_CHAT_RATE_LIMIT_WINDOW_MS,
      DEFAULT_GAME_CHAT_RATE_LIMIT_WINDOW_MS,
      250,
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
    commandSendIntervalMs: parseInteger(
      Bun.env.GAME_COMMAND_SEND_INTERVAL_MS,
      DEFAULT_GAME_COMMAND_SEND_INTERVAL_MS,
      10,
    ),
    commandTtlMs: parseInteger(Bun.env.GAME_COMMAND_TTL_MS, DEFAULT_GAME_COMMAND_TTL_MS, 500),
    socketReconnectDelayMs: parseInteger(
      Bun.env.GAME_SOCKET_RECONNECT_DELAY_MS,
      DEFAULT_GAME_SOCKET_RECONNECT_DELAY_MS,
      100,
    ),
    restoreRequestTimeoutMs: parseInteger(
      Bun.env.GAME_RESTORE_REQUEST_TIMEOUT_MS,
      DEFAULT_GAME_RESTORE_REQUEST_TIMEOUT_MS,
      250,
    ),
    restoreMaxAttempts: parseInteger(
      Bun.env.GAME_RESTORE_MAX_ATTEMPTS,
      DEFAULT_GAME_RESTORE_MAX_ATTEMPTS,
      1,
    ),
  },
  ai: {
    warmupOnBoot: parseBoolean(Bun.env.AI_WARMUP_ON_BOOT, DEFAULT_AI_WARMUP_ON_BOOT),
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
    transformersLocalModelPath:
      Bun.env.AI_TRANSFORMERS_LOCAL_MODEL_PATH ?? DEFAULT_AI_TRANSFORMERS_LOCAL_MODEL_PATH,
    transformersAllowRemoteModels: parseBoolean(Bun.env.AI_ALLOW_REMOTE_MODELS, true),
    transformersAllowLocalModels: parseBoolean(Bun.env.AI_ALLOW_LOCAL_MODELS, true),
    onnxWasmPath: resolvedOnnxWasmPath,
    onnxThreadCount: parseInteger(Bun.env.AI_ONNX_THREAD_COUNT, DEFAULT_AI_ONNX_THREAD_COUNT, 1),
    onnxProxyEnabled: parseBoolean(Bun.env.AI_ONNX_PROXY_ENABLED, false),
    onnxDevice: parseOnnxDevice(Bun.env.AI_ONNX_DEVICE),
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
    localSentimentModel: Bun.env.AI_LOCAL_SENTIMENT_MODEL ?? DEFAULT_AI_LOCAL_SENTIMENT_MODEL,
    localTextGenerationModel:
      Bun.env.AI_LOCAL_TEXT_GENERATION_MODEL ?? DEFAULT_AI_LOCAL_TEXT_GENERATION_MODEL,
    localNpcDialogueModel:
      Bun.env.AI_LOCAL_NPC_DIALOGUE_MODEL ?? DEFAULT_AI_LOCAL_NPC_DIALOGUE_MODEL,
    localEmbeddingModel: Bun.env.AI_LOCAL_EMBEDDING_MODEL ?? DEFAULT_AI_LOCAL_EMBEDDING_MODEL,
    localSpeechToTextModel:
      Bun.env.AI_LOCAL_SPEECH_TO_TEXT_MODEL ?? DEFAULT_AI_LOCAL_SPEECH_TO_TEXT_MODEL,
    localTextToSpeechModel:
      Bun.env.AI_LOCAL_TEXT_TO_SPEECH_MODEL ?? DEFAULT_AI_LOCAL_TEXT_TO_SPEECH_MODEL,
    localSpeechToTextEnabled: parseBoolean(Bun.env.AI_LOCAL_STT_ENABLED, true),
    localTextToSpeechEnabled: parseBoolean(Bun.env.AI_LOCAL_TTS_ENABLED, true),
    localEmbeddingsEnabled: parseBoolean(Bun.env.AI_LOCAL_EMBEDDINGS_ENABLED, true),
    audioInputSampleRateHz: parseInteger(
      Bun.env.AI_AUDIO_INPUT_SAMPLE_RATE_HZ,
      DEFAULT_AI_AUDIO_INPUT_SAMPLE_RATE_HZ,
      8_000,
    ),
    audioUploadMaxBytes: parseInteger(
      Bun.env.AI_AUDIO_UPLOAD_MAX_BYTES,
      DEFAULT_AI_AUDIO_UPLOAD_MAX_BYTES,
      1_024,
    ),
    textToSpeechSpeakerEmbeddings:
      Bun.env.AI_LOCAL_TTS_SPEAKER_EMBEDDINGS ?? DEFAULT_AI_LOCAL_TTS_SPEAKER_EMBEDDINGS,
  },
};

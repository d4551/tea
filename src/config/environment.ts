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
  readonly runtime: {
    readonly nodeEnv: NodeEnvironment;
  };
  readonly bootstrap: {
    readonly supportedBunRange: string;
    readonly installBunVersion: string;
  };
  readonly database: {
    readonly url: string;
    readonly localDirectory: string | null;
  };
  readonly paths: {
    readonly builderUploadsDirectory: string;
    readonly aiCacheDirectory: string;
    readonly aiLocalModelDirectory: string;
    readonly publicAssetOutputDirectory: string;
    readonly playableGameOutputDirectory: string;
  };
  readonly builder: {
    readonly workerPollIntervalMs: number;
    readonly localAutomationOrigin: string;
    readonly automationProbeTimeoutMs: number;
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
    readonly resumeTokenSecret: string;
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
    readonly preferredProvider:
      | "auto"
      | "ollama"
      | "transformers"
      | "openai-compatible-local"
      | "openai-compatible-cloud";
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
    readonly openAiCompatible: {
      readonly local: {
        readonly enabled: boolean;
        readonly providerLabel: string;
        readonly baseUrl: string;
        readonly apiKey: string;
        readonly availabilityTimeoutMs: number;
        readonly chatModel: string;
        readonly embeddingModel?: string;
        readonly visionModel?: string;
      };
      readonly cloud: {
        readonly enabled: boolean;
        readonly providerLabel: string;
        readonly baseUrl: string;
        readonly apiKey: string;
        readonly availabilityTimeoutMs: number;
        readonly chatModel: string;
        readonly embeddingModel?: string;
        readonly visionModel?: string;
      };
    };
    readonly routing: {
      readonly defaultPolicy: "local-first";
      readonly cloudFallbackEnabled: boolean;
      readonly ragPersistence: "prisma";
    };
    readonly ragChunkSize: number;
    readonly ragChunkOverlap: number;
    readonly ragSearchLimit: number;
    readonly ragHashDimension: number;
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
const DEFAULT_AI_LOCAL_API_COMPATIBLE_PROVIDER_LABEL = "ramalama";
const DEFAULT_AI_LOCAL_API_COMPATIBLE_BASE_URL = "http://127.0.0.1:8080/v1";
const DEFAULT_AI_CLOUD_API_COMPATIBLE_PROVIDER_LABEL = "openai-compatible-cloud";
const DEFAULT_AI_CLOUD_API_COMPATIBLE_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_AI_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS = 3_000;
const DEFAULT_AI_LOCAL_SENTIMENT_MODEL = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
const DEFAULT_AI_LOCAL_TEXT_GENERATION_MODEL = "Xenova/gpt2";
const DEFAULT_AI_LOCAL_NPC_DIALOGUE_MODEL = "Xenova/gpt2";
const DEFAULT_AI_LOCAL_EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const DEFAULT_AI_LOCAL_SPEECH_TO_TEXT_MODEL = "onnx-community/whisper-tiny.en";
const DEFAULT_AI_LOCAL_TEXT_TO_SPEECH_MODEL = "Xenova/speecht5_tts";
const DEFAULT_AI_RAG_CHUNK_SIZE = 800;
const DEFAULT_AI_RAG_CHUNK_OVERLAP = 120;
const DEFAULT_AI_RAG_SEARCH_LIMIT = 5;
const DEFAULT_AI_RAG_HASH_DIMENSION = 64;
const DEFAULT_AI_LOCAL_TTS_SPEAKER_EMBEDDINGS =
  "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
const DEFAULT_PUBLIC_PREFIX = "/public";
const DEFAULT_ASSETS_PREFIX = "/assets";
const DEFAULT_RMMZ_PACK_PREFIX = "/rmmz-pack";
const DEFAULT_PUBLIC_DIRECTORY = "public";
const DEFAULT_ASSETS_DIRECTORY = "assets";
const DEFAULT_RMMZ_PACK_DIRECTORY = "LOTFK_RMMZ_Agentic_Pack";
const DEFAULT_DOCS_PATH = "/docs";
const DEFAULT_BUILDER_WORKER_POLL_INTERVAL_MS = 1_000;
const DEFAULT_BUILDER_AUTOMATION_PROBE_TIMEOUT_MS = 500;
const DEFAULT_PLAYABLE_GAME_MOUNT_PATH = "/game";
const DEFAULT_PLAYABLE_GAME_SOURCE_DIRECTORY = "public/game";
const DEFAULT_THEME = "silk";
const DEFAULT_MAX_CONTENT_WIDTH_CLASS = "max-w-6xl";
const DEFAULT_SESSION_COOKIE_NAME = "lotfk_session";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_ANSWER_HASH_MULTIPLIER = 7;
const DEFAULT_LOCALE: LocaleCode = "en-US";
const DEFAULT_SUPPORTED_BUN_RANGE = "1.3.x";
const DEFAULT_INSTALL_BUN_VERSION = "1.3.10";
const DEFAULT_BUILDER_UPLOADS_DIRECTORY = "uploads/builder";
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

const formatEnvError = (variableName: string, detail: string): Error =>
  new Error(`Invalid environment variable ${variableName}: ${detail}`);

/**
 * Parses an environment boolean in a strict and explicit way.
 *
 * @param value Raw environment value.
 * @param fallback Fallback when the value is missing.
 * @param variableName Environment variable name for error reporting.
 * @returns Parsed boolean value.
 */
export const parseBoolean = (
  value: string | undefined,
  fallback: boolean,
  variableName = "unknown",
): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw formatEnvError(variableName, `expected "true" or "false" but received "${value}"`);
};

/**
 * Parses an integer environment value and applies bounds.
 *
 * @param value Raw environment value.
 * @param fallback Fallback numeric value.
 * @param min Minimum allowed value.
 * @param variableName Environment variable name for error reporting.
 * @returns Parsed bounded integer.
 */
export const parseInteger = (
  value: string | undefined,
  fallback: number,
  min: number,
  variableName = "unknown",
): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw formatEnvError(variableName, `expected an integer but received "${value}"`);
  }

  if (parsed < min) {
    throw formatEnvError(variableName, `expected a value >= ${min} but received ${parsed}`);
  }

  return parsed;
};

const parseRequiredString = (value: string | undefined, variableName: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw formatEnvError(variableName, "value is required");
  }

  return value.trim();
};

const parseOptionalString = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const parseAbsoluteUrl = (value: string | undefined, variableName: string): string => {
  const raw = parseRequiredString(value, variableName);
  const parsed = new URL(raw);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw formatEnvError(variableName, `expected an http/https URL but received "${raw}"`);
  }

  if (parsed.hostname === "0.0.0.0") {
    throw formatEnvError(variableName, 'must not use "0.0.0.0" as the hostname');
  }

  return parsed.toString().replace(/\/$/u, "");
};

const parseConfiguredAbsoluteUrl = (
  value: string | undefined,
  fallback: string,
  variableName: string,
): string => parseAbsoluteUrl(value ?? fallback, variableName);

const resolveLocalDatabaseDirectory = (databaseUrl: string): string | null => {
  const normalized = databaseUrl.trim();
  const matchedPrefix = ["libsql:file:", "file:"].find((prefix) => normalized.startsWith(prefix));
  if (!matchedPrefix) {
    return null;
  }

  const pathPart = normalized.slice(matchedPrefix.length).split("?")[0]?.trim() ?? "";
  if (pathPart.length === 0) {
    return null;
  }

  const lastSlashIndex = pathPart.lastIndexOf("/");
  if (lastSlashIndex <= 0) {
    return ".";
  }

  return pathPart.slice(0, lastSlashIndex);
};

const resolvedHost = Bun.env.HOST ?? "0.0.0.0";
const resolvedPort = parseInteger(Bun.env.PORT, DEFAULT_PORT, 1, "PORT");
const resolvedDatabaseUrl = parseRequiredString(Bun.env.DATABASE_URL, "DATABASE_URL");
const resolvedAppOrigin = parseAbsoluteUrl(Bun.env.APP_ORIGIN, "APP_ORIGIN");
const resolvedBuilderLocalAutomationOrigin = parseAbsoluteUrl(
  Bun.env.BUILDER_LOCAL_AUTOMATION_ORIGIN ?? resolvedAppOrigin,
  Bun.env.BUILDER_LOCAL_AUTOMATION_ORIGIN ? "BUILDER_LOCAL_AUTOMATION_ORIGIN" : "APP_ORIGIN",
);

type GameSessionStoreMode = "prisma" | "memory";
type PreferredAiProvider =
  | "auto"
  | "ollama"
  | "transformers"
  | "openai-compatible-local"
  | "openai-compatible-cloud";
type NodeEnvironment = "development" | "test" | "production";

/**
 * Renderer backend preference for the playable game client.
 */
export type RendererPreference = "webgpu" | "webgl";

/**
 * ONNX Runtime execution device preference.
 */
export type OnnxDevicePreference = "wasm" | "webgpu" | "cpu";

const parseRendererPreference = (value: string | undefined): RendererPreference => {
  if (value === undefined) {
    return "webgpu";
  }
  if (value === "webgl") {
    return "webgl";
  }

  if (value === "webgpu") {
    return "webgpu";
  }

  throw formatEnvError(
    "RENDERER_PREFERENCE",
    `expected "webgpu" or "webgl" but received "${value}"`,
  );
};

const parseOnnxDevice = (value: string | undefined): OnnxDevicePreference => {
  if (value === undefined) {
    return "cpu";
  }

  if (value === "webgpu" || value === "cpu") {
    return value;
  }

  if (value === "wasm") {
    return "wasm";
  }

  throw formatEnvError(
    "AI_ONNX_DEVICE",
    `expected "cpu", "webgpu", or "wasm" but received "${value}"`,
  );
};

const parseGameSessionStore = (value: string | undefined): GameSessionStoreMode => {
  if (value === undefined) {
    return DEFAULT_GAME_SESSION_STORE;
  }

  if (value === "memory") {
    return "memory";
  }

  if (value === "prisma") {
    return "prisma";
  }

  throw formatEnvError(
    "GAME_SESSION_STORE",
    `expected "prisma" or "memory" but received "${value}"`,
  );
};

const parsePreferredAiProvider = (value: string | undefined): PreferredAiProvider => {
  if (value === undefined) {
    return DEFAULT_AI_PREFERRED_PROVIDER;
  }

  if (
    value === "ollama" ||
    value === "transformers" ||
    value === "auto" ||
    value === "openai-compatible-local" ||
    value === "openai-compatible-cloud"
  ) {
    return value;
  }

  throw formatEnvError(
    "AI_PREFERRED_PROVIDER",
    `expected "auto", "ollama", "transformers", "openai-compatible-local", or "openai-compatible-cloud" but received "${value}"`,
  );
};

const parseNodeEnvironment = (value: string | undefined): NodeEnvironment => {
  if (value === undefined) {
    return "development";
  }

  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  throw formatEnvError(
    "NODE_ENV",
    `expected "development", "test", or "production" but received "${value}"`,
  );
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
  host: resolvedHost,
  port: resolvedPort,
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
  runtime: {
    nodeEnv: parseNodeEnvironment(Bun.env.NODE_ENV),
  },
  bootstrap: {
    supportedBunRange: Bun.env.BUN_SUPPORTED_RANGE ?? DEFAULT_SUPPORTED_BUN_RANGE,
    installBunVersion: Bun.env.BUN_INSTALL_VERSION ?? DEFAULT_INSTALL_BUN_VERSION,
  },
  database: {
    url: resolvedDatabaseUrl,
    localDirectory: resolveLocalDatabaseDirectory(resolvedDatabaseUrl),
  },
  paths: {
    builderUploadsDirectory: Bun.env.BUILDER_UPLOADS_DIRECTORY ?? DEFAULT_BUILDER_UPLOADS_DIRECTORY,
    aiCacheDirectory: Bun.env.AI_CACHE_DIRECTORY ?? DEFAULT_AI_TRANSFORMERS_CACHE_DIRECTORY,
    aiLocalModelDirectory:
      Bun.env.AI_LOCAL_MODEL_DIRECTORY ?? DEFAULT_AI_TRANSFORMERS_LOCAL_MODEL_PATH,
    publicAssetOutputDirectory: resolvedPublicDirectory,
    playableGameOutputDirectory: resolvedPlayableGameSourceDirectory,
  },
  builder: {
    workerPollIntervalMs: parseInteger(
      Bun.env.BUILDER_WORKER_POLL_INTERVAL_MS,
      DEFAULT_BUILDER_WORKER_POLL_INTERVAL_MS,
      100,
      "BUILDER_WORKER_POLL_INTERVAL_MS",
    ),
    localAutomationOrigin: resolvedBuilderLocalAutomationOrigin,
    automationProbeTimeoutMs: parseInteger(
      Bun.env.BUILDER_AUTOMATION_PROBE_TIMEOUT_MS,
      DEFAULT_BUILDER_AUTOMATION_PROBE_TIMEOUT_MS,
      100,
      "BUILDER_AUTOMATION_PROBE_TIMEOUT_MS",
    ),
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
      "SESSION_MAX_AGE_SECONDS",
    ),
    resumeTokenSecret: parseRequiredString(
      Bun.env.SESSION_RESUME_TOKEN_SECRET,
      "SESSION_RESUME_TOKEN_SECRET",
    ),
  },
  oracle: {
    requireSession: parseBoolean(Bun.env.ORACLE_REQUIRE_SESSION, false, "ORACLE_REQUIRE_SESSION"),
    responseDelayMs: parseInteger(
      Bun.env.ORACLE_RESPONSE_DELAY_MS,
      DEFAULT_RESPONSE_DELAY_MS,
      0,
      "ORACLE_RESPONSE_DELAY_MS",
    ),
    maxQuestionLength: parseInteger(
      Bun.env.ORACLE_MAX_QUESTION_LENGTH,
      DEFAULT_MAX_QUESTION_LENGTH,
      1,
      "ORACLE_MAX_QUESTION_LENGTH",
    ),
    answerHashMultiplier: parseInteger(
      Bun.env.ORACLE_ANSWER_HASH_MULTIPLIER,
      DEFAULT_ANSWER_HASH_MULTIPLIER,
      1,
      "ORACLE_ANSWER_HASH_MULTIPLIER",
    ),
  },
  game: {
    sessionStore: parseGameSessionStore(Bun.env.GAME_SESSION_STORE),
    defaultSceneId: Bun.env.GAME_DEFAULT_SCENE_ID ?? DEFAULT_GAME_DEFAULT_SCENE_ID,
    sessionTtlMs: parseInteger(
      Bun.env.GAME_SESSION_TTL_MS,
      DEFAULT_GAME_SESSION_TTL_MS,
      1000,
      "GAME_SESSION_TTL_MS",
    ),
    tickMs: parseInteger(Bun.env.GAME_TICK_MS, DEFAULT_GAME_TICK_MS, 1, "GAME_TICK_MS"),
    sessionPersistIntervalMs: parseInteger(
      Bun.env.GAME_SESSION_PERSIST_INTERVAL_MS,
      DEFAULT_GAME_PERSIST_INTERVAL_MS,
      1,
      "GAME_SESSION_PERSIST_INTERVAL_MS",
    ),
    saveCooldownMs: parseInteger(
      Bun.env.GAME_SAVE_COOLDOWN_MS,
      DEFAULT_GAME_SAVE_COOLDOWN_MS,
      0,
      "GAME_SAVE_COOLDOWN_MS",
    ),
    maxMovePerTick: parseInteger(
      Bun.env.GAME_MAX_MOVE_PER_TICK,
      DEFAULT_GAME_MAX_MOVE_PER_TICK,
      1,
      "GAME_MAX_MOVE_PER_TICK",
    ),
    maxCommandsPerTick: parseInteger(
      Bun.env.GAME_MAX_COMMANDS_PER_TICK,
      DEFAULT_GAME_MAX_COMMANDS_PER_TICK,
      1,
      "GAME_MAX_COMMANDS_PER_TICK",
    ),
    maxInteractionsPerTick: parseInteger(
      Bun.env.GAME_MAX_INTERACTIONS_PER_TICK,
      DEFAULT_GAME_MAX_INTERACTIONS_PER_TICK,
      1,
      "GAME_MAX_INTERACTIONS_PER_TICK",
    ),
    maxChatCommandsPerWindow: parseInteger(
      Bun.env.GAME_MAX_CHAT_COMMANDS_PER_WINDOW,
      DEFAULT_GAME_MAX_CHAT_COMMANDS_PER_WINDOW,
      1,
      "GAME_MAX_CHAT_COMMANDS_PER_WINDOW",
    ),
    chatRateLimitWindowMs: parseInteger(
      Bun.env.GAME_CHAT_RATE_LIMIT_WINDOW_MS,
      DEFAULT_GAME_CHAT_RATE_LIMIT_WINDOW_MS,
      250,
      "GAME_CHAT_RATE_LIMIT_WINDOW_MS",
    ),
    maxChatMessageLength: parseInteger(
      Bun.env.GAME_MAX_CHAT_MESSAGE_LENGTH,
      DEFAULT_GAME_MAX_CHAT_MESSAGE_LENGTH,
      1,
      "GAME_MAX_CHAT_MESSAGE_LENGTH",
    ),
    viewportWidth: parseInteger(
      Bun.env.GAME_VIEWPORT_WIDTH,
      DEFAULT_GAME_VIEWPORT_WIDTH,
      1,
      "GAME_VIEWPORT_WIDTH",
    ),
    viewportHeight: parseInteger(
      Bun.env.GAME_VIEWPORT_HEIGHT,
      DEFAULT_GAME_VIEWPORT_HEIGHT,
      1,
      "GAME_VIEWPORT_HEIGHT",
    ),
    hudPollIntervalMs: parseInteger(
      Bun.env.GAME_HUD_POLL_INTERVAL_MS,
      DEFAULT_GAME_HUD_POLL_MS,
      100,
      "GAME_HUD_POLL_INTERVAL_MS",
    ),
    hudRetryDelayMs: parseInteger(
      Bun.env.GAME_HUD_RETRY_MS,
      DEFAULT_GAME_HUD_RETRY_MS,
      0,
      "GAME_HUD_RETRY_MS",
    ),
    sessionPurgeIntervalMs: parseInteger(
      Bun.env.GAME_SESSION_PURGE_INTERVAL_MS,
      60_000,
      1000,
      "GAME_SESSION_PURGE_INTERVAL_MS",
    ),
    sessionResumeWindowMs: parseInteger(
      Bun.env.GAME_SESSION_RESUME_WINDOW_MS,
      DEFAULT_GAME_SESSION_RESUME_WINDOW_MS,
      1000,
      "GAME_SESSION_RESUME_WINDOW_MS",
    ),
    commandSendIntervalMs: parseInteger(
      Bun.env.GAME_COMMAND_SEND_INTERVAL_MS,
      DEFAULT_GAME_COMMAND_SEND_INTERVAL_MS,
      10,
      "GAME_COMMAND_SEND_INTERVAL_MS",
    ),
    commandTtlMs: parseInteger(
      Bun.env.GAME_COMMAND_TTL_MS,
      DEFAULT_GAME_COMMAND_TTL_MS,
      500,
      "GAME_COMMAND_TTL_MS",
    ),
    socketReconnectDelayMs: parseInteger(
      Bun.env.GAME_SOCKET_RECONNECT_DELAY_MS,
      DEFAULT_GAME_SOCKET_RECONNECT_DELAY_MS,
      100,
      "GAME_SOCKET_RECONNECT_DELAY_MS",
    ),
    restoreRequestTimeoutMs: parseInteger(
      Bun.env.GAME_RESTORE_REQUEST_TIMEOUT_MS,
      DEFAULT_GAME_RESTORE_REQUEST_TIMEOUT_MS,
      250,
      "GAME_RESTORE_REQUEST_TIMEOUT_MS",
    ),
    restoreMaxAttempts: parseInteger(
      Bun.env.GAME_RESTORE_MAX_ATTEMPTS,
      DEFAULT_GAME_RESTORE_MAX_ATTEMPTS,
      1,
      "GAME_RESTORE_MAX_ATTEMPTS",
    ),
  },
  ai: {
    warmupOnBoot: parseBoolean(
      Bun.env.AI_WARMUP_ON_BOOT,
      DEFAULT_AI_WARMUP_ON_BOOT,
      "AI_WARMUP_ON_BOOT",
    ),
    modelWarmupTimeoutMs: parseInteger(
      Bun.env.AI_MODEL_WARMUP_TIMEOUT_MS,
      DEFAULT_AI_MODEL_WARMUP_TIMEOUT_MS,
      500,
      "AI_MODEL_WARMUP_TIMEOUT_MS",
    ),
    pipelineTimeoutMs: parseInteger(
      Bun.env.AI_PIPELINE_TIMEOUT_MS,
      DEFAULT_AI_PIPELINE_TIMEOUT_MS,
      500,
      "AI_PIPELINE_TIMEOUT_MS",
    ),
    transformersCacheDirectory:
      Bun.env.AI_TRANSFORMERS_CACHE_DIR ?? DEFAULT_AI_TRANSFORMERS_CACHE_DIRECTORY,
    transformersLocalModelPath:
      Bun.env.AI_TRANSFORMERS_LOCAL_MODEL_PATH ?? DEFAULT_AI_TRANSFORMERS_LOCAL_MODEL_PATH,
    transformersAllowRemoteModels: parseBoolean(
      Bun.env.AI_ALLOW_REMOTE_MODELS,
      true,
      "AI_ALLOW_REMOTE_MODELS",
    ),
    transformersAllowLocalModels: parseBoolean(
      Bun.env.AI_ALLOW_LOCAL_MODELS,
      true,
      "AI_ALLOW_LOCAL_MODELS",
    ),
    onnxWasmPath: resolvedOnnxWasmPath,
    onnxThreadCount: parseInteger(
      Bun.env.AI_ONNX_THREAD_COUNT,
      DEFAULT_AI_ONNX_THREAD_COUNT,
      1,
      "AI_ONNX_THREAD_COUNT",
    ),
    onnxProxyEnabled: parseBoolean(Bun.env.AI_ONNX_PROXY_ENABLED, false, "AI_ONNX_PROXY_ENABLED"),
    onnxDevice: parseOnnxDevice(Bun.env.AI_ONNX_DEVICE),
    ollamaBaseUrl: Bun.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL,
    ollamaEnabled: parseBoolean(Bun.env.OLLAMA_ENABLED, true, "OLLAMA_ENABLED"),
    ollamaChatModel: Bun.env.OLLAMA_CHAT_MODEL ?? DEFAULT_OLLAMA_CHAT_MODEL,
    ollamaVisionModel: Bun.env.OLLAMA_VISION_MODEL ?? DEFAULT_OLLAMA_VISION_MODEL,
    ollamaTimeoutMs: parseInteger(
      Bun.env.OLLAMA_TIMEOUT_MS,
      DEFAULT_OLLAMA_TIMEOUT_MS,
      1000,
      "OLLAMA_TIMEOUT_MS",
    ),
    ollamaKeepAliveMs: parseInteger(
      Bun.env.OLLAMA_KEEP_ALIVE_MS,
      DEFAULT_OLLAMA_KEEP_ALIVE_MS,
      0,
      "OLLAMA_KEEP_ALIVE_MS",
    ),
    preferredProvider: parsePreferredAiProvider(Bun.env.AI_PREFERRED_PROVIDER),
    capabilityRefreshIntervalMs: parseInteger(
      Bun.env.AI_CAPABILITY_REFRESH_INTERVAL_MS,
      DEFAULT_AI_CAPABILITY_REFRESH_INTERVAL_MS,
      5000,
      "AI_CAPABILITY_REFRESH_INTERVAL_MS",
    ),
    ollamaAvailabilityTimeoutMs: parseInteger(
      Bun.env.OLLAMA_AVAILABILITY_TIMEOUT_MS,
      3_000,
      500,
      "OLLAMA_AVAILABILITY_TIMEOUT_MS",
    ),
    requestTimeoutMs: parseInteger(
      Bun.env.AI_REQUEST_TIMEOUT_MS,
      DEFAULT_AI_REQUEST_TIMEOUT_MS,
      500,
      "AI_REQUEST_TIMEOUT_MS",
    ),
    commandRetryBudgetMs: parseInteger(
      Bun.env.AI_COMMAND_RETRY_BUDGET_MS,
      DEFAULT_AI_COMMAND_RETRY_BUDGET_MS,
      1_000,
      "AI_COMMAND_RETRY_BUDGET_MS",
    ),
    retryBackoffBaseMs: parseInteger(
      Bun.env.AI_RETRY_BACKOFF_BASE_MS,
      DEFAULT_AI_RETRY_BACKOFF_BASE_MS,
      50,
      "AI_RETRY_BACKOFF_BASE_MS",
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
    localSpeechToTextEnabled: parseBoolean(
      Bun.env.AI_LOCAL_STT_ENABLED,
      true,
      "AI_LOCAL_STT_ENABLED",
    ),
    localTextToSpeechEnabled: parseBoolean(
      Bun.env.AI_LOCAL_TTS_ENABLED,
      true,
      "AI_LOCAL_TTS_ENABLED",
    ),
    localEmbeddingsEnabled: parseBoolean(
      Bun.env.AI_LOCAL_EMBEDDINGS_ENABLED,
      true,
      "AI_LOCAL_EMBEDDINGS_ENABLED",
    ),
    openAiCompatible: {
      local: {
        enabled: parseBoolean(
          Bun.env.AI_LOCAL_API_COMPATIBLE_ENABLED,
          false,
          "AI_LOCAL_API_COMPATIBLE_ENABLED",
        ),
        providerLabel:
          parseOptionalString(Bun.env.AI_LOCAL_API_COMPATIBLE_PROVIDER_LABEL) ??
          DEFAULT_AI_LOCAL_API_COMPATIBLE_PROVIDER_LABEL,
        baseUrl: parseConfiguredAbsoluteUrl(
          Bun.env.AI_LOCAL_API_COMPATIBLE_BASE_URL,
          DEFAULT_AI_LOCAL_API_COMPATIBLE_BASE_URL,
          "AI_LOCAL_API_COMPATIBLE_BASE_URL",
        ),
        apiKey: parseOptionalString(Bun.env.AI_LOCAL_API_COMPATIBLE_API_KEY) ?? "",
        availabilityTimeoutMs: parseInteger(
          Bun.env.AI_LOCAL_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS,
          DEFAULT_AI_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS,
          1,
          "AI_LOCAL_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS",
        ),
        chatModel:
          parseOptionalString(Bun.env.AI_LOCAL_API_COMPATIBLE_CHAT_MODEL) ??
          DEFAULT_OLLAMA_CHAT_MODEL,
        embeddingModel: parseOptionalString(Bun.env.AI_LOCAL_API_COMPATIBLE_EMBEDDING_MODEL),
        visionModel: parseOptionalString(Bun.env.AI_LOCAL_API_COMPATIBLE_VISION_MODEL),
      },
      cloud: {
        enabled: parseBoolean(
          Bun.env.AI_CLOUD_API_COMPATIBLE_ENABLED,
          false,
          "AI_CLOUD_API_COMPATIBLE_ENABLED",
        ),
        providerLabel:
          parseOptionalString(Bun.env.AI_CLOUD_API_COMPATIBLE_PROVIDER_LABEL) ??
          DEFAULT_AI_CLOUD_API_COMPATIBLE_PROVIDER_LABEL,
        baseUrl: parseConfiguredAbsoluteUrl(
          Bun.env.AI_CLOUD_API_COMPATIBLE_BASE_URL,
          DEFAULT_AI_CLOUD_API_COMPATIBLE_BASE_URL,
          "AI_CLOUD_API_COMPATIBLE_BASE_URL",
        ),
        apiKey: parseOptionalString(Bun.env.AI_CLOUD_API_COMPATIBLE_API_KEY) ?? "",
        availabilityTimeoutMs: parseInteger(
          Bun.env.AI_CLOUD_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS,
          DEFAULT_AI_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS,
          1,
          "AI_CLOUD_API_COMPATIBLE_AVAILABILITY_TIMEOUT_MS",
        ),
        chatModel:
          parseOptionalString(Bun.env.AI_CLOUD_API_COMPATIBLE_CHAT_MODEL) ?? "gpt-4.1-mini",
        embeddingModel:
          parseOptionalString(Bun.env.AI_CLOUD_API_COMPATIBLE_EMBEDDING_MODEL) ??
          "text-embedding-3-small",
        visionModel:
          parseOptionalString(Bun.env.AI_CLOUD_API_COMPATIBLE_VISION_MODEL) ?? "gpt-4.1-mini",
      },
    },
    routing: {
      defaultPolicy: "local-first",
      cloudFallbackEnabled: parseBoolean(
        Bun.env.AI_CLOUD_FALLBACK_ENABLED,
        true,
        "AI_CLOUD_FALLBACK_ENABLED",
      ),
      ragPersistence: "prisma",
    },
    ragChunkSize: parseInteger(
      Bun.env.AI_RAG_CHUNK_SIZE,
      DEFAULT_AI_RAG_CHUNK_SIZE,
      100,
      "AI_RAG_CHUNK_SIZE",
    ),
    ragChunkOverlap: parseInteger(
      Bun.env.AI_RAG_CHUNK_OVERLAP,
      DEFAULT_AI_RAG_CHUNK_OVERLAP,
      0,
      "AI_RAG_CHUNK_OVERLAP",
    ),
    ragSearchLimit: parseInteger(
      Bun.env.AI_RAG_SEARCH_LIMIT,
      DEFAULT_AI_RAG_SEARCH_LIMIT,
      1,
      "AI_RAG_SEARCH_LIMIT",
    ),
    ragHashDimension: parseInteger(
      Bun.env.AI_RAG_HASH_DIMENSION,
      DEFAULT_AI_RAG_HASH_DIMENSION,
      8,
      "AI_RAG_HASH_DIMENSION",
    ),
    audioInputSampleRateHz: parseInteger(
      Bun.env.AI_AUDIO_INPUT_SAMPLE_RATE_HZ,
      DEFAULT_AI_AUDIO_INPUT_SAMPLE_RATE_HZ,
      8_000,
      "AI_AUDIO_INPUT_SAMPLE_RATE_HZ",
    ),
    audioUploadMaxBytes: parseInteger(
      Bun.env.AI_AUDIO_UPLOAD_MAX_BYTES,
      DEFAULT_AI_AUDIO_UPLOAD_MAX_BYTES,
      1_024,
      "AI_AUDIO_UPLOAD_MAX_BYTES",
    ),
    textToSpeechSpeakerEmbeddings:
      Bun.env.AI_LOCAL_TTS_SPEAKER_EMBEDDINGS ?? DEFAULT_AI_LOCAL_TTS_SPEAKER_EMBEDDINGS,
  },
};

import type { LocaleCode } from "../../config/environment.ts";
import { appConfig } from "../../config/environment.ts";
import { resolveGameText } from "../../domain/game/data/game-text.ts";
import { gameScenes, gameSpriteManifests } from "../../domain/game/data/sprite-data.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type {
  GameErrorCode,
  GameLocale,
  GameResult,
  SceneDefinition,
  SpriteManifest,
} from "../../shared/contracts/game.ts";
import { validateGameCommand as validateGameCommandFromContracts } from "../../shared/contracts/game.ts";

/**
 * Runtime game configuration resolved from environment defaults and runtime-safe constants.
 */
export interface RuntimeGameConfig {
  /** Server session TTL in milliseconds. */
  readonly sessionTtlMs: number;
  /** Tick interval target in milliseconds. */
  readonly tickMs: number;
  /** Debounce window for save persistence requests. */
  readonly saveCooldownMs: number;
  /** Maximum player movement steps in px per command application. */
  readonly maxMovePerTick: number;
  /** Maximum commands accepted per single call boundary. */
  readonly maxCommandsPerTick: number;
  /** Maximum interactions accepted per tick. */
  readonly maxInteractionsPerTick: number;
  /** Maximum characters accepted in a chat message sent to an NPC. */
  readonly maxChatMessageLength: number;
  /** HUD polling interval in milliseconds. */
  readonly hudPollIntervalMs: number;
  /** SSE retry fallback in milliseconds. */
  readonly hudRetryDelayMs: number;
  /** Viewport width assumed for camera clamping (pixels). */
  readonly viewportWidth: number;
  /** Viewport height assumed for camera clamping (pixels). */
  readonly viewportHeight: number;
  /** Fallback locale for labels and dialogue when request locale is unsupported. */
  readonly fallbackLocale: GameLocale;
  /** Publicly mount point for game sprite/background assets. */
  readonly assetBasePath: string;
  /** Default scene identifier used for new sessions. */
  readonly defaultSceneId: string;
  /** Duration in milliseconds within which a session resume token stays valid. */
  readonly sessionResumeWindowMs: number;
}

/**
 * Contract between API/UI/game-engine boundary for config-driven runtime behavior.
 */
export interface GameContractValues {
  /** Shared engine config for game clients. */
  readonly engine: RuntimeGameConfig;
}

/**
 * Strictly validated default game runtime config.
 */
export const defaultGameConfig: RuntimeGameConfig = {
  sessionTtlMs: appConfig.game.sessionTtlMs,
  tickMs: appConfig.game.tickMs,
  saveCooldownMs: appConfig.game.saveCooldownMs,
  maxMovePerTick: appConfig.game.maxMovePerTick,
  maxCommandsPerTick: appConfig.game.maxCommandsPerTick,
  maxInteractionsPerTick: appConfig.game.maxInteractionsPerTick,
  maxChatMessageLength: appConfig.game.maxChatMessageLength,
  viewportWidth: appConfig.game.viewportWidth,
  viewportHeight: appConfig.game.viewportHeight,
  fallbackLocale: appConfig.defaultLocale,
  assetBasePath: appRoutes.gameAssets,
  defaultSceneId: appConfig.game.defaultSceneId,
  hudPollIntervalMs: appConfig.game.hudPollIntervalMs,
  hudRetryDelayMs: appConfig.game.hudRetryDelayMs,
  sessionResumeWindowMs: appConfig.game.sessionResumeWindowMs,
};

/**
 * Resolves a scene by identifier from canonical map data.
 *
 * @param sceneId Scene identifier.
 * @returns Scene definition or null when unavailable.
 */
export const resolveScene = (sceneId: string): SceneDefinition | null => {
  return gameScenes[sceneId] ?? null;
};

/**
 * Resolves sprite manifest by character key.
 *
 * @param characterKey Sprite character key.
 * @returns Sprite manifest or null when not found.
 */
export const resolveSpriteManifest = (characterKey: string): SpriteManifest | null => {
  return gameSpriteManifests[characterKey] ?? null;
};

/**
 * Validates inbound game commands before applying domain logic.
 *
 * @param payload Raw command payload from API boundary.
 * @param locale Locale for human-facing messages.
 * @returns Validated typed command or structured validation error.
 */
export const validateGameCommand = (
  payload: unknown,
  locale: LocaleCode,
): ReturnType<typeof validateGameCommandFromContracts> =>
  validateGameCommandFromContracts(payload, locale);

/**
 * Converts a typed game command result to API transport state.
 *
 * @param result Domain command result.
 * @returns Result passthrough placeholder for consistency with current contracts.
 */
export const normalizeGameResult = <TData>(result: GameResult<TData>): GameResult<TData> => result;

/**
 * Returns public game contract values for bootstrapping clients.
 *
 * @returns Typed contract map.
 */
export const getGameContractValues = (): GameContractValues => ({
  engine: defaultGameConfig,
});

/**
 * Resolves a localized game text value from catalog.
 *
 * @param locale Active locale.
 * @param key Locale key.
 * @returns Localized message.
 */
export const resolveGameTextByLocale = (locale: GameLocale, key: string): string => {
  return resolveGameText(locale, key);
};

/**
 * Creates a typed and transport-safe fallback game result.
 *
 * @param message Failure message.
 * @param errorCode Error code.
 * @returns Typed failure result.
 */
export const makeGameError = (
  errorCode: GameErrorCode,
  message: string,
): {
  readonly ok: false;
  readonly error: {
    readonly code: GameErrorCode;
    readonly message: string;
    readonly retryable: boolean;
  };
} => ({
  ok: false,
  error: {
    code: errorCode,
    message,
    retryable: false,
  },
});

/**
 * Creates a typed game success result.
 *
 * @param data Data payload.
 * @returns Typed success result.
 */
export const makeGameSuccess = <TData>(
  data: TData,
): {
  readonly ok: true;
  readonly data: TData;
} => ({
  ok: true,
  data,
});

/**
 * Reconstructs snapshot-like object for deterministic JSON transport tests.
 *
 * @param snapshot Input snapshot.
 * @returns Cloned snapshot.
 */
export const serializeSessionSnapshot = <T extends Record<string, unknown>>(snapshot: T): T =>
  JSON.parse(JSON.stringify(snapshot)) as T;

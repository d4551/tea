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
  /** Minimum cadence for persisting active session state. */
  readonly sessionPersistIntervalMs: number;
  /** Debounce window for save persistence requests. */
  readonly saveCooldownMs: number;
  /** Maximum player movement steps in px per command application. */
  readonly maxMovePerTick: number;
  /** Maximum commands accepted per single call boundary. */
  readonly maxCommandsPerTick: number;
  /** Maximum interactions accepted per tick. */
  readonly maxInteractionsPerTick: number;
  /** Maximum chat commands accepted in one rate-limit window. */
  readonly maxChatCommandsPerWindow: number;
  /** Sliding rate-limit window for chat commands in milliseconds. */
  readonly chatRateLimitWindowMs: number;
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
  /** Client keyboard movement command send interval in milliseconds. */
  readonly commandSendIntervalMs: number;
  /** Client command TTL fallback in milliseconds. */
  readonly commandTtlMs: number;
  /** Client websocket reconnect delay in milliseconds. */
  readonly socketReconnectDelayMs: number;
  /** Client restore request timeout in milliseconds. */
  readonly restoreRequestTimeoutMs: number;
  /** Maximum restore attempts before marking the session expired. */
  readonly restoreMaxAttempts: number;
  /** World time wrapping point in milliseconds to prevent float precision loss. */
  readonly worldTimeWrapMs: number;
  /** Damage multiplier applied to attacker stat in combat formula. */
  readonly combatDamageMultiplier: number;
  /** Base damage value applied to skill-type combat actions before mitigation. */
  readonly combatSkillBaseDamage: number;
  /** Maximum sprite atlas strip width in pixels before row wrapping. */
  readonly spriteAtlasMaxWidth: number;
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
  sessionPersistIntervalMs: appConfig.game.sessionPersistIntervalMs,
  saveCooldownMs: appConfig.game.saveCooldownMs,
  maxMovePerTick: appConfig.game.maxMovePerTick,
  maxCommandsPerTick: appConfig.game.maxCommandsPerTick,
  maxInteractionsPerTick: appConfig.game.maxInteractionsPerTick,
  maxChatCommandsPerWindow: appConfig.game.maxChatCommandsPerWindow,
  chatRateLimitWindowMs: appConfig.game.chatRateLimitWindowMs,
  maxChatMessageLength: appConfig.game.maxChatMessageLength,
  viewportWidth: appConfig.game.viewportWidth,
  viewportHeight: appConfig.game.viewportHeight,
  fallbackLocale: appConfig.defaultLocale,
  assetBasePath: appRoutes.gameAssets,
  defaultSceneId: appConfig.game.defaultSceneId,
  hudPollIntervalMs: appConfig.game.hudPollIntervalMs,
  hudRetryDelayMs: appConfig.game.hudRetryDelayMs,
  sessionResumeWindowMs: appConfig.game.sessionResumeWindowMs,
  commandSendIntervalMs: appConfig.game.commandSendIntervalMs,
  commandTtlMs: appConfig.game.commandTtlMs,
  socketReconnectDelayMs: appConfig.game.socketReconnectDelayMs,
  restoreRequestTimeoutMs: appConfig.game.restoreRequestTimeoutMs,
  restoreMaxAttempts: appConfig.game.restoreMaxAttempts,
  worldTimeWrapMs: appConfig.game.worldTimeWrapMs,
  combatDamageMultiplier: appConfig.game.combatDamageMultiplier,
  combatSkillBaseDamage: appConfig.game.combatSkillBaseDamage,
  spriteAtlasMaxWidth: appConfig.game.spriteAtlasMaxWidth,
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

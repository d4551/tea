import type { LocaleCode } from "../../config/environment.ts";

/**
 * Canonical locale identifier used for request and UI contracts.
 */
export type LocaleId = LocaleCode;

/**
 * Structured locale negotiation summary attached to request context.
 */
export interface LocaleConfig {
  /** Resolved locale used for this request. */
  readonly locale: LocaleId;
  /** Fallback locale if no explicit locale was matched. */
  readonly fallbackLocale: LocaleId;
  /** Active locale source. */
  readonly source: "override" | "query" | "accept-language" | "default";
  /** Raw locale string supplied by caller, when present. */
  readonly requestedLocale: string | null;
  /** Source language catalog used by negotiations. */
  readonly supportedLocales: readonly LocaleId[];
}

/**
 * Canonical UI state machine used across server-rendered fragments.
 */
export type UiErrorState = "error-retryable" | "error-non-retryable";

/**
 * Canonical UI state machine used across server-rendered fragments.
 *
 * @remarks
 * Flow contract:
 * `idle → loading → success | empty | error-retryable | error-non-retryable | unauthorized`.
 */
export type UiState = "idle" | "loading" | "success" | "empty" | UiErrorState | "unauthorized";

/**
 * Structured typed result for boundary-level propagation.
 *
 * @template TData Success payload type.
 * @template TError Error payload type.
 */
export type Result<TData, TError extends string = string> =
  | SuccessResult<TData>
  | FailureResult<TError>;

/**
 * Typed success result in the Result envelope.
 */
export interface SuccessResult<TData> {
  /** Indicates payload is valid. */
  readonly ok: true;
  /** Data returned from operation.
   * This value is guaranteed to be present when `ok` is true.
   */
  readonly data: TData;
}

/**
 * Typed failure result in the Result envelope.
 */
export interface FailureResult<TError extends string = string> {
  /** Indicates operation failed in a typed way. */
  readonly ok: false;
  /** Typed failure marker.
   * Keep as domain-specific stable string values for deterministic rendering.
   */
  readonly error: TError;
}

/**
 * Type guard for a successful Result.
 *
 * @param result Result envelope.
 * @returns True when result is success.
 */
export const isResultOk = <TData, TError extends string>(
  result: Result<TData, TError>,
): result is SuccessResult<TData> => result.ok;

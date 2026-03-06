import type { LocaleCode } from "../../config/environment.ts";

/**
 * Oracle behavior mode used for deterministic state validation.
 */
export type OracleMode =
  | "auto"
  | "force-empty"
  | "force-retryable-error"
  | "force-fatal-error"
  | "force-unauthorized";

/**
 * Oracle request payload.
 */
export interface OracleRequest {
  readonly question: string;
  readonly locale: LocaleCode;
  readonly mode: OracleMode;
  readonly hasSession: boolean;
}

/**
 * Successful oracle outcome.
 */
export interface OracleSuccessState {
  readonly state: "success";
  readonly answer: string;
}

/**
 * Empty oracle outcome.
 */
export interface OracleEmptyState {
  readonly state: "empty";
  readonly message: string;
}

/**
 * Retryable failure oracle outcome.
 */
export interface OracleRetryableErrorState {
  readonly state: "error";
  readonly retryable: true;
  readonly message: string;
}

/**
 * Non-retryable failure oracle outcome.
 */
export interface OracleFatalErrorState {
  readonly state: "error";
  readonly retryable: false;
  readonly message: string;
}

/**
 * Unauthorized oracle outcome.
 */
export interface OracleUnauthorizedState {
  readonly state: "unauthorized";
  readonly message: string;
}

/**
 * Union of all oracle outcomes.
 */
export type OracleOutcome =
  | OracleSuccessState
  | OracleEmptyState
  | OracleRetryableErrorState
  | OracleFatalErrorState
  | OracleUnauthorizedState;

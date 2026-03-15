/**
 * Successful async operation result.
 *
 * @template TValue Resolved value type.
 */
export interface AsyncSuccessResult<TValue> {
  /** Indicates the async operation completed successfully. */
  readonly ok: true;
  /** Resolved value from the async operation. */
  readonly value: TValue;
}

/**
 * Failed async operation result.
 */
export interface AsyncFailureResult {
  /** Indicates the async operation failed. */
  readonly ok: false;
  /** Normalized error instance. */
  readonly error: Error;
}

/**
 * Typed result envelope for async operations that may reject.
 *
 * @template TValue Resolved value type.
 */
export type AsyncResult<TValue> = AsyncSuccessResult<TValue> | AsyncFailureResult;

/**
 * Normalizes any thrown value into an Error instance.
 *
 * @param error Unknown thrown value.
 * @returns Stable Error instance.
 */
export const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

/**
 * Successful synchronous operation result.
 *
 * @template TValue Resolved value type.
 */
export interface SyncSuccessResult<TValue> {
  readonly ok: true;
  readonly value: TValue;
}

/**
 * Failed synchronous operation result.
 */
export interface SyncFailureResult {
  readonly ok: false;
  readonly error: Error;
}

/**
 * Typed result envelope for sync operations that may throw.
 *
 * @template TValue Resolved value type.
 */
export type SyncResult<TValue> = SyncSuccessResult<TValue> | SyncFailureResult;

/**
 * Wraps a synchronous throwing function in a result envelope.
 * Use only at boundaries where exceptions must be converted to Result.
 *
 * @param fn Synchronous function that may throw.
 * @returns Structured sync result.
 */
export const resultFromSync = <TValue>(fn: () => TValue): SyncResult<TValue> => {
  try {
    return { ok: true, value: fn() };
  } catch (error: unknown) {
    return { ok: false, error: toError(error) };
  }
};

/**
 * Resolves an async operation into a typed result envelope.
 *
 * @param operation Promise-producing operation.
 * @returns Structured async result without leaking rejections into feature code.
 */
export const settleAsync = <TValue>(operation: Promise<TValue>): Promise<AsyncResult<TValue>> =>
  operation.then(
    (value: TValue) => ({
      ok: true,
      value,
    }),
    (error: unknown) => ({
      ok: false,
      error: toError(error),
    }),
  );

/**
 * Reads a JSON response body into a typed result envelope.
 *
 * @template TValue Parsed JSON payload type.
 * @param response HTTP response.
 * @returns Parsed JSON result.
 */
export const readJsonResponse = <TValue>(response: Response): Promise<AsyncResult<TValue>> =>
  settleAsync(response.json().then((value): TValue => value));

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
 * Resolves an async operation into a typed result envelope.
 *
 * @param operation Promise-producing operation.
 * @returns Structured async result without leaking rejections into feature code.
 */
export const settleAsync = async <TValue>(
  operation: Promise<TValue>,
): Promise<AsyncResult<TValue>> => {
  try {
    return {
      ok: true,
      value: await operation,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: toError(error),
    };
  }
};

/**
 * Reads a JSON response body into a typed result envelope.
 *
 * @template TValue Parsed JSON payload type.
 * @param response HTTP response.
 * @returns Parsed JSON result.
 */
export const readJsonResponse = async <TValue>(response: Response): Promise<AsyncResult<TValue>> =>
  settleAsync(response.json() as Promise<TValue>);

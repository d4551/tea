/**
 * Stable source classification for external-boundary failures.
 */
export type ExternalFailureSource = "provider" | "database" | "runtime" | "http";

/**
 * Stable error-code vocabulary for external-boundary failures.
 */
export type ExternalFailureCode =
  | "auth"
  | "timeout"
  | "cancelled"
  | "validation"
  | "conflict"
  | "not-found"
  | "unsupported"
  | "unavailable"
  | "network"
  | "invalid-response"
  | "unexpected";

/**
 * Typed failure record for provider, runtime, and persistence boundaries.
 */
export interface ExternalFailure {
  /** Owning external boundary. */
  readonly source: ExternalFailureSource;
  /** Stable failure code for deterministic branching. */
  readonly code: ExternalFailureCode;
  /** Human-readable diagnostic message. */
  readonly message: string;
  /** Whether the caller may retry the operation. */
  readonly retryable: boolean;
  /** Optional provider or subsystem label. */
  readonly provider?: string;
  /** Optional operation label used in logs and tests. */
  readonly operation?: string;
  /** Optional HTTP status code when failure came from a response. */
  readonly statusCode?: number;
}

/**
 * Successful external-boundary result.
 *
 * @template TData Success payload type.
 */
export interface ExternalSuccessResult<TData> {
  /** Indicates the external operation succeeded. */
  readonly ok: true;
  /** Successful payload. */
  readonly data: TData;
}

/**
 * Failed external-boundary result.
 */
export interface ExternalFailureResult {
  /** Indicates the external operation failed. */
  readonly ok: false;
  /** Normalized failure record. */
  readonly failure: ExternalFailure;
}

/**
 * Typed result contract for external-boundary operations.
 *
 * @template TData Success payload type.
 */
export type ExternalBoundaryResult<TData> = ExternalSuccessResult<TData> | ExternalFailureResult;

/**
 * Creates a successful external-boundary result.
 *
 * @template TData Success payload type.
 * @param data Success payload.
 * @returns Success result.
 */
export const externalSuccess = <TData>(data: TData): ExternalSuccessResult<TData> => ({
  ok: true,
  data,
});

/**
 * Creates a failed external-boundary result.
 *
 * @param failure Failure payload.
 * @returns Failure result.
 */
export const externalFailure = (failure: ExternalFailure): ExternalFailureResult => ({
  ok: false,
  failure,
});

/**
 * Detects abort-like runtime errors, including timeout-driven aborts.
 *
 * @param error Normalized error instance.
 * @returns True when the error indicates a cancelled or timed-out operation.
 */
export const isAbortLikeError = (error: Error): boolean =>
  error.name === "AbortError" || /aborted|timed out/iu.test(error.message);

/**
 * Maps an unknown thrown value to a normalized external failure.
 *
 * @param input Failure mapping input.
 * @returns Typed external failure.
 */
export const toExternalFailure = (input: {
  readonly source: ExternalFailureSource;
  readonly error: unknown;
  readonly message?: string;
  readonly provider?: string;
  readonly operation?: string;
  readonly fallbackCode?: ExternalFailureCode;
  readonly retryable?: boolean;
}): ExternalFailure => {
  const normalized =
    input.error instanceof Error ? input.error : new Error(String(input.error ?? "Unknown error"));
  const timeoutLike = normalized.name === "AbortError" || /timed out/iu.test(normalized.message);
  const cancelledLike = !timeoutLike && isAbortLikeError(normalized);
  const code = timeoutLike
    ? "timeout"
    : cancelledLike
      ? "cancelled"
      : (input.fallbackCode ?? "unexpected");

  return {
    source: input.source,
    code,
    message: input.message ?? normalized.message,
    retryable: input.retryable ?? (timeoutLike || cancelledLike || code === "network"),
    provider: input.provider,
    operation: input.operation,
  };
};

/**
 * Maps an HTTP response status into a normalized external failure.
 *
 * @param input HTTP failure mapping input.
 * @returns Typed external failure.
 */
export const createHttpExternalFailure = (input: {
  readonly source: ExternalFailureSource;
  readonly response: Response;
  readonly message: string;
  readonly provider?: string;
  readonly operation?: string;
}): ExternalFailure => {
  const { response } = input;
  const code: ExternalFailureCode =
    response.status === 400 || response.status === 422
      ? "validation"
      : response.status === 401 || response.status === 403
        ? "auth"
        : response.status === 404
          ? "not-found"
          : response.status === 408
            ? "timeout"
            : response.status === 409
              ? "conflict"
              : response.status === 429 || response.status >= 500
                ? "unavailable"
                : "unexpected";

  return {
    source: input.source,
    code,
    message: input.message,
    retryable:
      response.status === 408 ||
      response.status === 409 ||
      response.status === 429 ||
      response.status >= 500,
    provider: input.provider,
    operation: input.operation,
    statusCode: response.status,
  };
};

/**
 * Converts an external failure into the legacy retryable string envelope used by
 * AI-provider response types.
 *
 * @param failure External failure record.
 * @returns Legacy retryable error envelope.
 */
export const toRetryableError = (
  failure: ExternalFailure,
): { readonly ok: false; readonly error: string; readonly retryable: boolean } => ({
  ok: false,
  error: failure.message,
  retryable: failure.retryable,
});

/**
 * Canonical application error code list.
 */
export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "SESSION_MISSING"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "NOT_FOUND"
  | "INVALID_COMMAND"
  | "CONFLICT"
  | "AI_PROVIDER_FAILURE"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

/**
 * Higher-level error category for client behavior mapping.
 */
export type AppErrorCategory =
  | "validation"
  | "auth"
  | "session"
  | "command"
  | "external"
  | "system";

const codeToCategory = (code: AppErrorCode): AppErrorCategory => {
  switch (code) {
    case "VALIDATION_ERROR":
    case "INVALID_COMMAND":
      return "validation";
    case "CONFLICT":
      return "command";
    case "UNAUTHORIZED":
      return "auth";
    case "SESSION_MISSING":
    case "SESSION_NOT_FOUND":
    case "SESSION_EXPIRED":
      return "session";
    case "AI_PROVIDER_FAILURE":
    case "UPSTREAM_ERROR":
      return "external";
    default:
      return "system";
  }
};

/**
 * Domain-level application error with typed code, status, and retryability.
 */
export class ApplicationError extends Error {
  /**
   * Error code used by API/UI mapping.
   */
  public readonly code: AppErrorCode;

  /** Category used for UI state mapping. */
  public readonly category: AppErrorCategory;

  /**
   * HTTP status associated with the error.
   */
  public readonly status: number;

  /**
   * Indicates if retrying the operation can succeed.
   */
  public readonly retryable: boolean;

  /**
   * Builds a typed application error.
   *
   * @param code App-specific error code.
   * @param message Human-readable error message.
   * @param status HTTP status code.
   * @param retryable Retryability marker.
   */
  public constructor(code: AppErrorCode, message: string, status: number, retryable: boolean) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.category = codeToCategory(code);
  }
}

/**
 * Shared error payload returned to API clients.
 */
export interface ErrorEnvelope {
  ok: false;
  error: {
    code: AppErrorCode;
    category: AppErrorCategory;
    message: string;
    retryable: boolean;
    correlationId: string;
  };
}

/**
 * Shared success payload returned to API clients.
 */
export interface SuccessEnvelope<TData> {
  ok: true;
  data: TData;
}

/**
 * Constructs a typed success envelope.
 *
 * @param data Response data.
 * @returns Success envelope.
 */
export const successEnvelope = <TData>(data: TData): SuccessEnvelope<TData> => ({
  ok: true,
  data,
});

/**
 * Constructs a typed error envelope.
 *
 * @param error Typed application error.
 * @param correlationId Request correlation ID.
 * @returns Error envelope.
 */
export const errorEnvelope = (error: ApplicationError, correlationId: string): ErrorEnvelope => ({
  ok: false,
  error: {
    code: error.code,
    category: error.category,
    message: error.message,
    retryable: error.retryable,
    correlationId,
  },
});

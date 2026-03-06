import type { MutableResponseHeaders } from "../lib/correlation-id.ts";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import { ApplicationError, type ErrorEnvelope, errorEnvelope } from "../lib/error-envelope.ts";
import { createLogger } from "../lib/logger.ts";
import { httpStatus } from "../shared/constants/http.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { resolveRequestI18n } from "../shared/i18n/translator.ts";

/**
 * Localized framework error message map.
 */
export type FrameworkErrorMessages = Messages["api"]["frameworkErrors"];

/**
 * Declarative error code → ApplicationError factory map.
 *
 * Each entry maps a framework error code to a function that
 * produces the corresponding application error from localized messages.
 */
const frameworkErrorFactories: Record<string, (m: FrameworkErrorMessages) => ApplicationError> = {
  VALIDATION: (m) =>
    new ApplicationError("VALIDATION_ERROR", m.validation, httpStatus.unprocessableEntity, false),
  PARSE: (m) =>
    new ApplicationError("VALIDATION_ERROR", m.validation, httpStatus.badRequest, false),
  NOT_FOUND: (m) => new ApplicationError("NOT_FOUND", m.notFound, httpStatus.notFound, false),
  SESSION_MISSING: (m) =>
    new ApplicationError("SESSION_MISSING", m.sessionMissing, httpStatus.badRequest, false),
  SESSION_NOT_FOUND: (m) =>
    new ApplicationError("SESSION_NOT_FOUND", m.notFound, httpStatus.notFound, false),
  SESSION_EXPIRED: (m) =>
    new ApplicationError("SESSION_EXPIRED", m.sessionExpired, httpStatus.gone, false),
  INVALID_COMMAND: (m) =>
    new ApplicationError(
      "INVALID_COMMAND",
      m.invalidCommand,
      httpStatus.unprocessableEntity,
      false,
    ),
  AI_PROVIDER_FAILURE: (m) =>
    new ApplicationError(
      "AI_PROVIDER_FAILURE",
      m.aiProviderFailure,
      httpStatus.serviceUnavailable,
      true,
    ),
};

/**
 * Converts Elysia framework errors to deterministic application errors.
 *
 * @param code Elysia error code.
 * @param messages Localized framework error messages.
 * @returns Application error mapping.
 */
export const mapFrameworkError = (
  code: string | number,
  messages: FrameworkErrorMessages,
): ApplicationError => {
  const factory = frameworkErrorFactories[String(code)];
  if (factory) return factory(messages);

  return new ApplicationError(
    "INTERNAL_ERROR",
    messages.internal,
    httpStatus.internalServerError,
    true,
  );
};

/**
 * Result shape for typed error envelope handling.
 */
export interface ErrorResponse {
  readonly status: number;
  readonly payload: ErrorEnvelope;
}

/**
 * Builds the canonical API error response with structured logging and correlation ID propagation.
 *
 * @param code Framework error code.
 * @param error Framework error object.
 * @param request Incoming request.
 * @param responseHeaders Mutable response headers.
 * @returns Status and payload for the error response.
 */
export const createErrorResponse = (
  code: string | number,
  error: Error,
  request: Request,
  responseHeaders: MutableResponseHeaders,
): ErrorResponse => {
  const correlationId = ensureCorrelationIdHeader(request, responseHeaders);
  const requestLogger = createLogger("http.error", correlationId);
  const { messages } = resolveRequestI18n(request);
  const frameworkMessages = messages.api.frameworkErrors;
  const appError =
    error instanceof ApplicationError ? error : mapFrameworkError(code, frameworkMessages);

  requestLogger.error("request.failed", {
    frameworkCode: String(code),
    code: appError.code,
    status: appError.status,
    retryable: appError.retryable,
    detail: appError.message,
  });

  return {
    status: appError.status,
    payload: errorEnvelope(appError, correlationId),
  };
};

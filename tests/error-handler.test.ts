import { describe, expect, test } from "bun:test";
import type { MutableResponseHeaders } from "../src/lib/correlation-id.ts";
import { ApplicationError } from "../src/lib/error-envelope.ts";
import {
  createErrorResponse,
  type FrameworkErrorMessages,
  mapFrameworkError,
} from "../src/plugins/error-handler.ts";
import { httpStatus } from "../src/shared/constants/http.ts";

/**
 * Error Handler plugin unit tests.
 *
 * Validates the deterministic mapping of Elysia framework error codes
 * to typed ApplicationError instances and canonical error response envelopes.
 */

const stubMessages: FrameworkErrorMessages = {
  validation: "Validation failed",
  notFound: "Not found",
  sessionMissing: "Session missing",
  sessionExpired: "Session expired",
  invalidCommand: "Invalid command",
  aiProviderFailure: "AI provider failure",
  internal: "Internal error",
};

describe("mapFrameworkError", () => {
  test("maps VALIDATION to 422 non-retryable error", () => {
    const result = mapFrameworkError("VALIDATION", stubMessages);
    expect(result).toBeInstanceOf(ApplicationError);
    expect(result.code).toBe("VALIDATION_ERROR");
    expect(result.status).toBe(httpStatus.unprocessableEntity);
    expect(result.retryable).toBe(false);
    expect(result.message).toBe("Validation failed");
  });

  test("maps PARSE to 400 non-retryable error", () => {
    const result = mapFrameworkError("PARSE", stubMessages);
    expect(result).toBeInstanceOf(ApplicationError);
    expect(result.code).toBe("VALIDATION_ERROR");
    expect(result.status).toBe(httpStatus.badRequest);
    expect(result.retryable).toBe(false);
  });

  test("maps NOT_FOUND to 404 non-retryable error", () => {
    const result = mapFrameworkError("NOT_FOUND", stubMessages);
    expect(result.code).toBe("NOT_FOUND");
    expect(result.status).toBe(httpStatus.notFound);
    expect(result.retryable).toBe(false);
  });

  test("maps SESSION_MISSING to 400 non-retryable error", () => {
    const result = mapFrameworkError("SESSION_MISSING", stubMessages);
    expect(result.code).toBe("SESSION_MISSING");
    expect(result.status).toBe(httpStatus.badRequest);
    expect(result.retryable).toBe(false);
  });

  test("maps SESSION_NOT_FOUND to 404 non-retryable error", () => {
    const result = mapFrameworkError("SESSION_NOT_FOUND", stubMessages);
    expect(result.code).toBe("SESSION_NOT_FOUND");
    expect(result.status).toBe(httpStatus.notFound);
    expect(result.retryable).toBe(false);
  });

  test("maps SESSION_EXPIRED to 410 non-retryable error", () => {
    const result = mapFrameworkError("SESSION_EXPIRED", stubMessages);
    expect(result.code).toBe("SESSION_EXPIRED");
    expect(result.status).toBe(httpStatus.gone);
    expect(result.retryable).toBe(false);
  });

  test("maps INVALID_COMMAND to 422 non-retryable error", () => {
    const result = mapFrameworkError("INVALID_COMMAND", stubMessages);
    expect(result.code).toBe("INVALID_COMMAND");
    expect(result.status).toBe(httpStatus.unprocessableEntity);
    expect(result.retryable).toBe(false);
  });

  test("maps AI_PROVIDER_FAILURE to 503 retryable error", () => {
    const result = mapFrameworkError("AI_PROVIDER_FAILURE", stubMessages);
    expect(result.code).toBe("AI_PROVIDER_FAILURE");
    expect(result.status).toBe(httpStatus.serviceUnavailable);
    expect(result.retryable).toBe(true);
  });

  test("maps unknown code to 500 retryable internal error", () => {
    const result = mapFrameworkError("UNEXPECTED_CODE", stubMessages);
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.status).toBe(httpStatus.internalServerError);
    expect(result.retryable).toBe(true);
    expect(result.message).toBe("Internal error");
  });

  test("maps numeric code to 500 retryable internal error", () => {
    const result = mapFrameworkError(500, stubMessages);
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.status).toBe(httpStatus.internalServerError);
    expect(result.retryable).toBe(true);
  });
});

describe("createErrorResponse", () => {
  test("returns typed error envelope with correlation id", () => {
    const request = new Request("http://localhost/api/test", {
      headers: { "accept-language": "en-US" },
    });
    const responseHeaders: MutableResponseHeaders = {};
    const error = new Error("test failure");

    const result = createErrorResponse("NOT_FOUND", error, request, responseHeaders);

    expect(result.status).toBe(httpStatus.notFound);
    expect(result.payload.ok).toBe(false);
    expect(result.payload.error.code).toBe("NOT_FOUND");
    expect(result.payload.error.retryable).toBe(false);
    expect(typeof result.payload.error.correlationId).toBe("string");
    expect(result.payload.error.correlationId.length).toBeGreaterThan(0);
  });

  test("preserves ApplicationError when provided directly", () => {
    const request = new Request("http://localhost/api/test");
    const responseHeaders: MutableResponseHeaders = {};
    const appError = new ApplicationError(
      "AI_PROVIDER_FAILURE",
      "provider down",
      httpStatus.serviceUnavailable,
      true,
    );

    const result = createErrorResponse("AI_PROVIDER_FAILURE", appError, request, responseHeaders);

    expect(result.status).toBe(httpStatus.serviceUnavailable);
    expect(result.payload.error.code).toBe("AI_PROVIDER_FAILURE");
    expect(result.payload.error.message).toBe("provider down");
    expect(result.payload.error.retryable).toBe(true);
  });

  test("propagates correlation id to response headers", () => {
    const correlationId = "test-correlation-abc";
    const request = new Request("http://localhost/api/test", {
      headers: { "x-correlation-id": correlationId },
    });
    const responseHeaders: MutableResponseHeaders = {};
    const error = new Error("test");

    const result = createErrorResponse("VALIDATION", error, request, responseHeaders);

    expect(responseHeaders["x-correlation-id"]).toBe(correlationId);
    expect(result.payload.error.correlationId).toBe(correlationId);
  });
});

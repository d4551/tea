/**
 * Canonical HTTP status codes used by API routes and tests.
 */
export const httpStatus = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  requestTimeout: 408,
  conflict: 409,
  gone: 410,
  unprocessableEntity: 422,
  tooManyRequests: 429,
  internalServerError: 500,
  serviceUnavailable: 503,
} as const;

/**
 * Canonical response content-type values.
 */
export const contentType = {
  htmlUtf8: "text/html; charset=utf-8",
} as const;

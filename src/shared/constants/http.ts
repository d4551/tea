/**
 * Canonical HTTP status codes used by API routes and tests.
 */
export const httpStatus = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  conflict: 409,
  gone: 410,
  unprocessableEntity: 422,
  serviceUnavailable: 503,
  internalServerError: 500,
} as const;

/**
 * Canonical response content-type values.
 */
export const contentType = {
  htmlUtf8: "text/html; charset=utf-8",
} as const;

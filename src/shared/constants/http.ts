/**
 * Canonical HTTP status codes used by API routes and tests.
 */
export const httpStatus: Record<string, number> = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  conflict: 409,
  gone: 410,
  tooManyRequests: 429,
  unprocessableEntity: 422,
  serviceUnavailable: 503,
  internalServerError: 500,
};

/**
 * Canonical response content-type values.
 */
export const contentType: Record<string, string> = {
  htmlUtf8: "text/html; charset=utf-8",
};

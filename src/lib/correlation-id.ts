/**
 * Header name used for request correlation across logs and envelopes.
 */
export const correlationIdHeader = "x-correlation-id";

/**
 * Minimal writable response header map contract.
 */
export interface MutableResponseHeaders {
  [key: string]: string | number | undefined;
}

/**
 * Resolves an existing correlation id from response headers or request headers.
 *
 * @param request Incoming request.
 * @param responseHeaders Mutable response headers, if available.
 * @returns Stable correlation id.
 */
export const resolveCorrelationId = (
  request: Request,
  responseHeaders?: MutableResponseHeaders,
): string => {
  const responseCorrelationId = responseHeaders?.[correlationIdHeader];
  if (typeof responseCorrelationId === "string" && responseCorrelationId.length > 0) {
    return responseCorrelationId;
  }

  const requestCorrelationId = request.headers.get(correlationIdHeader);
  if (requestCorrelationId && requestCorrelationId.length > 0) {
    return requestCorrelationId;
  }

  return crypto.randomUUID();
};

/**
 * Ensures correlation id header is present and returns its resolved value.
 *
 * @param request Incoming request.
 * @param responseHeaders Mutable response headers.
 * @returns Stable correlation id.
 */
export const ensureCorrelationIdHeader = (
  request: Request,
  responseHeaders: MutableResponseHeaders,
): string => {
  const correlationId = resolveCorrelationId(request, responseHeaders);
  responseHeaders[correlationIdHeader] = correlationId;
  return correlationId;
};

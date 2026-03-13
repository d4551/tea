/**
 * Elysia SSE Utilities Plugin
 *
 * Centralises Server-Sent Events formatting so every SSE endpoint
 * uses the same wire format instead of hand-rolling `event:\ndata:\n\n` strings.
 *
 * Decorates context with:
 *  - `sse.event(name, html)`  — format a named SSE event string
 *  - `sse.ping()`             — format a keep-alive comment ping
 *  - `sse.comment(text)`      — format an SSE comment line
 *
 * Usage in a generator endpoint:
 *   .get('/hud', function* ({ sse }) {
 *     yield sse.event('xp', '<span>XP: 50</span>')
 *     yield sse.ping()
 *   })
 */
import { Elysia } from "elysia";

export const sseUtils = {
  /**
   * Formats a named SSE event with an HTML data payload.
   * Compatible with htmx `sse-swap="<name>"` attribute.
   */
  event(
    name: string,
    html: string,
    options?: {
      readonly id?: string;
      readonly retry?: number;
    },
  ): string {
    const lines: string[] = [];
    if (typeof options?.id === "string" && options.id.length > 0) {
      lines.push(`id: ${options.id}`);
    }
    if (
      typeof options?.retry === "number" &&
      Number.isFinite(options.retry) &&
      options.retry >= 0
    ) {
      lines.push(`retry: ${Math.round(options.retry)}`);
    }

    const normalizedData = html.replace(/\r?\n/g, "\ndata: ");
    lines.push(`event: ${name}`);
    lines.push(`data: ${normalizedData}`);
    return `${lines.join("\n")}\n\n`;
  },

  /**
   * Sends an SSE keep-alive comment to prevent proxy timeouts.
   * HTMX ignores comment lines so this is safe to yield at any time.
   */
  ping(): string {
    return `: ping ${Date.now()}\n\n`;
  },

  /**
   * Sends an SSE comment (not shown in HTMX, useful for debugging).
   */
  comment(text: string): string {
    return `: ${text}\n\n`;
  },
};

export const ssePlugin = new Elysia({ name: "sse-utils" }).decorate("sse", sseUtils);

export type SseUtils = typeof sseUtils;

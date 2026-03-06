/**
 * Elysia AI Context Plugin
 *
 * Injects the ProviderRegistry singleton into every request context via `derive`.
 * Register this plugin globally (before any route that needs AI) in app.ts.
 *
 * Usage in routes:
 *   .get('/ai/status', ({ ai }) => ai.getStatus())
 */
import { Elysia } from "elysia";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";

export const aiContextPlugin = new Elysia({ name: "ai-context" }).derive(
  { as: "global" },
  async () => {
    const ai = await ProviderRegistry.getInstance();
    return { ai };
  },
);

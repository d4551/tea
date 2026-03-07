/**
 * AI Provider Lifecycle Plugin
 *
 * Lifecycle-managed Elysia plugin that boots the provider registry once,
 * refreshes capability snapshots on a deterministic interval, and disposes the
 * registry on app shutdown.
 */
import { appConfig } from "../config/environment.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import { createManagedPollingPlugin } from "./managed-polling-plugin.ts";

/**
 * Elysia plugin that owns AI provider capability refresh and shutdown cleanup.
 */
export const aiProviderPlugin = createManagedPollingPlugin({
  name: "ai-provider-registry",
  loggerModule: "ai.provider-lifecycle",
  intervalMs: appConfig.ai.capabilityRefreshIntervalMs,
  startedEvent: "ai.provider-registry.started",
  stoppedEvent: "ai.provider-registry.stopped",
  failedEvent: "ai.provider-registry.failed",
  beforeStart: async () => {
    await ProviderRegistry.getInstance();
  },
  run: async () => {
    const registry = await ProviderRegistry.getInstance();
    await registry.refreshCapabilities();
    return registry.getCapabilities().length;
  },
  afterStop: async () => {
    const registry = ProviderRegistry.peekInstance();
    if (registry) {
      await registry.dispose();
    }
  },
});

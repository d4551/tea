import { createApp } from "./app.ts";
import { assertStartupReadiness } from "./bootstrap/preflight.ts";
import { appConfig } from "./config/environment.ts";
import { ModelManager } from "./domain/ai/model-manager.ts";
import { createLogger } from "./lib/logger.ts";
import { settleAsync } from "./shared/utils/async-result.ts";

const bootstrapLogger = createLogger("bootstrap");

/**
 * Boots and starts the HTTP server.
 * Local AI warmup is opt-in because eager pipeline loading can stall
 * live request handling on Bun's main server process.
 */
export const startServer = async (): Promise<void> => {
  await assertStartupReadiness();
  const app = await createApp();
  app.listen({
    hostname: appConfig.host,
    port: appConfig.port,
  });

  bootstrapLogger.info("server.started", {
    host: appConfig.host,
    port: appConfig.port,
  });

  if (!appConfig.ai.warmupOnBoot) {
    return;
  }

  void (async () => {
    const managerResult = await settleAsync(ModelManager.getInstance());
    if (!managerResult.ok) {
      bootstrapLogger.error("ai.models.warmup.failed", {
        err: managerResult.error.message,
      });
      return;
    }

    const warmupResult = await settleAsync(managerResult.value.ensureWarmup());
    if (!warmupResult.ok) {
      bootstrapLogger.error("ai.models.warmup.failed", {
        err: warmupResult.error.message,
      });
      return;
    }

    bootstrapLogger.info("ai.models.ready");
  })();
};

if (import.meta.main) {
  await startServer();
}

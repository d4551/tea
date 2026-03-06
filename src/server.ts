import { createApp } from "./app.ts";
import { appConfig } from "./config/environment.ts";
import { ModelManager } from "./domain/ai/model-manager.ts";
import { createLogger } from "./lib/logger.ts";

const bootstrapLogger = createLogger("bootstrap");

/**
 * Boots and starts the HTTP server.
 * Local AI warmup is opt-in because eager pipeline loading can stall
 * live request handling on Bun's main server process.
 */
export const startServer = async (): Promise<void> => {
  const app = await createApp();
  app.listen({
    hostname: appConfig.host,
    port: appConfig.port,
  });

  bootstrapLogger.info("server.started", {
    host: appConfig.host,
    port: appConfig.port,
  });

  // #region agent log
  const serverPort = (app as { server?: { port?: number } }).server?.port;
  fetch("http://127.0.0.1:7824/ingest/2a1ebe22-3205-47a7-ac66-14b2478b8cbc", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f14b60" },
    body: JSON.stringify({
      sessionId: "f14b60",
      location: "server.ts:startServer",
      message: "server.listen.completed",
      data: { host: appConfig.host, port: appConfig.port, serverPort, hypothesisId: "H2,H4" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!appConfig.ai.warmupOnBoot) {
    return;
  }

  ModelManager.getInstance()
    .then((manager) => manager.ensureWarmup())
    .then(() => bootstrapLogger.info("ai.models.ready"))
    .catch((err) => bootstrapLogger.error("ai.models.warmup.failed", { err: String(err) }));
};

if (import.meta.main) {
  await startServer();
}

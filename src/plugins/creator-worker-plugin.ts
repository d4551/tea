import { appConfig } from "../config/environment.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import { createLogger } from "../lib/logger.ts";
import { createManagedPollingPlugin } from "./managed-polling-plugin.ts";

const logger = createLogger("creator.worker");
const creatorWorkerUpdatedBy = "system:creator-worker";

/**
 * Elysia plugin that starts a periodic builder work drain on server start
 * and clears the interval on server stop.
 */
export const creatorWorkerPlugin = createManagedPollingPlugin({
  name: "creator-worker",
  loggerModule: "creator.worker",
  intervalMs: appConfig.builder.workerPollIntervalMs,
  startedEvent: "creator.worker.started",
  stoppedEvent: "creator.worker.stopped",
  failedEvent: "creator.worker.failed",
  run: async () => builderService.processQueuedWork(undefined, creatorWorkerUpdatedBy),
  onSuccess: (processedCount) => {
    if (processedCount > 0) {
      logger.info("creator.worker.drained", {
        processedCount,
      });
    }
  },
});

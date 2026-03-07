import { Elysia } from "elysia";
import { createLogger } from "../lib/logger.ts";
import {
  clearManagedInterval,
  executeManagedIntervalTask,
  type ManagedIntervalHandle,
} from "../lib/managed-interval.ts";

/**
 * Configuration for a lifecycle-managed polling plugin.
 */
export interface ManagedPollingPluginOptions<TResult> {
  /** Stable plugin name registered with Elysia. */
  readonly name: string;
  /** Logger module name used for structured lifecycle events. */
  readonly loggerModule: string;
  /** Polling interval in milliseconds. */
  readonly intervalMs: number;
  /** Event emitted when the plugin starts. */
  readonly startedEvent: string;
  /** Event emitted when the plugin stops. */
  readonly stoppedEvent: string;
  /** Event emitted when one polling task fails. */
  readonly failedEvent: string;
  /** Optional startup work that must complete before polling begins. */
  readonly beforeStart?: () => Promise<void> | void;
  /** Polling task executed on every interval tick. */
  readonly run: () => Promise<TResult>;
  /** Optional result-specific success handler. */
  readonly onSuccess?: (result: TResult) => void;
  /** Optional cleanup executed after the interval has been cleared. */
  readonly afterStop?: () => Promise<void> | void;
}

/**
 * Creates an Elysia plugin that owns one non-overlapping polling task for the
 * lifetime of the app instance.
 *
 * @param options Managed polling configuration.
 * @returns Lifecycle-managed Elysia plugin.
 */
export const createManagedPollingPlugin = <TResult>(
  options: ManagedPollingPluginOptions<TResult>,
) => {
  const logger = createLogger(options.loggerModule);
  let pollerInterval: ManagedIntervalHandle | null = null;
  let pollerInFlight = false;
  let pollerStarted = false;

  return new Elysia({ name: options.name })
    .onStart(async (app) => {
      if (!app.server) {
        return;
      }

      await options.beforeStart?.();

      pollerInterval = setInterval(() => {
        void executeManagedIntervalTask({
          isInFlight: () => pollerInFlight,
          setInFlight: (value) => {
            pollerInFlight = value;
          },
          logger,
          failureEvent: options.failedEvent,
          run: options.run,
          onSuccess: options.onSuccess,
        });
      }, options.intervalMs);

      logger.info(options.startedEvent, {
        intervalMs: options.intervalMs,
      });
      pollerStarted = true;
    })
    .onStop(async () => {
      pollerInterval = clearManagedInterval(pollerInterval);
      pollerInFlight = false;
      if (!pollerStarted) {
        return;
      }
      await options.afterStop?.();
      logger.info(options.stoppedEvent);
      pollerStarted = false;
    });
};

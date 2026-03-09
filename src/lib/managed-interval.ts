import { settleAsync } from "../shared/utils/async-result.ts";
import type { JsonObject, StructuredLogger } from "./logger.ts";

/**
 * Stable interval handle type used by lifecycle-managed plugins.
 */
export type ManagedIntervalHandle = ReturnType<typeof setInterval>;

/**
 * Options for one managed async interval tick.
 */
export interface ManagedIntervalTaskOptions<TResult> {
  /** Returns whether an interval tick is already running. */
  readonly isInFlight: () => boolean;
  /** Updates the in-flight flag around task execution. */
  readonly setInFlight: (value: boolean) => void;
  /** Structured logger for success and failure output. */
  readonly logger: StructuredLogger;
  /** Event name emitted when the task fails. */
  readonly failureEvent: string;
  /** Async work executed on the interval. */
  readonly run: () => Promise<TResult>;
  /** Optional success callback for result-specific logging. */
  readonly onSuccess?: (result: TResult) => void;
  /** Optional failure payload mapper. */
  readonly mapFailureData?: (error: Error) => JsonObject;
}

/**
 * Executes one guarded async interval tick and prevents overlapping runs.
 *
 * @param options Managed interval execution options.
 */
export const executeManagedIntervalTask = async <TResult>(
  options: ManagedIntervalTaskOptions<TResult>,
): Promise<void> => {
  if (options.isInFlight()) {
    return;
  }

  options.setInFlight(true);

  const result = await settleAsync(options.run());
  if (result.ok) {
    options.onSuccess?.(result.value);
  } else {
    options.logger.warn(options.failureEvent, {
      message: result.error.message,
      ...(options.mapFailureData?.(result.error) ?? {}),
    });
  }

  options.setInFlight(false);
};

/**
 * Clears a managed interval handle and returns the canonical empty value.
 *
 * @param handle Existing interval handle.
 * @returns `null` after cleanup for direct state assignment.
 */
export const clearManagedInterval = (
  handle: ManagedIntervalHandle | null,
): ManagedIntervalHandle | null => {
  if (handle) {
    clearInterval(handle);
  }

  return null;
};

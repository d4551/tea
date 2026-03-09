import { settleAsync } from "../../shared/utils/async-result.ts";
import {
  type LocalModelFailure,
  type LocalModelFailureCode,
  type LocalModelResult,
  localModelFailure,
  localModelSuccess,
} from "./local-model-contract.ts";
import type { ModelKey } from "./model-registry.ts";

/**
 * Runtime configuration for one local-model operation.
 *
 * @template TValue Success payload type.
 */
export interface LocalModelOperationOptions<TValue> {
  /** Logical operation name. */
  readonly operation: string;
  /** Operation timeout in milliseconds. */
  readonly timeoutMs: number;
  /** Promise-producing operation. */
  readonly execute: () => Promise<TValue>;
  /** Optional model key used for diagnostics. */
  readonly modelKey?: ModelKey;
  /** Optional validator for successful payloads. */
  readonly validate?: (value: TValue) => boolean;
  /** Error message used when validation fails. */
  readonly invalidMessage?: string;
}

/**
 * Executes an async task with a hard timeout.
 *
 * @template TValue Success payload type.
 * @param task Promise-producing operation.
 * @param timeoutMs Timeout in milliseconds.
 * @param label Operation label for diagnostics.
 * @returns Resolved task result when completed in time.
 */
export const withTimeout = async <TValue>(
  task: () => Promise<TValue>,
  timeoutMs: number,
  label: string,
): Promise<TValue> => {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  const timeoutTask = new Promise<never>((_, reject) => {
    controller.signal.addEventListener("abort", () => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    });
  });

  const result = await Promise.race([task(), timeoutTask]);
  clearTimeout(timeoutHandle);
  return result;
};

/**
 * Maps an unknown thrown value to a structured local-model failure.
 *
 * @param input Failure mapping input.
 * @returns Structured local-model failure.
 */
export const toLocalModelFailure = (input: {
  readonly error: unknown;
  readonly operation: string;
  readonly modelKey?: ModelKey;
  readonly fallbackCode?: LocalModelFailureCode;
  readonly message?: string;
  readonly retryable?: boolean;
}): LocalModelFailure => {
  const normalized =
    input.error instanceof Error ? input.error : new Error(String(input.error ?? "Unknown error"));
  const timeoutLike = /timed out/iu.test(normalized.message);
  const code = timeoutLike ? "timeout" : (input.fallbackCode ?? "unexpected");

  return {
    code,
    message: input.message ?? normalized.message,
    retryable: input.retryable ?? (code === "timeout" || code === "unavailable"),
    operation: input.operation,
    modelKey: input.modelKey,
  };
};

/**
 * Converts a structured failure into a logging payload.
 *
 * @param failure Structured failure payload.
 * @returns JSON-safe log payload.
 */
export const localModelFailureToLogData = (failure: LocalModelFailure) => ({
  code: failure.code,
  retryable: failure.retryable,
  operation: failure.operation,
  modelKey: failure.modelKey ?? null,
  message: failure.message,
});

/**
 * Runs a local-model operation into the typed result contract.
 *
 * @template TValue Success payload type.
 * @param options Operation configuration.
 * @returns Typed operation result.
 */
export const runLocalModelOperation = async <TValue>(
  options: LocalModelOperationOptions<TValue>,
): Promise<LocalModelResult<TValue>> => {
  const result = await settleAsync(
    withTimeout(options.execute, options.timeoutMs, options.operation),
  );
  if (!result.ok) {
    return localModelFailure(
      toLocalModelFailure({
        error: result.error,
        operation: options.operation,
        modelKey: options.modelKey,
      }),
    );
  }

  if (options.validate && !options.validate(result.value)) {
    return localModelFailure({
      code: "invalid-output",
      message: options.invalidMessage ?? `${options.operation} returned an invalid payload.`,
      retryable: false,
      operation: options.operation,
      modelKey: options.modelKey,
    });
  }

  return localModelSuccess(result.value);
};

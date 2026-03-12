import { env, pipeline } from "@huggingface/transformers";
import { $ } from "bun";
import { appConfig } from "../../config/environment.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";
import {
  type LocalModelResult,
  localModelFailure,
  localModelSuccess,
} from "./local-model-contract.ts";
import { toLocalModelFailure, withTimeout } from "./model-operation-runner.ts";
import { MODEL_REGISTRY, type ModelKey } from "./model-registry.ts";

/**
 * Disposable pipeline contract returned by Transformers.js.
 */
export interface DisposablePipeline {
  /** Optional disposal hook exposed by the runtime. */
  readonly dispose?: () => void | Promise<void>;
}

/**
 * Runtime pipeline instance shape used by the local-model manager.
 */
export type AnyPipeline =
  DisposablePipeline & ((input: unknown, options?: Record<string, unknown>) => Promise<unknown>);

const corruptedCacheErrorFragments: readonly string[] = [
  "protobuf",
  "invalid wire type",
  "index out of range",
];

// Serve ONNX WASM binaries locally rather than fetching from CDN.
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = appConfig.ai.onnxWasmPath;
  env.backends.onnx.wasm.numThreads = appConfig.ai.onnxThreadCount;
  env.backends.onnx.wasm.proxy = appConfig.ai.onnxProxyEnabled;
}

// Cache downloaded model weights locally between restarts.
env.cacheDir = appConfig.ai.transformersCacheDirectory;
env.localModelPath = appConfig.ai.transformersLocalModelPath;
env.allowLocalModels = appConfig.ai.transformersAllowLocalModels;
env.allowRemoteModels = appConfig.ai.transformersAllowRemoteModels;

/**
 * Returns true when an error indicates corrupted cached model assets.
 *
 * @param error Unknown thrown value.
 * @returns True when the cache should be purged and retried.
 */
export const isCorruptedCacheError = (error: unknown): boolean => {
  const message = String(error).toLowerCase();
  return corruptedCacheErrorFragments.some((fragment) => message.includes(fragment));
};

/**
 * Resolves the local cache path for a model id.
 *
 * @param modelId Hugging Face model identifier.
 * @returns Absolute cache path.
 */
export const resolveModelCachePath = (modelId: string): string =>
  [appConfig.ai.transformersCacheDirectory, ...modelId.split("/")].join("/").replace(/\/+/g, "/");

const loadPipelineOnce = async (key: ModelKey): Promise<AnyPipeline> => {
  const entry = MODEL_REGISTRY[key];
  if (!entry.enabled) {
    throw new Error(`Model target "${key}" is disabled.`);
  }

  const loadedPipeline = await pipeline(entry.task, entry.model, {
    dtype: entry.dtype,
    device: entry.device,
  });

  if (typeof loadedPipeline !== "function") {
    throw new Error(`Unexpected pipeline shape for "${key}".`);
  }

  return loadedPipeline;
};

const purgeModelCache = async (key: ModelKey): Promise<void> => {
  const modelId = MODEL_REGISTRY[key].model;
  const modelCachePath = resolveModelCachePath(modelId);
  await $`rm -rf ${modelCachePath}`;
};

const describeUnknownError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error ?? "Unknown error");

/**
 * Loads a model pipeline with one cache-recovery retry when the local cache is corrupt.
 *
 * @param key Registry key for the target model.
 * @returns Loaded pipeline plus recovery metadata.
 */
export const loadModelPipeline = async (
  key: ModelKey,
): Promise<
  LocalModelResult<{ readonly pipeline: AnyPipeline; readonly recoveredCache: boolean }>
> => {
  const firstAttempt = await settleAsync(
    withTimeout(() => loadPipelineOnce(key), appConfig.ai.pipelineTimeoutMs, "pipeline.load"),
  );
  if (firstAttempt.ok) {
    return localModelSuccess({
      pipeline: firstAttempt.value,
      recoveredCache: false,
    });
  }

  if (!isCorruptedCacheError(firstAttempt.error)) {
    return localModelFailure(
      toLocalModelFailure({
        error: firstAttempt.error,
        operation: "pipeline.load",
        modelKey: key,
        fallbackCode: "unavailable",
      }),
    );
  }

  const purgeResult = await settleAsync(purgeModelCache(key));
  if (!purgeResult.ok) {
    return localModelFailure(
      toLocalModelFailure({
        error: purgeResult.error,
        operation: "pipeline.load",
        modelKey: key,
        fallbackCode: "unexpected",
        message: `Failed to purge corrupted cache for "${key}": ${describeUnknownError(purgeResult.error)}`,
        retryable: false,
      }),
    );
  }

  const secondAttempt = await settleAsync(
    withTimeout(() => loadPipelineOnce(key), appConfig.ai.pipelineTimeoutMs, "pipeline.load"),
  );
  if (!secondAttempt.ok) {
    return localModelFailure(
      toLocalModelFailure({
        error: secondAttempt.error,
        operation: "pipeline.load",
        modelKey: key,
        fallbackCode: "unavailable",
        message: `Failed to reload pipeline "${key}" after cache recovery: ${describeUnknownError(secondAttempt.error)}`,
        retryable: true,
      }),
    );
  }

  return localModelSuccess({
    pipeline: secondAttempt.value,
    recoveredCache: true,
  });
};

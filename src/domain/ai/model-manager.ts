/**
 * ModelManager — singleton ONNX pipeline manager for server-side local AI.
 *
 * Responsibilities:
 *  - Configure ONNX Runtime backend once
 *  - Lazy-load pipelines on first use and keep them resident in memory
 *  - Provide typed inference methods consumed by oracle-service and game-loop
 *  - Graceful fallback: return null when model work cannot be completed
 */

import { env, pipeline } from "@huggingface/transformers";
import { $ } from "bun";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { MODEL_REGISTRY, type ModelKey } from "./model-registry.ts";

const logger = createLogger("ai.model-manager");
const corruptedCacheErrorFragments = [
  "protobuf",
  "invalid wire type",
  "index out of range",
] as const;

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

interface DisposablePipeline {
  readonly dispose?: () => void | Promise<void>;
}

type AnyPipeline = DisposablePipeline & object;
type TensorLike = { readonly data: Float32Array | Float64Array | readonly number[] };

interface AsrOutput {
  readonly text?: string;
}

interface TtsOutput {
  readonly audio: Float32Array;
  readonly sampling_rate: number;
}

const isCorruptedCacheError = (error: unknown): boolean => {
  const message = String(error).toLowerCase();
  return corruptedCacheErrorFragments.some((fragment) => message.includes(fragment));
};

const resolveModelCachePath = (modelId: string): string =>
  [appConfig.ai.transformersCacheDirectory, ...modelId.split("/")].join("/").replace(/\/+/g, "/");

/**
 * Sentiment inference output contract.
 */
export interface SentimentResult {
  /** Model label. */
  label: "POSITIVE" | "NEGATIVE";
  /** Confidence score from the model. */
  score: number;
}

/**
 * Timeout wrapper for async model operations.
 *
 * @param task Task promise to execute.
 * @param timeoutMs Timeout in milliseconds.
 * @param label Operation label for diagnostics.
 * @returns Resolved task result when completed in time.
 */
const withTimeout = async <T>(task: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  const timeoutTask = new Promise<never>((_, reject) => {
    controller.signal.addEventListener("abort", () => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    });
  });

  const result = await Promise.race([task, timeoutTask]);
  clearTimeout(timeoutHandle);
  return result;
};

/**
 * Singleton local AI model manager with lazy warmup and circuit-breaker backoff.
 */
export class ModelManager {
  private static _instance: ModelManager | null = null;
  private static _instancePromise: Promise<ModelManager> | null = null;

  private readonly _pipelines = new Map<ModelKey, AnyPipeline>();
  private _ready = false;
  private _warmupPromise: Promise<void> | null = null;
  private _consecutiveFailures = 0;
  private _circuitOpenUntilMs = 0;

  private constructor() {}

  /**
   * Returns the singleton instance.
   */
  static async getInstance(): Promise<ModelManager> {
    if (ModelManager._instance) {
      return ModelManager._instance;
    }

    if (!ModelManager._instancePromise) {
      ModelManager._instancePromise = Promise.resolve(new ModelManager());
    }

    const instance = await ModelManager._instancePromise;
    ModelManager._instance = instance;
    return instance;
  }

  /**
   * Returns the active singleton instance without creating one.
   *
   * @returns Existing singleton instance, if any.
   */
  static peekInstance(): ModelManager | null {
    return ModelManager._instance;
  }

  /**
   * Indicates whether warmup completed successfully at least once.
   */
  get isReady(): boolean {
    return this._ready;
  }

  /**
   * Performs best-effort warmup without blocking request lifecycle.
   */
  public async ensureWarmup(): Promise<void> {
    if (this._ready || this._isCircuitOpen()) {
      return;
    }

    if (!this._warmupPromise) {
      this._warmupPromise = this._warmup().finally(() => {
        this._warmupPromise = null;
      });
    }

    await this._warmupPromise;
  }

  /**
   * Returns (and caches) a pipeline for the given registry key.
   */
  async getPipeline(key: ModelKey): Promise<AnyPipeline> {
    const cached = this._pipelines.get(key);
    if (cached) {
      return cached;
    }

    if (this._isCircuitOpen()) {
      throw new Error("AI_PROVIDER_FAILURE");
    }

    const loaded = await withTimeout(
      this._loadPipeline(key),
      appConfig.ai.pipelineTimeoutMs,
      `pipeline:${key}`,
    ).catch((error: unknown) => {
      this._registerFailure(error);
      throw error;
    });

    this._consecutiveFailures = 0;
    return loaded;
  }

  /**
   * Classifies text sentiment.
   */
  async analyzeSentiment(text: string): Promise<SentimentResult | null> {
    const pipe = await this.getPipeline("sentiment").catch((error: unknown) => {
      logger.error("model.sentiment.failed", { err: String(error) });
      return null;
    });
    if (!pipe) return null;

    const result = await (pipe as (t: string) => Promise<SentimentResult[]>)(text).catch(
      (error: unknown) => {
        logger.error("model.sentiment.failed", { err: String(error) });
        return null;
      },
    );

    return result?.[0] ?? null;
  }

  /**
   * Generates an oracle fortune string from user prompt.
   */
  async generateOracle(question: string): Promise<string | null> {
    const prompt = `The Tea Oracle speaks of "${question}": `;
    return this.generateText("oracle", prompt, prompt);
  }

  /**
   * Generates text from a configured local text-generation pipeline.
   *
   * @param modelKey Target model registry key.
   * @param prompt Prompt passed to the local pipeline.
   * @param stripPrefix Optional prefix to strip from generated text.
   * @returns Generated text or null when model execution fails.
   */
  async generateText(
    modelKey: Extract<ModelKey, "oracle" | "npcDialogue">,
    prompt: string,
    stripPrefix?: string,
  ): Promise<string | null> {
    const pipe = await this.getPipeline(modelKey).catch((error: unknown) => {
      logger.error(`model.${modelKey}.failed`, { err: String(error) });
      return null;
    });
    if (!pipe) {
      return null;
    }

    const entry = MODEL_REGISTRY[modelKey];
    const result = await withTimeout(
      (
        pipe as (
          text: string,
          opts: Record<string, unknown>,
        ) => Promise<Array<{ generated_text: string }>>
      )(prompt, entry.generationConfig ?? {}),
      appConfig.ai.pipelineTimeoutMs,
      `${modelKey}:generate`,
    ).catch((error: unknown) => {
      logger.error(`model.${modelKey}.failed`, { err: String(error) });
      return null;
    });

    if (!result) {
      return null;
    }

    const generated = result[0]?.generated_text ?? "";
    if (
      typeof stripPrefix === "string" &&
      stripPrefix.length > 0 &&
      generated.startsWith(stripPrefix)
    ) {
      return generated.slice(stripPrefix.length).trim();
    }

    return generated.trim();
  }

  /**
   * Generates a normalized embedding vector.
   *
   * @param text Input text.
   * @returns Embedding vector or null when the model fails.
   */
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    const pipe = await this.getPipeline("embeddings").catch((error: unknown) => {
      logger.error("model.embeddings.failed", { err: String(error) });
      return null;
    });
    if (!pipe) return null;

    const result = await withTimeout(
      (pipe as (input: string, options: Record<string, unknown>) => Promise<TensorLike>)(text, {
        pooling: "mean",
        normalize: true,
      }),
      appConfig.ai.pipelineTimeoutMs,
      "embedding:generate",
    ).catch((error: unknown) => {
      logger.error("model.embeddings.failed", { err: String(error) });
      return null;
    });

    if (!result) {
      return null;
    }

    const values =
      result.data instanceof Float32Array
        ? result.data
        : result.data instanceof Float64Array
          ? Float32Array.from(result.data)
          : Float32Array.from(result.data);

    return values;
  }

  /**
   * Runs automatic speech recognition against mono PCM audio.
   *
   * @param audio Mono PCM audio.
   * @returns Recognized text or null on failure.
   */
  async transcribeAudio(audio: Float32Array): Promise<string | null> {
    const pipe = await this.getPipeline("speechToText").catch((error: unknown) => {
      logger.error("model.stt.failed", { err: String(error) });
      return null;
    });
    if (!pipe) return null;

    const result = await withTimeout(
      (
        pipe as (
          input: Float32Array,
          options: Record<string, unknown>,
        ) => Promise<AsrOutput | string>
      )(audio, {}),
      appConfig.ai.pipelineTimeoutMs * 4,
      "speech-to-text:transcribe",
    ).catch((error: unknown) => {
      logger.error("model.stt.failed", { err: String(error) });
      return null;
    });

    if (typeof result === "string") {
      return result.trim();
    }

    return result?.text?.trim() ?? null;
  }

  /**
   * Synthesizes mono PCM audio from text.
   *
   * @param text Input text to synthesize.
   * @returns PCM audio and sample rate or null on failure.
   */
  async synthesizeSpeech(
    text: string,
  ): Promise<{ readonly audio: Float32Array; readonly sampleRate: number } | null> {
    const pipe = await this.getPipeline("textToSpeech").catch((error: unknown) => {
      logger.error("model.tts.failed", { err: String(error) });
      return null;
    });
    if (!pipe) return null;

    const result = await withTimeout(
      (pipe as (input: string, options: Record<string, unknown>) => Promise<TtsOutput>)(text, {
        speaker_embeddings: appConfig.ai.textToSpeechSpeakerEmbeddings,
      }),
      appConfig.ai.pipelineTimeoutMs * 4,
      "text-to-speech:synthesize",
    ).catch((error: unknown) => {
      logger.error("model.tts.failed", { err: String(error) });
      return null;
    });

    if (!result) {
      return null;
    }

    return {
      audio: result.audio,
      sampleRate: result.sampling_rate,
    };
  }

  /**
   * Releases the singleton manager and forgets loaded pipeline references.
   *
   * Transformers.js documents long-lived singleton reuse for server runtimes and does not
   * require explicit pipeline disposal. Under Bun 1.3.x, calling native pipeline disposers after
   * failed ONNX text-generation loads can terminate the process during shutdown, so teardown here
   * resets JS ownership and lets process exit reclaim the underlying resources safely.
   */
  async dispose(): Promise<void> {
    this._pipelines.clear();
    this._ready = false;
    this._warmupPromise = null;
    this._consecutiveFailures = 0;
    this._circuitOpenUntilMs = 0;
    ModelManager._instance = null;
    ModelManager._instancePromise = null;

    logger.info("model.manager.disposed");
  }

  /**
   * Loads and caches a model pipeline.
   */
  private async _loadPipeline(
    key: ModelKey,
    allowCacheRecovery: boolean = true,
  ): Promise<AnyPipeline> {
    const entry = MODEL_REGISTRY[key];
    if (!entry.enabled) {
      throw new Error(`Model target "${key}" is disabled.`);
    }
    logger.info("model.loading", { key, model: entry.model });

    const pipeResult = await pipeline(entry.task as Parameters<typeof pipeline>[0], entry.model, {
      dtype: entry.dtype,
      device: entry.device,
    }).catch((error: unknown) => {
      if (allowCacheRecovery && isCorruptedCacheError(error)) {
        return this._purgeModelCache(key).then(() => this._loadPipeline(key, false));
      }
      return Promise.reject(error);
    });

    this._pipelines.set(key, pipeResult);
    logger.info("model.loaded", { key, model: entry.model });
    return pipeResult;
  }

  /**
   * Performs a single warmup attempt with timeout safeguards.
   */
  private async _warmup(): Promise<void> {
    const result = await withTimeout(
      this._loadPipeline("sentiment"),
      appConfig.ai.modelWarmupTimeoutMs,
      "warmup:sentiment",
    ).catch((error: unknown) => {
      this._registerFailure(error);
      logger.warn("model.warmup.failed", { err: String(error) });
      return null;
    });

    if (result !== null) {
      this._ready = true;
      this._consecutiveFailures = 0;
      logger.info("model.warmup.complete", { model: MODEL_REGISTRY.sentiment.model });
    }
  }

  /**
   * Tracks failures and opens a short circuit on repeated provider errors.
   */
  private _registerFailure(error: unknown): void {
    this._consecutiveFailures += 1;
    if (this._consecutiveFailures >= 2) {
      this._circuitOpenUntilMs = Date.now() + Math.max(appConfig.ai.pipelineTimeoutMs * 4, 2_000);
    }

    logger.warn("model.failure.recorded", {
      consecutiveFailures: this._consecutiveFailures,
      circuitOpenUntilMs: this._circuitOpenUntilMs,
      error: String(error),
    });
  }

  /**
   * Returns true when the AI provider circuit breaker is currently open.
   */
  private _isCircuitOpen(nowMs: number = Date.now()): boolean {
    return nowMs < this._circuitOpenUntilMs;
  }

  /**
   * Removes a corrupted cached model directory so the next load can rehydrate it cleanly.
   *
   * @param key Registry key for the affected model.
   */
  private async _purgeModelCache(key: ModelKey): Promise<void> {
    const modelId = MODEL_REGISTRY[key].model;
    const modelCachePath = resolveModelCachePath(modelId);
    await $`rm -rf ${modelCachePath}`;
    logger.warn("model.cache.purged", {
      key,
      model: modelId,
      path: modelCachePath,
    });
  }
}

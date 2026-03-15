/**
 * ModelManager — singleton ONNX pipeline manager for server-side local AI.
 *
 * Responsibilities:
 *  - Configure ONNX Runtime backend once
 *  - Lazy-load pipelines on first use and keep them resident in memory
 *  - Provide typed inference methods consumed by oracle-service and game-loop
 *  - Keep circuit-breaker and pipeline-cache ownership behind one facade
 */

import type { AutomaticSpeechRecognitionPipelineCallback } from "@huggingface/transformers";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import {
  MODEL_STT_EMPTY_TEXT_ERROR,
  MODEL_STT_INVALID_PAYLOAD_ERROR,
} from "../../shared/constants/errors.ts";
import {
  type LocalEmbeddingOperationResult,
  type LocalModelFailure,
  type LocalModelResult,
  type LocalImageGenerationOperationResult,
  type LocalSentimentOperationResult,
  type LocalSpeechSynthesisOperationResult,
  type LocalTextGenerationOperationResult,
  type LocalTranscriptionOperationResult,
  localModelFailure,
  localModelSuccess,
  type SentimentResult,
  unwrapLocalModelResult,
} from "./local-model-contract.ts";
import type { LocalModelRuntime } from "./local-model-runtime.ts";
import { localModelFailureToLogData, runLocalModelOperation } from "./model-operation-runner.ts";
import { LocalModelPipelineCache } from "./model-pipeline-cache.ts";
import { type AnyPipeline, loadModelPipeline } from "./model-pipeline-loader.ts";
import { MODEL_REGISTRY, type ModelKey } from "./model-registry.ts";
import { LocalModelRuntimeHealth } from "./model-runtime-health.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";

const logger = createLogger("ai.model-manager");

type TensorLike = { readonly data: Float32Array | Float64Array | readonly number[] };

interface AsrOutput {
  readonly text?: string;
}

interface TtsOutput {
  readonly audio: Float32Array;
  readonly sampling_rate: number;
}

type ImageGenerationRawOutput = {
  readonly images?: readonly unknown[] | unknown;
  readonly image?: unknown;
  readonly data?: unknown;
  readonly image_data?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const isFloat32Array = (value: unknown): value is Float32Array => value instanceof Float32Array;

const isFloat64Array = (value: unknown): value is Float64Array => value instanceof Float64Array;

const isArrayBuffer = (value: unknown): value is ArrayBuffer => value instanceof ArrayBuffer;

const isByteArray = (value: unknown): value is Uint8Array | Uint8ClampedArray =>
  value instanceof Uint8Array || value instanceof Uint8ClampedArray;

const isNumericArray = (value: readonly unknown[]): value is readonly number[] =>
  value.every((entry) => typeof entry === "number");

const isHttpUrl = (value: string): boolean =>
  value.startsWith("http://") || value.startsWith("https://");

const isLikelyBase64 = (value: string): boolean =>
  /^[A-Za-z0-9+/=]+$/.test(value) && value.length % 4 === 0;

const decodeBase64ToBytes = (encoded: string): Uint8Array | null => {
  const normalized = encoded.replace(/[\r\n\s]/g, "");
  if (!isLikelyBase64(normalized) || typeof atob === "undefined") {
    return null;
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const decodeImageDataUrl = (value: string): { bytes: Uint8Array; mimeType: string } | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("data:")) {
    return null;
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const header = trimmed.slice(5, commaIndex);
  const payload = trimmed.slice(commaIndex + 1);
  if (!header.includes(";base64")) {
    return null;
  }

  const mimeType = header.split(";")[0] || "image/png";
  const bytes = decodeBase64ToBytes(payload);
  if (!bytes) {
    return null;
  }

  return { bytes, mimeType };
};

const fetchImageBytes = async (url: string): Promise<Uint8Array | null> => {
  if (!isHttpUrl(url)) {
    return null;
  }

  const responseResult = await settleAsync(fetch(url));
  if (!responseResult.ok || !responseResult.value.ok) {
    return null;
  }

  const bufferResult = await settleAsync(responseResult.value.arrayBuffer());
  if (!bufferResult.ok) {
    return null;
  }

  return new Uint8Array(bufferResult.value);
};

const normalizeImageOutput = async (
  output: unknown,
): Promise<{ bytes: Uint8Array; mimeType: string } | null> => {
  if (isByteArray(output)) {
    return { bytes: new Uint8Array(output), mimeType: "image/png" };
  }
  if (isArrayBuffer(output)) {
    return { bytes: new Uint8Array(output), mimeType: "image/png" };
  }
  if (isNonEmptyString(output)) {
    if (output.startsWith("data:")) {
      const parsed = decodeImageDataUrl(output);
      return parsed ? { bytes: parsed.bytes, mimeType: parsed.mimeType } : null;
    }
    if (isHttpUrl(output)) {
      const bytes = await fetchImageBytes(output);
      return bytes ? { bytes, mimeType: "image/png" } : null;
    }
    if (isLikelyBase64(output)) {
      const bytes = decodeBase64ToBytes(output);
      return bytes ? { bytes, mimeType: "image/png" } : null;
    }
    return null;
  }

  if (isRecord(output)) {
    const candidate = (output as ImageGenerationRawOutput).image;
    const parsedImage = candidate !== undefined ? await normalizeImageOutput(candidate) : null;
    if (parsedImage) {
      return parsedImage;
    }
    if ((output as ImageGenerationRawOutput).image_data !== undefined) {
      const parsedImageData = await normalizeImageOutput(
        (output as ImageGenerationRawOutput).image_data,
      );
      if (parsedImageData) {
        return parsedImageData;
      }
    }

    const dataValue = (output as ImageGenerationRawOutput).data;
    if (dataValue !== undefined) {
      const parsedData = await normalizeImageOutput(dataValue);
      if (parsedData) {
        return parsedData;
      }
    }

    const imagesValue = (output as ImageGenerationRawOutput).images;
    if (imagesValue) {
      const imagesArray = Array.isArray(imagesValue) ? imagesValue : [imagesValue];
      for (const imageValue of imagesArray) {
        const parsedImage = await normalizeImageOutput(imageValue);
        if (parsedImage) {
          return parsedImage;
        }
      }
    }
  }

  if (Array.isArray(output)) {
    for (const imageValue of output) {
      const parsed = await normalizeImageOutput(imageValue);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
};

const resolveImageGenerationDimensions = (
  aspectRatio: "square" | "landscape" | "portrait" = "square",
): { readonly width: number; readonly height: number } => {
  switch (aspectRatio) {
    case "landscape":
      return {
        width: appConfig.ai.imageGenerationLandscapeWidthPx,
        height: appConfig.ai.imageGenerationLandscapeHeightPx,
      };
    case "portrait":
      return {
        width: appConfig.ai.imageGenerationPortraitWidthPx,
        height: appConfig.ai.imageGenerationPortraitHeightPx,
      };
    case "square":
    default:
      return {
        width: appConfig.ai.imageGenerationSquareSizePx,
        height: appConfig.ai.imageGenerationSquareSizePx,
      };
  }
};

const isSentimentResult = (value: unknown): value is SentimentResult =>
  isRecord(value) &&
  (value.label === "POSITIVE" || value.label === "NEGATIVE") &&
  typeof value.score === "number" &&
  Number.isFinite(value.score);

const isSentimentResultArray = (value: unknown): value is SentimentResult[] =>
  Array.isArray(value) && value.length > 0 && value.every(isSentimentResult);

const isGenerationOutput = (value: unknown): value is { generated_text: string }[] =>
  Array.isArray(value) &&
  value.every((entry) => isRecord(entry) && isNonEmptyString(entry.generated_text));

const isTensorLike = (value: unknown): value is TensorLike =>
  isRecord(value) &&
  "data" in value &&
  (isFloat32Array(value.data) ||
    isFloat64Array(value.data) ||
    (Array.isArray(value.data) && isNumericArray(value.data)));

const _isAsrOutput = (value: unknown): value is AsrOutput =>
  isRecord(value) && typeof value.text === "string";

const isTranscriptionOutput = (value: unknown): value is AsrOutput | string =>
  isRecord(value) ? isNonEmptyString(value.text) : isNonEmptyString(value);

const isTtsOutput = (value: unknown): value is TtsOutput =>
  isRecord(value) &&
  isFloat32Array(value.audio) &&
  value.audio.length > 0 &&
  typeof value.sampling_rate === "number" &&
  value.sampling_rate > 0;

/**
 * Singleton local AI model manager with lazy warmup and circuit-breaker backoff.
 */
export class ModelManager implements LocalModelRuntime {
  private static _instance: ModelManager | null = null;
  private static _instancePromise: Promise<ModelManager> | null = null;

  private readonly _pipelineCache = new LocalModelPipelineCache();
  private readonly _health = new LocalModelRuntimeHealth({
    circuitBreakerThreshold: appConfig.ai.circuitBreakerThreshold,
    cooldownMs: appConfig.ai.pipelineTimeoutMs * appConfig.ai.circuitBreakerCooldownMultiplier,
  });
  private _ready = false;
  private _warmupPromise: Promise<void> | null = null;

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
    if (this._ready || this._health.isCircuitOpen()) {
      return;
    }

    if (!this._warmupPromise) {
      this._warmupPromise = this._warmup().then(
        () => {
          this._warmupPromise = null;
        },
        (error) => {
          this._warmupPromise = null;
          throw error;
        },
      );
    }

    await this._warmupPromise;
  }

  /**
   * Returns (and caches) a pipeline for the given registry key.
   */
  public async getPipeline(key: ModelKey): Promise<AnyPipeline> {
    const result = await this._getPipelineResult(key);
    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    return result.value;
  }

  /**
   * Classifies text sentiment with a typed local-model result.
   *
   * @param text Input text.
   * @returns Typed sentiment result.
   */
  public async analyzeSentimentResult(text: string): Promise<LocalSentimentOperationResult> {
    const pipe = await this._getPipelineResult("sentiment");
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const result = await runLocalModelOperation<SentimentResult[]>({
      operation: "sentiment.classify",
      modelKey: "sentiment",
      timeoutMs: appConfig.ai.pipelineTimeoutMs,
      execute: () =>
        (pipe.value as (input: string, options?: Record<string, unknown>) => Promise<unknown>)(
          text,
          {},
        ),
      validate: isSentimentResultArray,
      invalidMessage: "Sentiment model returned an invalid payload.",
    });
    if (!result.ok) {
      return this._failOperation("model.sentiment.failed", result.failure);
    }

    this._health.markSuccess();
    const topResult = result.value[0];
    if (topResult === undefined) {
      return this._failOperation("model.sentiment.failed", {
        code: "invalid-output",
        message: "Sentiment model returned no predictions.",
        operation: "sentiment.classify",
        modelKey: "sentiment",
        retryable: false,
      });
    }
    return localModelSuccess(topResult);
  }

  /**
   * Classifies text sentiment.
   *
   * @param text Input text.
   * @returns Sentiment result or null.
   */
  async analyzeSentiment(text: string): Promise<SentimentResult | null> {
    return unwrapLocalModelResult(await this.analyzeSentimentResult(text));
  }

  /**
   * Generates an oracle fortune string from user prompt.
   *
   * @param question User prompt.
   * @returns Generated oracle text or null.
   */
  async generateOracle(question: string): Promise<string | null> {
    const prompt = `Respond creatively to this game design prompt: "${question}" `;
    const result = await this.generateTextResult("oracle", prompt, prompt);
    return result.ok ? result.value.text : null;
  }

  /**
   * Generates text from a configured local text-generation pipeline with a typed result.
   *
   * @param modelKey Target model registry key.
   * @param prompt Prompt passed to the local pipeline.
   * @param stripPrefix Optional prefix to strip from generated text.
   * @returns Typed text-generation result.
   */
  async generateTextResult(
    modelKey: Extract<ModelKey, "oracle" | "npcDialogue">,
    prompt: string,
    stripPrefix?: string,
  ): Promise<LocalTextGenerationOperationResult> {
    const pipe = await this._getPipelineResult(modelKey);
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const entry = MODEL_REGISTRY[modelKey];
    const result = await runLocalModelOperation<Array<{ readonly generated_text: string }>>({
      operation: `${modelKey}.generate`,
      modelKey,
      timeoutMs: appConfig.ai.pipelineTimeoutMs,
      execute: () =>
        (pipe.value as (input: string, options?: Record<string, unknown>) => Promise<unknown>)(
          prompt,
          entry.generationConfig ?? {},
        ),
      validate: isGenerationOutput,
      invalidMessage: `${modelKey} generation returned an invalid payload.`,
    });
    if (!result.ok) {
      return this._failOperation(`model.${modelKey}.failed`, result.failure);
    }

    const firstGeneration = result.value[0];
    if (!firstGeneration) {
      return this._failOperation(`model.${modelKey}.failed`, {
        code: "invalid-output",
        message: `${modelKey} generation returned an empty payload.`,
        retryable: false,
        operation: `${modelKey}.generate`,
        modelKey,
      });
    }

    const generated = firstGeneration.generated_text;
    const text =
      typeof stripPrefix === "string" && stripPrefix.length > 0 && generated.startsWith(stripPrefix)
        ? generated.slice(stripPrefix.length).trim()
        : generated.trim();

    if (text.length === 0) {
      return this._failOperation(`model.${modelKey}.failed`, {
        code: "invalid-output",
        message: `${modelKey} generation returned empty text.`,
        retryable: false,
        operation: `${modelKey}.generate`,
        modelKey,
      });
    }

    this._health.markSuccess();
    return localModelSuccess({ text });
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
    const result = await this.generateTextResult(modelKey, prompt, stripPrefix);
    return result.ok ? result.value.text : null;
  }

  /**
   * Generates a normalized embedding vector with a typed result.
   *
   * @param text Input text.
   * @returns Typed embedding result.
   */
  async generateEmbeddingResult(text: string): Promise<LocalEmbeddingOperationResult> {
    const pipe = await this._getPipelineResult("embeddings");
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const result = await runLocalModelOperation<TensorLike>({
      operation: "embeddings.generate",
      modelKey: "embeddings",
      timeoutMs: appConfig.ai.pipelineTimeoutMs,
      execute: () =>
        (pipe.value as (input: string, options?: Record<string, unknown>) => Promise<unknown>)(
          text,
          {
            pooling: "mean",
            normalize: true,
          },
        ),
      validate: (value): value is TensorLike => isTensorLike(value) && value.data.length > 0,
      invalidMessage: "Embedding model returned an invalid payload.",
    });
    if (!result.ok) {
      return this._failOperation("model.embeddings.failed", result.failure);
    }

    const values =
      result.value.data instanceof Float32Array
        ? result.value.data
        : result.value.data instanceof Float64Array
          ? Float32Array.from(result.value.data)
          : Float32Array.from(result.value.data);

    this._health.markSuccess();
    return localModelSuccess({ embedding: values });
  }

  /**
   * Generates a normalized embedding vector.
   *
   * @param text Input text.
   * @returns Embedding vector or null when the model fails.
   */
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    const result = await this.generateEmbeddingResult(text);
    return result.ok ? result.value.embedding : null;
  }

  /**
   * Generates an image from prompt text with a typed local result.
   *
   * @param prompt Image generation prompt.
   * @returns Typed image-generation result.
   */
  async generateImageResult(
    prompt: string,
    aspectRatio: "square" | "landscape" | "portrait" = "square",
  ): Promise<LocalImageGenerationOperationResult> {
    if (
      !appConfig.ai.localImageGenerationEnabled ||
      appConfig.ai.localImageGenerationModel.trim().length === 0
    ) {
      return this._failOperation("model.image-generation.failed", {
        code: "unavailable",
        message: "Local image generation is disabled or not configured.",
        retryable: false,
        operation: "image-generation.generate",
        modelKey: "imageGeneration",
      });
    }

    const pipe = await this._getPipelineResult("imageGeneration");
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const dimensions = resolveImageGenerationDimensions(aspectRatio);
    const result = await runLocalModelOperation<unknown>({
      operation: "image-generation.generate",
      modelKey: "imageGeneration",
      timeoutMs: appConfig.ai.pipelineTimeoutMs * 8,
      execute: () =>
        (pipe.value as (input: string, options?: Record<string, unknown>) => Promise<unknown>)(
          prompt,
          {
            num_inference_steps: appConfig.ai.imageGenerationSteps,
            guidance_scale: appConfig.ai.imageGenerationGuidanceScale,
            width: dimensions.width,
            height: dimensions.height,
          },
        ),
      validate: (_value): _value is unknown => true,
      invalidMessage: "Image generation model returned an invalid payload.",
    });
    if (!result.ok) {
      return this._failOperation("model.image-generation.failed", result.failure);
    }

    const normalized = await normalizeImageOutput(result.value);
    if (!normalized) {
      return this._failOperation("model.image-generation.failed", {
        code: "invalid-output",
        message: "Image generation model output could not be parsed.",
        retryable: false,
        operation: "image-generation.generate",
        modelKey: "imageGeneration",
      });
    }

    this._health.markSuccess();
    return localModelSuccess({
      image: normalized.bytes,
      mimeType: normalized.mimeType,
    });
  }

  /**
   * Runs automatic speech recognition against mono PCM audio with a typed result.
   *
   * @param audio Mono PCM audio.
   * @returns Typed transcription result.
   */
  async transcribeAudioResult(audio: Float32Array): Promise<LocalTranscriptionOperationResult> {
    const pipe = await this._getPipelineResult("speechToText");
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const result = await runLocalModelOperation<AsrOutput | string>({
      operation: "speech-to-text.transcribe",
      modelKey: "speechToText",
      timeoutMs: appConfig.ai.pipelineTimeoutMs * 4,
      execute: () => (pipe.value as AutomaticSpeechRecognitionPipelineCallback)(audio, {}),
      validate: isTranscriptionOutput,
      invalidMessage: MODEL_STT_INVALID_PAYLOAD_ERROR,
    });
    if (!result.ok) {
      return this._failOperation("model.stt.failed", result.failure);
    }

    const text = typeof result.value === "string" ? result.value.trim() : result.value.text?.trim();
    if (!text || text.length === 0) {
      return this._failOperation("model.stt.failed", {
        code: "invalid-output",
        message: MODEL_STT_EMPTY_TEXT_ERROR,
        retryable: false,
        operation: "speech-to-text.transcribe",
        modelKey: "speechToText",
      });
    }

    this._health.markSuccess();
    return localModelSuccess({ text });
  }

  /**
   * Runs automatic speech recognition against mono PCM audio.
   *
   * @param audio Mono PCM audio.
   * @returns Recognized text or null on failure.
   */
  async transcribeAudio(audio: Float32Array): Promise<string | null> {
    const result = await this.transcribeAudioResult(audio);
    return result.ok ? result.value.text : null;
  }

  /**
   * Synthesizes mono PCM audio from text with a typed result.
   *
   * @param text Input text to synthesize.
   * @returns Typed speech-synthesis result.
   */
  async synthesizeSpeechResult(text: string): Promise<LocalSpeechSynthesisOperationResult> {
    const pipe = await this._getPipelineResult("textToSpeech");
    if (!pipe.ok) {
      return localModelFailure(pipe.failure);
    }

    const result = await runLocalModelOperation<TtsOutput>({
      operation: "text-to-speech.synthesize",
      modelKey: "textToSpeech",
      timeoutMs: appConfig.ai.pipelineTimeoutMs * 4,
      execute: () =>
        (pipe.value as (input: string, options?: Record<string, unknown>) => Promise<unknown>)(
          text,
          {
            speaker_embeddings: appConfig.ai.textToSpeechSpeakerEmbeddings,
          },
        ),
      validate: isTtsOutput,
      invalidMessage: "Text-to-speech model returned an invalid payload.",
    });
    if (!result.ok) {
      return this._failOperation("model.tts.failed", result.failure);
    }

    this._health.markSuccess();
    return localModelSuccess({
      audio: result.value.audio,
      sampleRate: result.value.sampling_rate,
    });
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
    const result = await this.synthesizeSpeechResult(text);
    return result.ok ? result.value : null;
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
    this._pipelineCache.clear();
    this._ready = false;
    this._warmupPromise = null;
    this._health.reset();
    ModelManager._instance = null;
    ModelManager._instancePromise = null;

    logger.info("model.manager.disposed");
  }

  /**
   * Loads a pipeline into the cache and returns a typed local-model result.
   *
   * @param key Registry key.
   * @returns Typed pipeline load result.
   */
  private async _getPipelineResult(key: ModelKey): Promise<LocalModelResult<AnyPipeline>> {
    const cached = this._pipelineCache.get(key);
    if (cached) {
      return localModelSuccess(cached);
    }

    if (this._health.isCircuitOpen()) {
      const failure: LocalModelFailure = {
        code: "circuit-open",
        message: "Local model runtime is cooling down after repeated failures.",
        retryable: true,
        operation: "pipeline.load",
        modelKey: key,
      };
      this._logFailure("model.pipeline.circuit-open", failure);
      return localModelFailure(failure);
    }

    const loadResult = await loadModelPipeline(key);
    if (!loadResult.ok) {
      return this._failOperation("model.pipeline.load.failed", loadResult.failure);
    }

    this._health.markSuccess();
    this._pipelineCache.set(key, loadResult.value.pipeline);
    if (loadResult.value.recoveredCache) {
      logger.warn("model.cache.recovered", {
        key,
        model: MODEL_REGISTRY[key].model,
        recovery: "cache-corruption-recovered",
      });
    }
    logger.info("model.loaded", {
      key,
      model: MODEL_REGISTRY[key].model,
      recoveredCache: loadResult.value.recoveredCache,
      cacheRecovery: loadResult.value.recoveredCache ? "cache-corruption-recovered" : "none",
    });
    return localModelSuccess(loadResult.value.pipeline);
  }

  /**
   * Performs a single warmup attempt with timeout safeguards.
   */
  private async _warmup(): Promise<void> {
    const result = await this._getPipelineResult("sentiment");
    if (!result.ok) {
      logger.warn("model.warmup.failed", localModelFailureToLogData(result.failure));
      return;
    }

    this._ready = true;
    logger.info("model.warmup.complete", { model: MODEL_REGISTRY.sentiment.model });
  }

  /**
   * Tracks and logs one structured local-model failure.
   *
   * @template TValue Result payload type.
   * @param event Log event name.
   * @param failure Structured failure payload.
   * @returns Failed local-model result.
   */
  private _failOperation<TValue>(
    event: string,
    failure: LocalModelFailure,
  ): ReturnType<typeof localModelFailure<TValue>> {
    const health = this._health.recordFailure(failure);
    logger.warn("model.failure.recorded", {
      ...localModelFailureToLogData(failure),
      consecutiveFailures: health.consecutiveFailures,
      circuitOpenUntilMs: health.circuitOpenUntilMs,
    });
    this._logFailure(event, failure);
    return localModelFailure(failure);
  }

  /**
   * Emits consistent structured logging for local-model failures.
   *
   * @param event Log event name.
   * @param failure Structured failure payload.
   */
  private _logFailure(event: string, failure: LocalModelFailure): void {
    logger.error(event, localModelFailureToLogData(failure));
  }
}

export type { SentimentResult } from "./local-model-contract.ts";

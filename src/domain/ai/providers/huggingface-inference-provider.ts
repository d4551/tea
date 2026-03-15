/**
 * Hugging Face Inference API Provider
 *
 * HTTP client for Hugging Face inference endpoints. Supports
 * text-generation (chat) and text-to-image (image generation) tasks
 * for both serverless Inference API and custom endpoint URLs.
 * Configuration is read from `appConfig.ai`.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import {
  createHttpExternalFailure,
  type ExternalBoundaryResult,
  type ExternalFailure,
  externalFailure,
  externalSuccess,
  toExternalFailure,
  toRetryableError,
} from "../../../shared/contracts/external-boundary.ts";
import { readJsonResponse, settleAsync } from "../../../shared/utils/async-result.ts";
import { isRecord } from "../../../shared/utils/safe-json.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiImageGenerationParams,
  AiImageGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "./provider-types.ts";

const logger = createLogger("ai.provider.huggingface-inference");

/** Maximum allowed prompt length for image generation requests. */
const IMAGE_PROMPT_MAX_LENGTH = 1000;
type HuggingFaceInferenceProviderName = "huggingface-inference" | "huggingface-endpoints";

const readString = (value: unknown): string | null => (typeof value === "string" ? value : null);

/**
 * Parses a Hugging Face text-generation response.
 * HF returns `[{ generated_text: string }]` for text-generation tasks.
 *
 * @param value Raw parsed JSON.
 * @returns Generated text or null on invalid payload.
 */
const parseTextGenerationResponse = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value.trim().length > 0 ? value.trim() : null;
  }

  if (Array.isArray(value) && value.length > 0 && isRecord(value[0])) {
    const text = readString(value[0].generated_text);
    if (text !== null && text.trim().length > 0) {
      return text.trim();
    }
  }

  if (isRecord(value)) {
    const directText =
      readString(value.generated_text) ?? readString(value.generated_text_with_prompt);
    if (directText !== null && directText.trim().length > 0) {
      return directText.trim();
    }

    const generated = readString((value as { generated_text?: string }).generated_text);
    if (generated !== null && generated.trim().length > 0) {
      return generated.trim();
    }

    const nestedText = readString((value as { text?: string }).text);
    if (nestedText !== null && nestedText.trim().length > 0) {
      return nestedText.trim();
    }

    if (value.generated_text_with_prompt !== undefined) {
      const generatedWithPrompt = readString(
        (value as { generated_text_with_prompt?: string }).generated_text_with_prompt,
      );
      if (generatedWithPrompt !== null && generatedWithPrompt.trim().length > 0) {
        return generatedWithPrompt.trim();
      }
    }
  }

  if (Array.isArray(value) && value.length > 0 && isRecord(value[1])) {
    const text = readString((value[1] as { generated_text?: string }).generated_text);
    if (text !== null && text.trim().length > 0) {
      return text.trim();
    }
  }

  return null;
};

/**
 * Resolves MIME type from the Content-Type header of an image response.
 *
 * @param contentType Content-Type header value.
 * @returns Normalized MIME type.
 */
const resolveImageMimeType = (contentType: string | null): string => {
  if (contentType?.includes("image/jpeg")) {
    return "image/jpeg";
  }
  if (contentType?.includes("image/webp")) {
    return "image/webp";
  }
  return "image/png";
};

const resolveImageDimensions = (
  aspectRatio: AiImageGenerationParams["aspectRatio"] = "square",
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
    default:
      return {
        width: appConfig.ai.imageGenerationSquareSizePx,
        height: appConfig.ai.imageGenerationSquareSizePx,
      };
  }
};

/**
 * Logs a structured external boundary failure.
 *
 * @param event Log event name.
 * @param failure Failure record.
 */
const logBoundaryFailure = (event: string, failure: ExternalFailure): void => {
  logger.warn(event, {
    operation: failure.operation ?? "unknown",
    code: failure.code,
    retryable: failure.retryable,
    statusCode: failure.statusCode ?? null,
    message: failure.message,
  });
};

/**
 * Hugging Face serverless Inference API provider.
 *
 * Implements chat (text-generation) and image generation (text-to-image)
 * via the HF Inference API. Requires a valid `HF_TOKEN` for authenticated
 * access to rate-limited serverless models.
 */
export class HuggingFaceInferenceProvider implements AiProvider {
  /** Unique provider registry name. */
  public readonly name: HuggingFaceInferenceProviderName;

  private readonly fetchImpl: typeof fetch;

  /**
   * Creates a Hugging Face Inference API provider.
   *
   * @param fetchImpl Injected fetch implementation for testability.
   */
  constructor(
    name: HuggingFaceInferenceProviderName = "huggingface-inference",
    fetchImpl: typeof fetch = fetch,
  ) {
    this.name = name;
    this.fetchImpl = fetchImpl;
  }

  private get huggingfaceInferenceConfig() {
    return appConfig.ai.huggingfaceInference;
  }

  private get huggingfaceEndpointsConfig() {
    return appConfig.ai.huggingfaceEndpoints;
  }

  private get isEndpointsMode(): boolean {
    return this.name === "huggingface-endpoints";
  }

  private getEffectiveApiKey(): string {
    if (this.isEndpointsMode) {
      return (
        this.huggingfaceEndpointsConfig.apiKey.trim() ||
        this.huggingfaceInferenceConfig.apiKey.trim()
      );
    }
    return this.huggingfaceInferenceConfig.apiKey.trim();
  }

  private getDefaultChatModel(): string {
    return this.huggingfaceInferenceConfig.chatModel.trim();
  }

  private getDefaultImageModel(): string {
    return this.huggingfaceInferenceConfig.imageModel.trim();
  }

  private resolveChatEndpoint(model: string): string {
    if (this.isEndpointsMode && this.huggingfaceEndpointsConfig.chatUrl !== null) {
      return this.huggingfaceEndpointsConfig.chatUrl;
    }

    return `${this.huggingfaceInferenceConfig.baseUrl.replace(/\/$/u, "")}/models/${encodeURIComponent(model)}`;
  }

  private resolveImageEndpoint(model: string): string {
    if (this.isEndpointsMode && this.huggingfaceEndpointsConfig.imageUrl !== null) {
      return this.huggingfaceEndpointsConfig.imageUrl;
    }

    return `${this.huggingfaceInferenceConfig.baseUrl.replace(/\/$/u, "")}/models/${encodeURIComponent(model)}`;
  }

  private canServeChat(): boolean {
    return this.isEndpointsMode ? this.huggingfaceEndpointsConfig.chatUrl !== null : true;
  }

  private canServeImage(): boolean {
    return this.isEndpointsMode ? this.huggingfaceEndpointsConfig.imageUrl !== null : true;
  }

  private async probeConfiguredModel(model: string): Promise<boolean> {
    if (this.isEndpointsMode) {
      return true;
    }

    const normalizedModel = model.trim();
    if (normalizedModel.length === 0) {
      return false;
    }

    const response = await settleAsync(
      this.fetchImpl(
        `${this.huggingfaceInferenceConfig.baseUrl}/api/models/${encodeURIComponent(normalizedModel)}`,
        {
          method: "GET",
          headers: this.buildAuthHeaders(),
          signal: AbortSignal.timeout(this.huggingfaceInferenceConfig.availabilityTimeoutMs),
        },
      ),
    );

    return response.ok && response.value.ok;
  }

  /**
   * Builds the authorization headers for HF API requests.
   *
   * @returns Headers record containing the Bearer token when configured.
   */
  private buildAuthHeaders(): Record<string, string> {
    const apiKey = this.getEffectiveApiKey();
    return apiKey.length > 0 ? { authorization: `Bearer ${apiKey}` } : {};
  }

  /**
   * Executes a fetch request against the HF Inference API with boundary error handling.
   *
   * @param url Full API URL.
   * @param operation Logical operation label for diagnostics.
   * @param options Fetch init options.
   * @returns Boundary result wrapping the fetch Response.
   */
  private async hfFetchResult(
    url: string,
    operation: string,
    options: RequestInit = {},
  ): Promise<ExternalBoundaryResult<Response>> {
    const result = await settleAsync(
      this.fetchImpl(url, {
        ...options,
        headers: {
          ...this.buildAuthHeaders(),
          ...options.headers,
        },
      }),
    );

    if (!result.ok) {
      return externalFailure(
        toExternalFailure({
          source: "provider",
          error: result.error,
          provider: this.name,
          operation,
          fallbackCode: "network",
        }),
      );
    }

    return externalSuccess(result.value);
  }

  /**
   * Checks whether the HF Inference API is reachable by probing the model metadata endpoint.
   *
   * @returns True when the configured chat model metadata responds successfully.
   */
  async isAvailable(): Promise<boolean> {
    if (this.isEndpointsMode && !this.huggingfaceEndpointsConfig.enabled) {
      return false;
    }

    if (!this.huggingfaceInferenceConfig.enabled && !this.isEndpointsMode) {
      return false;
    }

    if (this.isEndpointsMode) {
      return (
        this.huggingfaceEndpointsConfig.chatUrl !== null ||
        this.huggingfaceEndpointsConfig.imageUrl !== null
      );
    }

    const probeTargets = [
      this.canServeChat() ? this.getDefaultChatModel() : "",
      this.canServeImage() ? this.getDefaultImageModel() : "",
    ].filter((model, index, allModels) => model.length > 0 && allModels.indexOf(model) === index);

    if (probeTargets.length === 0) {
      return false;
    }

    const probeResults = await Promise.all(
      probeTargets.map((model) => this.probeConfiguredModel(model)),
    );
    return probeResults.some(Boolean);
  }

  /**
   * Returns provider readiness for diagnostics and routing.
   *
   * @returns Provider readiness status.
   */
  async readiness(): Promise<"ready" | "degraded" | "offline"> {
    return (await this.isAvailable()) ? "ready" : "offline";
  }

  /**
   * Reports static capabilities derived from the configured model identifiers.
   *
   * @returns Array of model capability descriptors.
   */
  async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    const capabilities: AiModelCapabilities[] = [];
    const chatModel = this.getDefaultChatModel();
    const imageModel = this.getDefaultImageModel();
    const chatReady =
      this.canServeChat() && (this.isEndpointsMode || (await this.probeConfiguredModel(chatModel)));
    const imageReady =
      this.canServeImage() &&
      (this.isEndpointsMode || (await this.probeConfiguredModel(imageModel)));

    if (chatModel.length > 0 && chatReady) {
      capabilities.push({
        provider: this.name,
        model: chatModel,
        capabilities: new Set<AiCapability>(["text-generation", "chat"]),
        maxContextLength: 0,
        supportsStreaming: false,
        runtime: "hf-inference-http",
        integration: this.name,
        local: false,
        configurable: true,
      });
    }

    if (imageModel.length > 0 && imageReady) {
      capabilities.push({
        provider: this.name,
        model: imageModel,
        capabilities: new Set<AiCapability>(["image-generation"]),
        maxContextLength: 0,
        supportsStreaming: false,
        runtime: "hf-inference-http",
        integration: this.name,
        local: false,
        configurable: true,
      });
    }

    return capabilities;
  }

  /**
   * Generates a chat completion via the HF text-generation endpoint.
   *
   * @param params Chat parameters including messages and optional system prompt.
   * @returns Generation result containing the model's response text.
   */
  async chat(params: AiChatParams): Promise<AiGenerationResult> {
    const startMs = performance.now();
    const model = (params.model ?? this.getDefaultChatModel()).trim();
    const endpoint = this.resolveChatEndpoint(model);
    if (!this.canServeChat()) {
      return {
        ok: false,
        error: "HF chat endpoint is not configured.",
        retryable: false,
      };
    }
    if (model.length === 0) {
      return {
        ok: false,
        error: "HF chat model is not configured.",
        retryable: false,
      };
    }

    const fullPrompt = [
      ...(params.systemPrompt ? [`System: ${params.systemPrompt}`] : []),
      ...params.messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
    ].join("\n");

    const response = await this.hfFetchResult(endpoint, "chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: params.maxTokens ?? 512,
          temperature: params.temperature ?? 0.7,
          return_full_text: false,
        },
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    });

    if (!response.ok) {
      return toRetryableError(response.failure);
    }

    if (!response.data.ok) {
      const httpFailure = createHttpExternalFailure({
        source: "provider",
        response: response.data,
        provider: this.name,
        operation: "chat",
        message: `HF Inference API returned HTTP ${response.data.status}`,
      });
      logBoundaryFailure("hf-inference.chat.http-failed", httpFailure);
      return toRetryableError(httpFailure);
    }

    const jsonResult = await readJsonResponse<unknown>(response.data);
    if (!jsonResult.ok) {
      const failure = toExternalFailure({
        source: "provider",
        error: jsonResult.error,
        provider: this.name,
        operation: "chat",
        message: "HF Inference API returned invalid JSON",
        fallbackCode: "invalid-response",
        retryable: true,
      });
      return toRetryableError(failure);
    }

    const text = parseTextGenerationResponse(jsonResult.value);
    if (text === null) {
      return {
        ok: false,
        error: "HF Inference API returned an invalid text-generation response payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      text,
      model,
      durationMs: Math.round(performance.now() - startMs),
    };
  }

  /**
   * Streams chat by delegating to the non-streaming chat endpoint.
   *
   * @param params Chat parameters.
   * @yields Single text result as a compatibility measure.
   */
  async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    const result = await this.chat(params);
    if (result.ok) {
      yield result.text;
    }
  }

  /**
   * Generates an image via the HF text-to-image endpoint.
   *
   * @param params Image generation parameters including a text prompt.
   * @returns Image bytes, MIME type, and model metadata.
   */
  async generateImage(params: AiImageGenerationParams): Promise<AiImageGenerationResult> {
    const startMs = performance.now();
    const model = (params.model ?? this.getDefaultImageModel()).trim();
    const endpoint = this.resolveImageEndpoint(model);
    if (!this.canServeImage()) {
      return {
        ok: false,
        error: "HF image-generation endpoint is not configured.",
        retryable: false,
      };
    }
    if (model.length === 0) {
      return {
        ok: false,
        error: "HF image model is not configured.",
        retryable: false,
      };
    }

    if (params.prompt.length > IMAGE_PROMPT_MAX_LENGTH) {
      return {
        ok: false,
        error: `Image generation prompt exceeds maximum length of ${IMAGE_PROMPT_MAX_LENGTH} characters`,
        retryable: false,
      };
    }

    const dimensions = resolveImageDimensions(params.aspectRatio);
    const response = await this.hfFetchResult(endpoint, "generate-image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inputs: params.prompt,
        parameters: {
          width: dimensions.width,
          height: dimensions.height,
          num_inference_steps: appConfig.ai.imageGenerationSteps,
          guidance_scale: appConfig.ai.imageGenerationGuidanceScale,
        },
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs * 4),
    });

    if (!response.ok) {
      logBoundaryFailure("hf-inference.generate-image.network-failed", response.failure);
      return toRetryableError(response.failure);
    }

    if (!response.data.ok) {
      const httpFailure = createHttpExternalFailure({
        source: "provider",
        response: response.data,
        provider: this.name,
        operation: "generate-image",
        message: `HF Inference API returned HTTP ${response.data.status}`,
      });
      logBoundaryFailure("hf-inference.generate-image.http-failed", httpFailure);
      return toRetryableError(httpFailure);
    }

    const imageResult = await settleAsync(response.data.arrayBuffer());
    if (!imageResult.ok) {
      const failure = toExternalFailure({
        source: "provider",
        error: imageResult.error,
        provider: this.name,
        operation: "generate-image",
        message: "Failed to read image bytes from HF Inference API response",
        fallbackCode: "invalid-response",
        retryable: true,
      });
      return toRetryableError(failure);
    }

    const mimeType = resolveImageMimeType(response.data.headers.get("content-type"));

    return {
      ok: true,
      image: new Uint8Array(imageResult.value),
      mimeType,
      model,
      durationMs: Math.round(performance.now() - startMs),
    };
  }

  /**
   * Text classification is not supported by this provider.
   *
   * @param _text Input text (unused).
   * @param _model Model override (unused).
   * @returns Always null.
   */
  async classify(_text: string, _model?: string): Promise<AiClassificationResult | null> {
    return null;
  }

  /**
   * Speech transcription is not supported by this provider.
   *
   * @param _params Transcription parameters (unused).
   * @returns Failure result.
   */
  async transcribeAudio(_params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    return {
      ok: false,
      error: "Speech transcription is not supported by the HF Inference provider",
      retryable: false,
    };
  }

  /**
   * Speech synthesis is not supported by this provider.
   *
   * @param _params Synthesis parameters (unused).
   * @returns Failure result.
   */
  async synthesizeSpeech(_params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult> {
    return {
      ok: false,
      error: "Speech synthesis is not supported by the HF Inference provider",
      retryable: false,
    };
  }

  /**
   * Vision analysis is not supported by this provider.
   *
   * @param _image Image bytes (unused).
   * @param _prompt Instruction (unused).
   * @returns Failure result.
   */
  async describeImage(_image: Uint8Array, _prompt: string): Promise<AiGenerationResult> {
    return {
      ok: false,
      error: "Vision analysis is not supported by the HF Inference provider",
      retryable: false,
    };
  }

  /**
   * Text embeddings are not supported by this provider.
   *
   * @param _text Input text (unused).
   * @returns Always null.
   */
  async generateEmbedding(_text: string): Promise<Float32Array | null> {
    return null;
  }

  /**
   * Releases provider resources.
   */
  async dispose(): Promise<void> {
    // No resources to release for HTTP-only provider.
  }
}

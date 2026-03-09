/**
 * Ollama AI Provider
 *
 * HTTP client for Ollama's local REST API. Communicates with a running
 * Ollama instance to provide chat, vision, embeddings, and model management.
 * All requests use Bun's native fetch — no third-party HTTP clients.
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
import { safeJsonParse } from "../../../shared/utils/safe-json.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "./provider-types.ts";

const logger = createLogger("ai.provider.ollama");

/**
 * Raw model entry from Ollama `/api/tags` response.
 */
interface OllamaModelEntry {
  readonly name: string;
  readonly model: string;
  readonly modified_at: string;
  readonly size: number;
  readonly digest: string;
  readonly details: {
    readonly parent_model?: string;
    readonly format: string;
    readonly family: string;
    readonly families: readonly string[] | null;
    readonly parameter_size: string;
    readonly quantization_level: string;
  };
}

/**
 * Raw show response from Ollama `/api/show`.
 */
interface OllamaShowResponse {
  readonly modelfile: string;
  readonly template: string;
  readonly details: {
    readonly parent_model?: string;
    readonly format: string;
    readonly family: string;
    readonly families: readonly string[] | null;
    readonly parameter_size: string;
    readonly quantization_level: string;
  };
  readonly model_info?: Record<string, unknown>;
}

/**
 * Raw chat response from Ollama `/api/chat` (non-streaming).
 */
interface OllamaChatResponse {
  readonly message: {
    readonly role: string;
    readonly content: string;
  };
  readonly done: boolean;
  readonly total_duration?: number;
  readonly eval_count?: number;
}

/**
 * Streaming chunk from Ollama NDJSON responses.
 */
interface OllamaStreamChunk {
  readonly message?: {
    readonly role: string;
    readonly content: string;
  };
  readonly done: boolean;
}

/**
 * Families that indicate vision capability.
 */
const VISION_FAMILIES: ReadonlySet<string> = new Set(["clip", "llava", "mllama"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const readNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const readStringArray = (value: unknown): readonly string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.every((entry) => typeof entry === "string") ? value : null;
};

const parseOllamaDetails = (value: unknown): OllamaModelEntry["details"] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const format = readString(value.format);
  const family = readString(value.family);
  const parameterSize = readString(value.parameter_size);
  const quantizationLevel = readString(value.quantization_level);
  if (!format || !family || !parameterSize || !quantizationLevel) {
    return null;
  }

  const familiesValue = value.families;
  const families = familiesValue === null ? null : (readStringArray(familiesValue) ?? null);

  return {
    parent_model: readString(value.parent_model) ?? undefined,
    format,
    family,
    families,
    parameter_size: parameterSize,
    quantization_level: quantizationLevel,
  };
};

const parseOllamaModelEntry = (value: unknown): OllamaModelEntry | null => {
  if (!isRecord(value)) {
    return null;
  }

  const name = readString(value.name);
  const model = readString(value.model);
  const modifiedAt = readString(value.modified_at);
  const size = readNumber(value.size);
  const digest = readString(value.digest);
  const details = parseOllamaDetails(value.details);
  if (!name || !model || !modifiedAt || size === null || !digest || !details) {
    return null;
  }

  return {
    name,
    model,
    modified_at: modifiedAt,
    size,
    digest,
    details,
  };
};

const parseOllamaTagsResponse = (value: unknown): readonly OllamaModelEntry[] => {
  if (!isRecord(value) || !Array.isArray(value.models)) {
    return [];
  }

  return value.models
    .map((entry) => parseOllamaModelEntry(entry))
    .filter((entry): entry is OllamaModelEntry => entry !== null);
};

const parseOllamaShowResponse = (value: unknown): OllamaShowResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  const modelfile = readString(value.modelfile);
  const template = readString(value.template);
  const details = parseOllamaDetails(value.details);
  if (!modelfile || !template || !details) {
    return null;
  }

  return {
    modelfile,
    template,
    details,
    model_info: isRecord(value.model_info) ? value.model_info : undefined,
  };
};

const parseOllamaChatResponse = (value: unknown): OllamaChatResponse | null => {
  if (!isRecord(value) || !isRecord(value.message)) {
    return null;
  }

  const role = readString(value.message.role);
  const content = readString(value.message.content);
  const done = typeof value.done === "boolean" ? value.done : null;
  if (!role || content === null || done === null) {
    return null;
  }

  return {
    message: {
      role,
      content,
    },
    done,
    total_duration: readNumber(value.total_duration) ?? undefined,
    eval_count: readNumber(value.eval_count) ?? undefined,
  };
};

const parseOllamaStreamChunk = (value: unknown): OllamaStreamChunk | null => {
  if (!isRecord(value)) {
    return null;
  }

  const done = typeof value.done === "boolean" ? value.done : null;
  if (done === null) {
    return null;
  }

  const message = isRecord(value.message)
    ? {
        role: readString(value.message.role) ?? "",
        content: readString(value.message.content) ?? "",
      }
    : undefined;

  return {
    message,
    done,
  };
};

const parseOllamaEmbeddingsResponse = (value: unknown): readonly number[][] => {
  if (!isRecord(value) || !Array.isArray(value.embeddings)) {
    return [];
  }

  return value.embeddings
    .filter((embedding): embedding is readonly unknown[] => Array.isArray(embedding))
    .map((embedding) =>
      embedding
        .map((entry) => readNumber(entry))
        .filter((entry): entry is number => entry !== null),
    )
    .filter((embedding) => embedding.length > 0);
};

/**
 * Detects capabilities from Ollama model metadata.
 *
 * @param entry Model entry from tags listing.
 * @param showData Optional show response with template info.
 * @returns Set of detected capabilities.
 */
const detectModelCapabilities = (
  entry: OllamaModelEntry,
  showData: OllamaShowResponse | null,
): Set<AiCapability> => {
  const caps = new Set<AiCapability>(["text-generation", "chat"]);

  const families = entry.details.families ?? [];
  for (const family of families) {
    if (VISION_FAMILIES.has(family.toLowerCase())) {
      caps.add("vision");
    }
  }

  if (showData?.template?.includes("tools")) {
    caps.add("tool-calling");
  }

  caps.add("embeddings");

  return caps;
};

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
 * Ollama provider implementation using the local REST API.
 */
export class OllamaProvider implements AiProvider {
  readonly name = "ollama";

  private _cachedCapabilities: readonly AiModelCapabilities[] = [];
  private _lastCapabilityCheckMs = 0;
  private _lastFailureMs = 0;
  private _consecutiveFailures = 0;

  /**
   * Creates an Ollama provider bound to a concrete fetch implementation.
   *
   * @param fetchImpl Native fetch implementation used for all Ollama requests.
   */
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  /**
   * Executes a timeout-bounded request against the configured Ollama API.
   *
   * @param path API path (for example `/api/chat`).
   * @param options Fetch options.
   * @returns Fetch response.
   */
  private async ollamaFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${appConfig.ai.ollamaBaseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), appConfig.ai.ollamaTimeoutMs);

    try {
      return await this.fetchImpl(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Executes an Ollama request into the shared external-boundary result contract.
   *
   * @param path API path (for example `/api/chat`).
   * @param operation Logical operation label.
   * @param options Fetch options.
   * @returns Fetch response result.
   */
  private async ollamaFetchResult(
    path: string,
    operation: string,
    options: RequestInit = {},
  ): Promise<ExternalBoundaryResult<Response>> {
    const response = await settleAsync(this.ollamaFetch(path, options));
    if (!response.ok) {
      return externalFailure(
        toExternalFailure({
          source: "provider",
          error: response.error,
          provider: this.name,
          operation,
          fallbackCode: "network",
        }),
      );
    }

    return externalSuccess(response.value);
  }

  /**
   * Reads and validates a JSON payload from an Ollama response.
   *
   * @template TPayload Parsed payload type.
   * @param operation Logical operation label.
   * @param response HTTP response.
   * @param parser Payload parser.
   * @param invalidMessage User-facing invalid-payload message.
   * @returns Parsed response result.
   */
  private async readParsedJsonResponse<TPayload>(
    operation: string,
    response: Response,
    parser: (value: unknown) => TPayload | null,
    invalidMessage: string,
  ): Promise<ExternalBoundaryResult<TPayload>> {
    if (!response.ok) {
      return externalFailure(
        createHttpExternalFailure({
          source: "provider",
          response,
          provider: this.name,
          operation,
          message: `Ollama provider returned HTTP ${response.status}`,
        }),
      );
    }

    const responseJson = await readJsonResponse<unknown>(response);
    if (!responseJson.ok) {
      return externalFailure(
        toExternalFailure({
          source: "provider",
          error: responseJson.error,
          provider: this.name,
          operation,
          message: invalidMessage,
          fallbackCode: "invalid-response",
          retryable: true,
        }),
      );
    }

    const payload = parser(responseJson.value);
    if (!payload) {
      return externalFailure({
        source: "provider",
        code: "invalid-response",
        message: invalidMessage,
        retryable: true,
        provider: this.name,
        operation,
      });
    }

    return externalSuccess(payload);
  }

  /**
   * Checks whether the Ollama server is reachable.
   *
   * @returns True when a running Ollama instance responds.
   */
  async isAvailable(): Promise<boolean> {
    if (!appConfig.ai.ollamaEnabled) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      appConfig.ai.ollamaAvailabilityTimeoutMs,
    );

    const response = await settleAsync(
      this.fetchImpl(appConfig.ai.ollamaBaseUrl, {
        signal: controller.signal,
      }),
    );

    clearTimeout(timeoutId);
    const available = response.ok && response.value.ok;
    if (!available) {
      this._lastFailureMs = Date.now();
      this._consecutiveFailures += 1;
    } else {
      this._consecutiveFailures = 0;
    }

    return available;
  }

  /**
   * Provides provider readiness for diagnostics and routing.
   *
   * @returns Readiness status.
   */
  async readiness(): Promise<"ready" | "degraded" | "offline"> {
    const available = await this.isAvailable();
    if (!available) {
      return "offline";
    }

    if (
      this._consecutiveFailures > 0 &&
      Date.now() - this._lastFailureMs < appConfig.ai.commandRetryBudgetMs
    ) {
      return "degraded";
    }

    return "ready";
  }

  /**
   * Lists all installed models and inspects each for capabilities.
   *
   * @returns Array of model capability descriptors.
   */
  async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    const now = Date.now();
    if (
      this._cachedCapabilities.length > 0 &&
      now - this._lastCapabilityCheckMs < appConfig.ai.capabilityRefreshIntervalMs
    ) {
      return this._cachedCapabilities;
    }

    const response = await this.ollamaFetchResult("/api/tags", "detect-capabilities");
    if (!response.ok) {
      logBoundaryFailure("ollama.tags.failed", response.failure);
      this._consecutiveFailures += 1;
      this._lastFailureMs = Date.now();
      return [];
    }

    const dataResult = await this.readParsedJsonResponse(
      "detect-capabilities",
      response.data,
      (value) => parseOllamaTagsResponse(value),
      "Ollama tags response payload is invalid",
    );
    if (!dataResult.ok) {
      logBoundaryFailure("ollama.tags.failed", dataResult.failure);
      this._consecutiveFailures += 1;
      this._lastFailureMs = Date.now();
      return [];
    }

    const capabilities: AiModelCapabilities[] = [];

    for (const entry of dataResult.data) {
      let showData: OllamaShowResponse | null = null;

      const showResponse = await this.ollamaFetchResult("/api/show", "show-model", {
        method: "POST",
        body: JSON.stringify({ name: entry.name }),
      });

      if (showResponse.ok && showResponse.data.ok) {
        const showPayload = await this.readParsedJsonResponse(
          "show-model",
          showResponse.data,
          parseOllamaShowResponse,
          "Ollama show-model payload is invalid",
        );
        if (showPayload.ok) {
          showData = showPayload.data;
        }
      }

      const caps = detectModelCapabilities(entry, showData);

      const paramSize = entry.details.parameter_size ?? "";
      const contextLength = paramSize.includes("B") ? Number.parseInt(paramSize, 10) * 1024 : 4096;

      capabilities.push({
        provider: this.name,
        model: entry.name,
        capabilities: caps,
        maxContextLength: contextLength,
        supportsStreaming: true,
        runtime: "ollama-http",
        integration: "ollama",
        local: true,
        configurable: true,
      });
    }

    this._cachedCapabilities = capabilities;
    this._lastCapabilityCheckMs = now;
    this._consecutiveFailures = 0;

    logger.info("ollama.capabilities.detected", {
      modelCount: capabilities.length,
      models: capabilities.map((c) => ({
        model: c.model,
        capabilities: [...c.capabilities],
      })),
    });

    return capabilities;
  }

  /**
   * Non-streaming chat completion via Ollama.
   *
   * @param params Chat parameters.
   * @returns Generation result.
   */
  async chat(params: AiChatParams): Promise<AiGenerationResult> {
    const startMs = Date.now();
    const model = params.model ?? appConfig.ai.ollamaChatModel;

    const messages = [
      ...(params.systemPrompt ? [{ role: "system" as const, content: params.systemPrompt }] : []),
      ...params.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.images?.length ? { images: m.images } : {}),
      })),
    ];

    const response = await this.ollamaFetchResult("/api/chat", "chat", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: params.temperature ?? 0.7,
          ...(params.maxTokens ? { num_predict: params.maxTokens } : {}),
        },
        keep_alive: `${appConfig.ai.ollamaKeepAliveMs}ms`,
      }),
    });

    if (!response.ok) {
      return toRetryableError(response.failure);
    }

    const result = await this.readParsedJsonResponse(
      "chat",
      response.data,
      parseOllamaChatResponse,
      "Ollama chat failed: invalid response payload",
    );
    if (!result.ok) {
      return toRetryableError(result.failure);
    }
    const durationMs = Date.now() - startMs;

    return {
      ok: true,
      text: result.data.message.content,
      model,
      durationMs,
    };
  }

  /**
   * Streaming chat completion via Ollama NDJSON.
   *
   * @param params Chat parameters.
   * @returns Async generator yielding token strings.
   */
  async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    const model = params.model ?? appConfig.ai.ollamaChatModel;

    const messages = [
      ...(params.systemPrompt ? [{ role: "system" as const, content: params.systemPrompt }] : []),
      ...params.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.images?.length ? { images: m.images } : {}),
      })),
    ];

    const response = await this.ollamaFetchResult("/api/chat", "chat-stream", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature: params.temperature ?? 0.7,
          ...(params.maxTokens ? { num_predict: params.maxTokens } : {}),
        },
        keep_alive: `${appConfig.ai.ollamaKeepAliveMs}ms`,
      }),
    });

    if (!response.ok || !response.data.body) {
      if (!response.ok) {
        logBoundaryFailure("ollama.chat-stream.failed", response.failure);
      }
      return;
    }

    const reader = response.data.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const chunk = await settleAsync(reader.read());
      if (!chunk.ok) {
        logBoundaryFailure(
          "ollama.chat-stream.failed",
          toExternalFailure({
            source: "provider",
            error: chunk.error,
            provider: this.name,
            operation: "chat-stream",
            fallbackCode: "network",
          }),
        );
        break;
      }

      const { done, value } = chunk.value;
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim().length === 0) {
          continue;
        }

        const chunk = parseOllamaStreamChunk(safeJsonParse<unknown>(line, null));
        if (!chunk) {
          continue;
        }
        if (chunk.message?.content) {
          yield chunk.message.content;
        }

        if (chunk.done) {
          return;
        }
      }
    }
  }

  /**
   * Text classification is not natively supported by Ollama.
   * Returns null to signal the registry should route elsewhere.
   *
   * @param _text Input text (unused).
   * @param _model Model override (unused).
   * @returns Always null.
   */
  async classify(_text: string, _model?: string): Promise<AiClassificationResult | null> {
    return null;
  }

  /**
   * Speech transcription is not routed through Ollama in this app.
   *
   * @param _params Audio transcription parameters.
   * @returns Failure result.
   */
  async transcribeAudio(_params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    return {
      ok: false,
      error: "Speech recognition is handled by the local Transformers.js provider.",
      retryable: false,
    };
  }

  /**
   * Speech synthesis is not routed through Ollama in this app.
   *
   * @param _params Speech synthesis parameters.
   * @returns Failure result.
   */
  async synthesizeSpeech(_params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult> {
    return {
      ok: false,
      error: "Speech synthesis is handled by the local Transformers.js provider.",
      retryable: false,
    };
  }

  /**
   * Analyses an image using a vision-capable Ollama model.
   *
   * @param image Raw image bytes.
   * @param prompt Instruction for the vision model.
   * @returns Generation result with image description.
   */
  async describeImage(image: Uint8Array, prompt: string): Promise<AiGenerationResult> {
    const startMs = Date.now();
    const model = appConfig.ai.ollamaVisionModel;
    const base64Image = Buffer.from(image).toString("base64");

    return this.chat({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [base64Image],
        },
      ],
    }).then((result) => ({
      ...result,
      durationMs: result.ok ? Date.now() - startMs : 0,
    }));
  }

  /**
   * Generates a text embedding via Ollama's embeddings endpoint.
   *
   * @param text Input text.
   * @returns Float32 embedding vector, or null on failure.
   */
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    const model = appConfig.ai.ollamaChatModel;

    const response = await this.ollamaFetchResult("/api/embeddings", "embedding", {
      method: "POST",
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) {
      return null;
    }

    const embeddingsResult = await this.readParsedJsonResponse(
      "embedding",
      response.data,
      (value) => parseOllamaEmbeddingsResponse(value),
      "Ollama embeddings payload is invalid",
    );
    if (!embeddingsResult.ok) {
      return null;
    }

    const firstEmbedding = embeddingsResult.data[0];
    return firstEmbedding ? new Float32Array(firstEmbedding) : null;
  }

  /**
   * Releases cached capability data. Ollama connections are stateless HTTP.
   */
  async dispose(): Promise<void> {
    this._cachedCapabilities = [];
    this._lastCapabilityCheckMs = 0;
    logger.info("ollama.provider.disposed");
  }
}

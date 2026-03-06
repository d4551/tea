/**
 * Ollama AI Provider
 *
 * HTTP client for Ollama's local REST API. Communicates with a running
 * Ollama instance to provide chat, vision, embeddings, and model management.
 * All requests use Bun's native fetch — no third-party HTTP clients.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiModelCapabilities,
  AiProvider,
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

/**
 * Builds a fetch request with timeout for the Ollama API.
 *
 * @param path API path (e.g. "/api/chat").
 * @param options Fetch options.
 * @returns Fetch response.
 */
const ollamaFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${appConfig.ai.ollamaBaseUrl}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), appConfig.ai.ollamaTimeoutMs);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  clearTimeout(timeoutId);
  return response;
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

    const response = await fetch(appConfig.ai.ollamaBaseUrl, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    const available = response?.ok ?? false;
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

    const response = await ollamaFetch("/api/tags").catch(() => null);
    if (!response?.ok) {
      logger.warn("ollama.tags.failed", {
        status: response?.status ?? "unreachable",
      });
      this._consecutiveFailures += 1;
      this._lastFailureMs = Date.now();
      return [];
    }

    const data = (await response.json()) as {
      readonly models: readonly OllamaModelEntry[];
    };

    const capabilities: AiModelCapabilities[] = [];

    for (const entry of data.models) {
      let showData: OllamaShowResponse | null = null;

      const showResponse = await ollamaFetch("/api/show", {
        method: "POST",
        body: JSON.stringify({ name: entry.name }),
      }).catch(() => null);

      if (showResponse?.ok) {
        showData = (await showResponse.json()) as OllamaShowResponse;
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

    const response = await ollamaFetch("/api/chat", {
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
    }).catch((err: unknown) => {
      logger.error("ollama.chat.fetch.failed", { error: String(err) });
      return null;
    });

    if (!response?.ok) {
      const errorBody = response ? await response.text().catch(() => "unknown") : "unreachable";
      return {
        ok: false,
        error: `Ollama chat failed: ${errorBody}`,
        retryable: true,
      };
    }

    const result = (await response.json()) as OllamaChatResponse;
    const durationMs = Date.now() - startMs;

    return {
      ok: true,
      text: result.message.content,
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

    const response = await ollamaFetch("/api/chat", {
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
    }).catch((err: unknown) => {
      logger.error("ollama.chatStream.fetch.failed", { error: String(err) });
      return null;
    });

    if (!response?.ok || !response.body) {
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
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

        const chunk = JSON.parse(line) as OllamaStreamChunk;
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

    const response = await ollamaFetch("/api/embeddings", {
      method: "POST",
      body: JSON.stringify({ model, input: text }),
    }).catch(() => null);

    if (!response?.ok) {
      return null;
    }

    const data = (await response.json()) as {
      readonly embeddings?: readonly number[][];
    };

    const firstEmbedding = data.embeddings?.[0];
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

/**
 * OpenAI-Compatible AI Provider
 *
 * HTTP client for OpenAI-compatible local or hosted inference endpoints.
 * Supports generic `/models`, `/chat/completions`, and `/embeddings` APIs so
 * local runtimes such as Ramalama and hosted OpenAI-compatible vendors can
 * share one provider contract.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { safeJsonParse } from "../../../shared/utils/safe-json.ts";
import type {
  AiCapability,
  AiChatMessage,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiToolPlanParams,
  AiToolPlanResult,
  AiToolPlanStep,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "./provider-types.ts";

const logger = createLogger("ai.provider.openai-compatible");

/**
 * Configuration for one OpenAI-compatible provider lane.
 */
export interface OpenAiCompatibleProviderConfig {
  /** Provider name used by routing and status responses. */
  readonly name: "openai-compatible-local" | "openai-compatible-cloud";
  /** Human-readable provider label. */
  readonly providerLabel: string;
  /** Base API URL ending in `/v1`. */
  readonly baseUrl: string;
  /** Bearer token used for authenticated APIs. */
  readonly apiKey: string;
  /** Availability probe timeout in milliseconds. */
  readonly availabilityTimeoutMs: number;
  /** Default chat-capable model. */
  readonly chatModel: string;
  /** Optional embeddings-capable model. */
  readonly embeddingModel?: string;
  /** Optional vision-capable model. */
  readonly visionModel?: string;
  /** Whether the provider executes locally. */
  readonly local: boolean;
}

interface OpenAiCompatibleModelListResponse {
  readonly data: readonly {
    readonly id: string;
  }[];
}

interface OpenAiCompatibleChatCompletionResponse {
  readonly model: string;
  readonly choices: readonly {
    readonly message: {
      readonly role: string;
      readonly content: string | readonly { readonly type?: string; readonly text?: string }[];
    };
  }[];
}

interface OpenAiCompatibleEmbeddingResponse {
  readonly data: readonly {
    readonly embedding: readonly number[];
  }[];
}

interface OpenAiCompatibleChatCompletionChunk {
  readonly model?: string;
  readonly choices: readonly {
    readonly delta?: {
      readonly content?: string | readonly { readonly type?: string; readonly text?: string }[];
    };
    readonly finish_reason?: string | null;
  }[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const readFiniteNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeMessageContent = (
  value: string | readonly { readonly type?: string; readonly text?: string }[],
): string => {
  if (typeof value === "string") {
    return value;
  }

  return value
    .map((entry) => (entry.type === "text" && typeof entry.text === "string" ? entry.text : ""))
    .filter((entry) => entry.length > 0)
    .join("");
};

const toChatMessagePayload = (
  message: AiChatMessage,
): {
  readonly role: AiChatMessage["role"];
  readonly content:
    | string
    | readonly (
        | { readonly type: "text"; readonly text: string }
        | { readonly type: "image_url"; readonly image_url: { readonly url: string } }
      )[];
} => {
  if (!message.images || message.images.length === 0) {
    return {
      role: message.role,
      content: message.content,
    };
  }

  return {
    role: message.role,
    content: [
      { type: "text", text: message.content },
      ...message.images.map((image) => ({
        type: "image_url" as const,
        image_url: { url: `data:image/png;base64,${image}` },
      })),
    ],
  };
};

const parseModelsResponse = (value: unknown): OpenAiCompatibleModelListResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return null;
  }

  const data = value.data
    .map((entry) => (isRecord(entry) ? readString(entry.id) : null))
    .filter((entry): entry is string => entry !== null)
    .map((id) => ({ id }));

  return {
    data,
  };
};

const parseChatCompletionResponse = (
  value: unknown,
): OpenAiCompatibleChatCompletionResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.choices)) {
    return null;
  }

  const model = readString(value.model);
  if (!model) {
    return null;
  }

  const choices = value.choices
    .map((entry) => {
      if (!isRecord(entry) || !isRecord(entry.message)) {
        return null;
      }

      const role = readString(entry.message.role);
      const rawContent = entry.message.content;
      if (!role || (typeof rawContent !== "string" && !Array.isArray(rawContent))) {
        return null;
      }

      return {
        message: {
          role,
          content: rawContent as
            | string
            | readonly { readonly type?: string; readonly text?: string }[],
        },
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        readonly message: {
          readonly role: string;
          readonly content: string | readonly { readonly type?: string; readonly text?: string }[];
        };
      } => entry !== null,
    );

  return choices.length > 0
    ? {
        model,
        choices,
      }
    : null;
};

const parseEmbeddingResponse = (value: unknown): OpenAiCompatibleEmbeddingResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return null;
  }

  const data = value.data.flatMap((entry) => {
    if (!isRecord(entry) || !Array.isArray(entry.embedding)) {
      return [];
    }

    const embedding = entry.embedding
      .map((element) => readFiniteNumber(element))
      .filter((element): element is number => element !== null);
    return embedding.length > 0 ? [{ embedding: [...embedding] }] : [];
  });

  return data.length > 0 ? { data } : null;
};

const parseChatCompletionChunk = (value: unknown): OpenAiCompatibleChatCompletionChunk | null => {
  if (!isRecord(value) || !Array.isArray(value.choices)) {
    return null;
  }

  const choices = value.choices.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const delta = isRecord(entry.delta)
      ? {
          content:
            typeof entry.delta.content === "string" || Array.isArray(entry.delta.content)
              ? (entry.delta.content as
                  | string
                  | readonly { readonly type?: string; readonly text?: string }[])
              : undefined,
        }
      : undefined;

    return [
      {
        delta,
        finish_reason:
          typeof entry.finish_reason === "string" || entry.finish_reason === null
            ? entry.finish_reason
            : undefined,
      },
    ];
  });

  return {
    model: readString(value.model) ?? undefined,
    choices,
  };
};

const buildHeaders = (apiKey: string): HeadersInit => ({
  "content-type": "application/json",
  ...(apiKey.length > 0 ? { authorization: `Bearer ${apiKey}` } : {}),
});

const buildCapabilities = (
  providerName: string,
  model: string,
  config: OpenAiCompatibleProviderConfig,
): AiModelCapabilities => {
  const capabilities = new Set<AiCapability>(["chat", "text-generation"]);
  if (config.embeddingModel && model === config.embeddingModel) {
    capabilities.add("embeddings");
  }
  if (config.visionModel && model === config.visionModel) {
    capabilities.add("vision");
  }
  if (model === config.chatModel) {
    capabilities.add("tool-calling");
    capabilities.add("structured-planning");
  }

  return {
    provider: providerName,
    model,
    capabilities,
    maxContextLength: 0,
    supportsStreaming: true,
    runtime: "openai-http",
    integration: "openai-compatible",
    local: config.local,
    configurable: true,
  };
};

const mapPlanningSteps = (text: string): readonly AiToolPlanStep[] =>
  text
    .split(/\r?\n/gu)
    .map((entry) => entry.replace(/^\s*(?:[-*]|\d+[.)])\s*/u, "").trim())
    .filter((entry) => entry.length > 0)
    .map((title, index) => ({
      id: `step-${index + 1}`,
      title,
      kind: index === 0 ? "analysis" : "builder",
    }));

/**
 * Generic OpenAI-compatible provider implementation.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  /** Unique provider registry name. */
  public readonly name: OpenAiCompatibleProviderConfig["name"];

  private readonly config: OpenAiCompatibleProviderConfig;
  private readonly fetchImpl: typeof fetch;

  /**
   * Creates one OpenAI-compatible provider lane.
   *
   * @param config Provider configuration.
   * @param fetchImpl Injected fetch implementation.
   */
  public constructor(config: OpenAiCompatibleProviderConfig, fetchImpl: typeof fetch = fetch) {
    this.name = config.name;
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  /**
   * Checks whether the provider is reachable.
   *
   * @returns True when `/models` responds successfully.
   */
  public async isAvailable(): Promise<boolean> {
    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}/models`, {
        method: "GET",
        headers: buildHeaders(this.config.apiKey),
        signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
      });
      return response.ok;
    } catch (error: unknown) {
      logger.warn("openai-compatible.availability.failed", {
        provider: this.name,
        error: String(error),
      });
      return false;
    }
  }

  /**
   * Returns provider readiness for diagnostics and routing.
   *
   * @returns Provider readiness.
   */
  public async readiness(): Promise<"ready" | "degraded" | "offline"> {
    return (await this.isAvailable()) ? "ready" : "offline";
  }

  /**
   * Detects capabilities from the remote/local `/models` listing and configured defaults.
   *
   * @returns Capability list for available models.
   */
  public async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}/models`, {
        method: "GET",
        headers: buildHeaders(this.config.apiKey),
        signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
      });
      if (!response.ok) {
        return [];
      }

      const payload = parseModelsResponse(await response.json());
      if (!payload) {
        return [];
      }

      const configuredModels = new Set<string>([
        this.config.chatModel,
        ...(this.config.embeddingModel ? [this.config.embeddingModel] : []),
        ...(this.config.visionModel ? [this.config.visionModel] : []),
      ]);
      const listedModels = new Set(payload.data.map((entry) => entry.id));
      const modelIds = [...new Set([...listedModels, ...configuredModels])];
      return modelIds.map((model) => buildCapabilities(this.name, model, this.config));
    } catch (error: unknown) {
      logger.warn("openai-compatible.capabilities.failed", {
        provider: this.name,
        error: String(error),
      });
      return [];
    }
  }

  /**
   * Generates a non-streaming chat completion.
   *
   * @param params Chat parameters.
   * @returns Generation result.
   */
  public async chat(params: AiChatParams): Promise<AiGenerationResult> {
    const startedAt = performance.now();

    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: buildHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: params.model ?? this.config.chatModel,
          messages: [
            ...(params.systemPrompt
              ? [{ role: "system" as const, content: params.systemPrompt }]
              : []),
            ...params.messages.map(toChatMessagePayload),
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      });
      if (!response.ok) {
        return {
          ok: false,
          error: `OpenAI-compatible provider returned HTTP ${response.status}`,
          retryable: response.status >= 500,
        };
      }

      const payload = parseChatCompletionResponse(await response.json());
      if (!payload) {
        return {
          ok: false,
          error: "OpenAI-compatible provider returned an invalid response payload",
          retryable: true,
        };
      }

      return {
        ok: true,
        text: normalizeMessageContent(payload.choices[0]?.message.content ?? ""),
        model: payload.model,
        durationMs: Math.round(performance.now() - startedAt),
      };
    } catch (error: unknown) {
      return {
        ok: false,
        error: String(error),
        retryable: true,
      };
    }
  }

  /**
   * Streams chat completion chunks.
   *
   * @param params Chat parameters.
   * @yields Text chunks.
   */
  public async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    const response = await this.fetchImpl(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(this.config.apiKey),
      body: JSON.stringify({
        model: params.model ?? this.config.chatModel,
        messages: [
          ...(params.systemPrompt
            ? [{ role: "system" as const, content: params.systemPrompt }]
            : []),
          ...params.messages.map(toChatMessagePayload),
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: true,
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    });

    if (!response.ok || !response.body) {
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) {
          break;
        }

        buffer += decoder.decode(chunk.value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const dataLines = event
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .filter((line) => line.length > 0);

          for (const line of dataLines) {
            if (line === "[DONE]") {
              return;
            }

            const payload = parseChatCompletionChunk(safeJsonParse<unknown>(line, null));
            const content = payload?.choices
              .map((choice) =>
                choice.delta?.content ? normalizeMessageContent(choice.delta.content) : "",
              )
              .join("");
            if (content && content.length > 0) {
              yield content;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Classification is not implemented for the generic API-compatible lane.
   *
   * @returns Always null.
   */
  public async classify(_text: string, _model?: string): Promise<AiClassificationResult | null> {
    return null;
  }

  /**
   * Speech transcription is not implemented for the generic API-compatible lane.
   *
   * @param _params Transcription parameters.
   * @returns Failure result.
   */
  public async transcribeAudio(_params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    return {
      ok: false,
      error: "OpenAI-compatible provider does not expose speech-to-text in this integration lane",
      retryable: false,
    };
  }

  /**
   * Speech synthesis is not implemented for the generic API-compatible lane.
   *
   * @param _params Speech synthesis parameters.
   * @returns Failure result.
   */
  public async synthesizeSpeech(
    _params: AiSpeechSynthesisParams,
  ): Promise<AiSpeechSynthesisResult> {
    return {
      ok: false,
      error: "OpenAI-compatible provider does not expose text-to-speech in this integration lane",
      retryable: false,
    };
  }

  /**
   * Routes basic vision prompting through chat completions when a vision model is configured.
   *
   * @param image Raw image bytes.
   * @param prompt Instruction.
   * @returns Generation result.
   */
  public async describeImage(image: Uint8Array, prompt: string): Promise<AiGenerationResult> {
    if (!this.config.visionModel) {
      return {
        ok: false,
        error: "No OpenAI-compatible vision model configured",
        retryable: false,
      };
    }

    return this.chat({
      model: this.config.visionModel,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [Buffer.from(image).toString("base64")],
        },
      ],
    });
  }

  /**
   * Generates one embedding vector through `/embeddings`.
   *
   * @param text Input text.
   * @returns Embedding vector or null.
   */
  public async generateEmbedding(text: string): Promise<Float32Array | null> {
    if (!this.config.embeddingModel) {
      return null;
    }

    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}/embeddings`, {
        method: "POST",
        headers: buildHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: this.config.embeddingModel,
          input: text,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      });
      if (!response.ok) {
        return null;
      }

      const payload = parseEmbeddingResponse(await response.json());
      const embedding = payload?.data[0]?.embedding;
      return embedding ? new Float32Array(embedding) : null;
    } catch (error: unknown) {
      logger.warn("openai-compatible.embedding.failed", {
        provider: this.name,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Produces a structured tool plan using the provider's chat model.
   *
   * @param params Planning parameters.
   * @returns Structured plan result.
   */
  public async planTools(params: AiToolPlanParams): Promise<AiToolPlanResult> {
    const result = await this.chat({
      model: params.model ?? this.config.chatModel,
      systemPrompt: [
        "Produce a concise implementation plan.",
        "Return one step per line.",
        "Each line must be actionable and safe to review before execution.",
      ].join("\n"),
      messages: [{ role: "user", content: params.goal }],
      temperature: 0.1,
    });

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      steps: mapPlanningSteps(result.text),
      model: result.model,
      durationMs: result.durationMs,
    };
  }

  /**
   * Releases provider resources.
   */
  public async dispose(): Promise<void> {}
}

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
import { encodeMonoWavAudio, safeDecodeWavAudio } from "../../../shared/utils/wav-audio.ts";
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
  /** Optional speech-to-text model. */
  readonly transcriptionModel?: string;
  /** Optional text-to-speech model. */
  readonly speechModel?: string;
  /** Optional moderation/classification model. */
  readonly moderationModel?: string;
  /** Optional default speech voice. */
  readonly speechVoice?: string;
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

interface OpenAiCompatibleTranscriptionResponse {
  readonly text: string;
}

interface OpenAiCompatibleModerationResponse {
  readonly results: readonly {
    readonly flagged?: boolean;
    readonly categories?: Record<string, boolean>;
    readonly category_scores?: Record<string, number>;
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

const parseTranscriptionResponse = (
  value: unknown,
): OpenAiCompatibleTranscriptionResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  const text = readString(value.text);
  return text ? { text } : null;
};

const parseModerationResponse = (value: unknown): OpenAiCompatibleModerationResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return null;
  }

  const results = value.results.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const categories = isRecord(entry.categories)
      ? Object.fromEntries(
          Object.entries(entry.categories).filter(
            (pair): pair is [string, boolean] => typeof pair[1] === "boolean",
          ),
        )
      : undefined;
    const categoryScores = isRecord(entry.category_scores)
      ? Object.fromEntries(
          Object.entries(entry.category_scores)
            .map(([key, score]) => [key, readFiniteNumber(score)])
            .filter((pair): pair is [string, number] => pair[1] !== null),
        )
      : undefined;

    return [
      {
        flagged: typeof entry.flagged === "boolean" ? entry.flagged : undefined,
        categories,
        category_scores: categoryScores,
      },
    ];
  });

  return results.length > 0 ? { results } : null;
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

const normalizeModerationLabel = (value: string): string =>
  value
    .replace(/[/-]+/gu, "_")
    .replace(/[^a-zA-Z0-9_]+/gu, "_")
    .replace(/_+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .toUpperCase();

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const buildAuthHeaders = (apiKey: string): HeadersInit => ({
  ...(apiKey.length > 0 ? { authorization: `Bearer ${apiKey}` } : {}),
});

const buildJsonHeaders = (apiKey: string): HeadersInit => ({
  "content-type": "application/json",
  ...buildAuthHeaders(apiKey),
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
  if (config.transcriptionModel && model === config.transcriptionModel) {
    capabilities.add("speech-to-text");
  }
  if (config.speechModel && model === config.speechModel) {
    capabilities.add("text-to-speech");
  }
  if (config.moderationModel && model === config.moderationModel) {
    capabilities.add("text-classification");
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
    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/models`, {
      method: "GET",
      headers: buildAuthHeaders(this.config.apiKey),
      signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      logger.warn("openai-compatible.availability.failed", {
        provider: this.name,
        error: String(fetchResult?.error),
      });
      return false;
    }

    return (fetchResult as Response).ok;
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
    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/models`, {
      method: "GET",
      headers: buildAuthHeaders(this.config.apiKey),
      signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      logger.warn("openai-compatible.capabilities.failed", {
        provider: this.name,
        error: String(fetchResult?.error),
      });
      return [];
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return [];
    }

    const responseJson = await response.json().catch(() => null);
    if (!responseJson) {
      return [];
    }

    const payload = parseModelsResponse(responseJson);
    if (!payload) {
      return [];
    }

    const configuredModels = new Set<string>([
      this.config.chatModel,
      ...(this.config.embeddingModel ? [this.config.embeddingModel] : []),
      ...(this.config.visionModel ? [this.config.visionModel] : []),
      ...(this.config.transcriptionModel ? [this.config.transcriptionModel] : []),
      ...(this.config.speechModel ? [this.config.speechModel] : []),
      ...(this.config.moderationModel ? [this.config.moderationModel] : []),
    ]);
    const listedModels = new Set(payload.data.map((entry) => entry.id));
    const modelIds = [...new Set([...listedModels, ...configuredModels])];
    return modelIds.map((model) => buildCapabilities(this.name, model, this.config));
  }

  /**
   * Generates a non-streaming chat completion.
   *
   * @param params Chat parameters.
   * @returns Generation result.
   */
  public async chat(params: AiChatParams): Promise<AiGenerationResult> {
    const startedAt = performance.now();

    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildJsonHeaders(this.config.apiKey),
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
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      return {
        ok: false,
        error: String(fetchResult?.error),
        retryable: true,
      };
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return {
        ok: false,
        error: `OpenAI-compatible provider returned HTTP ${response.status}`,
        retryable: response.status >= 500,
      };
    }

    const responseJson = await response.json().catch(() => null);
    const payload = responseJson ? parseChatCompletionResponse(responseJson) : null;
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
      headers: buildJsonHeaders(this.config.apiKey),
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

    while (true) {
      const chunk = await reader.read().catch(() => ({ done: true, value: undefined }));
      if (chunk.done || !chunk.value) {
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
            reader.releaseLock();
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
    reader.releaseLock();
  }

  /**
   * Classifies text through the provider's moderation endpoint when configured.
   *
   * @param text Input text.
   * @param model Optional moderation model override.
   * @returns Classification result or null when moderation is unavailable.
   */
  public async classify(text: string, model?: string): Promise<AiClassificationResult | null> {
    const moderationModel = model ?? this.config.moderationModel;
    if (!moderationModel) {
      return null;
    }

    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/moderations`, {
      method: "POST",
      headers: buildJsonHeaders(this.config.apiKey),
      body: JSON.stringify({
        model: moderationModel,
        input: text,
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      logger.warn("openai-compatible.moderation.failed", {
        provider: this.name,
        error: String(fetchResult?.error),
      });
      return null;
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return null;
    }

    const responseJson = await response.json().catch(() => null);
    const payload = responseJson ? parseModerationResponse(responseJson) : null;
    const result = payload?.results[0];
    if (!result) {
      return null;
    }

    const scoredCategories = Object.entries(result.category_scores ?? {}).sort(
      (left, right) => right[1] - left[1],
    );
    const flaggedCategory =
      Object.entries(result.categories ?? {}).find((entry) => entry[1] === true)?.[0] ??
      scoredCategories[0]?.[0];
    const score = scoredCategories[0]?.[1] ?? 0;

    return {
      ok: true,
      label:
        result.flagged === true && flaggedCategory
          ? `MODERATION_${normalizeModerationLabel(flaggedCategory)}`
          : "SAFE",
      score: result.flagged === true ? score : 1 - score,
      model: moderationModel,
    };
  }

  /**
   * Transcribes speech audio through the OpenAI-compatible audio transcription endpoint.
   *
   * @param params Transcription parameters.
   * @returns Speech transcription result.
   */
  public async transcribeAudio(params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    const transcriptionModel = params.model ?? this.config.transcriptionModel;
    if (!transcriptionModel) {
      return {
        ok: false,
        error: "OpenAI-compatible speech-to-text model is not configured.",
        retryable: false,
      };
    }

    const startedAt = performance.now();
    const audioWav = encodeMonoWavAudio(params.audio, params.sampleRate);
    const form = new FormData();
    form.append("file", new File([toArrayBuffer(audioWav)], "audio.wav", { type: "audio/wav" }));
    form.append("model", transcriptionModel);
    form.append("response_format", "json");
    if (params.language) {
      form.append("language", params.language);
    }
    if (params.prompt) {
      form.append("prompt", params.prompt);
    }

    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: buildAuthHeaders(this.config.apiKey),
      body: form,
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      return {
        ok: false,
        error: String(fetchResult?.error),
        retryable: true,
      };
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return {
        ok: false,
        error: `OpenAI-compatible provider returned HTTP ${response.status}`,
        retryable: response.status >= 500,
      };
    }

    const textPayload = await response.text().catch(() => "");
    const payload = parseTranscriptionResponse(safeJsonParse<unknown>(textPayload, null)) ?? {
      text: textPayload.trim(),
    };
    if (!payload?.text || payload.text.trim().length === 0) {
      return {
        ok: false,
        error: "OpenAI-compatible provider returned an invalid transcription payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      text: payload.text,
      model: transcriptionModel,
      durationMs: Math.round(performance.now() - startedAt),
    };
  }

  /**
   * Synthesizes speech audio through the OpenAI-compatible speech endpoint.
   *
   * @param params Speech synthesis parameters.
   * @returns Failure or synthesized audio result.
   */
  public async synthesizeSpeech(params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult> {
    const speechModel = params.model ?? this.config.speechModel;
    const voice = params.voice ?? this.config.speechVoice;
    if (!speechModel) {
      return {
        ok: false,
        error: "OpenAI-compatible text-to-speech model is not configured.",
        retryable: false,
      };
    }
    if (!voice) {
      return {
        ok: false,
        error: "OpenAI-compatible text-to-speech voice is not configured.",
        retryable: false,
      };
    }

    const startedAt = performance.now();
    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/audio/speech`, {
      method: "POST",
      headers: buildJsonHeaders(this.config.apiKey),
      body: JSON.stringify({
        model: speechModel,
        voice,
        input: params.text,
        response_format: "wav",
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      return {
        ok: false,
        error: String(fetchResult?.error),
        retryable: true,
      };
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return {
        ok: false,
        error: `OpenAI-compatible provider returned HTTP ${response.status}`,
        retryable: response.status >= 500,
      };
    }

    const arrayBufferResult = await response.arrayBuffer().catch(() => null);
    if (!arrayBufferResult) {
      return {
        ok: false,
        error: "OpenAI-compatible provider returned an unreadable response payload",
        retryable: true,
      };
    }

    const audioBytes = new Uint8Array(arrayBufferResult);
    const decoded = safeDecodeWavAudio(audioBytes);
    if (!decoded.ok) {
      return {
        ok: false,
        error: "OpenAI-compatible provider returned an invalid WAV payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      audio: decoded.value.samples,
      sampleRate: decoded.value.sampleRate,
      model: speechModel,
      durationMs: Math.round(performance.now() - startedAt),
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

    const fetchResult = await this.fetchImpl(`${this.config.baseUrl}/embeddings`, {
      method: "POST",
      headers: buildJsonHeaders(this.config.apiKey),
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: text,
      }),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    }).catch((error: unknown) => ({ error }));

    if (!fetchResult || "error" in fetchResult) {
      logger.warn("openai-compatible.embedding.failed", {
        provider: this.name,
        error: String(fetchResult?.error),
      });
      return null;
    }

    const response = fetchResult as Response;
    if (!response.ok) {
      return null;
    }

    const responseJson = await response.json().catch(() => null);
    if (!responseJson) {
      return null;
    }

    const payload = parseEmbeddingResponse(responseJson);
    const embedding = payload?.data[0]?.embedding;
    return embedding ? new Float32Array(embedding) : null;
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

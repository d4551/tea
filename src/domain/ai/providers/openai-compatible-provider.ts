/**
 * OpenAI-Compatible AI Provider
 *
 * HTTP client for OpenAI-compatible local or hosted inference endpoints.
 * Supports generic `/models`, `/chat/completions`, and `/embeddings` APIs so
 * local runtimes such as Ramalama and hosted OpenAI-compatible vendors can
 * share one provider contract.
 */

import type {
  AiApiCompatibleAuthConfig,
  AiApiCompatibleEndpoints,
  AiApiCompatibleVendor,
} from "../../../config/environment.ts";
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
import { isRecord, safeJsonParse } from "../../../shared/utils/safe-json.ts";
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
type ChatImagePayload = {
  readonly type: "image_url";
  readonly image_url: {
    readonly url: string;
  };
};

/**
 * Configuration for one OpenAI-compatible provider lane.
 */
export interface OpenAiCompatibleProviderConfig {
  /** Provider name used by routing and status responses. */
  readonly name: "openai-compatible-local" | "openai-compatible-cloud";
  /** Named vendor preset resolved from configuration. */
  readonly vendor: AiApiCompatibleVendor;
  /** Human-readable provider label. */
  readonly providerLabel: string;
  /** Base API URL for the upstream provider. */
  readonly baseUrl: string;
  /** API token used for authenticated APIs. */
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
  /** Vendor-specific endpoint paths. */
  readonly endpoints: AiApiCompatibleEndpoints;
  /** Vendor-specific auth/header rules. */
  readonly auth: AiApiCompatibleAuthConfig;
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

const readString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const readFiniteNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

type ChatMessageContent = string | readonly { readonly type?: string; readonly text?: string }[];
const isChatMessageContentEntry = (
  value: unknown,
): value is { readonly type?: string; readonly text?: string } => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type !== undefined && typeof value.type !== "string") {
    return false;
  }

  if (value.text !== undefined && typeof value.text !== "string") {
    return false;
  }

  return true;
};

const isChatMessageContent = (value: unknown): value is ChatMessageContent =>
  typeof value === "string" || (Array.isArray(value) && value.every(isChatMessageContentEntry));

const normalizeMessageContent = (value: ChatMessageContent): string => {
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
      ...message.images.map(
        (image): ChatImagePayload => ({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${image}` },
        }),
      ),
    ],
  };
};

const parseModelsResponse = (value: unknown): OpenAiCompatibleModelListResponse | null => {
  const rawEntries = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.data)
      ? value.data
      : null;
  if (!rawEntries) {
    return null;
  }

  const data = rawEntries
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
      if (!role || !isChatMessageContent(rawContent)) {
        return null;
      }

      return {
        message: {
          role,
          content: rawContent,
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
          content: isChatMessageContent(entry.delta.content) ? entry.delta.content : undefined,
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

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => bytes.slice().buffer;

const buildProviderUrl = (baseUrl: string, path: string): string =>
  path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${baseUrl.replace(/\/$/u, "")}/${path.replace(/^\//u, "")}`;

const buildAuthHeaders = (
  apiKey: string,
  auth: AiApiCompatibleAuthConfig,
): Readonly<Record<string, string>> => ({
  ...auth.extraHeaders,
  ...(apiKey.length > 0
    ? {
        [auth.apiKeyHeaderName]: `${auth.apiKeyPrefix}${apiKey}`,
      }
    : {}),
});

const buildJsonHeaders = (
  apiKey: string,
  auth: AiApiCompatibleAuthConfig,
): Readonly<Record<string, string>> => ({
  "content-type": "application/json",
  ...buildAuthHeaders(apiKey, auth),
});

const logBoundaryFailure = (event: string, failure: ExternalFailure): void => {
  logger.warn(event, {
    provider: failure.provider ?? "unknown",
    operation: failure.operation ?? "unknown",
    code: failure.code,
    retryable: failure.retryable,
    statusCode: failure.statusCode ?? null,
    message: failure.message,
  });
};

const fetchProviderResponse = async (
  fetchImpl: typeof fetch,
  providerName: string,
  operation: string,
  input: string,
  init: RequestInit,
): Promise<ExternalBoundaryResult<Response>> => {
  const responseResult = await settleAsync(fetchImpl(input, init));
  if (!responseResult.ok) {
    return externalFailure(
      toExternalFailure({
        source: "provider",
        error: responseResult.error,
        provider: providerName,
        operation,
        fallbackCode: "network",
      }),
    );
  }

  return externalSuccess(responseResult.value);
};

const readParsedJsonResponse = async <TPayload>(
  providerName: string,
  operation: string,
  response: Response,
  parser: (value: unknown) => TPayload | null,
  invalidMessage: string,
): Promise<ExternalBoundaryResult<TPayload>> => {
  if (!response.ok) {
    return externalFailure(
      createHttpExternalFailure({
        source: "provider",
        response,
        provider: providerName,
        operation,
        message: `OpenAI-compatible provider returned HTTP ${response.status}`,
      }),
    );
  }

  const responseJson = await readJsonResponse<unknown>(response);
  if (!responseJson.ok) {
    return externalFailure(
      toExternalFailure({
        source: "provider",
        error: responseJson.error,
        provider: providerName,
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
      provider: providerName,
      operation,
    });
  }

  return externalSuccess(payload);
};

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

  private get hasConfiguredDefaults(): boolean {
    return (
      this.config.chatModel.trim().length > 0 &&
      (this.config.local || this.config.apiKey.length > 0)
    );
  }

  private get configuredModelIds(): readonly string[] {
    return [
      this.config.chatModel,
      ...(this.config.embeddingModel ? [this.config.embeddingModel] : []),
      ...(this.config.visionModel ? [this.config.visionModel] : []),
      ...(this.config.transcriptionModel ? [this.config.transcriptionModel] : []),
      ...(this.config.speechModel ? [this.config.speechModel] : []),
      ...(this.config.moderationModel ? [this.config.moderationModel] : []),
    ];
  }

  private getModelDiscoveryUrl(): string | null {
    return this.config.endpoints.modelsPath
      ? buildProviderUrl(this.config.baseUrl, this.config.endpoints.modelsPath)
      : null;
  }

  private buildEndpointUrl(path: string): string {
    return buildProviderUrl(this.config.baseUrl, path);
  }

  /**
   * Checks whether the provider is reachable.
   *
   * @returns True when the configured availability probe succeeds or static config is usable.
   */
  public async isAvailable(): Promise<boolean> {
    const modelDiscoveryUrl = this.getModelDiscoveryUrl();
    if (!modelDiscoveryUrl) {
      return this.hasConfiguredDefaults;
    }

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "availability",
      modelDiscoveryUrl,
      {
        method: "GET",
        headers: buildAuthHeaders(this.config.apiKey, this.config.auth),
        signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
      },
    );

    if (!response.ok) {
      logBoundaryFailure("openai-compatible.availability.failed", response.failure);
      return this.hasConfiguredDefaults;
    }

    return response.data.ok;
  }

  /**
   * Returns provider readiness for diagnostics and routing.
   *
   * @returns Provider readiness.
   */
  public async readiness(): Promise<"ready" | "degraded" | "offline"> {
    const available = await this.isAvailable();
    if (!available) {
      return "offline";
    }

    return this.config.endpoints.modelsPath ? "ready" : "degraded";
  }

  /**
   * Detects capabilities from the remote/local `/models` listing and configured defaults.
   *
   * @returns Capability list for available models.
   */
  public async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    const configuredModels = new Set<string>(this.configuredModelIds);
    const modelDiscoveryUrl = this.getModelDiscoveryUrl();
    if (!modelDiscoveryUrl) {
      return [...configuredModels].map((model) => buildCapabilities(this.name, model, this.config));
    }

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "detect-capabilities",
      modelDiscoveryUrl,
      {
        method: "GET",
        headers: buildAuthHeaders(this.config.apiKey, this.config.auth),
        signal: AbortSignal.timeout(this.config.availabilityTimeoutMs),
      },
    );

    if (!response.ok) {
      logBoundaryFailure("openai-compatible.capabilities.failed", response.failure);
      return [...configuredModels].map((model) => buildCapabilities(this.name, model, this.config));
    }

    const payload = await readParsedJsonResponse(
      this.name,
      "detect-capabilities",
      response.data,
      parseModelsResponse,
      "OpenAI-compatible provider returned an invalid models payload",
    );
    if (!payload.ok) {
      logBoundaryFailure("openai-compatible.capabilities.failed", payload.failure);
      return [...configuredModels].map((model) => buildCapabilities(this.name, model, this.config));
    }

    const listedModels = new Set(payload.data.data.map((entry) => entry.id));
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
    const systemMessageRole: "system" = "system";
    const systemMessage = params.systemPrompt
      ? { role: systemMessageRole, content: params.systemPrompt }
      : undefined;

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "chat",
      this.buildEndpointUrl(this.config.endpoints.chatCompletionsPath),
      {
        method: "POST",
        headers: buildJsonHeaders(this.config.apiKey, this.config.auth),
        body: JSON.stringify({
          model: params.model ?? this.config.chatModel,
          messages: [
            ...(systemMessage ? [systemMessage] : []),
            ...params.messages.map(toChatMessagePayload),
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );
    if (!response.ok) {
      return toRetryableError(response.failure);
    }

    const payload = await readParsedJsonResponse(
      this.name,
      "chat",
      response.data,
      parseChatCompletionResponse,
      "OpenAI-compatible provider returned an invalid response payload",
    );
    if (!payload.ok) {
      return toRetryableError(payload.failure);
    }

    return {
      ok: true,
      text: normalizeMessageContent(payload.data.choices[0]?.message.content ?? ""),
      model: payload.data.model,
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
    const systemMessageRole: "system" = "system";
    const systemMessage = params.systemPrompt
      ? { role: systemMessageRole, content: params.systemPrompt }
      : undefined;

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "chat-stream",
      this.buildEndpointUrl(this.config.endpoints.chatCompletionsPath),
      {
        method: "POST",
        headers: buildJsonHeaders(this.config.apiKey, this.config.auth),
        body: JSON.stringify({
          model: params.model ?? this.config.chatModel,
          messages: [
            ...(systemMessage ? [systemMessage] : []),
            ...params.messages.map(toChatMessagePayload),
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: true,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );

    if (!response.ok || !response.data.body) {
      return;
    }

    const reader = response.data.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const chunk = await settleAsync(reader.read());
      if (!chunk.ok) {
        logger.warn("openai-compatible.chat-stream.failed", {
          provider: this.name,
          operation: "chat-stream",
          code: "network",
          message: chunk.error.message,
        });
        break;
      }
      if (chunk.value.done || !chunk.value.value) {
        break;
      }

      buffer += decoder.decode(chunk.value.value, { stream: true });
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

          const payload = parseChatCompletionChunk(
            safeJsonParse<Record<string, unknown> | null>(line, null, isRecord),
          );
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
    if (!moderationModel || !this.config.endpoints.moderationsPath) {
      return null;
    }

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "moderation",
      this.buildEndpointUrl(this.config.endpoints.moderationsPath),
      {
        method: "POST",
        headers: buildJsonHeaders(this.config.apiKey, this.config.auth),
        body: JSON.stringify({
          model: moderationModel,
          input: text,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );
    if (!response.ok) {
      logBoundaryFailure("openai-compatible.moderation.failed", response.failure);
      return null;
    }

    const payload = await readParsedJsonResponse(
      this.name,
      "moderation",
      response.data,
      parseModerationResponse,
      "OpenAI-compatible provider returned an invalid moderation payload",
    );
    if (!payload.ok) {
      logBoundaryFailure("openai-compatible.moderation.failed", payload.failure);
      return null;
    }

    const result = payload.data.results[0];
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
    if (!transcriptionModel || !this.config.endpoints.transcriptionsPath) {
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

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "transcription",
      this.buildEndpointUrl(this.config.endpoints.transcriptionsPath),
      {
        method: "POST",
        headers: buildAuthHeaders(this.config.apiKey, this.config.auth),
        body: form,
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );
    if (!response.ok) {
      return toRetryableError(response.failure);
    }
    if (!response.data.ok) {
      return toRetryableError(
        createHttpExternalFailure({
          source: "provider",
          response: response.data,
          provider: this.name,
          operation: "transcription",
          message: `OpenAI-compatible provider returned HTTP ${response.data.status}`,
        }),
      );
    }

    const textPayloadResult = await settleAsync(response.data.text());
    const textPayload = textPayloadResult.ok ? textPayloadResult.value : "";
    const payload = parseTranscriptionResponse(
      safeJsonParse<Record<string, unknown> | null>(textPayload, null, isRecord),
    ) ?? {
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
    if (!speechModel || !this.config.endpoints.speechPath) {
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
    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "speech",
      this.buildEndpointUrl(this.config.endpoints.speechPath),
      {
        method: "POST",
        headers: buildJsonHeaders(this.config.apiKey, this.config.auth),
        body: JSON.stringify({
          model: speechModel,
          voice,
          input: params.text,
          response_format: "wav",
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );
    if (!response.ok) {
      return toRetryableError(response.failure);
    }
    if (!response.data.ok) {
      return toRetryableError(
        createHttpExternalFailure({
          source: "provider",
          response: response.data,
          provider: this.name,
          operation: "speech",
          message: `OpenAI-compatible provider returned HTTP ${response.data.status}`,
        }),
      );
    }

    const arrayBufferResult = await settleAsync(response.data.arrayBuffer());
    if (!arrayBufferResult.ok) {
      return {
        ok: false,
        error: "OpenAI-compatible provider returned an unreadable response payload",
        retryable: true,
      };
    }

    const audioBytes = new Uint8Array(arrayBufferResult.value);
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
          images: [image.toBase64()],
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
    if (!this.config.embeddingModel || !this.config.endpoints.embeddingsPath) {
      return null;
    }

    const response = await fetchProviderResponse(
      this.fetchImpl,
      this.name,
      "embedding",
      this.buildEndpointUrl(this.config.endpoints.embeddingsPath),
      {
        method: "POST",
        headers: buildJsonHeaders(this.config.apiKey, this.config.auth),
        body: JSON.stringify({
          model: this.config.embeddingModel,
          input: text,
        }),
        signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
      },
    );
    if (!response.ok) {
      logBoundaryFailure("openai-compatible.embedding.failed", response.failure);
      return null;
    }

    const payload = await readParsedJsonResponse(
      this.name,
      "embedding",
      response.data,
      parseEmbeddingResponse,
      "OpenAI-compatible provider returned an invalid embeddings payload",
    );
    if (!payload.ok) {
      logBoundaryFailure("openai-compatible.embedding.failed", payload.failure);
      return null;
    }

    const embedding = payload.data.data[0]?.embedding;
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

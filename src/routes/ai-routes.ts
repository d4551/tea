/**
 * AI API Routes
 *
 * REST endpoints for AI provider health, local ONNX/Hugging Face capability discovery,
 * game assistance, and local speech input/output flows.
 */

import { Elysia, t } from "elysia";
import { appConfig, normalizeLocale } from "../config/environment.ts";
import {
  type KnowledgeSearchMatch,
  knowledgeBaseService,
} from "../domain/ai/knowledge-base-service.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import {
  detectAvailableFeatures,
  generateNpcDialogue,
  generateSceneDescription,
  suggestUserFlowStep,
} from "../domain/game/ai/game-ai-service.ts";
import { ApplicationError, errorEnvelope, successEnvelope } from "../lib/error-envelope.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { requestScopedContextPlugin } from "../plugins/request-context.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { FeatureCapability, GameLocale } from "../shared/contracts/game.ts";
import {
  encodeMonoWavAudio,
  resampleMonoPcm,
  safeDecodeWavAudio,
} from "../shared/utils/wav-audio.ts";

type RegistryStatus = Awaited<ReturnType<ProviderRegistry["getStatus"]>>;
type RegistryCapability = RegistryStatus["capabilities"][number];
type RegistryProviders = RegistryStatus["providers"];

const generationResultSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    text: t.String(),
    model: t.String(),
    durationMs: t.Number(),
  }),
});

const errorResultSchema = t.Object({
  ok: t.Literal(false),
  error: t.Object({
    code: t.String(),
    category: t.String(),
    message: t.String(),
    retryable: t.Boolean(),
    correlationId: t.String(),
  }),
});

const providerReadinessSchema = t.Union([
  t.Literal("ready"),
  t.Literal("degraded"),
  t.Literal("offline"),
]);

const capabilityModelSchema = t.Object({
  key: t.Optional(t.String()),
  provider: t.String(),
  model: t.String(),
  capabilities: t.Array(t.String()),
  maxContextLength: t.Number(),
  supportsStreaming: t.Boolean(),
  runtime: t.String(),
  integration: t.String(),
  local: t.Boolean(),
  configurable: t.Boolean(),
});

const localCatalogSchema = t.Object({
  key: t.String(),
  label: t.String(),
  description: t.String(),
  task: t.String(),
  model: t.String(),
  capabilities: t.Array(t.String()),
  runtime: t.String(),
  integration: t.String(),
  configKey: t.String(),
  enabled: t.Boolean(),
});

const localRuntimeSchema = t.Object({
  transformers: t.Object({
    provider: t.String(),
    integration: t.String(),
    cacheDirectory: t.String(),
    localModelPath: t.String(),
    allowRemoteModels: t.Boolean(),
    allowLocalModels: t.Boolean(),
  }),
  onnx: t.Object({
    backend: t.String(),
    wasmPath: t.String(),
    threadCount: t.Number(),
    proxyEnabled: t.Boolean(),
  }),
  audio: t.Object({
    inputSampleRateHz: t.Number(),
    maxUploadBytes: t.Number(),
    speakerEmbeddingsConfigured: t.Boolean(),
  }),
  apiCompatible: t.Object({
    local: t.Object({
      enabled: t.Boolean(),
      providerLabel: t.String(),
      baseUrl: t.String(),
      chatModel: t.String(),
      embeddingModel: t.Optional(t.String()),
      visionModel: t.Optional(t.String()),
      transcriptionModel: t.Optional(t.String()),
      speechModel: t.Optional(t.String()),
      moderationModel: t.Optional(t.String()),
      speechVoice: t.Optional(t.String()),
    }),
    cloud: t.Object({
      enabled: t.Boolean(),
      providerLabel: t.String(),
      baseUrl: t.String(),
      chatModel: t.String(),
      embeddingModel: t.Optional(t.String()),
      visionModel: t.Optional(t.String()),
      transcriptionModel: t.Optional(t.String()),
      speechModel: t.Optional(t.String()),
      moderationModel: t.Optional(t.String()),
      speechVoice: t.Optional(t.String()),
    }),
    defaultPolicy: t.String(),
    cloudFallbackEnabled: t.Boolean(),
  }),
  catalog: t.Array(localCatalogSchema),
});

const featureSnapshotSchema = t.Object({
  richDialogue: t.Boolean(),
  visionAnalysis: t.Boolean(),
  sentimentAnalysis: t.Boolean(),
  embeddings: t.Boolean(),
  speechToText: t.Boolean(),
  speechSynthesis: t.Boolean(),
  localInference: t.Boolean(),
  providers: t.Array(t.String()),
});

const aiHealthResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    providers: t.Array(
      t.Object({
        name: t.String(),
        readiness: providerReadinessSchema,
        ready: t.Boolean(),
        modelCount: t.Number(),
        reason: t.Optional(t.String()),
      }),
    ),
    preferredProvider: t.String(),
  }),
});

const aiStatusResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    providers: t.Array(
      t.Object({
        name: t.String(),
        available: t.Boolean(),
        readiness: providerReadinessSchema,
        modelCount: t.Number(),
        reason: t.Optional(t.String()),
      }),
    ),
    capabilities: t.Array(capabilityModelSchema),
    preferredProvider: t.String(),
    features: featureSnapshotSchema,
    localRuntime: localRuntimeSchema,
  }),
});

const aiCapabilitiesResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    features: t.Object({
      assist: t.Boolean(),
      test: t.Boolean(),
      toolLikeSuggestions: t.Boolean(),
      streaming: t.Boolean(),
      offlineFallback: t.Boolean(),
    }),
    models: t.Array(capabilityModelSchema),
    localRuntime: localRuntimeSchema,
  }),
});

const aiCatalogResponseSchema = t.Object({
  ok: t.Literal(true),
  data: localRuntimeSchema,
});

const transcriptionResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    text: t.String(),
    model: t.String(),
    durationMs: t.Number(),
    sampleRate: t.Number(),
    durationInputMs: t.Number(),
  }),
});

const synthesisResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    audioBase64: t.String(),
    mimeType: t.String(),
    model: t.String(),
    durationMs: t.Number(),
    sampleRate: t.Number(),
  }),
});

const knowledgeDocumentSchema = t.Object({
  id: t.String(),
  projectId: t.Nullable(t.String()),
  title: t.String(),
  source: t.String(),
  locale: t.String(),
  contentHash: t.String(),
  chunkCount: t.Number(),
  createdAtMs: t.Number(),
  updatedAtMs: t.Number(),
});

const knowledgeSearchMatchSchema = t.Object({
  documentId: t.String(),
  chunkId: t.String(),
  title: t.String(),
  source: t.String(),
  locale: t.String(),
  ordinal: t.Number(),
  text: t.String(),
  score: t.Number(),
});

const knowledgeSearchResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    matches: t.Array(knowledgeSearchMatchSchema),
  }),
});

const retrievalAssistResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    text: t.String(),
    model: t.String(),
    durationMs: t.Number(),
    matches: t.Array(knowledgeSearchMatchSchema),
  }),
});

const toolPlanStepSchema = t.Object({
  id: t.String(),
  title: t.String(),
  kind: t.Optional(
    t.Union([
      t.Literal("analysis"),
      t.Literal("builder"),
      t.Literal("automation"),
      t.Literal("review"),
    ]),
  ),
  detail: t.Optional(t.String()),
});

const toolPlanResponseSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    steps: t.Array(toolPlanStepSchema),
    model: t.String(),
    durationMs: t.Number(),
  }),
});

const asCapabilityRecord = (capability: RegistryCapability) => ({
  ...(capability.key ? { key: capability.key } : {}),
  provider: capability.provider,
  model: capability.model,
  capabilities: [...capability.capabilities],
  maxContextLength: capability.maxContextLength,
  supportsStreaming: capability.supportsStreaming,
  runtime: capability.runtime,
  integration: capability.integration,
  local: capability.local,
  configurable: capability.configurable,
});

const asKnowledgeSearchMatchRecord = (match: KnowledgeSearchMatch) => ({
  documentId: match.documentId,
  chunkId: match.chunkId,
  title: match.title,
  source: match.source,
  locale: match.locale,
  ordinal: match.ordinal,
  text: match.text,
  score: Number(match.score.toFixed(6)),
});

const createFeatureCapability = (providers: RegistryProviders): FeatureCapability => ({
  assist: providers.length > 0,
  test: providers.some((provider) => provider.available),
  toolLikeSuggestions: true,
  streaming: providers.some(
    (provider) => provider.modelCount > 0 && provider.readiness !== "offline",
  ),
  offlineFallback: providers.some((provider) => provider.available),
});

const createAiFailureEnvelope = (
  correlationId: string,
  message: string,
  retryable: boolean,
  code: "AI_PROVIDER_FAILURE" | "VALIDATION_ERROR" = "AI_PROVIDER_FAILURE",
) =>
  errorEnvelope(
    new ApplicationError(
      code,
      message,
      code === "VALIDATION_ERROR" ? httpStatus.badRequest : httpStatus.serviceUnavailable,
      retryable,
    ),
    correlationId,
  );

const decodeAudioPayload = (audioBase64: string): Uint8Array => {
  const trimmed = audioBase64.trim();
  const payload = trimmed.includes(",") ? trimmed.slice(trimmed.indexOf(",") + 1) : trimmed;
  return new Uint8Array(Buffer.from(payload, "base64"));
};

const toAiRuntimeRecord = () => {
  const runtimeProfile = getAiRuntimeProfile();

  return {
    transformers: {
      provider: runtimeProfile.transformers.provider,
      integration: runtimeProfile.transformers.integration,
      cacheDirectory: runtimeProfile.transformers.cacheDirectory,
      localModelPath: runtimeProfile.transformers.localModelPath,
      allowRemoteModels: runtimeProfile.transformers.allowRemoteModels,
      allowLocalModels: runtimeProfile.transformers.allowLocalModels,
    },
    onnx: {
      backend: runtimeProfile.onnx.backend,
      wasmPath: runtimeProfile.onnx.wasmPath,
      threadCount: runtimeProfile.onnx.threadCount,
      proxyEnabled: runtimeProfile.onnx.proxyEnabled,
    },
    audio: {
      inputSampleRateHz: runtimeProfile.audio.inputSampleRateHz,
      maxUploadBytes: runtimeProfile.audio.maxUploadBytes,
      speakerEmbeddingsConfigured: runtimeProfile.audio.speakerEmbeddingsConfigured,
    },
    apiCompatible: {
      local: {
        enabled: runtimeProfile.apiCompatible.local.enabled,
        providerLabel: runtimeProfile.apiCompatible.local.providerLabel,
        baseUrl: runtimeProfile.apiCompatible.local.baseUrl,
        chatModel: runtimeProfile.apiCompatible.local.chatModel,
        embeddingModel: runtimeProfile.apiCompatible.local.embeddingModel,
        visionModel: runtimeProfile.apiCompatible.local.visionModel,
      },
      cloud: {
        enabled: runtimeProfile.apiCompatible.cloud.enabled,
        providerLabel: runtimeProfile.apiCompatible.cloud.providerLabel,
        baseUrl: runtimeProfile.apiCompatible.cloud.baseUrl,
        chatModel: runtimeProfile.apiCompatible.cloud.chatModel,
        embeddingModel: runtimeProfile.apiCompatible.cloud.embeddingModel,
        visionModel: runtimeProfile.apiCompatible.cloud.visionModel,
      },
      defaultPolicy: runtimeProfile.apiCompatible.defaultPolicy,
      cloudFallbackEnabled: runtimeProfile.apiCompatible.cloudFallbackEnabled,
    },
    catalog: runtimeProfile.catalog.map((entry) => ({
      key: entry.key,
      label: entry.label,
      description: entry.description,
      task: entry.task,
      model: entry.model,
      capabilities: [...entry.capabilities],
      runtime: entry.runtime,
      integration: entry.integration,
      configKey: entry.configKey,
      enabled: entry.enabled,
    })),
  };
};

export const aiRoutes = new Elysia({ name: "ai-routes" })
  .use(i18nContextPlugin)
  .use(requestScopedContextPlugin)
  .get(
    appRoutes.aiHealth,
    async () => {
      const registry = await ProviderRegistry.getInstance();
      const status = await registry.getStatus();
      return successEnvelope({
        providers: status.providers.map((provider) => ({
          name: provider.name,
          readiness: provider.readiness,
          ready: provider.available,
          modelCount: provider.modelCount,
          reason: provider.reason,
        })),
        preferredProvider: status.preferredProvider,
      });
    },
    {
      detail: {
        tags: ["ai"],
        summary: "AI provider health",
        description:
          "Returns readiness for all configured AI providers and the active routing preference.",
      },
      response: {
        [httpStatus.ok]: aiHealthResponseSchema,
      },
    },
  )
  .get(
    appRoutes.aiStatus,
    async () => {
      const registry = await ProviderRegistry.getInstance();
      const status = await registry.getStatus();
      const features = await detectAvailableFeatures();
      return successEnvelope({
        providers: status.providers.map((provider) => ({
          name: provider.name,
          available: provider.available,
          readiness: provider.readiness,
          modelCount: provider.modelCount,
          reason: provider.reason,
        })),
        capabilities: status.capabilities.map(asCapabilityRecord),
        preferredProvider: status.preferredProvider,
        features: {
          richDialogue: features.richDialogue,
          visionAnalysis: features.visionAnalysis,
          sentimentAnalysis: features.sentimentAnalysis,
          embeddings: features.embeddings,
          speechToText: features.speechToText,
          speechSynthesis: features.speechSynthesis,
          localInference: features.localInference,
          providers: [...features.providers],
        },
        localRuntime: toAiRuntimeRecord(),
      });
    },
    {
      detail: {
        tags: ["ai"],
        summary: "AI platform status",
        description:
          "Returns provider availability, capability discovery, and the configured local Hugging Face / ONNX runtime profile.",
      },
      response: {
        [httpStatus.ok]: aiStatusResponseSchema,
      },
    },
  )
  .get(
    appRoutes.aiCapabilities,
    async () => {
      const registry = await ProviderRegistry.getInstance();
      const status = await registry.getStatus();

      return successEnvelope({
        features: createFeatureCapability(status.providers),
        models: status.capabilities.map(asCapabilityRecord),
        localRuntime: toAiRuntimeRecord(),
      });
    },
    {
      detail: {
        tags: ["ai"],
        summary: "AI capability matrix",
        description:
          "Returns the normalized feature matrix used by the builder along with all discovered provider/model capabilities.",
      },
      response: {
        [httpStatus.ok]: aiCapabilitiesResponseSchema,
      },
    },
  )
  .get(appRoutes.aiCatalog, () => successEnvelope(toAiRuntimeRecord()), {
    detail: {
      tags: ["ai"],
      summary: "Local AI runtime catalog",
      description:
        "Describes the local Transformers.js, Hugging Face, and ONNX runtime configuration and all configured local model targets.",
    },
    response: {
      [httpStatus.ok]: aiCatalogResponseSchema,
    },
  })
  .get(
    appRoutes.aiKnowledgeDocuments,
    async ({ query }) => {
      const documents = await knowledgeBaseService.listDocuments(query.projectId);
      return successEnvelope({
        documents: [...documents],
      });
    },
    {
      query: t.Object({
        projectId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "List indexed knowledge documents",
        description:
          "Returns persisted RAG documents for the whole app or a single builder project scope.",
      },
      response: {
        [httpStatus.ok]: t.Object({
          ok: t.Literal(true),
          data: t.Object({
            documents: t.Array(knowledgeDocumentSchema),
          }),
        }),
      },
    },
  )
  .post(
    appRoutes.aiKnowledgeDocuments,
    async ({ body }) => {
      const document = await knowledgeBaseService.ingestDocument({
        projectId: body.projectId,
        title: body.title,
        source: body.source,
        text: body.text,
        locale: body.locale,
      });
      return successEnvelope(document);
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        title: t.String({ minLength: 1 }),
        source: t.String({ minLength: 1 }),
        text: t.String({ minLength: 1 }),
        locale: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Index a knowledge document",
        description:
          "Chunks, embeds, and persists a plain-text knowledge document for retrieval-augmented generation.",
      },
      response: {
        [httpStatus.ok]: t.Object({ ok: t.Literal(true), data: knowledgeDocumentSchema }),
      },
    },
  )
  .delete(
    `${appRoutes.aiKnowledgeDocuments}/:documentId`,
    async ({ params, query }) => {
      const deleted = await knowledgeBaseService.deleteDocument(params.documentId, query.projectId);
      return successEnvelope({ deleted });
    },
    {
      params: t.Object({
        documentId: t.String({ minLength: 1 }),
      }),
      query: t.Object({
        projectId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Delete an indexed knowledge document",
        description: "Deletes one persisted knowledge document and all of its indexed chunks.",
      },
      response: {
        [httpStatus.ok]: t.Object({
          ok: t.Literal(true),
          data: t.Object({
            deleted: t.Boolean(),
          }),
        }),
      },
    },
  )
  .post(
    appRoutes.aiKnowledgeSearch,
    async ({ body }) => {
      const matches = await knowledgeBaseService.search(body.query, {
        projectId: body.projectId,
        locale: body.locale,
        limit: body.limit,
      });
      return successEnvelope({
        matches: matches.map(asKnowledgeSearchMatchRecord),
      });
    },
    {
      body: t.Object({
        query: t.String({ minLength: 1 }),
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 20 })),
      }),
      detail: {
        tags: ["ai"],
        summary: "Semantic knowledge search",
        description:
          "Runs embeddings-backed retrieval across persisted knowledge chunks using the best available local/cloud embedding provider.",
      },
      response: {
        [httpStatus.ok]: knowledgeSearchResponseSchema,
      },
    },
  )
  .post(
    appRoutes.aiAssistRetrieval,
    async ({ body, correlationId, messages }) => {
      const result = await knowledgeBaseService.assist(body.prompt, {
        projectId: body.projectId,
        locale: body.locale,
        limit: body.limit,
      });

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.retrievalAssistUnavailable,
          result.retryable ?? true,
        );
      }

      return successEnvelope({
        text: result.text ?? "",
        model: result.model ?? "unknown",
        durationMs: result.durationMs ?? 0,
        matches: result.matches.map(asKnowledgeSearchMatchRecord),
      });
    },
    {
      body: t.Object({
        prompt: t.String({ minLength: 1 }),
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 20 })),
      }),
      detail: {
        tags: ["ai"],
        summary: "Retrieval-augmented assist",
        description:
          "Retrieves project/app knowledge context and generates a grounded implementation answer with the best available chat-capable provider.",
      },
      response: {
        [httpStatus.ok]: t.Union([retrievalAssistResponseSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiPlanTools,
    async ({ body, correlationId, messages }) => {
      const registry = await ProviderRegistry.getInstance();
      const result = await registry.planTools({
        goal: body.goal,
        projectId: body.projectId,
      });

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.toolPlanningUnavailable,
          result.retryable,
        );
      }

      return successEnvelope({
        steps: [...result.steps],
        model: result.model,
        durationMs: result.durationMs,
      });
    },
    {
      body: t.Object({
        goal: t.String({ minLength: 1 }),
        projectId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Structured tool planning",
        description:
          "Produces an approval-friendly action plan for builder automation or agentic implementation using the best available planner.",
      },
      response: {
        [httpStatus.ok]: t.Union([toolPlanResponseSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiGenerateDialogue,
    async ({ body, correlationId, messages }) => {
      const locale = normalizeLocale(body.locale) as GameLocale;

      const result = await generateNpcDialogue(
        {
          npcId: body.npcId,
          playerMessage: body.playerMessage,
          sceneId: body.sceneId ?? defaultGameConfig.defaultSceneId,
          history: body.history,
        },
        locale,
      );

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.dialogueGenerationUnavailable,
          result.retryable,
        );
      }

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
      });
    },
    {
      body: t.Object({
        npcId: t.String(),
        playerMessage: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        history: t.Optional(t.Array(t.String())),
      }),
      detail: {
        tags: ["ai"],
        summary: "Generate NPC dialogue",
        description:
          "Generates in-character NPC dialogue using the best available chat-capable provider.",
      },
      response: {
        [httpStatus.ok]: t.Union([generationResultSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiGenerateScene,
    async ({ body, correlationId, messages }) => {
      const locale = normalizeLocale(body.locale) as GameLocale;
      const result = await generateSceneDescription(body.sceneId, locale);

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.sceneGenerationUnavailable,
          result.retryable,
        );
      }

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
      });
    },
    {
      body: t.Object({
        sceneId: t.String(),
        locale: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Generate scene description",
        description: "Generates atmospheric scene copy for builder previews and runtime narration.",
      },
      response: {
        [httpStatus.ok]: t.Union([generationResultSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiAssist,
    async ({ body, correlationId, messages }) => {
      const result = await suggestUserFlowStep(body.prompt, body.gameContext);

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.designAssistUnavailable,
          result.retryable,
        );
      }

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
      });
    },
    {
      body: t.Object({
        prompt: t.String(),
        gameContext: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Game design assist",
        description:
          "Returns implementation-oriented design guidance for the current builder or game context.",
      },
      response: {
        [httpStatus.ok]: t.Union([generationResultSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiTranscribe,
    async ({ body, correlationId, messages }) => {
      const bytes = decodeAudioPayload(body.audioBase64);
      if (bytes.byteLength > appConfig.ai.audioUploadMaxBytes) {
        return errorEnvelope(
          new ApplicationError(
            "VALIDATION_ERROR",
            messages.ai.audioPayloadTooLarge,
            httpStatus.badRequest,
            false,
          ),
          correlationId,
        );
      }

      const decodedResult = safeDecodeWavAudio(bytes);
      if (!decodedResult.ok) {
        return errorEnvelope(
          new ApplicationError(
            "VALIDATION_ERROR",
            messages.ai.audioPayloadInvalid,
            httpStatus.badRequest,
            false,
          ),
          correlationId,
        );
      }
      const decoded = decodedResult.value;

      const normalized = resampleMonoPcm(
        decoded.samples,
        decoded.sampleRate,
        appConfig.ai.audioInputSampleRateHz,
      );
      const registry = await ProviderRegistry.getInstance();
      const result = await registry.transcribeAudio({
        audio: normalized,
        sampleRate: appConfig.ai.audioInputSampleRateHz,
        language: body.language,
        prompt: body.prompt,
      });

      if (!result.ok) {
        return errorEnvelope(
          new ApplicationError(
            "AI_PROVIDER_FAILURE",
            messages.ai.audioTranscriptionUnavailable,
            httpStatus.serviceUnavailable,
            result.retryable,
          ),
          correlationId,
        );
      }

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
        sampleRate: appConfig.ai.audioInputSampleRateHz,
        durationInputMs: decoded.durationMs,
      });
    },
    {
      body: t.Object({
        audioBase64: t.String(),
        mimeType: t.Optional(t.String()),
        language: t.Optional(t.String()),
        prompt: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Transcribe local speech audio",
        description:
          "Accepts a base64-encoded WAV payload, normalizes it to the configured input sample rate, and routes speech-to-text inference through the best available local-first AI provider.",
      },
      response: {
        [httpStatus.ok]: t.Union([transcriptionResponseSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiSynthesize,
    async ({ body, correlationId, messages }) => {
      const registry = await ProviderRegistry.getInstance();
      const result = await registry.synthesizeSpeech({
        text: body.text,
        voice: body.voice,
      });

      if (!result.ok) {
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.audioSynthesisUnavailable,
          result.retryable,
        );
      }

      const wav = encodeMonoWavAudio(result.audio, result.sampleRate);
      return successEnvelope({
        audioBase64: Buffer.from(wav).toString("base64"),
        mimeType: "audio/wav",
        model: result.model,
        durationMs: result.durationMs,
        sampleRate: result.sampleRate,
      });
    },
    {
      body: t.Object({
        text: t.String({ minLength: 1 }),
        voice: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Synthesize local speech audio",
        description:
          "Routes text-to-speech inference through the best available local-first AI provider and returns the generated mono WAV payload as base64 for preview or downstream processing.",
      },
      response: {
        [httpStatus.ok]: t.Union([synthesisResponseSchema, errorResultSchema]),
      },
    },
  );

/**
 * AI API Routes
 *
 * REST endpoints for AI provider health, local ONNX/Hugging Face capability discovery,
 * game assistance, and local speech input/output flows.
 */

import { Elysia, t } from "elysia";
import { appConfig, normalizeLocale, parseBoolean } from "../config/environment.ts";
import {
  type AiRuntimeSettingMutation,
  aiRuntimeSettingsService,
} from "../domain/ai/ai-runtime-settings-service.ts";
import { deriveFeatureCapability } from "../domain/ai/capability-snapshot.ts";
import {
  type KnowledgeSearchMatch,
  knowledgeBaseService,
} from "../domain/ai/knowledge-base-service.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { pullOllamaModel, searchProviderModels } from "../domain/ai/provider-model-catalog.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import { vectorStore } from "../domain/ai/vector-store.ts";
import { auditService } from "../domain/audit/audit-service.ts";
import {
  detectAvailableFeatures,
  generateNpcDialogue,
  generateSceneDescription,
  suggestUserFlowStep,
} from "../domain/game/ai/game-ai-service.ts";
import { ApplicationError, errorEnvelope, successEnvelope } from "../lib/error-envelope.ts";
import { authSessionContextPlugin } from "../plugins/auth-session.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { requestScopedContextPlugin } from "../plugins/request-context.ts";
import { type SseUtils, ssePlugin } from "../plugins/sse-plugin.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { FeatureCapability } from "../shared/contracts/game.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { settleAsync } from "../shared/utils/async-result.ts";
import {
  encodeMonoWavAudio,
  resampleMonoPcm,
  safeDecodeWavAudio,
} from "../shared/utils/wav-audio.ts";
import {
  renderAiModelSettingsWorkspace,
  renderAiProviderSearchPanel,
} from "../views/builder/ai-panel.ts";

type RegistryStatus = Awaited<ReturnType<ProviderRegistry["getStatus"]>>;
type RegistryCapability = RegistryStatus["capabilities"][number];
type RegistryProviders = RegistryStatus["providers"];

const resolveOptionalProjectId = (projectId?: string): string => projectId ?? "";

const generationResultSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    text: t.String(),
    model: t.String(),
    durationMs: t.Number(),
    provenance: t.Optional(
      t.Object({
        provider: t.String(),
        model: t.String(),
        policyRouted: t.Boolean(),
        policyReason: t.Optional(t.String()),
      }),
    ),
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

const capabilityStatusSchema = t.Union([
  t.Literal("ready"),
  t.Literal("degraded"),
  t.Literal("unavailable"),
]);

const capabilityModeSchema = t.Union([
  t.Literal("provider"),
  t.Literal("fallback"),
  t.Literal("surface"),
  t.Literal("none"),
]);

const capabilityStateSchema = t.Object({
  status: capabilityStatusSchema,
  mode: capabilityModeSchema,
  reasonCode: t.Optional(t.String()),
});

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
  editable: t.Boolean(),
  providerLane: t.String(),
  slot: t.String(),
  source: t.Union([t.Literal("override"), t.Literal("env"), t.Literal("default")]),
});

const aiRuntimeSettingSchema = t.Object({
  key: t.String(),
  value: t.Union([t.String(), t.Number(), t.Boolean()]),
  valueType: t.Union([
    t.Literal("string"),
    t.Literal("integer"),
    t.Literal("float"),
    t.Literal("boolean"),
  ]),
  source: t.Union([t.Literal("override"), t.Literal("env"), t.Literal("default")]),
  editable: t.Boolean(),
  providerLane: t.String(),
  slot: t.String(),
  label: t.String(),
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
      vendor: t.String(),
      supportedVendors: t.Array(t.String()),
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
      vendor: t.String(),
      supportedVendors: t.Array(t.String()),
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
  settings: t.Array(aiRuntimeSettingSchema),
});

const providerModelCatalogItemSchema = t.Object({
  provider: t.String(),
  model: t.String(),
  label: t.String(),
  summary: t.String(),
  capabilities: t.Array(t.String()),
  tags: t.Array(t.String()),
  installed: t.Boolean(),
  available: t.Boolean(),
  source: t.Union([
    t.Literal("hub"),
    t.Literal("installed"),
    t.Literal("discovered"),
    t.Literal("configured"),
  ]),
});

const aiProviderModelNameSchema = t.Union([
  t.Literal("ollama"),
  t.Literal("openai-compatible-local"),
  t.Literal("openai-compatible-cloud"),
  t.Literal("huggingface-inference"),
  t.Literal("huggingface-endpoints"),
  t.Literal("transformers-local"),
]);

const providerModelCatalogDataSchema = t.Object({
  provider: t.String(),
  slot: t.String(),
  items: t.Array(providerModelCatalogItemSchema),
  nextCursor: t.Union([t.String(), t.Null()]),
});

const providerModelCatalogResponseSchema = t.Object({
  ok: t.Literal(true),
  data: providerModelCatalogDataSchema,
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
      assist: capabilityStateSchema,
      test: capabilityStateSchema,
      toolLikeSuggestions: capabilityStateSchema,
      streaming: capabilityStateSchema,
      knowledgeRetrieval: capabilityStateSchema,
      offlineFallback: capabilityStateSchema,
    }),
    models: t.Array(capabilityModelSchema),
    localRuntime: localRuntimeSchema,
    vectorStore: t.Object({
      available: t.Boolean(),
    }),
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
    provenance: t.Optional(
      t.Object({
        provider: t.String(),
        model: t.String(),
        policyRouted: t.Boolean(),
        policyReason: t.Optional(t.String()),
      }),
    ),
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

const createFeatureCapability = (status: RegistryStatus): FeatureCapability =>
  deriveFeatureCapability(status, vectorStore.available);

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

const toAuditActor = (context: {
  readonly authPrincipalType: "anonymous" | "user";
  readonly authPrincipalUserId: string | null;
  readonly authPrincipalOrganizationId: string | null;
  readonly authPrincipalRoleKeys: readonly string[];
}) => ({
  type: context.authPrincipalType,
  id: context.authPrincipalUserId,
  organizationId: context.authPrincipalOrganizationId,
  roleKeys: context.authPrincipalRoleKeys,
});

const toGovernanceContext = (context: {
  readonly authPrincipalUserId: string | null;
  readonly authPrincipalOrganizationId: string | null;
  readonly requestSource: string;
  readonly projectId?: string;
  readonly sensitiveContext?: boolean;
}) => ({
  actorId: context.authPrincipalUserId ?? undefined,
  organizationId: context.authPrincipalOrganizationId ?? undefined,
  projectId: context.projectId,
  requestSource: context.requestSource,
  sensitiveContext: context.sensitiveContext === true,
});

const isBase64Payload = (value: string): boolean =>
  value.length > 0 && /^[A-Za-z0-9+/]+={0,2}$/u.test(value) && value.length % 4 !== 1;

const decodeAudioPayload = (audioBase64: string): Uint8Array => {
  const trimmed = audioBase64.trim();
  const payload = trimmed.includes(",") ? trimmed.slice(trimmed.indexOf(",") + 1) : trimmed;
  if (!isBase64Payload(payload)) {
    return new Uint8Array();
  }
  return Uint8Array.fromBase64(payload);
};

const toAiRuntimeRecord = async () => {
  const runtimeProfile = await getAiRuntimeProfile();

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
        vendor: runtimeProfile.apiCompatible.local.vendor,
        supportedVendors: [...runtimeProfile.apiCompatible.local.supportedVendors],
        providerLabel: runtimeProfile.apiCompatible.local.providerLabel,
        baseUrl: runtimeProfile.apiCompatible.local.baseUrl,
        chatModel: runtimeProfile.apiCompatible.local.chatModel,
        embeddingModel: runtimeProfile.apiCompatible.local.embeddingModel,
        visionModel: runtimeProfile.apiCompatible.local.visionModel,
      },
      cloud: {
        enabled: runtimeProfile.apiCompatible.cloud.enabled,
        vendor: runtimeProfile.apiCompatible.cloud.vendor,
        supportedVendors: [...runtimeProfile.apiCompatible.cloud.supportedVendors],
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
      editable: entry.editable,
      providerLane: entry.providerLane,
      slot: entry.slot,
      source: entry.source,
    })),
    settings: runtimeProfile.settings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      valueType: setting.valueType,
      source: setting.source,
      editable: setting.editable,
      providerLane: setting.providerLane,
      slot: setting.slot,
      label: setting.label,
    })),
  };
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const delayWithAbort = (signal: AbortSignal, delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const onAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);

    signal.addEventListener("abort", onAbort, { once: true });
  });

const normalizeAiSettingsMutations = (body: unknown): readonly AiRuntimeSettingMutation[] => {
  if (typeof body !== "object" || body === null) {
    throw new Error("AI runtime settings payload must be an object.");
  }

  const record = body as {
    readonly updates?: readonly AiRuntimeSettingMutation[];
    readonly key?: string;
    readonly value?: string | number | boolean;
    readonly reset?: string | boolean;
  };

  if (Array.isArray(record.updates)) {
    return record.updates;
  }

  if (typeof record.key !== "string" || record.key.trim().length === 0) {
    throw new Error("AI runtime setting key is required.");
  }

  const reset =
    typeof record.reset === "boolean"
      ? record.reset
      : typeof record.reset === "string"
        ? parseBoolean(record.reset, false, "reset")
        : false;

  return [
    {
      key: record.key,
      value: record.value,
      reset,
    },
  ];
};

const renderAiHealthStatusMarkup = (locale: string, providers: RegistryProviders): string => {
  const messages = getMessages(normalizeLocale(locale));
  const hasReadyProvider = providers.some((provider) => provider.available);
  const hasDegradedProvider =
    !hasReadyProvider && providers.some((provider) => provider.readiness === "degraded");
  const indicatorClass = hasReadyProvider
    ? "status-success"
    : hasDegradedProvider
      ? "status-warning"
      : "status-error";
  const statusLabel = hasReadyProvider
    ? messages.ai.statusAvailable
    : messages.ai.statusUnavailable;

  return [
    `<span class="status ${indicatorClass}"></span>`,
    `<span class="font-medium">${escapeHtml(messages.builder.statusBarAi)}:</span>`,
    `<span>${escapeHtml(statusLabel)}</span>`,
  ].join("");
};

async function* createAiHealthStream({
  locale,
  sse,
  signal,
}: {
  readonly locale: string;
  readonly sse: SseUtils;
  readonly signal: AbortSignal;
}): AsyncGenerator<string> {
  while (!signal.aborted) {
    const registry = await ProviderRegistry.getInstance();
    const status = await registry.getStatus();
    yield sse.event("health", renderAiHealthStatusMarkup(locale, status.providers));
    await delayWithAbort(signal, appConfig.ai.capabilityRefreshIntervalMs);
  }
}

export const aiRoutes = new Elysia({ name: "ai-routes" })
  .use(i18nContextPlugin)
  .use(requestScopedContextPlugin)
  .use(authSessionContextPlugin)
  .use(ssePlugin)
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
    appRoutes.aiHealthStream,
    async function* ({ query, request, set, sse }) {
      set.headers["cache-control"] = "no-cache, no-transform";
      set.headers.connection = "keep-alive";
      set.headers["content-type"] = "text/event-stream; charset=utf-8";
      yield* createAiHealthStream({
        locale: normalizeLocale(query.locale),
        sse,
        signal: request.signal,
      });
    },
    {
      query: t.Object({
        locale: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "AI provider health stream",
        description:
          "Streams localized builder footer updates describing current AI provider readiness.",
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
        localRuntime: await toAiRuntimeRecord(),
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
        features: createFeatureCapability(status),
        models: status.capabilities.map(asCapabilityRecord),
        localRuntime: await toAiRuntimeRecord(),
        vectorStore: {
          available: vectorStore.available,
        },
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
  .get(appRoutes.aiCatalog, async () => successEnvelope(await toAiRuntimeRecord()), {
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
    appRoutes.aiProviderModels,
    async ({ query, request }) => {
      const provider = query.provider;
      const locale = normalizeLocale(query.locale);
      const messages = getMessages(locale);

      const providerModelsResult = await settleAsync(
        searchProviderModels({
          provider,
          slot: query.slot,
          search: query.search,
          author: query.author,
          cursor: query.cursor,
          limit: query.limit,
        }),
      );
      if (!providerModelsResult.ok) {
        if (request.headers.get("HX-Request") === "true") {
          return renderAiProviderSearchPanel(
            messages,
            locale,
            resolveOptionalProjectId(query.projectId),
            {
              settingKey: query.settingKey ?? "",
              provider,
              slot: query.slot,
              search: query.search ?? "",
              author: query.author ?? "",
              items: [],
              error: providerModelsResult.error.message,
            },
          );
        }
        throw providerModelsResult.error;
      }

      if (request.headers.get("HX-Request") === "true") {
        return renderAiProviderSearchPanel(
          messages,
          locale,
          resolveOptionalProjectId(query.projectId),
          {
            settingKey: query.settingKey ?? "",
            provider: providerModelsResult.value.provider,
            slot: providerModelsResult.value.slot,
            search: query.search ?? "",
            author: query.author ?? "",
            items: providerModelsResult.value.items,
          },
        );
      }

      return {
        ok: true as const,
        data: {
          provider: providerModelsResult.value.provider,
          slot: providerModelsResult.value.slot,
          items: providerModelsResult.value.items.map((item) => ({
            provider: item.provider,
            model: item.model,
            label: item.label,
            summary: item.summary,
            capabilities: [...item.capabilities],
            tags: [...item.tags],
            installed: item.installed,
            available: item.available,
            source: item.source,
          })),
          nextCursor: providerModelsResult.value.nextCursor,
        },
      };
    },
    {
      query: t.Object({
        provider: aiProviderModelNameSchema,
        slot: t.String({ minLength: 1 }),
        search: t.Optional(t.String()),
        author: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 25 })),
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        settingKey: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Provider model search",
        description:
          "Searches provider-aware model catalogs so the settings UI can populate configurable model slots.",
      },
      response: {
        [httpStatus.ok]: t.Union([providerModelCatalogResponseSchema, t.String()]),
      },
    },
  )
  .patch(
    appRoutes.aiSettings,
    async ({ body, query, request }) => {
      await aiRuntimeSettingsService.updateSettings(normalizeAiSettingsMutations(body));
      const runtimeRecord = await toAiRuntimeRecord();
      if (request.headers.get("HX-Request") === "true") {
        const locale = normalizeLocale(query.locale);
        return renderAiModelSettingsWorkspace(
          getMessages(locale),
          locale,
          resolveOptionalProjectId(query.projectId),
          await getAiRuntimeProfile(),
        );
      }
      return successEnvelope(runtimeRecord);
    },
    {
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      body: t.Union([
        t.Object({
          updates: t.Array(
            t.Object({
              key: t.String({ minLength: 1 }),
              value: t.Optional(t.Union([t.String(), t.Number(), t.Boolean()])),
              reset: t.Optional(t.Boolean()),
            }),
            { minItems: 1 },
          ),
        }),
        t.Object({
          key: t.String({ minLength: 1 }),
          value: t.Optional(t.Union([t.String(), t.Number(), t.Boolean()])),
          reset: t.Optional(t.Union([t.String(), t.Boolean()])),
        }),
      ]),
      detail: {
        tags: ["ai"],
        summary: "Update AI runtime overrides",
        description:
          "Persists app-wide AI runtime overrides and returns the refreshed effective runtime snapshot.",
      },
      response: {
        [httpStatus.ok]: t.Union([aiCatalogResponseSchema, t.String()]),
      },
    },
  )
  .post(
    appRoutes.aiProviderOllamaPull,
    async ({ body, query, request }) => {
      await pullOllamaModel(body.model);
      const catalog = await searchProviderModels({
        provider: "ollama",
        slot: body.slot ?? "chat",
        search: body.model,
        limit: 10,
      });

      if (request.headers.get("HX-Request") === "true") {
        const locale = normalizeLocale(query.locale);
        return renderAiModelSettingsWorkspace(
          getMessages(locale),
          locale,
          resolveOptionalProjectId(query.projectId),
          await getAiRuntimeProfile(),
          {
            settingKey: "OLLAMA_CHAT_MODEL",
            provider: catalog.provider,
            slot: catalog.slot,
            search: body.model,
            author: "",
            items: catalog.items,
          },
        );
      }

      return {
        ok: true as const,
        data: {
          model: body.model,
          catalog: {
            provider: catalog.provider,
            slot: catalog.slot,
            items: catalog.items.map((item) => ({
              provider: item.provider,
              model: item.model,
              label: item.label,
              summary: item.summary,
              capabilities: [...item.capabilities],
              tags: [...item.tags],
              installed: item.installed,
              available: item.available,
              source: item.source,
            })),
            nextCursor: catalog.nextCursor,
          },
        },
      };
    },
    {
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      body: t.Object({
        model: t.String({ minLength: 1 }),
        slot: t.Optional(t.String()),
      }),
      detail: {
        tags: ["ai"],
        summary: "Pull an Ollama model",
        description:
          "Downloads one Ollama model into the local runtime and refreshes provider capability discovery.",
      },
      response: {
        [httpStatus.ok]: t.Union([
          t.Object({
            ok: t.Literal(true),
            data: t.Object({
              model: t.String(),
              catalog: providerModelCatalogDataSchema,
            }),
          }),
          t.String(),
        ]),
      },
    },
  )
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
        projectId: t.String(),
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
        projectId: t.String(),
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
    appRoutes.aiKnowledgeDocumentDetail,
    async ({ params, query }) => {
      const deleted = await knowledgeBaseService.deleteDocument(params.documentId, query.projectId);
      return successEnvelope({ deleted });
    },
    {
      params: t.Object({
        documentId: t.String({ minLength: 1 }),
      }),
      query: t.Object({
        projectId: t.String(),
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
        projectId: t.String(),
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
        projectId: t.String(),
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
    async ({
      body,
      correlationId,
      messages,
      authPrincipalType,
      authPrincipalUserId,
      authPrincipalOrganizationId,
      authPrincipalRoleKeys,
    }) => {
      const registry = await ProviderRegistry.getInstance();
      const plannerTargetId = body.projectId ?? correlationId;
      const result = await registry.planTools({
        goal: body.goal,
        projectId: body.projectId,
        governance: toGovernanceContext({
          authPrincipalUserId,
          authPrincipalOrganizationId,
          requestSource: "ai-routes.plan-tools",
          projectId: body.projectId,
          sensitiveContext: body.sensitiveContext,
        }),
        requireExplicitApproval: body.requireExplicitApproval,
        approvalGranted: body.approvalGranted,
      });

      if (!result.ok) {
        await auditService.tryRecord({
          correlationId,
          action: "ai.plan-tools",
          requestSource: "ai-api",
          policyDecision: "deny",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "ai-planner",
            id: plannerTargetId,
          },
          metadata: {
            reason: result.error,
            sensitiveContext: body.sensitiveContext ?? false,
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.toolPlanningUnavailable,
          result.retryable,
        );
      }

      await auditService.tryRecord({
        correlationId,
        action: "ai.plan-tools",
        requestSource: "ai-api",
        policyDecision: "allow",
        result: "success",
        actor: toAuditActor({
          authPrincipalType,
          authPrincipalUserId,
          authPrincipalOrganizationId,
          authPrincipalRoleKeys,
        }),
        target: {
          type: "ai-planner",
          id: plannerTargetId,
        },
        metadata: {
          stepCount: result.steps.length,
          model: result.model,
        },
      });
      return successEnvelope({
        steps: [...result.steps],
        model: result.model,
        durationMs: result.durationMs,
        provenance: result.provenance,
      });
    },
    {
      body: t.Object({
        goal: t.String({ minLength: 1 }),
        projectId: t.Optional(t.String()),
        sensitiveContext: t.Optional(t.Boolean()),
        requireExplicitApproval: t.Optional(t.Boolean()),
        approvalGranted: t.Optional(t.Boolean()),
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
    async ({
      body,
      correlationId,
      messages,
      authPrincipalType,
      authPrincipalUserId,
      authPrincipalOrganizationId,
      authPrincipalRoleKeys,
    }) => {
      if (appConfig.ai.generationKillSwitchEnabled) {
        await auditService.tryRecord({
          correlationId,
          action: "ai.generate-dialogue",
          requestSource: "ai-api",
          policyDecision: "deny",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "npc",
            id: body.npcId,
          },
          metadata: {
            reason: "ai-generation-kill-switch-enabled",
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          "AI generation is currently disabled by incident controls.",
          false,
        );
      }
      const locale = normalizeLocale(body.locale);

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
        await auditService.tryRecord({
          correlationId,
          action: "ai.generate-dialogue",
          requestSource: "ai-api",
          policyDecision: "allow",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "npc",
            id: body.npcId,
          },
          metadata: {
            reason: result.error,
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.dialogueGenerationUnavailable,
          result.retryable,
        );
      }
      await auditService.tryRecord({
        correlationId,
        action: "ai.generate-dialogue",
        requestSource: "ai-api",
        policyDecision: "allow",
        result: "success",
        actor: toAuditActor({
          authPrincipalType,
          authPrincipalUserId,
          authPrincipalOrganizationId,
          authPrincipalRoleKeys,
        }),
        target: {
          type: "npc",
          id: body.npcId,
        },
        metadata: {
          model: result.model,
          durationMs: result.durationMs,
        },
      });

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
        provenance: result.provenance,
      });
    },
    {
      body: t.Object({
        npcId: t.String(),
        projectId: t.String(),
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
    async ({
      body,
      correlationId,
      messages,
      authPrincipalType,
      authPrincipalUserId,
      authPrincipalOrganizationId,
      authPrincipalRoleKeys,
    }) => {
      if (appConfig.ai.generationKillSwitchEnabled) {
        await auditService.tryRecord({
          correlationId,
          action: "ai.generate-scene",
          requestSource: "ai-api",
          policyDecision: "deny",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "scene",
            id: body.sceneId,
          },
          metadata: {
            reason: "ai-generation-kill-switch-enabled",
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          "AI generation is currently disabled by incident controls.",
          false,
        );
      }
      if (!appConfig.ai.allowHighCostGeneration) {
        await auditService.tryRecord({
          correlationId,
          action: "ai.generate-scene",
          requestSource: "ai-api",
          policyDecision: "deny",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "scene",
            id: body.sceneId,
          },
          metadata: {
            reason: "high-cost-generation-disabled",
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          "High-cost generation is currently disabled by policy.",
          false,
        );
      }
      const locale = normalizeLocale(body.locale);
      const result = await generateSceneDescription(body.sceneId, locale);

      if (!result.ok) {
        await auditService.tryRecord({
          correlationId,
          action: "ai.generate-scene",
          requestSource: "ai-api",
          policyDecision: "allow",
          result: "failure",
          actor: toAuditActor({
            authPrincipalType,
            authPrincipalUserId,
            authPrincipalOrganizationId,
            authPrincipalRoleKeys,
          }),
          target: {
            type: "scene",
            id: body.sceneId,
          },
          metadata: {
            reason: result.error,
          },
        });
        return createAiFailureEnvelope(
          correlationId,
          messages.ai.sceneGenerationUnavailable,
          result.retryable,
        );
      }
      await auditService.tryRecord({
        correlationId,
        action: "ai.generate-scene",
        requestSource: "ai-api",
        policyDecision: "allow",
        result: "success",
        actor: toAuditActor({
          authPrincipalType,
          authPrincipalUserId,
          authPrincipalOrganizationId,
          authPrincipalRoleKeys,
        }),
        target: {
          type: "scene",
          id: body.sceneId,
        },
        metadata: {
          model: result.model,
          durationMs: result.durationMs,
        },
      });

      return successEnvelope({
        text: result.text,
        model: result.model,
        durationMs: result.durationMs,
        provenance: result.provenance,
      });
    },
    {
      body: t.Object({
        sceneId: t.String(),
        projectId: t.String(),
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
      params: t.Object({ projectId: t.String() }),
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
          "Accepts `body.audioBase64` containing either raw base64-encoded WAV bytes or a data URL payload. The optional `mimeType`, `language`, and `prompt` fields are forwarded as transcription context. Invalid base64 payloads are rejected as validation errors; otherwise input is normalized to the configured sample rate and sent to the highest-priority local-first provider.",
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
        audioBase64: wav.toBase64(),
        mimeType: "audio/wav",
        model: result.model,
        durationMs: result.durationMs,
        sampleRate: result.sampleRate,
      });
    },
    {
      params: t.Object({ projectId: t.String() }),
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

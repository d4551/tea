/**
 * AI API Routes
 *
 * REST endpoints for AI provider health, local ONNX/Hugging Face capability discovery,
 * game assistance, and local speech input/output flows.
 */

import { Elysia, t } from "elysia";
import { appConfig, normalizeLocale } from "../config/environment.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import {
  detectAvailableFeatures,
  generateNpcDialogue,
  generateSceneDescription,
  suggestUserFlowStep,
} from "../domain/game/ai/game-ai-service.ts";
import { successEnvelope } from "../lib/error-envelope.ts";
import { defaultGameConfig } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { FeatureCapability, GameLocale } from "../shared/contracts/game.ts";
import { decodeWavAudio, encodeMonoWavAudio, resampleMonoPcm } from "../shared/utils/wav-audio.ts";

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
    message: t.String(),
    retryable: t.Boolean(),
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

const createFeatureCapability = (providers: RegistryProviders): FeatureCapability => ({
  assist: providers.length > 0,
  test: providers.some((provider) => provider.available),
  toolLikeSuggestions: true,
  streaming: providers.some(
    (provider) => provider.modelCount > 0 && provider.readiness !== "offline",
  ),
  offlineFallback: providers.some((provider) => provider.available),
});

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
  .post(
    appRoutes.aiGenerateDialogue,
    async ({ body }) => {
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
        return {
          ok: false as const,
          error: { message: result.error, retryable: result.retryable },
        };
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
    async ({ body }) => {
      const locale = normalizeLocale(body.locale) as GameLocale;
      const result = await generateSceneDescription(body.sceneId, locale);

      if (!result.ok) {
        return {
          ok: false as const,
          error: { message: result.error, retryable: result.retryable },
        };
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
    async ({ body }) => {
      const result = await suggestUserFlowStep(body.prompt, body.gameContext);

      if (!result.ok) {
        return {
          ok: false as const,
          error: { message: result.error, retryable: result.retryable },
        };
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
    async ({ body }) => {
      const bytes = decodeAudioPayload(body.audioBase64);
      if (bytes.byteLength > appConfig.ai.audioUploadMaxBytes) {
        return {
          ok: false as const,
          error: {
            message: `Audio payload exceeds ${appConfig.ai.audioUploadMaxBytes} bytes.`,
            retryable: false,
          },
        };
      }

      let decoded: ReturnType<typeof decodeWavAudio>;
      try {
        decoded = decodeWavAudio(bytes);
      } catch (error: unknown) {
        return {
          ok: false as const,
          error: {
            message: String(error),
            retryable: false,
          },
        };
      }

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
        return {
          ok: false as const,
          error: {
            message: result.error,
            retryable: result.retryable,
          },
        };
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
          "Accepts a base64-encoded WAV payload, normalizes it to the configured input sample rate, and runs local speech-to-text inference.",
      },
      response: {
        [httpStatus.ok]: t.Union([transcriptionResponseSchema, errorResultSchema]),
      },
    },
  )
  .post(
    appRoutes.aiSynthesize,
    async ({ body }) => {
      const registry = await ProviderRegistry.getInstance();
      const result = await registry.synthesizeSpeech({
        text: body.text,
        voice: body.voice,
      });

      if (!result.ok) {
        return {
          ok: false as const,
          error: {
            message: result.error,
            retryable: result.retryable,
          },
        };
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
          "Runs local text-to-speech inference and returns the generated mono WAV payload as base64 for preview or downstream processing.",
      },
      response: {
        [httpStatus.ok]: t.Union([synthesisResponseSchema, errorResultSchema]),
      },
    },
  );

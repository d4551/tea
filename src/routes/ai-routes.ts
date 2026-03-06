/**
 * AI API Routes
 *
 * REST endpoints for AI provider management, dialogue generation,
 * scene description, asset critique, and game-design assistance.
 * All endpoints use the ProviderRegistry injected by the ai-context plugin.
 */

import { Elysia, t } from "elysia";
import { normalizeLocale } from "../config/environment.ts";
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
    capabilities: t.Array(
      t.Object({
        provider: t.String(),
        model: t.String(),
        capabilities: t.Array(t.String()),
        maxContextLength: t.Number(),
        supportsStreaming: t.Boolean(),
      }),
    ),
    preferredProvider: t.String(),
    features: t.Object({
      richDialogue: t.Boolean(),
      visionAnalysis: t.Boolean(),
      sentimentAnalysis: t.Boolean(),
      embeddings: t.Boolean(),
      providers: t.Array(t.String()),
    }),
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
    models: t.Array(
      t.Object({
        provider: t.String(),
        model: t.String(),
        capabilities: t.Array(t.String()),
        maxContextLength: t.Number(),
        supportsStreaming: t.Boolean(),
      }),
    ),
  }),
});

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
      detail: { tags: ["ai"] },
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
      return successEnvelope({ ...status, features });
    },
    {
      detail: { tags: ["ai"] },
      response: {
        [httpStatus.ok]: aiStatusResponseSchema,
      },
    },
  )
  .get(
    appRoutes.aiCapabilities,
    async () => {
      const registry = await ProviderRegistry.getInstance();
      const capabilities = registry.getCapabilities();
      const providers = await registry.getStatus();
      const features: FeatureCapability = {
        assist: providers.providers.length > 0,
        test: providers.providers.some((provider) => provider.available),
        toolLikeSuggestions: true,
        streaming: providers.providers.some(
          (provider) => provider.modelCount > 0 && provider.readiness !== "offline",
        ),
        offlineFallback: providers.providers.some((provider) => provider.available),
      };

      return successEnvelope({
        features,
        models: capabilities.map((c) => ({
          provider: c.provider,
          model: c.model,
          capabilities: [...c.capabilities],
          maxContextLength: c.maxContextLength,
          supportsStreaming: c.supportsStreaming,
        })),
      });
    },
    {
      detail: { tags: ["ai"] },
      response: {
        [httpStatus.ok]: aiCapabilitiesResponseSchema,
      },
    },
  )
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
      detail: { tags: ["ai"] },
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
      detail: { tags: ["ai"] },
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
      detail: { tags: ["ai"] },
      response: {
        [httpStatus.ok]: t.Union([generationResultSchema, errorResultSchema]),
      },
    },
  );

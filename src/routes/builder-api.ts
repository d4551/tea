/**
 * Builder API Routes
 *
 * Persistent builder endpoints for scenes, NPCs, dialogue, and builder AI helpers.
 */
import { Elysia, t } from "elysia";
import { appConfig, type LocaleCode, normalizeLocale } from "../config/environment.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import { builderService, defaultBuilderProjectId } from "../domain/builder/builder-service.ts";
import {
  detectAvailableFeatures,
  generateNpcDialogue,
  suggestUserFlowStep,
} from "../domain/game/ai/game-ai-service.ts";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import type { AppErrorCode } from "../lib/error-envelope.ts";
import { ApplicationError, errorEnvelope, successEnvelope } from "../lib/error-envelope.ts";
import { defaultGameConfig, getGameContractValues } from "../shared/config/game-config.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type {
  BuilderAIRequest,
  BuilderAIResponse,
  BuilderAIRunPlan,
  BuilderArtifactPatch,
  BuilderDialoguePayload,
  BuilderMutationResult,
  BuilderNpcPayload,
  BuilderScenePayload,
  FeatureCapability,
  SceneDefinition,
  SceneNpcDefinition,
} from "../shared/contracts/game.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { safeDecodeUri, safeJsonParse } from "../shared/utils/safe-json.ts";
import { renderDialogueDetail } from "../views/builder/dialogue-editor.ts";
import { renderNpcDetail } from "../views/builder/npc-editor.ts";
import { renderSceneDetail } from "../views/builder/scene-editor.ts";
import { escapeHtml } from "../views/layout.ts";

const route = (path: string): string => path.replace(/^\/api\/builder/, "");

type CorrelationRequest = {
  request: Request;
  headers: Record<string, string | number | undefined>;
};

const toLocale = (value: string | undefined): LocaleCode => normalizeLocale(value);

const resolveProjectId = (value: string | undefined): string => {
  const candidate = (value ?? "").trim();
  return candidate.length > 0 ? candidate : defaultBuilderProjectId;
};

const projectFromBody = (value: { projectId?: string } | undefined): string =>
  resolveProjectId(value?.projectId);

/** TypeBox schema for error envelope responses. */
const builderErrorResponse = t.Object({
  ok: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    retryable: t.Boolean(),
    correlationId: t.String(),
  }),
});

const builderNpcAiSchema = t.Object({
  wanderRadius: t.Number(),
  wanderSpeed: t.Number(),
  idlePauseMs: t.Tuple([t.Number(), t.Number()]),
  greetOnApproach: t.Boolean(),
  greetLineKey: t.String(),
});

const builderNpcSchema = t.Object({
  characterKey: t.String(),
  x: t.Number(),
  y: t.Number(),
  labelKey: t.String(),
  dialogueKeys: t.Array(t.String()),
  interactRadius: t.Number(),
  ai: builderNpcAiSchema,
});

const builderCollisionSchema = t.Object({
  x: t.Number(),
  y: t.Number(),
  width: t.Number(),
  height: t.Number(),
});

const builderSceneSchema = t.Object({
  id: t.String(),
  titleKey: t.String(),
  background: t.String(),
  geometry: t.Object({ width: t.Number(), height: t.Number() }),
  spawn: t.Object({ x: t.Number(), y: t.Number() }),
  npcs: t.Array(builderNpcSchema),
  collisions: t.Array(builderCollisionSchema),
});

const builderSceneCatalogSchema = t.Record(t.String(), builderSceneSchema);
const builderDialogueCatalogSchema = t.Record(t.String(), t.String());

const builderArtifactPatchSchema = t.Object({
  op: t.Union([t.Literal("add"), t.Literal("replace"), t.Literal("remove")]),
  path: t.String(),
  value: t.String(),
  checksum: t.Optional(t.String()),
  confidence: t.Optional(t.Number()),
});

const builderMutationResultSchema = t.Object({
  projectId: t.String(),
  resourceType: t.Union([
    t.Literal("project"),
    t.Literal("scene"),
    t.Literal("npc"),
    t.Literal("dialogue"),
  ]),
  resourceId: t.String(),
  action: t.Union([
    t.Literal("created"),
    t.Literal("updated"),
    t.Literal("deleted"),
    t.Literal("published"),
  ]),
});

const builderFeatureCapabilitySchema = t.Object({
  assist: t.Boolean(),
  test: t.Boolean(),
  toolLikeSuggestions: t.Boolean(),
  streaming: t.Boolean(),
  offlineFallback: t.Boolean(),
});

const builderProviderCapabilitySchema = t.Object({
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

const availableAiFeaturesSchema = t.Object({
  richDialogue: t.Boolean(),
  visionAnalysis: t.Boolean(),
  sentimentAnalysis: t.Boolean(),
  embeddings: t.Boolean(),
  speechToText: t.Boolean(),
  speechSynthesis: t.Boolean(),
  localInference: t.Boolean(),
  providers: t.Array(t.String()),
});

const appGameConfigSchema = t.Object({
  sessionStore: t.Union([t.Literal("prisma"), t.Literal("memory")]),
  defaultSceneId: t.String(),
  sessionTtlMs: t.Number(),
  tickMs: t.Number(),
  sessionPersistIntervalMs: t.Number(),
  maxInteractionsPerTick: t.Number(),
  maxChatCommandsPerWindow: t.Number(),
  chatRateLimitWindowMs: t.Number(),
  saveCooldownMs: t.Number(),
  maxMovePerTick: t.Number(),
  maxCommandsPerTick: t.Number(),
  maxChatMessageLength: t.Number(),
  viewportWidth: t.Number(),
  viewportHeight: t.Number(),
  hudPollIntervalMs: t.Number(),
  hudRetryDelayMs: t.Number(),
  sessionPurgeIntervalMs: t.Number(),
  sessionResumeWindowMs: t.Number(),
  commandSendIntervalMs: t.Number(),
  commandTtlMs: t.Number(),
  socketReconnectDelayMs: t.Number(),
  restoreRequestTimeoutMs: t.Number(),
  restoreMaxAttempts: t.Number(),
});

const runtimeGameConfigSchema = t.Object({
  sessionTtlMs: t.Number(),
  tickMs: t.Number(),
  sessionPersistIntervalMs: t.Number(),
  saveCooldownMs: t.Number(),
  maxMovePerTick: t.Number(),
  maxCommandsPerTick: t.Number(),
  maxInteractionsPerTick: t.Number(),
  maxChatCommandsPerWindow: t.Number(),
  chatRateLimitWindowMs: t.Number(),
  maxChatMessageLength: t.Number(),
  hudPollIntervalMs: t.Number(),
  hudRetryDelayMs: t.Number(),
  viewportWidth: t.Number(),
  viewportHeight: t.Number(),
  fallbackLocale: t.String(),
  assetBasePath: t.String(),
  defaultSceneId: t.String(),
  sessionResumeWindowMs: t.Number(),
  commandSendIntervalMs: t.Number(),
  commandTtlMs: t.Number(),
  socketReconnectDelayMs: t.Number(),
  restoreRequestTimeoutMs: t.Number(),
  restoreMaxAttempts: t.Number(),
});

const builderAiCapabilitiesDataSchema = t.Object({
  features: builderFeatureCapabilitySchema,
  capabilities: t.Array(builderProviderCapabilitySchema),
});

const builderAiResponseDataSchema = t.Object({
  intent: t.String(),
  rawText: t.String(),
  proposedOperations: t.Array(builderArtifactPatchSchema),
  riskFlags: t.Array(t.String()),
  validationHints: t.Array(t.String()),
  locale: t.String(),
  correlationId: t.String(),
});

const builderAiPlanDataSchema = t.Object({
  intent: t.String(),
  operations: t.Array(builderArtifactPatchSchema),
  riskFlags: t.Array(t.String()),
  requirements: t.Array(t.String()),
  correlationId: t.String(),
});

const builderProjectDataSchema = t.Object({
  id: t.String(),
  createdBy: t.String(),
  updatedBy: t.String(),
  source: t.String(),
  checksum: t.String(),
  version: t.Number(),
  published: t.Boolean(),
  latestReleaseVersion: t.Number(),
  publishedReleaseVersion: t.Nullable(t.Number()),
  lastUpdatedAtMs: t.Number(),
  scenes: builderSceneCatalogSchema,
  dialogues: builderDialogueCatalogSchema,
});

const builderPublishDataSchema = t.Object({
  action: t.Union([t.Literal("publish"), t.Literal("unpublish")]),
  releaseVersion: t.Nullable(t.Number()),
  result: builderMutationResultSchema,
  checksum: t.String(),
});

const builderPatchPreviewOperationSchema = t.Object({
  operation: builderArtifactPatchSchema,
  valid: t.Boolean(),
  message: t.String(),
  before: t.Optional(t.String()),
  after: t.Optional(t.String()),
});

const builderPatchPreviewDataSchema = t.Object({
  projectId: t.String(),
  version: t.Number(),
  checksum: t.String(),
  operations: t.Array(builderPatchPreviewOperationSchema),
});

const builderPatchApplyDataSchema = t.Object({
  projectId: t.String(),
  version: t.Number(),
  checksum: t.String(),
  applied: t.Number(),
  operations: t.Array(builderPatchPreviewOperationSchema),
});

const builderSceneMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: builderSceneSchema,
  checksum: t.String(),
  detailHtml: t.Optional(t.String()),
});

const builderSceneDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Null(),
  checksum: t.String(),
});

const builderNpcMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Union([builderNpcSchema, t.Null()]),
  checksum: t.String(),
});

const builderNpcDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Array(builderNpcSchema),
  checksum: t.String(),
});

const builderDialogueMutationDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Object({
    key: t.String(),
    text: t.String(),
  }),
  checksum: t.String(),
  detailHtml: t.Optional(t.String()),
});

const builderDialogueDeleteDataSchema = t.Object({
  result: builderMutationResultSchema,
  payload: t.Nullable(t.String()),
  checksum: t.String(),
});

const builderStatusDataSchema = t.Object({
  status: appGameConfigSchema,
  features: availableAiFeaturesSchema,
  engine: runtimeGameConfigSchema,
  correlationId: t.String(),
});

const builderSuccessDataSchema = t.Union([
  builderAiCapabilitiesDataSchema,
  builderAiResponseDataSchema,
  builderAiPlanDataSchema,
  builderProjectDataSchema,
  builderPublishDataSchema,
  builderSceneMutationDataSchema,
  builderSceneDeleteDataSchema,
  builderNpcMutationDataSchema,
  builderNpcDeleteDataSchema,
  builderDialogueMutationDataSchema,
  builderDialogueDeleteDataSchema,
  builderPatchPreviewDataSchema,
  builderPatchApplyDataSchema,
  builderStatusDataSchema,
]);

/** TypeBox schema for success envelopes across builder endpoints. */
const builderOkResponse = t.Object({
  ok: t.Literal(true),
  data: builderSuccessDataSchema,
});

const decodePathValue = (value: string): string => safeDecodeUri(value);

const getBuilderMessages = (locale: string | undefined) => getMessages(toLocale(locale)).builder;

const buildBuilderNotFoundError = (
  request: Request,
  headers: Record<string, string | number | undefined>,
  locale: string | undefined,
  messageKey: "projectNotFound" | "sceneNotFound" | "npcNotFound" | "dialogueNotFound",
) =>
  buildError(
    request,
    headers,
    "NOT_FOUND",
    httpStatus.notFound,
    getBuilderMessages(locale)[messageKey],
  );

const toBuilderArtifactPatch = (patch: BuilderArtifactPatch) => ({
  op: patch.op,
  path: patch.path,
  value: patch.value,
  checksum: patch.checksum,
  confidence: patch.confidence,
});

const toBuilderNpc = (npc: SceneNpcDefinition) => ({
  characterKey: npc.characterKey,
  x: npc.x,
  y: npc.y,
  labelKey: npc.labelKey,
  dialogueKeys: [...npc.dialogueKeys],
  interactRadius: npc.interactRadius,
  ai: {
    wanderRadius: npc.ai.wanderRadius,
    wanderSpeed: npc.ai.wanderSpeed,
    idlePauseMs: [npc.ai.idlePauseMs[0], npc.ai.idlePauseMs[1]] as [number, number],
    greetOnApproach: npc.ai.greetOnApproach,
    greetLineKey: npc.ai.greetLineKey,
  },
});

const toBuilderScene = (scene: SceneDefinition) => ({
  id: scene.id,
  titleKey: scene.titleKey,
  background: scene.background,
  geometry: {
    width: scene.geometry.width,
    height: scene.geometry.height,
  },
  spawn: {
    x: scene.spawn.x,
    y: scene.spawn.y,
  },
  npcs: scene.npcs.map(toBuilderNpc),
  collisions: scene.collisions.map((collision) => ({
    x: collision.x,
    y: collision.y,
    width: collision.width,
    height: collision.height,
  })),
});

const toBuilderScenesRecord = (input: ReadonlyMap<string, SceneDefinition>) =>
  Object.fromEntries(Array.from(input.entries(), ([id, scene]) => [id, toBuilderScene(scene)]));

const toBuilderMutationResult = (result: BuilderMutationResult) => ({
  projectId: result.projectId,
  resourceType: result.resourceType,
  resourceId: result.resourceId,
  action: result.action,
});

const projectDialogues = async (
  projectId: string,
  locale: LocaleCode,
): Promise<Record<string, string>> => {
  const project = await builderService.getProject(projectId);
  if (!project) return {};
  const catalog = project.dialogues.get(locale) ?? new Map<string, string>();
  return Object.fromEntries(Array.from(catalog.entries()));
};

const renderErrorHtml = (message: string): string =>
  `<div class="alert alert-error" role="alert">${escapeHtml(message)}</div>`;

const wantsHtml = (acceptHeader: string | null): boolean =>
  acceptHeader === null ||
  acceptHeader.includes("text/html") ||
  acceptHeader.includes("*/*") ||
  acceptHeader.includes("application/xhtml+xml");

const parseIntegerField = (value: string | undefined, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseFloatField = (value: string | undefined, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBooleanField = (value: string | undefined, fallback: boolean): boolean => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return fallback;
};

const buildError = (
  request: Request,
  headers: Record<string, string | number | undefined>,
  code: AppErrorCode,
  status: number,
  message: string,
  retryable = false,
) => {
  const correlationId = ensureCorrelationIdHeader(request, headers);
  return errorEnvelope(new ApplicationError(code, message, status, retryable), correlationId);
};

const parseOperation = (rawText: string): BuilderArtifactPatch[] => {
  const fallback: BuilderArtifactPatch = {
    op: "replace",
    path: "/dialogues/default/lastLine",
    value: "",
  };

  if (rawText.trim().length === 0) {
    return [fallback];
  }

  const parsed = safeJsonParse<unknown>(rawText, null);
  if (!Array.isArray(parsed)) {
    return [fallback];
  }

  return parsed
    .map((item): BuilderArtifactPatch | null => {
      if (item === null || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      if (typeof raw.op !== "string") {
        return null;
      }
      if (typeof raw.path !== "string" || raw.path.length === 0) {
        return null;
      }

      const op = raw.op === "add" || raw.op === "remove" ? raw.op : "replace";
      return {
        op,
        path: raw.path,
        value: typeof raw.value === "string" ? raw.value : JSON.stringify(raw.value ?? ""),
        checksum: typeof raw.checksum === "string" ? raw.checksum : undefined,
        confidence:
          typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
            ? Math.max(0, Math.min(1, raw.confidence))
            : undefined,
      };
    })
    .filter((item): item is BuilderArtifactPatch => item !== null);
};

const makeAiResult = async (request: BuilderAIRequest): Promise<BuilderAIResponse> => {
  if (request.mode === "assist" || request.mode === "compose") {
    const assistant = await suggestUserFlowStep(request.prompt, request.context);
    const operations = parseOperation(assistant.ok ? assistant.text : assistant.error);
    return {
      intent: request.mode,
      rawText: assistant.ok ? assistant.text : assistant.error,
      proposedOperations: operations,
      riskFlags: assistant.ok ? [] : [`${request.mode}-generation-failed`],
      validationHints: assistant.ok
        ? ["Validate operation shape before applying to the project."]
        : ["Retry with clearer constraints."],
    };
  }

  const generated = await generateNpcDialogue(
    {
      npcId: request.npcId ?? "guide",
      sceneId: request.sceneId ?? defaultGameConfig.defaultSceneId,
      playerMessage: request.prompt,
      history: request.context ? [request.context] : undefined,
    },
    request.locale ?? appConfig.defaultLocale,
  );

  const payload = generated.ok
    ? [
        {
          op: "replace",
          path: "/dialogue/test",
          value: generated.text,
          confidence: 0.62,
        } as const,
      ]
    : [
        {
          op: "replace",
          path: "/dialogue/test",
          value: generated.error,
          confidence: 0,
        } as const,
      ];

  return {
    intent: "test",
    rawText: generated.ok ? generated.text : generated.error,
    proposedOperations: payload,
    riskFlags: generated.ok ? [] : ["test-generation-failed"],
    validationHints: generated.ok
      ? ["Verify tone and locale before applying."]
      : ["Try again when AI providers recover."],
  };
};

const asAiResponseEnvelope = (
  request: BuilderAIRequest,
  response: BuilderAIResponse,
  requestContext: CorrelationRequest,
) => {
  const correlationId = ensureCorrelationIdHeader(requestContext.request, requestContext.headers);
  return successEnvelope({
    intent: response.intent,
    rawText: response.rawText,
    proposedOperations: response.proposedOperations.map(toBuilderArtifactPatch),
    riskFlags: [...response.riskFlags],
    validationHints: [...response.validationHints],
    locale: request.locale ?? appConfig.defaultLocale,
    correlationId,
  });
};

export const builderApiRoutes = new Elysia({ name: "builder-api", prefix: "/api/builder" })
  .get(
    route(appRoutes.aiBuilderCapabilities),
    async () => {
      const registry = await ProviderRegistry.getInstance();
      const status = await registry.getStatus();
      const features: FeatureCapability = {
        assist: status.providers.length > 0,
        test: status.providers.some((provider) => provider.available),
        toolLikeSuggestions: true,
        streaming: status.providers.some(
          (provider) => provider.modelCount > 0 && provider.readiness !== "offline",
        ),
        offlineFallback: status.providers.some((provider) => provider.available),
      };

      return successEnvelope({
        features,
        capabilities: status.capabilities.map((capability) => ({
          ...(capability.key ? { key: capability.key } : {}),
          provider: capability.provider,
          model: capability.model,
          capabilities: Array.from(capability.capabilities),
          maxContextLength: capability.maxContextLength,
          supportsStreaming: capability.supportsStreaming,
          runtime: capability.runtime,
          integration: capability.integration,
          local: capability.local,
          configurable: capability.configurable,
        })),
      });
    },
    {
      response: {
        [httpStatus.ok]: t.Object({
          ok: t.Literal(true),
          data: t.Object({
            features: t.Object({
              assist: t.Boolean(),
              test: t.Boolean(),
              toolLikeSuggestions: t.Boolean(),
              streaming: t.Boolean(),
              offlineFallback: t.Boolean(),
            }),
            capabilities: t.Array(
              t.Object({
                provider: t.String(),
                model: t.String(),
                capabilities: t.Array(t.String()),
                maxContextLength: t.Number(),
                supportsStreaming: t.Boolean(),
              }),
            ),
          }),
        }),
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderTest),
    async ({ body, request, set, status }) => {
      const locale = toLocale(body.locale);
      const text = body.prompt ?? body.message;
      if (typeof text !== "string" || text.trim().length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            "Missing prompt.",
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "test",
        prompt: text,
        npcId: body.npcId,
        sceneId: body.sceneId,
        target: body.target,
        context: body.context,
        locale,
      };

      const response = await makeAiResult(aiRequest);
      if (!wantsHtml(request.headers.get("accept"))) {
        return asAiResponseEnvelope(aiRequest, response, { request, headers: set.headers });
      }

      return `<article class="space-y-2">
        <h3 class="font-semibold">${escapeHtml(response.intent)}</h3>
        <p>${escapeHtml(response.rawText)}</p>
        <ul class="list-disc ml-6 text-sm">
          ${response.validationHints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join("")}
        </ul>
      </article>`;
    },
    {
      body: t.Object({
        prompt: t.Optional(t.String()),
        message: t.Optional(t.String()),
        npcId: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        target: t.Optional(t.String()),
        context: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([t.String(), builderOkResponse]),
        [httpStatus.badRequest]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderAssist),
    async ({ body, request, set, status }) => {
      const locale = toLocale(body.locale);
      const requestText = body.prompt?.trim();
      if (!requestText) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            "Missing prompt.",
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "assist",
        prompt: requestText,
        context: body.context,
        target: body.target,
        locale,
      };
      const response = await makeAiResult(aiRequest);
      const payload = {
        intent: response.intent,
        rawText: response.rawText,
        proposedOperations: response.proposedOperations.map(toBuilderArtifactPatch),
        riskFlags: [...response.riskFlags],
        validationHints: [...response.validationHints],
      } as BuilderAIResponse;

      if (!wantsHtml(request.headers.get("accept"))) {
        return asAiResponseEnvelope(aiRequest, response, { request, headers: set.headers });
      }

      const plan: BuilderAIRunPlan = {
        intent: response.intent,
        operations: response.proposedOperations.map(toBuilderArtifactPatch),
        riskFlags: [...response.riskFlags],
        requirements: ["tool-calling", "schema-validation"],
      };

      const operationRows = plan.operations
        .map(
          (operation) =>
            `<li><code>${escapeHtml(operation.op)} ${escapeHtml(operation.path)}</code></li>`,
        )
        .join("");

      return `<article class="space-y-2">
        <p><strong>${escapeHtml(plan.intent)}</strong></p>
        <p class="text-sm">${escapeHtml(payload.rawText)}</p>
        <ul class="list-disc ml-6 text-sm">${operationRows}</ul>
      </article>`;
    },
    {
      body: t.Object({
        prompt: t.String(),
        context: t.Optional(t.String()),
        target: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.Union([t.String(), builderOkResponse]),
        [httpStatus.badRequest]: builderErrorResponse,
      },
    },
  )
  .post(
    route(appRoutes.aiBuilderCompose),
    async ({ body, request, set, status }) => {
      const locale = toLocale(body.locale);
      const requestText = body.prompt?.trim();
      if (!requestText) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            "Missing prompt.",
          ),
        );
      }

      const aiRequest: BuilderAIRequest = {
        mode: "compose",
        prompt: requestText,
        context: body.context,
        sceneId: body.sceneId,
        locale,
      };

      const response = await makeAiResult(aiRequest);
      const plan = {
        intent: response.intent,
        operations: response.proposedOperations.map(toBuilderArtifactPatch),
        riskFlags: [...response.riskFlags],
        requirements: ["tool-calling", "schema-validation"],
      };

      return successEnvelope({
        ...plan,
        correlationId: ensureCorrelationIdHeader(request, set.headers),
      });
    },
    {
      body: t.Object({
        prompt: t.String(),
        context: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        target: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/ai/patch/preview",
    async ({ body, request, set, status }) => {
      const projectId = resolveProjectId(body.projectId);
      const preview = await builderService.previewArtifactPatch(projectId, body.operations);
      if (!preview) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      return successEnvelope({
        projectId: preview.projectId,
        version: preview.version,
        checksum: preview.checksum,
        operations: preview.operations.map((operation) => ({
          operation: toBuilderArtifactPatch(operation.operation),
          valid: operation.valid,
          message: operation.message,
          before: operation.before,
          after: operation.after,
        })),
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        operations: t.Array(builderArtifactPatchSchema),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/ai/patch/apply",
    async ({ body, request, set, status }) => {
      const projectId = resolveProjectId(body.projectId);
      const applied = await builderService.applyArtifactPatch(
        projectId,
        body.operations,
        body.expectedVersion,
      );
      if (!applied) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      if (applied.operations.some((operation) => !operation.valid)) {
        return status(
          httpStatus.conflict,
          buildError(
            request,
            set.headers,
            "CONFLICT",
            httpStatus.conflict,
            "Patch plan contains invalid operations.",
            true,
          ),
        );
      }

      return successEnvelope({
        projectId: applied.projectId,
        version: applied.version,
        checksum: applied.checksum,
        applied: applied.applied,
        operations: applied.operations.map((operation) => ({
          operation: toBuilderArtifactPatch(operation.operation),
          valid: operation.valid,
          message: operation.message,
          before: operation.before,
          after: operation.after,
        })),
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        expectedVersion: t.Optional(t.Number()),
        operations: t.Array(builderArtifactPatchSchema),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.conflict]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/projects",
    async ({ body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const project = await builderService.createProject(projectId);
      if (!project) {
        return status(
          httpStatus.notFound,
          errorEnvelope(
            new ApplicationError(
              "NOT_FOUND",
              getBuilderMessages(undefined).projectNotFound,
              httpStatus.notFound,
              false,
            ),
            ensureCorrelationIdHeader(request, set.headers),
          ),
        );
      }
      return successEnvelope({
        id: project.id,
        createdBy: project.createdBy,
        updatedBy: project.updatedBy,
        source: project.source,
        checksum: project.checksum,
        version: project.version,
        published: project.published,
        latestReleaseVersion: project.latestReleaseVersion,
        publishedReleaseVersion: project.publishedReleaseVersion,
        lastUpdatedAtMs: project.lastUpdatedAtMs,
        scenes: toBuilderScenesRecord(project.scenes),
        dialogues: Object.fromEntries(
          (project.dialogues.get(appConfig.defaultLocale) ?? new Map<string, string>()).entries(),
        ),
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    "/projects/:projectId",
    async ({ params, query, set, request, status }) => {
      const projectId = resolveProjectId(params.projectId);
      const project = await builderService.getProject(projectId);
      if (!project) {
        return status(
          httpStatus.notFound,
          errorEnvelope(
            new ApplicationError(
              "NOT_FOUND",
              getBuilderMessages(query.locale).projectNotFound,
              httpStatus.notFound,
              false,
            ),
            ensureCorrelationIdHeader(request, set.headers),
          ),
        );
      }
      const locale = toLocale(query.locale);
      const dialogues = Object.fromEntries(project.dialogues.get(locale)?.entries() ?? []);

      return successEnvelope({
        id: project.id,
        published: project.published,
        latestReleaseVersion: project.latestReleaseVersion,
        publishedReleaseVersion: project.publishedReleaseVersion,
        scenes: toBuilderScenesRecord(project.scenes),
        dialogues,
        createdBy: project.createdBy,
        updatedBy: project.updatedBy,
        source: project.source,
        checksum: project.checksum,
        version: project.version,
        lastUpdatedAtMs: project.lastUpdatedAtMs,
      });
    },
    {
      params: t.Object({ projectId: t.Optional(t.String()) }),
      query: t.Object({ locale: t.Optional(t.String()) }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .patch(
    "/projects/:projectId/publish",
    async ({ params, body, request, set, status }) => {
      const projectId = resolveProjectId(params.projectId);
      const project = await builderService.publishProject(projectId, body.published);
      if (!project) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, undefined, "projectNotFound"),
        );
      }

      const payload: BuilderMutationResult = {
        projectId: project.id,
        resourceType: "project",
        resourceId: project.id,
        action: "published",
      };

      return successEnvelope({
        action: body.published ? "publish" : "unpublish",
        releaseVersion: project.publishedReleaseVersion,
        result: toBuilderMutationResult(payload),
        checksum: project.checksum,
      });
    },
    {
      params: t.Object({ projectId: t.Optional(t.String()) }),
      body: t.Object({ published: t.Boolean() }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/scenes",
    async ({ body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const scenePayload = {
        id: body.scene.id,
        scene: body.scene,
        checksum: body.checksum,
      } as BuilderScenePayload;

      const result = await builderService.saveScene(projectId, scenePayload);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(result.result),
        payload: toBuilderScene(result.payload),
        checksum: result.checksum,
        detailHtml: renderSceneDetail(
          getMessages(normalizeLocale(body.locale)),
          toBuilderScene(result.payload),
          normalizeLocale(body.locale),
          projectId,
        ),
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        scene: t.Object({
          id: t.String(),
          titleKey: t.String(),
          background: t.String(),
          geometry: t.Object({ width: t.Number(), height: t.Number() }),
          spawn: t.Object({ x: t.Number(), y: t.Number() }),
          npcs: t.Array(
            t.Object({
              characterKey: t.String(),
              x: t.Number(),
              y: t.Number(),
              labelKey: t.String(),
              dialogueKeys: t.Array(t.String()),
              interactRadius: t.Number(),
              ai: t.Object({
                wanderRadius: t.Number(),
                wanderSpeed: t.Number(),
                idlePauseMs: t.Tuple([t.Number(), t.Number()]),
                greetOnApproach: t.Boolean(),
                greetLineKey: t.String(),
              }),
            }),
          ),
          collisions: t.Array(
            t.Object({
              x: t.Number(),
              y: t.Number(),
              width: t.Number(),
              height: t.Number(),
            }),
          ),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    "/scenes/:sceneId",
    async ({ params, query }) => {
      const projectId = resolveProjectId(query.projectId);
      const scene = await builderService.getScene(projectId, params.sceneId);
      const locale = toLocale(query.locale);
      const messages = getMessages(locale);
      if (!scene) {
        return renderErrorHtml(messages.builder.sceneNotFound);
      }

      return renderSceneDetail(messages, scene, locale, projectId);
    },
    {
      params: t.Object({ sceneId: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/scenes/:sceneId/form",
    async ({ params, body, request, set, status }) => {
      const projectId = resolveProjectId(body.projectId);
      const locale = toLocale(body.locale);
      const current = await builderService.getScene(projectId, params.sceneId);
      if (!current) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      const updatedScene: SceneDefinition = {
        ...current,
        id: params.sceneId,
        titleKey: body.titleKey?.trim() || current.titleKey,
        background: body.background?.trim() || current.background,
        geometry: {
          width: Math.max(1, parseIntegerField(body.geometryWidth, current.geometry.width)),
          height: Math.max(1, parseIntegerField(body.geometryHeight, current.geometry.height)),
        },
        spawn: {
          x: parseIntegerField(body.spawnX, current.spawn.x),
          y: parseIntegerField(body.spawnY, current.spawn.y),
        },
      };

      const result = await builderService.saveScene(projectId, {
        id: params.sceneId,
        scene: updatedScene,
      });
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      return renderSceneDetail(
        getMessages(locale),
        toBuilderScene(result.payload),
        locale,
        projectId,
      );
    },
    {
      params: t.Object({ sceneId: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        titleKey: t.Optional(t.String()),
        background: t.Optional(t.String()),
        geometryWidth: t.Optional(t.String()),
        geometryHeight: t.Optional(t.String()),
        spawnX: t.Optional(t.String()),
        spawnY: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .put(
    "/scenes/:sceneId",
    async ({ params, body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const payload = {
        id: params.sceneId,
        scene: { ...body.scene, id: params.sceneId },
        checksum: body.checksum,
      } as BuilderScenePayload;

      const result = await builderService.saveScene(projectId, payload);
      if (!result) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(result.result),
        payload: toBuilderScene(result.payload),
        checksum: result.checksum,
      });
    },
    {
      params: t.Object({ sceneId: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        scene: t.Object({
          titleKey: t.String(),
          background: t.String(),
          geometry: t.Object({ width: t.Number(), height: t.Number() }),
          spawn: t.Object({ x: t.Number(), y: t.Number() }),
          npcs: t.Array(
            t.Object({
              characterKey: t.String(),
              x: t.Number(),
              y: t.Number(),
              labelKey: t.String(),
              dialogueKeys: t.Array(t.String()),
              interactRadius: t.Number(),
              ai: t.Object({
                wanderRadius: t.Number(),
                wanderSpeed: t.Number(),
                idlePauseMs: t.Tuple([t.Number(), t.Number()]),
                greetOnApproach: t.Boolean(),
                greetLineKey: t.String(),
              }),
            }),
          ),
          collisions: t.Array(
            t.Object({
              x: t.Number(),
              y: t.Number(),
              width: t.Number(),
              height: t.Number(),
            }),
          ),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    "/scenes/:sceneId",
    async ({ params, query, request, set, status }) => {
      const projectId = resolveProjectId(query.projectId);
      const mutation = await builderService.removeScene(projectId, params.sceneId);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, query.locale, "sceneNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: mutation.payload,
        checksum: mutation.checksum,
      });
    },
    {
      params: t.Object({ sceneId: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/npcs",
    async ({ body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const payload = {
        sceneId: body.sceneId,
        npc: body.npc,
      } as BuilderNpcPayload;

      const mutation = await builderService.saveNpc(projectId, payload);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, undefined, "sceneNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: mutation.payload === null ? null : toBuilderNpc(mutation.payload),
        checksum: mutation.checksum,
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        sceneId: t.String(),
        npc: t.Object({
          characterKey: t.String(),
          x: t.Number(),
          y: t.Number(),
          labelKey: t.String(),
          dialogueKeys: t.Array(t.String()),
          interactRadius: t.Number(),
          ai: t.Object({
            wanderRadius: t.Number(),
            wanderSpeed: t.Number(),
            idlePauseMs: t.Tuple([t.Number(), t.Number()]),
            greetOnApproach: t.Boolean(),
            greetLineKey: t.String(),
          }),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    "/npcs/:npcId",
    async ({ params, query }) => {
      const projectId = resolveProjectId(query.projectId);
      const npc = await builderService.findNpc(projectId, params.npcId);
      const locale = toLocale(query.locale);
      const messages = getMessages(locale);
      if (!npc) {
        return renderErrorHtml(messages.builder.npcNotFound);
      }

      const sceneIdFromQuery = query.sceneId?.trim();
      let ownerSceneId = sceneIdFromQuery && sceneIdFromQuery.length > 0 ? sceneIdFromQuery : null;
      if (!ownerSceneId) {
        const scenes = await builderService.listScenes(projectId);
        ownerSceneId =
          scenes.find((scene) =>
            scene.npcs.some((candidate) => candidate.characterKey === params.npcId),
          )?.id ?? null;
      }
      if (!ownerSceneId) {
        return renderErrorHtml(messages.builder.npcNotFound);
      }

      return renderNpcDetail(messages, npc, locale, projectId, ownerSceneId);
    },
    {
      params: t.Object({ npcId: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/npcs/:npcId/form",
    async ({ params, body, request, set, status }) => {
      const projectId = resolveProjectId(body.projectId);
      const locale = toLocale(body.locale);
      const sceneId = body.sceneId?.trim() ?? "";
      if (sceneId.length === 0) {
        return status(
          httpStatus.badRequest,
          buildError(
            request,
            set.headers,
            "VALIDATION_ERROR",
            httpStatus.badRequest,
            "sceneId is required",
          ),
        );
      }

      const scene = await builderService.getScene(projectId, sceneId);
      if (!scene) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "sceneNotFound"),
        );
      }

      const currentNpc = scene.npcs.find((candidate) => candidate.characterKey === params.npcId);
      if (!currentNpc) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      const dialogueKeys = (body.dialogueKeys ?? "")
        .split(",")
        .map((key) => key.trim())
        .filter((key) => key.length > 0);

      const nextNpc: SceneNpcDefinition = {
        ...currentNpc,
        characterKey: params.npcId,
        labelKey: body.labelKey?.trim() || currentNpc.labelKey,
        x: parseIntegerField(body.x, currentNpc.x),
        y: parseIntegerField(body.y, currentNpc.y),
        interactRadius: Math.max(
          1,
          parseIntegerField(body.interactRadius, currentNpc.interactRadius),
        ),
        dialogueKeys: dialogueKeys.length > 0 ? dialogueKeys : [...currentNpc.dialogueKeys],
        ai: {
          ...currentNpc.ai,
          wanderRadius: Math.max(
            0,
            parseIntegerField(body.wanderRadius, currentNpc.ai.wanderRadius),
          ),
          wanderSpeed: Math.max(0, parseFloatField(body.wanderSpeed, currentNpc.ai.wanderSpeed)),
          idlePauseMs: [
            Math.max(0, parseIntegerField(body.idlePauseMinMs, currentNpc.ai.idlePauseMs[0])),
            Math.max(0, parseIntegerField(body.idlePauseMaxMs, currentNpc.ai.idlePauseMs[1])),
          ] as [number, number],
          greetOnApproach: parseBooleanField(body.greetOnApproach, currentNpc.ai.greetOnApproach),
          greetLineKey: body.greetLineKey?.trim() || currentNpc.ai.greetLineKey,
        },
      };

      const mutation = await builderService.saveNpc(projectId, {
        sceneId,
        npc: nextNpc,
      });
      if (!mutation || !mutation.payload) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "npcNotFound"),
        );
      }

      return renderNpcDetail(getMessages(locale), mutation.payload, locale, projectId, sceneId);
    },
    {
      params: t.Object({ npcId: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
        labelKey: t.Optional(t.String()),
        x: t.Optional(t.String()),
        y: t.Optional(t.String()),
        interactRadius: t.Optional(t.String()),
        wanderRadius: t.Optional(t.String()),
        wanderSpeed: t.Optional(t.String()),
        idlePauseMinMs: t.Optional(t.String()),
        idlePauseMaxMs: t.Optional(t.String()),
        greetOnApproach: t.Optional(t.String()),
        greetLineKey: t.Optional(t.String()),
        dialogueKeys: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .put(
    "/npcs/:npcId",
    async ({ params, body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const mutation = await builderService.saveNpc(projectId, {
        sceneId: body.sceneId,
        npc: {
          ...body.npc,
          characterKey: params.npcId,
        },
      });

      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "npcNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: mutation.payload === null ? null : toBuilderNpc(mutation.payload),
        checksum: mutation.checksum,
      });
    },
    {
      params: t.Object({ npcId: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        sceneId: t.String(),
        npc: t.Object({
          characterKey: t.Optional(t.String()),
          x: t.Number(),
          y: t.Number(),
          labelKey: t.String(),
          dialogueKeys: t.Array(t.String()),
          interactRadius: t.Number(),
          ai: t.Object({
            wanderRadius: t.Number(),
            wanderSpeed: t.Number(),
            idlePauseMs: t.Tuple([t.Number(), t.Number()]),
            greetOnApproach: t.Boolean(),
            greetLineKey: t.String(),
          }),
        }),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    "/npcs/:npcId",
    async ({ params, query, request, set, status }) => {
      const projectId = resolveProjectId(query.projectId);
      const scenes = await builderService.listScenes(projectId);
      const owner = scenes.find((scene) =>
        scene.npcs.some((candidate) => candidate.characterKey === params.npcId),
      );
      if (!owner) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, query.locale, "npcNotFound"),
        );
      }

      const mutation = await builderService.removeNpc(projectId, owner.id, params.npcId);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, query.locale, "npcNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: mutation.payload.map(toBuilderNpc),
        checksum: mutation.checksum,
      });
    },
    {
      params: t.Object({ npcId: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/dialogue",
    async ({ body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const payload = {
        key: body.key,
        text: body.text,
        locale: body.locale,
        checksum: body.checksum,
      } as BuilderDialoguePayload;

      const mutation = await builderService.saveDialogue(projectId, payload);
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      const locale = toLocale(body.locale);
      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: { key: payload.key, text: catalog[payload.key] ?? body.text },
        checksum: mutation.checksum,
        detailHtml: renderDialogueDetail(
          messages,
          payload.key,
          catalog[payload.key] ?? body.text,
          locale,
          projectId,
        ),
      });
    },
    {
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        key: t.String(),
        text: t.String(),
        checksum: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .get(
    "/dialogue/:key",
    async ({ params, query }) => {
      const projectId = resolveProjectId(query.projectId);
      const locale = toLocale(query.locale);
      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      const key = decodePathValue(params.key);
      const value = catalog[key];
      if (typeof value !== "string") {
        return renderErrorHtml(`${messages.builder.noDialogues}: ${escapeHtml(key)}`);
      }

      return renderDialogueDetail(messages, key, value, locale, projectId);
    },
    {
      params: t.Object({ key: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/dialogue/:key/form",
    async ({ params, body, request, set, status }) => {
      const projectId = resolveProjectId(body.projectId);
      const locale = toLocale(body.locale);
      const key = decodePathValue(params.key);
      const mutation = await builderService.saveDialogue(projectId, {
        key,
        text: body.text ?? "",
        locale,
      });
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, locale, "projectNotFound"),
        );
      }

      const catalog = await projectDialogues(projectId, locale);
      return renderDialogueDetail(
        getMessages(locale),
        key,
        catalog[key] ?? body.text ?? "",
        locale,
        projectId,
      );
    },
    {
      params: t.Object({ key: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        text: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: t.String(),
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .put(
    "/dialogue/:key",
    async ({ params, body, request, set, status }) => {
      const projectId = projectFromBody(body);
      const key = decodePathValue(params.key);
      const locale = toLocale(body.locale);
      const mutation = await builderService.saveDialogue(projectId, {
        key,
        text: body.text,
        locale,
      });
      if (!mutation) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, body.locale, "projectNotFound"),
        );
      }

      const messages = getMessages(locale);
      const catalog = await projectDialogues(projectId, locale);
      return successEnvelope({
        result: toBuilderMutationResult(mutation.result),
        payload: { key, text: catalog[key] ?? body.text },
        checksum: mutation.checksum,
        detailHtml: renderDialogueDetail(
          messages,
          key,
          catalog[key] ?? body.text,
          locale,
          projectId,
        ),
      });
    },
    {
      params: t.Object({ key: t.String() }),
      body: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        text: t.String(),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .delete(
    "/dialogue/:key",
    async ({ params, query, request, set, status }) => {
      const projectId = resolveProjectId(query.projectId);
      const locale = toLocale(query.locale);
      const key = decodePathValue(params.key);
      const removed = await builderService.removeDialogue(projectId, locale, key);
      if (!removed) {
        return status(
          httpStatus.notFound,
          buildBuilderNotFoundError(request, set.headers, query.locale, "dialogueNotFound"),
        );
      }

      return successEnvelope({
        result: toBuilderMutationResult(removed.result),
        payload: removed.payload,
        checksum: removed.checksum,
      });
    },
    {
      params: t.Object({ key: t.String() }),
      query: t.Object({
        projectId: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
      response: {
        [httpStatus.ok]: builderOkResponse,
        [httpStatus.badRequest]: builderErrorResponse,
        [httpStatus.notFound]: builderErrorResponse,
      },
    },
  )
  .post(
    "/dialogue/generate",
    async ({ body }) => {
      const locale = toLocale(body.locale);
      const _projectId = projectFromBody(body);
      const messages = getMessages(locale);
      const sceneId = body.sceneId ?? defaultGameConfig.defaultSceneId;
      const generated = await generateNpcDialogue(
        {
          npcId: body.npcId,
          sceneId,
          playerMessage: body.message,
        },
        locale,
      );
      const lineKey = `${body.npcId}.generated.lastMessage`;
      const text = generated.ok ? generated.text : generated.error;
      return renderDialogueDetail(messages, lineKey, text, locale, projectFromBody(body));
    },
    {
      body: t.Object({
        npcId: t.String(),
        locale: t.Optional(t.String()),
        message: t.Optional(t.String()),
        projectId: t.Optional(t.String()),
        sceneId: t.Optional(t.String()),
      }),
      response: { [httpStatus.ok]: t.String() },
    },
  )
  .get(
    "/status",
    async ({ request, set }) => {
      const features = await detectAvailableFeatures();
      const gameContract = getGameContractValues();

      return successEnvelope({
        status: appConfig.game,
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
        engine: gameContract.engine,
        correlationId: ensureCorrelationIdHeader(request, set.headers),
      });
    },
    {
      response: {
        [httpStatus.ok]: builderOkResponse,
      },
    },
  );

export type App = typeof builderApiRoutes;

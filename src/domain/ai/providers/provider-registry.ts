/**
 * AI Provider Registry
 *
 * Singleton that manages all AI providers, runs capability detection,
 * and routes requests to the best available backend. Handles graceful
 * fallback when a provider is unavailable.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import type { ProviderReadiness } from "../../../shared/contracts/game.ts";
import { settleAsync } from "../../../shared/utils/async-result.ts";
import { OllamaProvider } from "./ollama-provider.ts";
import { OpenAiCompatibleProvider } from "./openai-compatible-provider.ts";
import type {
  AiCapability,
  AiChatParams,
  AiImageGenerationParams,
  AiImageGenerationResult,
  AiClassificationResult,
  AiGenerationResult,
  AiGovernanceContext,
  AiModelCapabilities,
  AiModelProvenance,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiToolPlanParams,
  AiToolPlanResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "./provider-types.ts";
import { HuggingFaceInferenceProvider } from "./huggingface-inference-provider.ts";
import { TransformersProvider } from "./transformers-provider.ts";

const logger = createLogger("ai.provider-registry");

/**
 * Provider availability status exposed to API consumers.
 */
export interface ProviderStatus {
  readonly name: string;
  readonly available: boolean;
  readonly readiness: ProviderReadiness;
  readonly modelCount: number;
  readonly reason?: string;
}

/**
 * Complete AI system status snapshot.
 */
export interface AiSystemStatus {
  readonly providers: readonly ProviderStatus[];
  readonly capabilities: readonly AiModelCapabilities[];
  readonly preferredProvider: string;
}

const providerOrdering: Readonly<Record<AiProvider["name"], number>> = {
  "openai-compatible-local": 0,
  ollama: 1,
  transformers: 2,
  "huggingface-inference": 3,
  "huggingface-endpoints": 4,
  "openai-compatible-cloud": 5,
};

const MAX_IMAGE_PROMPT_LENGTH = 1000;

/**
 * Manages AI provider lifecycle, capability detection, and request routing.
 */
export class ProviderRegistry {
  private static _instance: ProviderRegistry | null = null;

  private readonly _providers: readonly AiProvider[];
  private _allCapabilities: readonly AiModelCapabilities[] = [];
  private _initialRefreshPromise: Promise<void> | null = null;
  private _providerAvailability = new Map<string, boolean>();
  private _providerReadiness = new Map<string, ProviderReadiness>();
  private _providerReasons = new Map<string, string>();
  private _usageByUserByHour = new Map<string, number>();
  private _usageByProjectByHour = new Map<string, number>();
  private _disposed = false;

  private constructor(providers: readonly AiProvider[]) {
    this._providers = providers;
  }

  /**
   * Returns the singleton instance, creating it on first call.
   *
   * @returns ProviderRegistry singleton.
   */
  static async getInstance(): Promise<ProviderRegistry> {
    if (ProviderRegistry._instance) {
      return ProviderRegistry._instance;
    }

    const providers: AiProvider[] = [new TransformersProvider()];
    if (appConfig.ai.ollamaEnabled) {
      providers.push(new OllamaProvider());
    }
    if (appConfig.ai.openAiCompatible.local.enabled) {
      providers.push(
        new OpenAiCompatibleProvider({
          name: "openai-compatible-local",
          vendor: appConfig.ai.openAiCompatible.local.vendor,
          providerLabel: appConfig.ai.openAiCompatible.local.providerLabel,
          baseUrl: appConfig.ai.openAiCompatible.local.baseUrl,
          apiKey: appConfig.ai.openAiCompatible.local.apiKey,
          availabilityTimeoutMs: appConfig.ai.openAiCompatible.local.availabilityTimeoutMs,
          chatModel: appConfig.ai.openAiCompatible.local.chatModel,
          embeddingModel: appConfig.ai.openAiCompatible.local.embeddingModel,
          visionModel: appConfig.ai.openAiCompatible.local.visionModel,
          transcriptionModel: appConfig.ai.openAiCompatible.local.transcriptionModel,
          speechModel: appConfig.ai.openAiCompatible.local.speechModel,
          moderationModel: appConfig.ai.openAiCompatible.local.moderationModel,
          speechVoice: appConfig.ai.openAiCompatible.local.speechVoice,
          endpoints: appConfig.ai.openAiCompatible.local.endpoints,
          auth: appConfig.ai.openAiCompatible.local.auth,
          local: true,
        }),
      );
    }
    if (appConfig.ai.openAiCompatible.cloud.enabled) {
      providers.push(
        new OpenAiCompatibleProvider({
          name: "openai-compatible-cloud",
          vendor: appConfig.ai.openAiCompatible.cloud.vendor,
          providerLabel: appConfig.ai.openAiCompatible.cloud.providerLabel,
          baseUrl: appConfig.ai.openAiCompatible.cloud.baseUrl,
          apiKey: appConfig.ai.openAiCompatible.cloud.apiKey,
          availabilityTimeoutMs: appConfig.ai.openAiCompatible.cloud.availabilityTimeoutMs,
          chatModel: appConfig.ai.openAiCompatible.cloud.chatModel,
          embeddingModel: appConfig.ai.openAiCompatible.cloud.embeddingModel,
          visionModel: appConfig.ai.openAiCompatible.cloud.visionModel,
          transcriptionModel: appConfig.ai.openAiCompatible.cloud.transcriptionModel,
          speechModel: appConfig.ai.openAiCompatible.cloud.speechModel,
          moderationModel: appConfig.ai.openAiCompatible.cloud.moderationModel,
          speechVoice: appConfig.ai.openAiCompatible.cloud.speechVoice,
          endpoints: appConfig.ai.openAiCompatible.cloud.endpoints,
          auth: appConfig.ai.openAiCompatible.cloud.auth,
          local: false,
        }),
      );
    }
    if (appConfig.ai.huggingfaceInference.enabled) {
      providers.push(new HuggingFaceInferenceProvider());
    }
    if (
      appConfig.ai.huggingfaceEndpoints.enabled &&
      (appConfig.ai.huggingfaceEndpoints.chatUrl !== null ||
        appConfig.ai.huggingfaceEndpoints.imageUrl !== null)
    ) {
      providers.push(new HuggingFaceInferenceProvider("huggingface-endpoints"));
    }

    const registry = new ProviderRegistry(providers);
    ProviderRegistry._instance = registry;
    const readinessResult = await settleAsync(registry._ensureCapabilitiesReady());
    if (!readinessResult.ok) {
      logger.warn("registry.initial-refresh.failed", { error: readinessResult.error.message });
    }
    return registry;
  }

  /**
   * Returns the active singleton instance without creating one.
   *
   * @returns Existing registry instance, if any.
   */
  static peekInstance(): ProviderRegistry | null {
    return ProviderRegistry._instance;
  }

  /**
   * Returns a snapshot of the entire AI system status.
   *
   * @returns System status with provider availability and capabilities.
   */
  async getStatus(): Promise<AiSystemStatus> {
    await this._ensureCapabilitiesReady();
    const providers: ProviderStatus[] = [];

    for (const provider of this._providers) {
      const available = this._providerAvailability.get(provider.name) ?? false;
      const readiness = this._providerReadiness.get(provider.name) ?? "offline";
      const modelCount = this._allCapabilities.filter((c) => c.provider === provider.name).length;

      providers.push({
        name: provider.name,
        available,
        readiness,
        modelCount,
        reason: this._providerReasons.get(provider.name),
      });
    }

    return {
      providers,
      capabilities: this._allCapabilities,
      preferredProvider: appConfig.ai.preferredProvider,
    };
  }

  /**
   * Returns all detected capabilities across all providers.
   *
   * @returns Immutable array of model capabilities.
   */
  getCapabilities(): readonly AiModelCapabilities[] {
    return this._allCapabilities;
  }

  /**
   * Finds all models that support a given capability.
   *
   * @param capability Required capability.
   * @returns Matching model descriptors from available providers.
   */
  findModelsWithCapability(capability: AiCapability): readonly AiModelCapabilities[] {
    return this._allCapabilities.filter(
      (c) =>
        c.capabilities.has(capability) && (this._providerAvailability.get(c.provider) ?? false),
    );
  }

  /**
   * Selects the best provider for a given capability.
   * Respects the `preferredProvider` config when set.
   *
   * @param capability Required capability.
   * @returns Best available provider, or null.
   */
  selectProvider(
    capability: AiCapability,
    options?: { readonly localOnly?: boolean },
  ): AiProvider | null {
    const preferred = appConfig.ai.preferredProvider;

    if (preferred !== "auto") {
      const match = this._providers.find((provider) => {
        if (!(this._providerAvailability.get(provider.name) ?? false)) {
          return false;
        }
        const capabilityRecord = this.findCapabilityRecord(provider.name, capability);
        if (!capabilityRecord) {
          return false;
        }
        if (options?.localOnly && capabilityRecord.local !== true) {
          return false;
        }
        return provider.name === preferred;
      });

      if (match) {
        if (this.findCapabilityRecord(match.name, capability)) {
          return this.applyAllowlist(match, capability, options);
        }
      }
    }

    const localProviders = this._providers
      .filter((provider) => {
        if (!(this._providerAvailability.get(provider.name) ?? false)) {
          return false;
        }

        const capabilityRecord = this.findCapabilityRecord(provider.name, capability);
        return capabilityRecord?.local === true;
      })
      .sort(
        (left, right) => (providerOrdering[left.name] ?? 99) - (providerOrdering[right.name] ?? 99),
      );

    if (localProviders[0]) {
      return this.applyAllowlist(localProviders[0], capability, options);
    }

    if (!appConfig.ai.routing.cloudFallbackEnabled) {
      return null;
    }

    const cloudCandidate =
      this._providers
        .filter((provider) => {
          if (!(this._providerAvailability.get(provider.name) ?? false)) {
            return false;
          }
          const capabilityRecord = this.findCapabilityRecord(provider.name, capability);
          if (!capabilityRecord) {
            return false;
          }
          if (options?.localOnly && capabilityRecord.local !== true) {
            return false;
          }
          return true;
        })
        .sort(
          (left, right) =>
            (providerOrdering[left.name] ?? 99) - (providerOrdering[right.name] ?? 99),
        )[0] ?? null;
    return this.applyAllowlist(cloudCandidate, capability, options);
  }

  /**
   * High-level chat generation routing.
   *
   * @param params Chat parameters.
   * @returns Generation result from the best available provider.
   */
  async chat(params: AiChatParams): Promise<AiGenerationResult> {
    await this._ensureCapabilitiesReady();
    if (appConfig.ai.generationKillSwitchEnabled) {
      return {
        ok: false,
        error: "AI generation is currently disabled by an incident kill switch",
        retryable: false,
      };
    }
    if (!appConfig.ai.allowHighCostGeneration && params.costTier === "high") {
      return {
        ok: false,
        error: "High-cost AI generation is disabled by policy",
        retryable: false,
      };
    }
    const quotaAllowed = this.consumeQuota(params.governance, params.costTier === "high" ? 3 : 1);
    if (!quotaAllowed) {
      return {
        ok: false,
        error: "AI quota exceeded for current user or project",
        retryable: false,
      };
    }

    const provider = this.selectProvider("chat", {
      localOnly: params.governance?.sensitiveContext === true,
    });
    if (!provider) {
      return {
        ok: false,
        error: "No provider available for chat generation",
        retryable: true,
      };
    }

    logger.info("registry.chat.routing", { provider: provider.name });
    const result = await provider.chat(params);
    if (!result.ok) {
      return this.prefixProviderFailure(provider.name, result);
    }
    return {
      ...result,
      provenance: this.toProvenance(provider.name, result.model, params.governance),
    };
  }

  /**
   * High-level streaming chat generation routing.
   *
   * @param params Chat parameters.
   * @returns Async generator yielding token strings.
   */
  async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    await this._ensureCapabilitiesReady();
    if (appConfig.ai.generationKillSwitchEnabled) {
      return;
    }
    const provider = this.selectProvider("chat", {
      localOnly: params.governance?.sensitiveContext === true,
    });
    if (!provider) {
      return;
    }

    logger.info("registry.chatStream.routing", { provider: provider.name });
    yield* provider.chatStream(params);
  }

  /**
   * High-level image generation routing.
   *
   * @param params Image generation parameters.
   * @returns Image artifact from best available provider.
   */
  async generateImage(params: AiImageGenerationParams): Promise<AiImageGenerationResult> {
    await this._ensureCapabilitiesReady();
    const prompt = params.prompt.trim();
    if (prompt.length === 0) {
      return {
        ok: false,
        error: "Image generation prompt is required",
        retryable: false,
      };
    }
    if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
      return {
        ok: false,
        error: `Image generation prompt exceeds ${MAX_IMAGE_PROMPT_LENGTH} characters`,
        retryable: false,
      };
    }
    if (appConfig.ai.generationKillSwitchEnabled) {
      return {
        ok: false,
        error: "AI generation is currently disabled by an incident kill switch",
        retryable: false,
      };
    }
    const costTier = params.costTier ?? "high";
    if (!appConfig.ai.allowHighCostGeneration && costTier === "high") {
      return {
        ok: false,
        error: "High-cost AI generation is disabled by policy",
        retryable: false,
      };
    }
    const quotaAllowed = this.consumeQuota(params.governance, costTier === "high" ? 3 : 1);
    if (!quotaAllowed) {
      return {
        ok: false,
        error: "AI quota exceeded for current user or project",
        retryable: false,
      };
    }

    const provider = this.selectProvider("image-generation", {
      localOnly: params.governance?.sensitiveContext === true,
    });
    if (!provider || typeof provider.generateImage !== "function") {
      return {
        ok: false,
        error: "No provider available for image generation",
        retryable: true,
      };
    }

    logger.info("registry.generateImage.routing", { provider: provider.name });
    const result = await provider.generateImage({
      ...params,
      prompt,
    });
    if (!result.ok) {
      return this.prefixProviderFailure(provider.name, result);
    }

    logger.info("registry.generateImage.completed", {
      provider: provider.name,
      model: result.model,
      durationMs: result.durationMs,
    });

    return {
      ...result,
      provenance: this.toProvenance(provider.name, result.model, params.governance),
    };
  }

  /**
   * High-level text classification routing.
   *
   * @param text Input text.
   * @returns Classification result or null.
   */
  async classify(text: string): Promise<AiClassificationResult | null> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("text-classification");
    if (!provider) {
      return null;
    }

    return provider.classify(text);
  }

  /**
   * High-level vision analysis routing.
   *
   * @param image Raw image bytes.
   * @param prompt Instruction.
   * @returns Generation result.
   */
  async describeImage(image: Uint8Array, prompt: string): Promise<AiGenerationResult> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("vision");
    if (!provider) {
      return {
        ok: false,
        error: "No vision-capable model available",
        retryable: false,
      };
    }

    logger.info("registry.describeImage.routing", { provider: provider.name });
    const result = await provider.describeImage(image, prompt);
    return result.ok ? result : this.prefixProviderFailure(provider.name, result);
  }

  /**
   * Routes speech transcription to the best local provider.
   *
   * @param params Audio transcription parameters.
   * @returns Speech transcription result.
   */
  async transcribeAudio(params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("speech-to-text");
    if (!provider) {
      return {
        ok: false,
        error: "No provider available for speech recognition",
        retryable: false,
      };
    }

    logger.info("registry.transcribe.routing", { provider: provider.name });
    const result = await provider.transcribeAudio(params);
    return result.ok ? result : this.prefixProviderFailure(provider.name, result);
  }

  /**
   * Routes speech synthesis to the best local provider.
   *
   * @param params Speech synthesis parameters.
   * @returns Speech synthesis result.
   */
  async synthesizeSpeech(params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("text-to-speech");
    if (!provider) {
      return {
        ok: false,
        error: "No provider available for speech synthesis",
        retryable: false,
      };
    }

    logger.info("registry.synthesize.routing", { provider: provider.name });
    const result = await provider.synthesizeSpeech(params);
    return result.ok ? result : this.prefixProviderFailure(provider.name, result);
  }

  /**
   * Routes text embedding generation to the best available provider.
   *
   * @param text Input text to embed.
   * @returns Dense embedding vector, or null when unavailable.
   */
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("embeddings");
    if (!provider) {
      return null;
    }

    logger.info("registry.embedding.routing", { provider: provider.name });
    return provider.generateEmbedding(text);
  }

  /**
   * Routes structured tool planning to the best available provider.
   *
   * @param params Planning parameters.
   * @returns Structured planning result.
   */
  async planTools(params: AiToolPlanParams): Promise<AiToolPlanResult> {
    await this._ensureCapabilitiesReady();
    if (appConfig.ai.generationKillSwitchEnabled) {
      return {
        ok: false,
        error: "Tool planning is disabled by an incident kill switch",
        retryable: false,
      };
    }
    if (params.requireExplicitApproval && !params.approvalGranted) {
      return {
        ok: false,
        error: "Explicit approval is required before planning in sensitive contexts",
        retryable: false,
      };
    }
    const quotaAllowed = this.consumeQuota(params.governance, 2);
    if (!quotaAllowed) {
      return {
        ok: false,
        error: "AI planning quota exceeded for current user or project",
        retryable: false,
      };
    }

    const selectedPlanner = this.selectProvider("structured-planning", {
      localOnly: params.governance?.sensitiveContext === true,
    });
    const directPlanner =
      selectedPlanner &&
      this._providers.find(
        (provider) =>
          provider.name === selectedPlanner.name && typeof provider.planTools === "function",
      );

    if (directPlanner?.planTools) {
      logger.info("registry.planTools.routing", { provider: directPlanner.name, mode: "direct" });
      const directResult = await directPlanner.planTools(params);
      if (!directResult.ok) {
        return this.prefixProviderFailure(directPlanner.name, directResult);
      }
      return {
        ...directResult,
        provenance: this.toProvenance(directPlanner.name, directResult.model, params.governance),
      };
    }

    return {
      ok: false,
      error: "No provider available for structured tool planning",
      retryable: false,
    };
  }

  /**
   * Refreshes capability detection across all providers.
   */
  async refreshCapabilities(): Promise<void> {
    if (this._disposed) {
      return;
    }

    const allCapabilities: AiModelCapabilities[] = [];

    for (const provider of this._providers) {
      const readinessResult = await settleAsync(provider.readiness());
      const readiness = readinessResult.ok ? readinessResult.value : "offline";
      const available = readiness !== "offline";
      this._providerAvailability.set(provider.name, available);
      this._providerReadiness.set(provider.name, readiness);
      this._providerReasons.set(
        provider.name,
        readinessResult.ok
          ? readiness === "degraded"
            ? "recovering"
            : ""
          : readinessResult.error.message,
      );

      if (available) {
        const capabilitiesResult = await settleAsync(provider.detectCapabilities());
        if (capabilitiesResult.ok) {
          allCapabilities.push(...capabilitiesResult.value);
        } else {
          this._providerReasons.set(provider.name, capabilitiesResult.error.message);
          logger.warn("registry.capabilities.provider-failed", {
            provider: provider.name,
            error: capabilitiesResult.error.message,
          });
        }
      }
    }

    this._allCapabilities = allCapabilities;

    logger.info("registry.capabilities.refreshed", {
      providers: [...this._providerAvailability.entries()].map(([name, available]) => ({
        name,
        available,
        readiness: this._providerReadiness.get(name) ?? "offline",
      })),
      totalModels: allCapabilities.length,
    });
  }

  /**
   * Disposes all providers and stops periodic refresh.
   */
  async dispose(): Promise<void> {
    if (this._disposed) {
      return;
    }

    this._disposed = true;

    for (const provider of this._providers) {
      await provider.dispose();
    }

    this._allCapabilities = [];
    this._providerAvailability.clear();
    this._providerReadiness.clear();
    this._providerReasons.clear();
    this._usageByUserByHour.clear();
    this._usageByProjectByHour.clear();
    ProviderRegistry._instance = null;
    logger.info("registry.disposed");
  }

  private applyAllowlist(
    candidate: AiProvider | null,
    capability: AiCapability,
    options?: { readonly localOnly?: boolean },
  ): AiProvider | null {
    if (!candidate) {
      return null;
    }

    const allowlist = new Set(appConfig.ai.providerAllowlist.map((entry) => entry.toLowerCase()));
    if (allowlist.size === 0) {
      return candidate;
    }
    if (allowlist.has(candidate.name.toLowerCase())) {
      return candidate;
    }

    const fallback = this._providers.find((provider) => {
      if (!(this._providerAvailability.get(provider.name) ?? false)) {
        return false;
      }
      const capabilityRecord = this.findCapabilityRecord(provider.name, capability);
      if (!capabilityRecord) {
        return false;
      }
      if (options?.localOnly && capabilityRecord.local !== true) {
        return false;
      }
      if (!allowlist.has(provider.name.toLowerCase())) {
        return false;
      }
      return true;
    });
    return fallback ?? null;
  }

  private findCapabilityRecord(
    providerName: string,
    capability: AiCapability,
  ): AiModelCapabilities | null {
    return (
      this._allCapabilities.find(
        (entry) => entry.provider === providerName && entry.capabilities.has(capability),
      ) ?? null
    );
  }

  private currentHourKey(): string {
    return new Date().toISOString().slice(0, 13);
  }

  private consumeQuota(context: AiGovernanceContext | undefined, units: number): boolean {
    const hourKey = this.currentHourKey();

    if (context?.actorId) {
      const userKey = `${hourKey}:user:${context.actorId}`;
      const current = this._usageByUserByHour.get(userKey) ?? 0;
      const next = current + units;
      if (next > appConfig.ai.quotaPerUserPerHour) {
        return false;
      }
      this._usageByUserByHour.set(userKey, next);
    }

    if (context?.projectId) {
      const projectKey = `${hourKey}:project:${context.projectId}`;
      const current = this._usageByProjectByHour.get(projectKey) ?? 0;
      const next = current + units;
      if (next > appConfig.ai.quotaPerProjectPerHour) {
        return false;
      }
      this._usageByProjectByHour.set(projectKey, next);
    }

    return true;
  }

  private toProvenance(
    provider: string,
    model: string,
    context: AiGovernanceContext | undefined,
  ): AiModelProvenance {
    const hasAllowlist = appConfig.ai.providerAllowlist.length > 0;
    const policyRouted = hasAllowlist || Boolean(context?.sensitiveContext);
    return {
      provider,
      model,
      policyRouted,
      policyReason: context?.sensitiveContext
        ? "sensitive-context-local-routing"
        : hasAllowlist
          ? "provider-allowlist"
          : undefined,
    };
  }

  private prefixProviderFailure<
    TResult extends { readonly ok: false; readonly error: string; readonly retryable: boolean },
  >(providerName: string, result: TResult): TResult {
    if (result.error.startsWith(`${providerName}: `)) {
      return result;
    }

    return {
      ...result,
      error: `${providerName}: ${result.error}`,
    };
  }

  /**
   * Ensures the initial capability detection completes once before AI routes use the registry.
   *
   * @returns Promise resolved when initial capability discovery completes.
   */
  private _ensureCapabilitiesReady(): Promise<void> {
    if (this._initialRefreshPromise) {
      return this._initialRefreshPromise;
    }

    this._initialRefreshPromise = this.refreshCapabilities();
    return this._initialRefreshPromise;
  }
}

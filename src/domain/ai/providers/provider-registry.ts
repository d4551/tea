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
import { OllamaProvider } from "./ollama-provider.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "./provider-types.ts";
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

    const providers: AiProvider[] = [new TransformersProvider(), new OllamaProvider()];

    const registry = new ProviderRegistry(providers);
    ProviderRegistry._instance = registry;
    await registry._ensureCapabilitiesReady().catch((error: unknown) => {
      logger.warn("registry.initial-refresh.failed", { error: String(error) });
    });
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
  selectProvider(capability: AiCapability): AiProvider | null {
    const preferred = appConfig.ai.preferredProvider;

    if (preferred !== "auto") {
      const match = this._providers.find(
        (p) => p.name === preferred && (this._providerAvailability.get(p.name) ?? false),
      );

      if (match) {
        const hasCapability = this._allCapabilities.some(
          (c) => c.provider === match.name && c.capabilities.has(capability),
        );
        if (hasCapability) {
          return match;
        }
      }
    }

    const priority = ["ollama", "transformers"];

    for (const name of priority) {
      const provider = this._providers.find((p) => p.name === name);
      if (!provider || !(this._providerAvailability.get(name) ?? false)) {
        continue;
      }

      const hasCapability = this._allCapabilities.some(
        (c) => c.provider === name && c.capabilities.has(capability),
      );

      if (hasCapability) {
        return provider;
      }
    }

    return null;
  }

  /**
   * High-level chat generation routing.
   *
   * @param params Chat parameters.
   * @returns Generation result from the best available provider.
   */
  async chat(params: AiChatParams): Promise<AiGenerationResult> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("chat");
    if (!provider) {
      return {
        ok: false,
        error: "No provider available for chat generation",
        retryable: true,
      };
    }

    logger.info("registry.chat.routing", { provider: provider.name });
    return provider.chat(params);
  }

  /**
   * High-level streaming chat generation routing.
   *
   * @param params Chat parameters.
   * @returns Async generator yielding token strings.
   */
  async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    await this._ensureCapabilitiesReady();
    const provider = this.selectProvider("chat");
    if (!provider) {
      return;
    }

    logger.info("registry.chatStream.routing", { provider: provider.name });
    yield* provider.chatStream(params);
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
    return provider.describeImage(image, prompt);
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
    return provider.transcribeAudio(params);
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
    return provider.synthesizeSpeech(params);
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
      const readiness = await provider.readiness().catch(() => "offline" as ProviderReadiness);
      const available = readiness !== "offline";
      this._providerAvailability.set(provider.name, available);
      this._providerReadiness.set(provider.name, readiness);
      this._providerReasons.set(provider.name, readiness === "degraded" ? "recovering" : "");

      if (available) {
        const caps = await provider.detectCapabilities().catch(() => []);
        allCapabilities.push(...caps);
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
    ProviderRegistry._instance = null;
    logger.info("registry.disposed");
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

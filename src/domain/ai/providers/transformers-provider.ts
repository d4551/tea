/**
 * Transformers.js AI Provider
 *
 * Adapter that wraps the existing ModelManager and MODEL_REGISTRY behind
 * the AiProvider interface. This allows the ProviderRegistry to treat
 * Transformers.js ONNX pipelines identically to Ollama or any future backend.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import { ModelManager } from "../model-manager.ts";
import { MODEL_REGISTRY, type ModelKey } from "../model-registry.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiModelCapabilities,
  AiProvider,
} from "./provider-types.ts";

const logger = createLogger("ai.provider.transformers");

/**
 * Maps MODEL_REGISTRY task strings to AiCapability values.
 *
 * @param task HuggingFace pipeline task string.
 * @returns Corresponding AiCapability.
 */
const taskToCapabilities = (task: string): ReadonlySet<AiCapability> => {
  switch (task) {
    case "text-classification":
      return new Set<AiCapability>(["text-classification"]);
    case "text-generation":
      return new Set<AiCapability>(["text-generation", "chat"]);
    default:
      return new Set<AiCapability>(["text-generation"]);
  }
};

/**
 * Adapter wrapping the existing singleton ModelManager as an AiProvider.
 */
export class TransformersProvider implements AiProvider {
  readonly name = "transformers";
  private _lastFailureAtMs = 0;

  /**
   * Transformers.js is always available since it runs locally via ONNX/WASM.
   *
   * @returns Always true.
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Transformers provider readiness is degraded only while repeatedly failing warmups.
   *
   * @returns Provider readiness.
   */
  async readiness(): Promise<"ready" | "degraded" | "offline"> {
    const modelManager = await ModelManager.getInstance();
    const warmState = modelManager.isReady;
    if (!warmState) {
      this._lastFailureAtMs = Date.now();
      return "degraded";
    }

    if (Date.now() - this._lastFailureAtMs < appConfig.ai.commandRetryBudgetMs) {
      return "ready";
    }

    return "ready";
  }

  /**
   * Builds capability descriptors from the static MODEL_REGISTRY.
   *
   * @returns Array of model capability descriptors.
   */
  async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    const capabilities: AiModelCapabilities[] = [];

    for (const [key, entry] of Object.entries(MODEL_REGISTRY)) {
      capabilities.push({
        provider: this.name,
        model: `${key}:${entry.model}`,
        capabilities: taskToCapabilities(entry.task),
        maxContextLength:
          "generationConfig" in entry ? (entry.generationConfig?.max_new_tokens ?? 512) : 512,
        supportsStreaming: false,
      });
    }

    return capabilities;
  }

  /**
   * Generates text using the oracle or npcDialogue pipeline.
   *
   * @param params Chat parameters; only the last user message is used as prompt.
   * @returns Generation result.
   */
  async chat(params: AiChatParams): Promise<AiGenerationResult> {
    const startMs = Date.now();
    const manager = await ModelManager.getInstance();

    const lastUserMessage = [...params.messages].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) {
      return {
        ok: false,
        error: "No user message provided",
        retryable: false,
      };
    }

    const pipelineKey: ModelKey = params.model === "npcDialogue" ? "npcDialogue" : "oracle";

    const result = await manager.generateOracle(lastUserMessage.content);

    if (result === null) {
      return {
        ok: false,
        error: "Transformers.js generation returned null",
        retryable: true,
      };
    }

    return {
      ok: true,
      text: result,
      model: MODEL_REGISTRY[pipelineKey].model,
      durationMs: Date.now() - startMs,
    };
  }

  /**
   * Transformers.js does not support streaming. Yields the full result at once.
   *
   * @param params Chat parameters.
   * @returns Async generator yielding the complete result as a single chunk.
   */
  async *chatStream(params: AiChatParams): AsyncGenerator<string> {
    const result = await this.chat(params);
    if (result.ok) {
      yield result.text;
    }
  }

  /**
   * Classifies text using the sentiment pipeline.
   *
   * @param text Input text.
   * @param _model Model override (unused — always uses sentiment registry entry).
   * @returns Classification result or null on failure.
   */
  async classify(text: string, _model?: string): Promise<AiClassificationResult | null> {
    const manager = await ModelManager.getInstance();
    const result = await manager.analyzeSentiment(text);

    if (!result) {
      return null;
    }

    return {
      ok: true,
      label: result.label,
      score: result.score,
      model: MODEL_REGISTRY.sentiment.model,
    };
  }

  /**
   * Vision is not supported by the current ONNX pipeline configuration.
   *
   * @param _image Image bytes (unused).
   * @param _prompt Prompt (unused).
   * @returns Failure result.
   */
  async describeImage(_image: Uint8Array, _prompt: string): Promise<AiGenerationResult> {
    return {
      ok: false,
      error: "Vision not supported by Transformers.js provider",
      retryable: false,
    };
  }

  /**
   * Embedding generation is not configured in the current ONNX registry.
   *
   * @param _text Input text (unused).
   * @returns Always null.
   */
  async generateEmbedding(_text: string): Promise<Float32Array | null> {
    return null;
  }

  /**
   * Disposes the underlying ModelManager singleton.
   */
  async dispose(): Promise<void> {
    const manager = ModelManager.peekInstance();
    if (manager) {
      await manager.dispose();
    }
    logger.info("transformers.provider.disposed");
  }
}

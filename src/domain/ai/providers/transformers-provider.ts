/**
 * Transformers.js AI Provider
 *
 * Adapter that wraps the existing ModelManager and MODEL_REGISTRY behind
 * the AiProvider interface. This allows the ProviderRegistry to treat
 * Transformers.js ONNX pipelines identically to Ollama or any future backend.
 */

import { appConfig } from "../../../config/environment.ts";
import { createLogger } from "../../../lib/logger.ts";
import type { LocalModelRuntime } from "../local-model-runtime.ts";
import { ModelManager } from "../model-manager.ts";
import { MODEL_REGISTRY, type ModelKey } from "../model-registry.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiImageGenerationParams,
  AiImageGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
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
    case "feature-extraction":
      return new Set<AiCapability>(["embeddings"]);
    case "automatic-speech-recognition":
      return new Set<AiCapability>(["speech-to-text"]);
    case "text-to-speech":
      return new Set<AiCapability>(["text-to-speech"]);
    case "text-to-image":
      return new Set<AiCapability>(["image-generation"]);
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
   * Creates a Transformers.js provider.
   *
   * @param resolveManager Async resolver for the local model runtime facade.
   */
  constructor(
    private readonly resolveManager: () => Promise<LocalModelRuntime> = () =>
      ModelManager.getInstance(),
  ) {}

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
    const modelManager = await this.resolveManager();
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
      if (!entry.enabled) {
        continue;
      }

      capabilities.push({
        key,
        provider: this.name,
        model: entry.model,
        capabilities: taskToCapabilities(entry.task),
        maxContextLength: entry.maxContextLength,
        supportsStreaming: false,
        runtime: `onnx-${appConfig.ai.onnxDevice}`,
        integration: "huggingface",
        local: true,
        configurable: true,
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
    const manager = await this.resolveManager();

    const lastUserMessage = [...params.messages].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) {
      return {
        ok: false,
        error: "No user message provided",
        retryable: false,
      };
    }

    const pipelineKey: ModelKey = params.model === "npcDialogue" ? "npcDialogue" : "oracle";
    const prompt =
      pipelineKey === "npcDialogue"
        ? [params.systemPrompt ?? "", lastUserMessage.content]
            .filter((part) => part.length > 0)
            .join("\n\n")
        : lastUserMessage.content;
    const result =
      pipelineKey === "npcDialogue"
        ? await manager.generateTextResult("npcDialogue", prompt)
        : await manager.generateTextResult("oracle", prompt, prompt);

    if (!result.ok) {
      return {
        ok: false,
        error: result.failure.message,
        retryable: result.failure.retryable,
      };
    }

    return {
      ok: true,
      text: result.value.text,
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
    const manager = await this.resolveManager();
    const result = await manager.analyzeSentimentResult(text);

    if (!result.ok) {
      return null;
    }

    return {
      ok: true,
      label: result.value.label,
      score: result.value.score,
      model: MODEL_REGISTRY.sentiment.model,
    };
  }

  /**
   * Transcribes mono PCM audio with the configured local speech model.
   *
   * @param params Audio transcription parameters.
   * @returns Local transcription result.
   */
  async transcribeAudio(params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    if (!appConfig.ai.localSpeechToTextEnabled) {
      return {
        ok: false,
        error: "Local speech recognition is disabled.",
        retryable: false,
      };
    }

    const startMs = Date.now();
    const manager = await this.resolveManager();
    const result = await manager.transcribeAudioResult(params.audio);

    if (!result.ok) {
      return {
        ok: false,
        error: result.failure.message,
        retryable: result.failure.retryable,
      };
    }

    return {
      ok: true,
      text: result.value.text,
      model: params.model ?? MODEL_REGISTRY.speechToText.model,
      durationMs: Date.now() - startMs,
    };
  }

  /**
   * Synthesizes speech audio using the configured local TTS model.
   *
   * @param params Speech synthesis parameters.
   * @returns Local speech synthesis result.
   */
  async synthesizeSpeech(params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult> {
    if (!appConfig.ai.localTextToSpeechEnabled) {
      return {
        ok: false,
        error: "Local speech synthesis is disabled.",
        retryable: false,
      };
    }

    const startMs = Date.now();
    const manager = await this.resolveManager();
    const result = await manager.synthesizeSpeechResult(params.text);

    if (!result.ok) {
      return {
        ok: false,
        error: result.failure.message,
        retryable: result.failure.retryable,
      };
    }

    return {
      ok: true,
      audio: result.value.audio,
      sampleRate: result.value.sampleRate,
      model: params.model ?? MODEL_REGISTRY.textToSpeech.model,
      durationMs: Date.now() - startMs,
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
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    if (!appConfig.ai.localEmbeddingsEnabled) {
      return null;
    }

    const manager = await this.resolveManager();
    const result = await manager.generateEmbeddingResult(text);
    return result.ok ? result.value.embedding : null;
  }

  /**
   * Generates an image using local ONNX pipelines.
   *
   * @param params Image generation parameters.
   * @returns Local image-generation result.
   */
  async generateImage(params: AiImageGenerationParams): Promise<AiImageGenerationResult> {
    const startMs = Date.now();

    if (
      !appConfig.ai.localImageGenerationEnabled ||
      !appConfig.ai.localImageGenerationModel.trim()
    ) {
      return {
        ok: false,
        error: "Local image generation is disabled.",
        retryable: false,
      };
    }

    const manager = await this.resolveManager();
    const result = await manager.generateImageResult(params.prompt, params.aspectRatio);
    if (!result.ok) {
      return {
        ok: false,
        error: result.failure.message,
        retryable: result.failure.retryable,
      };
    }

    return {
      ok: true,
      image: result.value.image,
      mimeType: result.value.mimeType,
      model: MODEL_REGISTRY.imageGeneration.model,
      durationMs: Date.now() - startMs,
    };
  }

  /**
   * Disposes the underlying ModelManager singleton.
   */
  async dispose(): Promise<void> {
    const manager = await this.resolveManager();
    await manager.dispose();
    logger.info("transformers.provider.disposed");
  }
}

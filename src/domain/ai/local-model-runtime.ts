import type {
  LocalEmbeddingOperationResult,
  LocalSentimentOperationResult,
  LocalImageGenerationOperationResult,
  LocalSpeechSynthesisOperationResult,
  LocalTextGenerationOperationResult,
  LocalTranscriptionOperationResult,
} from "./local-model-contract.ts";
import type { ModelKey } from "./model-registry.ts";

/**
 * Shared local-model runtime facade consumed by provider adapters.
 */
export interface LocalModelRuntime {
  /** Whether the runtime completed warmup successfully at least once. */
  readonly isReady: boolean;

  /**
   * Runs local sentiment classification.
   *
   * @param text Input text.
   * @returns Typed sentiment result.
   */
  analyzeSentimentResult(text: string): Promise<LocalSentimentOperationResult>;

  /**
   * Generates an oracle response for compatibility call sites that still expect nullable text.
   *
   * @param question User prompt.
   * @returns Generated text or null on failure.
   */
  generateOracle(question: string): Promise<string | null>;

  /**
   * Runs local text generation for one configured text pipeline.
   *
   * @param modelKey Target text-generation registry key.
   * @param prompt Prompt text.
   * @param stripPrefix Optional prefix to trim from the generated output.
   * @returns Typed text-generation result.
   */
  generateTextResult(
    modelKey: Extract<ModelKey, "oracle" | "npcDialogue">,
    prompt: string,
    stripPrefix?: string,
  ): Promise<LocalTextGenerationOperationResult>;

  /**
   * Runs local speech recognition.
   *
   * @param audio Mono PCM audio.
   * @returns Typed transcription result.
   */
  transcribeAudioResult(audio: Float32Array): Promise<LocalTranscriptionOperationResult>;

  /**
   * Runs local speech synthesis.
   *
   * @param text Input text.
   * @returns Typed speech-synthesis result.
   */
  synthesizeSpeechResult(text: string): Promise<LocalSpeechSynthesisOperationResult>;

  /**
   * Runs local embedding generation.
   *
   * @param text Input text.
   * @returns Typed embedding result.
   */
  generateEmbeddingResult(text: string): Promise<LocalEmbeddingOperationResult>;

  /**
   * Runs local image generation.
   *
   * @param prompt Image generation prompt.
   * @param aspectRatio Optional output aspect-ratio hint.
   * @returns Typed image-generation result.
   */
  generateImageResult(
    prompt: string,
    aspectRatio?: "square" | "landscape" | "portrait",
  ): Promise<LocalImageGenerationOperationResult>;

  /**
   * Releases JS ownership of runtime resources.
   */
  dispose(): Promise<void>;
}

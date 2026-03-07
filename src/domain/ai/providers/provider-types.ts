/**
 * AI Provider Abstraction Types
 *
 * Defines the contracts for multi-provider local AI integration.
 * All providers (Ollama, Transformers.js, future backends) implement
 * the AiProvider interface so the game engine can route requests
 * to the best available backend.
 */

/**
 * Capabilities a provider/model might support.
 */
export type AiCapability =
  | "text-generation"
  | "text-classification"
  | "chat"
  | "vision"
  | "image-generation"
  | "embeddings"
  | "tool-calling"
  | "structured-planning"
  | "job-execution"
  | "speech-to-text"
  | "text-to-speech";

/**
 * Describes the capabilities of a specific model on a specific provider.
 */
export interface AiModelCapabilities {
  /** Stable model key when backed by a known local registry entry. */
  readonly key?: string;
  /** Provider name (e.g. "ollama", "transformers"). */
  readonly provider: string;
  /** Model identifier. */
  readonly model: string;
  /** Set of capabilities this model supports. */
  readonly capabilities: ReadonlySet<AiCapability>;
  /** Maximum context window in tokens (0 if unknown). */
  readonly maxContextLength: number;
  /** Whether the model supports streaming responses. */
  readonly supportsStreaming: boolean;
  /** Runtime backend used to execute the model. */
  readonly runtime: "onnx-wasm" | "ollama-http" | "openai-http";
  /** Model integration source. */
  readonly integration: "huggingface" | "ollama" | "openai-compatible";
  /** Whether the model is executed locally on this machine. */
  readonly local: boolean;
  /** Whether the target can be replaced through configuration. */
  readonly configurable: boolean;
}

/**
 * Parameters for chat-style generation requests.
 */
export interface AiChatParams {
  /** Conversation messages. */
  readonly messages: readonly AiChatMessage[];
  /** Optional model override (otherwise provider default). */
  readonly model?: string;
  /** System prompt prepended to the conversation. */
  readonly systemPrompt?: string;
  /** Maximum tokens to generate. */
  readonly maxTokens?: number;
  /** Sampling temperature (0.0–2.0). */
  readonly temperature?: number;
  /** Whether to stream the response. */
  readonly stream?: boolean;
}

/**
 * A single message in a chat conversation.
 */
export interface AiChatMessage {
  /** Role of the message author. */
  readonly role: "system" | "user" | "assistant";
  /** Text content. */
  readonly content: string;
  /** Optional base64-encoded images (for vision models). */
  readonly images?: readonly string[];
}

/**
 * Successful text generation result.
 */
export interface AiGenerationSuccess {
  readonly ok: true;
  /** Generated text. */
  readonly text: string;
  /** Model that produced the result. */
  readonly model: string;
  /** Generation duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Failed text generation result.
 */
export interface AiGenerationFailure {
  readonly ok: false;
  /** Error description. */
  readonly error: string;
  /** Whether the caller should retry. */
  readonly retryable: boolean;
}

/**
 * Discriminated union for generation results.
 */
export type AiGenerationResult = AiGenerationSuccess | AiGenerationFailure;

/**
 * Parameters for speech recognition requests.
 */
export interface AiTranscriptionParams {
  /** Mono PCM samples normalized to -1..1. */
  readonly audio: Float32Array;
  /** PCM sample rate in Hz. */
  readonly sampleRate: number;
  /** Optional language hint for the recognizer. */
  readonly language?: string;
  /** Optional prompt/context hint. */
  readonly prompt?: string;
  /** Optional model override. */
  readonly model?: string;
}

/**
 * Successful speech transcription result.
 */
export interface AiTranscriptionSuccess {
  readonly ok: true;
  /** Recognized text output. */
  readonly text: string;
  /** Model that produced the output. */
  readonly model: string;
  /** Total recognition duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Failed speech transcription result.
 */
export interface AiTranscriptionFailure {
  readonly ok: false;
  /** Error description. */
  readonly error: string;
  /** Whether the caller should retry. */
  readonly retryable: boolean;
}

/**
 * Discriminated union for speech transcription requests.
 */
export type AiTranscriptionResult = AiTranscriptionSuccess | AiTranscriptionFailure;

/**
 * Parameters for local text-to-speech synthesis.
 */
export interface AiSpeechSynthesisParams {
  /** Input text to synthesize. */
  readonly text: string;
  /** Optional model override. */
  readonly model?: string;
  /** Optional voice or speaker hint. */
  readonly voice?: string;
}

/**
 * Successful speech synthesis result.
 */
export interface AiSpeechSynthesisSuccess {
  readonly ok: true;
  /** Generated mono PCM samples. */
  readonly audio: Float32Array;
  /** Audio sample rate in Hz. */
  readonly sampleRate: number;
  /** Model that produced the output. */
  readonly model: string;
  /** Synthesis duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Failed speech synthesis result.
 */
export interface AiSpeechSynthesisFailure {
  readonly ok: false;
  /** Error description. */
  readonly error: string;
  /** Whether the caller should retry. */
  readonly retryable: boolean;
}

/**
 * Discriminated union for speech synthesis requests.
 */
export type AiSpeechSynthesisResult = AiSpeechSynthesisSuccess | AiSpeechSynthesisFailure;

/**
 * Parameters for image-generation requests.
 */
export interface AiImageGenerationParams {
  /** Human-authored generation prompt. */
  readonly prompt: string;
  /** Optional target aspect ratio label. */
  readonly aspectRatio?: "square" | "landscape" | "portrait";
  /** Optional project-scoped target identifier. */
  readonly targetId?: string;
  /** Optional model override. */
  readonly model?: string;
}

/**
 * Successful image-generation result.
 */
export interface AiImageGenerationSuccess {
  readonly ok: true;
  /** Raw image bytes returned by the provider. */
  readonly image: Uint8Array;
  /** MIME type of the generated image. */
  readonly mimeType: string;
  /** Model that produced the output. */
  readonly model: string;
  /** Generation duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Failed image-generation result.
 */
export interface AiImageGenerationFailure {
  readonly ok: false;
  /** Error description. */
  readonly error: string;
  /** Whether the caller should retry. */
  readonly retryable: boolean;
}

/**
 * Discriminated union for image-generation requests.
 */
export type AiImageGenerationResult = AiImageGenerationSuccess | AiImageGenerationFailure;

/**
 * Parameters for structured tool planning requests.
 */
export interface AiToolPlanParams {
  /** User goal to plan against. */
  readonly goal: string;
  /** Optional project id for scoping builder actions. */
  readonly projectId?: string;
  /** Optional model override. */
  readonly model?: string;
}

/**
 * Structured implementation or automation step generated by an AI planner.
 */
export interface AiToolPlanStep {
  /** Stable step identifier within the generated plan. */
  readonly id: string;
  /** Short human-readable title for the step. */
  readonly title: string;
  /** Optional action family for UI grouping. */
  readonly kind?: "analysis" | "builder" | "automation" | "review";
  /** Optional rationale or execution note. */
  readonly detail?: string;
}

/**
 * Successful structured tool planning result.
 */
export interface AiToolPlanSuccess {
  readonly ok: true;
  /** Ordered structured plan steps. */
  readonly steps: readonly AiToolPlanStep[];
  /** Model that produced the plan. */
  readonly model: string;
  /** Planning duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Failed structured tool planning result.
 */
export interface AiToolPlanFailure {
  readonly ok: false;
  /** Error description. */
  readonly error: string;
  /** Whether the caller should retry. */
  readonly retryable: boolean;
}

/**
 * Discriminated union for structured tool planning requests.
 */
export type AiToolPlanResult = AiToolPlanSuccess | AiToolPlanFailure;

/**
 * Sentiment classification result.
 */
export interface AiClassificationResult {
  readonly ok: true;
  readonly label: string;
  readonly score: number;
  readonly model: string;
}

/**
 * Provider interface that all AI backends must implement.
 */
export interface AiProvider {
  /** Unique provider name. */
  readonly name: string;

  /**
   * Checks whether this provider is reachable and operational.
   *
   * @returns True when the provider can accept requests.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Returns provider readiness for diagnostics and routing decisions.
   * - `ready`: provider is healthy
   * - `degraded`: provider has errors but can still be used
   * - `offline`: provider cannot currently process requests
   *
   * @returns Readiness state.
   */
  readiness(): Promise<"ready" | "degraded" | "offline">;

  /**
   * Discovers all models and their capabilities.
   *
   * @returns Array of model capability descriptors.
   */
  detectCapabilities(): Promise<readonly AiModelCapabilities[]>;

  /**
   * Generates a chat completion (non-streaming).
   *
   * @param params Chat parameters.
   * @returns Generation result.
   */
  chat(params: AiChatParams): Promise<AiGenerationResult>;

  /**
   * Generates a chat completion as a streaming token iterator.
   *
   * @param params Chat parameters.
   * @returns Async generator yielding token strings.
   */
  chatStream(params: AiChatParams): AsyncGenerator<string>;

  /**
   * Classifies text (e.g. sentiment analysis).
   *
   * @param text Input text.
   * @param model Optional model override.
   * @returns Classification result or null on failure.
   */
  classify(text: string, model?: string): Promise<AiClassificationResult | null>;

  /**
   * Transcribes speech audio into text.
   *
   * @param params Audio transcription parameters.
   * @returns Transcription result.
   */
  transcribeAudio(params: AiTranscriptionParams): Promise<AiTranscriptionResult>;

  /**
   * Synthesizes speech audio from text.
   *
   * @param params Speech synthesis parameters.
   * @returns Speech synthesis result.
   */
  synthesizeSpeech(params: AiSpeechSynthesisParams): Promise<AiSpeechSynthesisResult>;

  /**
   * Describes or analyses an image using a vision model.
   *
   * @param image Raw image bytes.
   * @param prompt Instruction for the vision model.
   * @returns Generation result.
   */
  describeImage(image: Uint8Array, prompt: string): Promise<AiGenerationResult>;

  /**
   * Generates an image artifact when the provider supports multimodal generation.
   *
   * @param params Image generation parameters.
   * @returns Image generation result.
   */
  generateImage?(params: AiImageGenerationParams): Promise<AiImageGenerationResult>;

  /**
   * Generates a text embedding vector.
   *
   * @param text Input text.
   * @returns Float32 embedding vector, or null on failure.
   */
  generateEmbedding(text: string): Promise<Float32Array | null>;

  /**
   * Produces a structured tool or automation plan for approval-gated workers.
   *
   * @param params Planning parameters.
   * @returns Structured plan result.
   */
  planTools?(params: AiToolPlanParams): Promise<AiToolPlanResult>;

  /**
   * Releases provider resources.
   */
  dispose(): Promise<void>;
}

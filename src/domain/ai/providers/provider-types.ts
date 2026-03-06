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
  | "embeddings"
  | "tool-calling";

/**
 * Describes the capabilities of a specific model on a specific provider.
 */
export interface AiModelCapabilities {
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
   * Describes or analyses an image using a vision model.
   *
   * @param image Raw image bytes.
   * @param prompt Instruction for the vision model.
   * @returns Generation result.
   */
  describeImage(image: Uint8Array, prompt: string): Promise<AiGenerationResult>;

  /**
   * Generates a text embedding vector.
   *
   * @param text Input text.
   * @returns Float32 embedding vector, or null on failure.
   */
  generateEmbedding(text: string): Promise<Float32Array | null>;

  /**
   * Releases provider resources.
   */
  dispose(): Promise<void>;
}

import type { ModelKey } from "./model-registry.ts";

/**
 * Stable failure codes for local-model runtime operations.
 */
export type LocalModelFailureCode =
  | "timeout"
  | "circuit-open"
  | "cache-corruption-recovered"
  | "unavailable"
  | "invalid-output"
  | "unexpected";

/**
 * Typed failure payload for local-model runtime operations.
 */
export interface LocalModelFailure {
  /** Stable machine-readable failure code. */
  readonly code: LocalModelFailureCode;
  /** Human-readable diagnostic message. */
  readonly message: string;
  /** Whether the operation is safe to retry. */
  readonly retryable: boolean;
  /** Logical operation name for logging and tests. */
  readonly operation: string;
  /** Optional model key associated with the failure. */
  readonly modelKey?: ModelKey;
}

/**
 * Successful local-model runtime result.
 *
 * @template TValue Success payload type.
 */
export interface LocalModelSuccessResult<TValue> {
  /** Indicates the operation completed successfully. */
  readonly ok: true;
  /** Successful payload value. */
  readonly value: TValue;
}

/**
 * Failed local-model runtime result.
 */
export interface LocalModelFailureResult {
  /** Indicates the operation failed. */
  readonly ok: false;
  /** Structured failure payload. */
  readonly failure: LocalModelFailure;
}

/**
 * Typed result contract for local-model runtime operations.
 *
 * @template TValue Success payload type.
 */
export type LocalModelResult<TValue> = LocalModelSuccessResult<TValue> | LocalModelFailureResult;

/**
 * Sentiment inference output contract.
 */
export interface SentimentResult {
  /** Model label. */
  readonly label: "POSITIVE" | "NEGATIVE";
  /** Confidence score from the model. */
  readonly score: number;
}

/**
 * Normalized text-generation output.
 */
export interface LocalTextGenerationOutput {
  /** Generated text result. */
  readonly text: string;
}

/**
 * Normalized embedding-generation output.
 */
export interface LocalEmbeddingOutput {
  /** Dense embedding vector. */
  readonly embedding: Float32Array;
}

/**
 * Normalized transcription output.
 */
export interface LocalTranscriptionOutput {
  /** Recognized text. */
  readonly text: string;
}

/**
 * Normalized speech-synthesis output.
 */
export interface LocalSpeechSynthesisOutput {
  /** Mono PCM audio buffer. */
  readonly audio: Float32Array;
  /** Audio sample rate in Hz. */
  readonly sampleRate: number;
}

/**
 * Normalized image-generation output.
 */
export interface LocalImageGenerationOutput {
  /** Generated image bytes (typically PNG/JPEG payload). */
  readonly image: Uint8Array;
  /** MIME type for generated image bytes. */
  readonly mimeType: string;
}

/**
 * Typed sentiment operation result.
 */
export type LocalSentimentOperationResult = LocalModelResult<SentimentResult>;

/**
 * Typed text-generation operation result.
 */
export type LocalTextGenerationOperationResult = LocalModelResult<LocalTextGenerationOutput>;

/**
 * Typed embedding operation result.
 */
export type LocalEmbeddingOperationResult = LocalModelResult<LocalEmbeddingOutput>;

/**
 * Typed transcription operation result.
 */
export type LocalTranscriptionOperationResult = LocalModelResult<LocalTranscriptionOutput>;

/**
 * Typed speech-synthesis operation result.
 */
export type LocalSpeechSynthesisOperationResult = LocalModelResult<LocalSpeechSynthesisOutput>;

/**
 * Typed image-generation operation result.
 */
export type LocalImageGenerationOperationResult = LocalModelResult<LocalImageGenerationOutput>;

/**
 * Creates a successful local-model runtime result.
 *
 * @template TValue Success payload type.
 * @param value Successful payload.
 * @returns Successful result envelope.
 */
export const localModelSuccess = <TValue>(value: TValue): LocalModelSuccessResult<TValue> => ({
  ok: true,
  value,
});

/**
 * Creates a failed local-model runtime result.
 *
 * @template TValue Result payload type for call-site compatibility.
 * @param failure Structured failure payload.
 * @returns Failed result envelope.
 */
export const localModelFailure = <TValue = never>(
  failure: LocalModelFailure,
): LocalModelResult<TValue> => ({
  ok: false,
  failure,
});

/**
 * Unwraps a local-model runtime result into a nullable payload.
 *
 * @template TValue Success payload type.
 * @param result Result envelope.
 * @returns Payload value or null on failure.
 */
export const unwrapLocalModelResult = <TValue>(result: LocalModelResult<TValue>): TValue | null =>
  result.ok ? result.value : null;

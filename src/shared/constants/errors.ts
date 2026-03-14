/**
 * Canonical error messages for runtime assertions and validation.
 * Single source of truth for developer-facing error strings.
 */

/** Thrown when PixiJS renderer does not expose an HTML canvas element. */
export const PIXI_CANVAS_MISSING_ERROR = "Pixi renderer did not expose a canvas element.";

/** Thrown when knowledge document ingestion receives empty text. */
export const KNOWLEDGE_DOCUMENT_EMPTY_ERROR = "Knowledge document text must not be empty.";

/** Thrown when knowledge document produces no indexable chunks. */
export const KNOWLEDGE_DOCUMENT_NO_CHUNKS_ERROR =
  "Knowledge document produced no indexable chunks.";

/** Speech-to-text model returned an invalid payload. */
export const MODEL_STT_INVALID_PAYLOAD_ERROR = "Speech-to-text model returned an invalid payload.";

/** Speech-to-text model returned empty text. */
export const MODEL_STT_EMPTY_TEXT_ERROR = "Speech-to-text model returned empty text.";

/**
 * LOTFK Model Registry — typed catalogue of local ONNX model configurations.
 *
 * Add entries here to make a model available to ModelManager.
 * All models use quantized (q8) ONNX weights for Bun/Node speed without GPU.
 */

export interface ModelEntry {
  /** HuggingFace task type passed to pipeline(). */
  readonly task: string;
  /** HuggingFace model ID (downloaded to local cache on first use). */
  readonly model: string;
  /** ONNX dtype. "q8" = int8 quantized; "fp32" = full precision. */
  readonly dtype: "q8" | "fp16" | "fp32";
  /** Optional generation parameters for text-generation tasks. */
  readonly generationConfig?: {
    readonly max_new_tokens?: number;
    readonly temperature?: number;
    readonly do_sample?: boolean;
  };
}

export const MODEL_REGISTRY = {
  /**
   * Sentiment analysis for Oracle interactions.
   * Xenova/distilbert-base-uncased-finetuned-sst-2-english ships both
   * "quantized" (q8) and "fp32" ONNX variants. Using q8 for Bun speed.
   */
  sentiment: {
    task: "text-classification",
    model: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    dtype: "fp32", // q8 variant is corrupted in Xenova's distribution; fp32 is stable
  },

  /**
   * Oracle text generation — produces fortune-cookie style responses.
   * Note: Xenova/gpt2 does NOT publish a q8 ONNX weight; use fp32.
   */
  oracle: {
    task: "text-generation",
    model: "Xenova/gpt2",
    dtype: "fp32",
    generationConfig: {
      max_new_tokens: 80,
      temperature: 0.85,
      do_sample: true,
    },
  },

  /**
   * NPC dialogue generation for AI-powered NPCs (Phase 4).
   * Reserved — not loaded at boot; loaded on first use.
   */
  npcDialogue: {
    task: "text-generation",
    model: "Xenova/gpt2",
    dtype: "fp32",
    generationConfig: {
      max_new_tokens: 60,
      temperature: 0.7,
      do_sample: true,
    },
  },
} as const satisfies Record<string, ModelEntry>;

export type ModelKey = keyof typeof MODEL_REGISTRY;

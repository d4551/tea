import { appConfig } from "../../config/environment.ts";
import type { AiCapability } from "./providers/provider-types.ts";

/**
 * Supported local Transformers.js pipeline task identifiers.
 */
export type LocalModelTask =
  | "text-classification"
  | "text-generation"
  | "feature-extraction"
  | "automatic-speech-recognition"
  | "text-to-speech";

/**
 * Local ONNX model configuration entry.
 */
export interface ModelEntry {
  /** Stable registry key. */
  readonly key: string;
  /** Human-readable label for diagnostics and UI. */
  readonly label: string;
  /** Short description for docs and builder surfaces. */
  readonly description: string;
  /** Hugging Face pipeline task. */
  readonly task: LocalModelTask;
  /** Model identifier resolved by Transformers.js. */
  readonly model: string;
  /** ONNX dtype preference. */
  readonly dtype: "q8" | "fp16" | "fp32";
  /** Capability flags exposed by the provider layer. */
  readonly capabilities: readonly AiCapability[];
  /** Environment variable used to override the default target. */
  readonly configKey: string;
  /** Whether the model is enabled in the current environment. */
  readonly enabled: boolean;
  /** Whether the model should be considered for warmup. */
  readonly warmup: boolean;
  /** Maximum expected context or output window. */
  readonly maxContextLength: number;
  /** Optional generation parameters for text-generation tasks. */
  readonly generationConfig?: {
    readonly max_new_tokens?: number;
    readonly temperature?: number;
    readonly do_sample?: boolean;
  };
}

/**
 * Builder- and API-facing snapshot of a configured local model target.
 */
export interface LocalModelCatalogEntry {
  /** Stable registry key. */
  readonly key: string;
  /** Human-readable label. */
  readonly label: string;
  /** Short model description. */
  readonly description: string;
  /** Local pipeline task. */
  readonly task: LocalModelTask;
  /** Configured model identifier. */
  readonly model: string;
  /** Capability list for docs and routing visibility. */
  readonly capabilities: readonly AiCapability[];
  /** ONNX runtime backend used by the app. */
  readonly runtime: "onnx-wasm";
  /** Upstream integration provider. */
  readonly integration: "huggingface";
  /** Environment variable used to override the model. */
  readonly configKey: string;
  /** Whether the target is active in this environment. */
  readonly enabled: boolean;
}

/**
 * Typed catalogue of local Hugging Face / ONNX model targets.
 */
export const MODEL_REGISTRY = {
  sentiment: {
    key: "sentiment",
    label: "Sentiment classifier",
    description: "Local ONNX sentiment classification for tone checks and fallbacks.",
    task: "text-classification",
    model: appConfig.ai.localSentimentModel,
    dtype: "fp32",
    capabilities: ["text-classification"],
    configKey: "AI_LOCAL_SENTIMENT_MODEL",
    enabled: true,
    warmup: true,
    maxContextLength: 512,
  },
  oracle: {
    key: "oracle",
    label: "Oracle text generator",
    description: "Lightweight local text generation fallback for SSR-friendly oracle copy.",
    task: "text-generation",
    model: appConfig.ai.localTextGenerationModel,
    dtype: "fp32",
    capabilities: ["text-generation", "chat"],
    configKey: "AI_LOCAL_TEXT_GENERATION_MODEL",
    enabled: true,
    warmup: false,
    maxContextLength: 160,
    generationConfig: {
      max_new_tokens: 80,
      temperature: 0.85,
      do_sample: true,
    },
  },
  npcDialogue: {
    key: "npcDialogue",
    label: "NPC dialogue generator",
    description:
      "Local dialogue generation target for low-latency scene authoring and fallback NPC chat.",
    task: "text-generation",
    model: appConfig.ai.localNpcDialogueModel,
    dtype: "fp32",
    capabilities: ["text-generation", "chat"],
    configKey: "AI_LOCAL_NPC_DIALOGUE_MODEL",
    enabled: true,
    warmup: false,
    maxContextLength: 160,
    generationConfig: {
      max_new_tokens: 60,
      temperature: 0.7,
      do_sample: true,
    },
  },
  embeddings: {
    key: "embeddings",
    label: "Text embeddings",
    description: "Local feature extraction for search, similarity, and future retrieval tooling.",
    task: "feature-extraction",
    model: appConfig.ai.localEmbeddingModel,
    dtype: "fp32",
    capabilities: ["embeddings"],
    configKey: "AI_LOCAL_EMBEDDING_MODEL",
    enabled: appConfig.ai.localEmbeddingsEnabled,
    warmup: false,
    maxContextLength: 384,
  },
  speechToText: {
    key: "speechToText",
    label: "Speech to text",
    description:
      "Local automatic speech recognition through Transformers.js and ONNX Whisper models.",
    task: "automatic-speech-recognition",
    model: appConfig.ai.localSpeechToTextModel,
    dtype: "fp32",
    capabilities: ["speech-to-text"],
    configKey: "AI_LOCAL_SPEECH_TO_TEXT_MODEL",
    enabled: appConfig.ai.localSpeechToTextEnabled,
    warmup: false,
    maxContextLength: 30,
  },
  textToSpeech: {
    key: "textToSpeech",
    label: "Text to speech",
    description: "Local speech synthesis for narrated previews and audio design validation.",
    task: "text-to-speech",
    model: appConfig.ai.localTextToSpeechModel,
    dtype: "fp32",
    capabilities: ["text-to-speech"],
    configKey: "AI_LOCAL_TEXT_TO_SPEECH_MODEL",
    enabled: appConfig.ai.localTextToSpeechEnabled,
    warmup: false,
    maxContextLength: 600,
  },
} as const satisfies Record<string, ModelEntry>;

/**
 * Registry key union derived from {@link MODEL_REGISTRY}.
 */
export type ModelKey = keyof typeof MODEL_REGISTRY;

/**
 * Returns a catalog of local model targets for docs and builder UX.
 *
 * @returns Builder-friendly local model catalog.
 */
export const getLocalModelCatalog = (): readonly LocalModelCatalogEntry[] =>
  Object.values(MODEL_REGISTRY).map((entry) => ({
    key: entry.key,
    label: entry.label,
    description: entry.description,
    task: entry.task,
    model: entry.model,
    capabilities: entry.capabilities,
    runtime: "onnx-wasm",
    integration: "huggingface",
    configKey: entry.configKey,
    enabled: entry.enabled,
  }));

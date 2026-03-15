import {
  appConfig,
  parseBoolean,
  parseFloatValue,
  parseInteger,
} from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { ModelManager } from "./model-manager.ts";
import { synchronizeModelRegistry } from "./model-registry.ts";
import { ProviderRegistry } from "./providers/provider-registry.ts";
import { prismaBase } from "../../shared/services/db.ts";

const logger = createLogger("ai.runtime-settings");

type SettingPrimitive = string | number | boolean;
type SettingValueType = "string" | "integer" | "float" | "boolean";
type SettingSource = "override" | "env" | "default";
type SettingGetter = () => SettingPrimitive;
type SettingSetter = (value: SettingPrimitive) => void;

/**
 * Persisted AI runtime setting value.
 */
export interface AiRuntimeSettingValue {
  /** Stable setting key used by persistence and APIs. */
  readonly key: string;
  /** Primitive runtime value after parsing. */
  readonly value: SettingPrimitive;
  /** Scalar value type used for validation and serialization. */
  readonly valueType: SettingValueType;
  /** Effective value origin. */
  readonly source: SettingSource;
  /** Whether the setting is editable through the settings UI. */
  readonly editable: boolean;
  /** Provider or subsystem lane shown in the UI. */
  readonly providerLane: string;
  /** Slot or field identifier shown in the UI. */
  readonly slot: string;
  /** Human-readable field label for diagnostics and UI. */
  readonly label: string;
}

/**
 * Settings update payload accepted by the runtime settings service.
 */
export interface AiRuntimeSettingMutation {
  /** Setting key to update or reset. */
  readonly key: string;
  /** Serialized value written when `reset` is false. */
  readonly value?: string | number | boolean;
  /** Deletes any persisted override and falls back to env/default when true. */
  readonly reset?: boolean;
}

interface SettingDescriptor {
  readonly key: string;
  readonly valueType: SettingValueType;
  readonly providerLane: string;
  readonly slot: string;
  readonly label: string;
  readonly editable: boolean;
  readonly envKey: string;
  readonly allowEmpty?: boolean;
  readonly parse: (value: string | number | boolean) => SettingPrimitive;
  readonly getBaseValue: SettingGetter;
  readonly getCurrentValue: SettingGetter;
  readonly setCurrentValue: SettingSetter;
}
<<<<<<< Current (Your changes)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type MutableAiConfig = Mutable<typeof appConfig.ai>;
type MutableOpenAiCompatibleConfig = Mutable<typeof appConfig.ai.openAiCompatible.local>;
type MutableHfInferenceConfig = Mutable<typeof appConfig.ai.huggingfaceInference>;

const mutableAiConfig = appConfig.ai as MutableAiConfig;
const mutableLocalApiConfig = appConfig.ai.openAiCompatible.local as MutableOpenAiCompatibleConfig;
const mutableCloudApiConfig = appConfig.ai.openAiCompatible.cloud as MutableOpenAiCompatibleConfig;
const mutableHfInferenceConfig = appConfig.ai.huggingfaceInference as MutableHfInferenceConfig;
=======
const mutableAiConfig: Record<string, SettingPrimitive | undefined> = {};
const mutableLocalApiConfig: Record<string, SettingPrimitive | undefined> = {};
const mutableCloudApiConfig: Record<string, SettingPrimitive | undefined> = {};
const mutableHfInferenceConfig: Record<string, SettingPrimitive | undefined> = {};

const runtimeSettingOverrides = new Map<string, SettingPrimitive>();
>>>>>>> Incoming (Background Agent changes)

const parseNonEmptyString = (value: string | number | boolean, key: string): string => {
  const normalized = String(value ?? "").trim();
  if (normalized.length === 0) {
    throw new Error(`Setting ${key} must not be empty.`);
  }
  return normalized;
};

const parseString = (
  value: string | number | boolean,
  key: string,
  allowEmpty = false,
): string => {
  const normalized = String(value ?? "").trim();
  if (!allowEmpty && normalized.length === 0) {
    throw new Error(`Setting ${key} must not be empty.`);
  }
  return normalized;
};

const parseDescriptorBoolean = (value: string | number | boolean, key: string): boolean =>
  parseBoolean(String(value), false, key);

const parseDescriptorInteger = (
  value: string | number | boolean,
  key: string,
  min: number,
): number => parseInteger(String(value), min, min, key);

const parseDescriptorFloat = (
  value: string | number | boolean,
  key: string,
  min: number,
): number => parseFloatValue(String(value), min, min, key);

const defineSetting = (descriptor: SettingDescriptor): SettingDescriptor => {
  const baseValue = descriptor.getBaseValue();
  const baseCurrentValue = descriptor.getCurrentValue;
  return {
    ...descriptor,
    getBaseValue: () => baseValue,
    getCurrentValue: () => {
      const override = runtimeSettingOverrides.get(descriptor.key);
      return override ?? baseCurrentValue();
    },
  };
};

const editableSettingDescriptors = [
  defineSetting({
    key: "AI_LOCAL_SENTIMENT_MODEL",
    envKey: "AI_LOCAL_SENTIMENT_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "sentiment",
    label: "Sentiment classifier",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_SENTIMENT_MODEL"),
    getBaseValue: () => appConfig.ai.localSentimentModel,
    getCurrentValue: () => appConfig.ai.localSentimentModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localSentimentModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_TEXT_GENERATION_MODEL",
    envKey: "AI_LOCAL_TEXT_GENERATION_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "oracle",
    label: "Oracle text generator",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_TEXT_GENERATION_MODEL"),
    getBaseValue: () => appConfig.ai.localTextGenerationModel,
    getCurrentValue: () => appConfig.ai.localTextGenerationModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localTextGenerationModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_NPC_DIALOGUE_MODEL",
    envKey: "AI_LOCAL_NPC_DIALOGUE_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "npcDialogue",
    label: "NPC dialogue generator",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_NPC_DIALOGUE_MODEL"),
    getBaseValue: () => appConfig.ai.localNpcDialogueModel,
    getCurrentValue: () => appConfig.ai.localNpcDialogueModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localNpcDialogueModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_EMBEDDING_MODEL",
    envKey: "AI_LOCAL_EMBEDDING_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "embeddings",
    label: "Embeddings",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_EMBEDDING_MODEL"),
    getBaseValue: () => appConfig.ai.localEmbeddingModel,
    getCurrentValue: () => appConfig.ai.localEmbeddingModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localEmbeddingModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_SPEECH_TO_TEXT_MODEL",
    envKey: "AI_LOCAL_SPEECH_TO_TEXT_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "speechToText",
    label: "Speech to text",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_SPEECH_TO_TEXT_MODEL"),
    getBaseValue: () => appConfig.ai.localSpeechToTextModel,
    getCurrentValue: () => appConfig.ai.localSpeechToTextModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localSpeechToTextModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_TEXT_TO_SPEECH_MODEL",
    envKey: "AI_LOCAL_TEXT_TO_SPEECH_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "textToSpeech",
    label: "Text to speech",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_TEXT_TO_SPEECH_MODEL"),
    getBaseValue: () => appConfig.ai.localTextToSpeechModel,
    getCurrentValue: () => appConfig.ai.localTextToSpeechModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localTextToSpeechModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_IMAGE_GENERATION_ENABLED",
    envKey: "AI_LOCAL_IMAGE_GENERATION_ENABLED",
    valueType: "boolean",
    providerLane: "transformers-local",
    slot: "imageGenerationEnabled",
    label: "Local image generation enabled",
    editable: true,
    parse: (value) => parseDescriptorBoolean(value, "AI_LOCAL_IMAGE_GENERATION_ENABLED"),
    getBaseValue: () => appConfig.ai.localImageGenerationEnabled,
    getCurrentValue: () => appConfig.ai.localImageGenerationEnabled,
    setCurrentValue: (value) => {
      mutableAiConfig["localImageGenerationEnabled"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_IMAGE_GENERATION_MODEL",
    envKey: "AI_LOCAL_IMAGE_GENERATION_MODEL",
    valueType: "string",
    providerLane: "transformers-local",
    slot: "imageGenerationModel",
    label: "Image generation model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_IMAGE_GENERATION_MODEL", true),
    getBaseValue: () => appConfig.ai.localImageGenerationModel,
    getCurrentValue: () => appConfig.ai.localImageGenerationModel,
    setCurrentValue: (value) => {
      mutableAiConfig["localImageGenerationModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_SQUARE_SIZE_PX",
    envKey: "AI_IMAGE_GENERATION_SQUARE_SIZE_PX",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "squareSize",
    label: "Square size",
    editable: true,
    parse: (value) => parseDescriptorInteger(value, "AI_IMAGE_GENERATION_SQUARE_SIZE_PX", 64),
    getBaseValue: () => appConfig.ai.imageGenerationSquareSizePx,
    getCurrentValue: () => appConfig.ai.imageGenerationSquareSizePx,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationSquareSizePx"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_LANDSCAPE_WIDTH_PX",
    envKey: "AI_IMAGE_GENERATION_LANDSCAPE_WIDTH_PX",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "landscapeWidth",
    label: "Landscape width",
    editable: true,
    parse: (value) => parseDescriptorInteger(value, "AI_IMAGE_GENERATION_LANDSCAPE_WIDTH_PX", 64),
    getBaseValue: () => appConfig.ai.imageGenerationLandscapeWidthPx,
    getCurrentValue: () => appConfig.ai.imageGenerationLandscapeWidthPx,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationLandscapeWidthPx"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_LANDSCAPE_HEIGHT_PX",
    envKey: "AI_IMAGE_GENERATION_LANDSCAPE_HEIGHT_PX",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "landscapeHeight",
    label: "Landscape height",
    editable: true,
    parse: (value) =>
      parseDescriptorInteger(value, "AI_IMAGE_GENERATION_LANDSCAPE_HEIGHT_PX", 64),
    getBaseValue: () => appConfig.ai.imageGenerationLandscapeHeightPx,
    getCurrentValue: () => appConfig.ai.imageGenerationLandscapeHeightPx,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationLandscapeHeightPx"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_PORTRAIT_WIDTH_PX",
    envKey: "AI_IMAGE_GENERATION_PORTRAIT_WIDTH_PX",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "portraitWidth",
    label: "Portrait width",
    editable: true,
    parse: (value) => parseDescriptorInteger(value, "AI_IMAGE_GENERATION_PORTRAIT_WIDTH_PX", 64),
    getBaseValue: () => appConfig.ai.imageGenerationPortraitWidthPx,
    getCurrentValue: () => appConfig.ai.imageGenerationPortraitWidthPx,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationPortraitWidthPx"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_PORTRAIT_HEIGHT_PX",
    envKey: "AI_IMAGE_GENERATION_PORTRAIT_HEIGHT_PX",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "portraitHeight",
    label: "Portrait height",
    editable: true,
    parse: (value) =>
      parseDescriptorInteger(value, "AI_IMAGE_GENERATION_PORTRAIT_HEIGHT_PX", 64),
    getBaseValue: () => appConfig.ai.imageGenerationPortraitHeightPx,
    getCurrentValue: () => appConfig.ai.imageGenerationPortraitHeightPx,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationPortraitHeightPx"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_STEPS",
    envKey: "AI_IMAGE_GENERATION_STEPS",
    valueType: "integer",
    providerLane: "image-generation",
    slot: "steps",
    label: "Image generation steps",
    editable: true,
    parse: (value) => parseDescriptorInteger(value, "AI_IMAGE_GENERATION_STEPS", 1),
    getBaseValue: () => appConfig.ai.imageGenerationSteps,
    getCurrentValue: () => appConfig.ai.imageGenerationSteps,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationSteps"] = value;
    },
  }),
  defineSetting({
    key: "AI_IMAGE_GENERATION_GUIDANCE_SCALE",
    envKey: "AI_IMAGE_GENERATION_GUIDANCE_SCALE",
    valueType: "float",
    providerLane: "image-generation",
    slot: "guidanceScale",
    label: "Guidance scale",
    editable: true,
    parse: (value) => parseDescriptorFloat(value, "AI_IMAGE_GENERATION_GUIDANCE_SCALE", 0),
    getBaseValue: () => appConfig.ai.imageGenerationGuidanceScale,
    getCurrentValue: () => appConfig.ai.imageGenerationGuidanceScale,
    setCurrentValue: (value) => {
      mutableAiConfig["imageGenerationGuidanceScale"] = value;
    },
  }),
  defineSetting({
    key: "OLLAMA_CHAT_MODEL",
    envKey: "OLLAMA_CHAT_MODEL",
    valueType: "string",
    providerLane: "ollama",
    slot: "chat",
    label: "Ollama chat model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "OLLAMA_CHAT_MODEL"),
    getBaseValue: () => appConfig.ai.ollamaChatModel,
    getCurrentValue: () => appConfig.ai.ollamaChatModel,
    setCurrentValue: (value) => {
      mutableAiConfig["ollamaChatModel"] = value;
    },
  }),
  defineSetting({
    key: "OLLAMA_VISION_MODEL",
    envKey: "OLLAMA_VISION_MODEL",
    valueType: "string",
    providerLane: "ollama",
    slot: "vision",
    label: "Ollama vision model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "OLLAMA_VISION_MODEL"),
    getBaseValue: () => appConfig.ai.ollamaVisionModel,
    getCurrentValue: () => appConfig.ai.ollamaVisionModel,
    setCurrentValue: (value) => {
      mutableAiConfig["ollamaVisionModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_CHAT_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_CHAT_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "chat",
    label: "Local API-compatible chat model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_LOCAL_API_COMPATIBLE_CHAT_MODEL"),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.chatModel,
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.chatModel,
    setCurrentValue: (value) => {
      mutableLocalApiConfig["chatModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_EMBEDDING_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_EMBEDDING_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "embedding",
    label: "Local API-compatible embedding model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_EMBEDDING_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.embeddingModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.embeddingModel ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["embeddingModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_VISION_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_VISION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "vision",
    label: "Local API-compatible vision model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_VISION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.visionModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.visionModel ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["visionModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_TRANSCRIPTION_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_TRANSCRIPTION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "transcription",
    label: "Local API-compatible transcription model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_TRANSCRIPTION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.transcriptionModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.transcriptionModel ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["transcriptionModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_SPEECH_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_SPEECH_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "speech",
    label: "Local API-compatible speech model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_SPEECH_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.speechModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.speechModel ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["speechModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_MODERATION_MODEL",
    envKey: "AI_LOCAL_API_COMPATIBLE_MODERATION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "moderation",
    label: "Local API-compatible moderation model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_MODERATION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.moderationModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.moderationModel ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["moderationModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_LOCAL_API_COMPATIBLE_SPEECH_VOICE",
    envKey: "AI_LOCAL_API_COMPATIBLE_SPEECH_VOICE",
    valueType: "string",
    providerLane: "openai-compatible-local",
    slot: "voice",
    label: "Local API-compatible speech voice",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_LOCAL_API_COMPATIBLE_SPEECH_VOICE", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.local.speechVoice ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.local.speechVoice ?? "",
    setCurrentValue: (value) => {
      mutableLocalApiConfig["speechVoice"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_CHAT_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_CHAT_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "chat",
    label: "Cloud API-compatible chat model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_CLOUD_API_COMPATIBLE_CHAT_MODEL"),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.chatModel,
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.chatModel,
    setCurrentValue: (value) => {
      mutableCloudApiConfig["chatModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_EMBEDDING_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_EMBEDDING_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "embedding",
    label: "Cloud API-compatible embedding model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_EMBEDDING_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.embeddingModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.embeddingModel ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["embeddingModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_VISION_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_VISION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "vision",
    label: "Cloud API-compatible vision model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_VISION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.visionModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.visionModel ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["visionModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_TRANSCRIPTION_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_TRANSCRIPTION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "transcription",
    label: "Cloud API-compatible transcription model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_TRANSCRIPTION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.transcriptionModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.transcriptionModel ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["transcriptionModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_SPEECH_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_SPEECH_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "speech",
    label: "Cloud API-compatible speech model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_SPEECH_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.speechModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.speechModel ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["speechModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_MODERATION_MODEL",
    envKey: "AI_CLOUD_API_COMPATIBLE_MODERATION_MODEL",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "moderation",
    label: "Cloud API-compatible moderation model",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_MODERATION_MODEL", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.moderationModel ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.moderationModel ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["moderationModel"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_CLOUD_API_COMPATIBLE_SPEECH_VOICE",
    envKey: "AI_CLOUD_API_COMPATIBLE_SPEECH_VOICE",
    valueType: "string",
    providerLane: "openai-compatible-cloud",
    slot: "voice",
    label: "Cloud API-compatible speech voice",
    editable: true,
    allowEmpty: true,
    parse: (value) => parseString(value, "AI_CLOUD_API_COMPATIBLE_SPEECH_VOICE", true),
    getBaseValue: () => appConfig.ai.openAiCompatible.cloud.speechVoice ?? "",
    getCurrentValue: () => appConfig.ai.openAiCompatible.cloud.speechVoice ?? "",
    setCurrentValue: (value) => {
      mutableCloudApiConfig["speechVoice"] = value || undefined;
    },
  }),
  defineSetting({
    key: "AI_HF_INFERENCE_CHAT_MODEL",
    envKey: "AI_HF_INFERENCE_CHAT_MODEL",
    valueType: "string",
    providerLane: "huggingface-inference",
    slot: "chat",
    label: "HF inference chat model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_HF_INFERENCE_CHAT_MODEL"),
    getBaseValue: () => appConfig.ai.huggingfaceInference.chatModel,
    getCurrentValue: () => appConfig.ai.huggingfaceInference.chatModel,
    setCurrentValue: (value) => {
      mutableHfInferenceConfig["chatModel"] = value;
    },
  }),
  defineSetting({
    key: "AI_HF_INFERENCE_IMAGE_MODEL",
    envKey: "AI_HF_INFERENCE_IMAGE_MODEL",
    valueType: "string",
    providerLane: "huggingface-inference",
    slot: "image",
    label: "HF inference image model",
    editable: true,
    parse: (value) => parseNonEmptyString(value, "AI_HF_INFERENCE_IMAGE_MODEL"),
    getBaseValue: () => appConfig.ai.huggingfaceInference.imageModel,
    getCurrentValue: () => appConfig.ai.huggingfaceInference.imageModel,
    setCurrentValue: (value) => {
      mutableHfInferenceConfig["imageModel"] = value;
    },
  }),
] as const satisfies readonly SettingDescriptor[];

const settingDescriptorMap = new Map<string, SettingDescriptor>(
  editableSettingDescriptors.map((descriptor) => [descriptor.key, descriptor]),
);

/**
 * Stable editable AI runtime setting keys.
 */
export type AiRuntimeSettingKey = (typeof editableSettingDescriptors)[number]["key"];

/**
 * Returns the editable setting descriptor for a persisted/config key.
 *
 * @param key Runtime setting key.
 * @returns Matching descriptor, if configured.
 */
export const getAiRuntimeSettingDescriptor = (key: string): SettingDescriptor | null =>
  settingDescriptorMap.get(key) ?? null;

/**
 * Lists all editable AI runtime setting descriptors.
 *
 * @returns Immutable descriptor list.
 */
export const listAiRuntimeSettingDescriptors = (): readonly AiRuntimeSettingValue[] =>
  editableSettingDescriptors.map((descriptor) => ({
    key: descriptor.key,
    value: descriptor.getCurrentValue(),
    valueType: descriptor.valueType,
    source: runtimeSettingOverrides.has(descriptor.key)
      ? "override"
      : Bun.env[descriptor.envKey] !== undefined
        ? "env"
        : "default",
    editable: descriptor.editable,
    providerLane: descriptor.providerLane,
    slot: descriptor.slot,
    label: descriptor.label,
  }));

/**
 * App-wide runtime owner for mutable AI settings and effective-value metadata.
 */
export class AiRuntimeSettingsService {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private overrideKeys = new Set<string>();

  /**
   * Loads persisted overrides exactly once and applies them to the effective app config.
   *
   * @returns Promise resolved when overrides are reflected in memory.
   */
  async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (!this.initializationPromise) {
      this.initializationPromise = this.loadOverrides().then(() => {
        this.initialized = true;
        this.initializationPromise = null;
      });
    }

    await this.initializationPromise;
  }

  /**
   * Returns the full editable runtime-setting snapshot with effective sources.
   *
   * @returns Effective AI runtime settings.
   */
  async listSettings(): Promise<readonly AiRuntimeSettingValue[]> {
    await this.ensureInitialized();
    return editableSettingDescriptors.map((descriptor) => this.toSettingValue(descriptor));
  }

  /**
   * Updates one or more setting overrides and invalidates dependent AI singletons.
   *
   * @param mutations Typed update or reset operations.
   * @returns Effective settings after the write completes.
   */
  async updateSettings(
    mutations: readonly AiRuntimeSettingMutation[],
  ): Promise<readonly AiRuntimeSettingValue[]> {
    await this.ensureInitialized();
    if (mutations.length === 0) {
      throw new Error("At least one AI runtime setting update is required.");
    }

    const upserts: Array<{ key: string; value: string; valueType: SettingValueType }> = [];
    const deletes: string[] = [];

    for (const mutation of mutations) {
      const descriptor = settingDescriptorMap.get(mutation.key);
      if (!descriptor) {
        throw new Error(`Unknown AI runtime setting "${mutation.key}".`);
      }

      if (mutation.reset === true) {
        deletes.push(mutation.key);
        continue;
      }

      if (mutation.value === undefined) {
        throw new Error(`Setting "${mutation.key}" requires a value or reset=true.`);
      }

      const parsedValue = descriptor.parse(mutation.value);
      upserts.push({
        key: mutation.key,
        value: this.serializeValue(descriptor.valueType, parsedValue),
        valueType: descriptor.valueType,
      });
    }

    await prismaBase.$transaction(async (tx) => {
      if (deletes.length > 0) {
        await tx.aiRuntimeSetting.deleteMany({
          where: { key: { in: deletes } },
        });
      }

      for (const entry of upserts) {
        await tx.aiRuntimeSetting.upsert({
          where: { key: entry.key },
          create: entry,
          update: {
            value: entry.value,
            valueType: entry.valueType,
          },
        });
      }
    });

    await this.loadOverrides();
    await this.invalidateRuntimeCaches();
    return this.listSettings();
  }

  /**
   * Returns the current effective setting metadata for one key.
   *
   * @param key Runtime setting key.
   * @returns Effective setting metadata or null when unsupported.
   */
  async getSetting(key: string): Promise<AiRuntimeSettingValue | null> {
    await this.ensureInitialized();
    const descriptor = settingDescriptorMap.get(key);
    return descriptor ? this.toSettingValue(descriptor) : null;
  }

  /**
   * Returns the current effective value source for one setting key.
   *
   * @param key Runtime setting key.
   * @returns Current source classification.
   */
  getSettingSource(key: string): SettingSource {
    return this.overrideKeys.has(key) ? "override" : Bun.env[key] !== undefined ? "env" : "default";
  }

  /**
   * Resets singleton state used by tests.
   *
   * @returns Promise resolved after in-memory caches are cleared.
   */
  async resetForTests(): Promise<void> {
    this.initialized = false;
    this.initializationPromise = null;
    this.overrideKeys.clear();
    for (const descriptor of editableSettingDescriptors) {
      descriptor.setCurrentValue(descriptor.getBaseValue());
      runtimeSettingOverrides.delete(descriptor.key);
    }
    synchronizeModelRegistry();
  }

  private async loadOverrides(): Promise<void> {
    const rows = await prismaBase.aiRuntimeSetting.findMany();
    const overrides = new Map(rows.map((row) => [row.key, row]));

    this.overrideKeys = new Set(overrides.keys());
    for (const descriptor of editableSettingDescriptors) {
      const override = overrides.get(descriptor.key);
      if (!override) {
        descriptor.setCurrentValue(descriptor.getBaseValue());
        runtimeSettingOverrides.delete(descriptor.key);
        continue;
      }

      const parsedValue = this.parseStoredValue(descriptor, override.value);
      descriptor.setCurrentValue(parsedValue);
      runtimeSettingOverrides.set(descriptor.key, parsedValue);
    }
    synchronizeModelRegistry();

    logger.info("ai.runtime-settings.loaded", {
      overrideCount: rows.length,
      keys: [...overrides.keys()],
    });
  }

  private parseStoredValue(descriptor: SettingDescriptor, value: string): SettingPrimitive {
    return descriptor.parse(value);
  }

  private serializeValue(valueType: SettingValueType, value: SettingPrimitive): string {
    switch (valueType) {
      case "boolean":
        return value === true ? "true" : "false";
      case "integer":
      case "float":
      case "string":
      default:
        return String(value);
    }
  }

  private toSettingValue(descriptor: SettingDescriptor): AiRuntimeSettingValue {
    return {
      key: descriptor.key,
      value: descriptor.getCurrentValue(),
      valueType: descriptor.valueType,
      source: this.overrideKeys.has(descriptor.key)
        ? "override"
        : Bun.env[descriptor.envKey] !== undefined
          ? "env"
          : "default",
      editable: descriptor.editable,
      providerLane: descriptor.providerLane,
      slot: descriptor.slot,
      label: descriptor.label,
    };
  }

  private async invalidateRuntimeCaches(): Promise<void> {
    const modelManager = ModelManager.peekInstance();
    if (modelManager) {
      await modelManager.dispose();
    }

    const registry = ProviderRegistry.peekInstance();
    if (registry) {
      await registry.dispose();
    }
  }
}

/**
 * Shared singleton runtime-settings owner.
 */
export const aiRuntimeSettingsService = new AiRuntimeSettingsService();

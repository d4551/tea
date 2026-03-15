import {
  appConfig,
  type AiApiCompatibleVendor,
  type OnnxDevicePreference,
} from "../../config/environment.ts";
import {
  aiRuntimeSettingsService,
  type AiRuntimeSettingValue,
} from "./ai-runtime-settings-service.ts";
import { getLocalModelCatalog, type LocalModelCatalogEntry } from "./model-registry.ts";

/**
 * Local inference runtime settings exposed to routes and UI.
 */
export interface AiRuntimeProfile {
  /** Local Transformers.js integration details. */
  readonly transformers: {
    readonly provider: "transformers.js";
    readonly integration: "huggingface";
    readonly cacheDirectory: string;
    readonly localModelPath: string;
    readonly allowRemoteModels: boolean;
    readonly allowLocalModels: boolean;
  };
  /** ONNX backend settings. */
  readonly onnx: {
    readonly backend: OnnxDevicePreference;
    readonly device: OnnxDevicePreference;
    readonly wasmPath: string;
    readonly threadCount: number;
    readonly proxyEnabled: boolean;
  };
  /** Audio pipeline constraints. */
  readonly audio: {
    readonly inputSampleRateHz: number;
    readonly maxUploadBytes: number;
    readonly speakerEmbeddingsConfigured: boolean;
  };
  /** OpenAI-compatible local/cloud routing lanes. */
  readonly apiCompatible: {
    readonly local: {
      readonly enabled: boolean;
      readonly vendor: AiApiCompatibleVendor;
      readonly supportedVendors: readonly AiApiCompatibleVendor[];
      readonly providerLabel: string;
      readonly baseUrl: string;
      readonly chatModel: string;
      readonly embeddingModel?: string;
      readonly visionModel?: string;
      readonly transcriptionModel?: string;
      readonly speechModel?: string;
      readonly moderationModel?: string;
      readonly speechVoice?: string;
    };
    readonly cloud: {
      readonly enabled: boolean;
      readonly vendor: AiApiCompatibleVendor;
      readonly supportedVendors: readonly AiApiCompatibleVendor[];
      readonly providerLabel: string;
      readonly baseUrl: string;
      readonly chatModel: string;
      readonly embeddingModel?: string;
      readonly visionModel?: string;
      readonly transcriptionModel?: string;
      readonly speechModel?: string;
      readonly moderationModel?: string;
      readonly speechVoice?: string;
    };
    readonly defaultPolicy: "local-first";
    readonly cloudFallbackEnabled: boolean;
  };
  /** Configured local model targets. */
  readonly catalog: readonly LocalModelCatalogEntry[];
  /** Editable effective runtime settings exposed to UI and API clients. */
  readonly settings: readonly AiRuntimeSettingValue[];
}

/**
 * Returns the local AI runtime profile used by API docs and builder views.
 *
 * @returns Local AI runtime profile.
 */
export const getAiRuntimeProfile = async (): Promise<AiRuntimeProfile> => ({
  transformers: {
    provider: "transformers.js",
    integration: "huggingface",
    cacheDirectory: appConfig.ai.transformersCacheDirectory,
    localModelPath: appConfig.ai.transformersLocalModelPath,
    allowRemoteModels: appConfig.ai.transformersAllowRemoteModels,
    allowLocalModels: appConfig.ai.transformersAllowLocalModels,
  },
  onnx: {
    backend: appConfig.ai.onnxDevice,
    device: appConfig.ai.onnxDevice,
    wasmPath: appConfig.ai.onnxWasmPath,
    threadCount: appConfig.ai.onnxThreadCount,
    proxyEnabled: appConfig.ai.onnxProxyEnabled,
  },
  audio: {
    inputSampleRateHz: appConfig.ai.audioInputSampleRateHz,
    maxUploadBytes: appConfig.ai.audioUploadMaxBytes,
    speakerEmbeddingsConfigured: appConfig.ai.textToSpeechSpeakerEmbeddings.trim().length > 0,
  },
  apiCompatible: {
    local: {
      enabled: appConfig.ai.openAiCompatible.local.enabled,
      vendor: appConfig.ai.openAiCompatible.local.vendor,
      supportedVendors: appConfig.ai.openAiCompatible.local.supportedVendors,
      providerLabel: appConfig.ai.openAiCompatible.local.providerLabel,
      baseUrl: appConfig.ai.openAiCompatible.local.baseUrl,
      chatModel: appConfig.ai.openAiCompatible.local.chatModel,
      embeddingModel: appConfig.ai.openAiCompatible.local.embeddingModel,
      visionModel: appConfig.ai.openAiCompatible.local.visionModel,
      transcriptionModel: appConfig.ai.openAiCompatible.local.transcriptionModel,
      speechModel: appConfig.ai.openAiCompatible.local.speechModel,
      moderationModel: appConfig.ai.openAiCompatible.local.moderationModel,
      speechVoice: appConfig.ai.openAiCompatible.local.speechVoice,
    },
    cloud: {
      enabled: appConfig.ai.openAiCompatible.cloud.enabled,
      vendor: appConfig.ai.openAiCompatible.cloud.vendor,
      supportedVendors: appConfig.ai.openAiCompatible.cloud.supportedVendors,
      providerLabel: appConfig.ai.openAiCompatible.cloud.providerLabel,
      baseUrl: appConfig.ai.openAiCompatible.cloud.baseUrl,
      chatModel: appConfig.ai.openAiCompatible.cloud.chatModel,
      embeddingModel: appConfig.ai.openAiCompatible.cloud.embeddingModel,
      visionModel: appConfig.ai.openAiCompatible.cloud.visionModel,
      transcriptionModel: appConfig.ai.openAiCompatible.cloud.transcriptionModel,
      speechModel: appConfig.ai.openAiCompatible.cloud.speechModel,
      moderationModel: appConfig.ai.openAiCompatible.cloud.moderationModel,
      speechVoice: appConfig.ai.openAiCompatible.cloud.speechVoice,
    },
    defaultPolicy: appConfig.ai.routing.defaultPolicy,
    cloudFallbackEnabled: appConfig.ai.routing.cloudFallbackEnabled,
  },
  catalog: getLocalModelCatalog(),
  settings: await aiRuntimeSettingsService.listSettings(),
});

import { appConfig, type OnnxDevicePreference } from "../../config/environment.ts";
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
  /** Configured local model targets. */
  readonly catalog: readonly LocalModelCatalogEntry[];
}

/**
 * Returns the local AI runtime profile used by API docs and builder views.
 *
 * @returns Local AI runtime profile.
 */
export const getAiRuntimeProfile = (): AiRuntimeProfile => ({
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
  catalog: getLocalModelCatalog(),
});

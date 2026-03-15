import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { isRecord } from "../../shared/utils/safe-json.ts";
import { aiRuntimeSettingsService } from "./ai-runtime-settings-service.ts";
import { ProviderRegistry } from "./providers/provider-registry.ts";

const logger = createLogger("ai.provider-model-catalog");

const SEARCHABLE_PROVIDER_LANES = [
  "transformers-local",
  "huggingface-inference",
  "ollama",
  "openai-compatible-local",
  "openai-compatible-cloud",
  "huggingface-endpoints",
] as const;

type SearchableProviderLane = (typeof SEARCHABLE_PROVIDER_LANES)[number];

/**
 * Normalized provider model search query accepted by API routes and HTMX forms.
 */
export interface ProviderModelSearchQuery {
  /** Provider lane being searched. */
  readonly provider: SearchableProviderLane;
  /** Slot or capability being populated. */
  readonly slot: string;
  /** Free-text model search query. */
  readonly search?: string;
  /** Optional author/org filter when supported. */
  readonly author?: string;
  /** Optional pagination token. */
  readonly cursor?: string;
  /** Maximum number of results to return. */
  readonly limit?: number;
}

/**
 * One normalized catalog entry returned by provider model search APIs.
 */
export interface ProviderModelCatalogEntry {
  /** Provider lane or upstream integration identifier. */
  readonly provider: string;
  /** Stable model identifier. */
  readonly model: string;
  /** Human-readable display label. */
  readonly label: string;
  /** Short descriptive summary. */
  readonly summary: string;
  /** Normalized capability tags. */
  readonly capabilities: readonly string[];
  /** Additional provider or upstream tags. */
  readonly tags: readonly string[];
  /** Whether the model is already installed locally. */
  readonly installed: boolean;
  /** Whether the model is currently available to the app. */
  readonly available: boolean;
  /** Discovery source classification. */
  readonly source: "hub" | "installed" | "discovered" | "configured";
}

/**
 * Normalized provider model search response.
 */
export interface ProviderModelCatalogResult {
  /** Echoed provider lane. */
  readonly provider: SearchableProviderLane;
  /** Echoed slot identifier. */
  readonly slot: string;
  /** Normalized catalog entries. */
  readonly items: readonly ProviderModelCatalogEntry[];
  /** Optional pagination token for follow-up requests. */
  readonly nextCursor: string | null;
}

interface HuggingFaceHubModelRecord {
  readonly id?: string;
  readonly pipeline_tag?: string;
  readonly tags?: readonly string[];
  readonly downloads?: number;
  readonly likes?: number;
}

type JsonPrimitive = string | number | boolean | null;
interface JsonRecord {
  readonly [key: string]: JsonValue | undefined;
}
type JsonArray = readonly JsonValue[];
type JsonValue = JsonPrimitive | JsonArray | JsonRecord;

const searchableProviderSet = new Set<string>(SEARCHABLE_PROVIDER_LANES);

const extractModelId = (value: JsonValue): string =>
  isRecord(value) && typeof value.id === "string" ? value.id : "";

const slotToCapability = (slot: string): string | null => {
  switch (slot) {
    case "sentiment":
    case "moderation":
      return "text-classification";
    case "oracle":
    case "npcDialogue":
    case "chat":
      return "chat";
    case "embeddings":
    case "embedding":
      return "embeddings";
    case "vision":
      return "vision";
    case "speechToText":
    case "transcription":
      return "speech-to-text";
    case "textToSpeech":
    case "speech":
      return "text-to-speech";
    case "image":
    case "imageGenerationModel":
      return "image-generation";
    default:
      return null;
  }
};

const slotToHuggingFaceFilter = (slot: string): string | null => {
  switch (slot) {
    case "sentiment":
    case "moderation":
      return "text-classification";
    case "oracle":
    case "npcDialogue":
    case "chat":
      return "text-generation";
    case "embeddings":
    case "embedding":
      return "feature-extraction";
    case "speechToText":
    case "transcription":
      return "automatic-speech-recognition";
    case "textToSpeech":
    case "speech":
      return "text-to-speech";
    case "image":
    case "imageGenerationModel":
      return "text-to-image";
    default:
      return null;
  }
};

const normalizeSearchableProvider = (provider: string): SearchableProviderLane => {
  if (!searchableProviderSet.has(provider)) {
    throw new Error(`Unsupported provider lane "${provider}".`);
  }

  return provider as SearchableProviderLane;
};

const matchesTextSearch = (query: string, ...values: readonly string[]): boolean => {
  if (query.length === 0) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(normalizedQuery));
};

const buildOpenAiCompatibleHeaders = (
  auth: typeof appConfig.ai.openAiCompatible.local.auth,
  apiKey: string,
): HeadersInit => {
  const headers = new Headers();
  for (const [name, value] of Object.entries(auth.extraHeaders)) {
    headers.set(name, value);
  }
  if (apiKey.trim().length > 0) {
    headers.set(auth.apiKeyHeaderName, `${auth.apiKeyPrefix}${apiKey}`);
  }
  return headers;
};

const toOpenAiCompatibleModelDiscoveryUrl = (
  baseUrl: string,
  modelsPath: string | null,
): string | null => {
  if (!modelsPath) {
    return null;
  }

  return new URL(modelsPath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
};

const parseOpenAiModelIds = (value: JsonValue): readonly string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => extractModelId(entry)).filter((entry) => entry.length > 0);
  }

  if (isRecord(value) && Array.isArray(value.data)) {
    return value.data.map((entry) => extractModelId(entry)).filter((entry) => entry.length > 0);
  }

  return [];
};

const parseHuggingFaceModels = (value: JsonValue): readonly HuggingFaceHubModelRecord[] =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is HuggingFaceHubModelRecord =>
          isRecord(entry) && typeof entry.id === "string",
      )
    : [];

/**
 * Searches provider-aware model catalogs for one provider lane and slot.
 */
export const searchProviderModels = async (
  query: ProviderModelSearchQuery,
): Promise<ProviderModelCatalogResult> => {
  await aiRuntimeSettingsService.ensureInitialized();

  const normalizedProvider = normalizeSearchableProvider(query.provider);
  const search = query.search?.trim() ?? "";
  const author = query.author?.trim() ?? "";
  const limit = Math.max(1, Math.min(query.limit ?? 12, 25));

  switch (normalizedProvider) {
    case "transformers-local":
    case "huggingface-inference":
      return searchHuggingFaceHub({
        provider: normalizedProvider,
        slot: query.slot,
        search,
        author,
        limit,
      });
    case "ollama":
      return searchRegistryCapabilities({
        provider: normalizedProvider,
        slot: query.slot,
        search,
        limit,
        source: "installed",
      });
    case "openai-compatible-local":
      return searchOpenAiCompatibleModels({
        provider: normalizedProvider,
        slot: query.slot,
        search,
        limit,
        baseUrl: appConfig.ai.openAiCompatible.local.baseUrl,
        apiKey: appConfig.ai.openAiCompatible.local.apiKey,
        modelsPath: appConfig.ai.openAiCompatible.local.endpoints.modelsPath,
        auth: appConfig.ai.openAiCompatible.local.auth,
      });
    case "openai-compatible-cloud":
      return searchOpenAiCompatibleModels({
        provider: normalizedProvider,
        slot: query.slot,
        search,
        limit,
        baseUrl: appConfig.ai.openAiCompatible.cloud.baseUrl,
        apiKey: appConfig.ai.openAiCompatible.cloud.apiKey,
        modelsPath: appConfig.ai.openAiCompatible.cloud.endpoints.modelsPath,
        auth: appConfig.ai.openAiCompatible.cloud.auth,
      });
    case "huggingface-endpoints":
      return {
        provider: normalizedProvider,
        slot: query.slot,
        items: [],
        nextCursor: null,
      };
  }
};

/**
 * Pulls one Ollama model into the local runtime and refreshes provider capability state.
 *
 * @param modelId Fully qualified Ollama model id.
 */
export const pullOllamaModel = async (modelId: string): Promise<void> => {
  await aiRuntimeSettingsService.ensureInitialized();

  const normalizedModelId = modelId.trim();
  if (normalizedModelId.length === 0) {
    throw new Error("Ollama model id is required.");
  }

  const response = await fetch(`${appConfig.ai.ollamaBaseUrl}/api/pull`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: normalizedModelId,
      stream: false,
    }),
    signal: AbortSignal.timeout(appConfig.ai.ollamaTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Ollama pull failed with HTTP ${response.status}.`);
  }

  const registry = await ProviderRegistry.getInstance();
  await registry.refreshCapabilities();

  logger.info("ollama.model.pulled", { model: normalizedModelId });
};

const searchHuggingFaceHub = async (input: {
  readonly provider: SearchableProviderLane;
  readonly slot: string;
  readonly search: string;
  readonly author: string;
  readonly limit: number;
}): Promise<ProviderModelCatalogResult> => {
  const url = new URL("/api/models", appConfig.ai.huggingfaceInference.baseUrl);
  const filter = slotToHuggingFaceFilter(input.slot);
  if (input.search.length > 0) {
    url.searchParams.set("search", input.search);
  }
  if (input.author.length > 0) {
    url.searchParams.set("author", input.author);
  }
  if (filter) {
    url.searchParams.set("filter", filter);
  }
  url.searchParams.set("limit", String(input.limit));

  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face catalog search failed with HTTP ${response.status}.`);
  }

  const payload = parseHuggingFaceModels(await response.json());
  const items = payload.map((entry) => ({
    provider: input.provider,
    model: entry.id ?? "",
    label: entry.id ?? "",
    summary:
      entry.pipeline_tag && entry.pipeline_tag.length > 0
        ? `${entry.pipeline_tag} model on Hugging Face Hub`
        : "Model on Hugging Face Hub",
    capabilities: entry.pipeline_tag ? [entry.pipeline_tag] : [],
    tags: entry.tags ?? [],
    installed: false,
    available: true,
    source: "hub" as const,
  }));

  return {
    provider: input.provider,
    slot: input.slot,
    items,
    nextCursor: null,
  };
};

const searchRegistryCapabilities = async (input: {
  readonly provider: "ollama";
  readonly slot: string;
  readonly search: string;
  readonly limit: number;
  readonly source: "installed";
}): Promise<ProviderModelCatalogResult> => {
  const registry = await ProviderRegistry.getInstance();
  const status = await registry.getStatus();
  const providerReady =
    status.providers.find((entry) => entry.name === input.provider)?.available ?? false;
  const requiredCapability = slotToCapability(input.slot);

  const items = status.capabilities
    .filter((entry) => entry.provider === input.provider)
    .filter(
      (entry) => requiredCapability === null || entry.capabilities.has(requiredCapability as never),
    )
    .filter((entry) =>
      matchesTextSearch(input.search, entry.model, [...entry.capabilities].join(" ")),
    )
    .slice(0, input.limit)
    .map((entry) => ({
      provider: input.provider,
      model: entry.model,
      label: entry.model,
      summary: `Installed Ollama model (${entry.runtime})`,
      capabilities: [...entry.capabilities],
      tags: [entry.integration, entry.runtime],
      installed: true,
      available: providerReady,
      source: input.source,
    }));

  return {
    provider: input.provider,
    slot: input.slot,
    items,
    nextCursor: null,
  };
};

const searchOpenAiCompatibleModels = async (input: {
  readonly provider: "openai-compatible-local" | "openai-compatible-cloud";
  readonly slot: string;
  readonly search: string;
  readonly limit: number;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly modelsPath: string | null;
  readonly auth: typeof appConfig.ai.openAiCompatible.local.auth;
}): Promise<ProviderModelCatalogResult> => {
  const registry = await ProviderRegistry.getInstance();
  const status = await registry.getStatus();
  const providerReady =
    status.providers.find((entry) => entry.name === input.provider)?.available ?? false;
  const requiredCapability = slotToCapability(input.slot);
  let source: ProviderModelCatalogEntry["source"] = input.modelsPath ? "discovered" : "configured";

  let discoveredIds: readonly string[] = [];
  const discoveryUrl = toOpenAiCompatibleModelDiscoveryUrl(input.baseUrl, input.modelsPath);
  if (discoveryUrl) {
    const response = await fetch(discoveryUrl, {
      method: "GET",
      headers: buildOpenAiCompatibleHeaders(input.auth, input.apiKey),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    });

    if (response.ok) {
      discoveredIds = parseOpenAiModelIds(await response.json());
    } else {
      source = "configured";
    }
  }

  const capabilityMatches = status.capabilities
    .filter((entry) => entry.provider === input.provider)
    .filter(
      (entry) => requiredCapability === null || entry.capabilities.has(requiredCapability as never),
    );

  const capabilityMap = new Map(capabilityMatches.map((entry) => [entry.model, entry]));
  const modelIds = [
    ...new Set([...discoveredIds, ...capabilityMatches.map((entry) => entry.model)]),
  ];

  const items = modelIds
    .filter((modelId) => matchesTextSearch(input.search, modelId))
    .slice(0, input.limit)
    .map((modelId) => {
      const capability = capabilityMap.get(modelId);
      return {
        provider: input.provider,
        model: modelId,
        label: modelId,
        summary: capability
          ? `Discovered through ${capability.runtime}`
          : "Configured default model",
        capabilities: capability ? [...capability.capabilities] : [],
        tags: capability ? [capability.integration, capability.runtime] : [],
        installed: false,
        available: providerReady,
        source,
      } satisfies ProviderModelCatalogEntry;
    });

  return {
    provider: input.provider,
    slot: input.slot,
    items,
    nextCursor: null,
  };
};

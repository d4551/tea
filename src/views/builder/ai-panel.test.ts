import { describe, expect, test } from "bun:test";
import type { KnowledgeDocumentRecord } from "../../domain/ai/knowledge-base-service.ts";
import type { AiRuntimeProfile } from "../../domain/ai/local-runtime-profile.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import type { AvailableAiFeatures } from "../../domain/game/ai/game-ai-service.ts";
import { createStarterProjectBranding } from "../../shared/branding/project-branding.ts";
import type { FeatureCapability } from "../../shared/contracts/game.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderAiPanel } from "./ai-panel.ts";

const countOccurrences = (html: string, value: string): number => html.split(value).length - 1;

const features: AvailableAiFeatures = {
  richDialogue: true,
  visionAnalysis: true,
  sentimentAnalysis: true,
  embeddings: true,
  speechToText: true,
  speechSynthesis: true,
  localInference: true,
  providers: ["transformers", "ollama"],
};

const featureCapabilities: FeatureCapability = {
  assist: { status: "ready", mode: "provider" },
  test: { status: "ready", mode: "provider" },
  toolLikeSuggestions: { status: "ready", mode: "provider" },
  streaming: { status: "ready", mode: "provider" },
  offlineFallback: { status: "degraded", mode: "fallback" },
};

const runtimeProfile: AiRuntimeProfile = {
  transformers: {
    provider: "transformers.js",
    integration: "huggingface",
    cacheDirectory: "/tmp/models",
    localModelPath: "/tmp/models/local",
    allowRemoteModels: true,
    allowLocalModels: true,
  },
  onnx: {
    backend: "webgpu",
    device: "webgpu",
    wasmPath: "/wasm",
    threadCount: 4,
    proxyEnabled: false,
  },
  audio: {
    inputSampleRateHz: 16_000,
    maxUploadBytes: 1_000_000,
    speakerEmbeddingsConfigured: false,
  },
  apiCompatible: {
    local: {
      enabled: true,
      vendor: "openai",
      supportedVendors: ["openai"],
      providerLabel: "Local",
      baseUrl: "http://localhost:11434/v1",
      chatModel: "llama3",
    },
    cloud: {
      enabled: false,
      vendor: "openai",
      supportedVendors: ["openai"],
      providerLabel: "Cloud",
      baseUrl: "https://api.example.com/v1",
      chatModel: "gpt-4o-mini",
    },
    defaultPolicy: "local-first",
    cloudFallbackEnabled: false,
  },
  catalog: [],
  settings: [],
};

const readiness: BuilderPlatformReadiness = {
  sceneCount: 3,
  spriteManifestCount: 2,
  aiProviderCount: 2,
  implementedCount: 5,
  partialCount: 2,
  missingCount: 0,
  capabilities: [
    { key: "aiAuthoring", status: "implemented" },
    { key: "automation", status: "partial" },
  ],
};

const documents: ReadonlyArray<KnowledgeDocumentRecord> = [
  {
    id: "doc-1",
    projectId: "default",
    title: "Lore Notes",
    source: "notes/lore.md",
    locale: "en-US",
    contentHash: "hash-1",
    chunkCount: 4,
    createdAtMs: Date.UTC(2026, 2, 15, 10, 0, 0),
    updatedAtMs: Date.UTC(2026, 2, 15, 10, 5, 0),
  },
];

const branding = createStarterProjectBranding("tea-house-story");

describe("renderAiPanel", () => {
  test("renders canonical settings workbench section targets exactly once", () => {
    const html = renderAiPanel(
      getMessages("en-US"),
      features,
      featureCapabilities,
      runtimeProfile,
      "en-US",
      "default",
      branding,
      readiness,
      documents,
    );

    expect(countOccurrences(html, 'id="builder-capability-overview"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-brand-control-plane"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-provider-workbench"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-assistant-review"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-knowledge-workspace"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-model-catalog"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-patch-preview"')).toBe(1);
  });

  test("renders settings workbench links to valid canonical fragments", () => {
    const html = renderAiPanel(
      getMessages("en-US"),
      features,
      featureCapabilities,
      runtimeProfile,
      "en-US",
      "default",
      branding,
      readiness,
      documents,
    );

    expect(html).toContain("/projects/default/settings?lang=en-US#builder-brand-control-plane");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-provider-workbench");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-assistant-review");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-knowledge-workspace");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-model-catalog");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-patch-preview");
    expect(html).toContain("/projects/default/operations?lang=en-US");
    expect(html).toContain("River Tea Chronicle");
  });
});

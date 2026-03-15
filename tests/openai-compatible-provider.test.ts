import { describe, expect, test } from "bun:test";
import {
  OpenAiCompatibleProvider,
  type OpenAiCompatibleProviderConfig,
} from "../src/domain/ai/providers/openai-compatible-provider.ts";

const originalFetch = globalThis.fetch;

const createFetchStub = (
  responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch => Object.assign(responder, originalFetch);

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => new Uint8Array(bytes).buffer;

const baseConfig: OpenAiCompatibleProviderConfig = {
  name: "openai-compatible-local",
  vendor: "ramalama",
  providerLabel: "ramalama",
  baseUrl: "http://127.0.0.1:8080/v1",
  apiKey: "",
  availabilityTimeoutMs: 1500,
  chatModel: "local-chat",
  embeddingModel: "local-embedding",
  visionModel: "local-vision",
  transcriptionModel: "local-transcribe",
  speechModel: "local-speech",
  moderationModel: "local-moderation",
  speechVoice: "alloy",
  endpoints: {
    modelsPath: "/models",
    chatCompletionsPath: "/chat/completions",
    embeddingsPath: "/embeddings",
    transcriptionsPath: "/audio/transcriptions",
    speechPath: "/audio/speech",
    moderationsPath: "/moderations",
  },
  auth: {
    apiKeyHeaderName: "authorization",
    apiKeyPrefix: "Bearer ",
    extraHeaders: {},
  },
  local: true,
};

describe("openai-compatible provider response decoding", () => {
  test("detectCapabilities drops malformed model payloads but keeps configured models", async () => {
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              data: [{ id: "listed-chat" }, { slug: "invalid" }],
            }),
          ),
      ),
    );

    const capabilities = await provider.detectCapabilities();
    const modelIds = capabilities.map((entry) => entry.model);
    const embeddingModel = baseConfig.embeddingModel;
    const visionModel = baseConfig.visionModel;

    expect(modelIds).toContain("listed-chat");
    expect(modelIds).toContain(baseConfig.chatModel);
    expect(embeddingModel).toBeDefined();
    expect(visionModel).toBeDefined();
    if (!embeddingModel || !visionModel) {
      return;
    }
    expect(modelIds).toContain(embeddingModel);
    expect(modelIds).toContain(visionModel);
    const transcriptionModel = baseConfig.transcriptionModel;
    const speechModel = baseConfig.speechModel;
    const moderationModel = baseConfig.moderationModel;
    expect(transcriptionModel).toBeDefined();
    expect(speechModel).toBeDefined();
    expect(moderationModel).toBeDefined();
    if (!transcriptionModel || !speechModel || !moderationModel) {
      return;
    }
    expect(modelIds).toContain(transcriptionModel);
    expect(modelIds).toContain(speechModel);
    expect(modelIds).toContain(moderationModel);
  });

  test("detectCapabilities falls back to configured models when discovery is unavailable", async () => {
    const provider = new OpenAiCompatibleProvider({
      ...baseConfig,
      vendor: "claude",
      endpoints: {
        ...baseConfig.endpoints,
        modelsPath: null,
        embeddingsPath: null,
        transcriptionsPath: null,
        speechPath: null,
        moderationsPath: null,
      },
      embeddingModel: undefined,
      transcriptionModel: undefined,
      speechModel: undefined,
      moderationModel: undefined,
    });

    const capabilities = await provider.detectCapabilities();
    const visionModel = baseConfig.visionModel;
    expect(visionModel).toBeDefined();
    if (!visionModel) {
      return;
    }
    expect(capabilities.map((entry) => entry.model)).toEqual([baseConfig.chatModel, visionModel]);
  });

  test("detectCapabilities accepts GitHub catalog responses and vendor headers", async () => {
    let receivedUrl = "";
    let receivedHeaders: Headers | null = null;
    const provider = new OpenAiCompatibleProvider(
      {
        ...baseConfig,
        vendor: "copilot",
        apiKey: "github-token",
        baseUrl: "https://models.github.ai",
        endpoints: {
          ...baseConfig.endpoints,
          modelsPath: "/catalog/models",
          chatCompletionsPath: "/inference/chat/completions",
          embeddingsPath: "/inference/embeddings",
          transcriptionsPath: null,
          speechPath: null,
          moderationsPath: null,
        },
        auth: {
          apiKeyHeaderName: "authorization",
          apiKeyPrefix: "Bearer ",
          extraHeaders: {
            accept: "application/vnd.github+json",
            "x-github-api-version": "2022-11-28",
          },
        },
        chatModel: "openai/gpt-4.1-mini",
        embeddingModel: "openai/text-embedding-3-small",
        visionModel: undefined,
        transcriptionModel: undefined,
        speechModel: undefined,
        moderationModel: undefined,
      },
      createFetchStub(async (input, init) => {
        receivedUrl = typeof input === "string" ? input : input.toString();
        receivedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify([{ id: "openai/gpt-4.1-mini" }]));
      }),
    );

    const capabilities = await provider.detectCapabilities();
    expect(receivedHeaders).not.toBeNull();
    const headers = new Headers(receivedHeaders ?? undefined);

    expect(receivedUrl).toBe("https://models.github.ai/catalog/models");
    expect(headers.get("authorization")).toBe("Bearer github-token");
    expect(headers.get("accept")).toBe("application/vnd.github+json");
    expect(headers.get("x-github-api-version")).toBe("2022-11-28");
    expect(capabilities.map((entry) => entry.model)).toContain("openai/gpt-4.1-mini");
  });

  test("chat returns a retryable failure for malformed payloads", async () => {
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              model: "local-chat",
              choices: [{ message: { role: "assistant" } }],
            }),
          ),
      ),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("invalid response payload");
    expect(result.retryable).toBe(true);
  });

  test("generateEmbedding returns null when embeddings payload is malformed", async () => {
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              data: [{ embedding: ["bad"] }],
            }),
          ),
      ),
    );

    const embedding = await provider.generateEmbedding("tea");
    expect(embedding).toBeNull();
  });

  test("classify maps moderation payloads into a typed classification result", async () => {
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              results: [
                {
                  flagged: true,
                  categories: {
                    violence: false,
                    "self-harm": true,
                  },
                  category_scores: {
                    violence: 0.12,
                    "self-harm": 0.91,
                  },
                },
              ],
            }),
          ),
      ),
    );

    const result = await provider.classify("test");
    expect(result).not.toBeNull();
    if (!result) {
      return;
    }
    expect(result.label).toBe("MODERATION_SELF_HARM");
    const moderationModel = baseConfig.moderationModel;
    expect(moderationModel).toBeDefined();
    if (!moderationModel) {
      return;
    }
    expect(result.model).toBe(moderationModel);
  });

  test("transcribeAudio decodes json transcription payloads", async () => {
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(async () => new Response(JSON.stringify({ text: "hello tea" }))),
    );

    const result = await provider.transcribeAudio({
      audio: new Float32Array([0, 0, 0]),
      sampleRate: 16_000,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.text).toBe("hello tea");
    const transcriptionModel = baseConfig.transcriptionModel;
    expect(transcriptionModel).toBeDefined();
    if (!transcriptionModel) {
      return;
    }
    expect(result.model).toBe(transcriptionModel);
  });

  test("synthesizeSpeech decodes wav audio payloads", async () => {
    const { encodeMonoWavAudio } = await import("../src/shared/utils/wav-audio.ts");
    const wav = encodeMonoWavAudio(new Float32Array([0, 0.25, -0.25, 0]), 16_000);
    const provider = new OpenAiCompatibleProvider(
      baseConfig,
      createFetchStub(
        async () => new Response(toArrayBuffer(wav), { headers: { "content-type": "audio/wav" } }),
      ),
    );

    const result = await provider.synthesizeSpeech({
      text: "hello tea",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.sampleRate).toBe(16_000);
    expect(result.audio.length).toBeGreaterThan(0);
    const speechModel = baseConfig.speechModel;
    expect(speechModel).toBeDefined();
    if (!speechModel) {
      return;
    }
    expect(result.model).toBe(speechModel);
  });
});

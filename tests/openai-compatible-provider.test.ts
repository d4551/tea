import { describe, expect, test } from "bun:test";
import {
  OpenAiCompatibleProvider,
  type OpenAiCompatibleProviderConfig,
} from "../src/domain/ai/providers/openai-compatible-provider.ts";

const originalFetch = globalThis.fetch;

const createFetchStub = (
  responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch => Object.assign(responder, originalFetch);

const baseConfig: OpenAiCompatibleProviderConfig = {
  name: "openai-compatible-local",
  providerLabel: "ramalama",
  baseUrl: "http://127.0.0.1:8080/v1",
  apiKey: "",
  availabilityTimeoutMs: 1500,
  chatModel: "local-chat",
  embeddingModel: "local-embedding",
  visionModel: "local-vision",
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
});

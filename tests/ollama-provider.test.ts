import { describe, expect, test } from "bun:test";
import { OllamaProvider } from "../src/domain/ai/providers/ollama-provider.ts";

const originalFetch = globalThis.fetch;

const createFetchStub = (
  responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch => Object.assign(responder, originalFetch);

describe("ollama provider response decoding", () => {
  test("detectCapabilities drops malformed tags payload entries", async () => {
    const provider = new OllamaProvider(
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              models: [
                {
                  name: "valid-model",
                  model: "valid-model",
                  modified_at: "2026-03-07T00:00:00.000Z",
                  size: 123,
                  digest: "abc",
                  details: {
                    format: "gguf",
                    family: "llama",
                    families: ["llama"],
                    parameter_size: "7B",
                    quantization_level: "Q4_K_M",
                  },
                },
                {
                  name: 42,
                },
              ],
            }),
          ),
      ),
    );
    const capabilities = await provider.detectCapabilities();

    expect(capabilities).toHaveLength(1);
    expect(capabilities[0]?.model).toBe("valid-model");
  });

  test("chat returns a retryable failure for malformed response payloads", async () => {
    const provider = new OllamaProvider(
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              message: {
                role: "assistant",
              },
              done: true,
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
    const provider = new OllamaProvider(
      createFetchStub(
        async () =>
          new Response(
            JSON.stringify({
              embeddings: [["bad"]],
            }),
          ),
      ),
    );
    const embedding = await provider.generateEmbedding("tea");

    expect(embedding).toBeNull();
  });
});

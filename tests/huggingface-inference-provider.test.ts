import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { appConfig } from "../src/config/environment.ts";
import { HuggingFaceInferenceProvider } from "../src/domain/ai/providers/huggingface-inference-provider.ts";

const originalFetch = globalThis.fetch;

/**
 * Creates a fetch stub from a responder function, preserving the globalThis.fetch signature.
 *
 * @param responder Mock response handler.
 * @returns Fetch-compatible stub.
 */
const createFetchStub = (
  responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch => Object.assign(responder, originalFetch);

type InferConfig = typeof appConfig.ai.huggingfaceInference;
type EndpointConfig = typeof appConfig.ai.huggingfaceEndpoints;

const withInferenceConfig = (updates: Partial<InferConfig>): (() => void) => {
  const original: Partial<InferConfig> = {};
  for (const [key, value] of Object.entries(updates)) {
    Reflect.set(original, key, Reflect.get(appConfig.ai.huggingfaceInference, key));
    Reflect.set(appConfig.ai.huggingfaceInference, key, value);
  }
  return () => {
    for (const [key] of Object.entries(updates)) {
      Reflect.set(appConfig.ai.huggingfaceInference, key, Reflect.get(original, key));
    }
  };
};

const withEndpointConfig = (updates: Partial<EndpointConfig>): (() => void) => {
  const original: Partial<EndpointConfig> = {};
  for (const [key, value] of Object.entries(updates)) {
    Reflect.set(original, key, Reflect.get(appConfig.ai.huggingfaceEndpoints, key));
    Reflect.set(appConfig.ai.huggingfaceEndpoints, key, value);
  }
  return () => {
    for (const [key] of Object.entries(updates)) {
      Reflect.set(appConfig.ai.huggingfaceEndpoints, key, Reflect.get(original, key));
    }
  };
};

let restoreInferenceConfig: (() => void) | null = null;

beforeEach(() => {
  restoreInferenceConfig?.();
  restoreInferenceConfig = withInferenceConfig({
    enabled: true,
    chatModel: "HuggingFaceH4/zephyr-7b-beta",
    imageModel: "stabilityai/stable-diffusion-xl-base-1.0",
    baseUrl: "https://api-inference.huggingface.co",
  });
});

afterEach(() => {
  restoreInferenceConfig?.();
  restoreInferenceConfig = null;
});

describe("huggingface inference provider", () => {
  test("chat returns parsed text from HF text-generation response", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(
        async () =>
          new Response(JSON.stringify([{ generated_text: "Hello from HF!" }]), {
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.text).toBe("Hello from HF!");
  });

  test("chat returns retryable failure on HTTP 429", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("Rate limited", { status: 429 })),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.retryable).toBe(true);
  });

  test("chat returns retryable failure on HTTP 500", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("Server error", { status: 500 })),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.retryable).toBe(true);
  });

  test("chat returns non-retryable failure on HTTP 401", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("Unauthorized", { status: 401 })),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.retryable).toBe(false);
  });

  test("huggingface endpoints provider uses configured chat endpoint URL", async () => {
    const restoreEndpoints = withEndpointConfig({
      enabled: true,
      chatUrl: "https://example.com/hf/chat",
      imageUrl: null,
    });

    const provider = new HuggingFaceInferenceProvider(
      "huggingface-endpoints",
      createFetchStub(async (input) => {
        expect(String(input)).toBe("https://example.com/hf/chat");
        return new Response(JSON.stringify([{ generated_text: "Endpoint path response" }]), {
          headers: { "content-type": "application/json" },
        });
      }),
    );

    try {
      const result = await provider.chat({
        messages: [{ role: "user", content: "hello endpoints" }],
      });

      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      expect(result.text).toBe("Endpoint path response");
    } finally {
      restoreEndpoints();
    }
  });

  test("huggingface endpoints provider rejects chat without endpoint URL", async () => {
    const restoreEndpoints = withEndpointConfig({
      enabled: true,
      chatUrl: null,
      imageUrl: null,
    });

    const provider = new HuggingFaceInferenceProvider(
      "huggingface-endpoints",
      createFetchStub(async () => new Response("")),
    );

    try {
      const result = await provider.chat({
        messages: [{ role: "user", content: "hello endpoints" }],
      });

      expect(result.ok).toBe(false);
      if (result.ok) {
        return;
      }
      expect(result.error).toContain("HF chat endpoint is not configured.");
      expect(result.retryable).toBe(false);
    } finally {
      restoreEndpoints();
    }
  });

  test("chat returns retryable failure on invalid response payload", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(
        async () =>
          new Response(JSON.stringify([{ unexpected_field: "no generated_text here" }]), {
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("invalid text-generation response payload");
    expect(result.retryable).toBe(true);
  });

  test("generateImage returns image bytes from successful response", async () => {
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          readonly inputs?: string;
          readonly parameters?: {
            readonly width?: number;
            readonly height?: number;
            readonly num_inference_steps?: number;
            readonly guidance_scale?: number;
          };
        };

        expect(body.inputs).toBe("A beautiful sunset over mountains");
        expect(body.parameters?.width).toBe(appConfig.ai.imageGenerationPortraitWidthPx);
        expect(body.parameters?.height).toBe(appConfig.ai.imageGenerationPortraitHeightPx);
        expect(body.parameters?.num_inference_steps).toBe(appConfig.ai.imageGenerationSteps);
        expect(body.parameters?.guidance_scale).toBe(appConfig.ai.imageGenerationGuidanceScale);

        return new Response(imageBytes, {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      }),
    );

    const result = await provider.generateImage({
      prompt: "A beautiful sunset over mountains",
      aspectRatio: "portrait",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.image).toBeInstanceOf(Uint8Array);
    expect(result.image.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe("image/png");
  });

  test("generateImage returns retryable failure on HTTP 503 (model loading)", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(
        async () =>
          new Response(JSON.stringify({ error: "Model is currently loading" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const result = await provider.generateImage({
      prompt: "A castle in the sky",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.retryable).toBe(true);
  });

  test("generateImage rejects prompts exceeding max length", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("", { status: 200 })),
    );
    const longPrompt = "a".repeat(1001);

    const result = await provider.generateImage({ prompt: longPrompt });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("exceeds maximum length");
    expect(result.retryable).toBe(false);
  });

  test("detectCapabilities reports text-generation and image-generation", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("", { status: 200 })),
    );

    const capabilities = await provider.detectCapabilities();

    expect(capabilities.length).toBe(2);
    const textCap = capabilities.find((c) => c.capabilities.has("text-generation"));
    const imageCap = capabilities.find((c) => c.capabilities.has("image-generation"));
    expect(textCap).toBeDefined();
    expect(imageCap).toBeDefined();
    expect(textCap?.integration).toBe("huggingface-inference");
    expect(imageCap?.integration).toBe("huggingface-inference");
    expect(textCap?.runtime).toBe("hf-inference-http");
  });

  test("detectCapabilities omits image-generation when the image model probe fails", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async (input) => {
        const url = String(input);
        if (url.includes(encodeURIComponent(appConfig.ai.huggingfaceInference.imageModel))) {
          return new Response("", { status: 404 });
        }

        return new Response("", { status: 200 });
      }),
    );

    const capabilities = await provider.detectCapabilities();

    expect(capabilities.some((entry) => entry.capabilities.has("text-generation"))).toBe(true);
    expect(capabilities.some((entry) => entry.capabilities.has("image-generation"))).toBe(false);
  });

  test("isAvailable returns false when provider is disabled", async () => {
    restoreInferenceConfig?.();
    restoreInferenceConfig = withInferenceConfig({ enabled: false });
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("")),
    );

    const available = await provider.isAvailable();
    expect(available).toBe(false);
  });

  test("synthesizeSpeech returns unsupported failure", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => new Response("")),
    );

    const result = await provider.synthesizeSpeech({ text: "hello" });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("not supported");
    expect(result.retryable).toBe(false);
  });

  test("chat returns retryable failure on network error", async () => {
    const provider = new HuggingFaceInferenceProvider(
      "huggingface-inference",
      createFetchStub(async () => {
        throw new Error("Network unreachable");
      }),
    );

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.retryable).toBe(true);
  });
});

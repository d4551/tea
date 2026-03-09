import { describe, expect, test } from "bun:test";
import { appConfig } from "../src/config/environment.ts";
import { TransformersProvider } from "../src/domain/ai/providers/transformers-provider.ts";

type MutableAiConfig = {
  -readonly [Key in keyof typeof appConfig.ai]: (typeof appConfig.ai)[Key];
};

describe("transformers provider adapter", () => {
  test("maps typed local text-generation results back to AiGenerationResult", async () => {
    const provider = new TransformersProvider(async () => ({
      isReady: true,
      analyzeSentimentResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "sentiment.classify",
        },
      }),
      generateOracle: async () => null,
      generateTextResult: async () => ({
        ok: true,
        value: { text: "oracle response" },
      }),
      transcribeAudioResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "speech-to-text.transcribe",
        },
      }),
      synthesizeSpeechResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "text-to-speech.synthesize",
        },
      }),
      generateEmbeddingResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "embeddings.generate",
        },
      }),
      dispose: async () => {},
    }));

    const result = await provider.chat({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.text).toBe("oracle response");
  });

  test("maps typed transcription failures to retryable AI failures", async () => {
    const provider = new TransformersProvider(async () => ({
      isReady: true,
      analyzeSentimentResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "sentiment.classify",
        },
      }),
      generateOracle: async () => null,
      generateTextResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "oracle.generate",
        },
      }),
      transcribeAudioResult: async () => ({
        ok: false,
        failure: {
          code: "timeout",
          message: "local speech timed out",
          retryable: true,
          operation: "speech-to-text.transcribe",
        },
      }),
      synthesizeSpeechResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "text-to-speech.synthesize",
        },
      }),
      generateEmbeddingResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "embeddings.generate",
        },
      }),
      dispose: async () => {},
    }));

    const result = await provider.transcribeAudio({
      audio: new Float32Array([0, 0, 0]),
      sampleRate: 16_000,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toBe("local speech timed out");
    expect(result.retryable).toBe(true);
  });

  test("unwraps typed local embeddings back to the provider embedding contract", async () => {
    const aiConfig = appConfig.ai as MutableAiConfig;
    const originalEmbeddingsEnabled = aiConfig.localEmbeddingsEnabled;
    aiConfig.localEmbeddingsEnabled = true;

    const provider = new TransformersProvider(async () => ({
      isReady: true,
      analyzeSentimentResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "sentiment.classify",
        },
      }),
      generateOracle: async () => null,
      generateTextResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "oracle.generate",
        },
      }),
      transcribeAudioResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "speech-to-text.transcribe",
        },
      }),
      synthesizeSpeechResult: async () => ({
        ok: false,
        failure: {
          code: "unexpected",
          message: "unused",
          retryable: false,
          operation: "text-to-speech.synthesize",
        },
      }),
      generateEmbeddingResult: async () => ({
        ok: true,
        value: {
          embedding: new Float32Array([0.25, 0.5, 0.75]),
        },
      }),
      dispose: async () => {},
    }));

    try {
      const result = await provider.generateEmbedding("tea");

      expect(result).toEqual(new Float32Array([0.25, 0.5, 0.75]));
    } finally {
      aiConfig.localEmbeddingsEnabled = originalEmbeddingsEnabled;
    }
  });
});

import { describe, expect, test } from "bun:test";
import { AiAuthoringService } from "../src/domain/builder/ai-authoring.ts";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiImageGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiToolPlanResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "../src/domain/ai/providers/provider-types.ts";

class StubAiProvider implements AiProvider {
  public readonly name = "stub";

  public constructor(private readonly text: string) {}

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async readiness(): Promise<"ready" | "degraded" | "offline"> {
    return "ready";
  }

  public async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    return [
      {
        provider: "stub",
        model: "stub-model",
        capabilities: new Set<AiCapability>(["chat"]),
        maxContextLength: 1024,
        supportsStreaming: false,
        runtime: "onnx-cpu",
        integration: "huggingface",
        local: true,
        configurable: false,
      },
    ];
  }

  public async chat(_params: AiChatParams): Promise<AiGenerationResult> {
    return {
      ok: true,
      text: this.text,
      model: "stub-model",
      durationMs: 1,
    };
  }

  public async *chatStream(_params: AiChatParams): AsyncGenerator<string> {
    yield this.text;
  }

  public async classify(_text: string, _model?: string): Promise<AiClassificationResult | null> {
    return null;
  }

  public async transcribeAudio(
    _params: AiTranscriptionParams,
  ): Promise<AiTranscriptionResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async synthesizeSpeech(
    _params: AiSpeechSynthesisParams,
  ): Promise<AiSpeechSynthesisResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async describeImage(_image: Uint8Array, _prompt: string): Promise<AiGenerationResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async generateImage(): Promise<AiImageGenerationResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async generateEmbedding(_text: string): Promise<Float32Array | null> {
    return null;
  }

  public async planTools(): Promise<AiToolPlanResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async dispose(): Promise<void> {}
}

describe("AI authoring validation", () => {
  test("combat encounter generation rejects malformed JSON payloads", async () => {
    const service = new AiAuthoringService(
      new StubAiProvider('{ "id": 42, "sceneId": "intro", "enemies": [] }'),
    );

    const encounter = await service.generateCombatEncounter({
      sceneId: "intro",
      difficulty: "easy",
      playerLevel: 1,
    });

    expect(encounter).toBeNull();
  });

  test("item and cutscene generation filter malformed entries instead of casting them through", async () => {
    const itemService = new AiAuthoringService(
      new StubAiProvider(
        JSON.stringify([
          {
            id: "item-valid",
            labelKey: "item.valid.label",
            descriptionKey: "item.valid.description",
            category: "weapon",
            rarity: "rare",
            stackable: false,
            maxStack: 1,
            effects: { attack: 3 },
          },
          {
            id: "item-bad",
            labelKey: "item.bad.label",
            descriptionKey: "item.bad.description",
            category: "weapon",
            rarity: "rare",
            stackable: "nope",
            maxStack: 1,
            effects: {},
          },
        ]),
      ),
    );
    const cutsceneService = new AiAuthoringService(
      new StubAiProvider(
        JSON.stringify([
          {
            id: "step-valid",
            type: "dialogue",
            characterKey: "hero",
            textKey: "cutscene.hero.line",
            durationMs: 800,
            data: { emphasis: 1 },
          },
          {
            id: "step-bad",
            type: "dialogue",
            characterKey: "hero",
            textKey: "cutscene.hero.line",
            durationMs: "fast",
            data: {},
          },
        ]),
      ),
    );

    const items = await itemService.generateItemSet({
      theme: "forest",
      count: 2,
      rarity: "rare",
    });
    const cutscene = await cutsceneService.generateCutsceneScript({
      sceneId: "intro",
      characters: ["hero"],
      mood: "tense",
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("item-valid");
    expect(cutscene).toHaveLength(1);
    expect(cutscene[0]?.id).toBe("step-valid");
  });
});

import { createLogger } from "../../lib/logger.ts";
import { acceptUnknown, isRecord, safeJsonParse } from "../../shared/utils/safe-json.ts";
import type { AiChatParams, AiGenerationResult } from "../ai/providers/provider-types.ts";

const logger = createLogger("builder.ai-authoring");

/**
 * AI-generated combat encounter output.
 */
export interface GeneratedCombatEncounter {
  readonly id: string;
  readonly sceneId: string;
  readonly enemies: readonly {
    readonly characterKey: string;
    readonly level: number;
    readonly stats: Record<string, number>;
  }[];
  readonly rewards: {
    readonly xp: number;
    readonly gold: number;
    readonly items: readonly string[];
  };
  readonly difficulty: string;
}

/**
 * Typed result envelope for combat-encounter generation.
 */
export type GeneratedCombatEncounterResult =
  | {
      readonly ok: true;
      /** Parsed combat encounter payload. */
      readonly encounter: GeneratedCombatEncounter;
    }
  | {
      readonly ok: false;
      /** Error description from the provider or parser. */
      readonly error: string;
      /** Whether the caller should retry. */
      readonly retryable: boolean;
    };

/**
 * AI-generated inventory item output.
 */
export interface GeneratedInventoryItem {
  readonly id: string;
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly category: "weapon" | "armor" | "consumable" | "key" | "material";
  readonly rarity: string;
  readonly stackable: boolean;
  readonly maxStack: number;
  readonly effects: Record<string, number>;
}

/**
 * Typed result envelope for item-set generation.
 */
export type GeneratedItemSetResult =
  | {
      readonly ok: true;
      /** Parsed inventory items. */
      readonly items: readonly GeneratedInventoryItem[];
    }
  | {
      readonly ok: false;
      /** Error description from the provider or parser. */
      readonly error: string;
      /** Whether the caller should retry. */
      readonly retryable: boolean;
    };

/**
 * AI-generated cutscene script step output.
 */
export interface GeneratedCutsceneStep {
  readonly id: string;
  readonly type: "dialogue" | "camera" | "animation" | "wait";
  readonly characterKey: string | null;
  readonly textKey: string | null;
  readonly durationMs: number;
  readonly data: Record<string, unknown>;
}

/**
 * Typed result envelope for cutscene-script generation.
 */
export type GeneratedCutsceneScriptResult =
  | {
      readonly ok: true;
      /** Parsed cutscene steps. */
      readonly steps: readonly GeneratedCutsceneStep[];
    }
  | {
      readonly ok: false;
      /** Error description from the provider or parser. */
      readonly error: string;
      /** Whether the caller should retry. */
      readonly retryable: boolean;
    };

/**
 * Context for generating a combat encounter via AI.
 */
export interface CombatEncounterContext {
  /** User-authored instruction describing the encounter to generate. */
  readonly prompt: string;
  /** Optional scene identifier for encounter placement. */
  readonly sceneId?: string;
  /** Optional target difficulty tier when already known. */
  readonly difficulty?: "easy" | "normal" | "hard" | "boss";
  /** Optional expected player level when already known. */
  readonly playerLevel?: number;
}

/**
 * Context for generating an item set via AI.
 */
export interface ItemSetContext {
  /** User-authored instruction describing the item set to generate. */
  readonly prompt: string;
  /** Optional thematic category for generated items. */
  readonly theme?: string;
  /** Optional number of items to generate. */
  readonly count?: number;
  /** Optional rarity tier. */
  readonly rarity?: "common" | "uncommon" | "rare" | "legendary";
}

/**
 * Context for generating a cutscene script via AI.
 */
export interface CutsceneScriptContext {
  /** User-authored instruction describing the cutscene to generate. */
  readonly prompt: string;
  /** Optional scene where the cutscene occurs. */
  readonly sceneId?: string;
  /** Optional characters involved. */
  readonly characters?: readonly string[];
  /** Optional narrative mood. */
  readonly mood?: string;
}

/**
 * Context for generating an animation plan via AI.
 */
export interface AnimationPlanContext {
  /** Target asset identifier for the generated clips. */
  readonly targetId?: string;
  /** User-authored instruction describing the desired motion set. */
  readonly prompt: string;
}

/**
 * AI-generated animation clip suggestion.
 */
export interface GeneratedAnimationPlanClip {
  /** Stable clip identifier. */
  readonly id: string;
  /** Semantic state tag such as idle or walk. */
  readonly stateTag: string;
  /** Frame count for the proposed clip. */
  readonly frameCount: number;
  /** Playback speed in frames per second. */
  readonly playbackFps: number;
}

/**
 * AI-generated animation plan payload.
 */
export interface GeneratedAnimationPlan {
  /** Optional asset identifier the plan targets. */
  readonly targetId?: string;
  /** Suggested animation clips for the target asset. */
  readonly suggestedClips: readonly GeneratedAnimationPlanClip[];
}

/**
 * Typed result envelope for animation-plan generation.
 */
export type GeneratedAnimationPlanResult =
  | {
      readonly ok: true;
      /** Parsed animation plan payload. */
      readonly plan: GeneratedAnimationPlan;
    }
  | {
      readonly ok: false;
      /** Error description from the provider or parser. */
      readonly error: string;
      /** Whether the caller should retry. */
      readonly retryable: boolean;
    };

/**
 * Extracts a JSON block from a raw AI response string.
 *
 * @param raw AI response text.
 * @returns Parsed JSON value or null on failure.
 */
const extractJson = (raw: string): unknown | null => {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/u);
  const jsonStr = fencedMatch ? (fencedMatch[1]?.trim() ?? "") : raw.trim();
  return safeJsonParse<unknown | null>(jsonStr, null, acceptUnknown);
};

const isNumberRecord = (value: unknown): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every((entry) => typeof entry === "number");

const parseGeneratedCombatEncounter = (value: unknown): GeneratedCombatEncounter | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, sceneId, enemies, rewards, difficulty } = value;
  if (
    typeof id !== "string" ||
    typeof sceneId !== "string" ||
    !Array.isArray(enemies) ||
    !isRecord(rewards) ||
    typeof difficulty !== "string"
  ) {
    return null;
  }

  const parsedEnemies = enemies
    .map((enemy) => {
      if (!isRecord(enemy)) {
        return null;
      }
      const { characterKey, level, stats } = enemy;
      if (
        typeof characterKey !== "string" ||
        typeof level !== "number" ||
        !Number.isFinite(level) ||
        !isNumberRecord(stats)
      ) {
        return null;
      }

      return {
        characterKey,
        level,
        stats,
      };
    })
    .filter((enemy): enemy is GeneratedCombatEncounter["enemies"][number] => enemy !== null);

  const rewardItems = rewards.items;
  if (
    parsedEnemies.length !== enemies.length ||
    typeof rewards.xp !== "number" ||
    typeof rewards.gold !== "number" ||
    !Array.isArray(rewardItems) ||
    !rewardItems.every((item) => typeof item === "string")
  ) {
    return null;
  }

  return {
    id,
    sceneId,
    enemies: parsedEnemies,
    rewards: {
      xp: rewards.xp,
      gold: rewards.gold,
      items: rewardItems,
    },
    difficulty,
  };
};

const parseGeneratedInventoryItem = (value: unknown): GeneratedInventoryItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, labelKey, descriptionKey, category, rarity, stackable, maxStack, effects } = value;
  if (
    typeof id !== "string" ||
    typeof labelKey !== "string" ||
    typeof descriptionKey !== "string" ||
    (category !== "weapon" &&
      category !== "armor" &&
      category !== "consumable" &&
      category !== "key" &&
      category !== "material") ||
    typeof rarity !== "string" ||
    typeof stackable !== "boolean" ||
    typeof maxStack !== "number" ||
    !Number.isFinite(maxStack) ||
    !isNumberRecord(effects)
  ) {
    return null;
  }

  return {
    id,
    labelKey,
    descriptionKey,
    category,
    rarity,
    stackable,
    maxStack,
    effects,
  };
};

const parseGeneratedCutsceneStep = (value: unknown): GeneratedCutsceneStep | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, type, characterKey, textKey, durationMs, data } = value;
  if (
    typeof id !== "string" ||
    (type !== "dialogue" && type !== "camera" && type !== "animation" && type !== "wait") ||
    (characterKey !== null && typeof characterKey !== "string") ||
    (textKey !== null && typeof textKey !== "string") ||
    typeof durationMs !== "number" ||
    !Number.isFinite(durationMs) ||
    !isRecord(data)
  ) {
    return null;
  }

  return {
    id,
    type,
    characterKey,
    textKey,
    durationMs,
    data,
  };
};

const parseGeneratedAnimationPlanClip = (value: unknown): GeneratedAnimationPlanClip | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, stateTag, frameCount, playbackFps } = value;
  if (
    typeof id !== "string" ||
    typeof stateTag !== "string" ||
    typeof frameCount !== "number" ||
    !Number.isFinite(frameCount) ||
    typeof playbackFps !== "number" ||
    !Number.isFinite(playbackFps)
  ) {
    return null;
  }

  return {
    id,
    stateTag,
    frameCount: Math.max(1, Math.floor(frameCount)),
    playbackFps: Math.max(1, Math.floor(playbackFps)),
  };
};

const parseGeneratedAnimationPlan = (value: unknown): GeneratedAnimationPlan | null => {
  if (!isRecord(value) || !Array.isArray(value.suggestedClips)) {
    return null;
  }

  const suggestedClips = value.suggestedClips
    .map((clip) => parseGeneratedAnimationPlanClip(clip))
    .filter((clip): clip is GeneratedAnimationPlanClip => clip !== null);

  if (suggestedClips.length === 0) {
    return null;
  }

  return {
    targetId: typeof value.targetId === "string" ? value.targetId : undefined,
    suggestedClips,
  };
};

interface AiAuthoringChatClient {
  readonly chat: (params: AiChatParams) => Promise<AiGenerationResult>;
}

type AiAuthoringChatDefaults = Pick<AiChatParams, "governance" | "costTier">;

const buildInstructionSegments = (
  entries: readonly (readonly [label: string, value: string | number | undefined])[],
): string[] =>
  entries.flatMap(([label, value]) => {
    if (value === undefined) {
      return [];
    }

    const normalized =
      typeof value === "number" ? String(value) : value.trim().length > 0 ? value.trim() : "";
    return normalized.length > 0 ? [`${label}: ${normalized}`] : [];
  });

/**
 * AI-assisted content authoring service.
 */
export class AiAuthoringService {
  /**
   * @param chatClient AI chat client used for generation.
   * @param defaultChatParams Optional governance defaults applied to every call.
   */
  public constructor(
    private readonly chatClient: AiAuthoringChatClient,
    private readonly defaultChatParams: AiAuthoringChatDefaults = {},
  ) {}

  /**
   * Generates a combat encounter using AI-driven content authoring.
   *
   * @param context Encounter generation context.
   * @returns Typed combat encounter result.
   */
  public async generateCombatEncounter(
    context: CombatEncounterContext,
  ): Promise<GeneratedCombatEncounterResult> {
    const systemPrompt = `You generate JSON combat encounters for a 2D RPG. Respond ONLY with a valid JSON object matching this schema:
{
  "id": string,
  "sceneId": string,
  "enemies": [{ "characterKey": string, "level": number, "stats": { "hp": number, "maxHp": number, "mp": number, "maxMp": number, "attack": number, "defense": number, "magicAttack": number, "magicDefense": number, "speed": number, "critRate": number, "critMultiplier": number } }],
  "rewards": { "xp": number, "gold": number, "items": string[] },
  "difficulty": string
}`;

    const promptLines = [
      `Primary request: ${context.prompt.trim()}`,
      ...buildInstructionSegments([
        ["Scene", context.sceneId],
        ["Difficulty", context.difficulty],
        ["Player level", context.playerLevel],
      ]),
    ];

    const result = await this.chatClient.chat({
      messages: [
        {
          role: "user",
          content: promptLines.join("\n"),
        },
      ],
      systemPrompt,
      ...this.defaultChatParams,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.combat.failed", { error: result.error });
      return {
        ok: false,
        error: result.error,
        retryable: result.retryable,
      };
    }

    const parsed = parseGeneratedCombatEncounter(extractJson(result.text));
    if (!parsed) {
      return {
        ok: false,
        error: "AI provider returned an invalid combat encounter payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      encounter: parsed,
    };
  }

  /**
   * Generates a set of inventory items using AI-driven content authoring.
   *
   * @param context Item generation context.
   * @returns Typed item-set result.
   */
  public async generateItemSet(context: ItemSetContext): Promise<GeneratedItemSetResult> {
    const systemPrompt = `You generate JSON inventory items for a 2D RPG. Respond ONLY with a JSON array of objects matching this schema:
[{ "id": string, "labelKey": string, "descriptionKey": string, "category": "weapon" | "armor" | "consumable" | "key" | "material", "rarity": string, "stackable": boolean, "maxStack": number, "effects": Record<string, number> }]`;

    const promptLines = [
      `Primary request: ${context.prompt.trim()}`,
      ...buildInstructionSegments([
        ["Theme", context.theme],
        ["Item count", context.count],
        ["Rarity", context.rarity],
      ]),
    ];

    const result = await this.chatClient.chat({
      messages: [
        {
          role: "user",
          content: promptLines.join("\n"),
        },
      ],
      systemPrompt,
      ...this.defaultChatParams,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.items.failed", { error: result.error });
      return {
        ok: false,
        error: result.error,
        retryable: result.retryable,
      };
    }

    const parsed = extractJson(result.text);
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        error: "AI provider returned an invalid item set payload",
        retryable: true,
      };
    }

    const items = parsed
      .map((item) => parseGeneratedInventoryItem(item))
      .filter((item): item is GeneratedInventoryItem => item !== null);

    if (items.length === 0) {
      return {
        ok: false,
        error: "AI provider returned an empty item set payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      items,
    };
  }

  /**
   * Generates a cutscene script using AI-driven content authoring.
   *
   * @param context Cutscene generation context.
   * @returns Typed cutscene-script result.
   */
  public async generateCutsceneScript(
    context: CutsceneScriptContext,
  ): Promise<GeneratedCutsceneScriptResult> {
    const systemPrompt = `You generate JSON cutscene scripts for a 2D RPG. Respond ONLY with a JSON array of step objects matching this schema:
[{ "id": string, "type": "dialogue" | "camera" | "animation" | "wait", "characterKey": string | null, "textKey": string | null, "durationMs": number, "data": Record<string, unknown> }]`;

    const promptLines = [
      `Primary request: ${context.prompt.trim()}`,
      ...buildInstructionSegments([
        ["Scene", context.sceneId],
        ["Characters", context.characters?.join(", ")],
        ["Mood", context.mood],
      ]),
    ];

    const result = await this.chatClient.chat({
      messages: [
        {
          role: "user",
          content: promptLines.join("\n"),
        },
      ],
      systemPrompt,
      ...this.defaultChatParams,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.cutscene.failed", { error: result.error });
      return {
        ok: false,
        error: result.error,
        retryable: result.retryable,
      };
    }

    const parsed = extractJson(result.text);
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        error: "AI provider returned an invalid cutscene script payload",
        retryable: true,
      };
    }

    const steps = parsed
      .map((step) => parseGeneratedCutsceneStep(step))
      .filter((step): step is GeneratedCutsceneStep => step !== null);

    if (steps.length === 0) {
      return {
        ok: false,
        error: "AI provider returned an empty cutscene script payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      steps,
    };
  }

  /**
   * Generates a structured animation plan for review and later clip creation.
   *
   * @param context Animation-plan generation context.
   * @returns Typed animation plan result.
   */
  public async generateAnimationPlan(
    context: AnimationPlanContext,
  ): Promise<GeneratedAnimationPlanResult> {
    const systemPrompt = `You generate JSON animation plans for a 2D RPG. Respond ONLY with a JSON object matching this schema:
{
  "targetId": string | undefined,
  "suggestedClips": [
    { "id": string, "stateTag": string, "frameCount": number, "playbackFps": number }
  ]
}`;

    const result = await this.chatClient.chat({
      messages: [
        {
          role: "user",
          content: `Generate an animation plan for target "${context.targetId ?? "unknown"}" using this request: "${context.prompt}". Return clip suggestions for idle and movement if appropriate.`,
        },
      ],
      systemPrompt,
      ...this.defaultChatParams,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.animation-plan.failed", { error: result.error });
      return {
        ok: false,
        error: result.error,
        retryable: result.retryable,
      };
    }

    const parsed = parseGeneratedAnimationPlan(extractJson(result.text));
    if (!parsed) {
      return {
        ok: false,
        error: "AI provider returned an invalid animation plan payload",
        retryable: true,
      };
    }

    return {
      ok: true,
      plan: {
        ...parsed,
        targetId: parsed.targetId ?? context.targetId,
      },
    };
  }
}

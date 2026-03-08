import { createLogger } from "../../lib/logger.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import type { AiProvider } from "../ai/providers/provider-types.ts";

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
 * Context for generating a combat encounter via AI.
 */
export interface CombatEncounterContext {
  /** Scene identifier for encounter placement. */
  readonly sceneId: string;
  /** Target difficulty tier. */
  readonly difficulty: "easy" | "normal" | "hard" | "boss";
  /** Expected player level. */
  readonly playerLevel: number;
}

/**
 * Context for generating an item set via AI.
 */
export interface ItemSetContext {
  /** Thematic category for generated items. */
  readonly theme: string;
  /** Number of items to generate. */
  readonly count: number;
  /** Rarity tier. */
  readonly rarity: "common" | "uncommon" | "rare" | "legendary";
}

/**
 * Context for generating a cutscene script via AI.
 */
export interface CutsceneScriptContext {
  /** Scene where the cutscene occurs. */
  readonly sceneId: string;
  /** Characters involved. */
  readonly characters: readonly string[];
  /** Narrative mood. */
  readonly mood: string;
}

/**
 * Extracts a JSON block from a raw AI response string.
 *
 * @param raw AI response text.
 * @returns Parsed JSON value or null on failure.
 */
const extractJson = (raw: string): unknown | null => {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fencedMatch ? (fencedMatch[1]?.trim() ?? "") : raw.trim();
  return safeJsonParse(jsonStr, null);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringRecord = (value: unknown): value is Record<string, number> =>
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
        !isStringRecord(stats)
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
    !isStringRecord(effects)
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

/**
 * AI-assisted content authoring service.
 *
 * Generates game content (encounters, items, cutscenes) by prompting an
 * AI provider with structured JSON schemas and parsing the results.
 */
export class AiAuthoringService {
  /**
   * @param provider AI provider to use for generation.
   */
  constructor(private readonly provider: AiProvider) {}

  /**
   * Generates a combat encounter using AI-driven content authoring.
   *
   * @param context Encounter generation context.
   * @returns Generated combat encounter or null on failure.
   */
  async generateCombatEncounter(
    context: CombatEncounterContext,
  ): Promise<GeneratedCombatEncounter | null> {
    const systemPrompt = `You generate JSON combat encounters for a 2D RPG. Respond ONLY with a valid JSON object matching this schema:
{
  "id": string,
  "sceneId": string,
  "enemies": [{ "characterKey": string, "level": number, "stats": { "hp": number, "maxHp": number, "mp": number, "maxMp": number, "attack": number, "defense": number, "magicAttack": number, "magicDefense": number, "speed": number, "critRate": number, "critMultiplier": number } }],
  "rewards": { "xp": number, "gold": number, "items": string[] },
  "difficulty": string
}`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate a ${context.difficulty} combat encounter for scene "${context.sceneId}" targeting player level ${context.playerLevel}.`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.combat.failed", { error: result.error });
      return null;
    }

    return parseGeneratedCombatEncounter(extractJson(result.text));
  }

  /**
   * Generates a set of inventory items using AI-driven content authoring.
   *
   * @param context Item generation context.
   * @returns Generated items or empty array on failure.
   */
  async generateItemSet(context: ItemSetContext): Promise<readonly GeneratedInventoryItem[]> {
    const systemPrompt = `You generate JSON inventory items for a 2D RPG. Respond ONLY with a JSON array of objects matching this schema:
[{ "id": string, "labelKey": string, "descriptionKey": string, "category": "weapon" | "armor" | "consumable" | "key" | "material", "rarity": string, "stackable": boolean, "maxStack": number, "effects": Record<string, number> }]`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate ${context.count} ${context.rarity} items with theme "${context.theme}".`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.items.failed", { error: result.error });
      return [];
    }

    const parsed = extractJson(result.text);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => parseGeneratedInventoryItem(item))
      .filter((item): item is GeneratedInventoryItem => item !== null);
  }

  /**
   * Generates a cutscene script using AI-driven content authoring.
   *
   * @param context Cutscene generation context.
   * @returns Generated cutscene steps or empty array on failure.
   */
  async generateCutsceneScript(
    context: CutsceneScriptContext,
  ): Promise<readonly GeneratedCutsceneStep[]> {
    const systemPrompt = `You generate JSON cutscene scripts for a 2D RPG. Respond ONLY with a JSON array of step objects matching this schema:
[{ "id": string, "type": "dialogue" | "camera" | "animation" | "wait", "characterKey": string | null, "textKey": string | null, "durationMs": number, "data": Record<string, unknown> }]`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate a cutscene script for scene "${context.sceneId}" involving characters [${context.characters.join(", ")}] with a ${context.mood} mood.`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.cutscene.failed", { error: result.error });
      return [];
    }

    const parsed = extractJson(result.text);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((step) => parseGeneratedCutsceneStep(step))
      .filter((step): step is GeneratedCutsceneStep => step !== null);
  }
}

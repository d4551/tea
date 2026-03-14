import { describe, expect, test } from "bun:test";
import {
  buildNpcGreetingResourceKey,
  buildNpcLabelResourceKey,
  buildSceneTitleResourceKey,
  deriveNpcIdentity,
  deriveSceneIdentity,
  normalizeBuilderIdentifier,
  resolveCreatorFacingText,
} from "../src/domain/builder/builder-display.ts";

describe("builder display helpers", () => {
  test("derives stable ids from creator-facing scene titles", () => {
    expect(deriveSceneIdentity({ displayTitle: "Yangtze Tea House" })).toEqual({
      id: "yangtzeTeaHouse",
      titleKey: "scene.yangtzeTeaHouse.title",
    });
  });

  test("derives stable ids from creator-facing character names", () => {
    expect(deriveNpcIdentity({ displayName: "River Pilot" })).toEqual({
      characterKey: "riverPilot",
      labelKey: "npc.riverPilot.label",
      greetLineKey: "npc.riverPilot.greet",
    });
  });

  test("builds canonical resource keys from stable builder identifiers", () => {
    expect(buildSceneTitleResourceKey("teaHouse")).toBe("scene.teaHouse.title");
    expect(buildNpcLabelResourceKey("riverPilot")).toBe("npc.riverPilot.label");
    expect(buildNpcGreetingResourceKey("riverPilot")).toBe("npc.riverPilot.greet");
  });

  test("resolves creator-facing text without exposing resource keys", () => {
    expect(
      resolveCreatorFacingText("scene.teaHouse.title", "scene.teaHouse.title", "teaHouse"),
    ).toBe("Tea House");
    expect(resolveCreatorFacingText("Yangtze Tea House", "Yangtze Tea House", "teaHouse")).toBe(
      "Yangtze Tea House",
    );
  });

  test("normalizes builder identifiers into lower camel case", () => {
    expect(normalizeBuilderIdentifier("Tea House Market")).toBe("teaHouseMarket");
    expect(normalizeBuilderIdentifier("  ")).toBe("");
  });
});

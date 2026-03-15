import { describe, expect, test } from "bun:test";
import { getMessages } from "../../shared/i18n/translator.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";

describe("buildBuilderJourneyConfig", () => {
  test("builds journey config for the visuals stage with correct navigation", () => {
    const locale = "en-US";
    const messages = getMessages(locale);
    const config = buildBuilderJourneyConfig(messages, locale, "default", "visuals");

    expect(config.activeStepKey).toBe("visuals");
    expect(config.ariaLabel).toBe(messages.builder.creatorWorkflowTitle);
    expect(config.steps.some((step) => step.key === "visuals")).toBe(true);
    expect(config.steps.some((step) => step.key === "rules")).toBe(true);
    expect(config.breadcrumbs?.[0]?.label).toBe(messages.builder.title);
    expect(config.breadcrumbs?.[0]?.href).toBe("/projects/default/start?lang=en-US");
    expect(config.previousStep?.label).toBe(messages.builder.scenes);
    expect(config.nextStep?.label).toBe(messages.builder.npcs);
  });

  test("routes the start step to the dashboard instead of the world workspace", () => {
    const locale = "en-US";
    const messages = getMessages(locale);
    const config = buildBuilderJourneyConfig(messages, locale, "default", "world");

    expect(config.steps[0]?.key).toBe("start");
    expect(config.steps[0]?.href).toBe("/projects/default/start?lang=en-US");
    expect(config.previousStep?.href).toBe("/projects/default/start?lang=en-US");
  });
});

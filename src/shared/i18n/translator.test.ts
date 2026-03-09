import { describe, expect, test } from "bun:test";
import { resolveRequestI18n, resolveRequestI18nWithOverride } from "./translator.ts";

describe("translator", () => {
  test("prefers weighted Accept-Language matches when no explicit query is present", () => {
    const request = new Request("http://localhost/", {
      headers: {
        "accept-language": "fr-FR;q=0.4, zh-CN;q=0.9, en-US;q=0.7",
      },
    });

    const context = resolveRequestI18n(request);

    expect(context.locale).toBe("zh-CN");
    expect(context.localeConfig.source).toBe("accept-language");
    expect(context.localeConfig.requestedLocale).toBe("zh-CN");
  });

  test("tracks explicit overrides separately from query and header negotiation", () => {
    const request = new Request("http://localhost/?lang=en-US", {
      headers: {
        "accept-language": "en-US,en;q=0.8",
      },
    });

    const context = resolveRequestI18nWithOverride(request, "zh-CN");

    expect(context.locale).toBe("zh-CN");
    expect(context.localeConfig.source).toBe("override");
    expect(context.localeConfig.requestedLocale).toBe("zh-CN");
  });
});

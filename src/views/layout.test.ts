import { describe, expect, test } from "bun:test";
import { appConfig } from "../config/environment.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { type LayoutContext, renderDocument } from "./layout.ts";

describe("renderDocument", () => {
  test("emits the shared progressive-enhancement shell with locale-aware labels", () => {
    const locale = "zh-CN";
    const messages = getMessages(locale);
    const layout: LayoutContext = {
      locale,
      messages,
      activeRoute: "home",
      currentPathWithQuery: "/?lang=zh-CN",
    };

    const html = renderDocument(layout, messages.pages.home.title, "<section>body</section>");

    expect(html).toContain('lang="zh-CN"');
    expect(html).toContain(`data-theme="${appConfig.ui.defaultTheme}"`);
    expect(html).toContain('hx-ext="layout-controls,focus-panel"');
    expect(html).toContain(messages.common.skipToContent);
    expect(html).toContain(messages.common.openAiAssistant);
  });
});

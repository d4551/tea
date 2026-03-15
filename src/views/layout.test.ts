import { describe, expect, test } from "bun:test";
import { appConfig } from "../config/environment.ts";
import { createStarterProjectBranding } from "../shared/branding/project-branding.ts";
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
    expect(html).toContain(messages.navigation.controlPlane);
  });

  test("applies project branding to document metadata and theme scope", () => {
    const locale = "en-US";
    const messages = getMessages(locale);
    const brand = createStarterProjectBranding("2d-game");
    const layout: LayoutContext = {
      locale,
      messages,
      activeRoute: "builder",
      currentPathWithQuery: "/projects/default/start?lang=en-US",
      brand,
    };

    const html = renderDocument(layout, "Start Here", "<section>body</section>");

    expect(html).toContain(`data-theme="${brand.surfaceTheme}"`);
    expect(html).toContain('data-theme-lock="project"');
    expect(html).toContain(`style="--app-heading-font:`);
    expect(html).toContain(`<title>Start Here · ${brand.appName}</title>`);
    expect(html).toContain(`content="${brand.appSubtitle}"`);
  });
});

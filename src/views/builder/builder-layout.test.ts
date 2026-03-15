import { describe, expect, test } from "bun:test";
import { createStarterProjectBranding } from "../../shared/branding/project-branding.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import {
  type BuilderChromeProject,
  renderBuilderLayout,
  renderConsoleLayout,
  renderConsoleSidebar,
} from "./builder-layout.ts";

const project: BuilderChromeProject = {
  id: "default",
  branding: createStarterProjectBranding("tea-house-story"),
  version: 7,
  latestReleaseVersion: 4,
  publishedReleaseVersion: 4,
  published: true,
  lastUpdatedAtMs: Date.UTC(2026, 2, 15, 9, 30, 0),
};

describe("renderBuilderLayout", () => {
  test("renders a responsive builder shell with safe-area dock spacing and project-aware links", () => {
    const locale = "en-US";
    const messages = getMessages(locale);
    const html = renderBuilderLayout({
      locale,
      messages,
      activeTab: "assets",
      currentPath: "/projects/default/assets",
      projectId: project.id,
      project,
      body: "<section>Workspace</section>",
      navCounts: { assets: 3 },
    });

    expect(html).toContain('for="main-nav-drawer"');
    expect(html).toContain('id="builder-content"');
    expect(html).toContain("pb-[calc(8.5rem+env(safe-area-inset-bottom))]");
    expect(html).toContain('class="dock dock-sm fixed inset-x-0 bottom-0 z-30');
    expect(html).toContain("pb-[env(safe-area-inset-bottom)]");
    expect(html).toContain(`aria-label="${messages.builder.title}"`);
    expect(html).toContain("/projects/default/assets?lang=en-US");
    expect(html).toContain("/projects/default/playtest?lang=en-US");
    expect(html).toContain("dock-active");
    expect(html).toContain(">Art &amp; Audio<");
    expect(html).toContain(`role="status" aria-label="${messages.builder.statusBarProject}"`);
    expect(html).toContain("/projects/default/start?lang=en-US");
    expect(html).toContain("/projects/default/settings?lang=en-US");
    expect(html).toContain("/projects/default/operations?lang=en-US");
    expect(html).toContain("/projects/default/playtest?lang=en-US");
    expect(html).toContain("/games?lang=en-US&amp;projectId=default");
    expect(html).toContain("River Tea Chronicle");
  });

  test("renders grouped console navigation with fragment-safe workbench links", () => {
    const locale = "en-US";
    const messages = getMessages(locale);
    const sidebarHtml = renderConsoleSidebar({
      locale,
      messages,
      activeTab: "settings",
      currentPath: "/projects/default/settings",
      projectId: project.id,
      project,
      body: "<section>Console</section>",
    });
    const layoutHtml = renderConsoleLayout({
      locale,
      messages,
      activeTab: "settings",
      currentPath: "/projects/default/settings",
      projectId: project.id,
      project,
      body: "<section>Console</section>",
    });

    expect(sidebarHtml).toContain(`>${messages.builder.projectSettings}<`);
    expect(sidebarHtml).toContain(`>${messages.builder.operations}<`);
    expect(sidebarHtml).toContain(`>${messages.builder.navGroupRuntime}<`);
    expect(sidebarHtml).toContain(
      "/projects/default/settings?lang=en-US#builder-brand-control-plane",
    );
    expect(sidebarHtml).toContain(
      "/projects/default/settings?lang=en-US#builder-knowledge-workspace",
    );
    expect(sidebarHtml).toContain(
      "/projects/default/settings?lang=en-US#builder-provider-workbench",
    );
    expect(sidebarHtml).toContain("/projects/default/settings?lang=en-US#builder-model-catalog");
    expect(sidebarHtml).toContain("/projects/default/settings?lang=en-US#builder-patch-preview");
    expect(sidebarHtml).toContain("/projects/default/operations?lang=en-US#builder-review-queue");
    expect(sidebarHtml).toContain(
      "/projects/default/operations?lang=en-US#builder-automation-composer",
    );
    expect(layoutHtml).toContain("/projects/default/start?lang=en-US");
    expect(layoutHtml).toContain("/projects/default/settings?lang=en-US");
    expect(layoutHtml).toContain("/projects/default/operations?lang=en-US");
    expect(layoutHtml).toContain("/projects/default/playtest?lang=en-US");
  });
});

import { describe, expect, test } from "bun:test";
import { getMessages } from "../../shared/i18n/translator.ts";
import { type BuilderChromeProject, renderBuilderLayout } from "./builder-layout.ts";

const project: BuilderChromeProject = {
  id: "default",
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
  });
});

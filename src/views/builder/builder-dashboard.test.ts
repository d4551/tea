import { describe, expect, test } from "bun:test";
import type { CreatorDashboardContext } from "../../shared/contracts/game.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderBuilderDashboard } from "./builder-dashboard.ts";

const dashboardContext: CreatorDashboardContext = {
  activeSessions: 2,
  totalScenes: 4,
  assetCount: 9,
  animationClipCount: 3,
  totalNpcs: 5,
  dialogueGraphCount: 6,
  questCount: 2,
  published: true,
  draftVersion: 7,
  latestReleaseVersion: 4,
  publishedReleaseVersion: 4,
  creatorCapabilities: {
    items: [
      {
        key: "dialogue-generation",
        label: "Authoring Assistant",
        status: "ready",
        mode: "provider",
      },
    ],
  },
};

describe("renderBuilderDashboard", () => {
  test("renders locale-aware dashboard and workbench links", () => {
    const html = renderBuilderDashboard(
      getMessages("en-US"),
      "en-US",
      dashboardContext,
      "default",
      true,
    );

    expect(html).toContain("/projects/default/world?lang=en-US");
    expect(html).toContain("/projects/default/characters?lang=en-US");
    expect(html).toContain("/projects/default/story?lang=en-US");
    expect(html).toContain("/projects/default/assets?lang=en-US");
    expect(html).toContain("/projects/default/systems?lang=en-US");
    expect(html).toContain("/projects/default/settings?lang=en-US");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-brand-control-plane");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-knowledge-workspace");
    expect(html).toContain("/projects/default/settings?lang=en-US#builder-provider-workbench");
    expect(html).toContain("/projects/default/operations?lang=en-US");
    expect(html).toContain("/projects/default/operations?lang=en-US#builder-review-queue");
    expect(html).toContain("/projects/default/playtest?lang=en-US");
  });

  test("renders responsive workspace shell structure", () => {
    const html = renderBuilderDashboard(
      getMessages("en-US"),
      "en-US",
      dashboardContext,
      "default",
      true,
    );

    expect(html).toContain('class="overflow-x-auto pb-1"');
    expect(html).toContain("xl:grid-cols-[22rem_minmax(0,1fr)]");
    expect(html).toContain("2xl:grid-cols-[22rem_minmax(0,1fr)_22rem]");
    expect(html).toContain("sm:grid-cols-2 xl:grid-cols-4");
  });
});

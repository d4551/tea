import { describe, expect, test } from "bun:test";
import type { ControlPlaneSnapshot } from "../../shared/contracts/platform-control-plane.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderControlPlanePage } from "./control-plane.ts";

const snapshot: ControlPlaneSnapshot = {
  games: [
    {
      id: "harbor",
      name: "Harbor Lights",
      subtitle: "Investigation RPG",
      scope: {
        scope: "project",
        scopeId: "harbor",
        label: "Harbor Lights",
      },
      version: 4,
      latestReleaseVersion: 2,
      publishedReleaseVersion: 2,
      published: true,
      templateId: "2d-game",
      lastUpdatedAtMs: 1_710_000_000_000,
      sceneCount: 3,
      assetCount: 12,
      reviewCount: 2,
    },
  ],
  libraries: [
    {
      id: "global-shared-assets",
      scope: {
        scope: "global",
        scopeId: "global-shared-assets",
        label: "Global",
      },
      name: "Shared runtime assets",
      description: "Approved assets ready for reuse.",
      assetCount: 8,
      attachedProjectCount: 1,
    },
  ],
  sharedAssets: [
    {
      id: "harbor:lantern",
      libraryId: "global-shared-assets",
      label: "Lantern",
      kind: "portrait",
      sceneMode: "2d",
      source: "/assets/lantern.png",
      approved: true,
      scope: {
        scope: "project",
        scopeId: "harbor",
        label: "Harbor Lights",
      },
      attachments: [
        {
          projectId: "harbor",
          source: {
            scope: "project",
            scopeId: "harbor",
            label: "Harbor Lights",
          },
          label: "runtime-ready",
        },
      ],
    },
  ],
  templates: [
    {
      id: "2d-game",
      scope: {
        scope: "global",
        scopeId: "starter-template:2d-game",
        label: "Global",
      },
      name: "2d Game",
      description: "Baseline 2D template.",
      starterTemplateId: "2d-game",
      defaultSceneMode: "2d",
      recommended: false,
    },
  ],
  capabilityProfiles: [
    {
      id: "transformers-local",
      scope: {
        scope: "global",
        scopeId: "transformers-local",
        label: "Global",
      },
      name: "Transformers Local",
      description: "Local runtime policy.",
      status: "ready",
      settingCount: 4,
      readyLaneCount: 1,
      issueLaneCount: 0,
      lanes: ["transformers-local"],
    },
  ],
  releases: [
    {
      id: "harbor:v2",
      projectId: "harbor",
      projectName: "Harbor Lights",
      scope: {
        scope: "release",
        scopeId: "harbor:v2",
        label: "Harbor Lights v2",
      },
      version: 2,
      published: true,
      updatedAtMs: 1_710_000_000_000,
    },
  ],
  reviewQueue: [
    {
      id: "artifact:harbor:lantern",
      projectId: "harbor",
      projectName: "Harbor Lights",
      scope: {
        scope: "project",
        scopeId: "harbor",
        label: "Harbor Lights",
      },
      lane: "artifact",
      title: "Lantern concept",
      summary: "Awaiting approval",
      status: "pending-review",
      createdAtMs: 1_710_000_000_000,
    },
  ],
  globalKnowledgeDocumentCount: 5,
};

describe("renderControlPlanePage", () => {
  test("renders workspace tabs and focused project actions", () => {
    const messages = getMessages("en-US");

    const html = renderControlPlanePage({
      messages,
      locale: "en-US",
      workspace: "games",
      snapshot,
      projectId: "harbor",
    });

    expect(html).toContain(messages.navigation.controlPlane);
    expect(html).toContain(messages.pages.controlPlane.gamesTitle);
    expect(html).toContain(messages.pages.controlPlane.librariesTitle);
    expect(html).toContain(messages.pages.controlPlane.focusedProjectLabel);
    expect(html).toContain("/games?lang=en-US&amp;projectId=harbor");
    expect(html).toContain("/projects/harbor/start?lang=en-US");
    expect(html).toContain("/projects/harbor/settings?lang=en-US#builder-brand-control-plane");
    expect(html).toContain(
      'class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1 pb-1"',
    );
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("xl:grid-cols-[22rem_minmax(0,1fr)]");
    expect(html).toContain("2xl:grid-cols-[22rem_minmax(0,1fr)_22rem]");
  });

  test("renders review queue items in the review workspace", () => {
    const messages = getMessages("en-US");

    const html = renderControlPlanePage({
      messages,
      locale: "en-US",
      workspace: "review",
      snapshot,
      projectId: "harbor",
    });

    expect(html).toContain(messages.pages.controlPlane.reviewTitle);
    expect(html).toContain("Lantern concept");
    expect(html).toContain("/projects/harbor/operations?lang=en-US#builder-review-queue");
  });
});

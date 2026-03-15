import { describe, expect, test } from "bun:test";
import type { AutomationRun, GenerationArtifact } from "../../shared/contracts/game.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderAutomationPanel } from "./automation-panel.ts";

const countOccurrences = (html: string, value: string): number => html.split(value).length - 1;

const artifacts: ReadonlyArray<GenerationArtifact> = [
  {
    id: "artifact-1",
    jobId: "job-1",
    kind: "automation-evidence",
    label: "Builder smoke test",
    previewSource: "/evidence/builder-smoke-test.png",
    summary: "Builder shell rendered and navigation remained stable.",
    approved: false,
    createdAtMs: Date.UTC(2026, 2, 15, 11, 0, 0),
  },
];

const runs: ReadonlyArray<AutomationRun> = [
  {
    id: "run-1",
    status: "blocked_for_approval",
    goal: "Validate the builder console workbench",
    steps: [
      {
        id: "step-1",
        action: "browser",
        summary: "Capture builder shell evidence",
        status: "completed",
        evidenceSource: "/evidence/run-1-step-1.html",
      },
    ],
    artifactIds: ["artifact-1"],
    statusMessage: "waiting_for_review",
    createdAtMs: Date.UTC(2026, 2, 15, 10, 45, 0),
    updatedAtMs: Date.UTC(2026, 2, 15, 11, 5, 0),
  },
];

describe("renderAutomationPanel", () => {
  test("renders canonical operations workbench section targets exactly once", () => {
    const html = renderAutomationPanel(getMessages("en-US"), "en-US", "default", runs, artifacts);

    expect(countOccurrences(html, 'id="builder-automation-composer"')).toBe(1);
    expect(countOccurrences(html, 'id="builder-review-queue"')).toBe(1);
  });

  test("renders jump links and review queue content for the operations workbench", () => {
    const html = renderAutomationPanel(getMessages("en-US"), "en-US", "default", runs, artifacts);

    expect(html).toContain("/projects/default/operations?lang=en-US#builder-automation-composer");
    expect(html).toContain("/projects/default/operations?lang=en-US#builder-review-queue");
    expect(html).toContain("/projects/default/settings?lang=en-US");
    expect(html).toContain("/projects/default/playtest?lang=en-US");
    expect(html).toContain("Validate the builder console workbench");
    expect(html).toContain("Builder smoke test");
    expect(html).toContain("Approve");
    expect(html).toContain("Cancel");
  });
});

import { describe, expect, test } from "bun:test";
import {
  executeAutomationRun,
  executeGenerationJob,
} from "../src/domain/builder/creator-worker.ts";
import type { AutomationRun, GenerationJob } from "../src/shared/contracts/game.ts";

describe("creator worker execution", () => {
  test("generation jobs persist reviewable builder artifacts", async () => {
    const now = Date.now();
    const job: GenerationJob = {
      id: `job-${crypto.randomUUID()}`,
      kind: "portrait",
      status: "queued",
      prompt: "Create a tea-house keeper portrait",
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await executeGenerationJob(`worker-${crypto.randomUUID()}`, job);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.artifacts).toHaveLength(1);
    expect(result.data.artifacts[0]?.previewSource.includes("/public/uploads/builder/")).toBe(true);
    expect(result.data.artifacts[0]?.mimeType).toBe("image/png");
    expect(result.data.statusMessage).toBe("job.draft-ready-for-review");
  });

  test("automation runs produce auditable completed steps and evidence", async () => {
    const now = Date.now();
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Capture builder evidence for review",
      steps: [
        {
          id: "step.browser",
          action: "browser",
          summary: "Open the builder and capture evidence",
          status: "pending",
        },
        {
          id: "step.attach",
          action: "attach-file",
          summary: "Attach the captured evidence",
          status: "pending",
        },
      ],
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await executeAutomationRun(`worker-${crypto.randomUUID()}`, run);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.steps.every((step) => step.status === "completed")).toBe(true);
    expect(result.data.steps[0]?.evidenceSource?.includes("/public/uploads/builder/")).toBe(true);
    expect(result.data.artifacts).toHaveLength(1);
    expect(result.data.artifacts[0]?.previewSource.includes("/public/uploads/builder/")).toBe(true);
    expect(result.data.statusMessage).toBe("automation.plan-ready-for-review");
    expect(result.data.artifacts[0]?.summary).toBe("automation.artifact.captured-review-evidence");
  });
});

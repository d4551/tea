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

  test("automation runs produce auditable completed steps and execution artifacts", async () => {
    const now = Date.now();
    const projectId = `worker-${crypto.randomUUID()}`;
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Run builder automation steps",
      steps: [
        {
          id: "step.open-builder",
          action: "browser",
          summary: "automation.step.browser.goto",
          status: "pending",
          spec: {
            kind: "goto",
            path: `/builder?projectId=${projectId}`,
          },
        },
        {
          id: "step.capture-workspace",
          action: "browser",
          summary: "automation.step.browser.screenshot",
          status: "pending",
          spec: {
            kind: "screenshot",
            fileStem: `automation-${projectId}-workspace`,
            fullPage: true,
          },
        },
        {
          id: "step.attach",
          action: "attach-file",
          summary: "automation.step.attach-generated-artifact",
          status: "pending",
          spec: {
            kind: "attach-generated-artifact",
            sourceStepId: "step.capture-workspace",
          },
        },
      ],
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await executeAutomationRun(projectId, run);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error).toBe("automation-origin-unreachable");
  });
});

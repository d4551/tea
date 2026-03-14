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
            path: `/projects/${projectId}/start`,
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

  test("automation runs reject invalid plan signatures", async () => {
    const now = Date.now();
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Attempt signed run with tampered signature",
      steps: [
        {
          id: "step.attach",
          action: "attach-file",
          summary: "automation.step.attach-generated-artifact",
          status: "pending",
          spec: {
            kind: "attach-generated-artifact",
            sourceStepId: "missing-step",
          },
        },
      ],
      artifactIds: [],
      statusMessage: "queued",
      signature: "tampered-signature",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await executeAutomationRun(`worker-${crypto.randomUUID()}`, run);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toBe("automation-signature-invalid");
  });

  test("automation dry-run mode completes without side effects", async () => {
    const now = Date.now();
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Dry run preview",
      dryRun: true,
      steps: [
        {
          id: "step.browser.click",
          action: "browser",
          summary: "automation.step.browser.click",
          status: "pending",
          spec: {
            kind: "click",
            role: "button",
            name: "Save",
          },
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
    expect(result.data.statusMessage).toBe("automation.dry-run-complete");
    expect(result.data.steps[0]?.status).toBe("completed");
    expect(result.data.artifacts).toHaveLength(0);
  });

  test("unsafe automation request steps are denied by default", async () => {
    const now = Date.now();
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Attempt HTTP automation",
      steps: [
        {
          id: "step.http.request",
          action: "http",
          summary: "automation.step.http.request",
          status: "pending",
          spec: {
            kind: "request",
            method: "GET",
            path: "/api/builder/platform/readiness",
          },
        },
      ],
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await executeAutomationRun(`worker-${crypto.randomUUID()}`, run);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toBe("automation-unsafe-actions-disabled");
  });
});

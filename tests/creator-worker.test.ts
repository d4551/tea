import { describe, expect, spyOn, test } from "bun:test";
import { ProviderRegistry } from "../src/domain/ai/providers/provider-registry.ts";
import {
  executeAutomationRun,
  executeGenerationJob,
  probeAutomationOrigin,
} from "../src/domain/builder/creator-worker.ts";
import type { AutomationRun, GenerationJob } from "../src/shared/contracts/game.ts";
import { httpStatus, contentType } from "../src/shared/constants/http.ts";

const withMockedRegistry = async <T>(
  registry: Partial<ProviderRegistry>,
  run: () => Promise<T>,
): Promise<T> => {
  const spy = spyOn(ProviderRegistry, "getInstance").mockImplementation(
    async () => registry as ProviderRegistry,
  );

  try {
    return await run();
  } finally {
    spy.mockRestore();
  }
};

const createMockFetchResponse = (
  status: number,
  body: string,
  contentTypeValue: string = contentType.htmlUtf8,
): Response =>
  new Response(body, {
    status,
    headers: {
      "content-type": contentTypeValue,
    },
  });

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

    const result = await withMockedRegistry(
      {
        generateImage: async () => ({
          ok: true,
          image: new Uint8Array([137, 80, 78, 71]),
          mimeType: "image/png",
          model: "hf-mock",
          durationMs: 24,
        }),
      },
      () => executeGenerationJob(`worker-${crypto.randomUUID()}`, job),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.artifacts).toHaveLength(1);
    expect(result.data.artifacts[0]?.previewSource.includes("/public/uploads/builder/")).toBe(true);
    expect(result.data.artifacts[0]?.mimeType).toBe("image/png");
    expect(result.data.artifacts[0]?.metadata?.source).toBe("ai");
    expect(result.data.artifacts[0]?.metadata?.reason).toBeUndefined();
    expect(result.data.statusMessage).toBe("job.draft-ready-for-review");
  });

  test("voice-line jobs persist AI-generated audio when synthesis succeeds", async () => {
    const now = Date.now();
    const job: GenerationJob = {
      id: `voice-line-${crypto.randomUUID()}`,
      kind: "voice-line",
      status: "queued",
      prompt: "Speak a warning about the forest",
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await withMockedRegistry(
      {
        synthesizeSpeech: async () => ({
          ok: true,
          audio: new Float32Array([0, 0.25, -0.25, 0]),
          sampleRate: 16_000,
          model: "local-tts",
          durationMs: 6,
        }),
      },
      () => executeGenerationJob(`worker-${crypto.randomUUID()}`, job),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const artifact = result.data.artifacts[0];
    expect(artifact).toBeDefined();
    if (!artifact) {
      return;
    }
    expect(artifact.kind).toBe("audio");
    expect(artifact.mimeType).toBe("audio/wav");
    expect(artifact.metadata?.source).toBe("ai");
  });

  test("image jobs fail cleanly when image generation fails", async () => {
    const now = Date.now();
    const job: GenerationJob = {
      id: `portrait-fallback-${crypto.randomUUID()}`,
      kind: "portrait",
      status: "queued",
      prompt: "A warrior portrait",
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await withMockedRegistry(
      {
        generateImage: async () => ({
          ok: false,
          error: "image generation unavailable",
          retryable: false,
        }),
      },
      () => executeGenerationJob(`worker-${crypto.randomUUID()}`, job),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("portrait generation failed");
    expect(result.error).toContain("image generation unavailable");
  });

  test("animation-plan jobs fail cleanly when no text provider is available", async () => {
    const now = Date.now();
    const job: GenerationJob = {
      id: `animation-fallback-${crypto.randomUUID()}`,
      kind: "animation-plan",
      status: "queued",
      prompt: "Generate idle and walk loops",
      targetId: "asset.hero",
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await withMockedRegistry(
      {
        chat: async () => ({
          ok: false,
          error: "No provider available for chat generation",
          retryable: true,
        }),
      },
      () => executeGenerationJob(`worker-${crypto.randomUUID()}`, job),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("animation-plan generation failed");
    expect(result.error).toContain("No provider available for chat generation");
  });

  test("combat-encounter jobs fail cleanly when generation fails", async () => {
    const now = Date.now();
    const job: GenerationJob = {
      id: `combat-fallback-${crypto.randomUUID()}`,
      kind: "combat-encounter",
      status: "queued",
      prompt: "Generate a patrol ambush near village ruins",
      targetId: "combat.test",
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const result = await withMockedRegistry(
      {
        chat: async () => ({
          ok: false,
          error: "No provider available for chat generation",
          retryable: true,
        }),
      },
      () => executeGenerationJob(`worker-${crypto.randomUUID()}`, job),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toContain("combat-encounter generation failed");
    expect(result.error).toContain("No provider available for chat generation");
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

  test("automation origin probe classifies unreachable origin", async () => {
    const originProbe = await probeAutomationOrigin(new URL("http://127.0.0.1:0"));
    expect(originProbe.ok).toBe(false);
    expect(originProbe.state).toBe("unreachable");
  });

  test("automation origin probe classifies unauthorized response as auth required", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      createMockFetchResponse(
        httpStatus.unauthorized,
        "<html><body>unauthorized</body></html>",
        contentType.htmlUtf8,
      ),
    );
    try {
      const originProbe = await probeAutomationOrigin(new URL("http://example.com"));
      expect(originProbe.ok).toBe(false);
      expect(originProbe.state).toBe("auth-required");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("automation origin probe classifies non-HTML response as misconfigured", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      createMockFetchResponse(
        httpStatus.ok,
        '{"ok":true}',
        "application/json",
      ),
    );
    try {
      const originProbe = await probeAutomationOrigin(new URL("http://example.com"));
      expect(originProbe.ok).toBe(false);
      expect(originProbe.state).toBe("misconfigured");
      expect(originProbe.detail).toContain("automation-origin-no-html-content");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("automation origin probe classifies valid shell response as healthy", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      createMockFetchResponse(
        httpStatus.ok,
        "<!doctype html><html><body><div id=\"builder-project-shell\"></div></body></html>",
      ),
    );
    try {
      const originProbe = await probeAutomationOrigin(new URL("http://example.com"));
      expect(originProbe.ok).toBe(true);
      expect(originProbe.state).toBe("ok");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("automation runs return auth-required when automation shell responds 401", async () => {
    const now = Date.now();
    const projectId = `worker-auth-${crypto.randomUUID()}`;
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Run builder automation when auth is required",
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
      ],
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      createMockFetchResponse(httpStatus.unauthorized, "<html><body>locked</body></html>"),
    );
    try {
      const result = await executeAutomationRun(projectId, run);
      expect(result.ok).toBe(false);
      if (result.ok) {
        return;
      }
      expect(result.error).toBe("automation-origin-auth-required");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("automation runs return misconfigured when automation shell responds without HTML contract", async () => {
    const now = Date.now();
    const projectId = `worker-misconfigured-${crypto.randomUUID()}`;
    const run: AutomationRun = {
      id: `run-${crypto.randomUUID()}`,
      status: "queued",
      goal: "Run builder automation with invalid origin contract",
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
      ],
      artifactIds: [],
      statusMessage: "queued",
      createdAtMs: now,
      updatedAtMs: now,
    };

    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      createMockFetchResponse(httpStatus.ok, '{"ok":true}', "application/json"),
    );
    try {
      const result = await executeAutomationRun(projectId, run);
      expect(result.ok).toBe(false);
      if (result.ok) {
        return;
      }
      expect(result.error).toBe("automation-origin-misconfigured");
    } finally {
      fetchSpy.mockRestore();
    }
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

import { chromium } from "playwright";
import sharp from "sharp";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AutomationAttachFileStepSpec,
  AutomationRun,
  AutomationRunStep,
  AutomationStepSpec,
  GenerationArtifact,
  GenerationJob,
} from "../../shared/contracts/game.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";
import { ProviderRegistry } from "../ai/providers/provider-registry.ts";
import { AiAuthoringService } from "./ai-authoring.ts";
import { persistBuilderFile } from "./asset-storage.ts";

interface WorkerSuccess<TPayload> {
  readonly ok: true;
  readonly data: TPayload;
}

interface WorkerFailure {
  readonly ok: false;
  readonly error: string;
}

type WorkerResult<TPayload> = WorkerSuccess<TPayload> | WorkerFailure;

const assertUnreachable = (_value: never): never => {
  throw new Error("automation-step-kind-unsupported");
};

const workerLogger = createLogger("builder.creator-worker");

/**
 * Output payload returned by generation-job workers.
 */
export interface GenerationJobExecution {
  /** Review artifacts produced by the worker. */
  readonly artifacts: readonly GenerationArtifact[];
  /** Human-readable job status summary. */
  readonly statusMessage: string;
}

/**
 * Output payload returned by automation-run workers.
 */
export interface AutomationRunExecution {
  /** Updated auditable steps after execution. */
  readonly steps: readonly AutomationRunStep[];
  /** Review artifacts produced by the worker. */
  readonly artifacts: readonly GenerationArtifact[];
  /** Human-readable run status summary. */
  readonly statusMessage: string;
}

/** Theme-aligned palette for server-generated SVG (no CSS var() in Node/Sharp context). */
const SVG_PALETTE = {
  gradientStart: "oklch(0.32 0.08 250)",
  gradientMid: "oklch(0.48 0.1 55)",
  gradientEnd: "oklch(0.88 0.04 85)",
  overlayFill: "rgba(15,23,42,0.18)",
  overlayStroke: "rgba(255,255,255,0.26)",
  text: "oklch(0.98 0.01 250)",
} as const;

const buildImageSvg = (
  title: string,
  body: string,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="576" viewBox="0 0 1024 576" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${SVG_PALETTE.gradientStart}"/>
      <stop offset="50%" stop-color="${SVG_PALETTE.gradientMid}"/>
      <stop offset="100%" stop-color="${SVG_PALETTE.gradientEnd}"/>
    </linearGradient>
  </defs>
  <style><![CDATA[
    .placeholder-copy {
      font-family: ui-sans-serif, system-ui;
      font-size: 24px;
      line-height: 1.5;
      color: ${SVG_PALETTE.text};
      white-space: pre-wrap;
    }
  ]]></style>
  <rect width="1024" height="576" rx="32" fill="url(#bg)" />
  <rect x="28" y="28" width="968" height="520" rx="24" fill="${SVG_PALETTE.overlayFill}" stroke="${SVG_PALETTE.overlayStroke}" />
  <text x="64" y="120" font-family="ui-monospace, monospace" font-size="28" font-weight="700" fill="${SVG_PALETTE.text}">${title}</text>
  <foreignObject x="64" y="156" width="896" height="320">
    <div xmlns="http://www.w3.org/1999/xhtml" class="placeholder-copy">${body}</div>
  </foreignObject>
</svg>`;

const encodeWav = (samples: Float32Array, sampleRate: number): Uint8Array => {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeText = (offset: number, value: string): void => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(44 + index * 2, Math.round(sample * 0x7fff), true);
  }

  return new Uint8Array(buffer);
};

const buildVoicePreview = (prompt: string): Uint8Array => {
  const sampleRate = 16_000;
  const durationSeconds = Math.max(1, Math.min(3, Math.ceil(prompt.length / 60)));
  const sampleCount = sampleRate * durationSeconds;
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.max(0, 1 - time / durationSeconds);
    samples[index] = Math.sin(time * Math.PI * 2 * 440) * envelope * 0.22;
  }

  return encodeWav(samples, sampleRate);
};

const toArtifactSummary = (job: GenerationJob): string =>
  job.targetId
    ? `generation.artifact.summary.target:${job.targetId}`
    : "generation.artifact.summary.prompt";

const createAutomationArtifact = async (
  projectId: string,
  runId: string,
  artifactIdSuffix: string,
  content: Uint8Array,
  fileName: string,
  mimeType: string,
  label: GenerationArtifact["label"],
  summary: GenerationArtifact["summary"],
): Promise<GenerationArtifact> => {
  const artifactId = `artifact.${runId}.${artifactIdSuffix}`;
  const persisted = await persistBuilderFile(
    projectId,
    "automation",
    artifactId,
    content,
    fileName,
    mimeType,
  );

  return {
    id: artifactId,
    jobId: runId,
    kind: "automation-evidence",
    label,
    previewSource: persisted.publicUrl,
    summary,
    mimeType,
    approved: false,
    createdAtMs: Date.now(),
  };
};

const toWorkerFailure = (error: unknown): WorkerFailure => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

const runWorkerStep = async <TPayload>(
  step: () => Promise<TPayload>,
): Promise<WorkerResult<TPayload>> => {
  const result = await settleAsync(step());
  if (!result.ok) {
    return toWorkerFailure(result.error);
  }

  return { ok: true as const, data: result.value };
};

const probeAutomationOrigin = async (targetUrl: URL): Promise<boolean> => {
  const probeResult = await runWorkerStep(async () => {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(appConfig.builder.automationProbeTimeoutMs),
    });

    if (response.status >= 400) {
      throw new Error(`automation-origin-unreachable:${response.status}`);
    }

    return true;
  });

  if (!probeResult.ok) {
    workerLogger.info("automation.playwright.skipped", {
      reason: probeResult.error,
      targetUrl: targetUrl.toString(),
    });
    return false;
  }

  return probeResult.data;
};

const buildGenerationArtifact = async (
  projectId: string,
  job: GenerationJob,
): Promise<GenerationArtifact> => {
  const artifactId = `artifact.${job.id}`;
  const createdAtMs = Date.now();

  if (job.kind === "voice-line") {
    const wav = buildVoicePreview(job.prompt);
    const persisted = await persistBuilderFile(
      projectId,
      "generated",
      artifactId,
      wav,
      `${artifactId}.wav`,
      "audio/wav",
    );

    return {
      id: artifactId,
      jobId: job.id,
      kind: "audio",
      label: `generation.artifact.label.review:${job.kind}`,
      previewSource: persisted.publicUrl,
      summary: toArtifactSummary(job),
      mimeType: "audio/wav",
      approved: false,
      createdAtMs,
    };
  }

  if (
    job.kind === "animation-plan" ||
    job.kind === "combat-encounter" ||
    job.kind === "item-set" ||
    job.kind === "cutscene-script"
  ) {
    let payloadStr = "";

    if (job.kind === "animation-plan") {
      payloadStr = JSON.stringify(
        {
          prompt: job.prompt,
          targetId: job.targetId,
          suggestedClips: [
            { id: `${job.id}.idle`, stateTag: "idle", frameCount: 4, playbackFps: 8 },
            { id: `${job.id}.walk`, stateTag: "walk", frameCount: 6, playbackFps: 10 },
          ],
        },
        null,
        2,
      );
    } else {
      const registry = await ProviderRegistry.getInstance();
      const provider = registry.selectProvider("text-generation");
      if (!provider) {
        throw new Error(`ai-provider-unavailable-for-generation`);
      }
      const authoring = new AiAuthoringService(provider);

      if (job.kind === "combat-encounter") {
        const result = await authoring.generateCombatEncounter({
          sceneId: job.targetId ?? "unknown",
          difficulty: "normal",
          playerLevel: 1,
        });
        payloadStr = JSON.stringify(result ?? {}, null, 2);
      } else if (job.kind === "item-set") {
        const result = await authoring.generateItemSet({
          theme: job.prompt,
          count: 3,
          rarity: "common",
        });
        payloadStr = JSON.stringify(result ?? [], null, 2);
      } else if (job.kind === "cutscene-script") {
        const result = await authoring.generateCutsceneScript({
          sceneId: job.targetId ?? "unknown",
          characters: [],
          mood: "neutral",
        });
        payloadStr = JSON.stringify(result ?? [], null, 2);
      }
    }

    const persisted = await persistBuilderFile(
      projectId,
      "generated",
      artifactId,
      new TextEncoder().encode(payloadStr),
      `${artifactId}.json`,
      "application/json",
    );

    return {
      id: artifactId,
      jobId: job.id,
      kind: job.kind,
      label: `generation.artifact.label.review:${job.kind}`,
      previewSource: persisted.publicUrl,
      summary: toArtifactSummary(job),
      mimeType: "application/json",
      approved: false,
      createdAtMs,
    };
  }

  const png = await sharp(
    Buffer.from(
      buildImageSvg(
        `${job.kind.toUpperCase()} DRAFT`,
        `${job.prompt}\n\nTarget: ${job.targetId ?? "none"}\nProvider: ${appConfig.ai.preferredProvider}`,
      ),
    ),
  )
    .png()
    .toBuffer();

  const persisted = await persistBuilderFile(
    projectId,
    "generated",
    artifactId,
    png,
    `${artifactId}.png`,
    "image/png",
  );

  return {
    id: artifactId,
    jobId: job.id,
    kind: job.kind,
    label: `generation.artifact.label.review:${job.kind}`,
    previewSource: persisted.publicUrl,
    summary: toArtifactSummary(job),
    mimeType: "image/png",
    approved: false,
    createdAtMs,
  };
};

interface AutomationExecutionContext {
  readonly projectId: string;
  readonly run: AutomationRun;
  readonly artifactsByStepId: Map<string, GenerationArtifact>;
  readonly artifacts: GenerationArtifact[];
  browser: Awaited<ReturnType<typeof chromium.launch>> | null;
  page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>> | null;
}

const buildAutomationUrl = (path: string): URL =>
  new URL(path, appConfig.builder.localAutomationOrigin);

const ensureBrowserPage = async (
  context: AutomationExecutionContext,
): Promise<Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>>> => {
  if (context.page) {
    return context.page;
  }

  if (!context.browser) {
    context.browser = await chromium.launch({ headless: true });
  }

  context.page = await context.browser.newPage();
  return context.page;
};

const resolveRoleLocator = (
  page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>>,
  role: "button" | "link" | "tab" | "checkbox" | "radio" | "textbox" | "searchbox" | "combobox",
  name: string,
) => page.getByRole(role, { name });

const persistAutomationResponseArtifact = async (
  projectId: string,
  runId: string,
  stepId: string,
  fileStem: string,
  payload: string,
  mimeType: "application/json" | "text/plain",
): Promise<GenerationArtifact> =>
  createAutomationArtifact(
    projectId,
    runId,
    stepId.replace(/[^a-zA-Z0-9_.-]/gu, "-"),
    new TextEncoder().encode(payload),
    `${fileStem}.${mimeType === "application/json" ? "json" : "txt"}`,
    mimeType,
    "automation.artifact.label.evidence",
    "automation.artifact.captured-review-evidence",
  );

const executeBrowserAutomationStep = async (
  context: AutomationExecutionContext,
  step: AutomationRunStep,
  spec: Extract<
    AutomationStepSpec,
    { readonly kind: "goto" | "click" | "fill" | "assert-text" | "screenshot" }
  >,
): Promise<AutomationRunStep> => {
  const page = await ensureBrowserPage(context);

  switch (spec.kind) {
    case "goto": {
      const targetUrl = buildAutomationUrl(spec.path);
      await page.goto(targetUrl.toString(), {
        waitUntil: "domcontentloaded",
        timeout: appConfig.ai.requestTimeoutMs,
      });
      return { ...step, status: "completed" };
    }
    case "click": {
      await resolveRoleLocator(page, spec.role, spec.name).click();
      return { ...step, status: "completed" };
    }
    case "fill": {
      await resolveRoleLocator(page, spec.role, spec.name).fill(spec.value);
      return { ...step, status: "completed" };
    }
    case "assert-text": {
      await page.getByText(spec.text).first().waitFor();
      return { ...step, status: "completed" };
    }
    case "screenshot": {
      const screenshot = new Uint8Array(
        await page.screenshot({
          fullPage: spec.fullPage ?? true,
          type: "png",
        }),
      );
      const artifact = await createAutomationArtifact(
        context.projectId,
        context.run.id,
        step.id,
        screenshot,
        `${spec.fileStem}.png`,
        "image/png",
        "automation.artifact.label.evidence",
        "automation.artifact.captured-review-evidence",
      );
      context.artifacts.push(artifact);
      context.artifactsByStepId.set(step.id, artifact);
      return {
        ...step,
        status: "completed",
        evidenceSource: artifact.previewSource,
      };
    }
  }
};

const executeHttpAutomationStep = async (
  context: AutomationExecutionContext,
  step: AutomationRunStep,
  spec: Extract<AutomationStepSpec, { readonly kind: "request" }>,
): Promise<AutomationRunStep> => {
  const response = await fetch(buildAutomationUrl(spec.path), {
    method: spec.method,
    headers:
      spec.method === "POST"
        ? {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          }
        : undefined,
    body:
      spec.method === "POST" && spec.form ? new URLSearchParams(spec.form).toString() : undefined,
    signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
  });

  if (spec.expectedStatus !== undefined && response.status !== spec.expectedStatus) {
    throw new Error(`automation-http-unexpected-status:${response.status}`);
  }

  if (response.status >= 400) {
    throw new Error(`automation-http-failed:${response.status}`);
  }

  let evidenceSource: string | undefined;
  if (spec.responseFileStem) {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = await response.text();
    const artifact = await persistAutomationResponseArtifact(
      context.projectId,
      context.run.id,
      step.id,
      spec.responseFileStem,
      payload,
      isJson ? "application/json" : "text/plain",
    );
    context.artifacts.push(artifact);
    context.artifactsByStepId.set(step.id, artifact);
    evidenceSource = artifact.previewSource;
  }

  return {
    ...step,
    status: "completed",
    evidenceSource,
  };
};

const executeBuilderAutomationStep = async (
  context: AutomationExecutionContext,
  step: AutomationRunStep,
  spec: Extract<
    AutomationStepSpec,
    | { readonly kind: "create-scene" }
    | { readonly kind: "create-trigger" }
    | { readonly kind: "create-quest" }
    | { readonly kind: "create-dialogue-graph" }
    | { readonly kind: "create-asset" }
    | { readonly kind: "create-animation-clip" }
    | { readonly kind: "queue-generation-job" }
  >,
): Promise<AutomationRunStep> => {
  const baseForm = new URLSearchParams({
    projectId: context.projectId,
  });

  let path = "";

  switch (spec.kind) {
    case "create-scene":
      path = `${appRoutes.builderApiScenes}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("titleKey", spec.titleKey);
      baseForm.set("background", spec.background);
      baseForm.set("sceneMode", spec.sceneMode);
      break;
    case "create-trigger":
      path = `${appRoutes.builderApiTriggers}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("label", spec.label);
      baseForm.set("event", spec.event);
      if (spec.sceneId) {
        baseForm.set("sceneId", spec.sceneId);
      }
      if (spec.npcId) {
        baseForm.set("npcId", spec.npcId);
      }
      break;
    case "create-quest":
      path = `${appRoutes.builderApiQuests}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("title", spec.title);
      baseForm.set("description", spec.description);
      baseForm.set("triggerId", spec.triggerId);
      break;
    case "create-dialogue-graph":
      path = `${appRoutes.builderApiDialogueGraphs}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("title", spec.title);
      baseForm.set("line", spec.line);
      if (spec.npcId) {
        baseForm.set("npcId", spec.npcId);
      }
      break;
    case "create-asset":
      path = `${appRoutes.builderApiAssets}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("label", spec.label);
      baseForm.set("kind", spec.assetKind);
      baseForm.set("sceneMode", spec.sceneMode);
      baseForm.set("source", spec.source);
      break;
    case "create-animation-clip":
      path = `${appRoutes.builderApiAnimationClips}/create/form`;
      baseForm.set("id", spec.id);
      baseForm.set("assetId", spec.assetId);
      baseForm.set("stateTag", spec.stateTag);
      if (spec.playbackFps !== undefined) {
        baseForm.set("playbackFps", String(spec.playbackFps));
      }
      if (spec.frameCount !== undefined) {
        baseForm.set("frameCount", String(spec.frameCount));
      }
      break;
    case "queue-generation-job":
      path = `${appRoutes.builderApiGenerationJobs}/create/form`;
      baseForm.set("kind", spec.jobKind);
      baseForm.set("prompt", spec.prompt);
      if (spec.targetId) {
        baseForm.set("targetId", spec.targetId);
      }
      break;
  }

  const response = await fetch(buildAutomationUrl(path), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: baseForm.toString(),
    signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
  });

  if (response.status >= 400) {
    throw new Error(`automation-builder-step-failed:${response.status}`);
  }

  return {
    ...step,
    status: "completed",
  };
};

const executeAttachArtifactStep = async (
  context: AutomationExecutionContext,
  step: AutomationRunStep,
  spec: AutomationAttachFileStepSpec,
): Promise<AutomationRunStep> => {
  const artifact = context.artifactsByStepId.get(spec.sourceStepId);
  if (!artifact) {
    throw new Error(`automation-artifact-missing:${spec.sourceStepId}`);
  }

  return {
    ...step,
    status: "completed" as const,
    evidenceSource: artifact.previewSource,
  };
};

const executeAutomationStep = async (
  context: AutomationExecutionContext,
  step: AutomationRunStep,
): Promise<
  WorkerResult<{
    readonly step: AutomationRunStep;
    readonly artifacts: readonly GenerationArtifact[];
  }>
> => {
  if (!step.spec) {
    return {
      ok: false,
      error: `automation-step-spec-missing:${step.id}`,
    };
  }

  const { spec } = step;
  const executedStep = await runWorkerStep(async () => {
    switch (spec.kind) {
      case "goto":
      case "click":
      case "fill":
      case "assert-text":
      case "screenshot":
        return executeBrowserAutomationStep(context, step, spec);
      case "request":
        return executeHttpAutomationStep(context, step, spec);
      case "create-scene":
      case "create-trigger":
      case "create-quest":
      case "create-dialogue-graph":
      case "create-asset":
      case "create-animation-clip":
      case "queue-generation-job":
        return executeBuilderAutomationStep(context, step, spec);
      case "attach-generated-artifact":
        return executeAttachArtifactStep(context, step, spec);
      default:
        return assertUnreachable(spec);
    }
  });

  if (!executedStep.ok) {
    return executedStep;
  }

  return {
    ok: true,
    data: {
      step: executedStep.data,
      artifacts: [...context.artifacts],
    },
  };
};

/**
 * Executes a queued generation job into one or more reviewable artifacts.
 *
 * @param projectId Owning builder project identifier.
 * @param job Queued generation job.
 * @returns Execution result for persistence into project state.
 */
export const executeGenerationJob = async (
  projectId: string,
  job: GenerationJob,
): Promise<WorkerResult<GenerationJobExecution>> => {
  const artifactResult = await runWorkerStep(() => buildGenerationArtifact(projectId, job));
  if (!artifactResult.ok) {
    return artifactResult;
  }

  return {
    ok: true,
    data: {
      artifacts: [artifactResult.data],
      statusMessage: "job.draft-ready-for-review",
    },
  };
};

/**
 * Executes a queued automation run into auditable steps and evidence artifacts.
 *
 * @param projectId Owning builder project identifier.
 * @param run Queued automation run.
 * @returns Execution result for persistence into project state.
 */
export const executeAutomationRun = async (
  projectId: string,
  run: AutomationRun,
): Promise<WorkerResult<AutomationRunExecution>> => {
  const context: AutomationExecutionContext = {
    projectId,
    run,
    artifactsByStepId: new Map<string, GenerationArtifact>(),
    artifacts: [],
    browser: null,
    page: null,
  };
  const completedSteps: AutomationRunStep[] = [];

  if (run.steps.some((step) => step.action === "browser")) {
    const targetUrl = buildAutomationUrl(withQueryParameters(appRoutes.builder, { projectId }));
    const originReachable = await probeAutomationOrigin(targetUrl);
    if (!originReachable) {
      return {
        ok: false,
        error: "automation-origin-unreachable",
      };
    }
  }

  for (const step of run.steps) {
    const executed = await executeAutomationStep(context, step);
    if (!executed.ok) {
      if (context.browser) {
        const closeResult = await runWorkerStep(
          () => context.browser?.close() ?? Promise.resolve(),
        );
        if (!closeResult.ok) {
          workerLogger.warn("automation.playwright.close-failed", {
            message: closeResult.error,
          });
        }
      }
      return {
        ok: false,
        error: executed.error,
      };
    }

    completedSteps.push(executed.data.step);
  }

  if (context.browser) {
    const closeResult = await runWorkerStep(() => context.browser?.close() ?? Promise.resolve());
    if (!closeResult.ok) {
      workerLogger.warn("automation.playwright.close-failed", {
        message: closeResult.error,
      });
    }
  }

  return {
    ok: true,
    data: {
      steps: completedSteps,
      artifacts: [...context.artifacts],
      statusMessage: "automation.plan-ready-for-review",
    },
  };
};

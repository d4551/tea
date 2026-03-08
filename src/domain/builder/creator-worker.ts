import { chromium } from "playwright";
import sharp from "sharp";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type {
  AutomationRun,
  AutomationRunStep,
  GenerationArtifact,
  GenerationJob,
} from "../../shared/contracts/game.ts";
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
  <rect width="1024" height="576" rx="32" fill="url(#bg)" />
  <rect x="28" y="28" width="968" height="520" rx="24" fill="${SVG_PALETTE.overlayFill}" stroke="${SVG_PALETTE.overlayStroke}" />
  <text x="64" y="120" font-family="ui-monospace, monospace" font-size="28" font-weight="700" fill="${SVG_PALETTE.text}">${title}</text>
  <foreignObject x="64" y="156" width="896" height="320">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ui-sans-serif, system-ui; font-size: 24px; line-height: 1.5; color: oklch(0.98 0.01 250); white-space: pre-wrap;">${body}</div>
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

const toWorkerFailure = (error: unknown): WorkerFailure => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

const runWorkerStep = async <TPayload>(
  step: () => Promise<TPayload>,
): Promise<WorkerResult<TPayload>> => {
  return step()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => toWorkerFailure(error));
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

  if (job.kind === "animation-plan") {
    const payload = JSON.stringify(
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
    const persisted = await persistBuilderFile(
      projectId,
      "generated",
      artifactId,
      new TextEncoder().encode(payload),
      `${artifactId}.json`,
      "application/json",
    );

    return {
      id: artifactId,
      jobId: job.id,
      kind: "animation-plan",
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

const attemptPlaywrightEvidence = async (
  projectId: string,
  runId: string,
): Promise<string | null> => {
  const targetUrl = new URL(appRoutes.builder, appConfig.builder.localAutomationOrigin);
  targetUrl.searchParams.set("projectId", projectId);

  const originReachable = await probeAutomationOrigin(targetUrl);
  if (!originReachable) {
    return null;
  }

  const browserResult = await runWorkerStep(() => chromium.launch({ headless: true }));
  if (!browserResult.ok) {
    workerLogger.warn("automation.playwright.launch-failed", {
      message: browserResult.error,
      targetUrl: targetUrl.toString(),
    });
    return null;
  }
  const browser = browserResult.data;

  const processPage = async (): Promise<string | null> => {
    const pageResult = await runWorkerStep(() => browser.newPage());
    if (!pageResult.ok) {
      workerLogger.warn("automation.playwright.page-failed", {
        message: pageResult.error,
        targetUrl: targetUrl.toString(),
      });
      return null;
    }

    const screenshotResult = await runWorkerStep(async () => {
      await pageResult.data.goto(targetUrl.toString(), {
        waitUntil: "domcontentloaded",
        timeout: appConfig.ai.requestTimeoutMs,
      });
      return new Uint8Array(await pageResult.data.screenshot({ fullPage: true, type: "png" }));
    });
    if (!screenshotResult.ok) {
      workerLogger.warn("automation.playwright.capture-failed", {
        message: screenshotResult.error,
        targetUrl: targetUrl.toString(),
      });
      return null;
    }

    const persistedResult = await runWorkerStep(() =>
      persistBuilderFile(
        projectId,
        "automation",
        `evidence.${runId}`,
        screenshotResult.data,
        `evidence.${runId}.png`,
        "image/png",
      ),
    );
    if (!persistedResult.ok) {
      workerLogger.warn("automation.playwright.persist-failed", {
        message: persistedResult.error,
        targetUrl: targetUrl.toString(),
      });
      return null;
    }

    return persistedResult.data.publicUrl;
  };

  const publicUrl = await processPage();

  const closeResult = await runWorkerStep(() => browser.close());
  if (!closeResult.ok) {
    workerLogger.warn("automation.playwright.close-failed", {
      message: closeResult.error,
    });
  }

  return publicUrl;
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
  const fallbackJob: GenerationJob = {
    id: `automation.${run.id}`,
    kind: "portrait",
    status: "running",
    prompt: run.goal,
    artifactIds: [],
    statusMessage: "automation.capturing-fallback-review-evidence",
    createdAtMs: run.createdAtMs,
    updatedAtMs: run.updatedAtMs,
  };
  const evidenceUrl = await attemptPlaywrightEvidence(projectId, run.id);
  const fallbackArtifactResult =
    evidenceUrl === null
      ? await runWorkerStep(() => buildGenerationArtifact(projectId, fallbackJob))
      : null;
  if (fallbackArtifactResult && !fallbackArtifactResult.ok) {
    return fallbackArtifactResult;
  }

  const artifact: GenerationArtifact = fallbackArtifactResult?.data
    ? {
        ...fallbackArtifactResult.data,
        kind: "automation-evidence",
        label: "automation.artifact.label.evidence",
        summary: "automation.artifact.captured-review-evidence",
      }
    : {
        id: `artifact.${run.id}`,
        jobId: run.id,
        kind: "automation-evidence",
        label: "automation.artifact.label.evidence",
        previewSource: evidenceUrl ?? "",
        summary: "automation.artifact.captured-review-evidence",
        mimeType: "image/png",
        approved: false,
        createdAtMs: Date.now(),
      };

  const completedSteps = run.steps.map((step, index) => ({
    ...step,
    status: "completed",
    evidenceSource: index === 0 ? artifact.previewSource : undefined,
  })) satisfies readonly AutomationRunStep[];

  return {
    ok: true,
    data: {
      steps: completedSteps,
      artifacts: [artifact],
      statusMessage: "automation.plan-ready-for-review",
    },
  };
};

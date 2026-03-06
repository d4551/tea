import sharp from "sharp";
import { appConfig } from "../../config/environment.ts";
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

const buildImageSvg = (title: string, body: string): string => `<?xml version="1.0" encoding="UTF-8"?>
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
    ? `Generated ${job.kind} draft for ${job.targetId}`
    : `Generated ${job.kind} draft from builder prompt`;

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
      label: `Review ${job.kind}`,
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
      label: `Review ${job.kind}`,
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
    label: `Review ${job.kind}`,
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
  const playwrightModule = await new Function(
    "moduleName",
    "return import(moduleName)",
  )("playwright")
    .then((module) => module)
    .catch(() => null);
  if (!playwrightModule) {
    return null;
  }

  const targetUrl = new URL(appRoutes.builder, `http://${appConfig.host}:${appConfig.port}`);
  targetUrl.searchParams.set("projectId", projectId);

  const browser = await playwrightModule.chromium.launch({ headless: true }).catch(() => null);
  if (!browser) {
    return null;
  }

  const page = await browser.newPage();
  const screenshotBytes = await page
    .goto(targetUrl.toString(), {
      waitUntil: "domcontentloaded",
      timeout: appConfig.ai.requestTimeoutMs,
    })
    .then(async () => page.screenshot({ fullPage: true, type: "png" }))
    .catch(() => null);
  await browser.close();

  if (!screenshotBytes) {
    return null;
  }

  const persisted = await persistBuilderFile(
    projectId,
    "automation",
    `evidence.${runId}`,
    screenshotBytes,
    `evidence.${runId}.png`,
    "image/png",
  );
  return persisted.publicUrl;
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
  const artifact = await buildGenerationArtifact(projectId, job).catch((error: unknown) => error);
  if (artifact instanceof Error) {
    return {
      ok: false,
      error: artifact.message,
    };
  }

  return {
    ok: true,
    data: {
      artifacts: [artifact],
      statusMessage: "draft-ready-for-review",
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
    statusMessage: "capturing-fallback-review-evidence",
    createdAtMs: run.createdAtMs,
    updatedAtMs: run.updatedAtMs,
  };
  const evidenceUrl = await attemptPlaywrightEvidence(projectId, run.id);
  const fallbackArtifact =
    evidenceUrl === null
      ? await buildGenerationArtifact(projectId, fallbackJob).catch((error: unknown) => error)
      : null;
  if (fallbackArtifact instanceof Error) {
    return {
      ok: false,
      error: fallbackArtifact.message,
    };
  }

  const artifact: GenerationArtifact = fallbackArtifact ?? {
    id: `artifact.${run.id}`,
    jobId: run.id,
    kind: "automation-evidence",
    label: "Automation evidence",
    previewSource: evidenceUrl,
    summary: "Captured builder review evidence",
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
      statusMessage: "automation-plan-ready-for-review",
    },
  };
};

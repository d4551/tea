import { chromium } from "playwright";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { AUTOMATION_STEP_KIND_UNSUPPORTED_ERROR } from "../../shared/constants/builder-defaults.ts";
import { httpStatus } from "../../shared/constants/http.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type {
  AutomationAttachFileStepSpec,
  AutomationRun,
  AutomationRunStep,
  AutomationStepSpec,
  GenerationArtifact,
  GenerationJob,
} from "../../shared/contracts/game.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";
import { sha256Hex } from "../../shared/utils/crypto.ts";
import { encodeMonoWavAudio } from "../../shared/utils/wav-audio.ts";
import { fetchHfDatasetSnippets } from "../ai/hf-dataset-source.ts";
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
  throw new Error(AUTOMATION_STEP_KIND_UNSUPPORTED_ERROR);
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

const toArtifactSummary = (job: GenerationJob): string =>
  job.targetId
    ? `generation.artifact.summary.target:${job.targetId}`
    : "generation.artifact.summary.prompt";

const createGenerationArtifactMetadata = (
  source: "ai" | "placeholder",
  reason?: string,
): GenerationArtifact["metadata"] => ({
  source,
  ...(reason ? { reason } : {}),
});

const inferArtifactFileName = (artifactId: string, mimeType: string): string => {
  switch (mimeType) {
    case "audio/wav":
      return `${artifactId}.wav`;
    case "application/json":
      return `${artifactId}.json`;
    case "image/jpeg":
      return `${artifactId}.jpg`;
    case "image/webp":
      return `${artifactId}.webp`;
    default:
      return `${artifactId}.png`;
  }
};

const createPersistedGenerationArtifact = async (
  projectId: string,
  artifactId: string,
  job: GenerationJob,
  content: Uint8Array,
  mimeType: string,
  createdAtMs: number,
  kind: GenerationArtifact["kind"],
  metadata?: GenerationArtifact["metadata"],
): Promise<GenerationArtifact> => {
  const persisted = await persistBuilderFile(
    projectId,
    "generated",
    artifactId,
    content,
    inferArtifactFileName(artifactId, mimeType),
    mimeType,
  );

  return {
    id: artifactId,
    jobId: job.id,
    kind,
    label: `generation.artifact.label.review:${job.kind}`,
    previewSource: persisted.publicUrl,
    summary: toArtifactSummary(job),
    mimeType,
    metadata,
    approved: false,
    createdAtMs,
  };
};

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

const createAuthoringService = (
  projectId: string,
  registry: ProviderRegistry,
): AiAuthoringService =>
  new AiAuthoringService(registry, {
    governance: {
      projectId,
      requestSource: "builder.creator-worker",
    },
    costTier: "standard",
  });

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

  return { ok: true, data: result.value };
};

const enrichPromptWithDataset = async (prompt: string): Promise<string> => {
  const snippets = await fetchHfDatasetSnippets(prompt, 3);
  if (snippets.length === 0) {
    return prompt;
  }

  const context = snippets
    .map((snippet, index) => `[${index + 1}] ${snippet.text}`)
    .join("\n\n");
  return `${prompt.trim()}\n\nReference corpus excerpts:\n${context}`;
};

const probeAutomationOrigin = async (targetUrl: URL): Promise<boolean> => {
  const probeResult = await runWorkerStep(async () => {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(appConfig.builder.automationProbeTimeoutMs),
    });

    if (response.status >= httpStatus.badRequest) {
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
): Promise<WorkerResult<GenerationArtifact>> => {
  const artifactId = `artifact.${job.id}`;
  const createdAtMs = Date.now();
  const enrichedPrompt = await enrichPromptWithDataset(job.prompt);

  switch (job.kind) {
    case "voice-line": {
      const speechResult = await runWorkerStep(async () => {
        const registry = await ProviderRegistry.getInstance();
        return registry.synthesizeSpeech({
          text: enrichedPrompt,
        });
      });

      if (speechResult.ok && speechResult.data.ok) {
        return {
          ok: true,
          data: await createPersistedGenerationArtifact(
            projectId,
            artifactId,
            job,
            encodeMonoWavAudio(speechResult.data.audio, speechResult.data.sampleRate),
            "audio/wav",
            createdAtMs,
            "audio",
            createGenerationArtifactMetadata("ai"),
          ),
        };
      }

      const reason = speechResult.ok
        ? speechResult.data.ok
          ? "Speech synthesis returned no audio payload"
          : speechResult.data.error
        : speechResult.error;
      workerLogger.warn("creator-worker.voice.failed", {
        jobId: job.id,
        error: reason,
      });
      return {
        ok: false,
        error: `voice-line generation failed: ${reason}`,
      };
    }
    case "portrait":
    case "sprite-sheet":
    case "tiles": {
      const imageResult = await runWorkerStep(async () => {
        const registry = await ProviderRegistry.getInstance();
        return registry.generateImage({
          prompt: enrichedPrompt,
          aspectRatio: job.kind === "portrait" ? "portrait" : "square",
          targetId: job.targetId,
          governance: {
            projectId,
            requestSource: "builder.creator-worker",
          },
          costTier: "high",
        });
      });

      if (imageResult.ok && imageResult.data.ok) {
        return {
          ok: true,
          data: await createPersistedGenerationArtifact(
            projectId,
            artifactId,
            job,
            imageResult.data.image,
            imageResult.data.mimeType,
            createdAtMs,
            job.kind,
            createGenerationArtifactMetadata("ai"),
          ),
        };
      }

      const reason = imageResult.ok
        ? imageResult.data.ok
          ? "Image generation returned no image payload"
          : imageResult.data.error
        : imageResult.error;
      workerLogger.warn("creator-worker.image.failed", {
        jobId: job.id,
        error: reason,
      });
      return {
        ok: false,
        error: `${job.kind} generation failed: ${reason}`,
      };
    }
    case "animation-plan": {
      const animationPlanResult = await runWorkerStep(async () => {
        const registry = await ProviderRegistry.getInstance();
        const authoring = createAuthoringService(projectId, registry);
        return authoring.generateAnimationPlan({
          prompt: enrichedPrompt,
          targetId: job.targetId,
        });
      });

      if (animationPlanResult.ok && animationPlanResult.data.ok) {
        return {
          ok: true,
          data: await createPersistedGenerationArtifact(
            projectId,
            artifactId,
            job,
            new TextEncoder().encode(JSON.stringify(animationPlanResult.data.plan, null, 2)),
            "application/json",
            createdAtMs,
            job.kind,
            createGenerationArtifactMetadata("ai"),
          ),
        };
      }

      const reason = animationPlanResult.ok
        ? animationPlanResult.data.ok
          ? "Animation plan generation returned no plan payload"
          : animationPlanResult.data.error
        : animationPlanResult.error;
      workerLogger.warn("creator-worker.animation-plan.failed", {
        jobId: job.id,
        error: reason,
      });
      return {
        ok: false,
        error: `animation-plan generation failed: ${reason}`,
      };
    }
    case "combat-encounter":
    case "item-set":
    case "cutscene-script": {
      const payloadResult = await runWorkerStep(async () => {
        const registry = await ProviderRegistry.getInstance();
        const authoring = createAuthoringService(projectId, registry);
        if (job.kind === "combat-encounter") {
          const encounter = await authoring.generateCombatEncounter({
            prompt: enrichedPrompt,
            sceneId: job.targetId,
          });
          if (!encounter.ok) {
            return {
              ok: false,
              reason: encounter.error,
            };
          }
          return {
            ok: true,
            payload: JSON.stringify(encounter.encounter, null, 2),
          };
        }
        if (job.kind === "item-set") {
          const items = await authoring.generateItemSet({
            prompt: enrichedPrompt,
          });
          if (!items.ok) {
            return {
              ok: false,
              reason: items.error,
            };
          }
          return {
            ok: true,
            payload: JSON.stringify(items.items, null, 2),
          };
        }

        const cutscene = await authoring.generateCutsceneScript({
          prompt: enrichedPrompt,
          sceneId: job.targetId,
        });
        if (!cutscene.ok) {
          return {
            ok: false,
            reason: cutscene.error,
          };
        }
        return {
          ok: true,
          payload: JSON.stringify(cutscene.steps, null, 2),
        };
      });
      if (!payloadResult.ok) {
        return {
          ok: false,
          error: `${job.kind} generation failed: ${payloadResult.error}`,
        };
      }
      if (!payloadResult.data.ok) {
        return {
          ok: false,
          error: `${job.kind} generation failed: ${payloadResult.data.reason ?? "AI text generation unavailable"}`,
        };
      }

      return {
        ok: true,
        data: await createPersistedGenerationArtifact(
          projectId,
          artifactId,
          job,
          new TextEncoder().encode(payloadResult.data.payload),
          "application/json",
          createdAtMs,
          job.kind,
          createGenerationArtifactMetadata("ai"),
        ),
      };
    }
  }
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

const buildAutomationRunSignature = (
  runId: string,
  goal: string,
  stepCount: number,
  dryRun: boolean,
): string => {
  const payload = `${runId}|${goal.trim()}|${stepCount}|${dryRun ? "1" : "0"}|${appConfig.builder.automationSigningSecret}`;
  return sha256Hex(payload);
};

const validateAutomationRunPolicy = (run: AutomationRun): WorkerResult<null> => {
  if (appConfig.controls.rpaExecutionKillSwitchEnabled) {
    return {
      ok: false,
      error: "automation-kill-switch-enabled",
    };
  }

  const maxSteps = Math.max(1, run.maxSteps ?? appConfig.builder.automationMaxSteps);
  if (run.steps.length > maxSteps) {
    return {
      ok: false,
      error: `automation-max-steps-exceeded:${run.steps.length}`,
    };
  }

  if (!appConfig.controls.allowUnsafeAutomationActions) {
    const hasUnsafeStep = run.steps.some((step) => {
      if (!step.spec) {
        return false;
      }
      return step.spec.kind === "request" || step.spec.kind === "create-asset";
    });
    if (hasUnsafeStep) {
      return {
        ok: false,
        error: "automation-unsafe-actions-disabled",
      };
    }
  }

  const allowedPrefixes = new Set(
    run.allowedRequestPathPrefixes && run.allowedRequestPathPrefixes.length > 0
      ? run.allowedRequestPathPrefixes
      : appConfig.builder.automationAllowedRequestPathPrefixes,
  );
  const invalidRequestStep = run.steps.find((step) => {
    if (!step.spec || step.spec.kind !== "request") {
      return false;
    }
    const { spec } = step;
    return ![...allowedPrefixes].some((prefix) => spec.path.startsWith(prefix));
  });
  if (invalidRequestStep) {
    return {
      ok: false,
      error: `automation-request-path-denied:${invalidRequestStep.id}`,
    };
  }

  if (run.signature) {
    const expected = buildAutomationRunSignature(
      run.id,
      run.goal,
      run.steps.length,
      run.dryRun === true,
    );
    if (run.signature !== expected) {
      return {
        ok: false,
        error: "automation-signature-invalid",
      };
    }
  }

  return {
    ok: true,
    data: null,
  };
};

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

  if (response.status >= httpStatus.badRequest) {
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
      path = interpolateRoutePath(appRoutes.builderApiScenesCreateForm, {
        projectId: context.projectId,
      });
      baseForm.set("id", spec.id);
      baseForm.set("titleKey", spec.titleKey);
      baseForm.set("background", spec.background);
      baseForm.set("sceneMode", spec.sceneMode);
      break;
    case "create-trigger":
      path = interpolateRoutePath(appRoutes.builderApiTriggersCreateForm, {
        projectId: context.projectId,
      });
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
      path = interpolateRoutePath(appRoutes.builderApiQuestsCreateForm, {
        projectId: context.projectId,
      });
      baseForm.set("id", spec.id);
      baseForm.set("title", spec.title);
      baseForm.set("description", spec.description);
      baseForm.set("triggerId", spec.triggerId);
      break;
    case "create-dialogue-graph":
      path = interpolateRoutePath(appRoutes.builderApiDialogueGraphsCreateForm, {
        projectId: context.projectId,
      });
      baseForm.set("id", spec.id);
      baseForm.set("title", spec.title);
      baseForm.set("line", spec.line);
      if (spec.npcId) {
        baseForm.set("npcId", spec.npcId);
      }
      break;
    case "create-asset":
      path = appRoutes.builderApiAssetsCreateForm;
      baseForm.set("id", spec.id);
      baseForm.set("label", spec.label);
      baseForm.set("kind", spec.assetKind);
      baseForm.set("sceneMode", spec.sceneMode);
      baseForm.set("source", spec.source);
      break;
    case "create-animation-clip":
      path = appRoutes.builderApiAnimationClipsCreateForm;
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
      path = appRoutes.builderApiGenerationJobsCreateForm;
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

  if (response.status >= httpStatus.badRequest) {
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
    status: "completed",
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
  if (appConfig.ai.generationKillSwitchEnabled) {
    return {
      ok: false,
      error: "ai-generation-kill-switch-enabled",
    };
  }
  const artifactResult = await buildGenerationArtifact(projectId, job);
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
  const policyValidation = validateAutomationRunPolicy(run);
  if (!policyValidation.ok) {
    return policyValidation;
  }

  if (run.dryRun === true) {
    return {
      ok: true,
      data: {
        steps: run.steps.map((step) => ({
          ...step,
          status: "completed",
        })),
        artifacts: [],
        statusMessage: "automation.dry-run-complete",
      },
    };
  }

  const context: AutomationExecutionContext = {
    projectId,
    run,
    artifactsByStepId: new Map<string, GenerationArtifact>(),
    artifacts: [],
    browser: null,
    page: null,
  };
  const completedSteps: AutomationRunStep[] = [];
  const startedAtMs = Date.now();
  const maxRuntimeMs = Math.max(
    1_000,
    run.maxRuntimeMs ?? appConfig.builder.automationMaxRuntimeMs,
  );

  if (run.steps.some((step) => step.action === "browser")) {
    const targetUrl = buildAutomationUrl(
      interpolateRoutePath(appRoutes.builderStart, { projectId }),
    );
    const originReachable = await probeAutomationOrigin(targetUrl);
    if (!originReachable) {
      return {
        ok: false,
        error: "automation-origin-unreachable",
      };
    }
  }

  for (const step of run.steps) {
    if (Date.now() - startedAtMs > maxRuntimeMs) {
      if (context.browser) {
        await runWorkerStep(() => context.browser?.close() ?? Promise.resolve());
      }
      return {
        ok: false,
        error: "automation-runtime-limit-exceeded",
      };
    }
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

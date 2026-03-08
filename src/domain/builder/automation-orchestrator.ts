import { createLogger } from "../../lib/logger.ts";
import type {
  AutomationRun,
  AutomationRunStatus,
  AutomationRunStep,
  GenerationArtifact,
} from "../../shared/contracts/game.ts";
import { executeAutomationRun } from "./creator-worker.ts";

const logger = createLogger("builder.automation-orchestrator");

/**
 * Orchestrator step event emitted during pipeline execution.
 */
export interface OrchestratorStepEvent {
  /** Step that completed. */
  readonly step: AutomationRunStep;
  /** Run status after step completion. */
  readonly runStatus: AutomationRunStatus;
  /** Overall progress ratio (0–1). */
  readonly progress: number;
  /** Artifacts produced up to this point. */
  readonly artifacts: readonly GenerationArtifact[];
}

/**
 * Stateful automation pipeline orchestrator.
 *
 * Wraps `creator-worker.ts` execution with step-level progress tracking
 * and approval gating. Yields step events as an async generator so callers
 * can stream progress to the client via SSE or WebSocket.
 */
export class AutomationOrchestrator {
  /**
   * Runs a full automation pipeline, yielding step events as they complete.
   *
   * @param projectId Owning builder project identifier.
   * @param run Automation run to execute.
   * @returns Async generator of orchestrator step events.
   */
  async *runPipeline(projectId: string, run: AutomationRun): AsyncGenerator<OrchestratorStepEvent> {
    logger.info("orchestrator.pipeline.start", {
      projectId,
      runId: run.id,
      goal: run.goal,
    });

    if (run.status === "blocked_for_approval") {
      logger.info("orchestrator.pipeline.blocked", { runId: run.id });
      return;
    }

    const result = await executeAutomationRun(projectId, run);

    if (!result.ok) {
      logger.warn("orchestrator.pipeline.failed", {
        runId: run.id,
        error: result.error,
      });

      yield {
        step: {
          id: `${run.id}-error`,
          action: "builder",
          summary: result.error,
          status: "failed",
        },
        runStatus: "failed",
        progress: 1,
        artifacts: [],
      };
      return;
    }

    const { steps, artifacts, statusMessage } = result.data;
    const totalSteps = steps.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = steps[i];
      if (!step) continue;

      const progress = (i + 1) / totalSteps;
      const isLast = i === totalSteps - 1;

      yield {
        step,
        runStatus: isLast ? "succeeded" : "running",
        progress,
        artifacts: isLast ? artifacts : [],
      };
    }

    logger.info("orchestrator.pipeline.complete", {
      runId: run.id,
      steps: totalSteps,
      artifactCount: artifacts.length,
      statusMessage,
    });
  }

  /**
   * Collects all artifacts from a completed pipeline run.
   *
   * @param projectId Owning builder project identifier.
   * @param run Automation run to collect from.
   * @returns All artifacts produced by the run.
   */
  async collectArtifacts(
    projectId: string,
    run: AutomationRun,
  ): Promise<readonly GenerationArtifact[]> {
    const allArtifacts: GenerationArtifact[] = [];

    for await (const event of this.runPipeline(projectId, run)) {
      allArtifacts.push(...event.artifacts);
    }

    return allArtifacts;
  }
}

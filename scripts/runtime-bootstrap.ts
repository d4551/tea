import {
  collectRuntimeReadinessReport,
  type RuntimeReadinessReport,
  type SetupWorkflowResult,
} from "../src/bootstrap/runtime-readiness.ts";
import { appConfig } from "../src/config/environment.ts";

/**
 * One Bun-native command step executed by the setup workflow.
 */
export interface SetupWorkflowCommandStep {
  /** Executable and arguments for one setup step. */
  readonly command: readonly string[];
  /** Human-readable description reported in the setup result. */
  readonly description: string;
}

/**
 * Injectable dependencies for the setup workflow, used by tests and automation.
 */
export interface SetupWorkflowDependencies {
  /** Working directory used for setup commands and environment file writes. */
  readonly cwd: string;
  /** Reads the current Bun runtime version. */
  readonly readCurrentBunVersion: () => string;
  /** Executes one Bun-native setup command. */
  readonly runCommand: (step: SetupWorkflowCommandStep) => Promise<void>;
  /** Ensures the local `.env` file exists from `.env.example` when missing. */
  readonly ensureEnvFile: () => Promise<"created" | "preserved">;
  /** Collects the canonical readiness report after setup completes. */
  readonly collectReadinessReport: () => Promise<RuntimeReadinessReport>;
}

const readCurrentBunVersion = (): string => Bun.version;

const isSupportedBunVersion = (version: string): boolean =>
  version.startsWith(`${appConfig.bootstrap.supportedBunRange.replace(/\.x$/u, ".")}`);

const setupSteps: readonly SetupWorkflowCommandStep[] = [
  {
    command: ["bun", "install"],
    description: "bun install",
  },
  {
    command: ["bun", "run", "prisma:generate"],
    description: "bun run prisma:generate",
  },
  {
    command: ["bun", "run", "prisma:migrate"],
    description: "bun run prisma:migrate",
  },
  {
    command: ["bun", "run", "build:assets"],
    description: "bun run build:assets",
  },
];

const createEnvFileEnsurer = (cwd: string) => async (): Promise<"created" | "preserved"> => {
  const envFile = Bun.file(`${cwd}/.env`);
  if (await envFile.exists()) {
    return "preserved";
  }

  await Bun.write(envFile, await Bun.file(`${cwd}/.env.example`).text());
  return "created";
};

const createCommandRunner =
  (cwd: string) =>
  async (step: SetupWorkflowCommandStep): Promise<void> => {
    const subprocess = Bun.spawn({
      cmd: [...step.command],
      cwd,
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    const exitCode = await subprocess.exited;
    if (exitCode !== 0) {
      throw new Error(`Setup step failed: ${step.command.join(" ")}`);
    }
  };

const defaultDependencies = (): SetupWorkflowDependencies => ({
  cwd: process.cwd(),
  readCurrentBunVersion,
  runCommand: createCommandRunner(process.cwd()),
  ensureEnvFile: createEnvFileEnsurer(process.cwd()),
  collectReadinessReport: collectRuntimeReadinessReport,
});

const ensureSupportedBunVersion = (version: string): void => {
  if (!isSupportedBunVersion(version)) {
    throw new Error(
      `Unsupported Bun version ${version}. Expected ${appConfig.bootstrap.supportedBunRange}.`,
    );
  }
};

/**
 * Runs the canonical Bun-native project setup workflow.
 *
 * @param overrides Optional injected dependencies for tests and automation.
 * @returns Structured setup result for CLI and automation consumers.
 */
export const runSetupWorkflow = async (
  overrides: Partial<SetupWorkflowDependencies> = {},
): Promise<SetupWorkflowResult> => {
  const dependencies = {
    ...defaultDependencies(),
    ...overrides,
  } satisfies SetupWorkflowDependencies;

  ensureSupportedBunVersion(dependencies.readCurrentBunVersion());

  const steps: string[] = [];
  for (const step of setupSteps) {
    await dependencies.runCommand(step);
    steps.push(step.description);
    if (step.command[1] === "install") {
      const envResult = await dependencies.ensureEnvFile();
      steps.push(
        envResult === "created" ? "created .env from .env.example" : "preserved existing .env",
      );
    }
  }

  const readiness = await dependencies.collectReadinessReport();
  return {
    ok: readiness.ok,
    steps,
    readiness,
  };
};

/**
 * Collects the canonical doctor/readiness report without mutating build outputs.
 *
 * @param overrides Optional injected dependencies for tests and automation.
 * @returns Runtime readiness report.
 */
export const runDoctorWorkflow = async (
  overrides: Pick<
    Partial<SetupWorkflowDependencies>,
    "collectReadinessReport" | "readCurrentBunVersion"
  > = {},
): Promise<RuntimeReadinessReport> => {
  const dependencies = {
    ...defaultDependencies(),
    ...overrides,
  } satisfies SetupWorkflowDependencies;

  ensureSupportedBunVersion(dependencies.readCurrentBunVersion());
  return dependencies.collectReadinessReport();
};

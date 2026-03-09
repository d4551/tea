import { createLogger } from "../src/lib/logger.ts";

/**
 * Required current-state documentation files.
 */
const requiredFiles = [
  "README.md",
  "ARCHITECTURE.md",
  "docs/index.md",
  "docs/htmx-extensions.md",
  "docs/playable-runtime.md",
  "docs/local-ai-runtime.md",
  "docs/operator-runbook.md",
  "docs/api-contracts.md",
  "docs/builder-domain.md",
  "docs/rmmz-pack.md",
  "LOTFK_RMMZ_Agentic_Pack/README.md",
  "LOTFK_RMMZ_Agentic_Pack/PLUGIN_SPEC.md",
  "LOTFK_RMMZ_Agentic_Pack/EVENT_HOOKUPS.md",
  "LOTFK_RMMZ_Agentic_Pack/STATUS.md",
] as const;

/**
 * Forbidden retired documentation artifacts.
 */
const forbiddenPaths = [
  "docs/plans",
  "LOTFK_RMMZ_Agentic_Pack/MASTER_PROMPT.md",
  "LOTFK_RMMZ_Agentic_Pack/IMPLEMENTATION_TICKETS.md",
] as const;

/**
 * Lightweight content check for current docs entrypoints.
 */
interface LinkExpectation {
  /** File to validate. */
  readonly path: string;
  /** Marker text that must be present. */
  readonly includes: readonly string[];
}

const requiredContentChecks: readonly LinkExpectation[] = [
  {
    path: "docs/index.md",
    includes: ["api-contracts.md", "builder-domain.md", "rmmz-pack.md"],
  },
  {
    path: "README.md",
    includes: ["docs/index.md", "operator-runbook.md", "api-contracts.md"],
  },
  {
    path: "ARCHITECTURE.md",
    includes: ["builder-domain.md", "api-contracts.md", "rmmz-pack.md"],
  },
  {
    path: "LOTFK_RMMZ_Agentic_Pack/README.md",
    includes: ["STATUS.md", "PLUGIN_SPEC.md", "EVENT_HOOKUPS.md"],
  },
];

const logger = createLogger("docs-surface-check");

const pathExists = async (path: string): Promise<boolean> => Bun.file(path).exists();

const main = async (): Promise<void> => {
  const errors: string[] = [];

  for (const path of requiredFiles) {
    if (!(await pathExists(path))) {
      errors.push(`Missing required documentation file: ${path}`);
    }
  }

  for (const path of forbiddenPaths) {
    if (await pathExists(path)) {
      errors.push(`Retired documentation artifact still exists: ${path}`);
    }
  }

  for (const check of requiredContentChecks) {
    if (!(await pathExists(check.path))) {
      continue;
    }

    const content = await Bun.file(check.path).text();
    for (const expected of check.includes) {
      if (!content.includes(expected)) {
        errors.push(`${check.path} is missing expected reference: ${expected}`);
      }
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      logger.error("docs.surface.failed", { message: error });
    }
    process.exitCode = 1;
    return;
  }

  logger.info("docs.surface.passed", {
    requiredCount: requiredFiles.length,
    forbiddenCount: forbiddenPaths.length,
    contentChecks: requiredContentChecks.length,
  });
};

await main();

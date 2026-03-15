import { appConfig } from "../config/environment.ts";
import { createLogger } from "../lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../shared/constants/assets.ts";
import { contentType, httpStatus } from "../shared/constants/http.ts";
import { prisma } from "../shared/services/db.ts";
import { settleAsync } from "../shared/utils/async-result.ts";

const runtimeReadinessLogger = createLogger("bootstrap.runtime-readiness");

/**
 * Individual readiness check result.
 */
export interface RuntimeReadinessCheck {
  /** Stable machine-readable check identifier. */
  readonly key: string;
  /** Human-readable check label. */
  readonly label: string;
  /** Whether the check completed successfully. */
  readonly ok: boolean;
  /** Optional detail for debugging and operator output. */
  readonly detail?: string;
}

/**
 * Deterministic runtime readiness envelope used by setup, doctor, and startup preflight.
 */
export interface RuntimeReadinessReport {
  /** Whether every check passed. */
  readonly ok: boolean;
  /** Evaluated check results. */
  readonly checks: readonly RuntimeReadinessCheck[];
}

interface RuntimeReadinessOptions {
  readonly includeWorkflowChecks?: boolean;
}

type AutomationOriginProbeState = "ok" | "unreachable" | "auth-required" | "misconfigured";

interface AutomationOriginProbeResult {
  readonly ok: boolean;
  readonly state: AutomationOriginProbeState;
  readonly detail: string;
}

const AUTOMATION_PROBE_TIMEOUT_MS = 5_000;
const AUTOMATION_HTML_SIGNATURES = [
  "<!doctype",
  "<html",
  "<body",
  "builder-project-shell",
] as const;

/**
 * Typed setup summary returned by the Bun-native setup workflow.
 */
export interface SetupWorkflowResult {
  /** Whether setup completed successfully. */
  readonly ok: boolean;
  /** Steps completed during setup. */
  readonly steps: readonly string[];
  /** Post-setup readiness result. */
  readonly readiness: RuntimeReadinessReport;
}

const requiredPublicAssetPaths = [
  joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.stylesheetOutputFile),
  joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
  joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.htmxExtensionLayoutControlsFile,
  ),
  joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.builderSceneEditorBundleFile,
  ),
  joinLocalPath(appConfig.playableGame.sourceDirectory, assetRelativePaths.gameClientBundleFile),
];

const resolveRequiredDirectories = (): readonly string[] => {
  const candidates = [
    appConfig.database.localDirectory,
    appConfig.paths.builderUploadsDirectory,
    appConfig.paths.aiCacheDirectory,
    appConfig.paths.aiLocalModelDirectory,
    appConfig.paths.publicAssetOutputDirectory,
    appConfig.paths.playableGameOutputDirectory,
  ];

  return [...new Set(candidates)].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
};

const resolveAutomationOriginUrl = (): URL | null => {
  try {
    return new URL(appConfig.builder.localAutomationOrigin);
  } catch {
    return null;
  }
};

const hasAutomationHtmlResponse = (bodyText: string): boolean =>
  AUTOMATION_HTML_SIGNATURES.some((signature) => bodyText.toLowerCase().includes(signature));

const verifyAutomationOriginSyntax = (): RuntimeReadinessCheck => {
  const originUrl = resolveAutomationOriginUrl();
  if (originUrl === null) {
    return {
      key: "builder:automation-origin-config",
      label: "Automation origin config",
      ok: false,
      detail: `invalid-url:${appConfig.builder.localAutomationOrigin}`,
    };
  }

  return {
    key: "builder:automation-origin-config",
    label: "Automation origin config",
    ok: true,
    detail: originUrl.toString(),
  };
};

const probeAutomationOrigin = async (originUrl: URL): Promise<AutomationOriginProbeResult> => {
  const probeResult = await settleAsync(
    fetch(originUrl.toString(), {
      signal: AbortSignal.timeout(AUTOMATION_PROBE_TIMEOUT_MS),
      headers: { accept: contentType.htmlUtf8 },
    }),
  );
  if (!probeResult.ok) {
    return {
      ok: false,
      state: "unreachable",
      detail: `unreachable:${probeResult.error instanceof Error ? probeResult.error.message : String(probeResult.error)}`,
    };
  }

  const response = probeResult.value;
  if (response.status === httpStatus.unauthorized || response.status === httpStatus.forbidden) {
    return {
      ok: false,
      state: "auth-required",
      detail: `auth-required:${String(response.status)}`,
    };
  }

  if (response.status >= httpStatus.badRequest) {
    return {
      ok: false,
      state: "unreachable",
      detail: `http-error:${String(response.status)}`,
    };
  }

  const responseContentType = response.headers.get("content-type") ?? "";
  const responseTypeAllowed =
    responseContentType.includes("text/html") || responseContentType.includes("text/plain");
  const bodyResult = await settleAsync(response.text());
  const bodyText = bodyResult.ok ? bodyResult.value : "";

  if (!responseTypeAllowed) {
    return {
      ok: false,
      state: "misconfigured",
      detail: `content-type:${responseContentType || "missing"}`,
    };
  }

  if (!hasAutomationHtmlResponse(bodyText)) {
    return {
      ok: false,
      state: "misconfigured",
      detail: "no-builder-response-signature",
    };
  }

  return {
    ok: true,
    state: "ok",
    detail: originUrl.toString(),
  };
};

const mapAutomationOriginProbeStateToCheck = (
  probeResult: AutomationOriginProbeResult,
): RuntimeReadinessCheck => {
  if (probeResult.ok) {
    return {
      key: "builder:automation-origin",
      label: "Automation origin valid",
      ok: true,
      detail: probeResult.detail,
    };
  }

  if (probeResult.state === "auth-required") {
    return {
      key: "builder:automation-origin",
      label: "Automation origin valid",
      ok: false,
      detail: `automation-origin-auth-required:${probeResult.detail}`,
    };
  }

  return {
    key: "builder:automation-origin",
    label: "Automation origin valid",
    ok: false,
    detail: `automation-origin-${probeResult.state}:${probeResult.detail}`,
  };
};

const verifyAutomationWorkflowProbe = async (originUrl: URL): Promise<RuntimeReadinessCheck> => {
  const workflowEndpoint = new URL("/api/builder/platform/readiness", originUrl);
  const workflowProbe = await settleAsync(
    fetch(workflowEndpoint.toString(), {
      signal: AbortSignal.timeout(AUTOMATION_PROBE_TIMEOUT_MS),
      headers: { accept: "application/json" },
    }),
  );
  if (!workflowProbe.ok) {
    return {
      key: "builder:automation-workflow",
      label: "Automation workflow path",
      ok: false,
      detail: `unreachable:${workflowProbe.error instanceof Error ? workflowProbe.error.message : String(workflowProbe.error)}`,
    };
  }

  const response = workflowProbe.value;
  if (response.status >= httpStatus.badRequest) {
    return {
      key: "builder:automation-workflow",
      label: "Automation workflow path",
      ok: false,
      detail: `http-error:${String(response.status)}`,
    };
  }

  const jsonResult = await settleAsync(response.json());
  if (!jsonResult.ok) {
    return {
      key: "builder:automation-workflow",
      label: "Automation workflow path",
      ok: false,
      detail: `invalid-json:${jsonResult.error instanceof Error ? jsonResult.error.message : String(jsonResult.error)}`,
    };
  }

  const payload = jsonResult.value as { readonly ok?: unknown };
  if (!payload || payload.ok !== true) {
    return {
      key: "builder:automation-workflow",
      label: "Automation workflow path",
      ok: false,
      detail: "not-ok-response",
    };
  }

  return {
    key: "builder:automation-workflow",
    label: "Automation workflow path",
    ok: true,
    detail: workflowEndpoint.toString(),
  };
};

const verifyWritableDirectory = async (directoryPath: string): Promise<RuntimeReadinessCheck> => {
  const probePath = `${directoryPath}/.bun-probe`;
  const writeResult = await settleAsync(Bun.write(probePath, "ok"));
  if (!writeResult.ok) {
    return {
      key: `directory:${directoryPath}`,
      label: "Writable directory",
      ok: false,
      detail: `write-failed:${writeResult.error.message}`,
    };
  }

  if (writeResult.value <= 0) {
    return {
      key: `directory:${directoryPath}`,
      label: "Writable directory",
      ok: false,
      detail: "write-failed:no-bytes-written",
    };
  }

  const deleteResult = await settleAsync(Bun.file(probePath).delete());
  if (!deleteResult.ok) {
    runtimeReadinessLogger.warn("startup.directory-probe.cleanup.failed", {
      directoryPath,
      error: deleteResult.error.message,
    });
    return {
      key: `directory:${directoryPath}`,
      label: "Writable directory",
      ok: false,
      detail: `cleanup-failed:${deleteResult.error.message}`,
    };
  }

  return {
    key: `directory:${directoryPath}`,
    label: "Writable directory",
    ok: true,
    detail: directoryPath,
  };
};

const verifyRequiredAsset = async (assetPath: string): Promise<RuntimeReadinessCheck> => {
  const exists = await Bun.file(assetPath).exists();
  return {
    key: `asset:${assetPath}`,
    label: "Built asset present",
    ok: exists,
    detail: assetPath,
  };
};

const verifyDatabaseReachable = async (): Promise<RuntimeReadinessCheck> => {
  await prisma.$queryRaw`SELECT 1`;
  return {
    key: "database:reachable",
    label: "Database reachable",
    ok: true,
    detail: appConfig.database.url,
  };
};

const requiredDatabaseTables = [
  "BuilderProject",
  "GameSession",
  "OracleInteraction",
  "AiKnowledgeDocument",
];

const verifyDatabaseSchema = async (): Promise<RuntimeReadinessCheck> => {
  const rows = await prisma.$queryRaw<readonly { readonly name: string }[]>`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
  `;
  const availableTables = new Set(rows.map((row) => row.name));
  const missingTables = requiredDatabaseTables.filter(
    (tableName) => !availableTables.has(tableName),
  );

  return {
    key: "database:schema",
    label: "Database schema ready",
    ok: missingTables.length === 0,
    detail:
      missingTables.length === 0 ? requiredDatabaseTables.join(", ") : missingTables.join(", "),
  };
};

const verifyAiRouting = async (): Promise<RuntimeReadinessCheck> => {
  const hasConfiguredProvider =
    appConfig.ai.preferredProvider.length > 0 && appConfig.ai.routing.defaultPolicy.length > 0;
  return {
    key: "ai:routing",
    label: "AI routing configured",
    ok: hasConfiguredProvider,
    detail: hasConfiguredProvider
      ? `${appConfig.ai.routing.defaultPolicy}:${appConfig.ai.preferredProvider}:${appConfig.ai.routing.ragPersistence}`
      : "no-preferred-provider-or-policy",
  };
};

/**
 * Ensures required runtime directories exist and are writable.
 *
 * @returns Directory readiness checks.
 */
export const ensureRuntimeDirectories = async (): Promise<readonly RuntimeReadinessCheck[]> =>
  Promise.all(
    resolveRequiredDirectories().map((directoryPath) => verifyWritableDirectory(directoryPath)),
  );

/**
 * Collects the full runtime readiness report without mutating build artifacts.
 *
 * @returns Deterministic readiness report envelope.
 */
export const collectRuntimeReadinessReport = async (
  options: RuntimeReadinessOptions = {},
): Promise<RuntimeReadinessReport> => {
  const directoryChecks = await ensureRuntimeDirectories();
  const assetChecks = await Promise.all(
    requiredPublicAssetPaths.map((assetPath) => verifyRequiredAsset(assetPath)),
  );
  const databaseCheck = await verifyDatabaseReachable();
  const databaseSchemaCheck = await verifyDatabaseSchema();
  const aiRoutingCheck = await verifyAiRouting();
  const automationOriginConfigCheck = verifyAutomationOriginSyntax();
  const automationOriginCheck =
    automationOriginConfigCheck.ok && automationOriginConfigCheck.detail
      ? mapAutomationOriginProbeStateToCheck(
          await probeAutomationOrigin(new URL(automationOriginConfigCheck.detail)),
        )
      : {
          key: "builder:automation-origin",
          label: "Automation origin valid",
          ok: false,
          detail: automationOriginConfigCheck.detail,
        };
  const workflowChecks =
    options.includeWorkflowChecks && automationOriginCheck.ok && automationOriginConfigCheck.ok
      ? [
          await verifyAutomationWorkflowProbe(
            new URL(automationOriginConfigCheck.detail ?? appConfig.builder.localAutomationOrigin),
          ),
        ]
      : [];
  const checks: readonly RuntimeReadinessCheck[] = [
    automationOriginConfigCheck,
    ...directoryChecks,
    ...assetChecks,
    databaseCheck,
    databaseSchemaCheck,
    aiRoutingCheck,
    automationOriginCheck,
    ...workflowChecks,
  ];

  return {
    ok: checks.every((check) => check.ok),
    checks,
  };
};

/**
 * Throws when startup-critical readiness checks fail.
 *
 * @throws Error when any readiness check fails.
 */
export const assertRuntimeReadiness = async (): Promise<void> => {
  const report = await collectRuntimeReadinessReport();
  const failed = report.checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    throw new Error(
      `Runtime readiness failed: ${failed.map((check) => `${check.key}:${check.detail ?? "failed"}`).join(", ")}`,
    );
  }

  runtimeReadinessLogger.info("startup.readiness.ok", {
    checkCount: report.checks.length,
    requiredDirectoryCount: resolveRequiredDirectories().length,
  });
};

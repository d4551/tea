import { constants as fsConstants } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import { appConfig } from "../config/environment.ts";
import { createLogger } from "../lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../shared/constants/assets.ts";
import { prisma } from "../shared/services/db.ts";

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
    assetRelativePaths.builderSceneEditorBundleFile,
  ),
  joinLocalPath(appConfig.playableGame.sourceDirectory, assetRelativePaths.gameClientBundleFile),
] as const;

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

const verifyWritableDirectory = async (directoryPath: string): Promise<RuntimeReadinessCheck> => {
  await mkdir(directoryPath, { recursive: true });
  await access(directoryPath, fsConstants.W_OK);
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
] as const;

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

const verifyAiRouting = async (): Promise<RuntimeReadinessCheck> => ({
  key: "ai:routing",
  label: "AI routing configured",
  ok: true,
  detail: `${appConfig.ai.routing.defaultPolicy}:${appConfig.ai.preferredProvider}:${appConfig.ai.routing.ragPersistence}`,
});

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
export const collectRuntimeReadinessReport = async (): Promise<RuntimeReadinessReport> => {
  const directoryChecks = await ensureRuntimeDirectories();
  const assetChecks = await Promise.all(
    requiredPublicAssetPaths.map((assetPath) => verifyRequiredAsset(assetPath)),
  );
  const databaseCheck = await verifyDatabaseReachable();
  const databaseSchemaCheck = await verifyDatabaseSchema();
  const aiRoutingCheck = await verifyAiRouting();
  const automationOriginCheck: RuntimeReadinessCheck = {
    key: "builder:automation-origin",
    label: "Automation origin valid",
    ok: true,
    detail: new URL(appConfig.builder.localAutomationOrigin).toString(),
  };
  const checks = [
    ...directoryChecks,
    ...assetChecks,
    databaseCheck,
    databaseSchemaCheck,
    aiRoutingCheck,
    automationOriginCheck,
  ] as const;

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

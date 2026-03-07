import {
  assertRuntimeReadiness,
  collectRuntimeReadinessReport,
  ensureRuntimeDirectories,
} from "./runtime-readiness.ts";

/**
 * Verifies that the expected built asset files exist before the server boots.
 *
 * @throws When any required runtime asset check fails.
 */
export const assertRequiredAssetsExist = async (): Promise<void> => {
  const report = await collectRuntimeReadinessReport();
  const failedAssetCheck = report.checks.find(
    (check) => check.key.startsWith("asset:") && !check.ok,
  );
  if (failedAssetCheck) {
    throw new Error(`Missing required asset: ${failedAssetCheck.detail ?? failedAssetCheck.key}`);
  }
};

/**
 * Verifies that the configured database is reachable for startup-critical paths.
 *
 * @throws When the configured database cannot be queried.
 */
export const assertDatabaseReachable = async (): Promise<void> => {
  const report = await collectRuntimeReadinessReport();
  const failedDatabaseCheck = report.checks.find(
    (check) => (check.key === "database:reachable" || check.key === "database:schema") && !check.ok,
  );
  if (failedDatabaseCheck) {
    throw new Error(
      failedDatabaseCheck.key === "database:schema"
        ? `Database schema is not ready: ${failedDatabaseCheck.detail ?? "missing required tables"}`
        : "Database is not reachable.",
    );
  }
};

/**
 * Ensures runtime directories exist before startup proceeds.
 */
export const ensureRequiredDirectoriesExist = async (): Promise<void> => {
  await ensureRuntimeDirectories();
};

/**
 * Runs startup-critical boot validations before the HTTP listener reports success.
 *
 * @throws When database connectivity, asset presence, or URL config is invalid.
 */
export const assertStartupReadiness = async (): Promise<void> => {
  await assertRuntimeReadiness();
};

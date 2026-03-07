import { appConfig } from "../config/environment.ts";
import { createLogger } from "../lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../shared/constants/assets.ts";
import { prisma } from "../shared/services/db.ts";

const preflightLogger = createLogger("bootstrap.preflight");

const requiredPublicAssetPaths = [
  joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.stylesheetOutputFile),
  joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
  joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.builderSceneEditorBundleFile,
  ),
  joinLocalPath(appConfig.playableGame.sourceDirectory, assetRelativePaths.gameClientBundleFile),
] as const;

/**
 * Verifies that the expected built asset files exist before the server boots.
 *
 * @throws When any required public asset is missing.
 */
export const assertRequiredAssetsExist = async (): Promise<void> => {
  for (const assetPath of requiredPublicAssetPaths) {
    const exists = await Bun.file(assetPath).exists();
    if (!exists) {
      throw new Error(`Missing required asset: ${assetPath}`);
    }
  }
};

/**
 * Verifies that the configured database is reachable for startup-critical paths.
 *
 * @throws When the configured database cannot be queried.
 */
export const assertDatabaseReachable = async (): Promise<void> => {
  await prisma.$queryRawUnsafe("SELECT 1");
};

/**
 * Runs startup-critical boot validations before the HTTP listener reports success.
 *
 * @throws When database connectivity, asset presence, or URL config is invalid.
 */
export const assertStartupReadiness = async (): Promise<void> => {
  new URL(appConfig.builder.localAutomationOrigin);
  await assertDatabaseReachable();
  await assertRequiredAssetsExist();

  preflightLogger.info("startup.readiness.ok", {
    assetCount: requiredPublicAssetPaths.length,
    automationOrigin: appConfig.builder.localAutomationOrigin,
  });
};

import { appConfig } from "../src/config/environment.ts";
import {
  assetRelativePaths,
  getClientModuleEntryPaths,
  getHtmxExtensionEntryPaths,
  joinLocalPath,
} from "../src/shared/constants/assets.ts";
import { isRecord, safeJsonParse } from "../src/shared/utils/safe-json.ts";

type BunBuildOptions = Parameters<typeof Bun.build>[0];
const emptyRecord: Record<string, unknown> = {};

const resolvePackagePath = (specifier: string): string =>
  Bun.fileURLToPath(import.meta.resolve(specifier));

const normalizeSlashPath = (path: string): string => path.replace(/\\/gu, "/").replace(/\/+$/u, "");

const toDirectoryUrl = (path: string): URL => Bun.pathToFileURL(`${normalizeSlashPath(path)}/`);

const resolveFromDirectory = (directory: string, relativePath: string): string =>
  Bun.fileURLToPath(new URL(relativePath, toDirectoryUrl(directory)));

const normalizePath = (value: string): string => value.replace(/\\/gu, "/").replace(/\/+$/u, "");

const hasPackageManifest = async (path: string): Promise<boolean> => Bun.file(path).exists();

const readPackageName = async (packageJsonPath: string): Promise<string | null> => {
  const packageJson = safeJsonParse(
    await Bun.file(packageJsonPath).text(),
    emptyRecord,
    (v): v is Record<string, unknown> => isRecord(v),
  );
  if (!isRecord(packageJson) || typeof packageJson.name !== "string") {
    return null;
  }

  return packageJson.name;
};

const findPackageRoot = async (
  resolvedModulePath: string,
  packageName: string,
): Promise<string> => {
  let currentPath = normalizePath(resolvedModulePath);

  while (true) {
    const nextPath = resolveFromDirectory(currentPath, "..");
    const packageJsonPath = resolveFromDirectory(nextPath, "package.json");

    if (await hasPackageManifest(packageJsonPath)) {
      const name = await readPackageName(packageJsonPath);
      if (name === packageName) {
        return nextPath;
      }
    }

    if (nextPath === currentPath) {
      throw new Error(`Unable to resolve package root for ${packageName}`);
    }

    currentPath = nextPath;
  }
};

const htmxBundlePath = resolvePackagePath("htmx.org/dist/htmx.min.js");
const htmxSseExtensionSourcePath = resolvePackagePath("htmx-ext-sse/sse.js");
const transformersPackageRoot = await findPackageRoot(
  resolvePackagePath("@huggingface/transformers"),
  "@huggingface/transformers",
);

const projectRoot = resolveFromDirectory(import.meta.dir, "..");
const resolveFromProjectRoot = (relativePath: string): string =>
  resolveFromDirectory(projectRoot, relativePath);

const resolveFromRoot = (relativeRoot: string, relativePath: string): string =>
  resolveFromDirectory(relativeRoot, relativePath);

const resolveInProject = (...parts: readonly string[]): string =>
  resolveFromProjectRoot(parts.join("/"));

type AssetPipelinePathMap = Readonly<{
  projectRoot: string;
  outputStylesheetPath: string;
  gameClientOutputDirectory: string;
  htmxExtensionsOutputDirectory: string;
  gameClientEntryPath: string;
  builderSceneEditorEntryPath: string;
  gameClientOutdir: string;
  builderSceneEditorOutdir: string;
  htmxExtensionsOutdir: string;
  clientModulesOutdir: string;
  htmxSourcePath: string;
  htmxDestinationPath: string;
  htmxSseExtensionSourcePath: string;
  onnxWasmSourceDirectory: string;
  onnxWasmDestinationDirectory: string;
}>;

/**
 * Canonical Bun asset-pipeline paths shared by build and watch scripts.
 */
export const assetPipelinePaths: AssetPipelinePathMap = {
  projectRoot,
  outputStylesheetPath: joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.stylesheetOutputFile,
  ),
  gameClientOutputDirectory: appConfig.playableGame.sourceDirectory,
  htmxExtensionsOutputDirectory: joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.htmxExtensionsOutputDirectory,
  ),
  gameClientEntryPath: resolveInProject(assetRelativePaths.playableGameClientEntryFile),
  builderSceneEditorEntryPath: resolveInProject(assetRelativePaths.builderSceneEditorEntryFile),
  gameClientOutdir: resolveFromProjectRoot(appConfig.playableGame.sourceDirectory),
  builderSceneEditorOutdir: resolveFromProjectRoot(appConfig.staticAssets.publicDirectory),
  htmxExtensionsOutdir: resolveFromProjectRoot(
    joinLocalPath(
      appConfig.staticAssets.publicDirectory,
      assetRelativePaths.htmxExtensionsOutputDirectory,
    ),
  ),
  htmxSourcePath: htmxBundlePath,
  htmxDestinationPath: resolveInProject(
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
  ),
  htmxSseExtensionSourcePath,
  onnxWasmSourceDirectory: resolveFromRoot(transformersPackageRoot, "dist"),
  onnxWasmDestinationDirectory: resolveFromProjectRoot(
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.onnxPublicDirectory),
  ),
  clientModulesOutdir: resolveFromProjectRoot(
    joinLocalPath(
      appConfig.staticAssets.publicDirectory,
      assetRelativePaths.clientModulesOutputDirectory,
    ),
  ),
};

/**
 * Canonical HTMX extension entrypoint paths.
 */
export const htmxExtensionEntryPaths = getHtmxExtensionEntryPaths().map((entryPath) =>
  resolveInProject(entryPath),
);

/**
 * Canonical Bun entry-naming pattern for the playable game bundle.
 */
export const gameClientEntryNaming = assetRelativePaths.gameClientBundleFile.replace(
  /\.js$/u,
  ".[ext]",
);

/**
 * Canonical client module entrypoint paths.
 */
export const clientModuleEntryPaths = getClientModuleEntryPaths().map((entryPath) =>
  resolveInProject(entryPath),
);

/**
 * Returns the Tailwind CLI command for either a build or watch run.
 *
 * @param watch Whether Tailwind should stay resident in watch mode.
 * @returns Bun command array.
 */
export const createTailwindCommand = (watch: boolean): readonly string[] => [
  "bunx",
  "@tailwindcss/cli",
  "-i",
  assetRelativePaths.sourceStylesheet,
  "-o",
  assetPipelinePaths.outputStylesheetPath,
  watch ? "--watch=always" : "--minify",
];

/**
 * Returns the Bun CLI command for the HTMX extension bundle.
 *
 * @param watch Whether Bun should rebuild on file changes.
 * @returns Bun command array.
 */
export const createHtmxExtensionBuildCommand = (watch: boolean): readonly string[] => {
  const baseCommand = [
    "bun",
    "build",
    ...htmxExtensionEntryPaths,
    "--outdir",
    assetPipelinePaths.htmxExtensionsOutputDirectory,
    "--target",
    "browser",
  ];

  return watch ? [...baseCommand, "--watch", "--minify"] : [...baseCommand, "--minify"];
};

/**
 * Returns the Bun CLI command for the playable game client bundle.
 *
 * @param watch Whether Bun should rebuild on file changes.
 * @returns Bun command array.
 */
export const createGameClientBuildCommand = (watch: boolean): readonly string[] => {
  const baseCommand = [
    "bun",
    "build",
    assetRelativePaths.playableGameClientEntryFile,
    "--outdir",
    assetPipelinePaths.gameClientOutputDirectory,
    "--entry-naming",
    gameClientEntryNaming,
    "--target",
    "browser",
  ];

  return watch ? [...baseCommand, "--watch", "--minify"] : [...baseCommand, "--minify"];
};

/**
 * Returns Bun.build options for the HTMX extension bundle.
 *
 * @returns Static-build options.
 */
export const createHtmxExtensionBuildOptions = (): BunBuildOptions => ({
  entrypoints: [...htmxExtensionEntryPaths],
  outdir: assetPipelinePaths.htmxExtensionsOutdir,
  minify: true,
  target: "browser",
});

/**
 * Returns Bun.build options for the playable game client bundle.
 *
 * @returns Static-build options.
 */
export const createGameClientBuildOptions = (): BunBuildOptions => ({
  entrypoints: [assetPipelinePaths.gameClientEntryPath],
  outdir: assetPipelinePaths.gameClientOutdir,
  naming: gameClientEntryNaming,
  minify: true,
  target: "browser",
});

/**
 * Returns Bun.build options for the builder scene editor client bundle.
 *
 * @returns Static-build options.
 */
export const createBuilderSceneEditorBuildOptions = (): BunBuildOptions => ({
  entrypoints: [assetPipelinePaths.builderSceneEditorEntryPath],
  outdir: assetPipelinePaths.builderSceneEditorOutdir,
  naming: assetRelativePaths.builderSceneEditorBundleFile,
  minify: true,
  target: "browser",
});

/**
 * Resolves an ONNX WASM source file to its destination path under `/public/onnx`.
 *
 * @param fileName File name discovered in the source directory.
 * @returns Source and destination absolute paths.
 */
export const resolveOnnxWasmCopyPaths = (
  fileName: string,
): {
  readonly sourcePath: string;
  readonly destinationPath: string;
} => ({
  sourcePath: resolveFromRoot(assetPipelinePaths.onnxWasmSourceDirectory, fileName),
  destinationPath: resolveFromRoot(assetPipelinePaths.onnxWasmDestinationDirectory, fileName),
});

/**
 * Returns Bun.build options for standalone client module bundles.
 *
 * @returns Static-build options.
 */
export const createClientModulesBuildOptions = (): BunBuildOptions => ({
  entrypoints: [...clientModuleEntryPaths],
  outdir: assetPipelinePaths.clientModulesOutdir,
  minify: true,
  target: "browser",
});

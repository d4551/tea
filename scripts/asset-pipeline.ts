import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appConfig } from "../src/config/environment.ts";
import {
  assetRelativePaths,
  getHtmxExtensionEntryPaths,
  joinLocalPath,
} from "../src/shared/constants/assets.ts";

type BunBuildOptions = Parameters<typeof Bun.build>[0];

const resolvePackagePath = (specifier: string): string =>
  fileURLToPath(import.meta.resolve(specifier));

const findPackageRoot = (resolvedModulePath: string, packageName: string): string => {
  let currentPath = resolvedModulePath;

  while (true) {
    const nextPath = resolve(currentPath, "..");
    const packageJsonPath = join(nextPath, "package.json");

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
        readonly name?: string;
      };
      if (packageJson.name === packageName) {
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
const transformersPackageRoot = findPackageRoot(
  resolvePackagePath("@huggingface/transformers"),
  "@huggingface/transformers",
);

/**
 * Canonical Bun asset-pipeline paths shared by build and watch scripts.
 */
export const assetPipelinePaths = {
  projectRoot: resolve(import.meta.dir, ".."),
  outputStylesheetPath: joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.stylesheetOutputFile,
  ),
  gameClientOutputDirectory: appConfig.playableGame.sourceDirectory,
  htmxExtensionsOutputDirectory: joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.htmxExtensionsOutputDirectory,
  ),
  gameClientEntryPath: resolve(
    resolve(import.meta.dir, ".."),
    assetRelativePaths.playableGameClientEntryFile,
  ),
  builderSceneEditorEntryPath: resolve(
    resolve(import.meta.dir, ".."),
    assetRelativePaths.builderSceneEditorEntryFile,
  ),
  gameClientOutdir: resolve(resolve(import.meta.dir, ".."), appConfig.playableGame.sourceDirectory),
  builderSceneEditorOutdir: resolve(
    resolve(import.meta.dir, ".."),
    appConfig.staticAssets.publicDirectory,
  ),
  htmxExtensionsOutdir: resolve(
    resolve(import.meta.dir, ".."),
    joinLocalPath(
      appConfig.staticAssets.publicDirectory,
      assetRelativePaths.htmxExtensionsOutputDirectory,
    ),
  ),
  htmxSourcePath: htmxBundlePath,
  htmxDestinationPath: resolve(
    resolve(import.meta.dir, ".."),
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
  ),
  onnxWasmSourceDirectory: join(transformersPackageRoot, "dist"),
  onnxWasmDestinationDirectory: resolve(
    resolve(import.meta.dir, ".."),
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.onnxPublicDirectory),
  ),
} as const;

/**
 * Canonical HTMX extension entrypoint paths.
 */
export const htmxExtensionEntryPaths = getHtmxExtensionEntryPaths().map((entryPath) =>
  resolve(assetPipelinePaths.projectRoot, entryPath),
);

/**
 * Canonical Bun entry-naming pattern for the playable game bundle.
 */
export const gameClientEntryNaming = assetRelativePaths.gameClientBundleFile.replace(
  /\.js$/u,
  ".[ext]",
);

/**
 * Returns the Tailwind CLI command for either a build or watch run.
 *
 * @param watch Whether Tailwind should stay resident in watch mode.
 * @returns Bun command array.
 */
export const createTailwindCommand = (watch: boolean): readonly string[] => [
  "bunx",
  "tailwindcss",
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
  sourcePath: join(assetPipelinePaths.onnxWasmSourceDirectory, fileName),
  destinationPath: join(assetPipelinePaths.onnxWasmDestinationDirectory, fileName),
});

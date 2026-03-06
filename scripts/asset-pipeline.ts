import { join, resolve } from "node:path";
import { appConfig } from "../src/config/environment.ts";
import {
  assetRelativePaths,
  getHtmxExtensionEntryPaths,
  joinLocalPath,
} from "../src/shared/constants/assets.ts";

type BunBuildOptions = Parameters<typeof Bun.build>[0];

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
  gameClientOutdir: resolve(resolve(import.meta.dir, ".."), appConfig.playableGame.sourceDirectory),
  htmxExtensionsOutdir: resolve(
    resolve(import.meta.dir, ".."),
    joinLocalPath(
      appConfig.staticAssets.publicDirectory,
      assetRelativePaths.htmxExtensionsOutputDirectory,
    ),
  ),
  htmxSourcePath: resolve(resolve(import.meta.dir, ".."), assetRelativePaths.htmxNodeModuleBundle),
  htmxDestinationPath: resolve(
    resolve(import.meta.dir, ".."),
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
  ),
  onnxWasmSourceDirectory: resolve(
    resolve(import.meta.dir, ".."),
    "node_modules/@huggingface/transformers/dist",
  ),
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

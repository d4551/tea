import { join, resolve } from "node:path";
import { appConfig } from "../src/config/environment.ts";
import { createLogger } from "../src/lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../src/shared/constants/assets.ts";

const logger = createLogger("build-assets");
const projectRoot = resolve(import.meta.dir, "..");
const outputStylesheetPath = joinLocalPath(
  appConfig.staticAssets.publicDirectory,
  assetRelativePaths.stylesheetOutputFile,
);
const gameClientEntryPath = resolve(projectRoot, assetRelativePaths.playableGameClientEntryFile);
const gameClientOutdir = resolve(projectRoot, appConfig.playableGame.sourceDirectory);
const htmxExtensionsOutdir = resolve(
  projectRoot,
  joinLocalPath(appConfig.staticAssets.publicDirectory, "vendor/htmx-ext"),
);
const htmxSourcePath = resolve(projectRoot, assetRelativePaths.htmxNodeModuleBundle);
const htmxDestinationPath = resolve(
  projectRoot,
  joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.htmxPublicBundleFile),
);
const htmxExtensionEntryFiles = ["game-hud.ts", "oracle-indicator.ts", "focus-panel.ts"] as const;
const htmxExtensionEntryPaths = htmxExtensionEntryFiles.map((fileName) =>
  resolve(projectRoot, assetRelativePaths.htmxExtensionsSourceDirectory, fileName),
);
const gameClientEntryNaming = assetRelativePaths.gameClientBundleFile.replace(/\.js$/u, ".[ext]");
type BuildLogs = Awaited<ReturnType<typeof Bun.build>>["logs"];

const serializeBuildLogs = (logs: BuildLogs): readonly string[] =>
  logs.map((log) => Bun.inspect(log));

const run = async (command: readonly string[]): Promise<number> => {
  const process = Bun.spawn({
    cmd: [...command],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  return process.exited;
};

const buildTailwindCss = async (): Promise<void> => {
  logger.info("css.build.started");

  const exitCode = await run([
    "bunx",
    "tailwindcss",
    "-i",
    assetRelativePaths.sourceStylesheet,
    "-o",
    outputStylesheetPath,
    "--minify",
  ]);

  if (exitCode !== 0) {
    throw new Error(`Tailwind build failed with exit code ${exitCode}.`);
  }

  logger.info("css.build.completed", {
    output: outputStylesheetPath,
  });
};

const copyHtmxBundle = async (): Promise<void> => {
  await Bun.write(htmxDestinationPath, Bun.file(htmxSourcePath));

  logger.info("htmx.bundle.copied", {
    source: htmxSourcePath,
    destination: htmxDestinationPath,
  });
};

const buildGameClient = async (): Promise<void> => {
  logger.info("game-client.build.started");
  const result = await Bun.build({
    entrypoints: [gameClientEntryPath],
    outdir: gameClientOutdir,
    naming: gameClientEntryNaming,
    minify: true,
    target: "browser",
  });

  if (!result.success) {
    logger.error("game-client.build.failed", {
      logCount: result.logs.length,
      logs: serializeBuildLogs(result.logs),
    });
    throw new Error("Game client build failed");
  }

  logger.info("game-client.build.completed", {
    outputs: result.outputs.map((output) => output.path),
  });
};

const buildHtmxExtensions = async (): Promise<void> => {
  logger.info("htmx.extensions.build.started");
  const result = await Bun.build({
    entrypoints: [...htmxExtensionEntryPaths],
    outdir: htmxExtensionsOutdir,
    minify: true,
    target: "browser",
  });

  if (!result.success) {
    logger.error("htmx.extensions.build.failed", {
      logCount: result.logs.length,
      logs: serializeBuildLogs(result.logs),
    });
    throw new Error("HTMX extension build failed");
  }

  logger.info("htmx.extensions.build.completed", {
    outputs: result.outputs.map((output) => output.path),
  });
};

const copyOnnxWasm = async (): Promise<void> => {
  const wasmSrc = resolve(projectRoot, "node_modules/@huggingface/transformers/dist");
  const wasmDest = resolve(
    projectRoot,
    joinLocalPath(appConfig.staticAssets.publicDirectory, assetRelativePaths.onnxPublicDirectory),
  );

  const glob = new Bun.Glob("*.wasm");
  const wasmFiles: string[] = [];

  for await (const entry of glob.scan({ cwd: wasmSrc, absolute: false })) {
    const srcPath = join(wasmSrc, entry);
    const destPath = join(wasmDest, entry);
    await Bun.write(destPath, Bun.file(srcPath));
    wasmFiles.push(entry);
  }

  logger.info("onnx.wasm.copied", { count: wasmFiles.length, dest: wasmDest });
};

await buildTailwindCss();
await copyHtmxBundle();
await copyOnnxWasm();
await buildHtmxExtensions();
await buildGameClient();

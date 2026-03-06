import { createLogger } from "../src/lib/logger.ts";
import {
  assetPipelinePaths,
  createGameClientBuildOptions,
  createHtmxExtensionBuildOptions,
  createTailwindCommand,
  resolveOnnxWasmCopyPaths,
} from "./asset-pipeline.ts";

const logger = createLogger("build-assets");
type BuildLogs = Awaited<ReturnType<typeof Bun.build>>["logs"];

const serializeBuildLogs = (logs: BuildLogs): readonly string[] =>
  logs.map((log) => Bun.inspect(log));

const run = async (command: readonly string[]): Promise<number> => {
  const process = Bun.spawn({
    cmd: [...command],
    cwd: assetPipelinePaths.projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  return process.exited;
};

const buildTailwindCss = async (): Promise<void> => {
  logger.info("css.build.started");

  const exitCode = await run([...createTailwindCommand(false)]);

  if (exitCode !== 0) {
    throw new Error(`Tailwind build failed with exit code ${exitCode}.`);
  }

  logger.info("css.build.completed", {
    output: assetPipelinePaths.outputStylesheetPath,
  });
};

const copyHtmxBundle = async (): Promise<void> => {
  await Bun.write(
    assetPipelinePaths.htmxDestinationPath,
    Bun.file(assetPipelinePaths.htmxSourcePath),
  );

  logger.info("htmx.bundle.copied", {
    source: assetPipelinePaths.htmxSourcePath,
    destination: assetPipelinePaths.htmxDestinationPath,
  });
};

const buildGameClient = async (): Promise<void> => {
  logger.info("game-client.build.started");
  const result = await Bun.build(createGameClientBuildOptions());

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
  const result = await Bun.build(createHtmxExtensionBuildOptions());

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
  const glob = new Bun.Glob("*.wasm");
  const wasmFiles: string[] = [];

  for await (const entry of glob.scan({
    cwd: assetPipelinePaths.onnxWasmSourceDirectory,
    absolute: false,
  })) {
    const { sourcePath, destinationPath } = resolveOnnxWasmCopyPaths(entry);
    await Bun.write(destinationPath, Bun.file(sourcePath));
    wasmFiles.push(entry);
  }

  logger.info("onnx.wasm.copied", {
    count: wasmFiles.length,
    dest: assetPipelinePaths.onnxWasmDestinationDirectory,
  });
};

await buildTailwindCss();
await copyHtmxBundle();
await copyOnnxWasm();
await buildHtmxExtensions();
await buildGameClient();

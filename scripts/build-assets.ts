import { appConfig } from "../src/config/environment.ts";
import { createLogger } from "../src/lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../src/shared/constants/assets.ts";
import {
  assetPipelinePaths,
  createBuilderSceneEditorBuildOptions,
  createClientModulesBuildOptions,
  createGameClientBuildOptions,
  createHtmxExtensionBuildOptions,
  createTailwindCommand,
  resolveOnnxWasmCopyPaths,
} from "./asset-pipeline.ts";

const logger = createLogger("build-assets");
type BuildLogs = Awaited<ReturnType<typeof Bun.build>>["logs"];

const serializeBuildLogs = (logs: BuildLogs): readonly string[] =>
  logs.map((log) => Bun.inspect(log));

const nodeBuiltinImportPattern =
  /(?:\bimport\s+(?:[^'"`]+?\s+from\s+)?["']node:[^"']+["']|import\(\s*["']node:[^"']+["']\s*\)|require\(\s*["']node:[^"']+["']\s*\))/u;

const assertNoNodeBuiltinImports = async (assetPath: string): Promise<void> => {
  const contents = await Bun.file(assetPath).text();
  if (nodeBuiltinImportPattern.test(contents)) {
    throw new Error(`Browser bundle ${assetPath} contains node built-in imports.`);
  }
};

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

const copyHtmxSseExtension = async (): Promise<void> => {
  const destination = joinLocalPath(
    appConfig.staticAssets.publicDirectory,
    assetRelativePaths.htmxExtensionSseFile,
  );
  await Bun.write(destination, Bun.file(assetPipelinePaths.htmxSseExtensionSourcePath));
  logger.info("htmx.sse-extension.copied", {
    source: assetPipelinePaths.htmxSseExtensionSourcePath,
    destination,
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
  for (const output of result.outputs) {
    await assertNoNodeBuiltinImports(output.path);
  }
};

const buildBuilderSceneEditorClient = async (): Promise<void> => {
  logger.info("builder-scene-editor.build.started");
  const result = await Bun.build(createBuilderSceneEditorBuildOptions());

  if (!result.success) {
    logger.error("builder-scene-editor.build.failed", {
      logCount: result.logs.length,
      logs: serializeBuildLogs(result.logs),
    });
    throw new Error("Builder scene editor build failed");
  }

  logger.info("builder-scene-editor.build.completed", {
    outputs: result.outputs.map((output) => output.path),
  });
  for (const output of result.outputs) {
    await assertNoNodeBuiltinImports(output.path);
  }
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
  for (const output of result.outputs) {
    if (output.kind === "asset") {
      continue;
    }
    await assertNoNodeBuiltinImports(output.path);
  }
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

const buildClientModules = async (): Promise<void> => {
  const result = await Bun.build(createClientModulesBuildOptions());
  if (!result.success) {
    for (const log of serializeBuildLogs(result.logs)) {
      logger.error("client.modules.build.error", { message: log });
    }
    throw new Error("Client modules build failed.");
  }

  logger.info("client.modules.build.completed", {
    outputs: result.outputs.map((output) => output.path),
  });
  for (const output of result.outputs) {
    if (output.kind === "asset") {
      continue;
    }
    await assertNoNodeBuiltinImports(output.path);
  }
};

await buildTailwindCss();
await copyHtmxBundle();
await copyHtmxSseExtension();
await copyOnnxWasm();
await buildHtmxExtensions();
await buildGameClient();
await buildBuilderSceneEditorClient();
await buildClientModules();

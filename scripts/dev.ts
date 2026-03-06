import { resolve } from "node:path";
import { appConfig } from "../src/config/environment.ts";
import { createLogger } from "../src/lib/logger.ts";
import { assetRelativePaths, joinLocalPath } from "../src/shared/constants/assets.ts";

const logger = createLogger("dev-runner");
const projectRoot = resolve(import.meta.dir, "..");
const outputStylesheetPath = joinLocalPath(
  appConfig.staticAssets.publicDirectory,
  assetRelativePaths.stylesheetOutputFile,
);
const gameClientOutputDirectory = appConfig.playableGame.sourceDirectory;
const htmxExtensionsOutputDirectory = joinLocalPath(
  appConfig.staticAssets.publicDirectory,
  "vendor/htmx-ext",
);
const htmxExtensionEntryFiles = ["game-hud.ts", "oracle-indicator.ts", "focus-panel.ts"] as const;
const htmxExtensionEntryPaths = htmxExtensionEntryFiles.map((fileName) =>
  joinLocalPath(assetRelativePaths.htmxExtensionsSourceDirectory, fileName),
);
const gameClientEntryNaming = assetRelativePaths.gameClientBundleFile.replace(/\.js$/u, ".[ext]");

const run = async (command: readonly string[], label: string): Promise<number> => {
  logger.info("process.spawn", {
    label,
    command: command.join(" "),
  });

  const process = Bun.spawn({
    cmd: [...command],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  return process.exited;
};

const runBlockingSetup = async (): Promise<void> => {
  const setupExitCode = await run(["bun", "run", "scripts/build-assets.ts"], "setup:assets");
  if (setupExitCode !== 0) {
    throw new Error(`Setup failed with exit code ${setupExitCode}.`);
  }
};

type ShutdownSignal = "SIGINT" | "SIGTERM";

type ShutdownReason =
  | {
      readonly type: "signal";
      readonly signal: ShutdownSignal;
    }
  | {
      readonly type: "server-exit";
      readonly exitCode: number;
    };

const runWatchers = async (): Promise<void> => {
  const cssWatcher = Bun.spawn({
    cmd: [
      "bunx",
      "tailwindcss",
      "-i",
      assetRelativePaths.sourceStylesheet,
      "-o",
      outputStylesheetPath,
      "--watch=always",
    ],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const htmxExtensionWatcher = Bun.spawn({
    cmd: [
      "bun",
      "build",
      ...htmxExtensionEntryPaths,
      "--outdir",
      htmxExtensionsOutputDirectory,
      "--target",
      "browser",
      "--watch",
      "--minify",
    ],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const gameClientWatcher = Bun.spawn({
    cmd: [
      "bun",
      "build",
      assetRelativePaths.playableGameClientEntryFile,
      "--outdir",
      gameClientOutputDirectory,
      "--entry-naming",
      gameClientEntryNaming,
      "--target",
      "browser",
      "--watch",
      "--minify",
    ],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const serverWatcher = Bun.spawn({
    cmd: ["bun", "--watch", "run", "src/server.ts"],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const watcherProcesses = {
    cssWatcher,
    htmxExtensionWatcher,
    gameClientWatcher,
    serverWatcher,
  } as const;

  let shutdownReasonType: ShutdownReason["type"] | null = null;
  let shutdownSignal: ShutdownSignal | null = null;
  let shutdownExitCode = 0;

  const stopWatchers = (reason: ShutdownReason): void => {
    if (shutdownReasonType) {
      return;
    }

    shutdownReasonType = reason.type;

    if (reason.type === "signal") {
      shutdownSignal = reason.signal;
    } else {
      shutdownExitCode = reason.exitCode;
    }

    if (!watcherProcesses.cssWatcher.killed) {
      watcherProcesses.cssWatcher.kill("SIGTERM");
    }

    for (const watcher of Object.values(watcherProcesses)) {
      if (!watcher.killed) {
        watcher.kill("SIGTERM");
      }
    }
  };

  const handleSigInt = (): void => stopWatchers({ type: "signal", signal: "SIGINT" });
  const handleSigTerm = (): void => stopWatchers({ type: "signal", signal: "SIGTERM" });

  process.once("SIGINT", handleSigInt);
  process.once("SIGTERM", handleSigTerm);

  const observeWatcherExit = async (
    watcherName: keyof typeof watcherProcesses,
  ): Promise<number> => {
    try {
      const exitCode = await watcherProcesses[watcherName].exited;
      if (exitCode !== 0) {
        logger.error("watcher.terminated", { watcherName, exitCode });
      }
      if (!shutdownReasonType) {
        stopWatchers({ type: "server-exit", exitCode });
      }
      return exitCode;
    } catch (error: unknown) {
      logger.error("watcher.terminated.error", {
        watcherName,
        error: error instanceof Error ? error.message : String(error),
      });
      if (!shutdownReasonType) {
        stopWatchers({ type: "server-exit", exitCode: 1 });
      }
      return 1;
    }
  };

  const cssWatcherExited = observeWatcherExit("cssWatcher");
  const htmxExtensionWatcherExited = observeWatcherExit("htmxExtensionWatcher");
  const gameClientWatcherExited = observeWatcherExit("gameClientWatcher");
  const serverWatcherExited = observeWatcherExit("serverWatcher");

  try {
    const serverExitCode = await serverWatcherExited;
    const cssExitCode = await cssWatcherExited;
    const htmxExtensionExitCode = await htmxExtensionWatcherExited;
    const gameClientExitCode = await gameClientWatcherExited;

    const watcherTerminatedBySignal = watcherProcesses.serverWatcher.signalCode !== null;

    if (shutdownReasonType === "signal" && shutdownSignal) {
      logger.warn("process.shutdown", { signal: shutdownSignal });
      return;
    }

    if (
      shutdownReasonType === "server-exit" &&
      shutdownExitCode === 0 &&
      watcherTerminatedBySignal
    ) {
      logger.warn("process.shutdown", {
        signal: "external",
        watcher: "serverWatcher",
      });
      return;
    }

    if (shutdownReasonType === "server-exit" && serverExitCode === 0) {
      logger.warn("process.shutdown", {
        signal: "external",
        watcher: "serverWatcher",
        message: "server watcher exited cleanly before explicit shutdown",
      });
      return;
    }

    logger.error("watcher.termination.unexpected", {
      cssWatcherExitCode: cssExitCode,
      htmxExtensionExitCode,
      gameClientExitCode,
      serverWatcherExitCode: serverExitCode,
      cssWatcherSignal: watcherProcesses.cssWatcher.signalCode,
      htmxExtensionSignal: watcherProcesses.htmxExtensionWatcher.signalCode,
      gameClientSignal: watcherProcesses.gameClientWatcher.signalCode,
      serverWatcherSignal: watcherProcesses.serverWatcher.signalCode,
    });

    throw new Error(
      `Watcher terminated unexpectedly. cssWatcher=${cssExitCode}, htmxExtensionWatcher=${htmxExtensionExitCode}, gameClientWatcher=${gameClientExitCode}, serverWatcher=${serverExitCode}`,
    );
  } finally {
    process.off("SIGINT", handleSigInt);
    process.off("SIGTERM", handleSigTerm);
  }
};

await runBlockingSetup();
await runWatchers();

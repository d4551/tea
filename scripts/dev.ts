import { createLogger } from "../src/lib/logger.ts";
import { settleAsync } from "../src/shared/utils/async-result.ts";
import {
  assetPipelinePaths,
  createGameClientBuildCommand,
  createHtmxExtensionBuildCommand,
  createTailwindCommand,
} from "./asset-pipeline.ts";

const logger = createLogger("dev-runner");

const run = async (command: readonly string[], label: string): Promise<number> => {
  logger.info("process.spawn", {
    label,
    command: command.join(" "),
  });

  const process = Bun.spawn({
    cmd: [...command],
    cwd: assetPipelinePaths.projectRoot,
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

type WatcherProcess = ReturnType<typeof Bun.spawn>;

const runWatchers = async (): Promise<void> => {
  const cssWatcher = Bun.spawn({
    cmd: [...createTailwindCommand(true)],
    cwd: assetPipelinePaths.projectRoot,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const htmxExtensionWatcher = Bun.spawn({
    cmd: [...createHtmxExtensionBuildCommand(true)],
    cwd: assetPipelinePaths.projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const gameClientWatcher = Bun.spawn({
    cmd: [...createGameClientBuildCommand(true)],
    cwd: assetPipelinePaths.projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const serverWatcher = Bun.spawn({
    cmd: ["bun", "--watch", "run", "src/server.ts"],
    cwd: assetPipelinePaths.projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const watcherProcesses: {
    readonly cssWatcher: WatcherProcess;
    readonly htmxExtensionWatcher: WatcherProcess;
    readonly gameClientWatcher: WatcherProcess;
    readonly serverWatcher: WatcherProcess;
  } = {
    cssWatcher,
    htmxExtensionWatcher,
    gameClientWatcher,
    serverWatcher,
  };

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

  const detachSignalHandlers = (): void => {
    process.off("SIGINT", handleSigInt);
    process.off("SIGTERM", handleSigTerm);
  };

  const observeWatcherExit = async (
    watcherName: keyof typeof watcherProcesses,
  ): Promise<number> => {
    const exitResult = await settleAsync(watcherProcesses[watcherName].exited);

    if (exitResult.ok) {
      const { value: exitCode } = exitResult;
      if (exitCode !== 0) {
        logger.error("watcher.terminated", { watcherName, exitCode });
      }
      if (!shutdownReasonType) {
        stopWatchers({ type: "server-exit", exitCode });
      }
      return exitCode;
    }

    logger.error("watcher.terminated.error", {
      watcherName,
      error: exitResult.error.message,
    });
    if (!shutdownReasonType) {
      stopWatchers({ type: "server-exit", exitCode: 1 });
    }
    return 1;
  };

  const cssWatcherExited = observeWatcherExit("cssWatcher");
  const htmxExtensionWatcherExited = observeWatcherExit("htmxExtensionWatcher");
  const gameClientWatcherExited = observeWatcherExit("gameClientWatcher");
  const serverWatcherExited = observeWatcherExit("serverWatcher");

  const watcherExitCodes = await Promise.all([
    serverWatcherExited,
    cssWatcherExited,
    htmxExtensionWatcherExited,
    gameClientWatcherExited,
  ]);
  const [serverExitCode, cssExitCode, htmxExtensionExitCode, gameClientExitCode] = watcherExitCodes;
  const watcherTerminatedBySignal = watcherProcesses.serverWatcher.signalCode !== null;

  if (shutdownReasonType === "signal" && shutdownSignal) {
    detachSignalHandlers();
    logger.warn("process.shutdown", { signal: shutdownSignal });
    return;
  }

  if (shutdownReasonType === "server-exit" && shutdownExitCode === 0 && watcherTerminatedBySignal) {
    detachSignalHandlers();
    logger.warn("process.shutdown", {
      signal: "external",
      watcher: "serverWatcher",
    });
    return;
  }

  if (shutdownReasonType === "server-exit" && serverExitCode === 0) {
    detachSignalHandlers();
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

  detachSignalHandlers();
  throw new Error(
    `Watcher terminated unexpectedly. cssWatcher=${cssExitCode}, htmxExtensionWatcher=${htmxExtensionExitCode}, gameClientWatcher=${gameClientExitCode}, serverWatcher=${serverExitCode}`,
  );
};

await runBlockingSetup();
await runWatchers();

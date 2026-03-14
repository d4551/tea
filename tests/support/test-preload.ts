import { settleAsync } from "../../src/shared/utils/async-result.ts";
import {
  applyTestEnvironment,
  buildTestDatabaseUrl,
  testEnvDefaults,
  testPreloadConfig,
} from "./test-environment.ts";

const repositoryRoot = Bun.fileURLToPath(new URL("../../", import.meta.url));
const repositoryRootUrl = Bun.pathToFileURL(`${repositoryRoot.replace(/\\+/gu, "/")}/`);

const testDatabaseUrl = buildTestDatabaseUrl(
  repositoryRoot,
  `test-${process.pid}-${Date.now().toString(36)}.db`,
);
const testDatabaseFile = testDatabaseUrl.slice("file:".length);

await Promise.all(
  [
    testDatabaseFile,
    `${testDatabaseFile}-journal`,
    `${testDatabaseFile}-shm`,
    `${testDatabaseFile}-wal`,
  ].map(async (candidatePath) => {
    const result = await settleAsync(Bun.file(candidatePath).delete());
    if (!result.ok) {
      return;
    }
  }),
);

applyTestEnvironment(testPreloadConfig(testDatabaseUrl));

const schemaScriptPath = Bun.fileURLToPath(
  new URL(`prisma/test-schema-${process.pid}-${Date.now().toString(36)}.sql`, repositoryRootUrl),
);

const diffResult = Bun.spawnSync(
  [
    "bunx",
    "--bun",
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  {
    cwd: repositoryRoot,
    env: Bun.env,
    stderr: "pipe",
    stdout: "pipe",
  },
);

if (diffResult.exitCode !== 0) {
  throw new Error(
    `Failed to generate isolated test database schema: ${new TextDecoder().decode(diffResult.stderr)}`,
  );
}

await Bun.write(schemaScriptPath, diffResult.stdout);

const bootstrapResult = Bun.spawnSync(
  ["bunx", "--bun", "prisma", "db", "execute", "--file", schemaScriptPath],
  {
    cwd: repositoryRoot,
    env: {
      ...Bun.env,
      [testEnvDefaults.databaseUrlKey]: testDatabaseUrl,
    },
    stderr: "pipe",
    stdout: "pipe",
  },
);

await settleAsync(Bun.file(schemaScriptPath).delete());

if (bootstrapResult.exitCode !== 0) {
  throw new Error(
    `Failed to initialize isolated test database: ${new TextDecoder().decode(bootstrapResult.stderr)}`,
  );
}

const { afterAll } = await import("bun:test");
const { cleanupTestDatabase, disconnectTestPrisma, disposeTestProviders } = await import(
  "./test-runtime.ts"
);

afterAll(async () => {
  await disposeTestProviders();
  await disconnectTestPrisma();
  await cleanupTestDatabase();
});

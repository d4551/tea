import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const testDatabaseFile = resolve(
  process.cwd(),
  "prisma",
  `test-${process.pid}-${Date.now().toString(36)}.db`,
);
const testDatabaseUrl = `file:${testDatabaseFile}`;

mkdirSync(dirname(testDatabaseFile), { recursive: true });
rmSync(testDatabaseFile, { force: true });
rmSync(`${testDatabaseFile}-journal`, { force: true });
rmSync(`${testDatabaseFile}-shm`, { force: true });
rmSync(`${testDatabaseFile}-wal`, { force: true });

process.env.DATABASE_URL = testDatabaseUrl;
Bun.env.DATABASE_URL = testDatabaseUrl;
process.env.NODE_ENV = "test";
Bun.env.NODE_ENV = "test";
process.env.AI_LOCAL_EMBEDDINGS_ENABLED = "false";
Bun.env.AI_LOCAL_EMBEDDINGS_ENABLED = "false";
process.env.BUILDER_LOCAL_AUTOMATION_ORIGIN = "http://127.0.0.1:1";
Bun.env.BUILDER_LOCAL_AUTOMATION_ORIGIN = "http://127.0.0.1:1";

const schemaScriptPath = resolve(
  process.cwd(),
  "prisma",
  `test-schema-${process.pid}-${Date.now().toString(36)}.sql`,
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
    cwd: process.cwd(),
    env: process.env,
    stderr: "pipe",
    stdout: "pipe",
  },
);

if (diffResult.exitCode !== 0) {
  throw new Error(
    `Failed to generate isolated test database schema: ${new TextDecoder().decode(diffResult.stderr)}`,
  );
}

writeFileSync(schemaScriptPath, Buffer.from(diffResult.stdout));

const bootstrapResult = Bun.spawnSync(
  ["bunx", "--bun", "prisma", "db", "execute", "--file", schemaScriptPath],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stderr: "pipe",
    stdout: "pipe",
  },
);

rmSync(schemaScriptPath, { force: true });

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

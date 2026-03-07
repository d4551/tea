/**
 * Applies the current Prisma schema to the configured datasource using a Bun-native
 * `migrate diff` -> `db execute --stdin` workflow.
 *
 * This follows Prisma's documented non-interactive automation pattern while still
 * ensuring the runtime database matches the checked-in schema before boot or setup
 * completes.
 */
const applyPrismaSchema = async (): Promise<void> => {
  const diff = Bun.spawn({
    cmd: [
      "bunx",
      "--bun",
      "prisma",
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--script",
    ],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });

  const execute = Bun.spawn({
    cmd: ["bunx", "--bun", "prisma", "db", "execute", "--stdin"],
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "pipe",
    stdin: diff.stdout,
  });

  const [diffError, executeError, diffExitCode, executeExitCode] = await Promise.all([
    new Response(diff.stderr).text(),
    new Response(execute.stderr).text(),
    diff.exited,
    execute.exited,
  ]);

  if (diffExitCode !== 0) {
    throw new Error(`Failed to generate Prisma schema diff: ${diffError.trim()}`);
  }

  if (executeExitCode !== 0) {
    throw new Error(`Failed to apply Prisma schema: ${executeError.trim()}`);
  }
};

await applyPrismaSchema();

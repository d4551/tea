import { createLogger } from "../src/lib/logger.ts";

interface ArchiveEntry {
  /** Source markdown path in repo at archive time. */
  readonly sourcePath: string;
  /** Archive destination path for plain-text migration artifact. */
  readonly archivePath: string;
  /** SHA-256 digest of archived artifact text. */
  readonly sha256: string;
  /** Archive payload length in characters or bytes used by source process. */
  readonly sizeBytes: number;
  /** UTC timestamp for archive creation. */
  readonly archivedAt: string;
}

interface ArchiveManifest {
  /** Manifest schema marker for archive compatibility checks. */
  readonly schemaVersion: number;
  /** Manifest generation time. */
  readonly generatedAt: string;
  /** Archive entries representing prior markdown documents. */
  readonly entries: readonly ArchiveEntry[];
}

const REQUIRED_SOURCE_PATHS = [
  "README.md",
  "README.zh-CN.md",
  "ARCHITECTURE.md",
  "docs/index.md",
  "docs/htmx-extensions.md",
  "docs/playable-runtime.md",
  "docs/local-ai-runtime.md",
  "docs/operator-runbook.md",
  "docs/api-contracts.md",
  "docs/builder-domain.md",
  "docs/rmmz-pack.md",
  "docs/maintenance-audit-2026-03-10.md",
  "LOTFK_RMMZ_Agentic_Pack/README.md",
  "LOTFK_RMMZ_Agentic_Pack/PLUGIN_SPEC.md",
  "LOTFK_RMMZ_Agentic_Pack/EVENT_HOOKUPS.md",
  "LOTFK_RMMZ_Agentic_Pack/STATUS.md",
] as const;

const archiveRoot = "notes/doc-archive";
const manifestPath = `${archiveRoot}/index.json`;

const toArchivePath = (sourcePath: string): string => {
  const normalized = sourcePath.replace(/\\/gu, "/").replace(/\.md$/u, ".txt");
  return `${archiveRoot}/${normalized.replaceAll("/", "__")}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const logger = createLogger("docs-surface-check");

const readManifest = async (): Promise<ArchiveManifest | null> => {
  const manifestFile = Bun.file(manifestPath);
  if (!(await manifestFile.exists())) {
    return null;
  }

  let parsed: unknown;
  try {
    const contents = await manifestFile.text();
    parsed = JSON.parse(contents);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  const entries = parsed.entries;
  if (!Array.isArray(entries)) {
    return null;
  }

  return {
    schemaVersion: typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : -1,
    generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : "",
    entries: entries as ArchiveEntry[],
  };
};

const main = async (): Promise<void> => {
  const errors: string[] = [];
  const manifest = await readManifest();

  if (!manifest) {
    errors.push(`Missing or unreadable archive manifest: ${manifestPath}`);
  } else {
    if (!Number.isFinite(manifest.schemaVersion) || manifest.schemaVersion <= 0) {
      errors.push(`Invalid archive manifest schema version in ${manifestPath}`);
    }
    if (typeof manifest.generatedAt !== "string" || manifest.generatedAt.length === 0) {
      errors.push(`Missing manifest generatedAt in ${manifestPath}`);
    }
    if (manifest.entries.length === 0) {
      errors.push(`Archive manifest is empty: ${manifestPath}`);
    }

    const entryBySource = new Map<string, ArchiveEntry>();
    for (const entry of manifest.entries) {
      if (!entry || typeof entry.sourcePath !== "string" || typeof entry.archivePath !== "string") {
        errors.push(`Invalid manifest entry in ${manifestPath}: ${JSON.stringify(entry)}`);
        continue;
      }
      if (typeof entry.sha256 !== "string" || entry.sha256.length === 0) {
        errors.push(`Archive entry missing sha256: ${entry.sourcePath}`);
      }
      if (
        typeof entry.sizeBytes !== "number" ||
        !Number.isFinite(entry.sizeBytes) ||
        entry.sizeBytes < 0
      ) {
        errors.push(`Archive entry has invalid sizeBytes: ${entry.sourcePath}`);
      }
      if (typeof entry.archivedAt !== "string" || entry.archivedAt.length === 0) {
        errors.push(`Archive entry missing archivedAt: ${entry.sourcePath}`);
      }

      const expectedArchivePath = toArchivePath(entry.sourcePath);
      if (entry.archivePath !== expectedArchivePath) {
        errors.push(
          `Archive path mismatch for ${entry.sourcePath}: expected ${expectedArchivePath}, found ${entry.archivePath}`,
        );
      }
      entryBySource.set(entry.sourcePath, entry);
    }

    for (const sourcePath of REQUIRED_SOURCE_PATHS) {
      const entry = entryBySource.get(sourcePath);
      if (!entry) {
        errors.push(`Archive manifest missing source: ${sourcePath}`);
        continue;
      }

      if (entry.sourcePath !== sourcePath) {
        errors.push(
          `Archive source path mismatch: manifest entry ${entry.sourcePath} vs ${sourcePath}`,
        );
        continue;
      }

      if (!(await Bun.file(entry.archivePath).exists())) {
        errors.push(`Archive artifact missing: ${entry.archivePath}`);
      }
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      logger.error("docs.surface.failed", { message: error });
    }
    process.exitCode = 1;
    return;
  }

  logger.info("docs.surface.passed", {
    requiredCount: REQUIRED_SOURCE_PATHS.length,
    archiveRoot,
    manifestPath,
  });
};

await main();

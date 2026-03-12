import { settleAsync } from "../src/shared/utils/async-result.ts";
import { createLogger } from "../src/lib/logger.ts";
import { safeJsonParse } from "../src/shared/utils/safe-json.ts";

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

type DocumentPair = {
  readonly en: string;
  readonly zh?: string;
};

const DOCUMENT_PAIRS: readonly DocumentPair[] = [
  { en: "README.md" },
  { en: "ARCHITECTURE.md", zh: "ARCHITECTURE.zh-CN.md" },
  { en: "docs/index.md", zh: "docs/index.zh-CN.md" },
  { en: "docs/htmx-extensions.md", zh: "docs/htmx-extensions.zh-CN.md" },
  { en: "docs/playable-runtime.md", zh: "docs/playable-runtime.zh-CN.md" },
  { en: "docs/local-ai-runtime.md", zh: "docs/local-ai-runtime.zh-CN.md" },
  { en: "docs/operator-runbook.md", zh: "docs/operator-runbook.zh-CN.md" },
  { en: "docs/api-contracts.md", zh: "docs/api-contracts.zh-CN.md" },
  { en: "docs/builder-domain.md", zh: "docs/builder-domain.zh-CN.md" },
  { en: "docs/rmmz-pack.md", zh: "docs/rmmz-pack.zh-CN.md" },
  { en: "docs/maintenance-audit-2026-03-10.md", zh: "docs/maintenance-audit-2026-03-10.zh-CN.md" },
  { en: "LOTFK_RMMZ_Agentic_Pack/README.md", zh: "LOTFK_RMMZ_Agentic_Pack/README.zh-CN.md" },
  {
    en: "LOTFK_RMMZ_Agentic_Pack/PLUGIN_SPEC.md",
    zh: "LOTFK_RMMZ_Agentic_Pack/PLUGIN_SPEC.zh-CN.md",
  },
  {
    en: "LOTFK_RMMZ_Agentic_Pack/EVENT_HOOKUPS.md",
    zh: "LOTFK_RMMZ_Agentic_Pack/EVENT_HOOKUPS.zh-CN.md",
  },
  { en: "LOTFK_RMMZ_Agentic_Pack/STATUS.md", zh: "LOTFK_RMMZ_Agentic_Pack/STATUS.zh-CN.md" },
];

const REQUIRED_SOURCE_PATHS: readonly string[] = DOCUMENT_PAIRS.flatMap((pair) =>
  pair.zh === undefined ? [pair.en] : [pair.en, pair.zh],
);

const archiveRoot = "notes/doc-archive";
const manifestPath = `${archiveRoot}/index.json`;

const toArchivePath = (sourcePath: string): string => {
  const normalized = sourcePath.replace(/\\/gu, "/").replace(/\.md$/u, ".txt");
  return `${archiveRoot}/${normalized.replaceAll("/", "__")}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const isArchiveEntry = (value: unknown): value is ArchiveEntry => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.sourcePath === "string" &&
    typeof value.archivePath === "string" &&
    typeof value.sha256 === "string" &&
    typeof value.sizeBytes === "number" &&
    typeof value.archivedAt === "string"
  );
};

const logger = createLogger("docs-surface-check");

const readManifest = async (): Promise<ArchiveManifest | null> => {
  const manifestFile = Bun.file(manifestPath);
  if (!(await manifestFile.exists())) {
    return null;
  }

  const manifestText = await settleAsync(manifestFile.text());
  if (!manifestText.ok) {
    return null;
  }

  const parsed = safeJsonParse<unknown>(manifestText.value, null);
  if (!isRecord(parsed)) {
    return null;
  }
  const entries = parsed.entries;
  if (!Array.isArray(entries)) {
    return null;
  }

  const validEntries: ArchiveEntry[] = [];
  for (const entry of entries) {
    if (!isArchiveEntry(entry)) {
      return null;
    }
    validEntries.push(entry);
  }

  return {
    schemaVersion: typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : -1,
    generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : "",
    entries: validEntries,
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

    for (const pair of DOCUMENT_PAIRS) {
      const enEntry = entryBySource.get(pair.en);
      if (!enEntry) {
        errors.push(`Archive manifest missing source: ${pair.en}`);
        continue;
      }
      if (!(await Bun.file(enEntry.archivePath).exists())) {
        errors.push(`Archive artifact missing: ${enEntry.archivePath}`);
      }

      if (pair.zh !== undefined) {
        const zhEntry = entryBySource.get(pair.zh);
        if (!zhEntry) {
          errors.push(`Archive manifest missing source: ${pair.zh}`);
          continue;
        }
        if (!(await Bun.file(zhEntry.archivePath).exists())) {
          errors.push(`Archive artifact missing: ${zhEntry.archivePath}`);
        }
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

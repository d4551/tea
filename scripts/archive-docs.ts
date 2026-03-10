import { createLogger } from "../src/lib/logger.ts";

/**
 * Archive manifest entry for one markdown source.
 */
interface ArchiveEntry {
  /** Source markdown file path relative to the repo root. */
  readonly sourcePath: string;
  /** Archived plaintext artifact path. */
  readonly archivePath: string;
  /** SHA-256 digest of archived text. */
  readonly sha256: string;
  /** Byte length of archived text. */
  readonly sizeBytes: number;
  /** Timestamp when archived. */
  readonly archivedAt: string;
}

/**
 * Machine-readable manifest for markdown-to-text archival operations.
 */
interface ArchiveManifest {
  /** Manifest schema version. */
  readonly schemaVersion: number;
  /** Manifest generation timestamp. */
  readonly generatedAt: string;
  /** Machine-tracked entries. */
  readonly entries: readonly ArchiveEntry[];
}

const logger = createLogger("script.archive-docs");

const sourceMarkdownPaths = [
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

const parseMode = (): { readonly deleteSources: boolean; readonly clearSources: boolean } => {
  return {
    deleteSources: process.argv.includes("--delete"),
    clearSources: process.argv.includes("--clear"),
  };
};

const replaceAllLiteral = (input: string, from: string, to: string): string => {
  if (!from) {
    return input;
  }
  return input.split(from).join(to);
};

const sha256Hex = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hashValues = [...new Uint8Array(hash)];
  return hashValues.map((digit) => digit.toString(16).padStart(2, "0")).join("");
};

const buildLinkRewriteMap = (): readonly ArchiveEntry[] =>
  sourceMarkdownPaths.map((sourcePath) => {
    const archivePath = toArchivePath(sourcePath);
    return {
      sourcePath,
      archivePath,
      sha256: "",
      sizeBytes: 0,
      archivedAt: "",
    };
  });

const rewriteSourceLinks = (
  sourcePath: string,
  sourceText: string,
  archiveEntries: readonly ArchiveEntry[],
): string => {
  const cwd = process.cwd().replace(/\\/gu, "/");
  let rewritten = sourceText;

  for (const entry of archiveEntries) {
    const absolute = `${cwd}/${entry.sourcePath}`;
    rewritten = replaceAllLiteral(rewritten, `(${absolute})`, `(${entry.archivePath})`);

    const relative = `./${entry.sourcePath}`;
    rewritten = replaceAllLiteral(rewritten, relative, entry.archivePath);
  }

  if (sourcePath === "README.md" || sourcePath === "README.zh-CN.md") {
    rewritten = replaceAllLiteral(rewritten, "./docs/index.md", toArchivePath("docs/index.md"));
    rewritten = replaceAllLiteral(rewritten, "./ARCHITECTURE.md", toArchivePath("ARCHITECTURE.md"));
  }

  return rewritten;
};

const run = async (): Promise<void> => {
  const { clearSources, deleteSources } = parseMode();

  const archiveEntries = buildLinkRewriteMap();
  const producedEntries: ArchiveEntry[] = [];

  for (const sourcePath of sourceMarkdownPaths) {
    const sourceFile = Bun.file(sourcePath);
    if (!(await sourceFile.exists())) {
      throw new Error(`Missing required source markdown file: ${sourcePath}`);
    }

    const sourceText = (await sourceFile.text()).trimEnd();
    const rewritten = rewriteSourceLinks(sourcePath, sourceText, archiveEntries);
    const archivePath = toArchivePath(sourcePath);
    await Bun.write(archivePath, `${rewritten}\n`);
    const archivedText = await Bun.file(archivePath).text();
    const timestamp = new Date().toISOString();

    producedEntries.push({
      sourcePath,
      archivePath,
      sha256: await sha256Hex(archivedText),
      sizeBytes: archivedText.length,
      archivedAt: timestamp,
    });

    if (deleteSources) {
      await Bun.file(sourcePath).unlink();
      logger.info("docs.archive.deleted", { sourcePath });
      continue;
    }

    if (clearSources) {
      await Bun.write(sourcePath, "");
      logger.info("docs.archive.cleared", { sourcePath });
    }
  }

  const manifest: ArchiveManifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    entries: producedEntries,
  };

  await Bun.write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  logger.info("docs.archive.completed", {
    sourceCount: sourceMarkdownPaths.length,
    archiveCount: producedEntries.length,
    manifestPath,
  });
};

await run();

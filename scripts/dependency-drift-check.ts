import { createLogger } from "../src/lib/logger.ts";

/**
 * Minimal package manifest schema used by dependency drift check.
 */
interface PackageManifest {
  /** Runtime dependency declarations. */
  readonly dependencies?: Record<string, string>;
  /** Development dependency declarations. */
  readonly devDependencies?: Record<string, string>;
}

/**
 * Parsed semantic version components.
 */
interface ParsedSemver {
  /** Major version component. */
  readonly major: number;
  /** Minor version component. */
  readonly minor: number;
  /** Patch version component. */
  readonly patch: number;
  /** Optional prerelease identifier. */
  readonly prerelease: string | null;
}

/**
 * Dependency check outcome payload.
 */
interface DriftCheckResult {
  /** Exit status contract for consumers. */
  readonly ok: boolean;
  /** Hard failures that should fail the CI check. */
  readonly errors: readonly string[];
  /** Non-blocking warnings (for policy exceptions). */
  readonly warnings: readonly string[];
  /** Number of manifest entries reviewed by the policy. */
  readonly trackedCount: number;
  /** Number of trackable entries with successful latest-version lookups. */
  readonly resolvedCount: number;
  /** Number of trackable entries that were not evaluated due to missing or invalid data. */
  readonly skippedCount: number;
}

type DependencyKind = "dependencies" | "devDependencies";

/**
 * Dependency declaration in a manifest.
 */
interface DependencyEntry {
  /** Dependency package name. */
  readonly name: string;
  /** Requested version spec from manifest. */
  readonly spec: string;
  /** Source manifest path. */
  readonly source: string;
  /** Manifest declaration section. */
  readonly kind: DependencyKind;
}

const logger = createLogger("dependency-drift-check");
const exactSemverRegex =
  /^v?(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>[\w.-]+))?$/u;
const normalizedPrefixRegex = /^[~^<>]=?\s*/u;
const knownPolicy: Readonly<Record<string, { readonly allowPatchDriftWith: string | null }>> = {
  "@types/three": { allowPatchDriftWith: "three" },
};
const allowedNonPinned: ReadonlySet<string> = new Set(["sqlite-vec"]);

const parseSemver = (value: string): ParsedSemver | null => {
  const match = exactSemverRegex.exec(value.trim());
  if (!match?.groups) {
    return null;
  }

  const major = match.groups.major;
  const minor = match.groups.minor;
  const patch = match.groups.patch;
  if (!major || !minor || !patch) {
    return null;
  }

  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
    prerelease: match.groups.prerelease ?? null,
  };
};

const toComparableSpec = (rawSpec: string): string | null => {
  const trimmed = rawSpec.trim();
  if (trimmed === "*" || trimmed === "") {
    return null;
  }

  return trimmed.replace(normalizedPrefixRegex, "").trim();
};

const resolveManifestPaths = async (): Promise<readonly string[]> => {
  const workspaceManifests = await Array.fromAsync(new Bun.Glob("packages/*/package.json").scan());
  return ["package.json", ...workspaceManifests];
};

const collectDependencyEntries = async (): Promise<readonly DependencyEntry[]> => {
  const manifestPaths = await resolveManifestPaths();
  const entries: DependencyEntry[] = [];

  for (const manifestPath of manifestPaths) {
    const manifest = JSON.parse(await Bun.file(manifestPath).text()) as PackageManifest;

    for (const [kind, deps] of [
      ["dependencies", manifest.dependencies ?? {}],
      ["devDependencies", manifest.devDependencies ?? {}],
    ] as const) {
      for (const [name, spec] of Object.entries(deps)) {
        entries.push({
          name,
          spec,
          source: manifestPath,
          kind: kind,
        });
      }
    }
  }

  return entries;
};

const compareSemver = (left: ParsedSemver, right: ParsedSemver): number => {
  if (left.major !== right.major) {
    return left.major < right.major ? -1 : 1;
  }
  if (left.minor !== right.minor) {
    return left.minor < right.minor ? -1 : 1;
  }
  if (left.patch !== right.patch) {
    return left.patch < right.patch ? -1 : 1;
  }

  if (left.prerelease === right.prerelease) {
    return 0;
  }
  if (left.prerelease === null) {
    return 1;
  }
  if (right.prerelease === null) {
    return -1;
  }

  return left.prerelease < right.prerelease ? -1 : 1;
};

const fetchLatestVersion = async (packageName: string): Promise<string> => {
  const process = Bun.spawn({
    cmd: ["bun", "pm", "view", packageName, "version"],
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = await new Response(process.stdout).text();
  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(`bun pm view failed for ${packageName}`);
  }

  return output.trim();
};

const isWorkspaceSpec = (spec: string): boolean => spec.startsWith("workspace:");
const isLocalSpec = (spec: string): boolean => spec.startsWith("file:") || spec.startsWith("link:");
const isRangeOrFloatSpec = (spec: string): boolean => normalizedPrefixRegex.test(spec.trim());
const shouldTrackDependency = (entry: DependencyEntry): boolean => {
  if (isWorkspaceSpec(entry.spec) || isLocalSpec(entry.spec)) {
    return false;
  }
  const normalizedSpec = toComparableSpec(entry.spec);
  return normalizedSpec !== null;
};

const buildLatestMap = async (
  entries: readonly DependencyEntry[],
): Promise<Map<string, string>> => {
  const latestByPackage = new Map<string, string>();
  const uniquePackages = Array.from(
    new Set(entries.filter(shouldTrackDependency).map((entry) => entry.name)),
  );
  const attempts = await Promise.allSettled(
    uniquePackages.map(async (packageName) => {
      const latest = await fetchLatestVersion(packageName);
      return [packageName, latest] as const;
    }),
  );

  const warnings: string[] = [];
  for (const attempt of attempts) {
    if (attempt.status === "rejected") {
      warnings.push(
        `Unable to resolve latest version for ${attempt.reason?.message ?? "unknown package"}.`,
      );
      continue;
    }

    latestByPackage.set(attempt.value[0], attempt.value[1]);
  }

  if (warnings.length > 0) {
    for (const warning of warnings) {
      logger.warn("dependency.drift.lookup_warning", { message: warning });
    }
  }

  return latestByPackage;
};

const compareAgainstRegistry = (
  entries: readonly DependencyEntry[],
  latestByPackage: ReadonlyMap<string, string>,
): DriftCheckResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let trackedCount = 0;
  let resolvedCount = 0;
  let skippedCount = 0;

  for (const entry of entries) {
    const { name, spec, source } = entry;

    if (!shouldTrackDependency(entry)) {
      continue;
    }

    const normalizedSpec = toComparableSpec(spec);
    if (!normalizedSpec) {
      continue;
    }

    trackedCount += 1;

    const latest = latestByPackage.get(name);
    if (!latest) {
      skippedCount += 1;
      continue;
    }
    resolvedCount += 1;

    const latestParsed = parseSemver(latest);
    const declaredParsed = parseSemver(normalizedSpec);
    const pinned = !isRangeOrFloatSpec(spec);

    if (name === "@types/three" && knownPolicy[name]) {
      const runtimePackage = knownPolicy[name].allowPatchDriftWith;
      if (!runtimePackage) {
        continue;
      }

      const runtimeTarget = latestByPackage.get(runtimePackage);
      const runtimeParsed = runtimeTarget ? parseSemver(runtimeTarget) : null;
      if (runtimeParsed && declaredParsed) {
        if (
          declaredParsed.major !== runtimeParsed.major ||
          declaredParsed.minor !== runtimeParsed.minor
        ) {
          errors.push(
            `@types/three policy drift: ${name}@${normalizedSpec} expected to align with ${runtimePackage} ${runtimeParsed.major}.${runtimeParsed.minor}.x in ${source}.`,
          );
        }
      }
      continue;
    }

    if (!declaredParsed) {
      skippedCount += 1;
      warnings.push(
        `Unable to compare ${name} declared ${normalizedSpec}; latest ${latest} could not be parsed.`,
      );
      continue;
    }

    if (!pinned && !allowedNonPinned.has(name)) {
      warnings.push(
        `${name} in ${source} uses ${normalizedSpec}; policy prefers exact semver pins.`,
      );
      continue;
    }

    if (!latestParsed) {
      skippedCount += 1;
      warnings.push(
        `Unable to compare ${name} declared ${normalizedSpec} with latest ${latest}; skipping.`,
      );
      continue;
    }

    if (compareSemver(declaredParsed, latestParsed) < 0) {
      errors.push(
        `${name} in ${source} is behind registry: pinned ${normalizedSpec}, latest ${latest}.`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    trackedCount,
    resolvedCount,
    skippedCount,
  };
};

/**
 * Runs a deterministic package-drift audit for all local package manifests.
 *
 * @returns Drift check result for tooling and CI callers.
 */
export const runDependencyDriftCheck = async (): Promise<DriftCheckResult> => {
  const entries = await collectDependencyEntries();
  const latestByPackage = await buildLatestMap(entries);
  return compareAgainstRegistry(entries, latestByPackage);
};

const report = (result: DriftCheckResult): number => {
  const effectiveCheckedCount =
    result.trackedCount > 0 ? result.trackedCount - result.skippedCount : 0;

  for (const warning of result.warnings) {
    logger.warn("dependency.drift.warning", { message: warning });
  }

  if (!result.ok) {
    for (const error of result.errors) {
      logger.error("dependency.drift.error", { message: error });
    }

    logger.error("dependency.drift.failed", {
      checkedCount: result.trackedCount,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      resolvedCount: result.resolvedCount,
      skippedCount: result.skippedCount,
    });
    return 1;
  }

  logger.info("dependency.drift.passed", {
    checked: effectiveCheckedCount,
    trackedCount: result.trackedCount,
    resolvedCount: result.resolvedCount,
    skippedCount: result.skippedCount,
    warningCount: result.warnings.length,
  });
  return 0;
};

if (import.meta.main) {
  const exitCode = report(await runDependencyDriftCheck());
  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}

export type { DriftCheckResult };

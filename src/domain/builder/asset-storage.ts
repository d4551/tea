import { mkdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { appConfig } from "../../config/environment.ts";
import { toPublicAssetUrl } from "../../shared/constants/assets.ts";

const builderAssetRoot = "uploads/builder";

/**
 * Stable persisted builder asset metadata.
 */
export interface StoredBuilderAssetFile {
  /** Relative path under the public directory. */
  readonly relativePath: string;
  /** Public URL served by the app. */
  readonly publicUrl: string;
  /** Normalized file format / extension without the leading dot. */
  readonly format: string;
  /** Number of bytes written to disk. */
  readonly byteLength: number;
}

const sanitizePathSegment = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-");
  const collapsed = normalized.replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
  return collapsed.length > 0 ? collapsed : fallback;
};

const inferExtension = (fileName: string, contentType?: string): string => {
  const nameExtension = extname(fileName).replace(/^\./, "").trim().toLowerCase();
  if (nameExtension.length > 0) {
    return nameExtension;
  }

  const typeMap: Readonly<Record<string, string>> = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "model/gltf+json": "gltf",
    "model/gltf-binary": "glb",
    "model/vnd.usd+zip": "usdz",
    "model/vnd.usda": "usda",
    "model/vnd.usdc": "usdc",
    "model/vnd.pixar.usd": "usd",
    "application/usd": "usd",
    "application/octet-stream+usdz": "usdz",
    "application/json": "json",
  };

  return typeMap[contentType ?? ""] ?? "dat";
};

const toRelativeStoragePath = (
  projectId: string,
  scope: string,
  basename: string,
  extension: string,
): string =>
  `${builderAssetRoot}/${sanitizePathSegment(projectId, "default")}/${sanitizePathSegment(scope, "misc")}/${sanitizePathSegment(basename, "asset")}.${sanitizePathSegment(extension, "dat")}`;

/**
 * Writes an asset-like file into the public builder storage tree.
 *
 * @param projectId Builder project identifier.
 * @param scope Stable storage bucket such as `assets` or `generated`.
 * @param basename Human-meaningful basename used in the persisted filename.
 * @param bytes Bytes to write.
 * @param fileName Original file name used to infer extension.
 * @param contentType Optional MIME type used to infer extension.
 * @returns Persisted file metadata for public linking.
 */
export const persistBuilderFile = async (
  projectId: string,
  scope: string,
  basename: string,
  bytes: ArrayBuffer | Uint8Array,
  fileName: string,
  contentType?: string,
): Promise<StoredBuilderAssetFile> => {
  const extension = inferExtension(fileName, contentType);
  const relativePath = toRelativeStoragePath(projectId, scope, basename, extension);
  const absolutePath = join(appConfig.staticAssets.publicDirectory, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  const payload = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  await Bun.write(absolutePath, payload);

  return {
    relativePath,
    publicUrl: toPublicAssetUrl(appConfig.staticAssets.publicPrefix, relativePath),
    format: extension,
    byteLength: payload.byteLength,
  };
};

/**
 * Downloads and persists a remote asset into the public builder storage tree.
 *
 * @param projectId Builder project identifier.
 * @param scope Stable storage bucket such as `assets`.
 * @param basename Human-meaningful basename used in the persisted filename.
 * @param sourceUrl Source URL to fetch and store.
 * @returns Persisted file metadata for public linking.
 */
export const importRemoteBuilderFile = async (
  projectId: string,
  scope: string,
  basename: string,
  sourceUrl: string,
): Promise<StoredBuilderAssetFile> => {
  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`asset-import-failed:${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const url = new URL(sourceUrl);
  const lastSegment = url.pathname.split("/").filter(Boolean).at(-1) ?? basename;
  return persistBuilderFile(
    projectId,
    scope,
    basename,
    bytes,
    lastSegment,
    response.headers.get("content-type") ?? undefined,
  );
};

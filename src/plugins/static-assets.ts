import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { resolveStaticAssetMounts } from "../shared/constants/assets.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { safeDecodeUri } from "../shared/utils/safe-json.ts";

/**
 * MIME type lookup for common static file extensions.
 *
 * Falls back to `application/octet-stream` for unknown types.
 */
const MIME_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".wasm": "application/wasm",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".onnx": "application/octet-stream",
  ".safetensors": "application/octet-stream",
};

const normalizeWildcardPath = (wildcardPath: string): string | null => {
  const decoded = safeDecodeUri(wildcardPath);

  const normalized = decoded.replace(/\\/gu, "/").replace(/^\/+/u, "");
  if (normalized.includes("\0")) {
    return null;
  }

  for (const segment of normalized.split("/")) {
    if (segment === ".." || segment === ".") {
      return null;
    }
  }

  return normalized;
};

const getFileExtension = (filePath: string): string => {
  const fileName = filePath.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
};

const resolveMimeTypeFromPath = (filePath: string): string =>
  MIME_TYPES[getFileExtension(filePath)] ?? "application/octet-stream";

const toDirectoryUrl = (path: string): URL => {
  const normalized = path.replace(/\\+/gu, "/").replace(/\/+$/u, "");
  return Bun.pathToFileURL(`${normalized}/`);
};

const resolveFromDirectory = (directory: string, relativePath: string): string =>
  Bun.fileURLToPath(new URL(relativePath, toDirectoryUrl(directory)));

const normalizeMountAssetRoot = (mountPrefix: string): string =>
  mountPrefix.endsWith("/") ? mountPrefix.slice(0, -1) : mountPrefix;

const isAbsolutePath = (path: string): boolean => {
  if (path.startsWith("/")) {
    return true;
  }

  return /^[a-zA-Z]:[\\/]/u.test(path);
};

const resolveAssetRoot = (mountAssetsRoot: string): string => {
  const normalizedMountAssetsRoot = mountAssetsRoot.replace(/\\+/gu, "/").replace(/\/+$/u, "");
  if (isAbsolutePath(normalizedMountAssetsRoot)) {
    return normalizedMountAssetsRoot;
  }

  const projectRootUrl = new URL("../../", import.meta.url);
  const resolvedUrl = new URL(`${normalizedMountAssetsRoot}/`, projectRootUrl);
  return Bun.fileURLToPath(resolvedUrl);
};

const resolveAssetPath = (mountAssetsRoot: string, wildcardPath: string): string | null => {
  const normalizedWildcard = normalizeWildcardPath(wildcardPath);
  if (normalizedWildcard === null) {
    return null;
  }

  const normalizedRoot = mountAssetsRoot.replace(/\\+/gu, "/").replace(/\/+$/u, "");
  const assetPath = normalizedWildcard === "" ? "." : normalizedWildcard;
  const resolvedPath = resolveFromDirectory(normalizedRoot, assetPath);

  const rootPrefix = `${normalizedRoot}/`;
  if (resolvedPath !== normalizedRoot && !resolvedPath.startsWith(rootPrefix)) {
    return null;
  }

  return resolvedPath;
};

/**
 * Bun-native static asset serving plugin.
 *
 * Registers one wildcard GET route per mount point from the canonical manifest.
 * File resolution uses `Bun.file()` and the existence check avoids OS-level stat
 * races. This replaces `@elysiajs/static` which registered individual routes for
 * each file at startup, creating 1400+ routes that overwhelmed Bun's HTTP
 * dispatcher on Bun 1.3.10.
 */
export const staticAssetsPlugin = new Elysia({ name: "static-assets" });

for (const mount of resolveStaticAssetMounts(appConfig)) {
  const normalizedPrefix = normalizeMountAssetRoot(mount.prefix);
  const normalizedAssetsRoot = resolveAssetRoot(mount.assets);

  staticAssetsPlugin.get(
    `${normalizedPrefix}/*`,
    async ({ params }: { params: { "*": string | undefined } }) => {
      const wildcardPath = params["*"];
      if (!wildcardPath) {
        return new Response(null, { status: httpStatus.notFound });
      }

      const absolutePath = resolveAssetPath(normalizedAssetsRoot, wildcardPath);
      if (absolutePath === null) {
        return new Response(null, { status: httpStatus.notFound });
      }

      const file = Bun.file(absolutePath);
      const exists = await file.exists();
      if (!exists) {
        return new Response(null, { status: httpStatus.notFound });
      }

      return new Response(file, {
        headers: {
          "content-type": resolveMimeTypeFromPath(absolutePath),
          "cache-control": `public, max-age=${appConfig.staticAssets.cacheMaxAgeSeconds}`,
        },
      });
    },
  );
}

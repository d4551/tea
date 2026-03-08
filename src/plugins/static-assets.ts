import { extname, resolve } from "node:path";
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { resolveStaticAssetMounts } from "../shared/constants/assets.ts";

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

/**
 * Resolves a MIME type from a file extension.
 *
 * @param filePath Absolute or relative file path.
 * @returns MIME content-type string.
 */
const resolveMimeType = (filePath: string): string =>
  MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";

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
  const normalizedPrefix = mount.prefix.endsWith("/") ? mount.prefix.slice(0, -1) : mount.prefix;

  staticAssetsPlugin.get(`${normalizedPrefix}/*`, async ({ params }) => {
    const wildcardPath = (params as Record<string, string>)["*"];
    if (!wildcardPath) {
      return new Response("Not Found", { status: 404 });
    }

    const safePath = wildcardPath.replace(/\.\./gu, "");
    const absolutePath = resolve(mount.assets, safePath);

    const file = Bun.file(absolutePath);
    const exists = await file.exists();
    if (!exists) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(file, {
      headers: {
        "content-type": resolveMimeType(absolutePath),
        "cache-control": "public, max-age=3600",
      },
    });
  });
}

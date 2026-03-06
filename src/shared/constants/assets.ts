/**
 * Canonical relative asset paths used by runtime and build scripts.
 */
export const assetRelativePaths = {
  sourceStylesheet: "src/styles/app.css",
  stylesheetOutputFile: "app.css",
  htmxNodeModuleBundle: "node_modules/htmx.org/dist/htmx.min.js",
  htmxPublicBundleFile: "vendor/htmx.min.js",
  htmxExtensionsOutputDirectory: "vendor/htmx-ext",
  htmxExtensionOracleIndicatorFile: "vendor/htmx-ext/oracle-indicator.js",
  htmxExtensionGameHudFile: "vendor/htmx-ext/game-hud.js",
  htmxExtensionFocusPanelFile: "vendor/htmx-ext/focus-panel.js",
  onnxPublicDirectory: "onnx",
  htmxExtensionsSourceDirectory: "src/htmx-extensions",
  playableGameClientEntryFile: "src/playable-game/game-client.ts",
  gameClientBundleFile: "game-client.js",
} as const;

/**
 * Canonical HTMX extension entrypoints bundled into the public asset tree.
 */
export const htmxExtensionEntryFiles = [
  "game-hud.ts",
  "oracle-indicator.ts",
  "focus-panel.ts",
] as const;

/**
 * Minimal config shape required to derive static mount definitions.
 */
export interface StaticAssetMountConfig {
  readonly staticAssets: {
    readonly publicPrefix: string;
    readonly assetsPrefix: string;
    readonly rmmzPackPrefix: string;
    readonly publicDirectory: string;
    readonly assetsDirectory: string;
    readonly rmmzPackDirectory: string;
  };
  readonly playableGame: {
    readonly assetPrefix: string;
    readonly sourceDirectory: string;
  };
}

/**
 * Static file mount descriptor consumed by the Elysia static plugin.
 */
export interface StaticAssetMount {
  readonly assets: string;
  readonly prefix: string;
}

/**
 * Canonical relative asset paths used by the browser game runtime.
 */
export const gameAssetRelativePaths = {
  chaJiangSprite: "images/sprites/cha-jiang-sprite.png",
  npcSpriteSheet: "images/sprites/npc-sprites.png",
  teaHouseBackground: "images/sprites/tea-house-scene-bg.png",
} as const;

/**
 * Joins a URL prefix and relative path into a normalized public URL.
 *
 * @param prefix URL prefix such as `/public`.
 * @param relativePath Relative file path such as `app.css`.
 * @returns Normalized URL path.
 */
export const joinUrlPath = (prefix: string, relativePath: string): string => {
  const normalizedPrefix = `/${prefix.replace(/^\/+|\/+$/g, "")}`;
  const normalizedRelativePath = relativePath.replace(/^\/+/g, "");

  if (normalizedRelativePath.length === 0) {
    return normalizedPrefix;
  }

  return `${normalizedPrefix}/${normalizedRelativePath}`;
};

/**
 * Joins a local directory and relative path into a normalized local path.
 *
 * @param directory Local directory path such as `public`.
 * @param relativePath Relative file path such as `vendor/htmx.min.js`.
 * @returns Normalized local path.
 */
export const joinLocalPath = (directory: string, relativePath: string): string => {
  const normalizedDirectory = directory.replace(/^\/+|\/+$/g, "");
  const normalizedRelativePath = relativePath.replace(/^\/+/g, "");

  if (normalizedDirectory.length === 0) {
    return normalizedRelativePath;
  }

  if (normalizedRelativePath.length === 0) {
    return normalizedDirectory;
  }

  return `${normalizedDirectory}/${normalizedRelativePath}`;
};

/**
 * Creates a public asset URL from the configured public prefix.
 *
 * @param publicPrefix Public URL prefix such as `/public`.
 * @param relativePath Relative asset path under the public directory.
 * @returns Normalized public asset URL.
 */
export const toPublicAssetUrl = (publicPrefix: string, relativePath: string): string =>
  joinUrlPath(publicPrefix, relativePath);

/**
 * Resolves HTMX extension entrypoint paths relative to the repo root.
 *
 * @returns Canonical extension entrypoint paths.
 */
export const getHtmxExtensionEntryPaths = (): readonly string[] =>
  htmxExtensionEntryFiles.map((fileName) =>
    joinLocalPath(assetRelativePaths.htmxExtensionsSourceDirectory, fileName),
  );

/**
 * Resolves all static file mounts from the application config.
 *
 * @param config Runtime config subset owning static paths and prefixes.
 * @returns Static mount definitions in deterministic order.
 */
export const resolveStaticAssetMounts = (
  config: StaticAssetMountConfig,
): readonly StaticAssetMount[] => [
  {
    assets: config.staticAssets.publicDirectory,
    prefix: config.staticAssets.publicPrefix,
  },
  {
    assets: config.staticAssets.assetsDirectory,
    prefix: config.staticAssets.assetsPrefix,
  },
  {
    assets: config.playableGame.sourceDirectory,
    prefix: config.playableGame.assetPrefix,
  },
  {
    assets: config.staticAssets.rmmzPackDirectory,
    prefix: config.staticAssets.rmmzPackPrefix,
  },
];

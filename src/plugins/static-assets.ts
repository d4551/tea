import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { resolveStaticAssetMounts } from "../shared/constants/assets.ts";

/**
 * Shared static asset registration composed from the canonical mount manifest.
 */
export const staticAssetsPlugin = resolveStaticAssetMounts(appConfig).reduce(
  (app, mount) =>
    app.use(
      staticPlugin({
        assets: mount.assets,
        prefix: mount.prefix,
      }),
    ),
  new Elysia({ name: "static-assets" }),
);

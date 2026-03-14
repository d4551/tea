import type { Texture } from "pixi.js";
import { Spritesheet } from "pixi.js";
import type { SpriteManifest } from "../shared/contracts/game.ts";

/** PixiJS spritesheet data shape. */
export type SpritesheetData = {
  frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>;
  animations: Record<string, string[]>;
  meta: { scale: string };
};

/**
 * Builds PixiJS spritesheet data from SpriteManifest.
 * Frame names use "r{row}c{col}" format.
 */
export const manifestToSpritesheetData = (manifest: SpriteManifest): SpritesheetData => {
  const frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }> = {};
  const { frameWidth, frameHeight, cols, rows } = manifest;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `r${row}c${col}`;
      frames[key] = {
        frame: {
          x: col * frameWidth,
          y: row * frameHeight,
          w: frameWidth,
          h: frameHeight,
        },
      };
    }
  }

  const animations: Record<string, string[]> = {};
  for (const [animKey, config] of Object.entries(manifest.animations)) {
    const frameNames: string[] = [];
    for (let i = 0; i < config.frames; i++) {
      const col = config.startCol + i;
      frameNames.push(`r${config.row}c${col}`);
    }
    animations[animKey] = frameNames;
  }

  return {
    frames,
    animations,
    meta: { scale: "1" },
  };
};

/**
 * Creates and parses a PixiJS Spritesheet from a texture and SpriteManifest.
 * Returns the parsed sheet with textures and animations populated.
 */
export const createSpritesheetFromManifest = async (
  texture: Texture,
  manifest: SpriteManifest,
): Promise<Spritesheet> => {
  const data = manifestToSpritesheetData(manifest);
  const sheet = new Spritesheet({ texture, data });
  await sheet.parse();
  return sheet;
};

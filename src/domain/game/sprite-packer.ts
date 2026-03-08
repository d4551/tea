import type { SpriteAtlasFrame } from "../../shared/contracts/game.ts";

/** Maximum atlas strip width before wrapping to a new row. */
const MAX_STRIP_WIDTH = 2048;

/**
 * Input descriptor for a single frame to be packed.
 */
export interface PackableFrame {
  /** Stable frame identifier. */
  readonly id: string;
  /** Frame width in pixels. */
  readonly width: number;
  /** Frame height in pixels. */
  readonly height: number;
}

/**
 * Result of a strip-packing operation.
 */
export interface PackResult {
  /** Total atlas image width. */
  readonly atlasWidth: number;
  /** Total atlas image height. */
  readonly atlasHeight: number;
  /** Positioned frames within the atlas. */
  readonly frames: readonly SpriteAtlasFrame[];
}

/**
 * Packs a list of frames into a strip-layout atlas.
 *
 * Uses a simple row-based strip-packing algorithm: frames are laid out
 * left-to-right. When a frame would exceed `MAX_STRIP_WIDTH`, a new
 * row begins at the tallest height of the previous row.
 *
 * @param frames Ordered list of frame descriptors to pack.
 * @returns Pack result with computed positions and atlas dimensions.
 */
export const packFrames = (frames: readonly PackableFrame[]): PackResult => {
  if (frames.length === 0) {
    return { atlasWidth: 0, atlasHeight: 0, frames: [] };
  }

  const positioned: SpriteAtlasFrame[] = [];
  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  let maxWidth = 0;

  for (const frame of frames) {
    if (cursorX + frame.width > MAX_STRIP_WIDTH && cursorX > 0) {
      cursorY += rowHeight;
      cursorX = 0;
      rowHeight = 0;
    }

    positioned.push({
      id: frame.id,
      x: cursorX,
      y: cursorY,
      width: frame.width,
      height: frame.height,
    });

    cursorX += frame.width;
    rowHeight = Math.max(rowHeight, frame.height);
    maxWidth = Math.max(maxWidth, cursorX);
  }

  return {
    atlasWidth: maxWidth,
    atlasHeight: cursorY + rowHeight,
    frames: positioned,
  };
};

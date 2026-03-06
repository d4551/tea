import { resolve } from "node:path";
import sharp from "sharp";
import { appConfig } from "../src/config/environment.ts";
import { createLogger } from "../src/lib/logger.ts";

const logger = createLogger("sprite-processor");
const projectRoot = resolve(import.meta.dir, "..");

interface SpriteMapping {
  readonly sourceFile: string;
  readonly outputFile: string;
}

const spriteMappings: readonly SpriteMapping[] = [
  {
    sourceFile: appConfig.spriteProcessing.chaJiangSourceFile,
    outputFile: appConfig.spriteProcessing.chaJiangOutputFile,
  },
  {
    sourceFile: appConfig.spriteProcessing.npcSheetSourceFile,
    outputFile: appConfig.spriteProcessing.npcSheetOutputFile,
  },
] as const;

const resolveSourcePath = (sourceFile: string): string =>
  resolve(projectRoot, appConfig.spriteProcessing.sourceDirectory, sourceFile);

const resolveOutputPath = (outputFile: string): string =>
  resolve(projectRoot, appConfig.spriteProcessing.outputDirectory, outputFile);

const colourDistance = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number => {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;

  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const floodFillRemove = async (
  inputPath: string,
  outputPath: string,
  tolerance: number,
): Promise<void> => {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const visited = new Uint8Array(width * height);
  const queue: Array<readonly [number, number]> = [];

  const indexAt = (x: number, y: number): number => (y * width + x) * channels;
  const channelAt = (index: number): number => data[index] ?? 0;

  const seeds: readonly (readonly [number, number])[] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  for (const [seedX, seedY] of seeds) {
    const visitedIndex = seedY * width + seedX;
    if (visited[visitedIndex] === 1) {
      continue;
    }

    visited[visitedIndex] = 1;
    queue.push([seedX, seedY]);
  }

  const neighbors: readonly (readonly [number, number])[] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let removedPixels = 0;

  while (queue.length > 0) {
    const pixel = queue.pop();
    if (!pixel) {
      continue;
    }

    const [currentX, currentY] = pixel;
    const currentIndex = indexAt(currentX, currentY);

    data[currentIndex + 3] = 0;
    removedPixels += 1;

    for (const [dx, dy] of neighbors) {
      const neighborX = currentX + dx;
      const neighborY = currentY + dy;

      if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height) {
        continue;
      }

      const visitedNeighbor = neighborY * width + neighborX;
      if (visited[visitedNeighbor] === 1) {
        continue;
      }

      visited[visitedNeighbor] = 1;

      const neighborIndex = indexAt(neighborX, neighborY);
      const distance = colourDistance(
        channelAt(currentIndex),
        channelAt(currentIndex + 1),
        channelAt(currentIndex + 2),
        channelAt(neighborIndex),
        channelAt(neighborIndex + 1),
        channelAt(neighborIndex + 2),
      );

      if (distance <= tolerance) {
        queue.push([neighborX, neighborY]);
      }
    }
  }

  let interiorRemoved = 0;
  for (let i = 0; i < data.length; i += channels) {
    if (data[i + 3] === 0) {
      continue;
    }

    const red = channelAt(i);
    const green = channelAt(i + 1);
    const blue = channelAt(i + 2);

    const maxChannel = Math.max(red, green, blue);
    const minChannel = Math.min(red, green, blue);
    const spread = maxChannel - minChannel;
    const luminance = (red + green + blue) / 3;

    if (
      spread <= appConfig.spriteProcessing.interiorGraySpreadThreshold &&
      luminance >= appConfig.spriteProcessing.interiorGrayLuminanceMin &&
      luminance <= appConfig.spriteProcessing.interiorGrayLuminanceMax
    ) {
      data[i + 3] = 0;
      interiorRemoved += 1;
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outputPath);

  logger.info("sprite.processed", {
    inputPath,
    outputPath,
    removedPixels,
    interiorRemoved,
    tolerance,
  });
};

const aiRemove = async (inputPath: string, outputPath: string): Promise<void> => {
  const { pipeline, RawImage } = await import("@huggingface/transformers");
  const removeBackground = await pipeline("background-removal", appConfig.spriteProcessing.aiModel);
  const rawImage = await RawImage.read(inputPath);
  const result = await removeBackground(rawImage);

  const outputImage = Array.isArray(result) ? result[0] : result;
  if (!outputImage) {
    throw new Error("AI background removal returned no output image.");
  }
  await outputImage.save(outputPath);

  logger.info("sprite.processed.ai", {
    inputPath,
    outputPath,
  });
};

const run = async (): Promise<void> => {
  const outputDir = resolve(projectRoot, appConfig.spriteProcessing.outputDirectory);
  const outputDirFile = Bun.file(outputDir);
  if (!(await outputDirFile.exists())) {
    await Bun.write(resolve(outputDir, ".gitkeep"), "");
  }

  const useAi = Bun.argv.includes("--ai");
  logger.info("sprite.processing.started", {
    mode: useAi ? "ai" : "flood-fill",
    sourceDirectory: appConfig.spriteProcessing.sourceDirectory,
    outputDirectory: appConfig.spriteProcessing.outputDirectory,
  });

  for (const mapping of spriteMappings) {
    const inputPath = resolveSourcePath(mapping.sourceFile);
    const outputPath = resolveOutputPath(mapping.outputFile);

    if (!(await Bun.file(inputPath).exists())) {
      logger.warn("sprite.source.missing", {
        inputPath,
      });
      continue;
    }

    if (useAi) {
      await aiRemove(inputPath, outputPath);
      continue;
    }

    await floodFillRemove(inputPath, outputPath, appConfig.spriteProcessing.floodFillTolerance);
  }

  logger.info("sprite.processing.completed");
};

await run();

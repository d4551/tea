const riffHeader = "RIFF";
const waveHeader = "WAVE";
const fmtChunkId = "fmt ";
const dataChunkId = "data";

/**
 * Decoded mono PCM audio ready for local inference.
 */
export interface DecodedWavAudio {
  /** Mono PCM samples normalized to -1..1. */
  readonly samples: Float32Array;
  /** Source sample rate. */
  readonly sampleRate: number;
  /** Number of source channels before down-mixing. */
  readonly channels: number;
  /** Duration in milliseconds. */
  readonly durationMs: number;
}

/**
 * Result of safely decoding a WAV payload without relying on exception control flow.
 */
export type DecodedWavAudioResult =
  | {
      readonly ok: true;
      readonly value: DecodedWavAudio;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

const readAscii = (view: DataView, offset: number, length: number): string => {
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += String.fromCharCode(view.getUint8(offset + index));
  }
  return result;
};

const clampSample = (value: number): number => Math.max(-1, Math.min(1, value));

const decodeSample = (
  view: DataView,
  offset: number,
  audioFormat: number,
  bitsPerSample: number,
): number => {
  if (audioFormat === 3 && bitsPerSample === 32) {
    return clampSample(view.getFloat32(offset, true));
  }

  switch (bitsPerSample) {
    case 8:
      return (view.getUint8(offset) - 128) / 128;
    case 16:
      return view.getInt16(offset, true) / 32768;
    case 24: {
      const sample =
        view.getUint8(offset) |
        (view.getUint8(offset + 1) << 8) |
        (view.getUint8(offset + 2) << 16);
      const signed = (sample << 8) >> 8;
      return signed / 8388608;
    }
    case 32:
      return view.getInt32(offset, true) / 2147483648;
    default:
      throw new Error(`Unsupported WAV bit depth: ${bitsPerSample}`);
  }
};

/**
 * Decodes a PCM or float WAV file into mono Float32 samples.
 *
 * @param input Raw WAV bytes.
 * @returns Decoded mono audio for inference.
 */
export const decodeWavAudio = (input: Uint8Array): DecodedWavAudioResult => {
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  if (input.byteLength < 44) {
    return { ok: false, error: "WAV payload is too small." };
  }

  if (readAscii(view, 0, 4) !== riffHeader || readAscii(view, 8, 4) !== waveHeader) {
    return { ok: false, error: "Unsupported WAV container." };
  }

  let offset = 12;
  let audioFormat = 1;
  let channelCount = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= input.byteLength) {
    const chunkId = readAscii(view, offset, 4);
    const chunkSize = view.getUint32(offset + 4, true);
    const chunkDataOffset = offset + 8;

    if (chunkId === fmtChunkId) {
      audioFormat = view.getUint16(chunkDataOffset, true);
      channelCount = view.getUint16(chunkDataOffset + 2, true);
      sampleRate = view.getUint32(chunkDataOffset + 4, true);
      bitsPerSample = view.getUint16(chunkDataOffset + 14, true);
    }

    if (chunkId === dataChunkId) {
      dataOffset = chunkDataOffset;
      dataSize = chunkSize;
      break;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || channelCount < 1 || sampleRate < 1 || bitsPerSample < 1) {
    return { ok: false, error: "WAV payload is missing required format or data chunks." };
  }

  if (audioFormat !== 1 && audioFormat !== 3) {
    return { ok: false, error: `Unsupported WAV audio format: ${audioFormat}` };
  }

  const bytesPerSample = Math.ceil(bitsPerSample / 8);
  const frameSize = bytesPerSample * channelCount;
  if (frameSize < 1) {
    return { ok: false, error: "Invalid WAV frame size." };
  }

  const frameCount = Math.floor(dataSize / frameSize);
  const monoSamples = new Float32Array(frameCount);

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    let mixed = 0;
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      const sampleOffset = dataOffset + frameIndex * frameSize + channelIndex * bytesPerSample;
      mixed += decodeSample(view, sampleOffset, audioFormat, bitsPerSample);
    }
    monoSamples[frameIndex] = clampSample(mixed / channelCount);
  }

  return {
    ok: true,
    value: {
      samples: monoSamples,
      sampleRate,
      channels: channelCount,
      durationMs: Math.round((frameCount / sampleRate) * 1000),
    },
  };
};

export const safeDecodeWavAudio = (input: Uint8Array): DecodedWavAudioResult => {
  return decodeWavAudio(input);
};

/**
 * Resamples mono PCM audio using linear interpolation.
 *
 * @param input Input mono samples.
 * @param sourceSampleRate Source sample rate.
 * @param targetSampleRate Target sample rate.
 * @returns Resampled mono samples.
 */
export const resampleMonoPcm = (
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number,
): Float32Array => {
  if (sourceSampleRate === targetSampleRate) {
    return input;
  }

  const outputLength = Math.max(
    1,
    Math.round((input.length * targetSampleRate) / sourceSampleRate),
  );
  const output = new Float32Array(outputLength);

  for (let index = 0; index < outputLength; index += 1) {
    const position = (index * (input.length - 1)) / Math.max(1, outputLength - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(input.length - 1, lowerIndex + 1);
    const weight = position - lowerIndex;
    const lowerSample = input[lowerIndex];
    const upperSample = input[upperIndex];

    if (typeof lowerSample !== "number" || typeof upperSample !== "number") {
      continue;
    }

    output[index] = lowerSample * (1 - weight) + upperSample * weight;
  }

  return output;
};

/**
 * Encodes mono Float32 PCM samples as a 16-bit WAV payload.
 *
 * @param samples Mono PCM samples.
 * @param sampleRate WAV sample rate.
 * @returns Encoded WAV file bytes.
 */
export const encodeMonoWavAudio = (samples: Float32Array, sampleRate: number): Uint8Array => {
  const blockAlign = 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, value: string): void => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeAscii(0, riffHeader);
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, waveHeader);
  writeAscii(12, fmtChunkId);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(36, dataChunkId);
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = clampSample(sample);
    const encoded = clamped < 0 ? clamped * 32768 : clamped * 32767;
    view.setInt16(offset, Math.round(encoded), true);
    offset += 2;
  }

  return new Uint8Array(buffer);
};

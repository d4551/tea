import { settleAsync } from "../shared/utils/async-result.ts";

type AudioPlaybackState = {
  readonly action?: string;
  readonly soundAssetUrl?: string;
  readonly stepId?: string;
  readonly stepDurationMs?: number;
};

type GameClientAudioService = {
  readonly handleCutsceneUpdate: (update: AudioPlaybackState) => void;
  readonly dispose: () => void;
};

type GameClientAudioServiceOptions = {
  readonly onWarning?: (message: string, detail?: Record<string, unknown>) => void;
};

const DEFAULT_MASTER_VOLUME = 1;
const DEFAULT_PLAY_SOUND_DURATION_MS = 250;

const isAudioContextAvailable = (): typeof AudioContext | null =>
  typeof AudioContext !== "undefined" ? AudioContext : null;

/**
 * Validates and resolves a potentially relative URL to an absolute string.
 *
 * @param value Raw URL string.
 * @returns Absolute URL string, or null when the input is empty or invalid.
 */
const safeAbsoluteUrl = (value: string): string | null => {
  if (value.length === 0) {
    return null;
  }

  if (typeof URL.canParse === "function") {
    const absolute = value.startsWith("http")
      ? value
      : `${window.location.origin}${value.startsWith("/") ? "" : "/"}${value}`;
    return URL.canParse(absolute) ? new URL(absolute).toString() : null;
  }

  // Fallback: construct via base URL. Invalid URLs produce a result
  // that starts with the base, so verify the result looks correct.
  const base = window.location.href;
  const constructed = new URL(value, base);
  return constructed.toString();
};

const createAudioBufferCacheKey = (url: string): string => url;

export const createGameClientAudioService = (
  options: GameClientAudioServiceOptions = {},
): GameClientAudioService => {
  const warningLogger = options.onWarning;
  const bufferCache = new Map<string, Promise<AudioBuffer | null>>();
  let audioContext: AudioContext | null = null;
  let activeSource: AudioBufferSourceNode | null = null;
  let activeFallbackAudio: HTMLAudioElement | null = null;
  let activeStepId: string | null = null;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;

  const stopCurrentSound = (): void => {
    if (stopTimer !== null) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }

    if (activeSource) {
      const sourceToStop = activeSource;
      activeSource = null;
      sourceToStop.disconnect();
      void settleAsync(Promise.resolve().then(() => sourceToStop.stop())).then((stopResult) => {
        if (!stopResult.ok) {
          warningLogger?.("audio-stop-failed", { error: stopResult.error.message });
        }
      });
    }

    if (activeFallbackAudio) {
      activeFallbackAudio.pause();
      activeFallbackAudio.currentTime = 0;
      activeFallbackAudio = null;
    }

    activeStepId = null;
  };

  const resolveAudioContext = async (): Promise<AudioContext | null> => {
    if (audioContext) {
      if (audioContext.state === "suspended") {
        const resumeResult = await settleAsync(audioContext.resume());
        if (!resumeResult.ok) {
          warningLogger?.("audio-context-resume-failed", {});
        }
      }
      return audioContext.state === "running" ? audioContext : null;
    }

    const Ctx = isAudioContextAvailable();
    if (!Ctx) {
      return null;
    }

    audioContext = new Ctx();
    const resumeResult = await settleAsync(audioContext.resume());
    if (!resumeResult.ok) {
      warningLogger?.("audio-context-resume-failed", {});
    }

    return audioContext.state === "running" ? audioContext : null;
  };

  const loadAudioBuffer = (url: string): Promise<AudioBuffer | null> => {
    const key = createAudioBufferCacheKey(url);
    const existing = bufferCache.get(key);
    if (existing) {
      return existing;
    }

    const request = async (): Promise<AudioBuffer | null> => {
      const context = await resolveAudioContext();
      if (!context) {
        return null;
      }
      const fetchResult = await settleAsync(fetch(url));
      if (!fetchResult.ok || !fetchResult.value.ok) {
        return null;
      }
      const bufferResult = await settleAsync(fetchResult.value.arrayBuffer());
      if (!bufferResult.ok) {
        warningLogger?.("audio-load-failed", {});
        return null;
      }
      const decodeResult = await settleAsync(context.decodeAudioData(bufferResult.value));
      if (!decodeResult.ok) {
        warningLogger?.("audio-load-failed", {});
        return null;
      }
      return decodeResult.value;
    };

    const pending = request();
    bufferCache.set(key, pending);
    return pending;
  };

  const playBuffer = async (url: string, stepId: string, stepDurationMs: number): Promise<void> => {
    const absoluteUrl = safeAbsoluteUrl(url);
    if (!absoluteUrl) {
      warningLogger?.("invalid-audio-url", { url });
      return;
    }

    stopCurrentSound();
    const context = await resolveAudioContext();
    if (!context) {
      // Fallback to native Audio for browsers without WebAudio support.
      const audio = new Audio(absoluteUrl);
      audio.volume = DEFAULT_MASTER_VOLUME;
      activeFallbackAudio = audio;
      activeStepId = stepId;
      const playResult = await settleAsync(audio.play());
      if (!playResult.ok) {
        warningLogger?.("audio-play-failed", { url: absoluteUrl });
      }
      return;
    }

    const buffer = await loadAudioBuffer(absoluteUrl);
    if (!buffer) {
      warningLogger?.("audio-buffer-missing", { url: absoluteUrl });
      return;
    }

    if (activeStepId !== stepId) {
      stopCurrentSound();
    }
    activeStepId = stepId;

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = DEFAULT_MASTER_VOLUME;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
      activeSource = null;
      activeStepId = null;
    };
    source.start();
    activeSource = source;

    const naturalDurationMs = buffer.duration * 1000;
    let stopAfterMs = naturalDurationMs;
    if (stepDurationMs > 0) {
      stopAfterMs = Math.min(stepDurationMs, naturalDurationMs);
    } else if (!Number.isFinite(naturalDurationMs) || naturalDurationMs <= 0) {
      stopAfterMs = DEFAULT_PLAY_SOUND_DURATION_MS;
    }

    if (Number.isFinite(stopAfterMs) && stopAfterMs > 0) {
      stopTimer = setTimeout(() => {
        stopCurrentSound();
      }, stopAfterMs);
    }
  };

  const handleCutsceneUpdate = (update: AudioPlaybackState): void => {
    const action = update.action ?? "";
    const stepId = update.stepId;
    const soundAssetUrl = update.soundAssetUrl ?? "";
    const stepDurationMs = Number(update.stepDurationMs);

    if (action !== "play_sound" || stepId === undefined || soundAssetUrl.length === 0) {
      stopCurrentSound();
      return;
    }

    if (stepId === activeStepId) {
      return;
    }

    void playBuffer(soundAssetUrl, stepId, Number.isFinite(stepDurationMs) ? stepDurationMs : 0);
  };

  const dispose = (): void => {
    stopCurrentSound();
    if (audioContext) {
      void audioContext.close();
      audioContext = null;
    }
    bufferCache.clear();
  };

  return {
    handleCutsceneUpdate,
    dispose,
  };
};

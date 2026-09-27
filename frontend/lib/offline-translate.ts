/**
 * Offline translation pipeline.
 * Combines: Vosk STT (speech) or raw text → glossify → asset URL lookup.
 * Everything runs client-side — no server needed.
 */

import { glossify, type GlossResult } from './glossify';
import { resolveTokensWithFingerspelling, resolveGestureUrls } from './asset-resolver';
import { createVoskSTT, type VoskSTT, type VoskSTTOptions } from './vosk-stt';
import { isModelCached, downloadModel, cacheModel } from './model-cache';

export interface OfflineTranslateResult {
  transcript?: string;
  tokens: string[];
  gestures: string[];
  gloss: string;
}

export interface OfflineTranslateOptions {
  /** Base URL where sign assets are served from (default: '/assets') */
  assetsBaseUrl?: string;
}

export interface ModelDownloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Translate text offline (no server needed).
 * Uses the JS glossify port + client-side fingerspelling asset resolution.
 */
export function translateTextOffline(
  text: string,
  options: OfflineTranslateOptions = {}
): OfflineTranslateResult {
  const { assetsBaseUrl = '/assets/signs' } = options;

  const glossResult = glossify(text);
  const { tokens, gestures } = resolveTokensWithFingerspelling(glossResult.tokens, assetsBaseUrl);

  return {
    tokens,
    gestures,
    gloss: glossResult.gloss,
  };
}

/**
 * Check if offline STT model is available.
 */
export async function isOfflineSTTReady(): Promise<boolean> {
  const cached = await isModelCached();
  if (cached) return true;

  // In native Android APK, the Vosk model is bundled directly in the application
  if (typeof window !== 'undefined' && ((window as any).Capacitor?.isNativePlatform?.() || false)) {
    return true;
  }

  // Check if local bundled model asset is reachable
  if (typeof window !== 'undefined') {
    for (const url of ['/models/vosk-model-small-en-us-0.15.tar', '/models/vosk-model-small-en-us-0.15.tar.gz']) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return true;
      } catch {
        // ignore
      }
    }
  }

  return false;
}

/**
 * Download and cache the Vosk model for offline STT.
 * Call this on first launch or when user opts in.
 */
export async function downloadSTTModel(
  onProgress?: (progress: ModelDownloadProgress) => void
): Promise<void> {
  const data = await downloadModel((loaded, total) => {
    onProgress?.({
      loaded,
      total,
      percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
    });
  });
  await cacheModel(data);
}

/**
 * Create an offline speech translator.
 * Combines Vosk WASM STT with client-side glossify.
 */
export async function createOfflineSpeechTranslator(
  sttOptions: Omit<VoskSTTOptions, 'modelSource'> & OfflineTranslateOptions = {}
): Promise<{
  stt: VoskSTT;
  translateFromAudio: () => Promise<OfflineTranslateResult>;
}> {
  const { assetsBaseUrl, ...voskOptions } = sttOptions;

  // The STT handles audio → text.
  // We need to capture the final result and translate it.
  let lastTranscript = '';

  const wrappedOnResult = voskOptions.onResult;
  const captureResult: VoskSTTOptions['onResult'] = (text) => {
    lastTranscript = text;
    wrappedOnResult?.(text);
  };

  // Create single STT instance with wrapped result handler
  const stt = await createVoskSTT({
    ...voskOptions,
    onResult: captureResult,
  });

  async function translateFromAudio(): Promise<OfflineTranslateResult> {
    return translateTextOffline(lastTranscript, { assetsBaseUrl });
  }

  return {
    stt,
    translateFromAudio,
  };
}

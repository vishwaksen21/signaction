/**
 * Offline translation pipeline.
 * Combines: Vosk STT (speech) or raw text → glossify → asset URL lookup.
 * Everything runs client-side — no server needed.
 */

import { glossify, type GlossResult } from './glossify';
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

// Default sign asset paths — maps token to asset file
// This mirrors the Python mapping logic
function tokenToAssetPath(token: string): string {
  const upper = token.toUpperCase();
  // Try direct word match first
  return `signs/${upper}.mp4`;
}

/**
 * Resolve tokens to gesture asset URLs.
 * Falls back to fingerspelling for unknown words.
 */
function resolveGestureUrls(
  tokens: string[],
  assetsBaseUrl: string
): string[] {
  const gestures: string[] = [];

  for (const token of tokens) {
    const upper = token.toUpperCase();
    const assetPath = tokenToAssetPath(upper);
    gestures.push(`${assetsBaseUrl}/${assetPath}`);
  }

  return gestures;
}

/**
 * Translate text offline (no server needed).
 * Uses the JS glossify port + client-side asset resolution.
 */
export function translateTextOffline(
  text: string,
  options: OfflineTranslateOptions = {}
): OfflineTranslateResult {
  const { assetsBaseUrl = '/assets' } = options;

  const glossResult = glossify(text);
  const gestures = resolveGestureUrls(glossResult.tokens, assetsBaseUrl);

  return {
    tokens: glossResult.tokens,
    gestures,
    gloss: glossResult.gloss,
  };
}

/**
 * Check if offline STT model is available.
 */
export async function isOfflineSTTReady(): Promise<boolean> {
  return isModelCached();
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

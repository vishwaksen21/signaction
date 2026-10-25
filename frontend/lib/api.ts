export type TranslateTextRequest = { text: string };

export type TranslateResponse = {
  tokens: string[];
  gestures: string[];
  gloss?: string;
  transcript?: string;
};

const ENV_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim() || '';

function isNativeApp(): boolean {
  return typeof window !== 'undefined' && ((window as any).Capacitor?.isNativePlatform?.() || false);
}

function getApiBase(): string {
  // In native Android APK (Capacitor), use ENV_API_BASE if provided
  if (isNativeApp()) {
    if (!ENV_API_BASE) return '';
    const baseLooksLocalhost =
      ENV_API_BASE.includes('://localhost') ||
      ENV_API_BASE.includes('://127.0.0.1') ||
      ENV_API_BASE.startsWith('localhost') ||
      ENV_API_BASE.startsWith('127.0.0.1');
    if (baseLooksLocalhost) return '';
    return ENV_API_BASE;
  }

  // In web browsers (Vercel deployment or local), always use relative routes.
  // Next.js API route handlers (/translate-text, /translate-speech, /health)
  // run on the same origin, avoiding CORS issues, cold-start hangs, and
  // automatically forwarding to the backend with timeout and offline fallbacks.
  return '';
}

export function resolveApiUrl(urlOrPath: string): string {
  const API_BASE = getApiBase();
  const u = (urlOrPath || '').trim();
  if (!u) return u;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  // Local sign MP4 videos and images are served directly by the web server / CDN
  if (u.startsWith('/assets/')) return u;
  if (u.startsWith('/')) return `${API_BASE}${u}`;
  return u;
}

async function http<T>(path: string, init: RequestInit): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const API_BASE = getApiBase();
  const url = API_BASE ? `${API_BASE}${path}` : path;

  // Add 6-second timeout to prevent requests from hanging indefinitely on sleeping backends
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  if (init.signal) {
    init.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const fetchInit = {
      ...init,
      signal: controller.signal,
      cache: init.cache || 'no-store',
    } as RequestInit;
    const res = await fetch(url, fetchInit);
    clearTimeout(timeoutId);
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText} (${method} ${url})`;
      try {
        const data = (await res.json()) as { detail?: string };
        if (data?.detail) msg = `${data.detail} (${method} ${url})`;
      } catch { /* ignore */ }
      throw new Error(msg);
    }
    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function apiHealth(): Promise<{ status: string; mode?: string; message?: string }> {
  return http('/health', { method: 'GET' });
}

export async function translateText(req: TranslateTextRequest): Promise<TranslateResponse> {
  // When running in the native offline-first Android APK without a configured remote API,
  // or when the browser reports offline, translate directly on-device with zero network delay.
  if ((isNativeApp() && !getApiBase()) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    const { translateTextOffline } = await import('./offline-translate');
    const offlineRes = translateTextOffline(req.text, { allowOnlineFallback: false });
    return {
      tokens: offlineRes.tokens,
      gestures: offlineRes.gestures,
      gloss: offlineRes.gloss,
    };
  }

  try {
    const data = await http<TranslateResponse>('/translate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return { ...data, gestures: (data.gestures || []).map(resolveApiUrl) };
  } catch {
    // Offline fallback: use robust client-side offline translation with local fingerspelling
    const { translateTextOffline } = await import('./offline-translate');
    const offlineRes = translateTextOffline(req.text, { allowOnlineFallback: false });
    return {
      tokens: offlineRes.tokens,
      gestures: offlineRes.gestures,
      gloss: offlineRes.gloss,
    };
  }
}

export async function translateSpeechOnce(file: File): Promise<TranslateResponse> {
  const shouldUseOfflineDirectly =
    (isNativeApp() && !getApiBase()) ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  if (!shouldUseOfflineDirectly) {
    try {
      const form = new FormData();
      form.append('file', file);
      const data = await http<TranslateResponse>('/translate-speech', {
        method: 'POST',
        body: form,
      });
      if (!data.transcript?.trim() && (!data.tokens || data.tokens.length === 0)) {
        throw new Error('NO_SPEECH_DETECTED');
      }
      return { ...data, gestures: (data.gestures || []).map(resolveApiUrl) };
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_SPEECH_DETECTED') {
        throw new Error('No speech detected. Please speak clearly near the microphone and try again.');
      }
      // Fall through to client-side Vosk WASM offline speech recognition
    }
  }

  try {
    const { transcribeAudioFile } = await import('./vosk-stt');
    const transcript = (await transcribeAudioFile(file)).trim();
    if (!transcript) {
      throw new Error('No speech detected. Please speak clearly near the microphone and try again.');
    }
    const { translateTextOffline } = await import('./offline-translate');
    const offlineRes = translateTextOffline(transcript, { allowOnlineFallback: false });
    return {
      transcript,
      tokens: offlineRes.tokens,
      gestures: offlineRes.gestures,
      gloss: offlineRes.gloss,
    };
  } catch (offlineErr) {
    const msg =
      offlineErr instanceof Error
        ? offlineErr.message
        : 'Speech recognition failed. Ensure microphone access and the offline speech model are available.';
    throw new Error(msg.startsWith('No speech detected') ? msg : `Speech recognition error: ${msg}`);
  }
}

import STATIC_DICTIONARY from '@/public/dictionary.json';

export type DictionaryItem = { token: string; url: string; media_type: 'gif' | 'mp4' | 'img' };

export async function fetchDictionary(): Promise<{ items: DictionaryItem[] }> {
  try {
    const res = await fetch('/dictionary.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.items) && data.items.length > 0) {
        return {
          items: data.items.map((i: DictionaryItem) => ({
            ...i,
            url: resolveApiUrl(i.url),
          })),
        };
      }
    }
  } catch (err) {
    console.warn('Network fetch for dictionary.json failed, using bundled fallback:', err);
  }

  // Guaranteed fallback for offline Android APK, PWA, and disconnected environments
  const items = ((STATIC_DICTIONARY as { items?: DictionaryItem[] })?.items || []).map((i) => ({
    ...i,
    url: resolveApiUrl(i.url),
  }));
  return { items };
}

/**
 * Check if an asset URL is reachable (for preflight validation).
 */
export async function checkAssetExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

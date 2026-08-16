export type TranslateTextRequest = { text: string };

export type TranslateResponse = {
  tokens: string[];
  gestures: string[];
  gloss?: string;
  transcript?: string;
};

const ENV_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim() || '';

function getApiBase(): string {
  if (!ENV_API_BASE) return '';
  const baseLooksLocalhost =
    ENV_API_BASE.includes('://localhost') ||
    ENV_API_BASE.includes('://127.0.0.1') ||
    ENV_API_BASE.startsWith('localhost') ||
    ENV_API_BASE.startsWith('127.0.0.1');
  if (baseLooksLocalhost) return '';
  return ENV_API_BASE;
}

export function resolveApiUrl(urlOrPath: string): string {
  const API_BASE = getApiBase();
  const u = (urlOrPath || '').trim();
  if (!u) return u;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${API_BASE}${u}`;
  return u;
}

async function http<T>(path: string, init: RequestInit): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const API_BASE = getApiBase();
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const fetchInit = { ...init, cache: init.cache || 'no-store' } as RequestInit;
  const res = await fetch(url, fetchInit);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText} (${method} ${url})`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) msg = `${data.detail} (${method} ${url})`;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function apiHealth(): Promise<{ status: string }> {
  return http('/health', { method: 'GET' });
}

export async function translateText(req: TranslateTextRequest): Promise<TranslateResponse> {
  try {
    const data = await http<TranslateResponse>('/translate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return { ...data, gestures: (data.gestures || []).map(resolveApiUrl) };
  } catch {
    // Offline fallback: use client-side glossification
    const { glossify } = await import('./glossify');
    const { tokens, gloss } = glossify(req.text);
    // Don't encodeURIComponent — tokens are already uppercase safe filenames
    const gestures = tokens.map((t) => `/assets/signs/${t}.mp4`);
    return { tokens, gestures: gestures.map(resolveApiUrl), gloss };
  }
}

export async function translateSpeechOnce(file: File): Promise<TranslateResponse> {
  try {
    const form = new FormData();
    form.append('file', file);
    const data = await http<TranslateResponse>('/translate-speech', {
      method: 'POST',
      body: form,
    });
    return { ...data, gestures: (data.gestures || []).map(resolveApiUrl) };
  } catch {
    throw new Error('Speech recognition requires an online connection or backend.');
  }
}

export type DictionaryItem = { token: string; url: string; media_type: 'gif' | 'mp4' | 'img' };

export async function fetchDictionary(): Promise<{ items: DictionaryItem[] }> {
  try {
    const res = await fetch('/dictionary.json', { cache: 'no-store' });
    if (!res.ok) return { items: [] };
    const data = await res.json();
    return {
      items: (data.items || []).map((i: DictionaryItem) => ({
        ...i,
        url: resolveApiUrl(i.url),
      })),
    };
  } catch {
    return { items: [] };
  }
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

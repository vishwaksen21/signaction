export type TranslateTextRequest = { text: string };

export type TranslateResponse = {
  tokens: string[];
  gestures: string[];
  gloss?: string;
  transcript?: string;
};

type LegacyTranslateTextResponse = {
  text: string;
  gloss: string;
  tokens: string[];
  gif_base64: string;
};

type LegacySpeechResponse = {
  transcript: string;
  gloss: string;
  tokens: string[];
  gif_base64: string;
};

const ENV_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim() || '';

function getApiBase(): string {
  // Prefer relative URLs (same-origin) when no base is provided.
  if (!ENV_API_BASE) return '';

  const baseLooksLocalhost =
    ENV_API_BASE.includes('://localhost') ||
    ENV_API_BASE.includes('://127.0.0.1') ||
    ENV_API_BASE.startsWith('localhost') ||
    ENV_API_BASE.startsWith('127.0.0.1');

  // Force same-origin when API base points to localhost.
  // In port-forwarded/devcontainer setups this often hangs because browser "localhost"
  // is not the container. Next.js rewrites can proxy correctly using same-origin paths.
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
  const res = await fetch(url, init);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText} (${method} ${url})`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) msg = `${data.detail} (${method} ${url})`;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

function isNotFoundError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message.trim().toLowerCase();
  // We format errors as: "Not Found (POST http://...)".
  // Treat any 404-ish/not-found message as a missing route for fallback purposes.
  return (
    m === 'not found' ||
    m.startsWith('not found ') ||
    m.includes('404 not found') ||
    m.startsWith('404 ') ||
    m.includes(' 404 ')
  );
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
  } catch (e) {
    // Backward-compat with the older backend (`signaction.web`) which exposes:
    // POST /api/translate/text -> { tokens, gloss, gif_base64 }
    if (!isNotFoundError(e)) throw e;
    try {
      const legacy = await http<LegacyTranslateTextResponse>('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const result = {
        tokens: legacy.tokens || [],
        gestures: legacy.gif_base64 ? [`data:image/gif;base64,${legacy.gif_base64}`] : [],
        gloss: legacy.gloss,
      };
      return result;
    } catch (e2) {
      if (isNotFoundError(e2)) {
        const API_BASE = getApiBase();
        throw new Error(
          `Backend has no translate route. Tried POST ${API_BASE}/translate-text and POST ${API_BASE}/api/translate/text`
        );
      }
      throw e2;
    }
  }
}

export async function translateSpeechOnce(file: File): Promise<TranslateResponse> {
  const form = new FormData();
  form.append('file', file);

  try {
    const data = await http<TranslateResponse>('/translate-speech', {
      method: 'POST',
      body: form,
    });

    return { ...data, gestures: (data.gestures || []).map(resolveApiUrl) };
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
    try {
      const legacy = await http<LegacySpeechResponse>('/api/translate/speech', {
        method: 'POST',
        body: form,
      });
      return {
        transcript: legacy.transcript,
        tokens: legacy.tokens || [],
        gestures: legacy.gif_base64 ? [`data:image/gif;base64,${legacy.gif_base64}`] : [],
        gloss: legacy.gloss,
      };
    } catch (e2) {
      if (isNotFoundError(e2)) {
        const API_BASE = getApiBase();
        throw new Error(
          `Backend has no speech route. Tried POST ${API_BASE}/translate-speech and POST ${API_BASE}/api/translate/speech`
        );
      }
      throw e2;
    }
  }
}

export type DictionaryItem = { token: string; url: string; media_type: 'gif' | 'mp4' | 'img' };
export async function fetchDictionary(): Promise<{ items: DictionaryItem[] }> {
  try {
    const data = await http<{ items: DictionaryItem[] }>('/api/dictionary', { method: 'GET' });
    return {
      items: (data.items || []).map((i) => ({ ...i, url: resolveApiUrl(i.url) })),
    };
  } catch (e) {
    // Legacy backend has no dictionary endpoint.
    if (isNotFoundError(e)) return { items: [] };
    throw e;
  }
}

export type TranslateTextResponse = {
  text: string;
  gloss: string;
  tokens: string[];
  gif_base64: string;
};

export type TranslateSpeechResponse = {
  transcript: string;
  gloss: string;
  tokens: string[];
  gif_base64: string;
};

const envUrl = import.meta.env.VITE_API_URL;

// Use relative URLs so Vite dev server can proxy to backend
// Or use env var to override 
const API_BASE = envUrl || '';

// Helper to build API URLs
function apiUrl(path: string): string {
  if (API_BASE) return `${API_BASE}${path}`;
  return path; // Vite proxy will handle it
}

export function gifDataUrl(b64: string): string {
  return `data:image/gif;base64,${b64}`;
}

export async function translateText(text: string): Promise<TranslateTextResponse> {
  const res = await fetch(apiUrl('/api/translate/text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return (await res.json()) as TranslateTextResponse;
}

export async function translateSpeech(file: File): Promise<TranslateSpeechResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(apiUrl('/api/translate/speech'), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return (await res.json()) as TranslateSpeechResponse;
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string };
    return data?.detail || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

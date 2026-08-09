export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL_URLS = [
  'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.tar.gz',
  'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
];

export async function GET(req: Request) {
  let lastError: string | null = null;

  for (const url of MODEL_URLS) {
    try {
      const upstream = await fetch(url, {
        headers: { accept: '*/*' },
      });

      if (!upstream.ok) {
        lastError = `HTTP ${upstream.status}`;
        continue;
      }

      const contentLength = upstream.headers.get('content-length') || '';

      return new Response(upstream.body, {
        status: 200,
        headers: {
          'content-type':
            upstream.headers.get('content-type') || 'application/gzip',
          ...(contentLength ? { 'content-length': contentLength } : {}),
          'cache-control': 'no-cache',
          'access-control-allow-origin': '*',
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: `Failed to fetch model: ${lastError}` }),
    { status: 502, headers: { 'content-type': 'application/json' } }
  );
}

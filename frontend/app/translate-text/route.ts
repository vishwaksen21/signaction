import { translateTextOffline } from '@/lib/offline-translate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rawBackend = (process.env.SIGNACTION_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();
const isLocalhost = rawBackend.includes('localhost') || rawBackend.includes('127.0.0.1');
const BACKEND_BASE = rawBackend && (!isLocalhost || process.env.NODE_ENV !== 'production')
  ? rawBackend.replace(/\/$/, '')
  : (process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : '');

export async function POST(req: Request) {
  const bodyText = await req.text();
  const contentType = req.headers.get('content-type') || 'application/json';

  if (BACKEND_BASE) {
    try {
      const upstream = await fetch(`${BACKEND_BASE}/translate-text`, {
        method: 'POST',
        headers: {
          'content-type': contentType,
          accept: req.headers.get('accept') || 'application/json',
        },
        body: bodyText,
        signal: AbortSignal.timeout(3000),
      });

      if (upstream.ok) {
        return new Response(upstream.body, {
          status: upstream.status,
          headers: upstream.headers,
        });
      }
    } catch {
      // Backend unreachable or timed out, fallback to internal translator
    }
  }

  try {
    const json = JSON.parse(bodyText);
    const text = json.text || '';
    const result = translateTextOffline(text);
    return Response.json(result);
  } catch {
    return Response.json({ tokens: [], gestures: [], gloss: '' });
  }
}

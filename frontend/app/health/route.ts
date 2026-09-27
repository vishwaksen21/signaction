export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rawBackend = (process.env.SIGNACTION_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();
const isLocalhost = rawBackend.includes('localhost') || rawBackend.includes('127.0.0.1');
const BACKEND_BASE = rawBackend && (!isLocalhost || process.env.NODE_ENV !== 'production')
  ? rawBackend.replace(/\/$/, '')
  : (process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : '');

export async function GET(req: Request) {
  if (!BACKEND_BASE) {
    return Response.json({ status: 'ok', mode: 'offline-standalone' });
  }

  try {
    const upstream = await fetch(`${BACKEND_BASE}/health`, {
      method: 'GET',
      headers: {
        accept: req.headers.get('accept') || 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (upstream.ok) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }
  } catch {
    // Backend offline / sleeping
  }

  return Response.json({ status: 'offline', message: 'Backend unreachable, offline mode active' });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rawBackend = (process.env.SIGNACTION_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();
const isLocalhost = rawBackend.includes('localhost') || rawBackend.includes('127.0.0.1');
const BACKEND_BASE = rawBackend && (!isLocalhost || process.env.NODE_ENV !== 'production')
  ? rawBackend.replace(/\/$/, '')
  : (process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : '');

export async function POST(req: Request) {
  if (!BACKEND_BASE) {
    return Response.json(
      { error: 'Speech translation backend is not configured' },
      { status: 503 }
    );
  }

  try {
    const incoming = await req.formData();
    const form = new FormData();

    for (const [key, value] of incoming.entries()) {
      form.append(key, value as any);
    }

    const upstream = await fetch(`${BACKEND_BASE}/translate-speech`, {
      method: 'POST',
      headers: {
        accept: req.headers.get('accept') || 'application/json',
      },
      body: form,
      signal: AbortSignal.timeout(8000),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return Response.json(
      { error: 'Speech translation backend unreachable' },
      { status: 503 }
    );
  }
}

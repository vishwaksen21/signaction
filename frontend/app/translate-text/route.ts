export const runtime = 'nodejs';

const BACKEND_BASE = (process.env.SIGNACTION_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function POST(req: Request) {
  const bodyText = await req.text();
  const contentType = req.headers.get('content-type') || 'application/json';

  const upstream = await fetch(`${BACKEND_BASE}/translate-text`, {
    method: 'POST',
    headers: {
      'content-type': contentType,
      accept: req.headers.get('accept') || 'application/json',
    },
    body: bodyText,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

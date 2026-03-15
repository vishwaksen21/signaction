export const runtime = 'nodejs';

const BACKEND_BASE = (process.env.SIGNACTION_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function GET(req: Request) {
  const upstream = await fetch(`${BACKEND_BASE}/dictionary`, {
    method: 'GET',
    headers: {
      accept: req.headers.get('accept') || 'application/json',
    },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

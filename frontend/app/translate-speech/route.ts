export const runtime = 'nodejs';

const BACKEND_BASE = (process.env.SIGNACTION_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function POST(req: Request) {
  const incoming = await req.formData();
  const form = new FormData();

  for (const [key, value] of incoming.entries()) {
    // Forward all fields; file entries stay as File
    form.append(key, value as any);
  }

  const upstream = await fetch(`${BACKEND_BASE}/translate-speech`, {
    method: 'POST',
    headers: {
      accept: req.headers.get('accept') || 'application/json',
    },
    body: form,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export const runtime = 'nodejs';

const BACKEND_BASE = (process.env.SIGNACTION_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

function encodePath(parts: string[]) {
  return parts.map((p) => encodeURIComponent(p)).join('/');
}

async function proxy(req: Request, pathParts: string[]) {
  const url = new URL(req.url);
  const upstreamUrl = `${BACKEND_BASE}/placeholder/${encodePath(pathParts)}${url.search}`;

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: {
      accept: req.headers.get('accept') || '*/*',
    },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path || []);
}

export async function HEAD(req: Request, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path || []);
}

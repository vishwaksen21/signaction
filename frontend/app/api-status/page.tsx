'use client';

import { useEffect, useState } from 'react';
import { apiHealth } from '../../lib/api';

export default function ApiStatusPage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t0 = performance.now();
      try {
        await apiHealth();
        const t1 = performance.now();
        if (!mounted) return;
        setLatencyMs(Math.round(t1 - t0));
        setStatus('ok');
      } catch (e) {
        if (!mounted) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">API Status</h1>
      {status === 'loading' ? <div className="text-slate-300">Checking…</div> : null}
      {status === 'ok' ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm text-slate-300">Backend health: OK</div>
          <div className="mt-2 text-sm text-slate-400">Latency: {latencyMs}ms</div>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/40 p-5 text-sm text-red-200">
          {error ?? 'Unknown error'}
        </div>
      ) : null}
    </div>
  );
}

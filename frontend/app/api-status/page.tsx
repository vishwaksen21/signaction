'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Loader2, Server, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-sign-soft/40 dark:bg-slate-950 text-sign-darktext dark:text-white py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sign-verylight dark:bg-sign-navy/40 text-sign-blue dark:text-sign-cyan font-semibold text-xs tracking-wider uppercase mb-5 border border-sign-border/60 shadow-sm">
              <Server size={14} className="text-sign-bright" />
              Infrastructure Status
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-sign-navy dark:text-white mb-3">
              API <span className="sign-text-gradient">Status</span>
            </h1>
            <p className="text-sm md:text-base text-sign-muted dark:text-slate-400">
              Live health monitor and latency check for the SignAction backend services.
            </p>
          </motion.div>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="sign-card p-8 md:p-10 mb-8"
        >
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={36} className="text-sign-bright animate-spin mb-4" />
              <p className="text-sign-muted dark:text-slate-400 font-semibold text-sm">
                Pinging SignAction backend...
              </p>
            </div>
          )}

          {status === 'ok' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <CheckCircle size={26} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sign-navy dark:text-white">Backend Systems Online</h2>
                  <p className="text-xs text-sign-muted dark:text-slate-400">All microservices and translation endpoints operational</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-sign-soft/70 dark:bg-slate-900 border border-sign-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sign-muted dark:text-slate-400 mb-2">
                    <Activity size={14} className="text-sign-bright" />
                    Roundtrip Latency
                  </div>
                  <div className="text-3xl font-extrabold text-sign-navy dark:text-white">
                    {latencyMs}<span className="text-base font-normal text-sign-muted ml-1">ms</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-sign-soft/70 dark:bg-slate-900 border border-sign-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sign-muted dark:text-slate-400 mb-2">
                    <Activity size={14} className="text-emerald-500" />
                    HTTP Status
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    200 OK
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-center shrink-0">
                  <XCircle size={26} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sign-navy dark:text-white">Backend Service Unreachable</h2>
                  <p className="text-xs text-sign-muted dark:text-slate-400">Offline fallback mode is automatically active</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-5">
                <p className="text-xs font-mono text-red-700 dark:text-red-400">
                  {error ?? 'Unknown connection error'}
                </p>
              </div>

              <p className="text-xs text-sign-muted dark:text-slate-400">
                Tip: SignAction supports 100% offline translation! You can continue translating English to sign language locally via client-side Vosk and rule engines.
              </p>
            </div>
          )}
        </motion.div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/translator"
            className="inline-flex items-center gap-2 text-xs font-bold text-sign-bright hover:underline uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            Back to Translator
          </Link>
        </div>

      </div>
    </div>
  );
}


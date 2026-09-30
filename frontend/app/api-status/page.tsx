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
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#38BDF8] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#38BDF8]" />
              <span>Infrastructure Health</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl tracking-tight text-[#062B5C] dark:text-white mb-3">
              System & API <span className="text-[#0757E8] dark:text-[#38BDF8]">Status</span>
            </h1>
            <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400">
              Live health monitor and roundtrip latency check for SignAction backend services.
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
              <Loader2 size={36} className="text-[#0757E8] animate-spin mb-4" />
              <p className="text-[#64748B] dark:text-slate-400 font-semibold text-sm">
                Checking SignAction services…
              </p>
            </div>
          )}

          {status === 'ok' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#062B5C] dark:text-white">
                    All Systems Operational
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    FastAPI microservice endpoints and gesture databases are responding normally
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
                    <Activity size={14} className="text-[#0757E8]" />
                    Roundtrip Latency
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-[#062B5C] dark:text-white">
                    {latencyMs}<span className="text-base font-normal text-[#64748B] ml-1">ms</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
                    <Activity size={14} className="text-emerald-500" />
                    HTTP Status
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    200 OK
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                  <XCircle size={24} className="text-rose-500" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#062B5C] dark:text-white">
                    Backend Service Unreachable
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Automatic offline fallback mode is currently engaged
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-5">
                <p className="text-xs font-mono text-rose-700 dark:text-rose-400">
                  {error ?? 'Network connection timeout'}
                </p>
              </div>

              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Note: SignAction is designed offline-first. Even when backend APIs are unreachable, local text translation, speech recognition, and gesture playback function smoothly.
              </p>
            </div>
          )}
        </motion.div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/translator"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0757E8] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Return to Translator</span>
          </Link>
        </div>

      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Loader2, Server } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-apple-surface-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <Server size={32} className="text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              API Status
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Check the health and latency of the SignAction backend.
            </p>
          </motion.div>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={32} className="text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Checking backend health...</p>
            </div>
          )}

          {status === 'ok' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Backend Online</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">All systems operational</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <Activity size={16} />
                    Latency
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {latencyMs}<span className="text-lg font-normal text-slate-400">ms</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <Activity size={16} />
                    Status
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    200
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Backend Offline</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Unable to reach the server</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-5">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {error ?? 'Unknown error'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

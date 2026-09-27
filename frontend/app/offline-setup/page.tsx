'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Loader2,
  Check,
  WifiOff,
  Mic,
  Hand,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  setupOffline,
  isFullyOfflineReady,
  type OfflineSetupProgress,
  type DownloadPhase,
} from '../../lib/offline-setup';

type SetupState = 'idle' | 'downloading' | 'complete' | 'error';

const PHASE_LABELS: Record<DownloadPhase, string> = {
  model: 'Vosk Speech AI Model',
  assets: 'Sign Language Gesture Library',
  appshell: 'Offline Application Shell',
  done: 'Installation Complete',
};

export default function OfflineSetupPage() {
  const [state, setState] = useState<SetupState>('idle');
  const [progress, setProgress] = useState<OfflineSetupProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReady, setAlreadyReady] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const mountedRef = useRef(true);

  // Check if already set up (with cleanup)
  useEffect(() => {
    mountedRef.current = true;
    isFullyOfflineReady().then(({ ready, isNative: native }) => {
      if (mountedRef.current) {
        setIsNative(native);
        if (ready || native) setAlreadyReady(true);
      }
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDownload = useCallback(async () => {
    setState('downloading');
    setError(null);

    try {
      const result = await setupOffline((p) => {
        if (mountedRef.current) setProgress(p);
      });

      if (mountedRef.current) {
        if (result.success) {
          setState('complete');
        } else {
          setState('error');
          setError(result.error || 'Download failed');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Unexpected error');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-sign-soft/40 dark:bg-slate-950 text-sign-darktext dark:text-white transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden py-14 lg:py-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sign-verylight dark:bg-sign-navy/40 border border-sign-border/60 text-sign-blue dark:text-sign-cyan text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
              <ShieldCheck size={14} className="text-sign-bright" />
              100% Offline Capability
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-sign-navy dark:text-white mb-4">
              Go <span className="sign-text-gradient">Offline</span>
            </h1>
            <p className="text-base sm:text-xl text-sign-muted dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              {isNative
                ? 'SignAction Android APK is packaged with local offline speech recognition and bundled sign assets. Completely offline from first launch.'
                : 'Download everything you need to use SignAction without an internet connection. One click, one time, works forever.'}
            </p>
          </motion.div>

          {/* What gets downloaded / bundled */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12 text-left"
          >
            {[
              {
                icon: <Mic size={22} />,
                title: 'Speech Recognition',
                size: isNative ? 'Bundled' : '~40MB',
                desc: isNative
                  ? 'Offline speech model: ✓ Available locally'
                  : 'Vosk AI speech model for on-device voice recognition',
              },
              {
                icon: <Hand size={22} />,
                title: 'Sign Assets',
                size: isNative ? 'Bundled' : '~18MB',
                desc: isNative
                  ? '182 sign videos & 36 alphabet signs'
                  : '100+ gesture videos, ISL alphabet, and fallbacks',
              },
              {
                icon: <RefreshCw size={22} />,
                title: 'App Shell',
                size: isNative ? 'Bundled' : '~1MB',
                desc: isNative
                  ? 'Local Android application shell'
                  : 'Cached offline application shell & dictionary assets',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="sign-card p-6 flex flex-col justify-between hover:border-sign-bright/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 bg-sign-verylight dark:bg-sign-navy/40 text-sign-bright rounded-2xl flex items-center justify-center border border-sign-border/60">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sign-soft dark:bg-slate-800 text-sign-blue dark:text-sign-cyan border border-sign-border/50">
                      {item.size}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-sign-navy dark:text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-sign-muted dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Download Button / Progress / Complete */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="sign-card p-8 md:p-10 max-w-xl mx-auto"
          >
            {(alreadyReady || isNative) && state === 'idle' ? (
              <div className="space-y-5 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-sm font-semibold">
                  <Check size={18} />
                  {isNative
                    ? 'Offline speech model: ✓ Available locally'
                    : '100% Offline Ready on This Device'}
                </div>
                <p className="text-sm text-sign-muted dark:text-slate-400">
                  All models and gesture clips are cached locally. You can use SignAction without Wi-Fi or mobile data.
                </p>
                <div>
                  <Link
                    href="/translator"
                    className="btn-sign-primary inline-flex items-center gap-2 px-8 py-3.5"
                  >
                    Start Translating
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : state === 'idle' || state === 'error' ? (
              <div className="space-y-4 text-center">
                <button
                  onClick={handleDownload}
                  className="btn-sign-primary inline-flex items-center justify-center gap-3 text-base px-10 py-4 w-full sm:w-auto shadow-lg shadow-sign-blue/20"
                >
                  <Download size={20} />
                  Download for Offline Use
                </button>
                <p className="text-xs text-sign-muted dark:text-slate-400">
                  Total download: ~59MB · Stored in device browser cache · Works completely offline
                </p>
                {error && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    {error}
                  </p>
                )}
              </div>
            ) : state === 'downloading' ? (
              <div className="space-y-6">
                {/* Phase indicator */}
                <div className="text-left space-y-3">
                  {(['model', 'assets', 'appshell'] as DownloadPhase[]).map(
                    (phase) => {
                      const isCurrentPhase = progress?.phase === phase;
                      const isPhaseDone =
                        (phase === 'model' &&
                          (progress?.overallPercent ?? 0) >= 30) ||
                        (phase === 'assets' &&
                          (progress?.overallPercent ?? 0) >= 80) ||
                        (phase === 'appshell' &&
                          (progress?.overallPercent ?? 0) >= 95);

                      return (
                        <div
                          key={phase}
                          className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all ${
                            isCurrentPhase
                              ? 'bg-sign-verylight dark:bg-sign-navy/40 border border-sign-border'
                              : isPhaseDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30'
                              : 'opacity-50 border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isPhaseDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrentPhase
                                ? 'bg-gradient-to-r from-sign-blue to-sign-cyan text-white'
                                : 'bg-sign-soft dark:bg-slate-800 text-sign-muted'
                            }`}
                          >
                            {isPhaseDone ? (
                              <Check size={14} />
                            ) : isCurrentPhase ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <span className="text-xs font-bold">
                                {phase === 'model'
                                  ? '1'
                                  : phase === 'assets'
                                  ? '2'
                                  : '3'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-bold ${
                                isPhaseDone
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-sign-navy dark:text-white'
                              }`}
                            >
                              {PHASE_LABELS[phase]}
                            </p>
                            {isCurrentPhase && progress && (
                              <p className="text-xs text-sign-muted dark:text-slate-400">
                                {progress.message}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Overall progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sign-muted dark:text-slate-400">
                      Overall Progress
                    </span>
                    <span className="text-sm font-extrabold text-sign-bright">
                      {progress?.overallPercent ?? 0}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-sign-soft dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-sign-border/40">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sign-blue to-sign-cyan rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${progress?.overallPercent ?? 0}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            ) : state === 'complete' ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <Check size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-sign-navy dark:text-white mb-2">
                    Ready for Offline Use!
                  </h2>
                  <p className="text-sm text-sign-muted dark:text-slate-300">
                    SignAction speech AI and gesture library are now saved locally. You can use it anywhere without data connectivity.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/translator"
                    className="btn-sign-primary inline-flex items-center gap-2 px-8 py-3"
                  >
                    Start Translating
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/"
                    className="btn-sign-secondary inline-flex items-center gap-2 px-6 py-3"
                  >
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-sign-border/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-sign-bright uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sign-navy dark:text-white mt-1">
              How Offline Mode Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'One-Time Cache',
                desc: 'Download the ~59MB package once on Wi-Fi.',
              },
              {
                step: '02',
                title: 'PWA / Native Storage',
                desc: 'IndexedDB & CacheStorage store the AI weights securely.',
              },
              {
                step: '03',
                title: 'True Offline Run',
                desc: 'Switch to Airplane mode; speech & gestures run instantly on-device.',
              },
            ].map((item) => (
              <div key={item.step} className="sign-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-sign-verylight dark:bg-sign-navy/40 text-sign-bright font-extrabold text-xs mb-4 border border-sign-border/60">
                  {item.step}
                </div>
                <h3 className="font-bold text-base text-sign-navy dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-sign-muted dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


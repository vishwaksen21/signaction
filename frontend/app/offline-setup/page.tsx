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
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';
import {
  setupOffline,
  isFullyOfflineReady,
  type OfflineSetupProgress,
  type DownloadPhase,
} from '../../lib/offline-setup';
import { isNativeApk } from '../../lib/platform';

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
  const [isChecking, setIsChecking] = useState(true);
  const mountedRef = useRef(true);

  // Check if already set up (with cleanup)
  useEffect(() => {
    mountedRef.current = true;
    const native = isNativeApk();
    const locallyDone =
      typeof localStorage !== 'undefined' &&
      localStorage.getItem('signaction_offline_installed') === 'true';

    if (native || locallyDone) {
      setIsNative(native);
      setAlreadyReady(true);
      setIsChecking(false);
    }

    isFullyOfflineReady().then(({ ready, isNative: detectedNative }) => {
      if (mountedRef.current) {
        const isApk = detectedNative || native;
        setIsNative(isApk);
        if (ready || isApk || locallyDone) {
          setAlreadyReady(true);
        }
        setIsChecking(false);
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
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden py-14 lg:py-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.04)] text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#12CFF3] mb-5">
              <span className="w-2 h-2 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]" />
              <span>100% Offline Capability</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-[#062B5C] dark:text-white mb-4">
              Private, on-device <span className="text-[#0757E8] dark:text-[#12CFF3]">sign translation.</span>
            </h1>
            <p className="text-base sm:text-xl text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
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
            ].map((item) => (
              <div
                key={item.title}
                className="sign-card p-6 flex flex-col justify-between hover:border-[#0757E8]/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] rounded-xl flex items-center justify-center border border-blue-200/80 dark:border-blue-900/50">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F4F8] dark:bg-slate-800 text-[#0757E8] dark:text-[#12CFF3] border border-slate-200/80 dark:border-slate-700">
                      {item.size}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
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
            {isChecking ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin text-[#0757E8]" />
                <span className="text-sm font-medium">Checking offline readiness…</span>
              </div>
            ) : (alreadyReady || isNative) && state === 'idle' ? (
              <div className="space-y-5 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-sm font-semibold">
                  <Check size={18} />
                  {isNative
                    ? 'Native Android APK · 100% Offline Ready'
                    : '100% Offline Ready on This Device'}
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  {isNative
                    ? 'All speech models, vocabulary, and 182 gesture videos are bundled directly inside this Android app. No downloads required.'
                    : 'All models and gesture clips are cached locally. You can use SignAction without Wi-Fi or mobile data.'}
                </p>
                <div>
                  <Link
                    href="/translator"
                    className="btn-sign-primary inline-flex items-center gap-2 px-8 py-3.5"
                  >
                    <span>Start Translating</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : isNative ? (
              <div className="space-y-5 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-sm font-semibold">
                  <Check size={18} />
                  <span>Native Android APK · Ready Offline</span>
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  All models and assets are pre-installed in your APK.
                </p>
                <div>
                  <Link
                    href="/translator"
                    className="btn-sign-primary inline-flex items-center gap-2 px-8 py-3.5"
                  >
                    <span>Start Translating</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : state === 'idle' || state === 'error' ? (
              <div className="space-y-4 text-center">
                <button
                  onClick={handleDownload}
                  className="btn-sign-primary inline-flex items-center justify-center gap-3 text-base px-10 py-4 w-full sm:w-auto shadow-md"
                >
                  <Download size={20} />
                  <span>Download for Offline Use (Browser)</span>
                </button>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Stored in device browser cache · Works completely offline
                </p>

                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={OFFICIAL_APK_DOWNLOAD_URL}
                    className="btn-sign-secondary inline-flex items-center justify-center gap-2 text-sm px-6 py-3 w-full sm:w-auto"
                  >
                    <Smartphone size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
                    <span>Download Native Android APK (145 MB)</span>
                  </a>
                </div>
                {error && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
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
                              ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50'
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
                                ? 'bg-[#0757E8] text-white'
                                : 'bg-[#F0F4F8] dark:bg-slate-800 text-[#64748B]'
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
                                  : 'text-[#062B5C] dark:text-white'
                              }`}
                            >
                              {PHASE_LABELS[phase]}
                            </p>
                            {isCurrentPhase && progress && (
                              <p className="text-xs text-[#64748B] dark:text-slate-400">
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
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-[#0757E8] dark:text-[#12CFF3]">
                      {progress?.overallPercent ?? 0}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#0757E8] rounded-full"
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
                  <h2 className="font-heading text-2xl font-extrabold text-[#062B5C] dark:text-white mb-2">
                    Ready for Offline Use!
                  </h2>
                  <p className="text-sm text-[#64748B] dark:text-slate-300">
                    SignAction speech AI and gesture library are now saved locally. You can use it anywhere without data connectivity.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/translator"
                    className="btn-sign-primary inline-flex items-center gap-2 px-8 py-3"
                  >
                    <span>Start Translating</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/"
                    className="btn-sign-secondary inline-flex items-center gap-2 px-6 py-3"
                  >
                    <span>Back to Home</span>
                  </Link>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200/80 dark:border-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#0757E8] uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white mt-1">
              How Offline Mode Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'One-Time Cache',
                desc: 'Download the ~59MB package once on Wi-Fi or broadband.',
              },
              {
                step: '02',
                title: 'Browser & PWA Storage',
                desc: 'IndexedDB & CacheStorage store the AI weights securely on device.',
              },
              {
                step: '03',
                title: 'True Offline Execution',
                desc: 'Disconnect internet completely; speech & gestures run instantly on-device.',
              },
            ].map((item) => (
              <div key={item.step} className="sign-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] font-mono font-bold text-xs mb-4 border border-blue-200/80 dark:border-blue-900/50">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
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


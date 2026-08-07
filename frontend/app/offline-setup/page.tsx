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
  model: 'Speech Recognition Model',
  assets: 'Sign Language Assets',
  appshell: 'Offline App Shell',
  done: 'Complete',
};

export default function OfflineSetupPage() {
  const [state, setState] = useState<SetupState>('idle');
  const [progress, setProgress] = useState<OfflineSetupProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReady, setAlreadyReady] = useState(false);
  const mountedRef = useRef(true);

  // Check if already set up (with cleanup)
  useEffect(() => {
    mountedRef.current = true;
    isFullyOfflineReady().then(({ ready }) => {
      if (mountedRef.current && ready) setAlreadyReady(true);
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
    <div className="min-h-screen bg-apple-canvas text-apple-ink">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 mb-8"
          >
            <WifiOff size={36} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-apple-hero font-display font-semibold mb-4"
          >
            Go Offline
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-apple-lead text-apple-ink-muted-80 max-w-xl mx-auto mb-12"
          >
            Download everything you need to use SignAction without internet.
            One click, one time, works forever.
          </motion.p>

          {/* What gets downloaded */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            {[
              {
                icon: <Mic size={20} />,
                title: 'Speech Recognition',
                size: '~40MB',
                desc: 'Vosk AI model for voice-to-text',
              },
              {
                icon: <Hand size={20} />,
                title: 'Sign Assets',
                size: '~18MB',
                desc: '100+ gesture videos & alphabet',
              },
              {
                icon: <RefreshCw size={20} />,
                title: 'App Shell',
                size: '~1MB',
                desc: 'Cached pages & UI components',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="store-utility-card text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-apple-body-strong">{item.title}</h3>
                    <span className="text-apple-caption text-apple-ink-muted-48">
                      {item.size}
                    </span>
                  </div>
                </div>
                <p className="text-apple-caption text-apple-ink-muted-80">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Download Button / Progress / Complete */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {alreadyReady && state === 'idle' ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  <Check size={16} />
                  Already set up for offline use
                </div>
                <div>
                  <Link
                    href="/realtime"
                    className="btn-primary inline-flex items-center gap-2 px-8"
                  >
                    Open Translator
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : state === 'idle' || state === 'error' ? (
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="btn-store-hero inline-flex items-center gap-3 text-lg px-10 py-5"
                >
                  <Download size={22} />
                  Download for Offline
                </button>
                <p className="text-apple-caption text-apple-ink-muted-48">
                  Total: ~59MB · One-time download · Works forever
                </p>
                {error && (
                  <p className="text-apple-caption text-red-600">{error}</p>
                )}
              </div>
            ) : state === 'downloading' ? (
              <div className="max-w-md mx-auto space-y-6">
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
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isCurrentPhase
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50'
                              : isPhaseDone
                              ? 'bg-green-50 dark:bg-green-900/10'
                              : 'opacity-50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isPhaseDone
                                ? 'bg-green-500 text-white'
                                : isCurrentPhase
                                ? 'bg-blue-600 text-white'
                                : 'bg-apple-canvas-parchment text-apple-ink-muted-48'
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
                              <span className="text-[10px] font-bold">
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
                              className={`text-sm font-medium ${
                                isPhaseDone
                                  ? 'text-green-700 dark:text-green-400'
                                  : 'text-apple-ink'
                              }`}
                            >
                              {PHASE_LABELS[phase]}
                            </p>
                            {isCurrentPhase && progress && (
                              <p className="text-xs text-apple-ink-muted-48">
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
                    <span className="text-apple-caption text-apple-ink-muted-80">
                      Overall Progress
                    </span>
                    <span className="text-apple-caption-strong text-blue-600">
                      {progress?.overallPercent ?? 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-apple-canvas-parchment rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600 rounded-full"
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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Check size={32} />
                </div>
                <div>
                  <h2 className="text-apple-display-md mb-2">
                    You're Ready!
                  </h2>
                  <p className="text-apple-body text-apple-ink-muted-80">
                    SignAction now works without internet. You can use it
                    anywhere.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/realtime"
                    className="btn-primary inline-flex items-center gap-2 px-8"
                  >
                    <Mic size={18} />
                    Start Translating
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/"
                    className="btn-secondary-pill inline-flex items-center gap-2 px-6"
                  >
                    Home
                  </Link>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-apple-hairline py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-apple-display-md text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Download',
                desc: 'Tap the button above. ~59MB downloads in one go.',
              },
              {
                step: '2',
                title: 'Install',
                desc: 'App installs to your homescreen as a PWA.',
              },
              {
                step: '3',
                title: 'Use Offline',
                desc: 'Turn on airplane mode and start translating.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-apple-body-strong mb-1">{item.title}</h3>
                <p className="text-apple-caption text-apple-ink-muted-80">
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

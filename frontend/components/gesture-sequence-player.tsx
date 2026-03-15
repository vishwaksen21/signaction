'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Hand } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { SignViewer } from './sign-viewer';

export function GestureSequencePlayer({
  gestures,
  loading,
}: {
  gestures: string[];
  loading?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = useMemo(() => gestures[index] ?? null, [gestures, index]);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [gestures.join('|')]);

  useEffect(() => {
    if (!playing) return;
    if (gestures.length <= 1) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % gestures.length);
    }, 800);

    return () => window.clearInterval(t);
  }, [playing, gestures.length]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const progress = gestures.length > 0 ? ((index + 1) / gestures.length) * 100 : 0;

  const seekFromPercent = (pct: number) => {
    if (!gestures.length) return;
    const clamped = Math.max(0, Math.min(1, pct));
    const nextIndex = Math.max(0, Math.min(gestures.length - 1, Math.floor(clamped * gestures.length)));
    setIndex(nextIndex);
    setPlaying(false);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Video/Image Container */}
      <div className="relative group">
        <div className="aspect-video rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-lg dark:border-slate-700 dark:bg-slate-900 light:border-slate-200 light:bg-white">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full flex items-center justify-center"
              >
                <SignViewer url={current} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/15 text-indigo-300">
                    <Hand size={22} />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900">No gestures yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">Enter text or speech to start translating</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesture Counter Overlay */}
        {gestures.length > 0 && (
          <motion.div
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur border border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xs font-medium text-white">
              Gesture {index + 1} <span className="text-slate-400">/ {gestures.length}</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      {gestures.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekFromPercent(pct);
          }}
          className="h-2 w-full rounded-full bg-slate-800 overflow-hidden dark:bg-slate-800 light:bg-slate-200"
          aria-label="Playback timeline"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </button>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={!gestures.length || index === 0}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm dark:bg-slate-800/50 dark:hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200"
            aria-label="Previous gesture"
          >
            <SkipBack size={18} className="text-slate-300 dark:text-slate-300 light:text-slate-700" />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPlaying((p) => !p)}
            disabled={gestures.length <= 1}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
            aria-label={playing ? 'Pause playback' : 'Play gestures'}
          >
            {playing ? (
              <Pause size={18} className="text-white fill-white" />
            ) : (
              <Play size={18} className="text-white fill-white ml-0.5" />
            )}
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIndex((i) => Math.min(gestures.length - 1, i + 1))}
            disabled={!gestures.length || index >= gestures.length - 1}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm dark:bg-slate-800/50 dark:hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200"
            aria-label="Next gesture"
          >
            <SkipForward size={18} className="text-slate-300 dark:text-slate-300 light:text-slate-700" />
          </motion.button>
        </div>

        {/* Gesture Info */}
        {gestures.length > 0 && (
          <motion.div
            className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-lg bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {gestures.length === 1 ? '1 gesture' : `${gestures.length} gestures`}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

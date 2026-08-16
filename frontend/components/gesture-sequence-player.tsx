'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Hand } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { SignViewer } from './sign-viewer';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function GestureSequencePlayer({
  gestures,
  loading,
}: {
  gestures: string[];
  loading?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState(1);

  const current = useMemo(() => gestures[index] ?? null, [gestures, index]);
  const isMp4 = current?.toLowerCase().endsWith('.mp4') ?? false;

  // Reset on new translation and auto-play
  useEffect(() => {
    setIndex(0);
    setDirection(1);
    setPlaying(gestures.length > 0);
  }, [gestures.join('|')]);

  const handleEnded = () => {
    if (!playing) return;
    if (index < gestures.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    } else {
      setPlaying(false);
      setDirection(1);
      setIndex(0); // Reset to start after finishing
    }
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl bg-apple-surface-pearl" />;
  }

  const progress = gestures.length > 0 ? ((index + 1) / gestures.length) * 100 : 0;

  const seekFromPercent = (pct: number) => {
    if (!gestures.length) return;
    const clamped = Math.max(0, Math.min(1, pct));
    const nextIndex = Math.max(0, Math.min(gestures.length - 1, Math.floor(clamped * gestures.length)));
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
    setPlaying(false);
  };

  return (
    <div className="space-y-4">
      {/* Video/Image Container */}
      <div className="relative group">
        <div className="aspect-video rounded-xl border border-apple-hairline bg-apple-canvas-parchment overflow-hidden flex items-center justify-center relative min-h-[200px] md:min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            {current ? (
              <motion.div
                key={index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full h-full flex items-center justify-center absolute inset-0"
              >
                <SignViewer url={current} onEnded={handleEnded} playing={playing} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-surface-pearl text-apple-primary">
                    <Hand size={22} />
                  </div>
                  <p className="text-apple-body-strong">No gestures yet</p>
                  <p className="text-apple-caption text-apple-ink-muted-48 mt-1">Enter text or speech to start translating</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesture Counter Overlay */}
        {gestures.length > 0 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-apple-surface-black/50 backdrop-blur border border-apple-hairline">
            <p className="text-apple-micro-legal text-apple-on-dark">
              Gesture {index + 1} <span className="text-apple-ink-muted-48">/ {gestures.length}</span>
            </p>
          </div>
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
          className="h-2 w-full rounded-full bg-apple-surface-pearl overflow-hidden"
          aria-label="Playback timeline"
        >
          <motion.div
            className="h-full rounded-full bg-apple-primary"
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
          <button
            onClick={() => {
              setDirection(-1);
              setIndex((i) => Math.max(0, i - 1));
            }}
            disabled={!gestures.length || index === 0}
            className="p-2 rounded-lg bg-apple-surface-pearl hover:bg-apple-canvas-parchment disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-ink border border-apple-hairline"
            aria-label="Previous gesture"
          >
            <SkipBack size={18} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={gestures.length <= 1}
            className="p-2.5 rounded-lg bg-apple-primary hover:bg-apple-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-on-dark"
            aria-label={playing ? 'Pause playback' : 'Play gestures'}
          >
            {playing ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="fill-current ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={() => {
              setDirection(1);
              setIndex((i) => Math.min(gestures.length - 1, i + 1));
            }}
            disabled={!gestures.length || index >= gestures.length - 1}
            className="p-2 rounded-lg bg-apple-surface-pearl hover:bg-apple-canvas-parchment disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-ink border border-apple-hairline"
            aria-label="Next gesture"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Gesture Info */}
        {gestures.length > 0 && (
          <div className="text-apple-caption text-apple-ink-muted-80 font-medium px-3 py-1.5 rounded-lg bg-apple-surface-pearl border border-apple-hairline">
            {gestures.length === 1 ? '1 gesture' : `${gestures.length} gestures`}
          </div>
        )}
      </div>
    </div>
  );
}

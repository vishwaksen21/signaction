'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  const [direction, setDirection] = useState(1);

  const current = useMemo(
    () => gestures[index] ?? null,
    [gestures, index]
  );

  // Reset whenever a completely new gesture sequence arrives
  useEffect(() => {
    setIndex(0);
    setDirection(1);
    setPlaying(gestures.length > 0);
  }, [gestures.join('|')]);

  /**
   * ONE function controls automatic sequence advancement.
   */
  const handleEnded = useCallback(() => {
    setIndex((prev) => {
      const next = prev + 1;

      if (next >= gestures.length) {
        // Sequence finished
        setPlaying(false);
        setDirection(1);
        return prev;
      }

      setDirection(1);
      return next;
    });
  }, [gestures.length]);

  if (loading) {
    return (
      <Skeleton className="aspect-video w-full rounded-xl bg-apple-surface-pearl" />
    );
  }

  const progress =
    gestures.length > 0
      ? ((index + 1) / gestures.length) * 100
      : 0;

  const seekFromPercent = (pct: number) => {
    if (!gestures.length) return;

    const clamped = Math.max(0, Math.min(1, pct));

    const nextIndex = Math.max(
      0,
      Math.min(
        gestures.length - 1,
        Math.floor(clamped * gestures.length)
      )
    );

    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
    setPlaying(false);
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Playback frame */}
      <div className="relative group aspect-video w-full rounded-xl border border-apple-hairline bg-apple-canvas-parchment overflow-hidden">

        {current ? (
          <div className="absolute inset-0">

            <SignViewer
              /*
               * IMPORTANT:
               * index is part of the key.
               *
               * This guarantees that gesture #2 gets a completely
               * fresh player even if the URL happens to be identical
               * to gesture #1.
               */
              key={`${index}-${current}`}
              url={current}
              onEnded={handleEnded}
              playing={playing}
            />

          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">

              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-surface-pearl text-apple-primary">
                <Hand size={22} />
              </div>

              <p className="text-apple-body-strong text-sm">
                No gestures yet
              </p>

              <p className="text-apple-caption text-apple-ink-muted-48 mt-1 text-xs">
                Enter text or speech to start translating
              </p>

            </div>
          </div>
        )}

        {/* Counter */}
        {gestures.length > 0 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-apple-surface-black/50 backdrop-blur border border-apple-hairline z-10">
            <p className="text-apple-micro-legal text-apple-on-dark">
              Gesture {index + 1}{' '}
              <span className="text-apple-ink-muted-48">
                / {gestures.length}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      {gestures.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            const rect =
              e.currentTarget.getBoundingClientRect();

            const pct =
              (e.clientX - rect.left) / rect.width;

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

          {/* Previous */}
          <button
            onClick={() => {
              setDirection(-1);
              setIndex((i) => Math.max(0, i - 1));
              setPlaying(false);
            }}
            disabled={!gestures.length || index === 0}
            className="p-2 rounded-lg bg-apple-surface-pearl hover:bg-apple-canvas-parchment disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-ink border border-apple-hairline"
            aria-label="Previous gesture"
          >
            <SkipBack size={18} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={!gestures.length}
            className="p-2.5 rounded-lg bg-apple-primary hover:bg-apple-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-on-dark"
            aria-label={playing ? 'Pause playback' : 'Play gestures'}
          >
            {playing ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => {
              if (index >= gestures.length - 1) return;

              setDirection(1);
              setIndex((i) =>
                Math.min(gestures.length - 1, i + 1)
              );
              setPlaying(false);
            }}
            disabled={
              !gestures.length ||
              index >= gestures.length - 1
            }
            className="p-2 rounded-lg bg-apple-surface-pearl hover:bg-apple-canvas-parchment disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-apple-ink border border-apple-hairline"
            aria-label="Next gesture"
          >
            <SkipForward size={18} />
          </button>

        </div>

        {/* Info */}
        {gestures.length > 0 && (
          <div className="text-apple-caption text-apple-ink-muted-80 font-medium px-3 py-1.5 rounded-lg bg-apple-surface-pearl border border-apple-hairline">
            {gestures.length === 1
              ? '1 gesture'
              : `${gestures.length} gestures`}
          </div>
        )}

      </div>
    </div>
  );
}
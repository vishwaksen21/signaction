'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Hand } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { SignViewer } from './sign-viewer';

export interface GestureSequencePlayerProps {
  gestures: string[];
  tokens?: string[];
  onIndexChange?: (index: number) => void;
  loading?: boolean;
}

export function GestureSequencePlayer({
  gestures,
  tokens,
  onIndexChange,
  loading,
}: GestureSequencePlayerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState(1);

  const current = useMemo(
    () => gestures[index] ?? null,
    [gestures, index]
  );

  // Notify parent component of current gesture/token index
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

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
      <Skeleton className="aspect-video w-full rounded-2xl bg-sign-border/30" />
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
    <div className="flex flex-col gap-4">
      {/* Player Top Header matching specification */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-[#062B5C] dark:text-white">
          Gesture Playback
        </h3>
        {gestures.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EAF9FF] dark:bg-blue-950/70 border border-[rgba(7,87,232,0.15)] text-[#0757E8] dark:text-[#7DEBFA]">
            Gesture {index + 1} / {gestures.length}
          </span>
        )}
      </div>

      {/* Playback Frame */}
      <div className="relative group aspect-video w-full rounded-[24px] border border-[rgba(7,87,232,0.16)] dark:border-blue-900/60 bg-[#F4FAFF] dark:bg-[#020d2b] overflow-hidden shadow-sm">
        {current ? (
          <div className="absolute inset-0">
            <SignViewer
              key={`${index}-${current}`}
              url={current}
              onEnded={handleEnded}
              playing={playing}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF9FF] dark:bg-blue-950/80 text-[#0757E8] dark:text-[#12CFF3] border border-[rgba(7,87,232,0.15)] shadow-sm">
                <Hand size={26} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#062B5C] dark:text-white">
                  No gestures queued
                </p>
                <p className="text-xs text-[#60759A] dark:text-slate-400 max-w-xs mx-auto">
                  Enter text or speech above to generate animated sign gestures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Active Word Tag */}
        {tokens && tokens[index] && gestures.length > 0 && (
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-[rgba(7,87,232,0.18)] shadow-sm z-10">
            <span className="text-xs font-mono font-bold text-[#0757E8] dark:text-[#7DEBFA]">
              {tokens[index]}
            </span>
          </div>
        )}
      </div>

      {/* Blue / Cyan Progress Bar */}
      {gestures.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekFromPercent(pct);
          }}
          className="h-2.5 w-full rounded-full bg-[#EAF9FF] dark:bg-blue-950/60 overflow-hidden cursor-pointer p-0.5 focus-ring"
          aria-label="Playback timeline"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0757E8] to-[#12CFF3]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
        </button>
      )}

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => {
              setDirection(-1);
              setIndex((i) => Math.max(0, i - 1));
              setPlaying(false);
            }}
            disabled={!gestures.length || index === 0}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 hover:bg-[#EAF9FF] dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[#0757E8] dark:text-[#7DEBFA] border border-[rgba(7,87,232,0.18)] dark:border-blue-900/50 flex items-center justify-center focus-ring shadow-2xs"
            aria-label="Previous gesture"
          >
            <SkipBack size={18} />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={!gestures.length}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#0757E8] to-[#12CFF3] hover:from-[#064ad1] hover:to-[#0ebde0] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center shadow-[0_4px_16px_rgba(7,87,232,0.3)] hover:scale-105 active:scale-95 focus-ring"
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
              if (index >= gestures.length - 1) return;
              setDirection(1);
              setIndex((i) => Math.min(gestures.length - 1, i + 1));
              setPlaying(false);
            }}
            disabled={!gestures.length || index >= gestures.length - 1}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 hover:bg-[#EAF9FF] dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[#0757E8] dark:text-[#7DEBFA] border border-[rgba(7,87,232,0.18)] dark:border-blue-900/50 flex items-center justify-center focus-ring shadow-2xs"
            aria-label="Next gesture"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Counter Summary */}
        {gestures.length > 0 && (
          <div className="text-xs font-semibold text-[#0757E8] dark:text-[#7DEBFA] px-3 py-1.5 rounded-full bg-[#EAF9FF] dark:bg-blue-950/60 border border-[rgba(7,87,232,0.15)]">
            {gestures.length === 1 ? '1 gesture' : `${gestures.length} gestures`}
          </div>
        )}
      </div>
    </div>
  );
}
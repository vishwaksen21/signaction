'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  ExternalLink,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/haptics';

export interface GestureSheetData {
  token: string;
  label?: string;
  category?: string;
  videoUrl: string;
  english?: string;
}

interface GesturePlayerSheetProps {
  gesture: GestureSheetData | null;
  onClose: () => void;
}

export function GesturePlayerSheet({ gesture, onClose }: GesturePlayerSheetProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (gesture) {
      setIsPlaying(true);
      setHasError(false);
    }
  }, [gesture]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    triggerHaptic(10);
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    triggerHaptic(10);
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleCopy = () => {
    if (!gesture) return;
    navigator.clipboard.writeText(gesture.token).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {gesture && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-lg bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-t-[32px] border-t border-slate-900/[0.06] dark:border-white/[0.08] shadow-[0_-12px_48px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[90vh] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
          >
            {/* Sheet Handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-violet-500/10 dark:bg-cyan-400/15 text-violet-700 dark:text-cyan-300 border border-violet-500/25 dark:border-cyan-400/25">
                  {gesture.category || 'ISL Gesture'}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Offline MP4
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-[#1E293B] border border-slate-900/[0.04] dark:border-white/[0.06] active:scale-90 transition-transform"
                  title="Copy token"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-[#1E293B] border border-slate-900/[0.04] dark:border-white/[0.06] active:scale-90 transition-transform"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Video Stage */}
            <div className="px-4 py-2">
              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center shadow-inner border border-slate-900/[0.08] dark:border-white/[0.08]">
                {hasError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <Sparkles size={28} className="text-violet-500 animate-pulse" />
                    <span className="text-sm font-semibold">Video preview unavailable</span>
                    <span className="text-xs text-slate-500">Asset is undergoing offline indexing</span>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    key={gesture.videoUrl}
                    src={gesture.videoUrl}
                    autoPlay
                    loop={isLooping}
                    muted
                    playsInline
                    onError={() => setHasError(true)}
                    onEnded={() => {
                      if (!isLooping) setIsPlaying(false);
                    }}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Gesture Title Watermark */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white font-mono text-xs font-bold border border-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{gesture.token}</span>
                </div>
              </div>
            </div>

            {/* Gesture Info & Controls */}
            <div className="px-5 py-3 space-y-3.5">
              <div>
                <h3 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                  {gesture.label || gesture.token.replace(/_/g, ' ')}
                </h3>
                {gesture.english && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    &ldquo;{gesture.english}&rdquo;
                  </p>
                )}
              </div>

              {/* Playback Controls Row */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-[#1E293B]/70 border border-slate-900/[0.04] dark:border-white/[0.06]">
                {/* Play/Pause & Replay */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform shadow-xs"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-900/[0.04] dark:border-white/[0.06] flex items-center justify-center active:scale-95 transition-transform"
                    title="Replay from start"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
                      isLooping
                        ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'bg-white dark:bg-[#111827] border-slate-900/[0.04] dark:border-white/[0.06] text-slate-400'
                    }`}
                    title="Toggle Loop"
                  >
                    <Repeat size={14} />
                  </button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1">
                  {[0.5, 0.75, 1.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                        speed === s
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button: Use in Translator */}
              <Link
                href={`/translator?text=${encodeURIComponent(gesture.token.replace(/_/g, ' '))}`}
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all"
              >
                <span>Use &quot;{gesture.token}&quot; in Translator</span>
                <ExternalLink size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

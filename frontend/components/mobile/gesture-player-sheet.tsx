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
            className="w-full max-w-lg bg-[#E2E8F0] dark:bg-[#0F172A] rounded-t-[32px] nm-flat overflow-hidden flex flex-col max-h-[90vh] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
          >
            {/* Sheet Handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full nm-inset" />
            </div>

            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider nm-inset text-indigo-600 dark:text-cyan-300">
                  {gesture.category || 'ISL Gesture'}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Offline MP4
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 nm-flat active:nm-inset active:scale-95 transition-all"
                  title="Copy token"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 nm-flat active:nm-inset active:scale-95 transition-all"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Video Stage in Recessed Well */}
            <div className="px-4 py-2">
              <div className="relative aspect-video w-full rounded-2xl nm-inset p-2 overflow-hidden flex items-center justify-center">
                {hasError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <Sparkles size={28} className="text-indigo-500 animate-pulse" />
                    <span className="text-sm font-semibold">Video preview unavailable</span>
                    <span className="text-xs text-slate-500">Asset is undergoing offline indexing</span>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
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
                  </div>
                )}

                {/* Gesture Title Watermark */}
                <div className="absolute bottom-4 left-4 nm-flat px-3 py-1 rounded-xl text-slate-900 dark:text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse nm-led-emerald" />
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
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl nm-inset">
                {/* Play/Pause & Replay */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="h-9 px-4 rounded-xl nm-convex active:nm-inset text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="w-9 h-9 rounded-xl nm-flat active:nm-inset text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all"
                    title="Replay from start"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                      isLooping
                        ? 'nm-inset text-indigo-600 dark:text-cyan-300 font-bold nm-led-indigo'
                        : 'nm-flat active:nm-inset text-slate-400'
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        speed === s
                          ? 'nm-flat text-indigo-600 dark:text-white font-extrabold shadow-sm'
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
                className="w-full py-3.5 px-4 rounded-2xl nm-convex active:nm-inset text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all nm-led-indigo"
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

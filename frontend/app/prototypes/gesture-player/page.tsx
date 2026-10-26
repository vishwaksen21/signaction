'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sliders,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  Copy,
  Check,
  Film,
  Zap,
} from 'lucide-react';

interface GestureStep {
  token: string;
  english: string;
  duration: number; // in seconds
  videoUrl: string;
  category: string;
}

const SAMPLE_STEPS: GestureStep[] = [
  {
    token: 'HELLO',
    english: 'Hello',
    duration: 1.4,
    videoUrl: '/assets/signs/HELLO.mp4',
    category: 'Greeting',
  },
  {
    token: 'WELCOME',
    english: 'Welcome to SignAction',
    duration: 1.8,
    videoUrl: '/assets/signs/WELCOME.mp4',
    category: 'Hospitality',
  },
  {
    token: 'THANK_YOU',
    english: 'Thank you very much',
    duration: 1.6,
    videoUrl: '/assets/signs/THANK_YOU.mp4',
    category: 'Courtesy',
  },
  {
    token: 'HELP',
    english: 'Can I help you?',
    duration: 1.5,
    videoUrl: '/assets/signs/HELP.mp4',
    category: 'Assistance',
  },
];

/* ========================================================================= */
/* VARIANT 1: Editorial Filmstrip (Spatial Sequence & Continuous Scrubbing)  */
/* ========================================================================= */
function VariantEditorialFilmstrip({ onReplay }: { onReplay?: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const currentStep = SAMPLE_STEPS[activeIdx];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-cyan-400 font-bold">
          Direction 01 • Spatial Sequence
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white font-heading">
          Editorial Filmstrip Player
        </h2>
        <p className="text-sm text-[#60759A] dark:text-slate-400 max-w-lg mx-auto">
          Linear spatial continuity where all tokens are previewed along a gesture timeline with non-obtrusive metadata.
        </p>
      </div>

      <div className="bg-white dark:bg-[#07132C] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Main Stage Video */}
        <div className="relative aspect-video sm:aspect-[16/9] w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center">
          <video
            key={currentStep.videoUrl}
            src={currentStep.videoUrl}
            autoPlay={isPlaying}
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />

          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-mono flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TOKEN {activeIdx + 1} OF {SAMPLE_STEPS.length}: {currentStep.token}
          </div>

          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2">
            <span>{currentStep.english}</span>
          </div>
        </div>

        {/* Filmstrip Timeline Scrubber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1.5">
              <Film size={13} className="text-[#0757E8]" /> Interactive Filmstrip Timeline
            </span>
            <span>Click token to jump</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {SAMPLE_STEPS.map((step, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={step.token}
                  onClick={() => setActiveIdx(idx)}
                  className={`p-3 rounded-2xl text-left border transition-[transform,border-color,background-color] duration-160 ease-apple active:scale-[0.97] ${
                    isActive
                      ? 'border-[#0757E8] bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-[#0757E8]/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                      {step.category}
                    </span>
                  </div>
                  <div className="font-heading font-extrabold text-sm sm:text-base text-[#062B5C] dark:text-white truncate">
                    {step.token}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{step.english}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calm Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2.5 rounded-full bg-[#0757E8] text-white text-xs font-bold hover:bg-[#064BD1] transition-[transform,background-color] duration-160 ease-apple active:scale-[0.96] flex items-center gap-2 shadow-sm"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
            </button>
            <button
              onClick={() => {
                setActiveIdx(0);
                setIsPlaying(true);
              }}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs transition-[transform,background-color] duration-160 ease-apple active:scale-[0.96]"
              title="Restart sequence"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Playback:</span>
            {[0.75, 1.0, 1.25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  speed === s
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* VARIANT 2: Compact Studio HUD (High Density & Tactile Direct Control)      */
/* ========================================================================= */
function VariantCompactStudio({ onReplay }: { onReplay?: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [loopCurrent, setLoopCurrent] = useState(false);
  const currentStep = SAMPLE_STEPS[activeIdx];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          Direction 02 • High Density & Direct Manipulation
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white font-heading">
          Compact Studio HUD
        </h2>
        <p className="text-sm text-[#60759A] dark:text-slate-400 max-w-lg mx-auto">
          Tactile utility layout prioritizing instant speed adjustments, precise timecode readouts, and direct token jumps.
        </p>
      </div>

      <div className="bg-[#0B1528] text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Monitor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
            <video
              key={currentStep.videoUrl}
              src={currentStep.videoUrl}
              autoPlay={isPlaying}
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            {/* HUD Overlay Stats */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              60 FPS • RAW ISL
            </div>
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 border border-slate-700">
              00:01.{activeIdx * 4}s
            </div>
          </div>

          {/* Quick HUD Action Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : SAMPLE_STEPS.length - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                title="Previous sign"
              >
                <SkipBack size={13} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 h-8 rounded-lg bg-[#0757E8] hover:bg-[#064BD1] flex items-center gap-1.5 text-xs font-bold active:scale-95 text-white"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev < SAMPLE_STEPS.length - 1 ? prev + 1 : 0))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                title="Next sign"
              >
                <SkipForward size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[0.5, 0.75, 1.0, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded ${
                    speed === s ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Studio Token Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <span>Token Registry</span>
              <span className="text-[10px] font-mono text-emerald-400">SYNC ACTIVE</span>
            </div>

            <div className="space-y-1.5">
              {SAMPLE_STEPS.map((step, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={step.token}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between border transition-[background-color,border-color] duration-120 ${
                      isActive
                        ? 'bg-blue-600/20 border-[#0757E8] text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 font-mono text-[10px] text-slate-500">0{idx + 1}</span>
                      <span className="font-bold truncate text-white">{step.token}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{step.duration}s</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sequence: {SAMPLE_STEPS.length} gestures</span>
            <span className="text-[#12CFF3] font-bold">100% Offline Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* VARIANT 3: Dynamic Spatial Deck (Expressive Motion, Depth & Glow)         */
/* ========================================================================= */
function VariantDynamicSpatial({ onReplay }: { onReplay?: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const currentStep = SAMPLE_STEPS[activeIdx];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          Direction 03 • Expressive Motion & Depth
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white font-heading">
          Dynamic Spatial Deck
        </h2>
        <p className="text-sm text-[#60759A] dark:text-slate-400 max-w-lg mx-auto">
          Depth-layered floating card with reactive ambient glow, spring token physics, and sensory tactile feedback.
        </p>
      </div>

      <div className="relative group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0757E8] via-[#12CFF3] to-purple-600 rounded-[36px] blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-500" />

        <div className="relative bg-white/90 dark:bg-[#07132C]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Spatial Token Deck Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SAMPLE_STEPS.map((step, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={step.token}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold transition-transform duration-160 active:scale-95 ${
                    isActive ? 'text-white' : 'text-[#062B5C] dark:text-slate-300 hover:text-[#0757E8]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="spatial-pill-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0757E8] to-[#087FF5] shadow-[0_4px_16px_rgba(7,87,232,0.3)]"
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {step.token}
                    {isActive && <Sparkles size={11} className="text-cyan-200" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Elevated Stage */}
          <motion.div
            key={currentStep.token}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.28 }}
            className="relative aspect-video rounded-2xl bg-black overflow-hidden shadow-inner flex items-center justify-center"
          >
            <video
              src={currentStep.videoUrl}
              autoPlay={isPlaying}
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl">
              <span className="font-bold text-sm tracking-wide">{currentStep.token}</span>
              <span className="text-slate-300 italic">&ldquo;{currentStep.english}&rdquo;</span>
            </div>
          </motion.div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-sign-primary px-6 py-2.5 text-xs font-bold"
            >
              {isPlaying ? 'Pause Motion' : 'Play Motion'}
            </button>
            <div className="text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-1">
              <Zap size={14} /> Fluid Apple Motion Curves
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* PROTOTYPE HARNESS & VERBATIM PICKER SPECIFICATION (from PICKER.md)        */
/* ========================================================================= */
const VARIANTS = [
  { name: 'Editorial Filmstrip', component: VariantEditorialFilmstrip, axis: 'Spatial Sequence & Scrubbing' },
  { name: 'Compact Studio', component: VariantCompactStudio, axis: 'High Density & Direct Manipulation' },
  { name: 'Dynamic Spatial', component: VariantDynamicSpatial, axis: 'Expressive Motion & Depth' },
];

export default function PrototypeHarnessPage() {
  const [current, setCurrent] = useState(0);
  const [mountKey, setMountKey] = useState(0);
  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  // Position highlight smoothly per PICKER.md
  const updateHighlight = (index: number) => {
    if (!pickerRef.current || !highlightRef.current) return;
    const buttons = pickerRef.current.querySelectorAll<HTMLButtonElement>(
      '.proto-picker-item:not(.proto-picker-replay)'
    );
    const target = buttons[index];
    if (target) {
      highlightRef.current.style.width = `${target.offsetWidth}px`;
      highlightRef.current.style.transform = `translateX(${target.offsetLeft}px)`;
    }
  };

  const setVariant = (index: number) => {
    if (index < 0 || index >= VARIANTS.length) return;
    setCurrent(index);
    setMountKey((prev) => prev + 1);

    const url = new URL(window.location.href);
    url.searchParams.set('v', String(index + 1));
    window.history.replaceState(null, '', url.toString());

    updateHighlight(index);
  };

  const handleReplay = () => {
    setMountKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Read initial ?v= param
    const params = new URLSearchParams(window.location.search);
    const vParam = parseInt(params.get('v') || '1', 10);
    const initialIndex = vParam >= 1 && vParam <= VARIANTS.length ? vParam - 1 : 0;
    setCurrent(initialIndex);

    // After first paint, set data-ready so transition only plays on user flip (PICKER.md)
    requestAnimationFrame(() => {
      updateHighlight(initialIndex);
      requestAnimationFrame(() => {
        pickerRef.current?.setAttribute('data-ready', '');
      });
    });

    const handleResize = () => updateHighlight(current);
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) {
        setVariant(num - 1);
      } else if (e.key === 'ArrowRight') {
        setVariant((current + 1) % VARIANTS.length);
      } else if (e.key === 'ArrowLeft') {
        setVariant((current - 1 + VARIANTS.length) % VARIANTS.length);
      } else if (e.key === 'r' || e.key === 'R') {
        handleReplay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [current]);

  const CurrentVariant = VARIANTS[current].component;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#062B5C] dark:text-slate-100 px-4 sm:px-6 py-12 pb-32">
      {/* Harness Top Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-8 mb-8 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3] font-bold">
            SignAction Prototype Exploration
          </span>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-[#062B5C] dark:text-white">
            Gesture Sequence Player Divergence
          </h1>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-[#0757E8] dark:hover:text-white transition-colors"
        >
          &larr; Back to App
        </Link>
      </div>

      {/* Stage: Render single variant at full scale with remount key */}
      <main id="stage" key={mountKey} className="max-w-5xl mx-auto">
        <CurrentVariant onReplay={handleReplay} />
      </main>

      {/* Verbatim Picker from PICKER.md */}
      <nav
        ref={pickerRef}
        className="proto-picker"
        aria-label="Prototype variants"
      >
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {VARIANTS.map((v, i) => (
          <button
            key={v.name}
            type="button"
            className="proto-picker-item"
            data-active={current === i ? '' : undefined}
            aria-current={current === i ? 'true' : undefined}
            onClick={() => setVariant(i)}
          >
            {v.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          type="button"
          onClick={handleReplay}
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          title="Replay animation (R)"
        >
          ↻
        </button>
      </nav>

      {/* Inline styles for verbatim PICKER.md spec */}
      <style jsx global>{`
        .proto-picker {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2147483647;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          border-radius: 999px;
          background: rgba(10, 10, 10, 0.82);
          -webkit-backdrop-filter: blur(12px) saturate(1.4);
          backdrop-filter: blur(12px) saturate(1.4);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08) inset,
            0 8px 24px rgba(0, 0, 0, 0.24),
            0 2px 6px rgba(0, 0, 0, 0.12);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1;
          -webkit-font-smoothing: antialiased;
          user-select: none;
          -webkit-user-select: none;
        }

        .proto-picker-highlight {
          position: absolute;
          top: 4px;
          left: 0;
          height: 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          will-change: transform;
        }

        .proto-picker[data-ready] .proto-picker-highlight {
          transition:
            transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
            width 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
        }

        .proto-picker-item {
          position: relative;
          display: flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font: inherit;
          cursor: pointer;
          transition: color 150ms ease-out;
        }

        .proto-picker-item:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .proto-picker-item:active {
          transform: scale(0.97);
        }

        .proto-picker-item:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.4);
          outline-offset: 2px;
        }

        .proto-picker-item[data-active] {
          color: #fff;
        }

        .proto-picker-divider {
          width: 1px;
          height: 16px;
          margin: 0 4px;
          background: rgba(255, 255, 255, 0.12);
        }

        .proto-picker-replay {
          padding: 0 10px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

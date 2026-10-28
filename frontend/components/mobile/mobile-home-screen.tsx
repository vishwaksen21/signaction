'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic,
  Languages,
  Sparkles,
  ArrowRight,
  BookOpen,
  Radio,
  Play,
  ArrowUpRight,
  Smartphone,
  Download,
  Activity,
  Sliders,
} from 'lucide-react';
import {
  isNativeApk,
  OFFICIAL_APK_DOWNLOAD_URL,
  OFFICIAL_APK_SIZE_LABEL,
} from '@/lib/platform';
import { GesturePlayerSheet, type GestureSheetData } from './gesture-player-sheet';

const FEATURED_SIGNS: Array<{
  token: string;
  label: string;
  category: string;
  english: string;
  videoUrl: string;
}> = [
  {
    token: 'HELLO',
    label: 'Hello',
    category: 'Greeting',
    english: 'Hello, how can I help you?',
    videoUrl: '/assets/signs/HELLO.mp4',
  },
  {
    token: 'THANK_YOU',
    label: 'Thank You',
    category: 'Courtesy',
    english: 'Thank you very much',
    videoUrl: '/assets/signs/THANK_YOU.mp4',
  },
  {
    token: 'WELCOME',
    label: 'Welcome',
    category: 'Hospitality',
    english: 'You are welcome here',
    videoUrl: '/assets/signs/WELCOME.mp4',
  },
  {
    token: 'HELP',
    label: 'Help',
    category: 'Assistance',
    english: 'Do you need assistance?',
    videoUrl: '/assets/signs/HELP.mp4',
  },
  {
    token: 'GOOD_MORNING',
    label: 'Good Morning',
    category: 'Greeting',
    english: 'Good morning, have a great day',
    videoUrl: '/assets/signs/GOOD_MORNING.mp4',
  },
  {
    token: 'YES',
    label: 'Yes',
    category: 'Response',
    english: 'Yes, affirmative',
    videoUrl: '/assets/signs/YES.mp4',
  },
  {
    token: 'NO',
    label: 'No',
    category: 'Response',
    english: 'No, negative',
    videoUrl: '/assets/signs/NO.mp4',
  },
  {
    token: 'BYE',
    label: 'Goodbye',
    category: 'Parting',
    english: 'Goodbye, see you again',
    videoUrl: '/assets/signs/BYE.mp4',
  },
];

const QUICK_PROMPT_CHIPS = [
  'Hello, how are you?',
  'Thank you very much',
  'Where is the doctor?',
  'Can you help me?',
  'What is your name?',
];

export function MobileHomeScreen() {
  const router = useRouter();
  const [quickInput, setQuickInput] = useState('');
  const [selectedGesture, setSelectedGesture] = useState<GestureSheetData | null>(null);
  const [isNative, setIsNative] = useState(true);

  useEffect(() => {
    setIsNative(isNativeApk());
  }, []);

  const handleStartTranslate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = quickInput.trim();
    if (text) {
      router.push(`/translator?text=${encodeURIComponent(text)}`);
    } else {
      router.push('/translator');
    }
  };

  const handleSelectChip = (phrase: string) => {
    setQuickInput(phrase);
    router.push(`/translator?text=${encodeURIComponent(phrase)}`);
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-6 pb-6 select-none">
      {/* 1. Hero AI Prompt Composer */}
      <section aria-label="AI Prompt Composer" className="space-y-3.5">
        <div className="space-y-1">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-gradient-to-r from-[#4F46E5]/10 via-[#7C3AED]/10 to-[#06B6D4]/10 border border-violet-500/25 text-violet-700 dark:text-cyan-300 shadow-[0_0_14px_rgba(124,58,237,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>✦ On-Device Neural ISL Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Communicate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4]">Freely.</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant on-device speech & text translation into Indian Sign Language gestures.
          </p>
        </div>

        {/* Interactive AI Composer Card Framed with Subtle Animated Gradient Border */}
        <div className="relative p-[1.5px] rounded-3xl bg-gradient-to-tr from-[#4F46E5]/40 via-[#7C3AED]/40 to-[#06B6D4]/40 shadow-xl shadow-indigo-500/5 group">
          <div className="p-4 rounded-[22.5px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl space-y-3">
            <form onSubmit={handleStartTranslate} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={2}
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Type an English phrase (e.g. 'Where is the doctor?')..."
                  className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50/80 dark:bg-[#1E293B]/70 border border-slate-900/[0.06] dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition-all"
                />
                {quickInput && (
                  <button
                    type="button"
                    onClick={() => setQuickInput('')}
                    className="absolute right-3 top-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-black dark:text-slate-300 dark:hover:text-white flex items-center justify-center text-xs"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons: Voice Trigger + Primary Translate Pill */}
              <div className="flex items-center gap-2">
                <Link
                  href="/translator?mode=voice"
                  className="h-11 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E293B] dark:hover:bg-[#283548] border border-slate-900/[0.06] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all duration-150 shadow-xs"
                  title="Voice Translation with Vosk"
                >
                  <Mic size={16} className="text-violet-600 dark:text-cyan-400" />
                  <span>Voice</span>
                </Link>

                <button
                  type="submit"
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all duration-150"
                >
                  <Sparkles size={15} />
                  <span>Translate to Sign</span>
                  <ArrowRight size={14} className="opacity-80" />
                </button>
              </div>
            </form>

            {/* Quick Prompt Chips (Horizontal Scroll inside the composer visual group) */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                {QUICK_PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSelectChip(chip)}
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 dark:bg-[#1E293B]/80 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 border border-slate-900/[0.06] dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-cyan-300 active:scale-95 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Web Visitor Banner: APK Download */}
        {!isNative && (
          <aside
            aria-label="Download SignAction APK"
            className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  SignAction Android APK
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  {OFFICIAL_APK_SIZE_LABEL} • 100% Offline with 349 Signs
                </div>
              </div>
            </div>
            <a
              href={OFFICIAL_APK_DOWNLOAD_URL}
              download="signaction.apk"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-[11px] font-bold active:scale-95 transition-transform flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download size={13} />
              <span>Install</span>
            </a>
          </aside>
        )}
      </section>

      {/* 2. Bento Grid — Core Capabilities (2x2 Asymmetric Bento) */}
      <section aria-label="Core Capabilities" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core AI Capabilities
          </h2>
          <span className="text-[10px] font-mono text-violet-600 dark:text-cyan-400 font-semibold">
            On-Device Studio
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tile 1: Speech to Sign */}
          <Link
            href="/translator?mode=voice"
            className="relative p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.98] transition-all duration-150 overflow-hidden"
          >
            {/* Subtle radial corner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-violet-500/20" />

            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Mic size={20} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Speech to Sign
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Vosk offline voice recognition
              </p>
            </div>
          </Link>

          {/* Tile 2: Text to ISL */}
          <Link
            href="/translator"
            className="relative p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.98] transition-all duration-150 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-purple-500/20" />

            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/15 to-violet-500/15 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
                <Languages size={20} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Text to ISL
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                SOV grammar rule parser
              </p>
            </div>
          </Link>

          {/* Tile 3: Alphabet A-Z */}
          <Link
            href="/dictionary?category=alpha"
            className="relative p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.98] transition-all duration-150 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-emerald-500/20" />

            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <BookOpen size={20} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Alphabet (A-Z)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Fingerspelling gesture drill
              </p>
            </div>
          </Link>

          {/* Tile 4: Live Speech */}
          <Link
            href="/realtime"
            className="relative p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.98] transition-all duration-150 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-cyan-500/20" />

            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs">
                <Radio size={20} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Live Speech
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Continuous voice stream
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Essential Daily Signs (Fixed Aspect-Ratio Media Carousel) */}
      <section aria-label="Essential Daily Signs" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Essential Daily Signs
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              High-frequency conversational gestures
            </p>
          </div>
          <Link
            href="/dictionary"
            className="text-xs font-bold text-violet-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Fixed Aspect-Ratio Horizontal Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
          {FEATURED_SIGNS.map((sign) => (
            <button
              key={sign.token}
              type="button"
              onClick={() => setSelectedGesture(sign)}
              className="shrink-0 w-44 snap-start rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] p-3 text-left shadow-xs hover:border-violet-500/40 active:scale-[0.98] transition-all duration-150 flex flex-col justify-between space-y-2.5 group"
            >
              {/* Clean 16:10 aspect-ratio video preview with gradient mesh backdrop */}
              <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center border border-white/[0.06] shadow-inner">
                <video
                  src={sign.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Frosted Glass Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/25 dark:bg-white/15 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={15} className="ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Top-Left Category Pill */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                  {sign.category}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate">
                  {sign.label}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {sign.english}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Compact Neural Engine Telemetry Bar (Replaces bulky card) */}
      <section aria-label="Engine Telemetry">
        <Link
          href="/offline-setup"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs active:scale-[0.99] transition-all hover:border-violet-500/30 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">
              Vosk 39MB • 349 Gestures • 0KB Cloud Data
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-violet-600 dark:text-cyan-400 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
            <span>Diagnostics</span>
            <ArrowRight size={13} />
          </div>
        </Link>
      </section>

      {/* Interactive Video Sheet Modal */}
      <GesturePlayerSheet
        gesture={selectedGesture}
        onClose={() => setSelectedGesture(null)}
      />
    </div>
  );
}

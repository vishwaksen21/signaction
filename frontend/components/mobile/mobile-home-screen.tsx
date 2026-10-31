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
import { triggerHaptic } from '@/lib/haptics';
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
    triggerHaptic(10);
    const text = quickInput.trim();
    if (text) {
      router.push(`/translator?text=${encodeURIComponent(text)}`);
    } else {
      router.push('/translator');
    }
  };

  const handleSelectChip = (phrase: string) => {
    triggerHaptic(10);
    setQuickInput(phrase);
    router.push(`/translator?text=${encodeURIComponent(phrase)}`);
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-6 pb-6 select-none bg-[#E2E8F0] dark:bg-[#0F172A]">
      {/* 1. Hero AI Prompt Composer */}
      <section aria-label="AI Prompt Composer" className="space-y-3.5">
        <div className="space-y-1">
          {/* Debossed Inset Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase nm-inset text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 nm-led-indigo animate-pulse" />
            <span>On-Device Neural ISL Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
            Communicate <span className="text-indigo-600 dark:text-indigo-400">Freely.</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Instant on-device speech & text translation into Indian Sign Language gestures.
          </p>
        </div>

        {/* Hero Composer: Extruded Soft Chassis */}
        <div className="nm-flat rounded-3xl p-5 space-y-4">
          <form onSubmit={handleStartTranslate} className="space-y-3.5">
            {/* Inset Debossed Basin */}
            <div className="relative">
              <textarea
                rows={2}
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Type an English phrase (e.g. 'Where is the doctor?')..."
                className="w-full p-4 pr-10 rounded-2xl nm-inset text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none transition-all"
              />
              {quickInput && (
                <button
                  type="button"
                  onClick={() => setQuickInput('')}
                  className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full nm-flat active:nm-inset text-slate-500 dark:text-slate-300 flex items-center justify-center text-xs"
                  aria-label="Clear input"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action Buttons: Tactile Voice Trigger + Raised Convex Translate Pill */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/translator?mode=voice"
                onClick={() => triggerHaptic(10)}
                className="h-11 px-4 rounded-2xl nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                title="Voice Translation with Vosk"
              >
                <Mic size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Voice</span>
              </Link>

              <button
                type="submit"
                className="flex-1 h-11 rounded-2xl nm-convex active:nm-inset text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
              >
                <Sparkles size={15} />
                <span>Translate to Sign</span>
                <ArrowRight size={14} className="opacity-90" />
              </button>
            </div>
          </form>

          {/* Quick Prompt Chips: Soft Tactile Pill Capsules */}
          <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800/60">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {QUICK_PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSelectChip(chip)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 nm-flat hover:nm-concave active:nm-inset active:scale-95 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Web Visitor Banner: APK Download */}
        {!isNative && (
          <aside
            aria-label="Download SignAction APK"
            className="p-4 rounded-2xl nm-flat flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl nm-inset text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Smartphone size={17} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
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
              className="px-3.5 py-2 rounded-xl nm-convex active:nm-inset text-white text-[11px] font-bold active:scale-95 transition-all flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              <Download size={13} />
              <span>Install</span>
            </a>
          </aside>
        )}
      </section>

      {/* 2. Bento Grid — Core Capabilities (2x2 Tactile Pads) */}
      <section aria-label="Core Capabilities" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core AI Capabilities
          </h2>
          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            On-Device Studio
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Tile 1: Speech to Sign */}
          <Link
            href="/translator?mode=voice"
            className="nm-flat rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] active:nm-inset flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Mic size={19} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
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
            className="nm-flat rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] active:nm-inset flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Languages size={19} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
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
            className="nm-flat rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] active:nm-inset flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BookOpen size={19} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
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
            className="nm-flat rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] active:nm-inset flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Radio size={19} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400" />
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                Live Speech
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Continuous voice stream
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Essential Daily Signs (Raised Pedestals Carousel) */}
      <section aria-label="Essential Daily Signs" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Essential Daily Signs
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-frequency conversational gestures
            </p>
          </div>
          <Link
            href="/dictionary"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Fixed Aspect-Ratio Horizontal Carousel */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
          {FEATURED_SIGNS.map((sign) => (
            <button
              key={sign.token}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setSelectedGesture(sign);
              }}
              className="shrink-0 w-44 snap-start rounded-2xl nm-flat p-3 text-left active:scale-[0.98] transition-all flex flex-col justify-between space-y-2.5 group"
            >
              {/* Recessed Video Display Basin */}
              <div className="relative aspect-[16/10] w-full rounded-xl nm-inset p-1 overflow-hidden flex items-center justify-center">
                <video
                  src={`${sign.videoUrl}#t=0.2`}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover rounded-lg opacity-85 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Extruded Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full nm-flat active:nm-inset flex items-center justify-center text-white transition-transform group-hover:scale-105">
                    <Play size={15} className="ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Top-Left Category Pill */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-black/50 text-white/90">
                  {sign.category}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="text-xs font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
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

      {/* 4. Bottom Telemetry Strip: Debossed Information Slot */}
      <section aria-label="Engine Telemetry">
        <Link
          href="/offline-setup"
          className="flex items-center justify-between px-4 py-3 rounded-2xl nm-inset active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981] nm-led-emerald" />
            </span>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">
              Vosk 39MB • 349 Gestures • 0KB Cloud Data
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
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

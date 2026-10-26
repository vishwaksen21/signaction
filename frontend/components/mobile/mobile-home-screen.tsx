'use client';

import React, { useState } from 'react';
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
  Sliders,
  Play,
  ShieldCheck,
  CheckCircle2,
  Search,
  Volume2,
} from 'lucide-react';
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

const QUICK_PHRASES = [
  'Hello, how are you?',
  'Thank you very much',
  'Can you help me?',
  'Where is the doctor?',
  'My name is John',
];

export function MobileHomeScreen() {
  const router = useRouter();
  const [quickInput, setQuickInput] = useState('');
  const [selectedGesture, setSelectedGesture] = useState<GestureSheetData | null>(null);

  const handleStartTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickInput.trim();
    if (text) {
      router.push(`/translator?text=${encodeURIComponent(text)}`);
    } else {
      router.push('/translator');
    }
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-5 pb-6">
      {/* 1. Welcome Greeting Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
          <Sparkles size={14} />
          <span>Indian Sign Language AI</span>
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-[#062B5C] dark:text-white tracking-tight">
          Communicate Freely
        </h1>
        <p className="text-xs text-[#60759A] dark:text-slate-400">
          Instant offline text and voice translation to Indian Sign Language gestures.
        </p>
      </div>

      {/* 2. Primary Quick Translation Launcher */}
      <div className="bg-gradient-to-br from-[#062B87] via-[#0757E8] to-[#087FF5] text-white rounded-3xl p-4 sm:p-5 shadow-sign-card space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
            Instant Translation
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 backdrop-blur-md text-white">
            349 Signs Offline
          </span>
        </div>

        <form onSubmit={handleStartTranslate} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Type English text or phrase..."
              className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner"
            />
            {quickInput && (
              <button
                type="button"
                onClick={() => setQuickInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/20 text-white/80 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 h-11 rounded-2xl bg-white text-[#062B87] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-transform shadow-xs"
            >
              <Languages size={16} />
              <span>Translate to Sign</span>
            </button>

            <Link
              href="/translator?mode=voice"
              className="h-11 px-4 rounded-2xl bg-cyan-400 text-[#062B87] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-transform shadow-xs"
              title="Voice Translation"
            >
              <Mic size={16} />
              <span>Voice</span>
            </Link>
          </div>
        </form>
      </div>

      {/* 3. Core Features Grid */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 px-1">
          Explore Translation & Learning
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Speech to Sign */}
          <Link
            href="/translator?mode=voice"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2 active:scale-97 transition-transform group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
              <Mic size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Speech to Sign
              </h3>
              <p className="text-[11px] text-[#60759A] dark:text-slate-400 leading-tight mt-0.5">
                Vosk offline voice recognition
              </p>
            </div>
          </Link>

          {/* Card 2: Text Translation */}
          <Link
            href="/translator"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2 active:scale-97 transition-transform group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Languages size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Text to ISL
              </h3>
              <p className="text-[11px] text-[#60759A] dark:text-slate-400 leading-tight mt-0.5">
                Grammar parser & animation
              </p>
            </div>
          </Link>

          {/* Card 3: Alphabet A-Z Drill */}
          <Link
            href="/dictionary?category=alpha"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2 active:scale-97 transition-transform group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Alphabet (A-Z)
              </h3>
              <p className="text-[11px] text-[#60759A] dark:text-slate-400 leading-tight mt-0.5">
                Fingerspelling gesture drill
              </p>
            </div>
          </Link>

          {/* Card 4: Numbers & Live Studio */}
          <Link
            href="/realtime"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2 active:scale-97 transition-transform group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Live Speech
              </h3>
              <p className="text-[11px] text-[#60759A] dark:text-slate-400 leading-tight mt-0.5">
                Continuous live stream
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Essential Daily Signs Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
            Essential Daily Signs
          </h2>
          <Link
            href="/dictionary"
            className="text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Horizontal scroll container with snap */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
          {FEATURED_SIGNS.map((sign) => (
            <button
              key={sign.token}
              type="button"
              onClick={() => setSelectedGesture(sign)}
              className="shrink-0 w-36 snap-start rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 p-2.5 text-left shadow-xs hover:border-[#0757E8]/40 active:scale-96 transition-[transform,border-color] duration-140 flex flex-col justify-between space-y-2 group"
            >
              {/* Video Thumbnail Box */}
              <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                <video
                  src={sign.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-[#0757E8] dark:text-[#12CFF3] shadow-xs group-hover:scale-110 transition-transform">
                    <Play size={14} className="ml-0.5 fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-white/90">
                  {sign.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#062B5C] dark:text-white truncate">
                  {sign.label}
                </h4>
                <p className="text-[10px] text-[#60759A] dark:text-slate-400 truncate">
                  {sign.english}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Quick Phrases Suggestions */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 px-1">
          Quick Translation Prompts
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PHRASES.map((phrase) => (
            <Link
              key={phrase}
              href={`/translator?text=${encodeURIComponent(phrase)}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 text-[#062B5C] dark:text-slate-200 hover:border-[#0757E8] active:scale-95 transition-transform"
            >
              {phrase}
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Offline Engine Readiness Card */}
      <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#062B5C] dark:text-white">
                Offline AI Ready
              </h3>
              <p className="text-[10px] text-[#60759A] dark:text-slate-400">
                100% on-device speech & video gestures
              </p>
            </div>
          </div>

          <Link
            href="/offline-setup"
            className="text-[11px] font-bold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-0.5 hover:underline"
          >
            <span>Diagnostics</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/40 dark:border-white/5">
            <span className="block text-xs font-extrabold text-[#062B5C] dark:text-white">39 MB</span>
            <span className="text-[9px] text-[#60759A] dark:text-slate-400">Vosk Model</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/40 dark:border-white/5">
            <span className="block text-xs font-extrabold text-[#062B5C] dark:text-white">349</span>
            <span className="text-[9px] text-[#60759A] dark:text-slate-400">ISL Gestures</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/40 dark:border-white/5">
            <span className="block text-xs font-extrabold text-emerald-600 dark:text-emerald-400">0 KB</span>
            <span className="text-[9px] text-[#60759A] dark:text-slate-400">Data Needed</span>
          </div>
        </div>
      </div>

      {/* Interactive Video Sheet Modal */}
      <GesturePlayerSheet
        gesture={selectedGesture}
        onClose={() => setSelectedGesture(null)}
      />
    </div>
  );
}

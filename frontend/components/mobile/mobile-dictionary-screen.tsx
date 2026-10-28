'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Play,
  Hand,
  X,
  Sparkles,
} from 'lucide-react';
import { useDictionary } from '../../hooks/use-dictionary';
import { triggerHaptic } from '@/lib/haptics';
import { GesturePlayerSheet, type GestureSheetData } from './gesture-player-sheet';
import type { DictionaryItem } from '../../lib/api';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');

const ESSENTIAL_SIGNS = [
  'HELLO', 'NAMASTE', 'THANK_YOU', 'WELCOME', 'PLEASE', 'SORRY', 'HELP',
  'GOOD_MORNING', 'GOOD_NIGHT', 'YES', 'NO', 'WATER', 'FOOD', 'HOSPITAL',
  'DOCTOR', 'FRIEND', 'FAMILY', 'HOME', 'AGREE', 'HAPPY', 'LOVE', 'BYE',
];

export function MobileDictionaryScreen() {
  const [activeCategory, setActiveCategory] = useState<'alpha' | 'num' | 'greetings' | 'all'>('alpha');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGesture, setSelectedGesture] = useState<GestureSheetData | null>(null);

  const { data, isLoading } = useDictionary();
  const allItems: DictionaryItem[] = useMemo(() => data?.items ?? [], [data?.items]);

  // Check URL params for category on mount (e.g. ?category=alpha)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat === 'alpha' || cat === 'num' || cat === 'greetings' || cat === 'all') {
        setActiveCategory(cat);
      }
    }
  }, []);

  // Filtered gestures based on active category and search
  const filteredGestures = useMemo(() => {
    const q = searchQuery.trim().toUpperCase().replace(/\s+/g, '_');

    return allItems.filter((item) => {
      const tok = item.token.toUpperCase();

      if (searchQuery) {
        return tok.includes(q) || tok.replace(/_/g, ' ').includes(q);
      }

      if (activeCategory === 'alpha') {
        return /^[A-Z]$/.test(tok);
      }
      if (activeCategory === 'num') {
        return /^[0-9]+$/.test(tok);
      }
      if (activeCategory === 'greetings') {
        return ESSENTIAL_SIGNS.includes(tok);
      }
      return true;
    });
  }, [allItems, activeCategory, searchQuery]);

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none">
      {/* 1. Sticky Search & Filter Header */}
      <div className="sticky top-14 z-30 pt-1 pb-2 bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-900/[0.04] dark:border-white/[0.06] -mx-4 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              ISL Sign Dictionary
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive visual token catalog with slow-motion drill.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-500/10 dark:bg-cyan-400/15 border border-violet-500/25 dark:border-cyan-400/25 text-violet-700 dark:text-cyan-300">
            {allItems.length || 349} Gestures
          </span>
        </div>

        {/* Glassmorphic Search Bar with Clear Button */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gesture token (e.g. HELLO, WATER, A)..."
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-black flex items-center justify-center text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills with Active Gradient Fill */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveCategory('alpha');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'alpha'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#111827]/80 text-slate-600 dark:text-slate-400 border border-slate-900/[0.06] dark:border-white/[0.08]'
              }`}
            >
              Alphabet (A-Z)
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveCategory('num');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'num'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#111827]/80 text-slate-600 dark:text-slate-400 border border-slate-900/[0.06] dark:border-white/[0.08]'
              }`}
            >
              Numbers (0-9)
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveCategory('greetings');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'greetings'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#111827]/80 text-slate-600 dark:text-slate-400 border border-slate-900/[0.06] dark:border-white/[0.08]'
              }`}
            >
              Greetings & Daily
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveCategory('all');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#111827]/80 text-slate-600 dark:text-slate-400 border border-slate-900/[0.06] dark:border-white/[0.08]'
              }`}
            >
              All Signs
            </button>
          </div>
        )}
      </div>

      {/* 2. Special Drill Grid: Alphabet A-Z Mode */}
      {!searchQuery && activeCategory === 'alpha' && (
        <section aria-label="Alphabet Fingerspelling Drill" className="space-y-2.5">
          {/* Section Header Single-Line Alignment */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alphabet Fingerspelling Drill
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 dark:bg-cyan-400/15 text-violet-700 dark:text-cyan-300 border border-violet-500/20">
              Tap tile to preview
            </span>
          </div>

          {/* Upgraded 4-column A-Z Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setSelectedGesture({
                    token: letter,
                    label: `Letter ${letter}`,
                    category: 'Alphabet',
                    english: `Fingerspelling sign for letter ${letter}`,
                    videoUrl: `/assets/signs/${letter}.mp4`,
                  });
                }}
                className="relative h-16 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] p-2 flex flex-col items-center justify-center active:scale-90 hover:border-violet-500/40 transition-all duration-150 shadow-xs group overflow-hidden"
              >
                {/* Subtle top-right play indicator dot */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400/80 dark:bg-cyan-400/80 group-hover:scale-125 transition-transform" />

                {/* Subtle decorative hand watermark in background */}
                <Hand size={26} className="absolute -bottom-1 -right-1 text-slate-900/[0.04] dark:text-white/[0.04] pointer-events-none group-hover:scale-110 transition-transform" />

                <span className="text-2xl font-heading font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-cyan-300 transition-colors">
                  {letter}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  ISL
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Special Drill Grid: Numbers 0-9 Mode */}
      {!searchQuery && activeCategory === 'num' && (
        <section aria-label="Numbers Drill" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Number Digits (0 - 9)
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 dark:bg-cyan-400/15 text-violet-700 dark:text-cyan-300 border border-violet-500/20">
              Tap tile to preview
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {DIGITS.map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setSelectedGesture({
                    token: digit,
                    label: `Digit ${digit}`,
                    category: 'Number',
                    english: `Indian Sign Language representation for ${digit}`,
                    videoUrl: `/assets/signs/${digit}.mp4`,
                  });
                }}
                className="relative h-16 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] p-2 flex flex-col items-center justify-center active:scale-90 hover:border-violet-500/40 transition-all duration-150 shadow-xs group overflow-hidden"
              >
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 group-hover:scale-125 transition-transform" />
                <span className="text-2xl font-heading font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-cyan-300 transition-colors">
                  {digit}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Digit
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Gestures Grid (Greetings, Search Results, or All) */}
      {(searchQuery || activeCategory === 'greetings' || activeCategory === 'all') && (
        <section aria-label="Signs Grid" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `Results for "${searchQuery}" (${filteredGestures.length})`
                : activeCategory === 'greetings'
                ? 'High-Frequency Conversational Signs'
                : 'All Offline Gestures'}
            </span>
          </div>

          {filteredGestures.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] text-center space-y-2">
              <span className="text-2xl">🔍</span>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                No matching signs found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for simple words like &ldquo;HELLO&rdquo;, &ldquo;THANK YOU&rdquo;, or &ldquo;HELP&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredGestures.slice(0, 48).map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedGesture({
                      token: item.token,
                      label: item.token.replace(/_/g, ' '),
                      category: (item as any).category || 'ISL Gesture',
                      english: `Sign representation for ${item.token.replace(/_/g, ' ')}`,
                      videoUrl: item.url || `/assets/signs/${item.token}.mp4`,
                    });
                  }}
                  className="p-3 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] text-left shadow-xs active:scale-[0.98] hover:border-violet-500/40 transition-all duration-150 flex flex-col justify-between space-y-2 group"
                >
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center border border-white/[0.06]">
                    <video
                      src={`${item.url || `/assets/signs/${item.token}.mp4`}#t=0.2`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
                        <Play size={13} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate">
                      {item.token.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 capitalize truncate block mt-0.5">
                      {(item as any).category || 'Offline Gesture'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Video Detail Sheet Modal */}
      <GesturePlayerSheet
        gesture={selectedGesture}
        onClose={() => setSelectedGesture(null)}
      />
    </div>
  );
}

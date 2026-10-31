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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none bg-[#E2E8F0] dark:bg-[#0F172A]">
      {/* 1. Sticky Search & Filter Header */}
      <div className="sticky top-14 z-30 pt-1 pb-3 bg-[#E2E8F0] dark:bg-[#0F172A] -mx-4 px-4 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-extrabold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
              ISL Sign Dictionary
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive visual token catalog with slow-motion drill.
            </p>
          </div>

          <span className="nm-inset px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {allItems.length || 349} Gestures
          </span>
        </div>

        {/* Debossed Search Bar Well with Clear Button */}
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
            className="w-full h-11 pl-10 pr-9 rounded-2xl nm-inset text-xs text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full nm-flat active:nm-inset text-slate-500 dark:text-slate-300 flex items-center justify-center text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tactile Category Toggle Pills */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveCategory('alpha');
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'alpha'
                  ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-black'
                  : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
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
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'num'
                  ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-black'
                  : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
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
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'greetings'
                  ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-black'
                  : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
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
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                activeCategory === 'all'
                  ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-black'
                  : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
              }`}
            >
              All Signs
            </button>
          </div>
        )}
      </div>

      {/* 2. Special Drill Grid: Alphabet A-Z (Physical Tactile Keyboard Matrix) */}
      {!searchQuery && activeCategory === 'alpha' && (
        <section aria-label="Alphabet Fingerspelling Drill" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alphabet Fingerspelling Keypad
            </span>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full nm-inset text-indigo-600 dark:text-indigo-400">
              Tap key to drill
            </span>
          </div>

          {/* 4-column A-Z Keycap Matrix */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
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
                className="relative aspect-square rounded-2xl nm-flat hover:nm-concave active:nm-inset active:scale-95 p-2 flex flex-col items-center justify-center transition-all duration-150 group overflow-hidden"
              >
                {/* Top-right tactile LED micro-indicator */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 nm-led-indigo opacity-80 group-hover:scale-125 transition-transform" />

                <span className="text-2xl font-heading font-black text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {letter}
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-semibold mt-0.5">
                  ISL
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Special Drill Grid: Numbers 0-9 Mode (Tactile NumPad Matrix) */}
      {!searchQuery && activeCategory === 'num' && (
        <section aria-label="Numbers Drill" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Number Digits (0 - 9) Keypad
            </span>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full nm-inset text-indigo-600 dark:text-indigo-400">
              Tap key to drill
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3">
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
                className="relative aspect-square rounded-2xl nm-flat hover:nm-concave active:nm-inset active:scale-95 p-2 flex flex-col items-center justify-center transition-all duration-150 group overflow-hidden"
              >
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 nm-led-indigo opacity-80 group-hover:scale-125 transition-transform" />
                <span className="text-2xl font-heading font-black text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {digit}
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-semibold mt-0.5">
                  Digit
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Gestures Grid (Raised Pedestals) */}
      {(searchQuery || activeCategory === 'greetings' || activeCategory === 'all') && (
        <section aria-label="Signs Grid" className="space-y-3">
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
            <div className="p-8 rounded-3xl nm-inset text-center space-y-2">
              <span className="text-2xl">🔍</span>
              <h3 className="text-sm font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                No matching signs found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for simple words like &ldquo;HELLO&rdquo;, &ldquo;THANK YOU&rdquo;, or &ldquo;HELP&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
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
                  className="p-3 rounded-2xl nm-flat text-left active:scale-[0.98] transition-all flex flex-col justify-between space-y-2.5 group"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl nm-inset p-1 overflow-hidden flex items-center justify-center">
                    <video
                      src={`${item.url || `/assets/signs/${item.token}.mp4`}#t=0.2`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover rounded-lg opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full nm-flat active:nm-inset flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                        <Play size={13} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
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

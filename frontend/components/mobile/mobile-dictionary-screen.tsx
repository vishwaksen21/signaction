'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Filter,
  Play,
  Sparkles,
  ArrowRight,
  Hand,
  Check,
  X,
} from 'lucide-react';
import { useDictionary } from '../../hooks/use-dictionary';
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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8">
      {/* 1. Header & Search Bar */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-heading font-extrabold text-[#062B5C] dark:text-white tracking-tight">
            ISL Sign Dictionary
          </h1>
          <p className="text-xs text-[#60759A] dark:text-slate-400">
            349 offline video gestures with slow-motion learning controls.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60759A] dark:text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sign token (e.g. HELLO, WATER, A)..."
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 text-xs text-[#062B5C] dark:text-white placeholder-[#60759A] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0757E8] shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-black flex items-center justify-center text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Selector Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveCategory('alpha')}
            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-[transform,background-color] duration-120 active:scale-95 ${
              activeCategory === 'alpha'
                ? 'bg-[#0757E8] text-white shadow-xs'
                : 'bg-white dark:bg-[#07132C] text-[#60759A] dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            Alphabet (A-Z)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('num')}
            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-[transform,background-color] duration-120 active:scale-95 ${
              activeCategory === 'num'
                ? 'bg-[#0757E8] text-white shadow-xs'
                : 'bg-white dark:bg-[#07132C] text-[#60759A] dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            Numbers (0-9)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('greetings')}
            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-[transform,background-color] duration-120 active:scale-95 ${
              activeCategory === 'greetings'
                ? 'bg-[#0757E8] text-white shadow-xs'
                : 'bg-white dark:bg-[#07132C] text-[#60759A] dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            Greetings & Daily
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-[transform,background-color] duration-120 active:scale-95 ${
              activeCategory === 'all'
                ? 'bg-[#0757E8] text-white shadow-xs'
                : 'bg-white dark:bg-[#07132C] text-[#60759A] dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            All Gestures ({allItems.length || 349})
          </button>
        </div>
      )}

      {/* 3. Special Interactive Grid: Alphabet Drill Mode */}
      {!searchQuery && activeCategory === 'alpha' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
              Alphabet Fingerspelling Drill
            </span>
            <span className="text-[10px] font-mono text-[#0757E8] dark:text-[#12CFF3]">
              Tap any letter to view video
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() =>
                  setSelectedGesture({
                    token: letter,
                    label: `Letter ${letter}`,
                    category: 'Alphabet',
                    english: `Fingerspelling sign for letter ${letter}`,
                    videoUrl: `/assets/signs/${letter}.mp4`,
                  })
                }
                className="h-14 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 p-2 flex flex-col items-center justify-center active:scale-92 hover:border-[#0757E8] transition-all shadow-xs group"
              >
                <span className="text-xl font-heading font-black text-[#062B5C] dark:text-white group-hover:text-[#0757E8] dark:group-hover:text-[#12CFF3]">
                  {letter}
                </span>
                <span className="text-[9px] font-mono text-[#60759A] dark:text-slate-400">
                  ISL
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Special Interactive Grid: Numbers Drill Mode */}
      {!searchQuery && activeCategory === 'num' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
              Number Digits (0 - 9)
            </span>
            <span className="text-[10px] font-mono text-[#0757E8] dark:text-[#12CFF3]">
              Tap digit to view video
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {DIGITS.map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() =>
                  setSelectedGesture({
                    token: digit,
                    label: `Digit ${digit}`,
                    category: 'Number',
                    english: `Indian Sign Language representation for ${digit}`,
                    videoUrl: `/assets/signs/${digit}.mp4`,
                  })
                }
                className="h-16 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 p-2 flex flex-col items-center justify-center active:scale-92 hover:border-[#0757E8] transition-all shadow-xs group"
              >
                <span className="text-2xl font-heading font-black text-[#062B5C] dark:text-white group-hover:text-[#0757E8] dark:group-hover:text-[#12CFF3]">
                  {digit}
                </span>
                <span className="text-[9px] font-mono text-[#60759A] dark:text-slate-400">
                  Digit
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Gestures Grid (Greetings, Search Results, or All) */}
      {(searchQuery || activeCategory === 'greetings' || activeCategory === 'all') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
              {searchQuery
                ? `Results for "${searchQuery}" (${filteredGestures.length})`
                : activeCategory === 'greetings'
                ? 'High-Frequency Conversational Signs'
                : 'All Offline Gestures'}
            </span>
          </div>

          {filteredGestures.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 text-center space-y-2">
              <span className="text-2xl">🔍</span>
              <h3 className="text-sm font-bold text-[#062B5C] dark:text-white">
                No matching signs found
              </h3>
              <p className="text-xs text-[#60759A] dark:text-slate-400">
                Try searching for simple words like &ldquo;HELLO&rdquo;, &ldquo;THANK YOU&rdquo;, or &ldquo;HELP&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredGestures.slice(0, 48).map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() =>
                    setSelectedGesture({
                      token: item.token,
                      label: item.token.replace(/_/g, ' '),
                      category: (item as any).category || 'ISL Gesture',
                      english: `Sign representation for ${item.token.replace(/_/g, ' ')}`,
                      videoUrl: item.url || `/assets/signs/${item.token}.mp4`,
                    })
                  }
                  className="p-2.5 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 text-left shadow-xs active:scale-96 hover:border-[#0757E8]/40 transition-[transform,border-color] duration-120 flex flex-col justify-between space-y-2 group"
                >
                  <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                    <video
                      src={item.url || `/assets/signs/${item.token}.mp4`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-[#0757E8] dark:text-[#12CFF3] shadow-xs group-hover:scale-110 transition-transform">
                        <Play size={12} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#062B5C] dark:text-white truncate">
                      {item.token.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-[10px] text-[#60759A] dark:text-slate-400 capitalize truncate block">
                      {(item as any).category || 'Offline Gesture'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Detail Sheet Modal */}
      <GesturePlayerSheet
        gesture={selectedGesture}
        onClose={() => setSelectedGesture(null)}
      />
    </div>
  );
}

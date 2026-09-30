'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  BookOpen,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Gauge,
  Video,
} from 'lucide-react';
import { useDictionary } from '../../hooks/use-dictionary';
import { SignCard } from '../../components/sign-card';
import { SignViewer } from '../../components/sign-viewer';
import { Skeleton } from '../../components/ui/skeleton';
import type { DictionaryItem } from '../../lib/api';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CATEGORIES = [
  { id: 'all', label: 'All Gestures' },
  { id: 'alpha', label: 'Alphabet (A-Z)' },
  { id: 'num', label: 'Numbers (0-9)' },
  { id: 'greetings', label: 'Greetings & Common' },
];

const GREETINGS_KEYWORDS = [
  'HELLO', 'HI', 'NAMASTE', 'GOOD', 'MORNING', 'AFTERNOON', 'NIGHT',
  'THANK YOU', 'PLEASE', 'WELCOME', 'SORRY', 'HELP', 'BYE', 'YES', 'NO',
  'HOW ARE YOU', 'FINE', 'HAPPY', 'LOVE', 'FRIEND', 'WATER', 'FOOD'
];

export default function DictionaryPage() {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Selected sign for HD Detail Modal
  const [selectedSignIndex, setSelectedSignIndex] = useState<number | null>(null);
  const [modalSpeed, setModalSpeed] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);

  const { data, isLoading, error } = useDictionary();

  // Reset pagination when filter or search changes
  useEffect(() => {
    setVisibleCount(36);
  }, [query, letter, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    const items: DictionaryItem[] = data?.items ?? [];

    return items.filter((i) => {
      const tok = i.token.toUpperCase();

      // Category filter
      if (category === 'alpha') {
        if (!/^[A-Z]$/.test(tok)) return false;
      } else if (category === 'num') {
        if (!/^[0-9]+$/.test(tok)) return false;
      } else if (category === 'greetings') {
        const matchesGreeting = GREETINGS_KEYWORDS.some((kw) => tok.includes(kw));
        if (!matchesGreeting) return false;
      }

      // Letter filter
      if (letter && !tok.startsWith(letter)) return false;

      // Search query
      if (!q) return true;
      return tok.includes(q);
    });
  }, [data, query, letter, category]);

  const visibleItems = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const selectedSign = selectedSignIndex !== null && filtered[selectedSignIndex]
    ? filtered[selectedSignIndex]
    : null;

  const handlePrevSign = () => {
    if (selectedSignIndex === null) return;
    setSelectedSignIndex((prev) => (prev! > 0 ? prev! - 1 : filtered.length - 1));
  };

  const handleNextSign = () => {
    if (selectedSignIndex === null) return;
    setSelectedSignIndex((prev) => (prev! < filtered.length - 1 ? prev! + 1 : 0));
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (selectedSignIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSignIndex(null);
      if (e.key === 'ArrowLeft') handlePrevSign();
      if (e.key === 'ArrowRight') handleNextSign();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSignIndex, filtered.length]);

  const handleCopyToken = () => {
    if (!selectedSign) return;
    navigator.clipboard?.writeText(selectedSign.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 transition-colors duration-300 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#38BDF8] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#38BDF8]" />
              <span>Offline Gesture Library · 347 ISL Signs</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#062B5C] dark:text-white mb-3">
              Sign Gesture <span className="text-[#0757E8] dark:text-[#38BDF8]">Dictionary</span>
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400">
              Browse and play verified Indian Sign Language gestures, alphabet fingerspellings, and common expressions offline.
            </p>
          </motion.div>
        </div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 max-w-4xl mx-auto sign-card p-5 sm:p-7 space-y-5"
        >
          {/* Search Input */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gestures by name (e.g. HELLO, THANK YOU, HELP, WATER)..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0757E8]/20 focus:border-[#0757E8] transition-all text-[#062B5C] dark:text-white placeholder:text-slate-400 text-sm md:text-base font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-[#062B5C] dark:hover:text-white"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {CATEGORIES.map((c) => {
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    if (c.id !== 'all') setLetter('');
                  }}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-[#0757E8] text-white shadow-xs'
                      : 'bg-[#F0F4F8] dark:bg-slate-800 text-[#062B5C] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Letter Filter Bar */}
          <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-2">
                <Filter size={13} className="text-[#0757E8]" />
                Filter by First Letter
              </label>
              {letter && (
                <button
                  type="button"
                  onClick={() => setLetter('')}
                  className="text-xs text-[#0757E8] hover:underline font-semibold"
                >
                  Clear letter filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setLetter('')}
                className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  letter === ''
                    ? 'bg-[#0757E8] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-[#062B5C] dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                All
              </button>

              {ALPHABET.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLetter(letter === l ? '' : l)}
                  className={`min-w-[34px] h-9 px-1.5 flex items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    letter === l
                      ? 'bg-[#0757E8] text-white shadow-xs'
                      : 'bg-[#F0F4F8] dark:bg-slate-800 text-[#062B5C] dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                  }`}
                  aria-label={`Filter gestures by letter ${l}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Result count & status */}
        {!isLoading && !error && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mb-8">
            <span>Showing</span>
            <span className="font-extrabold text-[#062B5C] dark:text-white bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
              {Math.min(visibleCount, filtered.length)} of {filtered.length}
            </span>
            <span>gestures</span>
            {query && <span>matching &ldquo;{query}&rdquo;</span>}
            {letter && <span>starting with &ldquo;{letter}&rdquo;</span>}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Offline Available
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-sm flex items-center justify-center text-center">
            {(error as Error).message || 'Unable to load dictionary items. Check backend connection.'}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="sign-card p-5 space-y-3">
                <Skeleton className="h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleItems.map((item, index) => (
                <div key={item.token + item.url}>
                  <SignCard
                    token={item.token}
                    url={item.url}
                    mediaType={item.media_type}
                    onClick={() => {
                      setSelectedSignIndex(index);
                      setModalSpeed(1.0);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button if more items exist */}
            {filtered.length > visibleCount && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 36)}
                  className="btn-sign-primary px-8 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Load 36 More Gestures ({filtered.length - visibleCount} remaining)
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleCount(filtered.length)}
                  className="btn-sign-secondary px-6 py-3.5 text-sm font-semibold transition-all"
                >
                  Show All {filtered.length} Gestures
                </button>
              </div>
            )}
          </>
        ) : !error && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center justify-center p-10 max-w-md mx-auto sign-card">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] flex items-center justify-center mb-4">
                <Search size={30} />
              </div>
              <p className="font-heading text-lg font-bold text-[#062B5C] dark:text-white mb-2">No gestures found</p>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
                Try searching for another word or clearing your filter to view all tokens.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setLetter('');
                  setCategory('all');
                }}
                className="btn-sign-primary text-xs px-6 py-2.5"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* HIGH DEFINITION SIGN DETAIL MODAL                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSign && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedSignIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#07132C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0757E8] flex items-center justify-center text-white font-bold text-sm">
                    {selectedSign.token.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-[#062B5C] dark:text-white tracking-tight">
                      {selectedSign.token}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Indian Sign Language (ISL) Gesture
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900">
                    {selectedSign.media_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSignIndex(null)}
                    aria-label="Close gesture preview"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                <SignViewer
                  url={selectedSign.url}
                  playing={true}
                  loop={true}
                  controls={true}
                  preload="auto"
                />

                {/* Left / Right Quick Carousel Nav */}
                <button
                  type="button"
                  onClick={handlePrevSign}
                  aria-label="Previous sign"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all z-20"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleNextSign}
                  aria-label="Next sign"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all z-20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Modal Bottom Actions */}
              <div className="p-6 bg-[#FAF9F6] dark:bg-[#050B14] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                
                {/* Left: Speed toggles */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 flex items-center gap-1 mr-1">
                    <Gauge size={13} /> Speed:
                  </span>
                  {[0.5, 0.75, 1.0].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setModalSpeed(spd);
                        const video = document.querySelector('video');
                        if (video) video.playbackRate = spd;
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modalSpeed === spd
                          ? 'bg-[#0757E8] text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#062B5C] dark:text-slate-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Right: Copy & Translate in App buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#062B5C] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <Link
                    href={`/translator?text=${encodeURIComponent(selectedSign.token)}`}
                    onClick={() => setSelectedSignIndex(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#0757E8] hover:bg-[#064BD1] text-white shadow-sm transition-all active:scale-95"
                  >
                    <span>Use in Translator</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

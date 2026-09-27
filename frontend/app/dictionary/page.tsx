'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Sparkles, X } from 'lucide-react';
import { useDictionary } from '../../hooks/use-dictionary';
import { SignCard } from '../../components/sign-card';
import { Skeleton } from '../../components/ui/skeleton';
import type { DictionaryItem } from '../../lib/api';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function DictionaryPage() {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string>('');

  const { data, isLoading, error } = useDictionary();

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    const items: DictionaryItem[] = data?.items ?? [];

    return items.filter((i) => {
      if (letter && !i.token.startsWith(letter)) return false;
      if (!q) return true;
      return i.token.includes(q);
    });
  }, [data, query, letter]);

  return (
    <div className="min-h-screen bg-sign-soft/40 dark:bg-slate-950 text-sign-darktext dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sign-verylight dark:bg-sign-navy/40 border border-sign-border/60 text-sign-blue dark:text-sign-cyan text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
              <BookOpen size={14} className="text-sign-bright" />
              Sign Gesture Library
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-sign-navy dark:text-white mb-4">
              Sign <span className="sign-text-gradient">Dictionary</span>
            </h1>
            <p className="text-base sm:text-lg text-sign-muted dark:text-slate-400">
              Explore available gesture assets, verified Indian & American sign tokens, and fingerspelling sequences.
            </p>
          </motion.div>
        </div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 max-w-4xl mx-auto sign-card p-6 md:p-8"
        >
          {/* Search Input */}
          <div className="relative mb-6">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sign-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gestures by keyword (e.g. HELLO, THANK YOU, WATER)..."
              className="w-full pl-12 pr-10 py-3.5 bg-sign-soft/70 dark:bg-slate-900 border border-sign-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sign-cyan/40 focus:border-sign-bright transition-all text-sign-darktext dark:text-white placeholder:text-sign-muted/70 text-sm md:text-base font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-sign-muted hover:text-sign-navy dark:hover:text-white"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Letter Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-sign-muted dark:text-slate-400 flex items-center gap-2">
                <Filter size={14} className="text-sign-bright" />
                Filter by First Letter
              </label>
              {letter && (
                <button
                  type="button"
                  onClick={() => setLetter('')}
                  className="text-xs text-sign-bright hover:underline font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <button
                onClick={() => setLetter('')}
                className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                  letter === ''
                    ? 'btn-sign-primary shadow-sm'
                    : 'bg-sign-soft/90 dark:bg-slate-800 text-sign-darktext dark:text-slate-300 hover:bg-sign-verylight dark:hover:bg-slate-700 border border-sign-border/40'
                }`}
              >
                All
              </button>

              {ALPHABET.map((l) => (
                <button
                  key={l}
                  onClick={() => setLetter(letter === l ? '' : l)}
                  className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                    letter === l
                      ? 'btn-sign-primary shadow-sm'
                      : 'bg-sign-soft/90 dark:bg-slate-800 text-sign-darktext dark:text-slate-300 hover:bg-sign-verylight dark:hover:bg-slate-700 border border-sign-border/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Result count & status */}
        {!isLoading && !error && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-sign-muted dark:text-slate-400 mb-8">
            <span>Showing</span>
            <span className="font-extrabold text-sign-navy dark:text-white bg-sign-verylight dark:bg-sign-navy/50 px-2.5 py-0.5 rounded-full border border-sign-border/60">
              {filtered.length}
            </span>
            <span>gesture{filtered.length !== 1 ? 's' : ''}</span>
            {query && <span>matching &ldquo;{query}&rdquo;</span>}
            {letter && <span>starting with &ldquo;{letter}&rdquo;</span>}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center justify-center text-center">
            {(error as Error).message || 'Unable to load dictionary items. Check backend connection.'}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="sign-card p-4 space-y-3">
                <Skeleton className="h-5 w-24 rounded-lg bg-sign-border/40" />
                <Skeleton className="h-44 w-full rounded-2xl bg-sign-border/30" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.04
                }
              }
            }}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {filtered.map((item) => (
              <motion.div 
                key={item.token + item.url}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="cursor-pointer"
              >
                <SignCard token={item.token} url={item.url} mediaType={item.media_type} />
              </motion.div>
            ))}
          </motion.div>
        ) : !error && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center justify-center p-10 max-w-md mx-auto sign-card">
              <div className="w-16 h-16 rounded-2xl bg-sign-verylight dark:bg-sign-navy/40 text-sign-bright flex items-center justify-center mb-4">
                <Search size={32} />
              </div>
              <p className="text-lg font-bold text-sign-navy dark:text-white mb-2">No gestures found</p>
              <p className="text-sm text-sign-muted dark:text-slate-400 mb-6">
                Try searching for another word or clearing your filter to view all tokens.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setLetter('');
                }}
                className="btn-sign-primary text-xs px-5 py-2.5"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


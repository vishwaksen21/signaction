'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-apple-surface-black text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
              <BookOpen size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Sign Dictionary
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Browse and explore all available gesture assets in the database
            </p>
          </motion.div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-12 max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          
          {/* Search Input */}
          <div className="relative mb-6">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gestures by name…"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Letter Filter */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Filter size={16} className="text-blue-500" />
              Filter by letter
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLetter('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  letter === ''
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>

              {ALPHABET.map((l) => (
                <button
                  key={l}
                  onClick={() => setLetter(l)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    letter === l
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result count */}
        {!isLoading && !error && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center mb-8">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span> gesture{filtered.length !== 1 ? 's' : ''}
            {query && ` matching "${query}"`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-sm flex justify-center">
            {(error as Error).message}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
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
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {filtered.map((item) => (
              <motion.div 
                key={item.token + item.url}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="group cursor-pointer"
              >
                <SignCard token={item.token} url={item.url} mediaType={item.media_type} />
              </motion.div>
            ))}
          </motion.div>
        ) : !error && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center justify-center p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Search size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">No gestures found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sign Dictionary
          </h1>
          <p className="text-slate-400 text-lg">
            Browse and explore all available gesture assets in the database
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search Input */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gestures by name…"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder-slate-400"
            />
          </div>

          {/* Letter Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Filter size={16} />
              Filter by letter
            </label>
            <motion.div
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Clear button */}
              <motion.button
                variants={itemVariants}
                onClick={() => setLetter('')}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                  letter === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 dark:bg-slate-800/50 light:bg-slate-100 light:text-slate-700'
                }`}
              >
                All
              </motion.button>

              {/* Letter buttons */}
              {ALPHABET.map((l) => (
                <motion.button
                  key={l}
                  variants={itemVariants}
                  onClick={() => setLetter(l)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    letter === l
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 dark:bg-slate-800/50 light:bg-slate-100 light:text-slate-700'
                  }`}
                >
                  {l}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Result count */}
          {!isLoading && (
            <motion.p
              className="text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Showing <span className="font-semibold text-indigo-400">{filtered.length}</span> gesture
              {filtered.length !== 1 ? 's' : ''}
              {query && ` matching "${query}"`}
            </motion.p>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {(error as Error).message}
          </motion.div>
        )}

        {/* Grid */}
        {isLoading ? (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton className="h-48 w-full rounded-xl" />
              </motion.div>
            ))}
          </motion.div>
        ) : filtered.length > 0 ? (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.token + item.url}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <SignCard token={item.token} url={item.url} mediaType={item.media_type} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block p-8 rounded-2xl bg-slate-800/30 border border-slate-700">
              <p className="text-slate-400 mb-2 font-medium">No gestures found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

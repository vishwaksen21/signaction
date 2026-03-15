'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Hand, Layers, Mic2, Sparkles, Zap } from 'lucide-react';
import { TranslatorInput } from '../../components/translator-input';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { TokenChips } from '../../components/token-chips';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';

export default function TranslatorPage() {
  const [text, setText] = useState('');

  const translateText = useTranslateText();
  const translateSpeech = useTranslateSpeech();

  const active = translateSpeech.data ?? translateText.data;
  const isLoading = translateText.isPending || translateSpeech.isPending;
  const error = (translateText.error ?? translateSpeech.error) as Error | null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:p-12">
          {/* Subtle Background Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-24 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[80px] dark:bg-indigo-500/20" />
            <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[80px] dark:bg-purple-500/20" />
          </div>

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.2fr_auto_1fr]">
            {/* Left Copy */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Sparkles size={16} className="text-indigo-500" />
                Text + Speech → Sign Gestures
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">
                  Text & Speech <br />
                  <span className="text-slate-700 dark:text-slate-300">to Sign</span>
                </h1>
                <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
                  Translate your words into beautiful sign language gestures instantly. Enter text, record speech, or upload audio to see the magic happen.
                </p>
              </div>

              <motion.a
                href="#translate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-95"
                whileHover={{ y: -2 }}
              >
                <Zap size={20} />
                Start Translating
              </motion.a>
            </motion.div>

            {/* Middle Pipeline Hint */}
            <div className="hidden items-center justify-center gap-4 text-slate-400 lg:flex">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <Layers size={20} />
              </span>
              <ArrowRight size={20} />
              <motion.span
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Hand size={20} />
              </motion.span>
            </div>

            {/* Right Mini Player (Illustration) */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Animated Gesture Illustration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Media-style playback with smooth transitions</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <Hand size={18} />
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['HELLO', 'WORLD', 'PLEASE'].map((t, i) => (
                    <span
                      key={t}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide ${
                        i === 0
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Gesture 1', glyph: 'H', src: '/assets/alphabet/H.jpg' },
                    { label: 'Gesture 2', glyph: 'W', src: '/assets/alphabet/W.jpg', active: true },
                    { label: 'Gesture 3', glyph: 'P', src: '/assets/alphabet/P.jpg' },
                  ].map((g, i) => (
                    <div
                      key={g.label}
                      className={`rounded-xl border p-3 transition-all ${
                        g.active
                          ? 'border-indigo-300 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-300 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/50'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{g.label}</span>
                        <Hand size={12} className={g.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                      </div>

                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                        <Image src={g.src} alt={g.glyph} fill sizes="120px" className="object-cover" />
                      </div>

                      <div className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{g.glyph}</div>

                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: g.active ? '60%' : i === 0 ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: '45%' }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Gesture 2 / 3</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Playing</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Highlights */}
        <motion.div className="mt-8 grid gap-4 md:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
          {[
            {
              icon: <Mic2 size={24} />,
              title: 'Speech Recognition',
              description: 'Convert spoken words into text instantly with high accuracy.',
            },
            {
              icon: <Hand size={24} />,
              title: 'Sign Generation',
              description: 'Transform text into fluid sign language gesture sequences.',
            },
            {
              icon: <Zap size={24} />,
              title: 'Real-Time Output',
              description: 'Watch your translations appear and play back immediately.',
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:shadow-none"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error.message}
          </motion.div>
        )}

        {/* Main Translator Layout */}
        <motion.div
          id="translate"
          className="mt-12 grid gap-8 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Input Panel */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <TranslatorInput
              text={text}
              onTextChange={setText}
              onTranslateText={() => translateText.mutate({ text })}
              onTranslateSpeech={(file: File) => translateSpeech.mutate({ file })}
              loading={isLoading}
              error={error?.message ?? null}
            />
          </motion.div>

          {/* Output Panel */}
          <motion.div variants={itemVariants}>
            <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 lg:px-8">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <Hand size={20} />
                  </div>
                  Translation Output
                </h2>
              </div>

              <div className="flex-1 p-6 lg:p-8">
                {active ? (
                  <div className="space-y-8">
                    {/* Transcript */}
                    {active.transcript && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Speech Transcript
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          "{active.transcript}"
                        </div>
                      </motion.div>
                    )}

                    {/* Gloss & Tokens */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {active.gloss && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Sign Gloss
                          </label>
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 font-mono text-sm text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300">
                            {active.gloss}
                          </div>
                        </motion.div>
                      )}

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Tokens ({active.tokens?.length ?? 0})
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                          <TokenChips tokens={active.tokens ?? []} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Sequence Player */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4"
                    >
                      <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Gesture Playback
                      </label>
                      <GestureSequencePlayer gestures={active.gestures ?? []} loading={isLoading} />
                    </motion.div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
                      <Hand size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to Translate</h3>
                    <p className="mt-2 max-w-[250px] text-sm text-slate-500 dark:text-slate-400">
                      Enter text or use your microphone to generate sign language gestures.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

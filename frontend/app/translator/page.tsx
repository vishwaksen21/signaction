'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-apple-surface-black text-slate-900 dark:text-white">
      
      {/* Hero Section */}
      <section className="w-full py-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Copy */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm w-fit border border-blue-100 dark:border-blue-800/50"
            >
              <Sparkles size={16} />
              Text + Speech → Sign Gestures
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Translate words <span className="text-blue-600 dark:text-blue-500">to sign</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 dark:text-slate-400 max-w-xl"
            >
              Convert your words into beautiful sign language gestures instantly. Enter text, record speech, or upload audio to see the magic happen.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <a href="#translate" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all hover:scale-105 shadow-md shadow-blue-500/20 w-fit">
                <Zap size={20} />
                Start Translating
              </a>
            </motion.div>
          </div>

          {/* Right Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gesture Pipeline</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Smooth media playback</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <Hand size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {['HELLO', 'WORLD', 'PLEASE'].map((t, i) => (
                <span
                  key={t}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                    i === 0 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Sign 1', token: 'HELLO', glyph: 'H' },
                { label: 'Sign 2', token: 'WHAT', glyph: 'W', active: true },
                { label: 'Sign 3', token: 'YOU', glyph: 'Y' },
              ].map((g) => (
                <div
                  key={g.label}
                  className={`rounded-2xl p-4 transition-all ${
                    g.active
                      ? 'bg-blue-600 shadow-lg shadow-blue-500/30 border-blue-500'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className={`flex justify-between text-xs mb-3 font-medium ${g.active ? 'text-blue-100' : 'text-slate-400'}`}>
                    <span>{g.label}</span>
                  </div>
                  <div className={`aspect-square w-full flex items-center justify-center rounded-xl mb-3 overflow-hidden ${g.active ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <video
                      src={`/assets/signs/${g.token}.mp4`}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                  <div className={`text-center font-bold text-lg ${g.active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{g.token}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Main Translator Section */}
      <section id="translate" className="w-full py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl text-sm">
              {error.message}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Input Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col"
            >
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
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col min-h-[500px] shadow-sm"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <Hand size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Output</h2>
              </div>

              <div className="flex-1 flex flex-col">
                {active ? (
                  <div className="space-y-8 flex-1">
                    
                    {/* Transcript */}
                    {active.transcript && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                          Transcript
                        </label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                          "{active.transcript}"
                        </div>
                      </motion.div>
                    )}

                    {/* Gloss & Tokens */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {active.gloss && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                            Sign Gloss
                          </label>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl font-mono text-blue-700 dark:text-blue-400 text-sm">
                            {active.gloss}
                          </div>
                        </motion.div>
                      )}

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                          Tokens ({active.tokens?.length ?? 0})
                        </label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <TokenChips tokens={active.tokens ?? []} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Sequence Player */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4 flex-1"
                    >
                      <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-4">
                        Gesture Playback
                      </label>
                      <GestureSequencePlayer gestures={active.gestures ?? []} loading={isLoading} />
                    </motion.div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6"
                    >
                      <Hand size={48} strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Ready to Translate</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Enter text or use your microphone to generate sign language gestures.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Sparkles, Hand, Play } from 'lucide-react';
import { TranslatorInput } from '../../components/translator-input';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { TokenChips } from '../../components/token-chips';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';

export default function YoutubeTranslatorPage() {
  const [text, setText] = useState('');

  const translateText = useTranslateText();
  const translateSpeech = useTranslateSpeech();

  const handleTranslateText = () => {
    translateSpeech.reset();
    translateText.mutate({ text });
  };

  const handleTranslateSpeech = (file: File) => {
    translateText.reset();
    translateSpeech.mutate({ file });
  };

  const active = translateSpeech.data ?? translateText.data;
  const isLoading = translateText.isPending || translateSpeech.isPending;
  const error = (translateText.error ?? translateSpeech.error) as Error | null;

  return (
    <div className="flex flex-col min-h-screen bg-sign-soft/40 dark:bg-slate-950 text-sign-darktext dark:text-white transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="w-full py-14 px-4 md:px-8 border-b border-sign-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Hero */}
          <div className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs w-fit border border-red-200 dark:border-red-900/40 uppercase tracking-wider"
            >
              <Youtube size={15} className="text-red-500" />
              YouTube Video Sign Translator
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-sign-navy dark:text-white leading-tight"
            >
              Translate to <span className="text-red-600 dark:text-red-500">YouTube Video</span> Signs
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-sign-muted dark:text-slate-400 max-w-xl leading-relaxed"
            >
              Input text or speak to search your custom Indian Sign Language (ISL) YouTube video database, and watch them play sequentially with AI stick-figure fallbacks.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2"
            >
              <a href="#play" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md shadow-red-500/25 w-fit">
                <Play size={16} fill="currentColor" />
                Open Sign Player
              </a>
            </motion.div>
          </div>

          {/* Right Preview Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="sign-card p-7 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-extrabold text-sign-navy dark:text-white">YouTube ISL Mappings</h3>
                <p className="text-xs text-sign-muted dark:text-slate-400">Continuous video gesture sequence</p>
              </div>
              <div className="w-10 h-10 bg-sign-verylight dark:bg-sign-navy/40 text-red-500 rounded-2xl flex items-center justify-center border border-sign-border/60">
                <Hand size={18} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {['LOW', 'CRICKET', 'BIRTHDAY'].map((t, i) => (
                <span
                  key={t}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                    i < 2 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                      : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
                  }`}
                >
                  {i < 2 ? <Youtube size={12} className="text-red-500" /> : <Sparkles size={12} className="text-amber-500" />}
                  {t}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-sign-muted dark:text-slate-400 font-semibold">
                <span>Active Playlist</span>
                <span>3,779 signs indexed</span>
              </div>
              <div className="h-2 w-full bg-sign-soft dark:bg-slate-800 rounded-full overflow-hidden border border-sign-border/40">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 w-[78%] rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Workspace */}
      <div id="play" className="flex-1 max-w-7xl w-full mx-auto py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Box */}
          <section className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-bold text-sign-bright uppercase tracking-wider">Input Stream</span>
              <h2 className="text-2xl font-extrabold text-sign-navy dark:text-white tracking-tight">Translate Sentence</h2>
              <p className="text-sign-muted dark:text-slate-400 text-xs sm:text-sm mt-1">
                Type your phrase or speak to play corresponding sign language videos.
              </p>
            </div>

            <div className="sign-card p-6">
              <TranslatorInput
                text={text}
                onTextChange={setText}
                onTranslateText={handleTranslateText}
                onTranslateSpeech={handleTranslateSpeech}
                loading={isLoading}
              />
            </div>
          </section>

          {/* Right Column: Player Results */}
          <section className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold text-sign-bright uppercase tracking-wider">Visual Stream</span>
              <h2 className="text-2xl font-extrabold text-sign-navy dark:text-white tracking-tight">Sign Playback</h2>
              <p className="text-sign-muted dark:text-slate-400 text-xs sm:text-sm mt-1">
                Sequence of resolved Indian Sign Language (ISL) video lessons.
              </p>
            </div>

            <div className="sign-card p-6 min-h-[460px] flex flex-col justify-between">
              {/* Gloss Tokens / Error */}
              {error ? (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs sm:text-sm mb-4">
                  Translation failed: {error.message || 'Unknown network error. Check backend server connection.'}
                </div>
              ) : active && (
                <div className="space-y-2 pb-5 border-b border-sign-border/60 mb-4">
                  <span className="text-[11px] font-extrabold text-sign-muted uppercase tracking-wider block">
                    Gloss Tokens
                  </span>
                  <TokenChips tokens={active.tokens} />
                </div>
              )}

              {/* Video Slideshow Player */}
              <div className="flex-1 flex flex-col justify-center">
                <GestureSequencePlayer gestures={active?.gestures ?? []} loading={isLoading} />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}


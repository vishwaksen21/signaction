'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Sparkles, Zap, Hand, Play } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-apple-surface-black text-slate-900 dark:text-white">
      
      {/* Hero Section */}
      <section className="w-full py-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Hero */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium text-sm w-fit border border-red-100 dark:border-red-900/20"
            >
              <Youtube size={16} className="text-red-500" />
              YouTube Video Sign Translator
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Translate to <span className="text-red-600 dark:text-red-500">YouTube Video</span> Signs
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 dark:text-slate-400 max-w-xl"
            >
              Input text or speak to search your custom Indian Sign Language (ISL) YouTube video database, and watch them play sequentially with AI stick-figure fallbacks.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <a href="#play" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all hover:scale-105 shadow-md shadow-red-500/20 w-fit">
                <Play size={18} fill="currentColor" />
                Open Sign Player
              </a>
            </motion.div>
          </div>

          {/* Right Preview Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">YouTube Mappings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Seamless video sequencing</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <Hand size={20} className="text-red-500" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {['LOW', 'CRICKET', 'BIRTHDAY'].map((t, i) => (
                <span
                  key={t}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm border ${
                    i < 2 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                      : 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
                  }`}
                >
                  {i < 2 ? <Youtube size={12} className="text-red-500" /> : <Sparkles size={12} className="text-amber-500" />}
                  {t}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Active Playlist</span>
                <span>3,779 signs loaded</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[78%] rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Workspace */}
      <div id="play" className="flex-1 max-w-7xl w-full mx-auto py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Box */}
          <section className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Translate Sentence</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Type your phrase or speak into the microphone to play corresponding sign language videos.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md">
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
          <section className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Sign Playback</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Sequence of resolved Indian Sign Language (ISL) lessons.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md min-h-[460px] flex flex-col justify-between">
              {/* Gloss Tokens / Error or Loader */}
              {error ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm mb-4">
                  Translation failed: {error.message || 'Unknown network error. Check backend server connection.'}
                </div>
              ) : active && (
                <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
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

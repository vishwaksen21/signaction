'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Hand, Sparkles, Zap, WifiOff } from 'lucide-react';
import { TranslatorInput } from '../../components/translator-input';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { TokenChips } from '../../components/token-chips';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';
import { translateTextOffline } from '../../lib/offline-translate';
import { OfflineBadge } from '../../components/model-download';

export default function TranslatorPage() {
  const [text, setText] = useState('');
  const [offlineResult, setOfflineResult] = useState<any>(null);

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

  const handleTranslateOffline = useCallback(() => {
    if (!text.trim()) return;
    const result = translateTextOffline(text);
    setOfflineResult(result);
  }, [text]);

  // Clear offline result when text changes
  const handleTextChange = useCallback((val: string) => {
    setText(val);
    setOfflineResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-apple-surface-black text-slate-900 dark:text-white">
      
      {/* Hero Section - Compact */}
      <section className="w-full py-8 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-xs mb-3"
              >
                <Sparkles size={14} />
                Text + Speech → Sign Gestures
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Translate words <span className="text-blue-600 dark:text-blue-500">to sign</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <a href="#translate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-sm transition-all shadow-md">
                <Zap size={16} />
                Start Translating
              </a>
              <button
                onClick={handleTranslateOffline}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-full font-medium text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <WifiOff size={14} />
                Offline
              </button>
              <OfflineBadge />
            </div>
          </div>
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
                onTextChange={handleTextChange}
                onTranslateText={handleTranslateText}
                onTranslateSpeech={handleTranslateSpeech}
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
                {active || offlineResult ? (
                  <div className="space-y-8 flex-1">
                    
                    {/* Transcript */}
                    {(active?.transcript || offlineResult?.gloss) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                          {active?.transcript ? 'Transcript' : 'Input'}
                        </label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                          "{active?.transcript || text}"
                        </div>
                      </motion.div>
                    )}

                    {/* Gloss & Tokens */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {(active?.gloss || offlineResult?.gloss) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                            Sign Gloss
                          </label>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl font-mono text-blue-700 dark:text-blue-400 text-sm">
                            {active?.gloss || offlineResult?.gloss}
                          </div>
                        </motion.div>
                      )}

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                          Tokens ({(active?.tokens ?? offlineResult?.tokens)?.length ?? 0})
                        </label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <TokenChips tokens={active?.tokens ?? offlineResult?.tokens ?? []} />
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
                      <GestureSequencePlayer gestures={active?.gestures ?? offlineResult?.gestures ?? []} loading={isLoading} />
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

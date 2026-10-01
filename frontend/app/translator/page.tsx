'use client';


import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hand,
  Sparkles,
  Zap,
  WifiOff,
  Shield,
  Layers,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { TranslatorInput } from '../../components/translator-input';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { TokenChips } from '../../components/token-chips';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';
import { translateTextOffline } from '../../lib/offline-translate';
import { OfflineBadge } from '../../components/model-download';

export default function TranslatorPage() {
  const [text, setText] = useState('');
  const [offlineResult, setOfflineResult] = useState<any>(null);
  const [activeTokenIndex, setActiveTokenIndex] = useState(0);

  const translateText = useTranslateText();
  const translateSpeech = useTranslateSpeech();

  const handleTranslateText = () => {
    translateSpeech.reset();
    setOfflineResult(null);
    setActiveTokenIndex(0);
    translateText.mutate(
      { text },
      {
        onError: () => {
          // Automatic offline fallback
          const result = translateTextOffline(text);
          setOfflineResult(result);
        },
      }
    );
  };

  const handleTranslateSpeech = (file: File) => {
    translateText.reset();
    setOfflineResult(null);
    setActiveTokenIndex(0);
    translateSpeech.mutate({ file });
  };

  const active = translateSpeech.data ?? translateText.data;
  const isLoading = translateText.isPending || translateSpeech.isPending;
  const error = offlineResult ? null : ((translateText.error ?? translateSpeech.error) as Error | null);


  const handleTranslateOffline = useCallback(() => {
    if (!text.trim()) return;
    setActiveTokenIndex(0);
    const result = translateTextOffline(text);
    setOfflineResult(result);
  }, [text]);

  // Clear offline result when text changes
  const handleTextChange = useCallback((val: string) => {
    setText(val);
    setOfflineResult(null);
  }, []);

  const hasResult = Boolean(active || offlineResult);
  const displayGloss = active?.gloss || offlineResult?.gloss || '';
  const displayTokens = active?.tokens ?? offlineResult?.tokens ?? [];
  const displayGestures = active?.gestures ?? offlineResult?.gestures ?? [];
  const displayInputText = active?.transcript || text;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 py-8 sm:py-14 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Offline-First Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.04)] text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#12CFF3]">
              <span className="w-2 h-2 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]" />
              <span>English → Indian Sign Language</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#062B5C] dark:text-white tracking-[-0.03em] leading-tight">
              Translate to <span className="text-[#0757E8] dark:text-[#12CFF3]">Sign Gestures</span>
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 max-w-lg">
              Convert written English or spoken audio into continuous, grammatically structured Indian Sign Language.
            </p>
          </div>

          {/* Offline Status Badge */}
          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Offline Ready</span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              On-device speech AI & local video assets
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
            <span>{error.message}</span>
            <button
              onClick={() => { translateText.reset(); translateSpeech.reset(); }}
              className="text-xs font-bold underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: INPUT CARD                                                     */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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

        {/* Pipeline Progression Indicator */}
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 py-1"
          >
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">English Text</span>
            <span className="text-[#0757E8]">→</span>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] border border-blue-200 dark:border-blue-900">ISL Gloss</span>
            <span className="text-[#0757E8]">→</span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">Sign Gestures</span>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: SIGN GLOSS CARD                                                */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {hasResult && displayGloss && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="sign-card"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#062B5C] dark:text-white">
                    Sign Gloss
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  NLP Grammatical Transformation
                </span>
              </div>

              {/* Gloss Display Typography */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                <div className="font-mono text-lg sm:text-xl font-bold tracking-wider text-[#062B5C] dark:text-white uppercase leading-relaxed break-words">
                  {displayGloss}
                </div>
                {displayInputText && (
                  <p className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-[#64748B] dark:text-slate-400">
                    Source text: &ldquo;{displayInputText}&rdquo;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SECTION 3: TOKEN SECTION                                                  */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {hasResult && displayTokens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="sign-card"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#062B5C] dark:text-white">
                    Tokens ({displayTokens.length})
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  Mapped to Sign Database
                </span>
              </div>

              {/* Token Chips */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <TokenChips
                  tokens={displayTokens}
                  activeIndex={activeTokenIndex}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SECTION 4: GESTURE PLAYBACK SECTION                                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="sign-card"
        >
          <GestureSequencePlayer
            gestures={displayGestures}
            tokens={displayTokens}
            onIndexChange={setActiveTokenIndex}
            loading={isLoading}
          />
        </motion.div>

      </div>
    </div>
  );
}

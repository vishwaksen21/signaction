'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Languages,
  Square,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Hand,
  WifiOff,
  Layers,
} from 'lucide-react';
import { GestureSequencePlayer } from '../gesture-sequence-player';
import { TokenChips } from '../token-chips';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';
import { translateTextOffline } from '../../lib/offline-translate';
import { convertToWav16kHz } from '../../lib/audio-wav';
import { isNativeApk } from '../../lib/platform';

const SAMPLE_TEXT_CHIPS = [
  'Hello',
  'Thank you',
  'Where is the doctor?',
  'Help me please',
  'What is your name?',
  'Good morning',
];

export function MobileTranslatorScreen() {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [text, setText] = useState('');
  const [activeTokenIdx, setActiveTokenIdx] = useState(0);
  const [offlineResult, setOfflineResult] = useState<any>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const translateTextMutation = useTranslateText();
  const translateSpeechMutation = useTranslateSpeech();

  const executeTranslation = useCallback(
    (inputText: string) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;

      translateSpeechMutation.reset();
      setOfflineResult(null);
      setActiveTokenIdx(0);

      translateTextMutation.mutate(
        { text: trimmed },
        {
          onError: () => {
            // Automatic offline fallback
            const res = translateTextOffline(trimmed);
            setOfflineResult(res);
          },
        }
      );
    },
    [translateSpeechMutation, translateTextMutation]
  );

  // Read URL query params on mount (e.g., ?text=... or ?mode=voice)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlText = params.get('text');
      const urlMode = params.get('mode');

      if (urlMode === 'voice') {
        setMode('voice');
      }

      if (urlText) {
        setText(urlText);
        executeTranslation(urlText);
      }
    }
  }, [executeTranslation]);

  // Cleanup media recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeTranslation(text);
  };

  const handleStartVoiceRecording = async () => {
    setVoiceError(null);
    audioChunksRef.current = [];

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Microphone not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      const mimeType =
        typeof MediaRecorder !== 'undefined'
          ? preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
          : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);

        try {
          const actualMime = recorder.mimeType || mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: actualMime });
          if (blob.size === 0) {
            setVoiceError('No speech was captured. Please speak clearly and try again.');
            return;
          }

          const rawFile = new File([blob], 'voice_input.webm', { type: actualMime });
          const wavFile = await convertToWav16kHz(rawFile);

          translateTextMutation.reset();
          setOfflineResult(null);
          setActiveTokenIdx(0);

          translateSpeechMutation.mutate({ file: wavFile });
        } catch {
          setVoiceError('Could not process audio recording. Please retry.');
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      const isDenied =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setVoiceError(
        isDenied
          ? 'Microphone permission denied. Enable microphone access in Android settings.'
          : 'Unable to access microphone. Please check permissions.'
      );
    }
  };

  const handleStopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const activeData = translateSpeechMutation.data ?? translateTextMutation.data ?? offlineResult;
  const isLoading = translateTextMutation.isPending || translateSpeechMutation.isPending;
  const isError =
    !offlineResult &&
    ((translateTextMutation.error ?? translateSpeechMutation.error) as Error | null);

  const gestures = activeData?.gestures ?? [];
  const tokens = activeData?.tokens ?? [];
  const gloss = activeData?.gloss ?? '';
  const transcript = activeData?.transcript ?? (mode === 'text' ? text : '');

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8">
      {/* 1. Mode Switcher Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/40 dark:border-white/10 select-none">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-[transform,background-color,color] duration-140 active:scale-97 ${
            mode === 'text'
              ? 'bg-white dark:bg-slate-800 text-[#0757E8] dark:text-[#12CFF3] shadow-xs'
              : 'text-[#60759A] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white'
          }`}
        >
          <Languages size={15} />
          <span>Text Translation</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-[transform,background-color,color] duration-140 active:scale-97 ${
            mode === 'voice'
              ? 'bg-white dark:bg-slate-800 text-[#0757E8] dark:text-[#12CFF3] shadow-xs'
              : 'text-[#60759A] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white'
          }`}
        >
          <Mic size={15} />
          <span>Voice Translation</span>
        </button>
      </div>

      {/* 2. Input Box (Text or Voice) */}
      {mode === 'text' ? (
        <div className="bg-white dark:bg-[#07132C] rounded-3xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setOfflineResult(null);
              }}
              placeholder="Type English sentence to translate into Indian Sign Language..."
              className="w-full p-3 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-sm text-[#062B5C] dark:text-white placeholder-[#60759A] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0757E8] resize-none"
            />
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  setOfflineResult(null);
                }}
                className="absolute right-3 top-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[#60759A] dark:text-slate-300 hover:text-black flex items-center justify-center text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {SAMPLE_TEXT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setText(chip);
                  executeTranslation(chip);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-[#60759A] dark:text-slate-300 hover:text-[#0757E8] active:scale-95 transition-transform"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-[#60759A] dark:text-slate-400">
              {text.length} chars
            </span>

            <button
              type="button"
              onClick={() => handleTextSubmit()}
              disabled={isLoading || !text.trim()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0757E8] to-[#12CFF3] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 active:scale-97 transition-transform"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <span>Translate to Sign</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Voice Recording Box */
        <div className="bg-white dark:bg-[#07132C] rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#062B5C] dark:text-white">
              {isRecording ? 'Listening to speech...' : 'Tap to start recording'}
            </h3>
            <p className="text-xs text-[#60759A] dark:text-slate-400 max-w-xs">
              {isRecording
                ? 'Speak clearly near the microphone. Tap stop when finished.'
                : 'Supports offline Vosk WASM speech recognition.'}
            </p>
          </div>

          {/* Big Center Microphone Control with Pulse Ring */}
          <div className="relative flex items-center justify-center my-2">
            {isRecording && (
              <>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-500 -z-10"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-400 -z-10"
                />
              </>
            )}

            <button
              type="button"
              onClick={isRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl active:scale-93 transition-all duration-140 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-br from-[#0757E8] to-[#12CFF3] hover:from-[#064BD1] hover:to-[#0EBDE0]'
              }`}
            >
              {isRecording ? (
                <Square size={26} className="fill-current" />
              ) : (
                <Mic size={30} />
              )}
            </button>
          </div>

          {isRecording ? (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>RECORDING 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-[#60759A] dark:text-slate-400">
              {isLoading ? 'Processing speech with Vosk...' : '16 kHz Mono Audio'}
            </span>
          )}

          {voiceError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Translation Output & Gesture Player Stage */}
      {isLoading ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-3 border-[#0757E8] border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-[#062B5C] dark:text-white">
            Translating into Indian Sign Language...
          </span>
          <span className="text-xs text-[#60759A] dark:text-slate-400">
            Applying Subject-Object-Verb (SOV) grammatical rules
          </span>
        </div>
      ) : gestures.length > 0 ? (
        <div className="space-y-3">
          {/* Transcript & Gloss Header */}
          <div className="bg-white dark:bg-[#07132C] rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
            {transcript && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 block">
                  Input Sentence
                </span>
                <p className="text-xs font-medium text-[#062B5C] dark:text-white">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}

            {gloss && (
              <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
                    ISL Grammar Gloss (SOV)
                  </span>
                  <span className="text-[10px] font-mono text-[#60759A] dark:text-slate-400">
                    {tokens.length} {tokens.length === 1 ? 'gesture' : 'gestures'}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-[#062B5C] dark:text-white tracking-wide mt-0.5">
                  {gloss}
                </p>
              </div>
            )}
          </div>

          {/* Real Video Player Component */}
          <div className="bg-white dark:bg-[#07132C] rounded-3xl p-3 border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
            <GestureSequencePlayer
              gestures={gestures}
              tokens={tokens}
              onIndexChange={setActiveTokenIdx}
            />
          </div>

          {/* Synchronized Token Chips */}
          {tokens.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
                Playing Sequence
              </span>
              <TokenChips tokens={tokens} activeIndex={activeTokenIdx} />
            </div>
          )}
        </div>
      ) : isError ? (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={16} />
            <span>Translation Note</span>
          </div>
          <p>
            {isError.message || 'Could not complete online translation. Trying offline dictionary fallback...'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

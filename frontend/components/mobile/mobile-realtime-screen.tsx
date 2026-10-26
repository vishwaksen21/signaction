'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Sparkles,
  Wifi,
  WifiOff,
  RotateCcw,
  Volume2,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { GestureSequencePlayer } from '../gesture-sequence-player';
import { TokenChips } from '../token-chips';
import { translateSpeechOnce } from '../../lib/api';
import { convertToWav16kHz } from '../../lib/audio-wav';
import {
  isOfflineSTTReady,
  translateTextOffline,
} from '../../lib/offline-translate';
import { isNativeApk } from '../../lib/platform';

export function MobileRealtimeScreen() {
  const [running, setRunning] = useState(false);
  const [committedTranscript, setCommittedTranscript] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [gestures, setGestures] = useState<string[]>([]);
  const [gloss, setGloss] = useState<string>('');
  const [activeTokenIdx, setActiveTokenIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const native = isNativeApk();
    if (native) {
      setMode('offline');
    }
  }, []);

  // Cleanup on unmount
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

  const startListening = async () => {
    setError(null);
    chunksRef.current = [];

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not supported on this device.');
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
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setIsProcessing(true);

        try {
          const actualMime = recorder.mimeType || mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: actualMime });
          if (blob.size === 0) {
            setError('No speech was captured. Please hold or speak clearly and try again.');
            setIsProcessing(false);
            return;
          }

          const rawFile = new File([blob], 'live_speech.webm', { type: actualMime });
          const wavFile = await convertToWav16kHz(rawFile);

          if (mode === 'offline') {
            const { transcribeAudioFile } = await import('../../lib/vosk-stt');
            const recognized = (await transcribeAudioFile(wavFile)).trim();

            if (!recognized) {
              setError('No speech recognized. Please speak closer to the microphone.');
              setIsProcessing(false);
              return;
            }

            setCommittedTranscript(recognized);
            const offlineRes = translateTextOffline(recognized, { allowOnlineFallback: false });
            setTokens(offlineRes.tokens);
            setGestures(offlineRes.gestures);
            setGloss(offlineRes.gloss);
          } else {
            const res = await translateSpeechOnce(wavFile);
            setCommittedTranscript(res.transcript || '');
            setTokens(res.tokens || []);
            setGestures(res.gestures || []);
            setGloss(res.gloss || '');
          }
        } catch (err: any) {
          setError(
            err?.message || 'Could not recognize speech. Ensure you speak clearly and try again.'
          );
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(100);
      setRunning(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      const isDenied =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setError(
        isDenied
          ? 'Microphone permission denied. Please grant microphone access in Android settings.'
          : 'Unable to open microphone. Check device permissions.'
      );
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const handleReset = () => {
    setCommittedTranscript('');
    setTokens([]);
    setGestures([]);
    setGloss('');
    setError(null);
    setActiveTokenIdx(0);
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8">
      {/* 1. Header & Engine Mode Pill */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
            <Activity size={17} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#062B5C] dark:text-white">
              Live Speech Studio
            </h2>
            <span className="text-[10px] text-[#60759A] dark:text-slate-400">
              {mode === 'offline' ? 'Vosk On-Device WASM' : 'Cloud Neural API'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === 'offline' ? 'online' : 'offline')}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-[#062B5C] dark:text-white flex items-center gap-1 active:scale-95 transition-transform"
        >
          {mode === 'offline' ? (
            <>
              <WifiOff size={13} className="text-emerald-500" />
              <span>Offline Mode</span>
            </>
          ) : (
            <>
              <Wifi size={13} className="text-[#0757E8]" />
              <span>Cloud Mode</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Central Live Speech Recording Deck */}
      <div className="bg-white dark:bg-[#07132C] rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-extrabold text-[#062B5C] dark:text-white">
            {running
              ? 'Listening... Speak Now'
              : isProcessing
              ? 'Transcribing Speech...'
              : 'Tap to Speak'}
          </h3>
          <p className="text-xs text-[#60759A] dark:text-slate-400 max-w-xs">
            {running
              ? 'Speak an English sentence. Tap the red button to finish.'
              : 'Speak clearly into your microphone to generate ISL gestures.'}
          </p>
        </div>

        {/* Central Tactile Record Button with Wave Ripples */}
        <div className="relative flex items-center justify-center my-3">
          {running && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-red-500 -z-10"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1.35, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-red-400 -z-10"
              />
            </>
          )}

          <button
            type="button"
            onClick={running ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-92 transition-all duration-140 ${
              running
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-br from-[#0757E8] to-[#12CFF3] hover:from-[#064BD1] hover:to-[#0EBDE0]'
            }`}
          >
            {running ? (
              <Square size={32} className="fill-current" />
            ) : (
              <Mic size={36} />
            )}
          </button>
        </div>

        {running ? (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} • LISTENING</span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-[#60759A] dark:text-slate-400">
            {isProcessing ? 'Transcribing with Vosk AI...' : 'Tap circle to begin'}
          </span>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left w-full">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 3. Output Stage */}
      {committedTranscript && (
        <div className="bg-white dark:bg-[#07132C] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
              Recognized Speech
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#0757E8] dark:text-[#12CFF3] font-bold flex items-center gap-1 active:scale-95"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>
          <p className="text-sm font-semibold text-[#062B5C] dark:text-white">
            &ldquo;{committedTranscript}&rdquo;
          </p>

          {gloss && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3] block">
                ISL Gloss Syntax
              </span>
              <p className="text-xs font-mono font-bold text-[#062B5C] dark:text-white mt-0.5">
                {gloss}
              </p>
            </div>
          )}
        </div>
      )}

      {gestures.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#07132C] rounded-3xl p-3 border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
            <GestureSequencePlayer
              gestures={gestures}
              tokens={tokens}
              onIndexChange={setActiveTokenIdx}
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400">
              Gesture Sequence
            </span>
            <TokenChips tokens={tokens} activeIndex={activeTokenIdx} />
          </div>
        </div>
      )}
    </div>
  );
}

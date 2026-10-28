'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Square,
  Sparkles,
  Wifi,
  WifiOff,
  RotateCcw,
  AlertCircle,
  Activity,
  Play,
  Pause,
  Repeat,
} from 'lucide-react';
import { SignViewer } from '../sign-viewer';
import { translateSpeechOnce } from '../../lib/api';
import { convertToWav16kHz } from '../../lib/audio-wav';
import { translateTextOffline } from '../../lib/offline-translate';
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
  const [isPlaying, setIsPlaying] = useState(true);

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
            setError('No speech was captured. Please speak clearly and try again.');
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
            setActiveTokenIdx(0);
            setIsPlaying(true);
          } else {
            const res = await translateSpeechOnce(wavFile);
            setCommittedTranscript(res.transcript || '');
            setTokens(res.tokens || []);
            setGestures(res.gestures || []);
            setGloss(res.gloss || '');
            setActiveTokenIdx(0);
            setIsPlaying(true);
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

  const handleVideoEnded = () => {
    setActiveTokenIdx((prev) => {
      if (prev + 1 < gestures.length) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  };

  const currentGestureUrl = gestures[activeTokenIdx] ?? null;

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none">
      {/* 1. Header & Engine Mode Pill */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5]/15 to-[#06B6D4]/15 border border-violet-500/20 text-violet-600 dark:text-cyan-400 flex items-center justify-center">
            <Activity size={17} />
          </div>
          <div>
            <h2 className="text-xs font-heading font-bold text-slate-900 dark:text-white">
              Live Speech Studio
            </h2>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {mode === 'offline' ? 'Vosk On-Device WASM' : 'Cloud Neural API'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === 'offline' ? 'online' : 'offline')}
          className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#1E293B] border border-slate-900/[0.06] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          {mode === 'offline' ? (
            <>
              <WifiOff size={13} className="text-emerald-500" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <Wifi size={13} className="text-violet-500" />
              <span>Cloud</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Instant Continuous Sign Playback Stage (if translated) */}
      {gestures.length > 0 && currentGestureUrl && (
        <div className="space-y-2">
          <div className="relative aspect-video w-full rounded-3xl bg-slate-950 border border-slate-900/[0.08] dark:border-white/[0.1] shadow-xl overflow-hidden flex items-center justify-center">
            <SignViewer
              key={`${currentGestureUrl}-${activeTokenIdx}`}
              url={currentGestureUrl}
              playing={isPlaying}
              onEnded={handleVideoEnded}
            />

            {/* Token Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                {tokens[activeTokenIdx] || `SIGN ${activeTokenIdx + 1}`}
              </span>
            </div>

            {/* Sequence Counter */}
            <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-slate-300">
              {activeTokenIdx + 1} / {gestures.length}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20">
              <div
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] transition-all duration-300"
                style={{
                  width: `${((activeTokenIdx + 1) / gestures.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Central Reactive Audio Visualizer Orb / Waveform Deck */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
            {running
              ? 'Listening to Speech...'
              : isProcessing
              ? 'Synthesizing with Vosk AI...'
              : 'Tap Orb to Speak'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {running
              ? 'Speak an English sentence clearly. Tap stop when finished.'
              : 'Voice recognition runs 100% locally on your device.'}
          </p>
        </div>

        {/* Reactive Audio Visualizer Orb with Breathing Halo Rings */}
        <div className="relative flex items-center justify-center my-4">
          {running && (
            <>
              {/* Outer pulsing wave */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] -z-10 blur-xs"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1.35, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] -z-10"
              />
            </>
          )}

          {/* Core Visualizer Button */}
          <button
            type="button"
            onClick={running ? stopListening : startListening}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-all duration-150 ${
              running
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                : 'bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] shadow-violet-500/40 hover:scale-105'
            }`}
          >
            {running ? (
              <Square size={30} className="fill-current" />
            ) : (
              <Mic size={34} />
            )}
          </button>
        </div>

        {running ? (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} • STREAMING AUDIO</span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {isProcessing ? 'Processing audio with Vosk WASM...' : '16 kHz Mono • Offline Speech AI'}
          </span>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left w-full">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Live Streaming Transcript & Gloss Highlighting Deck */}
      {committedTranscript && (
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recognized Speech
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-violet-600 dark:text-cyan-400 font-bold flex items-center gap-1 active:scale-95"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            &ldquo;{committedTranscript}&rdquo;
          </p>

          {gloss && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-cyan-400 block">
                ISL Gloss Tokens (SOV)
              </span>

              {/* Clickable Gloss Tokens */}
              <div className="flex flex-wrap items-center gap-1.5">
                {tokens.map((tok, idx) => {
                  const isActive = idx === activeTokenIdx;
                  return (
                    <button
                      key={`${tok}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveTokenIdx(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all duration-150 active:scale-95 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-slate-900/[0.04] dark:border-white/[0.06]'
                      }`}
                    >
                      [{tok}]
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

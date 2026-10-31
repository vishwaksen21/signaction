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
import { DualBufferGesturePlayer } from '../dual-buffer-gesture-player';
import { triggerHaptic } from '@/lib/haptics';
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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none bg-[#E2E8F0] dark:bg-[#0F172A]">
      {/* 1. Header & Engine Mode Pill */}
      <div className="nm-flat rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl nm-inset text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Activity size={17} />
          </div>
          <div>
            <h2 className="text-xs font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
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
          className="nm-inset active:nm-convex px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          {mode === 'offline' ? (
            <>
              <WifiOff size={13} className="text-emerald-500" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <Wifi size={13} className="text-indigo-500" />
              <span>Cloud</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Instant Continuous Sign Playback Stage: Recessed Bevel Frame */}
      {gestures.length > 0 && (
        <div className="space-y-2">
          <div className="relative aspect-video w-full rounded-3xl nm-inset p-2.5 overflow-hidden flex items-center justify-center">
            <div className="w-full h-full rounded-[18px] overflow-hidden">
              <DualBufferGesturePlayer
                gestures={gestures}
                tokens={tokens}
                currentIndex={activeTokenIdx}
                onIndexChange={setActiveTokenIdx}
                showControls={true}
                autoPlay={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Central Reactive Audio Orb Well & Waveform Deck */}
      <div className="nm-flat rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">
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

        {/* Circular Debossed Basin (w-48 h-48) with Raised Convex Core Knob */}
        <div className="relative nm-inset rounded-full w-48 h-48 flex items-center justify-center my-3">
          {running && (
            <>
              {/* Outer pulsing wave */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                className="absolute inset-2 rounded-full bg-indigo-500 -z-10 opacity-40 blur-xs"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1.25, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.35, ease: 'easeOut' }}
                className="absolute inset-4 rounded-full bg-violet-500 -z-10 opacity-30"
              />
            </>
          )}

          {/* Core Raised Convex Visualizer Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (running) {
                stopListening();
              } else {
                startListening();
              }
            }}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center text-white nm-convex active:nm-inset active:scale-95 transition-all duration-150 ${
              running
                ? 'bg-red-500 hover:bg-red-600 shadow-md'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 nm-led-indigo'
            }`}
          >
            {running ? (
              <Square size={28} className="fill-current" />
            ) : (
              <Mic size={32} />
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
          <div className="p-3.5 rounded-2xl nm-inset text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left w-full">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Streaming Transcript Box: Recessed Terminal Display */}
      {committedTranscript && (
        <div className="nm-inset rounded-2xl p-4 font-mono space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Terminal Transcript
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleReset();
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 active:scale-95"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>

          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
            &ldquo;{committedTranscript}&rdquo;
          </p>

          {gloss && (
            <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800/60 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                ISL Gloss Tokens (SOV)
              </span>

              {/* Clickable Gloss Keycaps */}
              <div className="flex flex-wrap items-center gap-1.5">
                {tokens.map((tok, idx) => {
                  const isActive = idx === activeTokenIdx;
                  return (
                    <button
                      key={`${tok}-${idx}`}
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setActiveTokenIdx(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 active:scale-95 ${
                        isActive
                          ? 'nm-inset text-indigo-600 dark:text-indigo-400 nm-led-indigo font-black'
                          : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
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

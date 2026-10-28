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
  Play,
  Pause,
  Repeat,
  ArrowRight,
  Hand,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { SignViewer } from '../sign-viewer';
import { useTranslateText, useTranslateSpeech } from '../../hooks/use-translate';
import { translateTextOffline } from '../../lib/offline-translate';
import { convertToWav16kHz } from '../../lib/audio-wav';

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
  const [offlineResult, setOfflineResult] = useState<any>(null);

  // Cinema stage playback state
  const [activeGestureIdx, setActiveGestureIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isGlossOpen, setIsGlossOpen] = useState(true);

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

  const activeData = translateSpeechMutation.data ?? translateTextMutation.data ?? offlineResult;
  const isLoading = translateTextMutation.isPending || translateSpeechMutation.isPending;
  const isError =
    !offlineResult &&
    ((translateTextMutation.error ?? translateSpeechMutation.error) as Error | null);

  const gestures: string[] = activeData?.gestures ?? [];
  const tokens: string[] = activeData?.tokens ?? [];
  const gloss: string = activeData?.gloss ?? '';
  const transcript: string = activeData?.transcript ?? (mode === 'text' ? text : '');

  const executeTranslation = useCallback(
    (inputText: string) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;

      translateSpeechMutation.reset();
      setOfflineResult(null);
      setActiveGestureIdx(0);
      setIsPlaying(true);

      translateTextMutation.mutate(
        { text: trimmed },
        {
          onError: () => {
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

  // Reset index whenever new gestures arrive
  const gestureCount = gestures.length;
  useEffect(() => {
    setActiveGestureIdx(0);
    setIsPlaying(gestureCount > 0);
  }, [gestureCount]);

  // Advance to next video in chain
  const handleVideoEnded = useCallback(() => {
    setActiveGestureIdx((prev) => {
      const next = prev + 1;
      if (next >= gestures.length) {
        if (isLooping) {
          return 0;
        }
        setIsPlaying(false);
        return prev;
      }
      return next;
    });
  }, [gestures.length, isLooping]);

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
          setActiveGestureIdx(0);
          setIsPlaying(true);

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

  const currentGestureUrl = gestures[activeGestureIdx] ?? null;
  const currentToken = tokens[activeGestureIdx] ?? (gestures.length > 0 ? `SIGN ${activeGestureIdx + 1}` : '');

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none">
      {/* 1. Top Segmented Pill Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-200/60 dark:bg-[#111827]/80 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
            mode === 'text'
              ? 'bg-white dark:bg-[#1E293B] text-violet-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Languages size={15} />
          <span>Text Translation</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
            mode === 'voice'
              ? 'bg-white dark:bg-[#1E293B] text-violet-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Mic size={15} />
          <span>Voice Translation</span>
        </button>
      </div>

      {/* 2. The ISL Gesture Stage (Centerpiece - Top of viewport, Never Empty) */}
      <div className="space-y-2">
        <div className="relative aspect-video w-full rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-slate-900/[0.08] dark:border-white/[0.1] shadow-xl overflow-hidden flex flex-col justify-between">
          {isLoading ? (
            /* Loading State */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 bg-slate-950/80 backdrop-blur-sm">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] items-center justify-center text-white">
                  <Sparkles size={20} className="animate-spin" />
                </span>
              </div>
              <div>
                <p className="text-sm font-heading font-bold text-white">
                  Synthesizing Gesture Sequence...
                </p>
                <p className="text-[11px] font-mono text-cyan-300/80 mt-0.5">
                  Parsing SVO to SOV grammar syntax
                </p>
              </div>
            </div>
          ) : gestures.length > 0 && currentGestureUrl ? (
            /* Active Video Playback State */
            <>
              <div className="relative w-full h-full flex items-center justify-center">
                <SignViewer
                  key={`${currentGestureUrl}-${activeGestureIdx}`}
                  url={currentGestureUrl}
                  playing={isPlaying}
                  onEnded={handleVideoEnded}
                  playbackRate={playbackSpeed}
                  loop={isLooping && gestures.length === 1}
                />

                {/* Gesture Token Badge Watermark */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {currentToken}
                  </span>
                </div>

                {/* Sequence Counter */}
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-semibold text-slate-300">
                  {activeGestureIdx + 1} / {gestures.length}
                </div>

                {/* Overlaid Play/Pause Button in Center */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="absolute z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Play video"
                  >
                    <Play size={22} className="ml-0.5 fill-current" />
                  </button>
                )}
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-2">
                {/* Progress bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] transition-all duration-300"
                    style={{
                      width: `${((activeGestureIdx + 1) / gestures.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Play/Pause & Replay */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveGestureIdx(0);
                      setIsPlaying(true);
                    }}
                    className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"
                    title="Replay sequence from start"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {/* Speed & Loop Toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(playbackSpeed === 1.0 ? 0.5 : 1.0)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                      playbackSpeed === 0.5
                        ? 'bg-violet-500/80 border-violet-400 text-white shadow-xs'
                        : 'bg-white/15 border-white/20 text-slate-200'
                    }`}
                  >
                    {playbackSpeed === 0.5 ? '0.5x Slow-Mo' : '1.0x'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-colors ${
                      isLooping
                        ? 'bg-cyan-500/80 border-cyan-400 text-white shadow-xs'
                        : 'bg-white/15 border-white/20 text-slate-200'
                    }`}
                    title={isLooping ? 'Loop enabled' : 'Loop disabled'}
                  >
                    <Repeat size={13} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Idle State: Dedicated Neural Silhouette Stage */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              {/* Neural Hand-Mesh Ambient Graphic */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F46E5]/20 via-[#7C3AED]/20 to-[#06B6D4]/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.25)]">
                <Hand size={32} className="text-cyan-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#06B6D4]" />
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-heading font-bold text-white">
                  ISL Gesture Stage
                </p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Enter text or speak below to synthesize the Indian Sign Language gesture sequence.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-white/10 backdrop-blur-md text-cyan-300 border border-white/10">
                <Sparkles size={11} />
                <span>349 Offline Signs Loaded</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. AI Grammar Gloss Visualizer (The "AI Magic" Layer) */}
      {tokens.length > 0 && (
        <div className="rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsGlossOpen(!isGlossOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-cyan-400">
                SVO → SOV Neural Gloss
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({tokens.length} {tokens.length === 1 ? 'gesture' : 'gestures'})
              </span>
            </div>
            {isGlossOpen ? (
              <ChevronUp size={15} className="text-slate-400" />
            ) : (
              <ChevronDown size={15} className="text-slate-400" />
            )}
          </button>

          {isGlossOpen && (
            <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-slate-100 dark:border-white/[0.04]">
              {transcript && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  &ldquo;{transcript}&rdquo;
                </p>
              )}

              {/* Clickable Token Chips: Tapping replays that specific sign */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {tokens.map((tok, idx) => {
                  const isActive = idx === activeGestureIdx;
                  return (
                    <button
                      key={`${tok}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveGestureIdx(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all duration-150 active:scale-95 flex items-center gap-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:border-violet-500/40 border border-slate-900/[0.04] dark:border-white/[0.06]'
                      }`}
                    >
                      <span>[{tok}]</span>
                      {idx < tokens.length - 1 && (
                        <span className="text-slate-400 font-normal ml-0.5">→</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Tap any token chip to jump directly to that sign video.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Composer Card (Text or Voice Mode) */}
      {mode === 'text' ? (
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setOfflineResult(null);
              }}
              placeholder="Type English sentence to synthesize into Indian Sign Language..."
              className="w-full p-3.5 pr-8 rounded-2xl bg-slate-50/80 dark:bg-[#1E293B]/70 border border-slate-900/[0.06] dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition-all"
            />
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  setOfflineResult(null);
                }}
                className="absolute right-3 top-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-black dark:text-slate-300 dark:hover:text-white flex items-center justify-center text-xs"
                aria-label="Clear input"
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
                className="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-cyan-300 active:scale-95 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-slate-400">
              {text.length} characters
            </span>

            <button
              type="button"
              onClick={() => handleTextSubmit()}
              disabled={isLoading || !text.trim()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.35)] disabled:opacity-50 active:scale-[0.98] transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Synthesize Sign</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Voice Mode Recording Card */
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-1">
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
              {isRecording ? 'Listening to speech...' : 'Tap to Start Voice Recording'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              {isRecording
                ? 'Speak clearly into the microphone. Tap red button when finished.'
                : '100% on-device Vosk offline speech recognition.'}
            </p>
          </div>

          {/* Center Mic Button with Pulsing Ring */}
          <div className="relative flex items-center justify-center my-2">
            {isRecording && (
              <>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-500 -z-10"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-400 -z-10"
                />
              </>
            )}

            <button
              type="button"
              onClick={isRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all duration-150 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4]'
              }`}
            >
              {isRecording ? (
                <Square size={24} className="fill-current" />
              ) : (
                <Mic size={28} />
              )}
            </button>
          </div>

          {isRecording ? (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>RECORDING 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {isLoading ? 'Processing speech with Vosk...' : '16 kHz Mono Audio'}
            </span>
          )}

          {voiceError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={15} />
            <span>Translation Note</span>
          </div>
          <p>
            {isError.message || 'Could not complete online translation. Trying offline fallback...'}
          </p>
        </div>
      )}
    </div>
  );
}

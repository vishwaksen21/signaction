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
import { DualBufferGesturePlayer } from '../dual-buffer-gesture-player';
import { triggerHaptic } from '@/lib/haptics';
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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none bg-[#E2E8F0] dark:bg-[#0F172A]">
      {/* 1. Top Segmented Pill Switcher: Recessed Track & Extruded Active Slider */}
      <div className="nm-inset rounded-full p-1.5 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
            mode === 'text'
              ? 'nm-flat text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Languages size={15} />
          <span>Text Translation</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
            mode === 'voice'
              ? 'nm-flat text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Mic size={15} />
          <span>Voice Translation</span>
        </button>
      </div>

      {/* 2. The ISL Gesture Stage: Recessed Bevel Frame */}
      <div className="space-y-2">
        <div className="relative aspect-video w-full rounded-3xl nm-inset p-2.5 overflow-hidden flex flex-col justify-between">
          {isLoading ? (
            /* Loading State */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 bg-slate-950/80 backdrop-blur-sm rounded-[22px]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white">
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
          ) : gestures.length > 0 ? (
            /* Active Zero-Flicker Dual-Buffer Playback State flush within bezel */
            <div className="w-full h-full rounded-[18px] overflow-hidden relative">
              <DualBufferGesturePlayer
                gestures={gestures}
                tokens={tokens}
                currentIndex={activeGestureIdx}
                onIndexChange={setActiveGestureIdx}
                playbackSpeed={playbackSpeed}
                loop={isLooping}
                onSpeedChange={setPlaybackSpeed}
                onLoopChange={setIsLooping}
                autoPlay={isPlaying}
                showControls={true}
              />
            </div>
          ) : (
            /* Idle State: Dedicated Neural Silhouette Stage */
            <div className="w-full h-full rounded-[18px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
              {/* Neural Hand-Mesh Ambient Graphic */}
              <div className="relative w-16 h-16 rounded-2xl nm-flat flex items-center justify-center nm-led-indigo">
                <Hand size={30} className="text-indigo-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981] nm-led-emerald" />
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

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-white/10 text-indigo-300 border border-white/10">
                <Sparkles size={11} />
                <span>349 Offline Signs Loaded</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. AI Grammar Gloss Visualizer: Extruded Keycaps */}
      {tokens.length > 0 && (
        <div className="nm-flat rounded-2xl overflow-hidden p-3.5 space-y-2.5">
          <button
            type="button"
            onClick={() => setIsGlossOpen(!isGlossOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
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
            <div className="space-y-2.5 pt-1 border-t border-slate-300/40 dark:border-slate-800/60">
              {transcript && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  &ldquo;{transcript}&rdquo;
                </p>
              )}

              {/* Clickable Token Chips: Extruded Physical Keycaps */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {tokens.map((tok, idx) => {
                  const isActive = idx === activeGestureIdx;
                  return (
                    <button
                      key={`${tok}-${idx}`}
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setActiveGestureIdx(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 active:scale-95 flex items-center gap-1 ${
                        isActive
                          ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-black nm-led-indigo'
                          : 'nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300'
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
                Tap any keycap to replay that gesture token.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Composer Card: Extruded Chassis & Inset Basin */}
      {mode === 'text' ? (
        <div className="nm-flat rounded-3xl p-4 space-y-3.5">
          <div className="relative">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setOfflineResult(null);
              }}
              placeholder="Type English sentence to synthesize into Indian Sign Language..."
              className="w-full p-3.5 pr-8 rounded-2xl nm-inset text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none transition-all"
            />
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  setOfflineResult(null);
                }}
                className="absolute right-3 top-3 w-6 h-6 rounded-full nm-flat active:nm-inset text-slate-500 dark:text-slate-300 flex items-center justify-center text-xs"
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick suggestions: Tactile Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {SAMPLE_TEXT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setText(chip);
                  executeTranslation(chip);
                }}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium nm-flat hover:nm-concave active:nm-inset text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {text.length} characters
            </span>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleTextSubmit();
              }}
              disabled={isLoading || !text.trim()}
              className="px-5 py-2.5 rounded-2xl nm-convex active:nm-inset text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
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
        <div className="nm-flat rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-1">
            <h3 className="text-base font-heading font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              {isRecording ? 'Listening to speech...' : 'Tap to Start Voice Recording'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              {isRecording
                ? 'Speak clearly into the microphone. Tap red button when finished.'
                : '100% on-device Vosk offline speech recognition.'}
            </p>
          </div>

          {/* Center Mic Button in Debossed Basin */}
          <div className="relative flex items-center justify-center my-2 p-3 nm-inset rounded-full">
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
              onClick={() => {
                triggerHaptic(10);
                if (isRecording) {
                  handleStopVoiceRecording();
                } else {
                  handleStartVoiceRecording();
                }
              }}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white nm-convex active:nm-inset active:scale-95 transition-all duration-150 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 shadow-md'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 nm-led-indigo'
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
            <div className="p-3 rounded-2xl nm-inset text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-2xl nm-inset text-xs text-amber-700 dark:text-amber-300 space-y-1">
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

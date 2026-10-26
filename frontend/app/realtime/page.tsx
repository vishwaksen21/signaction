'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Square,
  Activity,
  FileText,
  Hand,
  Volume2,
  WifiOff,
  Wifi,
  Download,
  Loader2,
  Check,
} from 'lucide-react';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { translateSpeechOnce } from '../../lib/api';
import { convertToWav16kHz } from '../../lib/audio-wav';
import {
  isOfflineSTTReady,
  downloadSTTModel,
  translateTextOffline,
} from '../../lib/offline-translate';
import type { ModelDownloadProgress } from '../../lib/offline-translate';
import { isNativeApk, useIsMobileApp } from '../../lib/platform';
import { MobileRealtimeScreen } from '../../components/mobile/mobile-realtime-screen';

type Mode = 'online' | 'offline';

export default function RealtimePage() {
  const isMobileApp = useIsMobileApp();
  const [mode, setMode] = useState<Mode>('online');
  const [running, setRunning] = useState(false);
  const [committedTranscript, setCommittedTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [gestures, setGestures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);

  // Offline model state
  const [modelReady, setModelReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const mediaRecorderRef = useRef<{ stop: () => void } | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inFlightRef = useRef(false);

  const transcript = [committedTranscript, partialTranscript]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Check if offline model is ready on mount, defaulting to offline if native or offline
  useEffect(() => {
    const native = isNativeApk();
    setIsNative(native);
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (native || isOffline) {
      setMode('offline');
      if (native) setModelReady(true);
    }
    isOfflineSTTReady().then((ready) => {
      setModelReady(ready || native);
      if ((ready || native) && (native || isOffline)) {
        setMode('offline');
      }
    }).catch(() => {});
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setPartialTranscript('');
    inFlightRef.current = false;
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    mediaRecorderRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    };
  }, []);

  const handleModeChange = useCallback(
    (nextMode: Mode) => {
      if (running) {
        stop();
      }
      setError(null);
      setMode(nextMode);
    },
    [running, stop]
  );

  const handleDownloadModel = useCallback(async () => {
    if (running) {
      stop();
    }
    setDownloading(true);
    setDownloadProgress(0);
    setError(null);
    try {
      await downloadSTTModel((progress: ModelDownloadProgress) => {
        setDownloadProgress(progress.percent);
      });
      setModelReady(true);
      setMode('offline');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }, [running, stop]);

  async function start() {
    setError(null);
    setCommittedTranscript('');
    setPartialTranscript('');
    setTokens([]);
    setGestures([]);

    const native = isNativeApk();
    if (mode === 'offline' && !modelReady && !native) {
      setError('Download the offline speech model first to transcribe on-device.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not available in this browser or context.');
      return;
    }

    try {
      if (mode === 'online') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
        const mimeType =
          typeof MediaRecorder !== 'undefined'
            ? preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
            : '';
        const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        chunksRef.current = [];
        inFlightRef.current = false;

        rec.ondataavailable = async (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }

          if (inFlightRef.current) return;

          const actualMime = rec.mimeType || mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: actualMime });

          // Only send if blob is large enough to contain header + meaningful speech
          if (blob.size < 1500) return;

          inFlightRef.current = true;
          try {
            const ext = actualMime.includes('mp4')
              ? 'm4a'
              : actualMime.includes('ogg')
                ? 'ogg'
                : 'webm';
            const rawFile = new File([blob], `chunk.${ext}`, { type: actualMime });
            const wavFile = await convertToWav16kHz(rawFile);
            const res = await translateSpeechOnce(wavFile);

            const newTranscript = (res.transcript || '').trim();
            if (newTranscript) {
              setCommittedTranscript(newTranscript);
              setTokens(res.tokens);
              setGestures(res.gestures);
              setError(null);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Ignore empty silence chunks during live streaming
            if (!msg.toLowerCase().includes('no speech detected')) {
              setError(msg);
            }
          } finally {
            inFlightRef.current = false;
          }
        };

        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorderRef.current = {
          stop: () => {
            try {
              if (rec.state !== 'inactive') {
                rec.stop();
              }
            } catch {
              // ignore
            }
            stream.getTracks().forEach((t) => t.stop());
          },
        };

        rec.start(2500);
        setRunning(true);
      } else {
        // Offline mode: use Vosk WASM in browser (manages its own single mic stream)
        const { createVoskSTT } = await import('../../lib/vosk-stt');

        const stt = await createVoskSTT({
          onPartial: (text) => {
            setPartialTranscript(text);
          },
          onResult: (text) => {
            setPartialTranscript('');
            const clean = text.trim();
            if (!clean) return;
            setCommittedTranscript((prev) => (prev ? `${prev} ${clean}` : clean));
            const result = translateTextOffline(clean, { allowOnlineFallback: false });
            setTokens(result.tokens);
            setGestures(result.gestures);
          },
          onError: (err) => {
            setError(err.message);
          },
        });

        mediaRecorderRef.current = {
          stop: () => {
            stt.stop();
            stt.destroy();
          },
        };

        await stt.start();
        setRunning(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to access microphone'
      );
    }
  }

  if (isMobileApp) {
    return <MobileRealtimeScreen />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 py-8 sm:py-14 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.04)] text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#12CFF3]">
              <span className="w-2 h-2 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]" />
              <span>Real-Time Audio Stream</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#062B5C] dark:text-white tracking-[-0.03em] leading-tight">
              Live Speech to <span className="text-[#0757E8] dark:text-[#12CFF3]">Signs</span>
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 max-w-lg">
              {mode === 'online'
                ? 'Stream voice audio continuously to generate instant sign gestures in real time.'
                : 'Process speech recognition 100% on your device via Vosk for total privacy.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Offline model status */}
            {mode === 'offline' && (modelReady || isNative) && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
                <Check size={12} className="stroke-[3]" />
                <span>Model Ready</span>
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex items-center bg-[#F0F4F8] dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-full p-1 shadow-2xs">
              {!isNative && (
                <button
                  type="button"
                  onClick={() => handleModeChange('online')}
                  className={`flex items-center gap-1.5 min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    mode === 'online'
                      ? 'bg-[#0757E8] text-white shadow-xs'
                      : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
                  }`}
                >
                  <Wifi size={13} />
                  Online
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!modelReady && !isNative) {
                    handleDownloadModel();
                  } else {
                    handleModeChange('offline');
                  }
                }}
                className={`flex items-center gap-1.5 min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === 'offline'
                    ? 'bg-[#0757E8] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
                }`}
              >
                <WifiOff size={13} />
                100% Offline
              </button>
            </div>
          </div>
        </div>

        {/* Download banner for offline mode (Web only; APK has it bundled) */}
        {mode === 'offline' && !modelReady && !isNative && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-[#0757E8] dark:text-[#12CFF3] shadow-xs shrink-0">
                  <Download size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-base font-bold text-[#062B5C] dark:text-white mb-1">
                    Download On-Device Speech Model (~40MB)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mb-3">
                    Enables on-device speech recognition without network access. Downloaded once and cached securely in your browser.
                  </p>
                  {downloading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Downloading model... {downloadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#0757E8] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleDownloadModel}
                      className="btn-sign-primary text-xs px-5 py-2 shadow-xs"
                    >
                      <Download size={14} className="mr-1.5" />
                      Download Model
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="sign-card flex flex-col justify-between">
            <div>
              {/* LIVE Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-900/50 text-[#0757E8] dark:text-[#12CFF3] text-xs font-bold tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0757E8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0757E8]"></span>
                </span>
                LIVE LISTENING
              </div>

              {/* Title */}
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white tracking-tight mb-2">
                Voice Input
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mb-8 leading-relaxed">
                {mode === 'online'
                  ? 'Speak naturally into your microphone to continuously transcribe speech into sign gestures.'
                  : 'Speak naturally into your microphone. Audio stays private on your device.'}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                <button
                  onClick={start}
                  disabled={running}
                  className="btn-sign-primary flex items-center justify-center gap-2 px-7 py-3.5 text-sm min-h-[48px] w-full sm:w-auto"
                >
                  <Mic size={17} />
                  <span>Start Listening</span>
                </button>
                <button
                  onClick={stop}
                  disabled={!running}
                  className="btn-sign-secondary flex items-center justify-center gap-2 px-6 py-3.5 text-sm min-h-[48px] w-full sm:w-auto"
                >
                  <Square size={15} />
                  <span>Stop</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm">
                  {error}
                </div>
              )}

              {/* Live Transcript Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#0757E8]" />
                    <span>Live Transcript</span>
                  </div>
                  {mode === 'offline' && (
                    <span className="text-[10px] font-semibold bg-blue-50 text-[#0757E8] px-2.5 py-0.5 rounded-full border border-blue-200/80">
                      ON-DEVICE
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-900 p-6 min-h-[160px] md:min-h-[200px] flex flex-col justify-between relative overflow-hidden">
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      transcript
                        ? 'text-[#062B5C] dark:text-white font-medium'
                        : 'text-[#64748B] dark:text-slate-400 italic'
                    }`}
                  >
                    {transcript || 'Listening for speech… Click Start to begin recording.'}
                  </p>

                  {/* Waveform Animation */}
                  {running && (
                    <div className="absolute inset-x-0 bottom-12 h-14 flex items-center justify-center gap-1 opacity-25 pointer-events-none">
                      {[...Array(32)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-[#0757E8] rounded-full"
                          animate={{
                            height: [
                              Math.random() * 8 + 8,
                              Math.random() * 45 + 15,
                              Math.random() * 8 + 8,
                            ],
                          }}
                          transition={{
                            duration: 0.4 + Math.random() * 0.4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Status Bar */}
                  <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {running ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Active audio stream
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="text-[#64748B] dark:text-slate-400">
                            Idle
                          </span>
                        </>
                      )}
                    </div>
                    {running && (
                      <Activity size={16} className="text-[#0757E8] animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output Sequence */}
          <div className="sign-card flex flex-col justify-between">
            <div>
              {/* Output Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Hand size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
                      Gesture Output
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Synchronized sequence
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-900/50 rounded-full">
                  <span className="text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                    {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'}
                  </span>
                </div>
              </div>

              {/* Gesture Sequence Player Component */}
              <div className="flex-1">
                <GestureSequencePlayer gestures={gestures} tokens={tokens} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

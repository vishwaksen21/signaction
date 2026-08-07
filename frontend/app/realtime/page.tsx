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
import {
  isOfflineSTTReady,
  downloadSTTModel,
  translateTextOffline,
} from '../../lib/offline-translate';
import type { ModelDownloadProgress } from '../../lib/offline-translate';

type Mode = 'online' | 'offline';

export default function RealtimePage() {
  const [mode, setMode] = useState<Mode>('online');
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [gestures, setGestures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Offline model state
  const [modelReady, setModelReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check if offline model is ready on mount
  useEffect(() => {
    isOfflineSTTReady().then(setModelReady).catch(() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const handleDownloadModel = useCallback(async () => {
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
  }, []);

  async function start() {
    setError(null);
    setTranscript('');
    setTokens([]);
    setGestures([]);

    if (mode === 'offline' && !modelReady) {
      setError('Download the offline model first.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mode === 'online') {
        // Online mode: send chunks to server API
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
        const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        mediaRecorderRef.current = rec;
        chunksRef.current = [];

        rec.ondataavailable = async (e) => {
          chunksRef.current.push(e.data);

          // Create blob from ALL accumulated chunks (WebM needs header at start)
          const blob = new Blob(chunksRef.current, { type: rec.mimeType });

          // Only send if blob is large enough to contain header + some audio
          if (blob.size < 1000) return;

          try {
            const file = new File(
              [blob],
              `chunk.${rec.mimeType.includes('webm') ? 'webm' : 'wav'}`,
              { type: rec.mimeType }
            );
            const res = await translateSpeechOnce(file);

            // The server transcribes the full accumulated audio.
            // We only want the NEW words since last send, so we compare
            // the new transcript with the previous one.
            const newTranscript = res.transcript || '';
            setTranscript((prev: string): string => {
              if (!prev) return newTranscript;
              // If the new transcript starts with the previous one,
              // only append the new part
              if (newTranscript.startsWith(prev)) {
                return newTranscript;
              }
              // Otherwise, use the new transcript (may be a restart)
              return newTranscript;
            });
            setTokens(res.tokens);
            setGestures(res.gestures);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        };

        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
        };

        rec.start(2000);
        setRunning(true);
      } else {
        // Offline mode: use Vosk WASM in browser
        // Dynamic import to avoid loading WASM when not needed
        const { createVoskSTT } = await import('../../lib/vosk-stt');

        const stt = await createVoskSTT({
          onPartial: (text) => {
            setTranscript(text);
          },
          onResult: (text) => {
            setTranscript((prev) => (prev ? prev + ' ' : '') + text);
            // Translate the text to gestures
            const result = translateTextOffline(text);
            setTokens(result.tokens);
            setGestures(result.gestures);
          },
          onError: (err) => {
            setError(err.message);
          },
        });

        // Store ref for cleanup
        mediaRecorderRef.current = {
          stop: () => {
            stt.stop();
            stt.destroy();
            stream.getTracks().forEach((t) => t.stop());
          },
        } as any;

        stt.start();
        setRunning(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to access microphone'
      );
    }
  }

  function stop() {
    setRunning(false);
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-apple-canvas text-apple-ink py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-apple-display-lg mb-1">
              Real-time Speech Translator
            </h1>
            <p className="text-apple-body text-apple-ink-muted-80">
              {mode === 'online'
                ? 'Translates via server (requires internet)'
                : 'Translates locally on device (works offline)'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline model status */}
            {mode === 'offline' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <Check size={12} />
                Model Ready
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex items-center bg-apple-canvas-parchment border border-apple-hairline rounded-full p-1">
              <button
                onClick={() => setMode('online')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  mode === 'online'
                    ? 'bg-blue-600 text-white'
                    : 'text-apple-ink-muted-80 hover:text-apple-ink'
                }`}
              >
                <Wifi size={12} />
                Online
              </button>
              <button
                onClick={() => {
                  if (!modelReady) {
                    handleDownloadModel();
                  } else {
                    setMode('offline');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  mode === 'offline'
                    ? 'bg-blue-600 text-white'
                    : 'text-apple-ink-muted-80 hover:text-apple-ink'
                }`}
              >
                <WifiOff size={12} />
                Offline
              </button>
            </div>
          </div>
        </div>

        {/* Download banner for offline mode */}
        {mode === 'offline' && !modelReady && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <Download size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Download Speech Model (~40MB)
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Required for offline speech recognition. Downloaded once and
                    cached on your device.
                  </p>
                  {downloading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Downloading... {downloadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleDownloadModel}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      Download Model
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="store-utility-card flex flex-col justify-between">
            <div>
              {/* LIVE Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide mb-6">
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                LIVE
              </div>

              {/* Title */}
              <h2 className="text-apple-display-md mb-2">Voice Input</h2>
              <p className="text-apple-body text-apple-ink-muted-80 mb-8">
                {mode === 'online'
                  ? 'Speak and your words will be sent to the server for translation'
                  : 'Speak and your words are processed locally on your device'}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mb-10">
                <button
                  onClick={start}
                  disabled={running}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <Mic size={18} />
                  Start
                </button>
                <button
                  onClick={stop}
                  disabled={!running}
                  className="btn-secondary-pill flex items-center gap-2 px-6"
                >
                  <Square size={18} />
                  Stop
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-apple-body">
                  {error}
                </div>
              )}

              {/* Live Transcript */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-apple-body-strong text-apple-primary">
                  <FileText size={18} />
                  <span>Live transcript</span>
                  {mode === 'offline' && (
                    <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                      LOCAL
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-apple-hairline bg-apple-canvas-parchment p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                  <p
                    className={`text-apple-body ${
                      transcript
                        ? 'text-apple-ink'
                        : 'text-apple-ink-muted-48'
                    }`}
                  >
                    {transcript || 'Listening... Speak now'}
                  </p>

                  {/* Waveform */}
                  {running && (
                    <div className="absolute inset-x-0 bottom-16 h-20 flex items-center justify-center gap-1 opacity-20">
                      {[...Array(30)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-blue-500 rounded-full"
                          animate={{
                            height: [
                              Math.random() * 10 + 10,
                              Math.random() * 60 + 20,
                              Math.random() * 10 + 10,
                            ],
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Status Bar */}
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-apple-hairline">
                    <div className="flex items-center gap-2 text-apple-caption font-medium">
                      {running ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            Listening...
                          </span>
                          <span className="text-apple-ink-muted-80 font-normal">
                            Speak now
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-apple-ink-muted-48" />
                          <span className="text-apple-ink-muted-48 font-normal">
                            Ready to record
                          </span>
                        </>
                      )}
                    </div>
                    {running && (
                      <Activity size={16} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="store-utility-card flex flex-col">
            {/* Output Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Volume2 size={20} />
                </div>
                <h3 className="text-apple-tagline">Output</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-apple-surface-pearl border border-apple-hairline rounded-full">
                <span className="text-apple-caption text-apple-ink-muted-80">
                  Tokens
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                  {tokens.length}
                </span>
              </div>
            </div>

            {/* Gesture Sequence */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-apple-body-strong text-apple-primary mb-4">
                <Hand size={18} />
                <span>Gesture sequence</span>
              </div>

              <div className="flex-1">
                <GestureSequencePlayer gestures={gestures} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

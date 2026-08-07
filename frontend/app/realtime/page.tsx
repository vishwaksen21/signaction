'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Activity, FileText, Hand, Volume2 } from 'lucide-react';
import { GestureSequencePlayer } from '../../components/gesture-sequence-player';
import { translateSpeechOnce } from '../../lib/api';

export default function RealtimePage() {
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [gestures, setGestures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  async function start() {
    setError(null);
    setTranscript('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = async (e) => {
      chunksRef.current.push(e.data);

      // We do NOT clear chunksRef.current here because WebM chunks need the initial header
      // to be decodable by FFmpeg. By accumulating, we send a growing valid WebM file each time.
      const blob = new Blob(chunksRef.current, { type: rec.mimeType });

      try {
        const file = new File([blob], `chunk.${rec.mimeType.includes('webm') ? 'webm' : 'wav'}`, {
          type: rec.mimeType,
        });
        const res = await translateSpeechOnce(file);
        setTranscript(res.transcript);
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

              {/* Title & Description */}
              <h2 className="text-apple-display-md mb-2">Real-time Speech Translator</h2>
              <p className="text-apple-body text-apple-ink-muted-80 mb-8">
                Convert your voice into another language in real-time
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

              {/* Live Transcript Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-apple-body-strong text-apple-primary">
                  <FileText size={18} />
                  <span>Live transcript</span>
                </div>

                <div className="rounded-2xl border border-apple-hairline bg-apple-canvas-parchment p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                  <p className={`text-apple-body ${transcript ? 'text-apple-ink' : 'text-apple-ink-muted-48'}`}>
                    {transcript || 'Listening... Speak now'}
                  </p>

                  {/* Simulated Waveform (only visible when running) */}
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
                              Math.random() * 10 + 10
                            ]
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            repeatType: "reverse"
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
                          <span className="text-green-600 dark:text-green-400">Listening...</span>
                          <span className="text-apple-ink-muted-80 font-normal">Speak now</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-apple-ink-muted-48" />
                          <span className="text-apple-ink-muted-48 font-normal">Ready to record</span>
                        </>
                      )}
                    </div>
                    {running && <Activity size={16} className="text-blue-500" />}
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
                <h3 className="text-apple-display-sm">Output</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-apple-surface-pearl border border-apple-hairline rounded-full">
                <span className="text-apple-caption text-apple-ink-muted-80">Tokens</span>
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

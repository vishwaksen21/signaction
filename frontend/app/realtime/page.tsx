'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
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

  const pulse = useMemo(
    () =>
      running ? (
        <motion.div
          className="h-2 w-2 rounded-full bg-blue-500"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      ) : null,
    [running]
  );

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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = async (e) => {
      chunksRef.current.push(e.data);

      // Every chunk (~2s), send what we have and reset.
      const blob = new Blob(chunksRef.current, { type: rec.mimeType });
      chunksRef.current = [];

      try {
        const file = new File([blob], `chunk.${rec.mimeType.includes('webm') ? 'webm' : 'wav'}`, {
          type: rec.mimeType,
        });
        const res = await translateSpeechOnce(file);
        setTranscript((prev) => (prev ? prev + ' ' : '') + res.transcript);
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-medium">Real-time Speech Translator</div>
            <div className="mt-1 text-sm text-slate-400">Continuous mic input, periodic updates.</div>
          </div>
          {pulse}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={start} disabled={running}>
            Start
          </Button>
          <Button onClick={stop} disabled={!running} variant="secondary">
            Stop
          </Button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          <div className="text-sm text-slate-300">Live transcript</div>
          <div className="mt-2 min-h-[120px] rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
            {transcript || '—'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="text-lg font-medium">Output</div>
        <div className="mt-4">
          <div className="text-sm text-slate-300">Tokens</div>
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
            {JSON.stringify(tokens, null, 2)}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-slate-300">Gesture sequence</div>
          <GestureSequencePlayer gestures={gestures} />
        </div>
      </div>
    </div>
  );
}

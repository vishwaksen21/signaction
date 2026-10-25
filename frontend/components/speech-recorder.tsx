'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Check, AlertCircle } from 'lucide-react';
import { convertToWav16kHz } from '../lib/audio-wav';

export function SpeechRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [last, setLast] = useState<File | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      try {
        if (recRef.current && recRef.current.state !== 'inactive') {
          recRef.current.stop();
        }
      } catch {
        // ignore
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  async function start() {
    setRecError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecError('Microphone access is not available in this browser or context.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setRecError(
        isDenied
          ? 'Microphone permission denied. Please enable microphone access in browser or Android settings.'
          : 'Unable to access microphone. Check that a microphone is connected and permitted.'
      );
      return;
    }

    try {
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType =
        typeof MediaRecorder !== 'undefined'
          ? preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
          : '';
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      rec.onstop = async () => {
        try {
          const actualMime = rec.mimeType || mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: actualMime });
          if (blob.size === 0) {
            setRecError('No audio captured. Please hold record for at least a second and speak clearly.');
            return;
          }
          const ext = actualMime.includes('mp4')
            ? 'm4a'
            : actualMime.includes('ogg')
              ? 'ogg'
              : 'webm';
          const raw = new File([blob], `recording.${ext}`, {
            type: actualMime,
          });

          const wav = await convertToWav16kHz(raw);
          setLast(wav);
          onRecorded(wav);
        } catch {
          setRecError('Failed to process recording. Please try recording again.');
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          if (streamRef.current === stream) {
            streamRef.current = null;
          }
        }
      };

      rec.start();
      setRecording(true);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setRecError('Audio recording is not supported on this device.');
    }
  }

  function stop() {
    try {
      if (recRef.current && recRef.current.state !== 'inactive') {
        recRef.current.stop();
      }
    } catch {
      // ignore
    }
    setRecording(false);
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.5, 1],
      boxShadow: [
        "0px 0px 0px 0px rgba(220, 38, 38, 0.4)",
        "0px 0px 0px 6px rgba(220, 38, 38, 0)",
        "0px 0px 0px 0px rgba(220, 38, 38, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="space-y-3">
      {/* Buttons */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        {/* Start Button */}
        <button
          type="button"
          onClick={start}
          disabled={disabled || recording}
          className="btn-sign-primary flex-1 min-h-[48px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold shadow-md shadow-sign-blue/20"
        >
          <Mic size={18} />
          Start Recording
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={stop}
          disabled={disabled || !recording}
          className="btn-sign-secondary min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 text-xs md:text-sm font-bold"
        >
          <Square size={18} />
          Stop
        </button>
      </div>

      {/* Inline Recording Error */}
      {recError && (
        <div className="flex items-start gap-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 px-3.5 py-2.5 rounded-xl">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{recError}</span>
        </div>
      )}

      {/* Recording Indicator */}
      {recording && (
        <motion.div
          className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-3.5 py-2.5 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-red-600 dark:bg-red-400"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
          Recording speech in progress...
        </motion.div>
      )}

      {/* Last Recording Status */}
      {last && !recording && (
        <motion.div
          className="flex items-center gap-2 text-xs font-semibold text-sign-blue dark:text-sign-cyan bg-sign-verylight dark:bg-sign-navy/40 border border-sign-border/60 px-3.5 py-2 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Check size={16} />
          <span>
            {last.name} • {(last.size / 1024).toFixed(1)} KB
          </span>
        </motion.div>
      )}
    </div>
  );
}


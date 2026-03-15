'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Check } from 'lucide-react';

const TARGET_SAMPLE_RATE = 16000;

function encodeWavPCM16(monoSamples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = monoSamples.length * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < monoSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, monoSamples[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function convertToWav16kHz(file: File): Promise<File> {
  if (file.type.includes('wav') || file.name.toLowerCase().endsWith('.wav')) return file;

  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available');

  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));

    const length = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
    const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();

    const mono = rendered.getChannelData(0);
    const wavBlob = encodeWavPCM16(mono, TARGET_SAMPLE_RATE);
    const wavName = file.name.replace(/\.[^.]+$/, '') + '.wav';
    return new File([wavBlob], wavName, { type: 'audio/wav' });
  } finally {
    try {
      await ctx.close();
    } catch {
      // ignore
    }
  }
}

export function SpeechRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [last, setLast] = useState<File | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType });
      const raw = new File([blob], `recording.${rec.mimeType.includes('webm') ? 'webm' : 'wav'}`, {
        type: rec.mimeType,
      });

      const wav = await convertToWav16kHz(raw);
      setLast(wav);
      onRecorded(wav);

      stream.getTracks().forEach((t) => t.stop());
    };

    rec.start();
    setRecording(true);
  }

  function stop() {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    setRecording(false);
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="space-y-3">
      {/* Buttons */}
      <div className="flex gap-2">
        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={start}
          disabled={disabled || recording}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <Mic size={18} />
          Start Recording
        </motion.button>

        {/* Stop Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={stop}
          disabled={disabled || !recording}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 font-medium shadow-lg hover:shadow-xl transition-all dark:bg-slate-800/50 dark:hover:bg-slate-700"
        >
          <Square size={18} />
          Stop
        </motion.button>
      </div>

      {/* Recording Indicator */}
      {recording && (
        <motion.div
          className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
          Recording in progress...
        </motion.div>
      )}

      {/* Last Recording Status */}
      {last && !recording && (
        <motion.div
          className="flex items-center gap-2 text-sm text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-lg"
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

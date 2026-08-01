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
      try {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const raw = new File([blob], `recording.${rec.mimeType.includes('webm') ? 'webm' : 'wav'}`, {
          type: rec.mimeType,
        });

        const wav = await convertToWav16kHz(raw);
        setLast(wav);
        onRecorded(wav);
      } catch {
        alert('Failed to process recording. Please try again.');
      } finally {
        stream.getTracks().forEach((t) => t.stop());
      }
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
      <div className="flex gap-2">
        {/* Start Button */}
        <button
          onClick={start}
          disabled={disabled || recording}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Mic size={18} />
          Start Recording
        </button>

        {/* Stop Button */}
        <button
          onClick={stop}
          disabled={disabled || !recording}
          className="btn-secondary-pill flex items-center justify-center gap-2"
        >
          <Square size={18} />
          Stop
        </button>
      </div>

      {/* Recording Indicator */}
      {recording && (
        <motion.div
          className="flex items-center gap-2 text-apple-caption text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-red-600"
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
          className="flex items-center gap-2 text-apple-caption text-apple-primary bg-apple-surface-pearl border border-apple-hairline px-3 py-2 rounded-lg"
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

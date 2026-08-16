'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic2, Upload } from 'lucide-react';
import { SpeechRecorder } from './speech-recorder';

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

export function TranslatorInput({
  text,
  onTextChange,
  onTranslateText,
  onTranslateSpeech,
  loading,
  error,
}: {
  text: string;
  onTextChange: (v: string) => void;
  onTranslateText: () => void;
  onTranslateSpeech: (file: File) => void;
  loading?: boolean;
  error?: string | null;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setConverting(true);
    try {
      const wav = await convertToWav16kHz(raw);
      setAudioFile(wav);
    } catch {
      setAudioFile(null);
      alert('Could not convert this audio file. Please upload a WAV, FLAC, or OGG file instead.');
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="store-utility-card h-full flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-apple-display-md mb-1">
            Text & Speech Input
          </h2>
          <p className="text-apple-body text-apple-ink-muted-80">
            Enter text or record audio to translate
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-apple-body">
            {error}
          </div>
        )}

        {/* Text Input Section */}
        <div className="space-y-3">
          <label className="text-apple-caption-strong text-apple-ink-muted-80 uppercase tracking-wider block">
            Text Input
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-apple-hairline bg-apple-canvas p-4 text-apple-body text-apple-ink placeholder-apple-ink-muted-48 outline-none focus-ring"
            rows={4}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type a sentence, phrase, or word to translate…"
            disabled={loading}
          />
          <button
            onClick={onTranslateText}
            disabled={loading || !text.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Translate Text
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-apple-hairline" />
          </div>
          <div className="relative flex justify-center text-apple-micro-legal">
            <span className="px-3 bg-apple-canvas text-apple-ink-muted-48">
              or
            </span>
          </div>
        </div>

        {/* Speech Input Section */}
        <div className="space-y-3">
          <label className="text-apple-caption-strong text-apple-ink-muted-80 uppercase tracking-wider block">
            Speech Input
          </label>

          {/* Microphone Recorder */}
          <div className="p-4 rounded-lg bg-apple-surface-pearl border border-apple-hairline">
            <SpeechRecorder disabled={loading} onRecorded={(f) => setAudioFile(f)} />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-apple-caption text-apple-ink-muted-80">
              Or upload an audio file
            </label>
            <input
              className="block w-full text-apple-body text-apple-ink file:mr-4 file:rounded-full file:border-0 file:bg-apple-primary file:px-4 file:py-2 file:text-apple-body-strong file:text-apple-on-dark file:cursor-pointer transition-colors hover:file:opacity-90"
              type="file"
              accept="audio/wav,audio/flac,audio/ogg,audio/webm,.wav,.flac,.ogg,.webm"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <p className="text-apple-micro-legal text-apple-ink-muted-48">
              Supported: WAV, FLAC, OGG, WEBM · Max 30MB
            </p>
          </div>

          {/* Transcribe Button */}
          <button
            onClick={() => audioFile && onTranslateSpeech(audioFile)}
            disabled={loading || !audioFile || converting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Mic2 size={18} />
            {converting ? 'Converting Audio…' : 'Transcribe & Translate'}
          </button>

          {converting && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-apple-caption flex items-center gap-2">
              <span className="animate-spin">⏳</span> Converting audio to WAV format…
            </div>
          )}

          {audioFile && !converting && (
            <div className="p-3 rounded-lg bg-apple-surface-pearl border border-apple-primary text-apple-primary text-apple-caption">
              📁 {audioFile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

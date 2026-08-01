'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic2, Upload } from 'lucide-react';
import { SpeechRecorder } from './speech-recorder';

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
            rows={6}
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
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              disabled={loading}
            />
            <p className="text-apple-micro-legal text-apple-ink-muted-48">
              Supported: WAV, FLAC, OGG, WEBM · Max 30MB
            </p>
          </div>

          {/* Transcribe Button */}
          <button
            onClick={() => audioFile && onTranslateSpeech(audioFile)}
            disabled={loading || !audioFile}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Mic2 size={18} />
            Transcribe & Translate
          </button>

          {audioFile && (
            <div className="p-3 rounded-lg bg-apple-surface-pearl border border-apple-primary text-apple-primary text-apple-caption">
              📁 {audioFile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

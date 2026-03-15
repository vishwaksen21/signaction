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
    <motion.div
      className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40 light:border-slate-200 light:bg-white/50 p-6 lg:p-8 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
            Text & Speech Input
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
            Enter text or record audio to translate
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Text Input Section */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-600">
            Text Input
          </label>
          <textarea
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder-slate-400 light:focus:border-indigo-500"
            rows={6}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type a sentence, phrase, or word to translate…"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTranslateText}
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Send size={18} />
            Translate Text
          </motion.button>
        </motion.div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700 dark:border-slate-700 light:border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-900/40 text-slate-400 dark:bg-slate-900/40 light:bg-white/50 light:text-slate-600">
              or
            </span>
          </div>
        </div>

        {/* Speech Input Section */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-600">
            Speech Input
          </label>

          {/* Microphone Recorder */}
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 dark:border-slate-700 light:border-slate-200">
            <SpeechRecorder disabled={loading} onRecorded={(f) => setAudioFile(f)} />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
              Or upload an audio file
            </label>
            <input
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:hover:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:cursor-pointer transition-colors dark:text-slate-300 light:text-slate-900 light:file:bg-indigo-600 light:file:hover:bg-indigo-500"
              type="file"
              accept="audio/wav,audio/flac,audio/ogg,audio/webm,.wav,.flac,.ogg,.webm"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              disabled={loading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
              Supported: WAV, FLAC, OGG, WEBM · Max 30MB
            </p>
          </div>

          {/* Transcribe Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => audioFile && onTranslateSpeech(audioFile)}
            disabled={loading || !audioFile}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Mic2 size={18} />
            Transcribe & Translate
          </motion.button>

          {audioFile && (
            <motion.div
              className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              📁 {audioFile.name}
            </motion.div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
            💡 Requires backend Vosk model. Set <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-indigo-400">VOSK_MODEL_PATH</code> environment variable.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

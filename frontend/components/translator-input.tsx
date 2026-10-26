'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpeechRecorder } from './speech-recorder';
import { convertToWav16kHz } from '../lib/audio-wav';

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
  const [activeTab, setActiveTab] = useState<'text' | 'speech'>('text');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setUploadError(null);
    setConverting(true);
    try {
      const wav = await convertToWav16kHz(raw);
      setAudioFile(wav);
    } catch {
      setAudioFile(null);
      setUploadError('Could not convert this audio file. Please upload a valid WAV, FLAC, OGG, MP4/M4A, or WEBM recording.');
    } finally {
      setConverting(false);
    }
  }

  const samplePhrases = [
    'Hello',
    'Thank you',
    'How are you?',
    'Good morning',
  ];

  return (
    <div className="sign-card flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header matching specification */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] dark:text-white tracking-tight">
              Translate
            </h2>
            <p className="text-sm text-[#60759A] dark:text-slate-400 mt-1 font-normal">
              Enter text or speak naturally to generate real-time sign gestures.
            </p>
          </div>

          {/* Apple Cupertino Segmented Control */}
          <div className="relative inline-flex p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] backdrop-blur-md border border-black/5 dark:border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`relative min-h-[38px] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-160 ${
                activeTab === 'text'
                  ? 'text-[#062B5C] dark:text-white font-bold'
                  : 'text-slate-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {activeTab === 'text' && (
                <motion.div
                  layoutId="translator-mode-pill"
                  className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm"
                  transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
                />
              )}
              <span className="relative z-10">Text Input</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('speech')}
              className={`relative min-h-[38px] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-160 ${
                activeTab === 'speech'
                  ? 'text-[#062B5C] dark:text-white font-bold'
                  : 'text-slate-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {activeTab === 'speech' && (
                <motion.div
                  layoutId="translator-mode-pill"
                  className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm"
                  transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
                />
              )}
              <span className="relative z-10">Voice Speech</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Tab 1: Text Input Mode */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                className="sign-textarea min-h-[140px] text-base leading-relaxed"
                rows={5}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Type a sentence, phrase, or word to translate into sign gestures…"
                disabled={loading}
                enterKeyHint="send"
                autoCapitalize="sentences"
                autoCorrect="on"
                spellCheck={true}
              />
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-[#64748B] dark:text-slate-400">
                <span>{text.length} characters</span>
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onTextChange('')}
                    className="text-[#0757E8] hover:underline transition-colors font-medium p-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sample Suggestions */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                Try an example:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePhrases.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => onTextChange(phrase)}
                    className="text-xs px-3.5 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-slate-200 font-medium transition-[transform,background-color] duration-160 ease-apple min-h-[38px] flex items-center active:scale-[0.97]"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onTranslateText}
              disabled={loading || !text.trim()}
              className="inline-flex items-center justify-center gap-2 w-full mt-4 text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full py-4 min-h-[50px] shadow-[0_4px_16px_rgba(7,87,232,0.28)] hover:shadow-[0_6px_22px_rgba(7,87,232,0.36)] transition-[transform,background-color,box-shadow] duration-160 ease-apple active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Translating…' : 'Translate to Signs'}</span>
              <Send size={16} />
            </button>
          </div>
        )}

        {/* Tab 2: Speech Input Mode */}
        {activeTab === 'speech' && (
          <div className="space-y-5">
            {/* Microphone Recorder Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <SpeechRecorder
                disabled={loading}
                onRecorded={(f) => {
                  setUploadError(null);
                  setAudioFile(f);
                }}
              />
            </div>

            {/* Audio File Upload Backup */}
            <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                Or upload an audio recording
              </label>
              <input
                className="block w-full text-xs text-[#1d1d1f] dark:text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.05] dark:file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#0757E8] dark:file:text-[#12CFF3] file:cursor-pointer transition-colors hover:file:opacity-80"
                type="file"
                accept="audio/wav,audio/flac,audio/ogg,audio/webm,audio/mp4,audio/mpeg,.wav,.flac,.ogg,.webm,.m4a,.mp3"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Supported: WAV, FLAC, OGG, WEBM, M4A · Automatically standardized to 16kHz PCM
              </p>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            {converting && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <span className="animate-spin">⏳</span> Standardizing audio to 16kHz WAV format…
              </div>
            )}

            {audioFile && !converting && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-[#0757E8] dark:text-[#12CFF3] text-xs font-semibold flex items-center gap-2">
                <span>📁 Ready for translation:</span>
                <span className="font-mono">{audioFile.name}</span>
              </div>
            )}

            {/* Transcribe and Translate Button */}
            <button
              onClick={() => audioFile && onTranslateSpeech(audioFile)}
              disabled={loading || !audioFile || converting}
              className="inline-flex items-center justify-center gap-2 w-full text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full py-4 min-h-[50px] shadow-[0_4px_16px_rgba(7,87,232,0.28)] hover:shadow-[0_6px_22px_rgba(7,87,232,0.36)] transition-[transform,background-color,box-shadow] duration-160 ease-apple active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{converting ? 'Converting Audio…' : 'Translate Voice Recording'}</span>
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

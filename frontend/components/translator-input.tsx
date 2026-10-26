'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white tracking-tight">
              Translate
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              Enter text or use your voice to generate sign gestures.
            </p>
          </div>

          {/* Text / Speech Tabs */}
          <div className="inline-flex p-1 rounded-full bg-[#F0F4F8] dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`min-h-[40px] px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-[#0757E8] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
              }`}
            >
              Text Input
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('speech')}
              className={`min-h-[40px] px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'speech'
                  ? 'bg-[#0757E8] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
              }`}
            >
              Voice Speech
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
                    className="text-xs px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-[#F0F4F8] dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 text-[#062B5C] dark:text-slate-200 font-medium transition-colors shadow-2xs min-h-[38px] flex items-center active:scale-95"
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
              className="btn-sign-primary w-full flex items-center justify-center gap-2 mt-4 text-base py-3.5 min-h-[48px]"
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
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
              <SpeechRecorder
                disabled={loading}
                onRecorded={(f) => {
                  setUploadError(null);
                  setAudioFile(f);
                }}
              />
            </div>

            {/* Audio File Upload Backup */}
            <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                Or upload an audio recording
              </label>
              <input
                className="block w-full text-xs text-[#062B5C] dark:text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#F0F4F8] dark:file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#0757E8] dark:file:text-[#12CFF3] file:cursor-pointer transition-colors hover:file:opacity-80"
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
              className="btn-sign-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
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

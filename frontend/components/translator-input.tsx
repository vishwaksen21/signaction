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
  const [activeTab, setActiveTab] = useState<'text' | 'speech'>('text');
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
          <div className="inline-flex p-1 rounded-full bg-[#F0F4F8] dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
                className="sign-textarea"
                rows={5}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Type a sentence, phrase, or word to translate into sign gestures…"
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-[#64748B] dark:text-slate-400">
                <span>{text.length} characters</span>
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onTextChange('')}
                    className="text-[#0757E8] hover:underline transition-colors font-medium"
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
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-[#F0F4F8] dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 text-[#062B5C] dark:text-slate-200 font-medium transition-colors shadow-2xs"
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
              className="btn-sign-primary w-full flex items-center justify-center gap-2 mt-4 text-base py-3.5"
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
            <div className="p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
              <SpeechRecorder disabled={loading} onRecorded={(f) => setAudioFile(f)} />
            </div>

            {/* Audio File Upload Backup */}
            <div className="space-y-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                Or upload an audio recording
              </label>
              <input
                className="block w-full text-xs text-[#062B5C] dark:text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#F0F4F8] dark:file:bg-slate-800 file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-[#0757E8] dark:file:text-[#12CFF3] file:cursor-pointer transition-colors hover:file:opacity-80"
                type="file"
                accept="audio/wav,audio/flac,audio/ogg,audio/webm,.wav,.flac,.ogg,.webm"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Supported: WAV, FLAC, OGG, WEBM · Automatically standardized to 16kHz PCM
              </p>
            </div>

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

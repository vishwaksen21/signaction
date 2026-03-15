import { useMemo, useRef, useState } from 'react';
import { gifDataUrl, translateSpeech, translateText } from '../lib/api';

type Mode = 'text' | 'speech';

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

  // Attempt client-side decode+resample for browser-recorded formats (e.g., WEBM/Opus).
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available in this browser');

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

export function App() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [gloss, setGloss] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string[] | null>(null);
  const [gifB64, setGifB64] = useState<string | null>(null);

  const gifUrl = useMemo(() => (gifB64 ? gifDataUrl(gifB64) : null), [gifB64]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use WAV MIME type if available, otherwise WebM
      const mimeType = MediaRecorder.isTypeSupported('audio/wav') 
        ? 'audio/wav' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm'
        : '';
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const ext = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'wav';
        const rawFile = new File([audioBlob], `recording.${ext}`, { type: mediaRecorder.mimeType });
        try {
          const wavFile = await convertToWav16kHz(rawFile);
          setAudioFile(wavFile);
        } catch {
          // Fallback: still set the recorded file so user can see something.
          setAudioFile(rawFile);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to access microphone');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function onTranslate() {
    setLoading(true);
    setError(null);
    setTranscript(null);
    setGloss(null);
    setTokens(null);
    setGifB64(null);

    try {
      if (mode === 'text') {
        const res = await translateText(text);
        setGloss(res.gloss);
        setTokens(res.tokens);
        setGifB64(res.gif_base64);
        return;
      }

      if (!audioFile) throw new Error('Please choose an audio file (wav/flac/ogg/webm).');

      let toSend = audioFile;
      if (audioFile.type.includes('webm') || audioFile.name.toLowerCase().endsWith('.webm')) {
        toSend = await convertToWav16kHz(audioFile);
      }

      const res = await translateSpeech(toSend);
      setTranscript(res.transcript);
      setGloss(res.gloss);
      setTokens(res.tokens);
      setGifB64(res.gif_base64);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">SignAction</h1>
          <p className="mt-2 text-sm text-slate-300">
            Text or speech to sign-language-style output (MVP). Uses your existing Python pipeline.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Input</h2>
              <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                <button
                  className={
                    'rounded-lg px-3 py-1.5 text-sm ' +
                    (mode === 'text' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white')
                  }
                  onClick={() => setMode('text')}
                  type="button"
                >
                  Text
                </button>
                <button
                  className={
                    'rounded-lg px-3 py-1.5 text-sm ' +
                    (mode === 'speech' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white')
                  }
                  onClick={() => setMode('speech')}
                  type="button"
                >
                  Speech
                </button>
              </div>
            </div>

            {mode === 'text' ? (
              <div className="mt-4">
                <label className="text-sm text-slate-300">Enter text</label>
                <textarea
                  className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-slate-600"
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a sentence…"
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-300">Record audio from microphone</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isRecording || loading}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-blue-700"
                    >
                      {isRecording ? '🔴 Recording...' : 'Start Recording'}
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      disabled={!isRecording}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-red-700"
                    >
                      Stop Recording
                    </button>
                  </div>
                  {audioFile && (
                    <div className="mt-2 text-xs text-slate-400">
                      ✅ Recorded: {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <label className="text-sm text-slate-300">Or upload an audio file</label>
                  <input
                    className="mt-2 block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                    type="file"
                    accept="audio/wav,audio/flac,audio/ogg,audio/webm,.wav,.flac,.ogg,.webm"
                    onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Supported formats: WAV, FLAC, OGG, WEBM (WEBM is converted to WAV in-browser when possible)
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  💡 Requires Vosk configured on backend (`VOSK_MODEL_PATH` environment variable).
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onTranslate}
              disabled={loading || (mode === 'text' ? text.trim().length === 0 : !audioFile)}
              className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? 'Working…' : mode === 'text' ? 'Translate' : 'Transcribe + Translate'}
            </button>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="text-lg font-medium">Output</h2>

            {transcript ? (
              <div className="mt-4">
                <div className="text-sm text-slate-300">Transcript</div>
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100">
                  {transcript}
                </div>
              </div>
            ) : null}

            {gloss !== null ? (
              <div className="mt-4">
                <div className="text-sm text-slate-300">Gloss</div>
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  {gloss || '(empty)'}
                </div>
              </div>
            ) : null}

            {tokens ? (
              <div className="mt-4">
                <div className="text-sm text-slate-300">Tokens</div>
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  {JSON.stringify(tokens, null, 2)}
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="text-sm text-slate-300">Sign output</div>
              <div className="mt-2 grid place-items-center rounded-xl border border-slate-800 bg-slate-950 p-3">
                {gifUrl ? (
                  <img
                    src={gifUrl}
                    alt="Sign output"
                    className="max-h-[360px] w-auto rounded-lg"
                  />
                ) : (
                  <div className="py-16 text-sm text-slate-500">No output yet</div>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-10 text-xs text-slate-500">
          Backend: FastAPI on <span className="text-slate-300">http://localhost:8000</span> · Frontend: Vite on{' '}
          <span className="text-slate-300">http://localhost:5173</span>
        </footer>
      </div>
    </div>
  );
}

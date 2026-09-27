/**
 * Vosk WASM speech-to-text for the browser.
 * Uses vosk-browser (WASM build) running in a Web Worker context.
 *
 * Usage:
 *   const stt = await createVoskSTT(modelUrl);
 *   stt.onResult((text) => console.log(text));
 *   stt.start();
 *   // ... later
 *   stt.stop();
 */

import { getCachedModel, downloadModel, cacheModel } from './model-cache';

export interface VoskSTTOptions {
  /** URL string or Blob to load the model from. If omitted, uses IndexedDB cache. */
  modelSource?: string | Blob;
  /** Called with partial transcription results */
  onPartial?: (text: string) => void;
  /** Called with final transcription results */
  onResult?: (text: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when model finishes loading */
  onModelLoaded?: () => void;
}

export interface VoskSTT {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  isReady: () => boolean;
}

// The Vosk browser library is loaded dynamically
let voskModule: any = null;

async function loadVoskModule() {
  if (voskModule) return voskModule;
  voskModule = await import('vosk-browser');
  return voskModule;
}

/**
 * Create a Vosk STT instance.
 * Loads the model from IndexedDB cache, or from the provided source.
 */
export async function createVoskSTT(
  options: VoskSTTOptions = {}
): Promise<VoskSTT> {
  const { modelSource, onPartial, onResult, onError, onModelLoaded } = options;

  let model: any = null;
  let recognizer: any = null;
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let recognizerNode: ScriptProcessorNode | null = null;
  let ready = false;
  let createdObjectUrl: string | null = null;

  try {
    const Vosk = await loadVoskModule();

    // Determine model source
    let modelData: string;

    if (modelSource) {
      // If modelSource is a string URL, use directly
      if (typeof modelSource === 'string') {
        modelData = modelSource;
      } else {
        // If it's a Blob, create an object URL
        createdObjectUrl = URL.createObjectURL(modelSource);
        modelData = createdObjectUrl;
      }
    } else {
      // Try IndexedDB cache first
      let cached = await getCachedModel();
      if (!cached) {
        // Auto-seed from locally bundled APK model on first launch
        try {
          const buffer = await downloadModel();
          await cacheModel(buffer);
          cached = buffer;
        } catch (e) {
          console.warn('[Vosk] Auto-seed from bundled model failed, trying direct path:', e);
        }
      }

      if (cached) {
        const blob = new Blob([cached], { type: 'application/octet-stream' });
        createdObjectUrl = URL.createObjectURL(blob);
        modelData = createdObjectUrl;
      } else {
        // Direct local URL fallback
        modelData = '/models/vosk-model-small-en-us-0.15.tar';
      }
    }

    model = await Vosk.createModel(modelData);
    recognizer = new model.KaldiRecognizer(16000);

    recognizer.on('result', (message: any) => {
      const text = message.result?.text?.trim();
      if (text) onResult?.(text);
    });

    recognizer.on('partialresult', (message: any) => {
      const text = message.result?.partial?.trim();
      if (text) onPartial?.(text);
    });

    recognizer.on('error', (message: any) => {
      onError?.(new Error(message.error || 'Vosk recognizer error'));
    });

    ready = true;
    onModelLoaded?.();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }

  async function start() {
    if (!ready || !recognizer) {
      onError?.(new Error('Vosk model not loaded'));
      return;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      // Don't specify sampleRate — let browser use its default (usually 44100/48000).
      // Vosk's WASM build handles resampling internally.
      audioContext = new AudioContext();
      sourceNode = audioContext.createMediaStreamSource(mediaStream);

      // Use ScriptProcessorNode for compatibility (AudioWorklet preferred but more complex)
      recognizerNode = audioContext.createScriptProcessor(4096, 1, 1);
      recognizerNode.onaudioprocess = (event) => {
        if (!ready || !recognizer) return;
        try {
          recognizer.acceptWaveform(event.inputBuffer);
        } catch {
          // Ignore waveform errors
        }
      };

      sourceNode.connect(recognizerNode);
      recognizerNode.connect(audioContext.destination);
    } catch (err) {
      onError?.(
        err instanceof Error
          ? err
          : new Error('Failed to access microphone')
      );
    }
  }

  function stop() {
    if (recognizerNode) {
      recognizerNode.disconnect();
      recognizerNode = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  }

  function destroy() {
    stop();
    if (createdObjectUrl) {
      URL.revokeObjectURL(createdObjectUrl);
      createdObjectUrl = null;
    }
    if (recognizer) {
      try {
        recognizer.remove();
      } catch {
        // ignore
      }
      recognizer = null;
    }
    if (model) {
      try {
        model.terminate();
      } catch {
        // ignore
      }
      model = null;
    }
    ready = false;
  }

  return {
    start,
    stop,
    destroy,
    isReady: () => ready,
  };
}

/**
 * Transcribe an audio File or Blob completely client-side using Vosk WASM.
 */
export async function transcribeAudioFile(file: File | Blob): Promise<string> {
  const AudioCtx = window.AudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available');
  const ctx = new AudioCtx();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const Vosk = await loadVoskModule();

    let cached = await getCachedModel();
    if (!cached) {
      try {
        const buffer = await downloadModel();
        await cacheModel(buffer);
        cached = buffer;
      } catch (e) {
        console.warn('[Vosk] Auto-seed failed, falling back to direct model path:', e);
      }
    }

    let modelData: string;
    let createdUrl: string | null = null;
    if (cached) {
      const blob = new Blob([cached], { type: 'application/octet-stream' });
      createdUrl = URL.createObjectURL(blob);
      modelData = createdUrl;
    } else {
      modelData = '/models/vosk-model-small-en-us-0.15.tar';
    }

    const model = await Vosk.createModel(modelData);
    const recognizer = new model.KaldiRecognizer(audioBuffer.sampleRate);

    return await new Promise<string>((resolve) => {
      let fullTranscript = '';
      let timer: any = null;

      const finish = () => {
        if (timer) clearTimeout(timer);
        try { recognizer.remove(); } catch {}
        if (createdUrl) URL.revokeObjectURL(createdUrl);
        try { model.terminate(); } catch {}
        resolve(fullTranscript.trim());
      };

      recognizer.on('result', (msg: any) => {
        const text = msg.result?.text?.trim();
        if (text) {
          fullTranscript = fullTranscript ? `${fullTranscript} ${text}` : text;
        }
      });

      recognizer.acceptWaveform(audioBuffer);
      recognizer.retrieveFinalResult();

      // Give worker time to process buffer and return final result
      timer = setTimeout(finish, 800);
    });
  } finally {
    try { await ctx.close(); } catch {}
  }
}

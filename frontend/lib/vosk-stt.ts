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
  start: (existingStream?: MediaStream) => Promise<void>;
  stop: () => void;
  destroy: () => void;
  isReady: () => boolean;
}

const DEFAULT_MODEL_URLS = [
  '/models/vosk-model-small-en-us-0.15.tar.gz',
  '/models/vosk-model-small-en-us-0.15.tar',
];

// The Vosk browser library and default WASM model are cached as singletons
// so repeated speech recordings do not respawn workers or leak IDBFS storage.
let voskModule: any = null;
let sharedModelPromise: Promise<any> | null = null;

async function loadVoskModule() {
  if (voskModule) return voskModule;
  voskModule = await import('vosk-browser');
  return voskModule;
}

/**
 * Load (or reuse) the default Vosk WASM model.
 * Uses the stable `/models/vosk-model-small-en-us-0.15.tar.gz` (or `.tar` in Android APK) URL first so
 * vosk-browser's Emscripten IDBFS (`/vosk/.../extracted.ok`) persists the
 * extracted model across sessions without re-extracting 40MB every time.
 * Falls back to the IndexedDB cached ArrayBuffer Blob if offline before first extraction.
 */
export async function getOrLoadDefaultVoskModel(): Promise<any> {
  if (sharedModelPromise) return sharedModelPromise;

  sharedModelPromise = (async () => {
    const Vosk = await loadVoskModule();

    let primaryErr: Error | null = null;
    for (const url of DEFAULT_MODEL_URLS) {
      try {
        return await Vosk.createModel(url);
      } catch (err) {
        primaryErr = err instanceof Error ? err : new Error(String(err));
      }
    }

    let cached = await getCachedModel();
    if (!cached) {
      try {
        const buffer = await downloadModel();
        await cacheModel(buffer);
        cached = buffer;
      } catch {
        // ignore and rethrow below
      }
    }
    if (cached) {
      const blob = new Blob([cached], { type: 'application/gzip' });
      const objectUrl = URL.createObjectURL(blob);
      try {
        return await Vosk.createModel(objectUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
    throw primaryErr || new Error('Failed to load Vosk model');
  })().catch((err) => {
    sharedModelPromise = null;
    throw err;
  });

  return sharedModelPromise;
}

/**
 * Create a Vosk STT instance.
 * Loads the model from the shared persistent instance or from a custom modelSource.
 */
export async function createVoskSTT(
  options: VoskSTTOptions = {}
): Promise<VoskSTT> {
  const { modelSource, onPartial, onResult, onError, onModelLoaded } = options;

  let model: any = null;
  let ownsCustomModel = false;
  let recognizer: any = null;
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let recognizerNode: ScriptProcessorNode | null = null;
  let ready = false;
  let createdObjectUrl: string | null = null;

  try {
    const Vosk = await loadVoskModule();

    if (modelSource) {
      ownsCustomModel = true;
      if (typeof modelSource === 'string') {
        model = await Vosk.createModel(modelSource);
      } else {
        createdObjectUrl = URL.createObjectURL(modelSource);
        model = await Vosk.createModel(createdObjectUrl);
      }
    } else {
      model = await getOrLoadDefaultVoskModel();
    }

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

  async function start(existingStream?: MediaStream) {
    if (!ready || !recognizer) {
      onError?.(new Error('Vosk model not loaded'));
      return;
    }

    try {
      mediaStream =
        existingStream ??
        (await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        }));

      // Let browser use its native AudioContext sample rate; Vosk resamples internally.
      audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      sourceNode = audioContext.createMediaStreamSource(mediaStream);

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
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (recognizer) {
      try {
        recognizer.retrieveFinalResult();
      } catch {
        // ignore
      }
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
    if (ownsCustomModel && model) {
      try {
        model.terminate();
      } catch {
        // ignore
      }
    }
    model = null;
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
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available');
  const ctx = new AudioCtx();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const model = await getOrLoadDefaultVoskModel();
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const recognizer = new model.KaldiRecognizer(sampleRate);

    const CHUNK_SIZE = 8192;
    const totalChunks = Math.max(1, Math.ceil(channelData.length / CHUNK_SIZE));
    const expectedMessages = totalChunks + 1; // N chunk replies + 1 retrieveFinalResult reply

    return await new Promise<string>((resolve, reject) => {
      const segments: string[] = [];
      let receivedMessages = 0;
      let settled = false;

      const finish = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimer);
        try {
          recognizer.remove();
        } catch {
          // ignore
        }
        if (err) {
          reject(err);
        } else {
          resolve(segments.join(' ').trim());
        }
      };

      const checkDone = () => {
        receivedMessages += 1;
        if (receivedMessages >= expectedMessages) {
          finish();
        }
      };

      recognizer.on('result', (msg: any) => {
        const text = msg?.result?.text?.trim();
        if (text) {
          segments.push(text);
        }
        checkDone();
      });

      recognizer.on('partialresult', () => {
        checkDone();
      });

      recognizer.on('error', (msg: any) => {
        finish(new Error(msg?.error || 'Offline speech recognition error'));
      });

      // Safety timeout for very slow devices (15s instead of premature 800ms)
      const safetyTimer = setTimeout(() => {
        finish();
      }, 15000);

      if (channelData.length === 0) {
        recognizer.acceptWaveformFloat(new Float32Array(160), sampleRate);
      } else {
        for (let offset = 0; offset < channelData.length; offset += CHUNK_SIZE) {
          const slice = channelData.subarray(
            offset,
            Math.min(offset + CHUNK_SIZE, channelData.length)
          );
          recognizer.acceptWaveformFloat(slice, sampleRate);
        }
      }
      recognizer.retrieveFinalResult();
    });
  } finally {
    try {
      await ctx.close();
    } catch {
      // ignore
    }
  }
}

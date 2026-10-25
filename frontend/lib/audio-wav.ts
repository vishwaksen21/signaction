/**
 * Browser-side audio standardization utility.
 * Decodes recorded or uploaded audio (WebM, OGG, MP4/AAC, FLAC, or non-standard WAV)
 * and resamples to 16 kHz mono 16-bit PCM WAV for Vosk STT compatibility.
 */

const TARGET_SAMPLE_RATE = 16000;

function isAlready16kHzMonoPcmWav(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 44) return false;
  const view = new DataView(buffer);
  const riff =
    String.fromCharCode(view.getUint8(0)) +
    String.fromCharCode(view.getUint8(1)) +
    String.fromCharCode(view.getUint8(2)) +
    String.fromCharCode(view.getUint8(3));
  const wave =
    String.fromCharCode(view.getUint8(8)) +
    String.fromCharCode(view.getUint8(9)) +
    String.fromCharCode(view.getUint8(10)) +
    String.fromCharCode(view.getUint8(11));

  if (riff !== 'RIFF' || wave !== 'WAVE') return false;

  const audioFormat = view.getUint16(20, true); // 1 = PCM
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  return (
    audioFormat === 1 &&
    numChannels === 1 &&
    sampleRate === TARGET_SAMPLE_RATE &&
    bitsPerSample === 16
  );
}

export function encodeWavPCM16(monoSamples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = monoSamples.length * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
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

export async function convertToWav16kHz(
  input: Blob | File,
  fallbackBaseName: string = 'recording'
): Promise<File> {
  const arrayBuffer = await input.arrayBuffer();
  const baseName =
    input instanceof File && input.name
      ? input.name.replace(/\.[^.]+$/, '')
      : fallbackBaseName;
  const wavName = `${baseName || fallbackBaseName}.wav`;

  if (isAlready16kHzMonoPcmWav(arrayBuffer)) {
    return input instanceof File && input.type === 'audio/wav' && input.name === wavName
      ? input
      : new File([arrayBuffer], wavName, { type: 'audio/wav' });
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available on this device');

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
    return new File([wavBlob], wavName, { type: 'audio/wav' });
  } finally {
    try {
      await ctx.close();
    } catch {
      // ignore
    }
  }
}


'use client';

import { useEffect, useRef, useState } from 'react';

interface SignViewerProps {
  url: string;
  onEnded?: () => void;
  /** Display duration in ms for static images/SVGs. Defaults to 3000. */
  durationMs?: number;
}

export function SignViewer({ url, onEnded, durationMs = 3000 }: SignViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play and restart when URL changes
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {}); // ignore autoplay policy errors silently
  }, [url]);

  if (!url) {
    return <div className="py-8 text-sm text-slate-400">No gesture URL</div>;
  }

  const lower = url.toLowerCase();

  // For video files, use native playback with onEnded
  if (lower.endsWith('.mp4')) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <video
          ref={videoRef}
          src={url}
          className="max-h-[360px] w-auto rounded-lg object-contain"
          playsInline
          autoPlay
          muted
          onEnded={onEnded}
          onError={(e) => setError(`Video error: ${e.currentTarget.error?.message || 'Unknown'}`)}
        />
        {error && <div className="text-xs text-red-400 absolute bottom-2">{error}</div>}
      </div>
    );
  }

  // Keep latest onEnded in a ref to avoid resetting the timer if the function identity changes
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // For GIFs: try to detect actual duration by loading the GIF metadata
  // For SVGs/static images: use the specified duration
  useEffect(() => {
    if (!onEndedRef.current || lower.endsWith('.mp4')) return;

    // For GIFs, we attempt to read frame count from the GIF header
    // to calculate actual duration. Falls back to durationMs.
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function getGifDuration(): Promise<number> {
      if (!lower.endsWith('.gif')) return durationMs;

      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const buffer = await blob.arrayBuffer();
        const view = new DataView(buffer);

        // GIF header: skip 6 bytes signature + 7 bytes logical screen descriptor
        // Then read each block
        let offset = 13; // Skip header + LSD
        let totalDelay = 0;
        let frameCount = 0;

        while (offset < buffer.byteLength) {
          const blockType = view.getUint8(offset);
          offset += 1;

          if (blockType === 0x21) {
            // Extension block
            const extType = view.getUint8(offset);
            offset += 1;

            if (extType === 0xF9) {
              // Graphic Control Extension (animation timing)
              const packed = view.getUint8(offset + 1);
              const delay = view.getUint16(offset + 2, true); // little-endian, in centiseconds
              const delayMs = delay * 10; // convert centiseconds to milliseconds
              totalDelay += delayMs > 0 ? delayMs : 100; // default 100ms per frame if 0
              frameCount += 1;
              offset += 6; // Skip GCE block
            } else {
              // Other extension - skip sub-blocks
              offset += 1; // skip block size
              while (offset < buffer.byteLength && view.getUint8(offset) !== 0) {
                offset += view.getUint8(offset) + 1;
              }
              offset += 1; // skip terminator
            }
          } else if (blockType === 0x2C) {
            // Image descriptor - skip
            offset += 9; // 9 bytes of image descriptor
            // Skip LZW minimum code size
            offset += 1;
            // Skip sub-blocks
            while (offset < buffer.byteLength && view.getUint8(offset) !== 0) {
              offset += view.getUint8(offset) + 1;
            }
            offset += 1; // skip terminator
          } else if (blockType === 0x3B) {
            // Trailer
            break;
          } else {
            // Unknown block - skip
            break;
          }
        }

        if (frameCount > 0 && totalDelay > 0) {
          return totalDelay;
        }
      } catch {
        // If GIF parsing fails, use default
      }

      return durationMs;
    }

    getGifDuration().then((ms) => {
      if (cancelled) return;
      timer = setTimeout(() => {
        onEndedRef.current?.();
      }, ms);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [url, lower, durationMs]);

  return (
    <div className="space-y-2 w-full h-full flex items-center justify-center relative">
      <img
        src={url}
        alt="Sign gesture"
        className="max-h-[360px] w-auto rounded-lg object-contain"
        onError={(e) => {
          const msg = `Failed to load image. URL: ${url.substring(0, 60)}`;
          console.error(msg);
          setError(msg);
        }}
        onLoad={() => setError(null)}
      />
      {error && <div className="text-xs text-red-400 absolute bottom-2">{error}</div>}
    </div>
  );
}

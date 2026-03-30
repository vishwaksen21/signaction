'use client';

import { useEffect, useRef, useState } from 'react';

interface SignViewerProps {
  url: string;
  onEnded?: () => void;
}

export function SignViewer({ url, onEnded }: SignViewerProps) {
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
  if (lower.endsWith('.mp4')) {
    return (
      <div className="w-full h-full flex items-center justify-center">
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

  return (
    <div className="space-y-2 w-full h-full flex items-center justify-center">
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
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  );
}

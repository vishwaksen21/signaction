'use client';

import { useState } from 'react';

export function SignViewer({ url }: { url: string }) {
  const [error, setError] = useState<string | null>(null);

  if (!url) {
    return <div className="py-8 text-sm text-slate-400">No gesture URL</div>;
  }

  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4')) {
    return (
      <video
        src={url}
        className="max-h-[360px] w-auto rounded-lg"
        controls
        playsInline
        muted
        onError={(e) => setError(`Video error: ${e.currentTarget.error?.message || 'Unknown'}`)}
      />
    );
  }

  return (
    <div className="space-y-2">
      <img
        src={url}
        alt="Sign gesture"
        className="max-h-[360px] w-auto rounded-lg"
        onError={(e) => {
          const msg = `Failed to load image. URL length: ${url.length}. Type: ${url.substring(0, 50)}...`;
          console.error(msg);
          setError(msg);
        }}
        onLoad={() => setError(null)}
      />
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  );
}

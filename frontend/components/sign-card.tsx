'use client';

import { motion } from 'framer-motion';
import { SignViewer } from './sign-viewer';

export function SignCard({
  token,
  url,
  mediaType,
}: {
  token: string;
  url: string;
  mediaType: 'gif' | 'mp4' | 'img';
}) {
  return (
    <div
      className="store-utility-card h-full flex flex-col gap-sm"
    >
      {/* Content */}
      <div className="flex items-center justify-between">
        <span className="text-apple-body-strong text-apple-ink">
          {token}
        </span>
        <span className="configurator-chip border-apple-hairline border bg-apple-surface-pearl text-apple-ink-muted-80">
          {mediaType.toUpperCase()}
        </span>
      </div>

      {/* Image Container */}
      <div
        className="relative w-full aspect-video md:aspect-square rounded-lg border border-apple-hairline bg-apple-canvas-parchment overflow-hidden flex items-center justify-center"
      >
        <div className="w-full h-full">
          <SignViewer url={url} />
        </div>
      </div>
    </div>
  );
}

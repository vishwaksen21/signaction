'use client';

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
    <div className="sign-card p-4 h-full flex flex-col gap-3 group hover:border-sign-bright/40 transition-all duration-300">
      {/* Header info */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-base text-sign-darktext dark:text-white tracking-wide truncate">
          {token}
        </span>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sign-verylight dark:bg-sign-navy/50 text-sign-blue dark:text-sign-cyan border border-sign-border/60">
          {mediaType}
        </span>
      </div>

      {/* Video Container */}
      <div className="relative w-full aspect-video md:aspect-square rounded-2xl border border-sign-border/60 bg-sign-soft/70 dark:bg-slate-900/60 overflow-hidden flex items-center justify-center group-hover:shadow-inner transition-all">
        <div className="w-full h-full flex items-center justify-center">
          <SignViewer url={url} />
        </div>
      </div>
    </div>
  );
}


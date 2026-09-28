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
    <div className="sign-card p-5 h-full flex flex-col gap-3.5 group hover:border-[#0757E8]/40 transition-all duration-200">
      {/* Header info */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading font-bold text-base text-[#062B5C] dark:text-white tracking-tight truncate">
          {token}
        </span>
        <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] border border-blue-200/70 dark:border-blue-900/50">
          {mediaType}
        </span>
      </div>

      {/* Video Container */}
      <div className="relative w-full aspect-video md:aspect-square rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 overflow-hidden flex items-center justify-center transition-all">
        <div className="w-full h-full flex items-center justify-center">
          <SignViewer url={url} />
        </div>
      </div>
    </div>
  );
}


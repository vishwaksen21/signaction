'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2, Video } from 'lucide-react';
import { SignViewer } from './sign-viewer';

export function SignCard({
  token,
  url,
  mediaType,
  onClick,
}: {
  token: string;
  url: string;
  mediaType: 'gif' | 'mp4' | 'img';
  onClick?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy loading via IntersectionObserver: only mount video when near viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Pause when scrolled out of view to save battery & decoders
          setIsPlaying(false);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsPlaying(true)}
      onMouseLeave={() => setIsPlaying(false)}
      className="sign-card p-4 sm:p-5 h-full flex flex-col gap-3 group hover:border-[#0757E8]/40 hover:shadow-sm transition-all duration-150 cursor-pointer select-none relative"
    >
      {/* Header info */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading font-extrabold text-base sm:text-lg text-[#062B5C] dark:text-white tracking-tight truncate group-hover:text-[#0757E8] dark:group-hover:text-[#38BDF8] transition-colors">
          {token}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isPlaying && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900">
            {mediaType}
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full aspect-video md:aspect-square rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 overflow-hidden flex items-center justify-center transition-all">
        {isVisible ? (
          <div className="w-full h-full flex items-center justify-center">
            <SignViewer
              url={url}
              playing={isPlaying}
              loop={true}
              preload="metadata"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/50 text-slate-400">
            <span className="font-heading font-extrabold text-3xl text-slate-300 dark:text-slate-700">
              {token.slice(0, 2)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Video size={13} />
              Gesture preview
            </span>
          </div>
        )}

        {/* Play/Pause Overlay Controls */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? `Pause ${token} gesture` : `Play ${token} gesture`}
            className="w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-xs border border-slate-200 dark:border-slate-700 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center transition-colors active:scale-95 focus-ring"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          {onClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              aria-label={`Expand ${token} gesture`}
              className="w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#0757E8] flex items-center justify-center transition-colors active:scale-95 focus-ring"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>

        {/* Tap to play zone */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer group-hover:bg-black/5 transition-colors"
          />
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 font-medium pt-0.5">
        <span className="truncate">Tap to {isPlaying ? 'pause' : 'play'}</span>
        <span className="text-[#0757E8] dark:text-[#38BDF8] font-semibold group-hover:underline">
          View details →
        </span>
      </div>
    </div>
  );
}

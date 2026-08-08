'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface SignViewerProps {
  url: string;
  onEnded?: () => void;
  /** Display duration in ms for static images/SVGs. Defaults to 3000. */
  durationMs?: number;
  playing?: boolean;
}

function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2]?.length === 11) ? match[2] : null;
}

export function SignViewer({ url, onEnded, durationMs = 3000, playing = false }: SignViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  
  // Keep latest onEnded in a ref to avoid resetting the timer if the function identity changes
  const onEndedRef = useRef(onEnded);
  
  const lower = url ? url.toLowerCase() : '';
  const isYoutube = lower.includes('youtube.com') || lower.includes('youtu.be');
  const youtubeVideoId = isYoutube ? extractYoutubeVideoId(url) : null;
  const uniqueId = useMemo(() => {
    return youtubeVideoId ? `yt-player-${youtubeVideoId}-${Math.random().toString(36).substring(2, 9)}` : '';
  }, [youtubeVideoId]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Auto-play and restart when URL changes or playing state changes
  useEffect(() => {
    const el = videoRef.current;
    if (!el || isYoutube) return;
    if (playing) {
      if (el.ended) {
        el.currentTime = 0;
      }
      el.play().catch(() => {}); // ignore autoplay policy errors silently
    } else {
      el.pause();
    }
  }, [url, isYoutube, playing]);

  // YouTube API Integration for auto-advance on playback end
  useEffect(() => {
    if (!youtubeVideoId || !iframeRef.current) return;

    let cancelled = false;
    let player: any;
    let interval: ReturnType<typeof setInterval>;

    const onPlayerReady = () => {
      if (!iframeRef.current || cancelled) return;
      player = new (window as any).YT.Player(iframeRef.current, {
        events: {
          onReady: (event: any) => {
            if (cancelled) return;
            ytPlayerRef.current = event.target;
            if (playing) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0 && !cancelled) {
              onEndedRef.current?.();
            }
          },
          onError: () => {
            if (!cancelled) {
              setTimeout(() => {
                if (!cancelled) onEndedRef.current?.();
              }, 1500);
            }
          },
        },
      });
    };

    const checkYTApi = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        onPlayerReady();
        if (interval) clearInterval(interval);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      onPlayerReady();
    } else {
      interval = setInterval(checkYTApi, 100);
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      ytPlayerRef.current = null;
    };
  }, [youtubeVideoId]);

  // Play/Pause YouTube video dynamically on playing prop change
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (!player || !isYoutube) return;
    try {
      if (playing) {
        // If the video has already ended, seek to start before playing
        if (player.getPlayerState && player.getPlayerState() === 0) {
          player.seekTo(0);
        }
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch (e) {
      // ignore player state lookup errors before API is fully ready
    }
  }, [playing, isYoutube]);

  // Native video event listener with unmount check
  useEffect(() => {
    const el = videoRef.current;
    if (!el || isYoutube) return;

    let cancelled = false;
    const handleVideoEnded = () => {
      if (!cancelled) {
        onEndedRef.current?.();
      }
    };

    el.addEventListener('ended', handleVideoEnded);
    return () => {
      cancelled = true;
      el.removeEventListener('ended', handleVideoEnded);
    };
  }, [url, isYoutube]);

  // For GIFs: try to detect actual duration by loading the GIF metadata
  // For SVGs/static images: use the specified duration
  useEffect(() => {
    if (!url || !onEndedRef.current || lower.endsWith('.mp4') || isYoutube || !playing) return;

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
          return totalDelay + 300; // Add 300ms buffer to offset browser decode delay and slide crossfade duration
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
  }, [url, lower, durationMs, isYoutube]);

  // Now, place conditional renders AFTER all hook calls
  if (!url) {
    return <div className="py-8 text-sm text-slate-400">No gesture URL</div>;
  }

  // For YouTube embeds
  if (isYoutube && youtubeVideoId) {
    return (
      <div className="w-full h-full relative">
        <iframe
          ref={iframeRef}
          id={uniqueId}
          src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=1&mute=1&controls=1&rel=0`}
          className="w-full h-full border-0 rounded-lg"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  // For video files, use native playback
  if (lower.endsWith('.mp4')) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <video
          ref={videoRef}
          src={url}
          className="max-h-[360px] w-auto rounded-lg object-contain"
          playsInline
          preload="auto"
          autoPlay
          muted
          onError={(e) => setError(`Video error: ${e.currentTarget.error?.message || 'Unknown'}`)}
        />
        {error && <div className="text-xs text-red-400 absolute bottom-2">{error}</div>}
      </div>
    );
  }

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

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SignViewerProps {
  url: string;
  onEnded?: () => void;
  /** Display duration in ms for static images/SVGs. Defaults to 3000. */
  durationMs?: number;
  playing?: boolean;
}

function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id.length === 11 ? id : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');

      if (id && id.length === 11) {
        return id;
      }

      // /embed/VIDEO_ID
      const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);

      if (embedMatch && embedMatch[1].length === 11) {
        return embedMatch[1];
      }

      // /shorts/VIDEO_ID
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/]+)/);

      if (shortsMatch && shortsMatch[1].length === 11) {
        return shortsMatch[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function SignViewer({ url, onEnded, durationMs = 3000, playing = false }: SignViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const endedRef = useRef(false);
  const playingRef = useRef(playing);
  
  // Keep latest onEnded in a ref to avoid resetting the timer if the function identity changes
  const onEndedRef = useRef(onEnded);
  
  const lower = url ? url.toLowerCase() : '';
  const isYoutube = lower.includes('youtube.com') || lower.includes('youtu.be');
  const youtubeVideoId = isYoutube ? extractYoutubeVideoId(url) : null;

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    endedRef.current = false;
  }, [url]);

  const handleEndedOnce = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEndedRef.current?.();
  }, []);

  // Auto-play and restart when URL changes or playing state changes
  useEffect(() => {
    const el = videoRef.current;
    if (!el || isYoutube) return;

    if (playing) {
      // Reset to start, then play with retry
      el.currentTime = 0;
      setError(null);

      let cancelled = false;

      const tryPlay = () => {
        if (cancelled || !el) return;
        el.play().catch(() => {
          // Retry after delay (Android WebView needs this)
          setTimeout(() => {
            if (!cancelled && el) el.play().catch(() => {});
          }, 200);
        });
      };

      // Try to play immediately
      tryPlay();

      // Also try on canplay as backup
      const onCanPlay = () => { if (!cancelled) tryPlay(); };
      el.addEventListener('canplay', onCanPlay, { once: true });

      // Safety net: if still paused after 300ms, try again
      const fallback = setTimeout(() => {
        if (!cancelled && el && el.paused) tryPlay();
      }, 300);

      return () => {
        cancelled = true;
        clearTimeout(fallback);
        el.removeEventListener('canplay', onCanPlay);
      };
    } else {
      el.pause();
    }
  }, [url, isYoutube, playing]);

  // YouTube player
  useEffect(() => {
    if (!youtubeVideoId || !youtubeContainerRef.current) {
      return;
    }

    let cancelled = false;
    let player: any = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let hasStarted = false;

    const createPlayer = () => {
      if (
        cancelled ||
        !youtubeContainerRef.current ||
        !(window as any).YT?.Player
      ) {
        return;
      }

      // Don't create twice
      if (ytPlayerRef.current) {
        return;
      }

      player = new (window as any).YT.Player(
        youtubeContainerRef.current,
        {
          videoId: youtubeVideoId,

          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },

          events: {
            onReady: (event: any) => {
              if (cancelled) return;

              ytPlayerRef.current = event.target;

              if (playingRef.current) {
                event.target.playVideo();
              }
            },

            onStateChange: (event: any) => {
              if (cancelled) return;

              // PLAYING
              if (event.data === 1) {
                hasStarted = true;
                return;
              }

              // ENDED
              if (event.data === 0 && hasStarted) {
                handleEndedOnce();
              }
            },

            onError: (event: any) => {
              console.error(
                'YouTube playback error:',
                event.data,
                'videoId:',
                youtubeVideoId
              );
            },
          },
        }
      );
    };

    const checkYouTubeAPI = () => {
      if (
        (window as any).YT &&
        (window as any).YT.Player
      ) {
        createPlayer();

        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // API already loaded
    if (
      (window as any).YT &&
      (window as any).YT.Player
    ) {
      createPlayer();
    } else {
      // Load API once
      if (
        !document.getElementById(
          'youtube-iframe-api-script'
        )
      ) {
        const script = document.createElement('script');

        script.id = 'youtube-iframe-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;

        document.head.appendChild(script);
      }

      // Wait until API is ready
      interval = setInterval(
        checkYouTubeAPI,
        100
      );
    }

    return () => {
      cancelled = true;

      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (
        player &&
        typeof player.destroy === 'function'
      ) {
        try {
          player.destroy();
        } catch (error) {
          console.warn(
            'Failed to destroy YouTube player',
            error
          );
        }
      }

      player = null;
      ytPlayerRef.current = null;
    };
  }, [youtubeVideoId, handleEndedOnce]);

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
        handleEndedOnce();
      }, ms);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [url, lower, durationMs, isYoutube, playing, handleEndedOnce]);

  // Now, place conditional renders AFTER all hook calls
  if (!url) {
    return <div className="py-8 text-sm text-slate-400">No gesture URL</div>;
  }

  // For YouTube embeds
  if (isYoutube && youtubeVideoId) {
    return (
      <div className="w-full h-full relative">
        <div
          ref={youtubeContainerRef}
          className="w-full h-full"
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
          className="w-full h-full rounded-lg object-contain"
          playsInline
          webkit-playsinline="true"
          preload="auto"
          autoPlay
          muted
          controls={false}
          disablePictureInPicture
          onLoadedData={() => setError(null)}
          onEnded={handleEndedOnce}
          onError={(e) => {
            const video = e.currentTarget;
            const err = video.error;

            console.error('MP4 playback error:', {
              url,
              errorCode: err?.code,
              errorMessage: err?.message,
            });

            setError(
              `Playback error${err?.code ? ` (${err.code})` : ''}`
            );
          }}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <div className="text-center px-4">
              <div className="text-2xl mb-1 opacity-50">🎬</div>
              <span className="text-xs text-white/80 bg-black/50 px-3 py-1.5 rounded-full">{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <img
        src={url}
        alt="Sign gesture"
        className="w-full h-full rounded-lg object-contain"
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

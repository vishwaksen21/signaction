'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SignViewerProps {
  url: string;
  onEnded?: () => void;
  /** Display duration in ms for static images/SVGs. Defaults to 3000. */
  durationMs?: number;
  playing?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  controls?: boolean;
  muted?: boolean;
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

export function SignViewer({
  url,
  onEnded,
  durationMs = 3000,
  playing = false,
  loop = false,
  preload = 'auto',
  controls = false,
  muted = true,
}: SignViewerProps) {
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
      // Reset to start if already loaded, then play with retry
      if (el.currentTime !== 0 && el.readyState >= 1) {
        try {
          el.currentTime = 0;
        } catch {
          // ignore
        }
      }
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

      // Create an isolated mount point so player.destroy() doesn't remove the React-managed container
      const container = youtubeContainerRef.current;
      container.innerHTML = '';
      const mountPoint = document.createElement('div');
      mountPoint.style.width = '100%';
      mountPoint.style.height = '100%';
      container.appendChild(mountPoint);

      player = new (window as any).YT.Player(mountPoint, {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
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
            // Fallback to direct iframe embed on error 150/101
            if (youtubeContainerRef.current) {
              youtubeContainerRef.current.innerHTML = `
                <iframe
                  src="https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&playsinline=1"
                  class="w-full h-full rounded-lg"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              `;
            }
          },
        },
      });
    };

    const checkYouTubeAPI = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        createPlayer();
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // API already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      // Load API once
      if (!document.getElementById('youtube-iframe-api-script')) {
        const script = document.createElement('script');
        script.id = 'youtube-iframe-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }

      // Wait until API is ready
      interval = setInterval(checkYouTubeAPI, 100);
    }

    // Safety fallback: if YT API doesn't initialize within 2 seconds (e.g. adblocker, network), embed direct iframe
    const fallbackTimer = setTimeout(() => {
      if (cancelled || ytPlayerRef.current || !youtubeContainerRef.current) return;
      const container = youtubeContainerRef.current;
      container.innerHTML = `
        <iframe
          src="https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&playsinline=1"
          class="w-full h-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);

      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch {
          // ignore
        }
      }

      if (youtubeContainerRef.current) {
        youtubeContainerRef.current.innerHTML = '';
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

  const handleMetadataOrCanPlay = useCallback(() => {
    setError(null);
    const el = videoRef.current;
    if (!el) return;
    // On mobile / Android WebView, cue to 0.001s to force first frame to paint
    if (!playing && el.currentTime === 0) {
      try {
        el.currentTime = 0.001;
      } catch {
        // ignore
      }
    }
  }, [playing]);

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
          preload={preload}
          autoPlay={playing}
          muted={muted}
          loop={loop}
          controls={controls}
          disablePictureInPicture
          onLoadedMetadata={handleMetadataOrCanPlay}
          onCanPlay={handleMetadataOrCanPlay}
          onLoadedData={() => setError(null)}
          onEnded={loop ? undefined : handleEndedOnce}
          onError={(e) => {
            const video = e.currentTarget;
            const err = video.error;

            console.error('MP4 playback error:', {
              url,
              errorCode: err?.code,
              errorMessage: err?.message,
            });

            setError('Gesture unavailable');

            // Auto-advance sequence after clean display so sequence does not freeze
            if (!loop) {
              setTimeout(() => {
                handleEndedOnce();
              }, 1800);
            }
          }}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F4FAFF]/95 dark:bg-[#03133b]/95 p-6 rounded-[20px] z-20">
            <div className="text-center space-y-2 max-w-xs">
              <div className="mx-auto w-10 h-10 rounded-full bg-[#EAF9FF] dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center font-bold text-sm">
                !
              </div>
              <h4 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Gesture unavailable
              </h4>
              <p className="text-xs text-[#60759A] dark:text-slate-400">
                Try another translation or check the available sign assets.
              </p>
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
        onError={() => {
          setError('Gesture unavailable');
        }}
        onLoad={() => setError(null)}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F4FAFF]/95 dark:bg-[#03133b]/95 p-6 rounded-[20px] z-20">
          <div className="text-center space-y-2 max-w-xs">
            <div className="mx-auto w-10 h-10 rounded-full bg-[#EAF9FF] dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center font-bold text-sm">
              !
            </div>
            <h4 className="text-sm font-bold text-[#062B5C] dark:text-white">
              Gesture unavailable
            </h4>
            <p className="text-xs text-[#60759A] dark:text-slate-400">
              Try another translation or check the available sign assets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

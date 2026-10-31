'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Repeat, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export interface DualBufferGesturePlayerProps {
  gestures: string[];
  tokens?: string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  playbackSpeed?: 0.5 | 1.0;
  loop?: boolean;
  onSpeedChange?: (speed: 0.5 | 1.0) => void;
  onLoopChange?: (loop: boolean) => void;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

export function DualBufferGesturePlayer({
  gestures,
  tokens = [],
  currentIndex: externalIndex,
  onIndexChange,
  playbackSpeed = 1.0,
  loop = false,
  onSpeedChange,
  onLoopChange,
  className = '',
  showControls = true,
  autoPlay = true,
}: DualBufferGesturePlayerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [internalSpeed, setInternalSpeed] = useState<0.5 | 1.0>(playbackSpeed);
  const [internalLoop, setInternalLoop] = useState<boolean>(loop);

  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  // Slot URLs
  const [slotAUrl, setSlotAUrl] = useState<string>('');
  const [slotBUrl, setSlotBUrl] = useState<string>('');

  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const speed = onSpeedChange ? playbackSpeed : internalSpeed;
  const isLooping = onLoopChange ? loop : internalLoop;

  // Sync external index changes (e.g. user taps a token chip)
  const prevExternalIndexRef = useRef(externalIndex);
  useEffect(() => {
    if (externalIndex !== undefined && externalIndex !== prevExternalIndexRef.current) {
      prevExternalIndexRef.current = externalIndex;
      setInternalIndex(externalIndex);

      if (gestures[externalIndex]) {
        // Load into active slot immediately
        if (activeSlot === 'A') {
          setSlotAUrl(gestures[externalIndex]);
          setSlotBUrl(gestures[externalIndex + 1] ?? (isLooping ? gestures[0] ?? '' : ''));
          if (videoRefA.current) {
            videoRefA.current.currentTime = 0;
            videoRefA.current.play().catch(() => {});
          }
        } else {
          setSlotBUrl(gestures[externalIndex]);
          setSlotAUrl(gestures[externalIndex + 1] ?? (isLooping ? gestures[0] ?? '' : ''));
          if (videoRefB.current) {
            videoRefB.current.currentTime = 0;
            videoRefB.current.play().catch(() => {});
          }
        }
        setIsPlaying(true);
      }
    }
  }, [externalIndex, gestures, activeSlot, isLooping]);

  // When a new gestures array arrives, initialize slots
  const gesturesKey = gestures.join('|');
  useEffect(() => {
    if (gestures.length === 0) {
      setSlotAUrl('');
      setSlotBUrl('');
      setInternalIndex(0);
      setIsPlaying(false);
      return;
    }

    setInternalIndex(0);
    setActiveSlot('A');
    setSlotAUrl(gestures[0] || '');
    setSlotBUrl(gestures[1] || (gestures.length > 1 ? gestures[1] : (isLooping ? gestures[0] : '')));
    setIsPlaying(autoPlay);
  }, [gesturesKey, gestures, gestures.length, autoPlay, isLooping]);

  // Apply playback speed to both video elements
  useEffect(() => {
    if (videoRefA.current) videoRefA.current.playbackRate = speed;
    if (videoRefB.current) videoRefB.current.playbackRate = speed;
  }, [speed, slotAUrl, slotBUrl]);

  // Apply play/pause state
  useEffect(() => {
    const activeVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;
    if (!activeVideo) return;

    if (isPlaying) {
      activeVideo.play().catch(() => {});
    } else {
      activeVideo.pause();
    }
  }, [isPlaying, activeSlot]);

  // Seamless crossfade handler when a video finishes
  const handleVideoEnded = useCallback(
    (slot: 'A' | 'B') => {
      // Ignore if not from the currently visible slot
      if (slot !== activeSlot) return;

      const nextIndex = activeIndex + 1;

      if (nextIndex < gestures.length) {
        // We have a next gesture in sequence
        const nextNextIndex = nextIndex + 1 < gestures.length ? nextIndex + 1 : (isLooping ? 0 : -1);
        const nextNextUrl = nextNextIndex >= 0 ? gestures[nextNextIndex] ?? '' : '';

        if (slot === 'A') {
          // Crossfade to B
          if (videoRefB.current) {
            videoRefB.current.currentTime = 0;
            videoRefB.current.playbackRate = speed;
            videoRefB.current.play().catch(() => {});
          }
          setActiveSlot('B');
          // Prime A with next-next gesture
          setSlotAUrl(nextNextUrl);
        } else {
          // Crossfade to A
          if (videoRefA.current) {
            videoRefA.current.currentTime = 0;
            videoRefA.current.playbackRate = speed;
            videoRefA.current.play().catch(() => {});
          }
          setActiveSlot('A');
          // Prime B with next-next gesture
          setSlotBUrl(nextNextUrl);
        }

        setInternalIndex(nextIndex);
        onIndexChange?.(nextIndex);
      } else {
        // Reached end of sequence
        if (isLooping && gestures.length > 0) {
          if (gestures.length === 1) {
            // Single video loop
            const activeVid = slot === 'A' ? videoRefA.current : videoRefB.current;
            if (activeVid) {
              activeVid.currentTime = 0;
              activeVid.play().catch(() => {});
            }
          } else {
            // Loop multi-gesture sequence from start
            if (slot === 'A') {
              if (videoRefB.current) {
                videoRefB.current.currentTime = 0;
                videoRefB.current.playbackRate = speed;
                videoRefB.current.play().catch(() => {});
              }
              setActiveSlot('B');
              setSlotAUrl(gestures[1] ?? '');
            } else {
              if (videoRefA.current) {
                videoRefA.current.currentTime = 0;
                videoRefA.current.playbackRate = speed;
                videoRefA.current.play().catch(() => {});
              }
              setActiveSlot('A');
              setSlotBUrl(gestures[1] ?? '');
            }
            setInternalIndex(0);
            onIndexChange?.(0);
          }
        } else {
          setIsPlaying(false);
        }
      }
    },
    [activeSlot, activeIndex, gestures, isLooping, onIndexChange, speed]
  );

  const handleTogglePlay = () => {
    triggerHaptic(10);
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    triggerHaptic(10);
    setInternalIndex(0);
    onIndexChange?.(0);
    setActiveSlot('A');
    setSlotAUrl(gestures[0] || '');
    setSlotBUrl(gestures[1] || (isLooping ? gestures[0] || '' : ''));
    if (videoRefA.current) {
      videoRefA.current.currentTime = 0;
      videoRefA.current.playbackRate = speed;
      videoRefA.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  const handleToggleSpeed = () => {
    triggerHaptic(10);
    const newSpeed: 0.5 | 1.0 = speed === 1.0 ? 0.5 : 1.0;
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    } else {
      setInternalSpeed(newSpeed);
    }
  };

  const handleToggleLoop = () => {
    triggerHaptic(10);
    const newLoop = !isLooping;
    if (onLoopChange) {
      onLoopChange(newLoop);
    } else {
      setInternalLoop(newLoop);
    }
  };

  const currentToken =
    tokens[activeIndex] ||
    (gestures[activeIndex]
      ? gestures[activeIndex].split('/').pop()?.replace('.mp4', '').replace(/_/g, ' ')
      : `SIGN ${activeIndex + 1}`);

  const hasGestures = gestures.length > 0;
  const progressPercent = hasGestures ? ((activeIndex + 1) / gestures.length) * 100 : 0;

  return (
    <div
      className={`relative w-full h-full bg-slate-950 overflow-hidden select-none flex items-center justify-center ${className}`}
    >
      {/* Active Video Slot A */}
      {slotAUrl ? (
        <video
          ref={videoRefA}
          key={`slot-A-${slotAUrl}`}
          src={slotAUrl}
          playsInline
          muted
          preload="auto"
          onEnded={() => handleVideoEnded('A')}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ease-out ${
            activeSlot === 'A' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        />
      ) : null}

      {/* Preloading Video Slot B */}
      {slotBUrl ? (
        <video
          ref={videoRefB}
          key={`slot-B-${slotBUrl}`}
          src={slotBUrl}
          playsInline
          muted
          preload="auto"
          onEnded={() => handleVideoEnded('B')}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ease-out ${
            activeSlot === 'B' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        />
      ) : null}

      {/* Sleek Top-Left Badge: TOKEN N/TOTAL • NAME + SPEED BADGE */}
      {hasGestures && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
              TOKEN {activeIndex + 1}/{gestures.length} • {currentToken}
            </span>
          </div>

          <div className="px-2 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-cyan-300 shadow-md">
            {speed.toFixed(1)}x
          </div>
        </div>
      )}

      {/* Overlaid Play Button when paused */}
      {!isPlaying && hasGestures && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute z-30 w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
          aria-label="Play video sequence"
        >
          <Play size={22} className="ml-0.5 fill-current" />
        </button>
      )}

      {/* Progress Bar Line */}
      {hasGestures && (
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15 z-30 pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Controls Bar Overlay */}
      {showControls && hasGestures && (
        <div className="absolute bottom-1 inset-x-0 z-30 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between gap-2">
          {/* Play/Pause & Replay */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-8 h-8 rounded-full nm-flat active:nm-inset text-white flex items-center justify-center active:scale-90 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="w-8 h-8 rounded-full nm-flat active:nm-inset text-white flex items-center justify-center active:scale-90 transition-transform"
              title="Replay sequence"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Speed & Loop Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSpeed}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all active:scale-95 ${
                speed === 0.5
                  ? 'nm-inset text-indigo-400 nm-led-indigo'
                  : 'nm-flat active:nm-inset text-slate-200'
              }`}
            >
              {speed === 0.5 ? '0.5x Slow-Mo' : '1.0x'}
            </button>

            <button
              type="button"
              onClick={handleToggleLoop}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all active:scale-90 ${
                isLooping
                  ? 'nm-inset text-emerald-400 nm-led-emerald'
                  : 'nm-flat active:nm-inset text-slate-200'
              }`}
              title={isLooping ? 'Looping enabled' : 'Looping disabled'}
            >
              <Repeat size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

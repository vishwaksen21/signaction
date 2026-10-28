'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Mic,
  Moon,
  Sun,
  Smartphone,
  Cpu,
  Volume2,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { isNativeApk } from '@/lib/platform';

export function MobileSettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied' | 'testing'>('prompt');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isNativeApk());

    // Check mic permission state if supported
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permission) => {
          setMicStatus(permission.state as any);
          permission.onchange = () => {
            setMicStatus(permission.state as any);
          };
        })
        .catch(() => {});
    }
  }, []);

  const handleTestMicrophone = async () => {
    setMicStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('granted');

      // Create audio visualizer test
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let counter = 0;
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        const avg = Math.round(sum / dataArray.length);
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        counter++;
        if (counter > 30) {
          clearInterval(interval);
          stream.getTracks().forEach((t) => t.stop());
          audioCtx.close();
          setMicVolume(0);
        }
      }, 100);
    } catch {
      setMicStatus('denied');
      setMicVolume(0);
    }
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8 select-none">
      <div>
        <h1 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & AI Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Linear-style on-device diagnostics, hardware status, and app configuration.
        </p>
      </div>

      {/* 1. Offline AI Engine Telemetry Card with Storage Readiness Gauge */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu size={19} />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Offline AI Engine
              </h2>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                100% on-device neural translation
              </span>
            </div>
          </div>

          {/* Green Pulsing Active Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span>Active</span>
          </div>
        </div>

        {/* Visual Storage Readiness Gauge */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-[#1E293B]/60 border border-slate-900/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Engine Readiness</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Air-Gapped</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981]" />
          </div>
        </div>

        {/* Clean Key-Value Rows with JetBrains Mono Values */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/[0.06] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Speech AI Model (Vosk)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              39 MB (Bundled)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">ISL Video Gestures</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              349 Offline MP4s
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Grammar Rule Parser</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              SVO → SOV Gloss
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Cloud Bandwidth Needed</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              0 KB (Zero Network)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Microphone Hardware Diagnostic Card */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mic size={19} />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Microphone Hardware
              </h2>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                16 kHz mono audio capture
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
              micStatus === 'granted'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : micStatus === 'denied'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
                : micStatus === 'testing'
                ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            {micStatus === 'granted'
              ? 'Granted'
              : micStatus === 'denied'
              ? 'Denied'
              : micStatus === 'testing'
              ? 'Testing...'
              : 'Permission Required'}
          </span>
        </div>

        {/* Live Audio Level Feedback Bar when testing */}
        {micStatus === 'testing' && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-[#1E293B]/60 border border-slate-900/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 size={13} className="text-emerald-500 animate-pulse" />
                <span>Live Audio Input</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{micVolume}% dB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-75"
                style={{ width: `${micVolume}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleTestMicrophone}
          className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200/80 dark:hover:bg-[#283548] border border-slate-900/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Mic size={14} className="text-violet-500" />
          <span>{micStatus === 'testing' ? 'Listening to Input (3s)...' : 'Test Microphone Hardware'}</span>
        </button>
      </div>

      {/* 3. Appearance Card */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500/15 to-pink-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sun size={19} />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Appearance
              </h2>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Adaptive dual glass theme
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-[#1E293B] border border-slate-900/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-white flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Sun size={14} className="hidden dark:block text-amber-400" />
            <Moon size={14} className="block dark:hidden text-violet-600" />
            <span>Switch Theme</span>
          </button>
        </div>
      </div>

      {/* 4. App Information Footer (Linear Telemetry Style) */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-900/[0.06] dark:border-white/[0.08] shadow-xs space-y-2.5 text-xs">
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-white/[0.06]">
          <Smartphone size={16} className="text-violet-600 dark:text-cyan-400" />
          <h2 className="font-heading font-bold text-slate-900 dark:text-white">
            Build Telemetry & Platform
          </h2>
        </div>

        <div className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span>Application</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              SignAction (Play Edition • ISL)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Package ID</span>
            <span className="text-slate-900 dark:text-white">com.signaction.app</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Version & Build</span>
            <span className="text-slate-900 dark:text-white">v1.0 • Build 2026.10</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Capacitor Runtime</span>
            <span className="text-slate-900 dark:text-white">v8.5.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target OS</span>
            <span className="text-slate-900 dark:text-white">Android API 36</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-10 select-none">
      <div>
        <h1 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & AI Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tactile on-device diagnostics, hardware status, and app configuration.
        </p>
      </div>

      {/* 1. Offline AI Engine Telemetry Card with Storage Readiness Gauge */}
      <div className="nm-flat rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl nm-inset text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <Cpu size={20} />
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

          {/* Green Pulsing Active Badge in Debossed Well */}
          <div className="nm-inset rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] nm-led-emerald" />
            </span>
            <span>ACTIVE</span>
          </div>
        </div>

        {/* Visual Storage Readiness Gauge */}
        <div className="space-y-2 p-3.5 rounded-2xl nm-inset">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Engine Readiness</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Air-Gapped</span>
          </div>
          <div className="w-full h-2.5 rounded-full nm-inset p-0.5 overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981] nm-led-emerald" />
          </div>
        </div>

        {/* Clean Key-Value Rows on Recessed Data Strips */}
        <div className="space-y-2 text-xs font-mono">
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Speech AI Model (Vosk)</span>
            <span className="font-bold text-slate-900 dark:text-white">39 MB (Bundled)</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">ISL Video Gestures</span>
            <span className="font-bold text-slate-900 dark:text-white">349 Offline MP4s</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Grammar Rule Parser</span>
            <span className="font-bold text-slate-900 dark:text-white">SVO → SOV Gloss</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Cloud Bandwidth Needed</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">0 KB (Zero Network)</span>
          </div>
        </div>
      </div>

      {/* 2. Microphone Hardware Diagnostic Card */}
      <div className="nm-flat rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl nm-inset text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
              <Mic size={20} />
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

          <div
            className={`nm-inset rounded-full px-3 py-1.5 text-[10px] font-mono font-bold ${
              micStatus === 'granted'
                ? 'text-emerald-600 dark:text-emerald-400'
                : micStatus === 'denied'
                ? 'text-red-500'
                : micStatus === 'testing'
                ? 'text-indigo-500 animate-pulse'
                : 'text-slate-500'
            }`}
          >
            {micStatus === 'granted'
              ? 'GRANTED'
              : micStatus === 'denied'
              ? 'DENIED'
              : micStatus === 'testing'
              ? 'TESTING...'
              : 'READY'}
          </div>
        </div>

        {/* Audio Level Testing Meter: Recessed LED vu-meter bar */}
        {micStatus === 'testing' && (
          <div className="space-y-2 p-3.5 rounded-2xl nm-inset">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 size={13} className="text-emerald-500 animate-pulse" />
                <span>Live Audio Input (VU Meter)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{micVolume}% dB</span>
            </div>
            <div className="w-full h-3 rounded-full nm-inset p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75 nm-led-emerald"
                style={{ width: `${Math.max(6, micVolume)}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleTestMicrophone}
          className="w-full py-3 rounded-2xl nm-flat active:nm-inset text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Mic size={15} className="text-indigo-500" />
          <span>{micStatus === 'testing' ? 'Listening to Input (3s)...' : 'Test Microphone Hardware'}</span>
        </button>
      </div>

      {/* 3. Appearance Card */}
      <div className="nm-flat rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl nm-inset text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <Sun size={20} />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                Tactile Appearance
              </h2>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? 'Dark Tactile Slate (#0F172A)' : 'Light Soft Clay (#E2E8F0)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="nm-flat active:nm-inset px-4 py-2 rounded-full text-xs font-mono font-bold text-slate-800 dark:text-white flex items-center gap-2 active:scale-95 transition-all"
          >
            <Sun size={14} className="hidden dark:block text-amber-400" />
            <Moon size={14} className="block dark:hidden text-indigo-600" />
            <span>Switch Theme</span>
          </button>
        </div>
      </div>

      {/* 4. App Information Footer (Hardware & Engine Telemetry Blocks) */}
      <div className="nm-flat rounded-3xl p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-300/40 dark:border-white/[0.06]">
          <Smartphone size={16} className="text-indigo-500 dark:text-indigo-400" />
          <h2 className="font-heading font-bold text-slate-900 dark:text-white">
            Build Telemetry & Hardware Spec
          </h2>
        </div>

        <div className="space-y-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Application</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              SignAction (Play Edition • ISL)
            </span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Package ID</span>
            <span className="text-slate-900 dark:text-white">com.signaction.app</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Version & Build</span>
            <span className="text-slate-900 dark:text-white">v1.0 • Build 2026.10</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Capacitor Runtime</span>
            <span className="text-slate-900 dark:text-white">v8.5.0 (UIScene Ready)</span>
          </div>
          <div className="nm-inset rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Target OS</span>
            <span className="text-slate-900 dark:text-white">Android API 36</span>
          </div>
        </div>
      </div>
    </div>
  );
}

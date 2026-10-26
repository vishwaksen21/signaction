'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Mic,
  Moon,
  Sun,
  Laptop,
  Wifi,
  WifiOff,
  Info,
  Smartphone,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  Heart,
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

      // Create quick audio visualizer test
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
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-heading font-extrabold text-[#062B5C] dark:text-white tracking-tight">
          Settings & Diagnostics
        </h1>
        <p className="text-xs text-[#60759A] dark:text-slate-400">
          Hardware permissions, offline model availability, and app configuration.
        </p>
      </div>

      {/* 1. Offline Engine Status Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Offline AI Engine
              </h2>
              <span className="text-[10px] text-[#60759A] dark:text-slate-400">
                100% on-device translation
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#60759A] dark:text-slate-400">Speech AI Model (Vosk)</span>
            <span className="font-mono font-bold text-[#062B5C] dark:text-white">
              39 MB (Bundled)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#60759A] dark:text-slate-400">ISL Video Gestures</span>
            <span className="font-mono font-bold text-[#062B5C] dark:text-white">
              349 Offline MP4s
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#60759A] dark:text-slate-400">Grammar Rule Parser</span>
            <span className="font-mono font-bold text-[#062B5C] dark:text-white">
              SVO to SOV Gloss
            </span>
          </div>
        </div>
      </div>

      {/* 2. Microphone Hardware Diagnostic */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
              <Mic size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Microphone Access
              </h2>
              <span className="text-[10px] text-[#60759A] dark:text-slate-400">
                Audio input for voice translation
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              micStatus === 'granted'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : micStatus === 'denied'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20'
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

        {/* Live Audio Level Meter when testing */}
        {micStatus === 'testing' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Input Level</span>
              <span>{micVolume}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${micVolume}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleTestMicrophone}
          className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#062B5C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-transform"
        >
          <Mic size={14} />
          <span>{micStatus === 'testing' ? 'Listening to Input (3s)...' : 'Test Microphone Hardware'}</span>
        </button>
      </div>

      {/* 3. Appearance & Theme */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sun size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#062B5C] dark:text-white">
                Appearance
              </h2>
              <span className="text-[10px] text-[#60759A] dark:text-slate-400">
                Light and dark theme
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[#062B5C] dark:text-white flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Sun size={14} className="hidden dark:block text-amber-400" />
            <Moon size={14} className="block dark:hidden text-[#0757E8]" />
            <span>Switch Theme</span>
          </button>
        </div>
      </div>

      {/* 4. Play Store App Information */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#07132C] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
          <Smartphone size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
          <h2 className="font-bold text-[#062B5C] dark:text-white">
            App Information
          </h2>
        </div>

        <div className="space-y-1.5 pt-1 text-[#60759A] dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>Application</span>
            <span className="font-semibold text-[#062B5C] dark:text-white">
              SignAction Android Play Edition
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Package ID</span>
            <span className="font-mono text-[#062B5C] dark:text-white">com.signaction.app</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="font-mono text-[#062B5C] dark:text-white">1.0 (Build 2026.10)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target OS</span>
            <span className="text-[#062B5C] dark:text-white">Android 15 / 16 (API 36)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Capacitor Runtime</span>
            <span className="text-[#062B5C] dark:text-white">v8.5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

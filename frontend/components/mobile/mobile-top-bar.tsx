'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import { isNativeApk } from '@/lib/platform';

// Root navigation tabs where the back button MUST NEVER appear
const ROOT_TABS = new Set([
  '/',
  '/translator',
  '/realtime',
  '/dictionary',
  '/offline-setup',
  '/settings',
]);

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [isNative, setIsNative] = useState(true);

  // Back button only visible inside deep drill-down sub-pages, NOT root tabs
  const isDeepDrillDown = !ROOT_TABS.has(pathname);

  useEffect(() => {
    setIsNative(isNativeApk());
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)] bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-900/[0.06] dark:border-white/[0.08] select-none transition-colors duration-200">
      <div className="flex items-center justify-between h-14 px-3.5 max-w-lg mx-auto">
        {/* Left: Brand or Deep Drill-down Back Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isDeepDrillDown && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-white/[0.06] border border-slate-900/[0.06] dark:border-white/[0.08] hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150 touch-manipulation"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2.5 group min-w-0 active:scale-[0.98] transition-transform duration-150"
          >
            {/* Sleek App Emblem with Subtle Neural Gradient Border */}
            <div className="relative p-[1.5px] rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] shadow-xs shrink-0">
              <div className="w-7 h-7 rounded-[10px] overflow-hidden flex items-center justify-center bg-white dark:bg-[#111827]">
                <Image
                  src="/logo.png"
                  alt="SignAction Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain p-0.5"
                  priority
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="font-heading font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white tracking-tight">
                Sign<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4]">Action</span>
              </span>
              <sup className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 border border-violet-500/25 dark:border-cyan-400/25 text-violet-700 dark:text-cyan-300 ml-1.5 tracking-wider uppercase">
                ISL AI
              </sup>
            </div>
          </Link>
        </div>

        {/* Right: Glassmorphic Neural Status Pill & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/offline-setup"
            aria-label="On-Device Neural Engine Status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 dark:border-emerald-400/25 text-emerald-700 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95 transition-transform duration-150"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="tracking-tight font-semibold">On-Device AI</span>
          </Link>

          {!isNative && (
            <Link
              href="/?mode=desktop"
              aria-label="Switch to Website view"
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-[#1E293B] border border-slate-900/[0.06] dark:border-white/[0.08] active:scale-95 transition-transform"
              title="Return to full website view"
            >
              Web
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 dark:bg-[#1E293B]/80 border border-slate-900/[0.06] dark:border-white/[0.08] active:scale-90 transition-transform duration-150 touch-manipulation"
          >
            <Sun size={15} className="hidden dark:block text-amber-400" />
            <Moon size={15} className="block dark:hidden text-violet-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

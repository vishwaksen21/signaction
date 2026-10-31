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
    <header className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)] bg-[#E2E8F0] dark:bg-[#0F172A] select-none transition-colors duration-200">
      <div className="flex items-center justify-between h-14 px-3.5 max-w-lg mx-auto">
        {/* Left: Brand or Deep Drill-down Back Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isDeepDrillDown && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 nm-flat active:nm-inset active:scale-95 transition-all duration-150 touch-manipulation"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2.5 group min-w-0 active:scale-[0.98] transition-transform duration-150"
          >
            {/* Sleek App Emblem inside extruded tactile well */}
            <div className="w-8 h-8 rounded-xl nm-flat flex items-center justify-center p-1 shrink-0">
              <Image
                src="/logo.png"
                alt="SignAction Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div className="flex items-center">
              <span className="font-heading font-extrabold text-[17px] leading-tight text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
                Sign<span className="text-indigo-600 dark:text-indigo-400">Action</span>
              </span>
              <sup className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md nm-inset text-indigo-600 dark:text-indigo-400 ml-1.5 tracking-wider uppercase">
                ISL AI
              </sup>
            </div>
          </Link>
        </div>

        {/* Right: Debossed Status Well & Extruded Theme Toggle Disc */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/offline-setup"
            aria-label="On-Device Neural Engine Status"
            className="nm-inset rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] nm-led-emerald" />
            </span>
            <span className="tracking-tight font-semibold">On-Device AI</span>
          </Link>

          {!isNative && (
            <Link
              href="/?mode=desktop"
              aria-label="Switch to Website view"
              className="nm-flat active:nm-inset rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
              title="Return to full website view"
            >
              Web
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="nm-flat active:nm-inset rounded-full w-10 h-10 flex items-center justify-center text-slate-700 dark:text-amber-400 active:scale-95 transition-all duration-150 touch-manipulation"
          >
            <Sun size={17} className="hidden dark:block text-amber-400" />
            <Moon size={17} className="block dark:hidden text-indigo-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

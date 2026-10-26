'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { ChevronLeft, Sun, Moon, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { isNativeApk } from '@/lib/platform';

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [isNative, setIsNative] = useState(true);
  const isSubPage = pathname !== '/';

  useEffect(() => {
    setIsNative(isNativeApk());
    const handleNetwork = () => setIsOnline(navigator.onLine);
    handleNetwork();
    window.addEventListener('online', handleNetwork);
    window.addEventListener('offline', handleNetwork);
    return () => {
      window.removeEventListener('online', handleNetwork);
      window.removeEventListener('offline', handleNetwork);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)] bg-white/92 dark:bg-[#050B14]/92 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 select-none">
      <div className="flex items-center justify-between h-14 px-3 max-w-lg mx-auto">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {isSubPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#062B5C] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-90 transition-transform duration-120 touch-manipulation"
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}

          <Link
            href="/"
            className="flex items-center gap-2 group min-w-0 active:scale-98 transition-transform duration-120"
          >
            <div className="relative w-7 h-7 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 shadow-xs">
              <Image
                src="/logo.png"
                alt="SignAction Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base leading-none text-[#062B5C] dark:text-white tracking-tight">
                Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
              </span>
              <span className="text-[9px] font-medium text-[#60759A] dark:text-slate-400 leading-tight">
                Play Edition • ISL
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Engine Status Pill & Dark Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/offline-setup"
            aria-label="Offline Engine Status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/25 dark:border-emerald-400/25 text-emerald-700 dark:text-emerald-300 active:scale-95 transition-transform duration-120"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Offline Ready</span>
          </Link>

          {!isNative && (
            <Link
              href="/?mode=desktop"
              aria-label="Switch to Website view"
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600 hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 active:scale-95 transition-transform"
              title="Return to full website view"
            >
              Web
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#60759A] hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 active:scale-90 transition-transform duration-120 touch-manipulation"
          >
            <Sun size={17} className="hidden dark:block text-amber-400" />
            <Moon size={17} className="block dark:hidden text-[#0757E8]" />
          </button>
        </div>
      </div>
    </header>
  );
}

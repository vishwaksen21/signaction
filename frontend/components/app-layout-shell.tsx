'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { BottomNav } from './bottom-nav';
import { ApkDownloadFab } from './apk-download-fab';
import { ServiceWorkerRegister } from './sw-register';
import { MobileTopBar } from './mobile/mobile-top-bar';
import { MobileBottomNav } from './mobile/mobile-bottom-nav';
import { useIsMobileApp } from '@/lib/platform';

interface AppLayoutShellProps {
  children: React.ReactNode;
}

export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const isMobileApp = useIsMobileApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  // 1. Mobile Android Application Shell
  if (isMobileApp) {
    return (
      <div className="flex-1 flex flex-col w-full min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100">
        <MobileTopBar />
        <main className="flex-1 flex flex-col w-full pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // 2. Desktop Website Shell
  return (
    <>
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 flex flex-col w-full overflow-x-clip">
        {children}
      </main>

      {/* Modern Footer */}
      <Footer />

      {/* Bottom navigation - responsive mobile web */}
      <BottomNav />

      {/* APK download FAB for web visitors */}
      <ApkDownloadFab />

      {/* Register service worker for offline PWA */}
      <ServiceWorkerRegister />
    </>
  );
}

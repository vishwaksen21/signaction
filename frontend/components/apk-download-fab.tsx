'use client';

import { Smartphone } from 'lucide-react';

export function ApkDownloadFab() {
  return (
    <a
      href="/download-apk"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 inline-flex items-center gap-2 bg-gradient-to-r from-sign-blue to-sign-cyan text-white px-4 py-2.5 rounded-full shadow-lg shadow-sign-blue/25 hover:shadow-xl hover:shadow-sign-cyan/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
      aria-label="Download SignAction Android APK"
    >
      <Smartphone size={16} />
      <span className="font-bold text-xs tracking-wider uppercase">Android APK</span>
    </a>
  );
}


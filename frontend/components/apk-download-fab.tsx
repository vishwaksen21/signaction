'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';
import {
  isNativeApk,
  isApkAlreadyDownloaded,
  markApkDownloaded,
  dismissApkPrompt,
  isStandalonePwa,
} from '@/lib/platform';

export function ApkDownloadFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If running in APK, standalone PWA, or already downloaded/dismissed, do NOT display
    if (isNativeApk() || isStandalonePwa() || isApkAlreadyDownloaded()) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center shadow-lg rounded-full">
      <a
        href="/download-apk"
        onClick={() => {
          markApkDownloaded();
          setVisible(false);
        }}
        className="inline-flex items-center gap-2 bg-[#0757E8] hover:bg-[#064BD1] text-white pl-4 pr-2.5 py-2.5 rounded-l-full font-semibold text-xs tracking-wider uppercase shadow-md transition-all duration-200 active:scale-95 focus-ring"
        aria-label="Download SignAction Android APK"
      >
        <Smartphone size={16} aria-hidden="true" />
        <span>Android APK</span>
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismissApkPrompt();
          setVisible(false);
        }}
        className="bg-[#0757E8] hover:bg-[#064BD1] text-white/80 hover:text-white px-2 py-2.5 rounded-r-full border-l border-white/20 transition-colors focus-ring"
        aria-label="Dismiss APK download prompt"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

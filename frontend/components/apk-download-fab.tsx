'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';
import {
  isNativeApk,
  isApkPromptDismissed,
  dismissApkPrompt,
  markApkDownloaded,
  OFFICIAL_APK_DOWNLOAD_URL,
  OFFICIAL_APK_SIZE_LABEL,
} from '@/lib/platform';

export function ApkDownloadFab() {
  const [isNative, setIsNative] = useState(true); // default hidden during SSR until client check
  const [minimized, setMinimized] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    // Hide inside the native APK
    if (isNativeApk()) {
      setIsNative(true);
      return;
    }

    setIsNative(false);
    if (isApkPromptDismissed()) {
      setMinimized(true);
    }
  }, []);

  if (isNative) return null;

  const handleDownload = () => {
    markApkDownloaded();
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
    }, 4000);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissApkPrompt();
    setMinimized(true);
  };

  // Minimized Floating Pill for mobile & desktop
  if (minimized) {
    return (
      <aside
        aria-label="Download Android App"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 md:right-6 z-40"
      >
        <div className="flex items-center gap-1 bg-white/95 dark:bg-[#07132C]/95 backdrop-blur-md border border-blue-200 dark:border-blue-900/60 text-[#0757E8] dark:text-[#12CFF3] shadow-lg rounded-full pl-3.5 pr-1.5 py-1 transition-[transform,box-shadow] duration-160 ease-apple hover:-translate-y-0.5 active:scale-[0.96]">
          <a
            href={OFFICIAL_APK_DOWNLOAD_URL}
            download="signaction.apk"
            onClick={handleDownload}
            className="flex items-center gap-2 py-1.5 text-xs font-heading font-bold"
            title={`Download SignAction Android APK (${OFFICIAL_APK_SIZE_LABEL})`}
          >
            <Smartphone size={15} className="text-[#0757E8] dark:text-[#12CFF3]" />
            <span>APK ({OFFICIAL_APK_SIZE_LABEL})</span>
            <Download size={13} />
          </a>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            aria-label="Expand APK prompt"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white focus-ring"
          >
            <span className="text-[10px] font-bold">▲</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Android App Download Banner"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-3 right-3 md:left-auto md:right-6 z-40 transition-[opacity,transform] duration-200 ease-apple"
    >
      <div className="bg-white/95 dark:bg-[#07132C]/95 backdrop-blur-xl border border-blue-200/90 dark:border-blue-800/80 rounded-2xl md:rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-[0_8px_30px_rgba(7,87,232,0.18)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2.5 max-w-md md:max-w-none mx-auto">
        
        {/* Left: App Icon & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#0757E8] to-[#12CFF3] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Smartphone size={18} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xs sm:text-sm text-[#062B5C] dark:text-white truncate">
                SignAction for Android
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3]">
                100% Offline
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
              347 ISL gestures bundled ({OFFICIAL_APK_SIZE_LABEL})
            </p>
          </div>
        </div>

        {/* Right: Download Button & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={OFFICIAL_APK_DOWNLOAD_URL}
            download="signaction.apk"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 bg-[#0757E8] hover:bg-[#064BD1] text-white font-semibold text-xs px-3.5 py-2 min-h-[38px] rounded-xl sm:rounded-full shadow-sm transition-[transform,background-color,box-shadow] duration-160 ease-apple active:scale-[0.96] focus-ring"
            aria-label={`Download SignAction Android APK (${OFFICIAL_APK_SIZE_LABEL})`}
          >
            {downloaded ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-300" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download</span>
              </>
            )}
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Minimize APK prompt"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            <X size={15} />
          </button>
        </div>

      </div>
    </aside>
  );
}

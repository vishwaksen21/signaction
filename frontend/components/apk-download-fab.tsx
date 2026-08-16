'use client';

import { Smartphone } from 'lucide-react';

export function ApkDownloadFab() {
  return (
    <a
      href="/download-apk"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-500 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
      aria-label="Download APK"
    >
      <Smartphone size={20} />
      <span className="font-semibold text-sm">Download APK</span>
    </a>
  );
}

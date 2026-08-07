'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Check, WifiOff, X } from 'lucide-react';
import { useOfflineTranslate } from '../hooks/use-offline-translate';

interface ModelDownloadBannerProps {
  onDismiss?: () => void;
}

export function ModelDownloadBanner({ onDismiss }: ModelDownloadBannerProps) {
  const {
    isModelReady,
    isDownloading,
    downloadProgress,
    downloadModel,
  } = useOfflineTranslate();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = !isModelReady && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6"
        >
          <div className="relative rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-5">
            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 p-1 text-blue-400 hover:text-blue-600 rounded-full"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                <WifiOff size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Enable Offline Mode
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Download the speech recognition model (~40MB) to translate
                  voice offline. No internet required after download.
                </p>

                {isDownloading ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Downloading... {downloadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={downloadModel}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download size={14} />
                    Download Model
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Small inline badge showing offline status.
 */
export function OfflineBadge() {
  const { isModelReady } = useOfflineTranslate();

  if (!isModelReady) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
      <Check size={10} />
      Offline Ready
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, X, ArrowRight } from 'lucide-react';
import { useOfflineStatus } from '../hooks/use-offline-status';

/**
 * Banner that prompts users to download for offline use.
 * Shows on every page until they complete the setup.
 * Dismissible, but reappears after 24 hours.
 */
export function OfflineSetupBanner() {
  const { isReady, isLoading } = useOfflineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    const dismissedAt = localStorage.getItem('offline-banner-dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }
  }, []);

  const shouldShow = mounted && !isLoading && !isReady && !dismissed;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('offline-banner-dismissed', String(Date.now()));
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="sticky top-16 z-40 bg-blue-600 text-white"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <WifiOff size={18} className="shrink-0" />
              <p className="text-sm font-medium truncate">
                <span className="hidden sm:inline">
                  Download SignAction for offline use — works without internet.
                </span>
                <span className="sm:hidden">Download for offline use</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/offline-setup"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors"
              >
                Download
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-white/70 hover:text-white rounded-full"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

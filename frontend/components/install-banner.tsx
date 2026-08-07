'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently (24 hours)
    try {
      const dismissedAt = localStorage.getItem('pwa-install-dismissed');
      if (dismissedAt) {
        const hoursSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          setDismissed(true);
          return;
        }
      }
    } catch {}

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    // If no event fires after 3 seconds, show banner anyway with manual instructions
    const timer = setTimeout(() => {
      if (!isInstalled && !dismissed) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, dismissed]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch {
        // Prompt failed, show manual instructions
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setDismissed(true);
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } catch {}
  }, []);

  if (isInstalled || !showBanner || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 shadow-lg"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Download size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">Install SignAction</p>
              <p className="text-xs text-indigo-200 truncate">
                {deferredPrompt 
                  ? 'Tap to install as an app'
                  : 'Add to home screen for offline use'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
              >
                Install
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
              >
                How to Install
                <ChevronRight size={16} />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

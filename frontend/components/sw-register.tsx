'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA offline support.
 * Runs once on app load, after DOM is ready.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let cleanupFn: (() => void) | undefined;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered, scope:', registration.scope);

        const onControllerChange = () => {
          console.log('[PWA] Service Worker controller changed');
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        // Check for updates periodically
        intervalId = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        cleanupFn = () => {
          if (intervalId) clearInterval(intervalId);
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        };
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    };

    const onLoad = () => {
      registerSW();
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      window.removeEventListener('load', onLoad);
      if (cleanupFn) cleanupFn();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}

'use client';

import { useEffect } from 'react';
import { isNativeApk } from '../lib/platform';

/**
 * Registers the service worker for PWA offline support.
 * Runs once on app load, after DOM is ready.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Native Capacitor APK serves bundled assets directly from WebViewLocalServer (https://localhost).
    // Never unregister or purge caches inside the native APK.
    if (isNativeApk()) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let cleanupFn: (() => void) | undefined;

    const isDevLocalhost =
      process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    if (isDevLocalhost) {
      // In Next.js dev mode, unregister active SWs to avoid HMR chunk staleness,
      // while preserving user-downloaded offline sign media ('signaction-v1').
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            if (name !== 'signaction-v1') {
              caches.delete(name);
            }
          }
        });
      }
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered, scope:', registration.scope);

        // If a new worker is waiting, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage('skipWaiting');
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage('skipWaiting');
              }
            });
          }
        });

        const onControllerChange = () => {
          console.log('[PWA] Service Worker controller changed');
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        // Check for updates periodically
        intervalId = setInterval(() => {
          registration.update().catch(() => {});
        }, 15 * 60 * 1000);

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

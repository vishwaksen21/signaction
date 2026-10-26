import { useState, useEffect } from 'react';

export const OFFICIAL_APK_DOWNLOAD_URL = '/signaction.apk';
export const OFFICIAL_APK_SIZE_LABEL = '92 MB';

export function isNativeApk(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Explicit Capacitor Native Platform Check
  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.() || cap?.getPlatform?.() === 'android') {
      return true;
    }
  } catch {
    // ignore
  }

  // 2. Capacitor Scheme & Origin (androidScheme: 'https' -> https://localhost or capacitor://)
  try {
    if (
      (window.location.origin === 'https://localhost' && window.location.port === '') ||
      window.location.protocol === 'capacitor:'
    ) {
      return true;
    }
  } catch {
    // ignore
  }

  // 3. Custom SignActionAPK user-agent flag injected in Android MainActivity
  try {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      if (/SignActionAPK/i.test(navigator.userAgent)) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  // 4. Stored native flag check
  try {
    if (sessionStorage.getItem('signaction_is_native_apk') === 'true') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Check if the user has dismissed the floating APK prompt for the current session.
 */
export function isApkPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApk()) return true;

  try {
    return sessionStorage.getItem('signaction_apk_dismissed') === 'true';
  } catch {
    return false;
  }
}

export function dismissApkPrompt(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('signaction_apk_dismissed', 'true');
    }
  } catch {
    // ignore
  }
}

export function markApkDownloaded(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('signaction_apk_downloaded_at', new Date().toISOString());
    }
  } catch {
    // ignore
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      (window.navigator as any).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * Determine whether the current view should render the dedicated native mobile app interface.
 * Returns true inside Capacitor Android APK, when ?mode=mobile / ?app=true is passed,
 * or when viewed on mobile screens (width <= 768px).
 */
export function isMobileAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApk()) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile' || params.get('app') === 'true') return true;
    if (params.get('mode') === 'desktop') return false;
    const stored = sessionStorage.getItem('signaction_display_mode');
    if (stored === 'mobile') return true;
    if (stored === 'desktop') return false;
    return window.innerWidth <= 768;
  } catch {
    return false;
  }
}

/**
 * React hook to reactively track whether the mobile app experience should be rendered.
 */
export function useIsMobileApp(): boolean {
  // Default to false during SSR, hydrate client-side
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setIsMobile(isMobileAppEnvironment());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isMobile;
}


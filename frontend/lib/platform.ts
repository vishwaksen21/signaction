/**
 * Platform and Native APK Detection Utilities
 * Detects whether the app is running inside the Android APK (Capacitor),
 * installed as a PWA, or if the user has already downloaded the APK.
 */

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

  // 2. Capacitor Scheme & Origin (androidScheme: 'https' -> https://localhost)
  if (
    window.location.origin === 'https://localhost' ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:'
  ) {
    return true;
  }

  // 3. UserAgent checks (Custom SignActionAPK header or Android WebView)
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent;
    if (/SignActionAPK/i.test(ua)) {
      return true;
    }
    // Android WebView signature: Android + 'wv' or 'Version/x.x'
    if (/Android/i.test(ua) && (/; wv\b/i.test(ua) || (/Version\/[0-9.]+/i.test(ua) && /Chrome/i.test(ua)))) {
      return true;
    }
  }

  // 4. Stored native flag check
  try {
    if (localStorage.getItem('signaction_is_native_apk') === 'true') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

export function isApkAlreadyDownloaded(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApk()) return true;

  try {
    return (
      localStorage.getItem('signaction_apk_downloaded') === 'true' ||
      localStorage.getItem('signaction_apk_dismissed') === 'true'
    );
  } catch {
    return false;
  }
}

export function markApkDownloaded(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('signaction_apk_downloaded', 'true');
    }
  } catch {
    // ignore
  }
}

export function dismissApkPrompt(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('signaction_apk_dismissed', 'true');
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

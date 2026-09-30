export const OFFICIAL_APK_DOWNLOAD_URL = '/signaction.apk';

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

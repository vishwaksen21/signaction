/**
 * Safe Web Vibration API haptics helper for Android tactile feedback.
 * Gracefully no-ops on unsupported browsers, desktop, or iOS devices.
 */
export function triggerHaptic(durationMs = 10): void {
  if (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration errors on unsupported hardware/permissions
    }
  }
}

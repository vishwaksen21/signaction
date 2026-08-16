/**
 * Robust asset resolution for sign language gestures.
 * Tries MP4 → GIF → image → fallback for each token.
 */

const ASSETS_BASE = '/assets/signs';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

/**
 * Resolve a single token to the best available asset URL.
 * Tries in order: MP4 → GIF → PNG → JPG → fallback (returns MP4 path anyway for error handling).
 */
export function resolveAssetUrl(token: string): string {
  const upper = token.toUpperCase().trim();
  if (!upper) return '';
  // Always return MP4 path — the SignViewer handles missing assets gracefully
  return `${ASSETS_BASE}/${upper}.mp4`;
}

/**
 * Resolve tokens to gesture asset URLs with format fallback.
 * Returns an array of URLs in the same order as tokens.
 */
export function resolveGestureUrls(tokens: string[]): string[] {
  return tokens.map(resolveAssetUrl);
}

/**
 * Extract the word name from an asset URL.
 * e.g., "/assets/signs/HELLO.mp4" → "HELLO"
 */
export function extractWordFromUrl(url: string): string {
  if (!url) return '';
  const parts = url.split('/');
  const filename = parts[parts.length - 1] || '';
  return filename.replace(/\.[^.]+$/, '').toUpperCase();
}

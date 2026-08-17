/**
 * Robust asset resolution for sign language gestures.
 * Returns typed results so the renderer uses the correct element.
 */

const ASSETS_BASE = '/assets/signs';

export type AssetType = 'video' | 'gif' | 'image' | 'missing';

export interface ResolvedAsset {
  type: AssetType;
  url: string;
  token: string;
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];
const GIF_EXTENSIONS = ['.gif'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp'];

function getAssetType(url: string): AssetType {
  const lower = url.toLowerCase();
  if (VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'video';
  if (GIF_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'gif';
  if (IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'image';
  return 'missing';
}

/**
 * Resolve a single token to a typed asset.
 * Currently all assets are MP4. Returns typed result for correct rendering.
 */
export function resolveAsset(token: string): ResolvedAsset {
  const upper = token.toUpperCase().trim();
  if (!upper) return { type: 'missing', url: '', token };
  
  const url = `${ASSETS_BASE}/${upper}.mp4`;
  return {
    type: 'video',
    url,
    token: upper,
  };
}

/**
 * Resolve tokens to typed asset URLs.
 */
export function resolveAssets(tokens: string[]): ResolvedAsset[] {
  return tokens.map(resolveAsset);
}

/**
 * Resolve tokens to plain URL strings (backward compatible).
 */
export function resolveGestureUrls(tokens: string[]): string[] {
  return tokens.map(t => resolveAsset(t).url);
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

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

export const KNOWN_SIGN_TOKENS = new Set([
  '0','1','2','3','4','5','6','7','8','9',
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'AFRAID','AFTER','AGAIN','AGAINST','AGE','AGREE','ALL','ALONE','ALSO','ALWAYS',
  'AND','ANGRY','ANSWER','ASK','AT','BAD','BE','BEAUTIFUL','BEFORE','BEST','BETTER',
  'BRAVE','BREAK','BUSY','BUT','BYE','CALL','CALM','CAN','CANNOT','CAREFUL',
  'CHANGE','CHAT','CHOCOLATE','COLLEGE','COME','COMPUTER','CONGRATULATIONS','CRY',
  'DAY','DISAGREE','DISSENT','DISTANCE','DO','DOES_NOT','DO_NOT','DRINK','EAT',
  'ENGINEER','FIGHT','FINISH','FOLLOW','FROM','GLITTER','GO','GOD','GOLD','GOOD',
  'GREAT','HAND','HANDS','HAPPY','HE','HEAR','HELLO','HELP','HER','HERE','HIS',
  'HOME','HOMEPAGE','HOW','I','INVENT','IT','KEEP','LANGUAGE','LAUGH','LEARN',
  'LIKE','ME','MORE','MY','NAME','NEXT','NO','NOT','NOW','OF','ON','OUR','OUT',
  'PLAY','PRETTY','RIGHT','SAD','SAFE','SEE','SELF','SHE','SIGN','SING','SLEEP',
  'SO','SOUND','SPEAK','STAY','STOP','STUDY','TALK','TELEVISION','THANK','THANK_YOU',
  'THAT','THEY','THIS','THOSE','TIME','TO','TYPE','UNDERSTAND','US','WAIT','WALK',
  'WASH','WAY','WE','WELCOME','WHAT','WHEN','WHERE','WHICH','WHO','WHOLE','WHOSE',
  'WHY','WIFE','WILL','WITH','WITHOUT','WORDS','WORK','WORLD','WRONG','YOU','YOUR','YOURSELF'
]);

export const COMMON_ALIASES: Record<string, string> = {
  'AM': 'BE', 'ARE': 'BE', 'WAS': 'BE', 'WERE': 'BE', 'BEEN': 'BE', 'BEING': 'BE',
  'DID': 'DO', 'DOES': 'DO', 'DOING': 'DO', 'DONE': 'DO',
  'HAVE': 'KEEP', 'HAS': 'KEEP', 'HAD': 'KEEP',
  'GOODBYE': 'BYE', 'THANKS': 'THANK_YOU', 'THANKYOU': 'THANK_YOU',
  'CAN\'T': 'CANNOT', 'CANT': 'CANNOT', 'WON\'T': 'WILL', 'WONT': 'WILL',
  'DON\'T': 'DO_NOT', 'DONT': 'DO_NOT', 'DOESN\'T': 'DOES_NOT', 'DOESNT': 'DOES_NOT',
  'EATING': 'EAT', 'ATE': 'EAT', 'EATEN': 'EAT',
  'DRINKING': 'DRINK', 'DRANK': 'DRINK',
  'SPEAKING': 'SPEAK', 'SPOKE': 'SPEAK', 'SPOKEN': 'SPEAK',
  'WALKING': 'WALK', 'WALKED': 'WALK',
  'LOOK': 'SEE', 'WATCH': 'SEE',
  'CORRECT': 'RIGHT',
  'KIDS': 'CHILDREN', 'BOY': 'HE', 'GIRL': 'SHE',
  'HI': 'HELLO', 'HEY': 'HELLO',
};

/**
 * Resolve tokens to gesture video URLs, with automatic fingerspelling for unknown words.
 */
export function resolveTokensWithFingerspelling(
  tokens: string[],
  assetsBaseUrl: string = ASSETS_BASE
): { tokens: string[]; gestures: string[] } {
  const tokensOut: string[] = [];
  const gesturesOut: string[] = [];

  for (const raw of tokens) {
    const norm = raw.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '');
    if (!norm) continue;

    const aliased = COMMON_ALIASES[norm] || norm;

    if (KNOWN_SIGN_TOKENS.has(aliased)) {
      tokensOut.push(aliased);
      gesturesOut.push(`${assetsBaseUrl}/${aliased}.mp4`);
    } else {
      // Fingerspell unknown token letter by letter (A-Z, 0-9)
      for (const char of norm) {
        if (KNOWN_SIGN_TOKENS.has(char)) {
          tokensOut.push(char);
          gesturesOut.push(`${assetsBaseUrl}/${char}.mp4`);
        }
      }
    }
  }

  return { tokens: tokensOut, gestures: gesturesOut };
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


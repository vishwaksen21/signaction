/**
 * Robust asset resolution for sign language gestures.
 * Returns typed results so the renderer uses the correct element.
 */

import YOUTUBE_DICT from './youtube-dictionary.json';

const ASSETS_BASE = '/assets/signs';

export type AssetType = 'video' | 'youtube' | 'gif' | 'image' | 'missing';

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
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'video';
  if (GIF_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'gif';
  if (IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'image';
  return 'missing';
}

export const KNOWN_SIGN_TOKENS = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "ACCIDENT",
  "AFRAID",
  "AFTER",
  "AFTERNOON",
  "AGAIN",
  "AGAINST",
  "AGE",
  "AGREE",
  "AIR",
  "ALL",
  "ALLERGY",
  "ALONE",
  "ALREADY",
  "ALSO",
  "ALWAYS",
  "AND",
  "ANGRY",
  "ANSWER",
  "ANY",
  "APPLE",
  "ARM",
  "AROUND",
  "ART",
  "ASK",
  "AT",
  "B",
  "BAD",
  "BAG",
  "BANANA",
  "BATHROOM",
  "BE",
  "BEAUTIFUL",
  "BEDROOM",
  "BEFORE",
  "BEHIND",
  "BELIEVE",
  "BEST",
  "BETTER",
  "BIG",
  "BLACK",
  "BLOOD",
  "BLUE",
  "BLUETOOTH",
  "BOAT",
  "BODY",
  "BOOK",
  "BOX",
  "BRAVE",
  "BREAD",
  "BREAK",
  "BRIGHT",
  "BROWN",
  "BUS",
  "BUSY",
  "BUT",
  "BYE",
  "C",
  "CALL",
  "CALM",
  "CAN",
  "CANNOT",
  "CAR",
  "CAREFUL",
  "CARROT",
  "CAT",
  "CHANGE",
  "CHAT",
  "CHOCOLATE",
  "CITY",
  "CLOCK",
  "CLOSE",
  "CLOUD",
  "COLD",
  "COLLECT",
  "COLLEGE",
  "COME",
  "COMFORTABLE",
  "COMPUTER",
  "CONGRATULATIONS",
  "COOK",
  "COUNTRY",
  "CRY",
  "CUT",
  "D",
  "DAY",
  "DECIDE",
  "DIFFERENT",
  "DINNER",
  "DISAGREE",
  "DISSENT",
  "DISTANCE",
  "DO",
  "DOES_NOT",
  "DOG",
  "DOOR",
  "DO_NOT",
  "DRAW",
  "DREAM",
  "DRESS",
  "DRINK",
  "DRIVE",
  "DRY",
  "DURING",
  "E",
  "EAR",
  "EARTH",
  "EASY",
  "EAT",
  "EGG",
  "ELEPHANT",
  "EMAIL",
  "EMERGENCY",
  "ENGINEER",
  "ENGLISH",
  "ENOUGH",
  "EVENING",
  "EVERYTHING",
  "EXAM",
  "EXCUSE_ME",
  "EXPENSIVE",
  "EXPLAIN",
  "EYE",
  "F",
  "FIGHT",
  "FINISH",
  "FLY",
  "FOLLOW",
  "FOOD",
  "FOREST",
  "FREE",
  "FRESH",
  "FRIDAY",
  "FRIEND",
  "FROM",
  "FULL",
  "G",
  "GARAGE",
  "GARDEN",
  "GEOGRAPHY",
  "GET",
  "GLITTER",
  "GO",
  "GOD",
  "GOLD",
  "GOOD",
  "GOOD_AFTERNOON",
  "GOOD_MORNING",
  "GOOD_NIGHT",
  "GRANDFATHER",
  "GRANDMOTHER",
  "GRASS",
  "GREAT",
  "GREEN",
  "H",
  "HALF",
  "HAND",
  "HANDS",
  "HAPPEN",
  "HAPPY",
  "HARD",
  "HAT",
  "HATE",
  "HAVE",
  "HE",
  "HEAD",
  "HEADACHE",
  "HEAR",
  "HEARING",
  "HELLO",
  "HELP",
  "HER",
  "HERE",
  "HI",
  "HIS",
  "HOME",
  "HOMEPAGE",
  "HOT",
  "HOTEL",
  "HOUR",
  "HOW",
  "HUGE",
  "HUNGRY",
  "HUSBAND",
  "I",
  "IDEA",
  "IN",
  "INJURY",
  "INTERNET",
  "INVENT",
  "IT",
  "I_UNDERSTAND",
  "J",
  "JOB",
  "JUICE",
  "K",
  "KEEP",
  "KITCHEN",
  "KNOW",
  "L",
  "LAKE",
  "LAMP",
  "LANGUAGE",
  "LAPTOP",
  "LARGE",
  "LATE",
  "LAUGH",
  "LEARN",
  "LETTER",
  "LIBRARY",
  "LIFE",
  "LIKE",
  "LION",
  "LIVE",
  "LONG",
  "LOSE",
  "LUNCH",
  "M",
  "MAKE",
  "MAN",
  "MANGO",
  "MAY",
  "ME",
  "MEAN",
  "MEASURE",
  "MEAT",
  "MEET",
  "MIGHT",
  "MILK",
  "MONDAY",
  "MONKEY",
  "MONTH",
  "MORE",
  "MOTHER",
  "MOUNTAIN",
  "MOUSE",
  "MOUTH",
  "MOVE",
  "MUSEUM",
  "MUSIC",
  "MY",
  "MYSELF",
  "MY_NAME_IS",
  "N",
  "NAME",
  "NARROW",
  "NEAT",
  "NEIGHBOR",
  "NEW",
  "NEXT",
  "NICE",
  "NO",
  "NOSE",
  "NOT",
  "NOW",
  "NURSE",
  "O",
  "OF",
  "OFFICE",
  "OFTEN",
  "ON",
  "ONCE",
  "OPEN",
  "ORANGE",
  "OTHER",
  "OUR",
  "OUT",
  "P",
  "PAIN",
  "PAY",
  "PENCIL",
  "PLAY",
  "POTATO",
  "PRETTY",
  "Q",
  "R",
  "RIGHT",
  "S",
  "SAD",
  "SAFE",
  "SEE",
  "SELF",
  "SHE",
  "SIGN",
  "SING",
  "SLEEP",
  "SO",
  "SOUND",
  "SPEAK",
  "STAY",
  "STOP",
  "STUDY",
  "T",
  "TALK",
  "TELEVISION",
  "THANK",
  "THANK_YOU",
  "THAT",
  "THEY",
  "THIS",
  "THOSE",
  "TIME",
  "TO",
  "TYPE",
  "U",
  "UNDERSTAND",
  "US",
  "V",
  "W",
  "WAIT",
  "WALK",
  "WASH",
  "WAY",
  "WE",
  "WELCOME",
  "WHAT",
  "WHEN",
  "WHERE",
  "WHICH",
  "WHO",
  "WHOLE",
  "WHOSE",
  "WHY",
  "WIFE",
  "WILL",
  "WITH",
  "WITHOUT",
  "WORDS",
  "WORK",
  "WORLD",
  "WRONG",
  "X",
  "Y",
  "YOU",
  "YOUR",
  "YOURSELF",
  "Z"
]);

export const COMMON_ALIASES: Record<string, string> = {
  'AM': 'BE', 'ARE': 'BE', 'WAS': 'BE', 'WERE': 'BE', 'BEEN': 'BE', 'BEING': 'BE',
  'DID': 'DO', 'DOES': 'DO', 'DOING': 'DO', 'DONE': 'DO',
  'HAS': 'HAVE', 'HAD': 'HAVE', 'HAVING': 'HAVE',
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
  'MAKING': 'MAKE', 'MADE': 'MAKE', 'MAKES': 'MAKE',
  'GETTING': 'GET', 'GOT': 'GET', 'GETS': 'GET',
  'KNOWING': 'KNOW', 'KNEW': 'KNOW', 'KNOWS': 'KNOW',
  'LIVING': 'LIVE', 'LIVED': 'LIVE', 'LIVES': 'LIVE',
  'COOKING': 'COOK', 'COOKED': 'COOK', 'COOKS': 'COOK',
  'MEETING': 'MEET', 'MET': 'MEET', 'MEETS': 'MEET',
  'PAYING': 'PAY', 'PAID': 'PAY', 'PAYS': 'PAY',
  'OPENING': 'OPEN', 'OPENED': 'OPEN', 'OPENS': 'OPEN',
  'CLOSING': 'CLOSE', 'CLOSED': 'CLOSE', 'CLOSES': 'CLOSE',
  'LEARNING': 'LEARN', 'LEARNED': 'LEARN', 'LEARNS': 'LEARN',
  'TEACHING': 'TEACH', 'TAUGHT': 'TEACH', 'TEACHES': 'TEACH',
  'STUDYING': 'STUDY', 'STUDIED': 'STUDY', 'STUDIES': 'STUDY',
  'HELPING': 'HELP', 'HELPED': 'HELP', 'HELPS': 'HELP',
  'FEELING': 'FEEL', 'FELT': 'FEEL', 'FEELS': 'FEEL',
  'MOVING': 'MOVE', 'MOVED': 'MOVE', 'MOVES': 'MOVE',
  'BOOKS': 'BOOK', 'CARS': 'CAR', 'BUSES': 'BUS', 'BOATS': 'BOAT', 'BOXES': 'BOX',
  'BAGS': 'BAG', 'APPLES': 'APPLE', 'BANANAS': 'BANANA', 'CARROTS': 'CARROT',
  'CATS': 'CAT', 'DOGS': 'DOG', 'BIRDS': 'BIRD', 'HOUSES': 'HOUSE',
  'ROOMS': 'ROOM', 'DOORS': 'DOOR', 'WINDOWS': 'WINDOW', 'BEDS': 'BED',
  'PENS': 'PEN', 'PENCILS': 'PENCIL', 'PAPERS': 'PAPER', 'CHAIRS': 'CHAIR',
  'TABLES': 'TABLE', 'DAYS': 'DAY', 'WEEKS': 'WEEK', 'MONTHS': 'MONTH',
  'YEARS': 'YEAR', 'HOURS': 'HOUR', 'MINUTES': 'MINUTE',
};

const YOUTUBE_MAP: Record<string, string> = YOUTUBE_DICT as Record<string, string>;

/**
 * Look up a token in the YouTube sign video dictionary.
 * Returns the full YouTube watch URL if found, or null otherwise.
 */
export function getYoutubeVideoUrl(token: string): string | null {
  if (!token) return null;
  const upper = token.toUpperCase().trim();
  const lower = token.toLowerCase().trim();
  const space = upper.replace(/_/g, ' ');
  const under = upper.replace(/\s+/g, '_');
  const spaceLower = lower.replace(/_/g, ' ');
  const underLower = lower.replace(/\s+/g, '_');

  const videoIdOrUrl =
    YOUTUBE_MAP[upper] ||
    YOUTUBE_MAP[space] ||
    YOUTUBE_MAP[under] ||
    YOUTUBE_MAP[lower] ||
    YOUTUBE_MAP[spaceLower] ||
    YOUTUBE_MAP[underLower];
  if (!videoIdOrUrl) return null;

  if (videoIdOrUrl.startsWith('http://') || videoIdOrUrl.startsWith('https://')) {
    return videoIdOrUrl;
  }
  return `https://www.youtube.com/watch?v=${videoIdOrUrl}`;
}

/**
 * Resolve tokens to gesture video URLs.
 * 1. Checks local sign dataset first.
 * 2. Falls back to YouTube sign video if not in local dataset.
 * 3. Falls back to character-by-character fingerspelling if not in YouTube either.
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
      // 1st Fallback: check YouTube dictionary for words not in the local dataset
      const ytUrl = getYoutubeVideoUrl(aliased) || getYoutubeVideoUrl(norm);
      if (ytUrl) {
        tokensOut.push(aliased);
        gesturesOut.push(ytUrl);
      } else {
        // 2nd Fallback: Fingerspell unknown token letter by letter (A-Z, 0-9)
        for (const char of norm) {
          if (KNOWN_SIGN_TOKENS.has(char)) {
            tokensOut.push(char);
            gesturesOut.push(`${assetsBaseUrl}/${char}.mp4`);
          }
        }
      }
    }
  }

  return { tokens: tokensOut, gestures: gesturesOut };
}

/**
 * Resolve a single token to a typed asset.
 * Checks local dataset first, then YouTube fallback.
 */
export function resolveAsset(token: string): ResolvedAsset {
  const upper = token.toUpperCase().trim();
  if (!upper) return { type: 'missing', url: '', token };
  
  const aliased = COMMON_ALIASES[upper] || upper;
  const tokenToUse = KNOWN_SIGN_TOKENS.has(upper) ? upper : (KNOWN_SIGN_TOKENS.has(aliased) ? aliased : null);
  if (tokenToUse) {
    return {
      type: 'video',
      url: `${ASSETS_BASE}/${tokenToUse}.mp4`,
      token: tokenToUse,
    };
  }

  const ytUrl = getYoutubeVideoUrl(aliased) || getYoutubeVideoUrl(upper);
  if (ytUrl) {
    return {
      type: 'youtube',
      url: ytUrl,
      token: aliased,
    };
  }

  return {
    type: 'video',
    url: `${ASSETS_BASE}/${aliased}.mp4`,
    token: aliased,
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


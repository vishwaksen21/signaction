/**
 * JavaScript port of signaction/nlp.py — glossify()
 * Converts English text into sign-language gloss tokens.
 * Pure regex/heuristics, no external NLP dependencies.
 */

export interface GlossResult {
  originalText: string;
  normalizedText: string;
  tokens: string[];
  gloss: string;
}

const PRONOUN_MAP: Record<string, string> = {
  i: 'ME',
  me: 'ME',
  my: 'MY',
  mine: 'MINE',
  you: 'YOU',
  your: 'YOUR',
  yours: 'YOURS',
  we: 'WE',
  us: 'US',
  our: 'OUR',
  they: 'THEY',
  them: 'THEM',
  their: 'THEIR',
};

const WH_WORDS = new Set(['who', 'what', 'where', 'when', 'why', 'how']);
const NEGATION_WORDS = new Set(['not', 'no', 'never']);
const AUXILIARIES = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did',
]);
const FILLERS = new Set(['um', 'uh', 'like']);

/**
 * Simple lemmatizer using common English rules.
 * Not as accurate as spaCy but sufficient for sign glossing.
 */
function simpleLemma(word: string): string {
  const lower = word.toLowerCase();

  // Irregular plurals / past tense
  const irregulars: Record<string, string> = {
    was: 'be',
    were: 'be',
    been: 'be',
    am: 'be',
    is: 'be',
    are: 'be',
    did: 'do',
    does: 'do',
    has: 'have',
    had: 'have',
    went: 'go',
    gone: 'go',
    going: 'go',
    came: 'come',
    coming: 'come',
    saw: 'see',
    seen: 'see',
    seeing: 'see',
    took: 'take',
    taken: 'take',
    taking: 'take',
    made: 'make',
    making: 'make',
    said: 'say',
    saying: 'say',
    got: 'get',
    gotten: 'get',
    getting: 'get',
    better: 'good',
    best: 'good',
    worse: 'bad',
    worst: 'bad',
    knew: 'know',
    known: 'know',
    knowing: 'know',
    thought: 'think',
    thinking: 'think',
    told: 'tell',
    telling: 'tell',
    gave: 'give',
    given: 'give',
    giving: 'give',
    found: 'find',
    finding: 'find',
    left: 'leave',
    leaving: 'leave',
    felt: 'feel',
    feeling: 'feel',
    put: 'put',
    let: 'let',
    kept: 'keep',
    keeping: 'keep',
    held: 'hold',
    holding: 'hold',
    wrote: 'write',
    written: 'write',
    writing: 'write',
    ran: 'run',
    running: 'run',
    sat: 'sit',
    sitting: 'sit',
    stood: 'stand',
    standing: 'stand',
    lost: 'lose',
    losing: 'lose',
    paid: 'pay',
    paying: 'pay',
    met: 'meet',
    meeting: 'meet',
    read: 'read',
    spoke: 'speak',
    spoken: 'speak',
    speaking: 'speak',
    broke: 'break',
    broken: 'break',
    breaking: 'break',
    drove: 'drive',
    driven: 'drive',
    driving: 'drive',
    ate: 'eat',
    eaten: 'eat',
    eating: 'eat',
    fell: 'fall',
    fallen: 'fall',
    falling: 'fall',
    grew: 'grow',
    grown: 'grow',
    growing: 'grow',
    wore: 'wear',
    worn: 'wear',
    wearing: 'wear',
    drew: 'draw',
    drawn: 'draw',
    drawing: 'draw',
    sang: 'sing',
    sung: 'sing',
    singing: 'sing',
    swam: 'swim',
    swum: 'swim',
    swimming: 'swim',
    drank: 'drink',
    drunk: 'drink',
    drinking: 'drink',
    began: 'begin',
    begun: 'begin',
    beginning: 'begin',
    rang: 'ring',
    rung: 'ring',
    ringing: 'ring',
    woke: 'wake',
    woken: 'wake',
    waking: 'wake',
    blew: 'blow',
    blown: 'blow',
    blowing: 'blow',
    flew: 'fly',
    flown: 'fly',
    flying: 'fly',
    threw: 'throw',
    thrown: 'throw',
    throwing: 'throw',
    chose: 'choose',
    chosen: 'choose',
    choosing: 'choose',
    froze: 'freeze',
    frozen: 'freeze',
    freezing: 'freeze',
    shook: 'shake',
    shaken: 'shake',
    shaking: 'shake',
    // Words that end in -ed but are NOT past tense
    need: 'need',
    seed: 'seed',
    greed: 'greed',
    speed: 'speed',
    bleed: 'bleed',
    feed: 'feed',
    breed: 'breed',
    proceed: 'proceed',
    exceed: 'exceed',
    precede: 'precede',
    succeed: 'succeed',
  };

  if (irregulars[lower]) {
    return irregulars[lower];
  }

  // Progressive/continuous forms — keep as-is (mapped via lexicon aliases)
  if (lower.endsWith('ing') && lower.length > 4) {
    return lower;
  }

  // Past tense: -ed
  if (lower.endsWith('ed') && lower.length > 3) {
    // Try removing -ed
    const base = lower.slice(0, -2);
    if (base.length >= 3) {
      // Handle doubled consonant: stopped → stop
      if (base.length >= 4 && base[base.length - 1] === base[base.length - 2]) {
        return base.slice(0, -1);
      }
      // Handle -ied → -y
      if (lower.endsWith('ied')) {
        return lower.slice(0, -3) + 'y';
      }
      // Try adding 'e' (e.g., "walked" → "walked" no e needed, "liked" → "like")
      return base;
    }
    return base;
  }

  // Plural: -es
  if (lower.endsWith('ies') && lower.length > 4) {
    return lower.slice(0, -3) + 'y';
  }

  // Plural: -s (not -ss, -sh, -ch, -x)
  if (
    lower.endsWith('s') &&
    !lower.endsWith('ss') &&
    !lower.endsWith('sh') &&
    !lower.endsWith('ch') &&
    !lower.endsWith('x') &&
    lower.length > 3
  ) {
    return lower.slice(0, -1);
  }

  // Comparative/superlative: -er, -est with doubled consonant
  // bigger → big, tallest → tall, thinnest → thin
  // Does NOT strip: mother, father, teacher, water, butter
  if (lower.length > 4 && lower.endsWith('er')) {
    const beforeEr = lower.slice(0, -2);
    if (beforeEr.length >= 3 && beforeEr[beforeEr.length - 1] === beforeEr[beforeEr.length - 2]) {
      return beforeEr.slice(0, -1);
    }
  }
  if (lower.length > 5 && lower.endsWith('est')) {
    const beforeEst = lower.slice(0, -3);
    if (beforeEst.length >= 3 && beforeEst[beforeEst.length - 1] === beforeEst[beforeEst.length - 2]) {
      return beforeEst.slice(0, -1);
    }
  }

  // Adverbs: -ly
  if (lower.endsWith('ly') && lower.length > 4) {
    return lower.slice(0, -2);
  }

  return lower;
}

/**
 * Convert English text to sign-language gloss tokens.
 *
 * Rules (matching Python nlp.py):
 * - Normalize whitespace
 * - Drop fillers (um, uh, like)
 * - Map pronouns to uppercase gloss
 * - Keep auxiliaries as exact forms
 * - Lemmatize content words
 * - Output uppercase tokens
 */
export function glossify(
  text: string,
  options: {
    removeStopwords?: boolean;
    lemmatize?: boolean;
    dropFillers?: boolean;
  } = {}
): GlossResult {
  const {
    removeStopwords = false,
    lemmatize = true,
    dropFillers = true,
  } = options;

  const originalText = text;
  const normalizedText = text.trim().replace(/\s+/g, ' ');

  if (!normalizedText) {
    return { originalText, normalizedText, tokens: [], gloss: '' };
  }

  // Simple tokenizer: split on whitespace, strip punctuation
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const tokens: string[] = [];

  for (const word of words) {
    // Strip leading/trailing punctuation but keep the word
    const cleaned = word.replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleaned) continue;

    const lower = cleaned.toLowerCase();

    // Drop fillers
    if (dropFillers && FILLERS.has(lower)) continue;

    // Pronoun mapping
    if (PRONOUN_MAP[lower]) {
      tokens.push(PRONOUN_MAP[lower]);
      continue;
    }

    // Auxiliaries — lemmatize to base form (be/do/have have video assets)
    if (AUXILIARIES.has(lower)) {
      const base = simpleLemma(lower);
      tokens.push(base.toUpperCase());
      continue;
    }

    // Content words
    let out: string;
    if (lemmatize) {
      out = simpleLemma(lower);
    } else {
      out = lower;
    }

    out = out.replace(/'/g, '').toUpperCase();

    if (out && out !== '-PRON-') {
      tokens.push(out);
    }
  }

  const gloss = tokens.join(' ');

  return { originalText, normalizedText, tokens, gloss };
}

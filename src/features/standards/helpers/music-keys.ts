export type KeyMode = 'major' | 'minor';

type ParsedKey = {
  letter: string; // 'A'..'G'
  accidental: '' | '#' | 'b';
  mode: KeyMode;
};

const NATURAL_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Chromatic value of each natural (unaltered) letter.
const NATURAL_CHROMATIC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const ACCIDENTAL_SEMITONES: Record<string, number> = { '': 0, '#': 1, 'b': -1 };

// Fixed, flat-preferred label list — used only for the tonic-level display
// (the Select's options and the current-key label), not for individual chords.
const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const MAJOR_KEY_OPTIONS = MAJOR_KEYS.map(k => ({ label: k, value: k }));
export const MINOR_KEY_OPTIONS = MAJOR_KEYS.map(k => ({ label: `${k}m`, value: `${k}m` }));

/**
 * Parses a key string like "Eb", "F#", "Dmin", "Dm", "D minor", "D-", "Cmaj"
 * into letter/accidental/mode. Unrecognised input falls back to C major
 * rather than throwing, since this also runs on possibly-messy song data.
 */
const KEY_REGEX = /^([A-G])(#|b)?\s*(maj|major|min(?:or)?|m|-)?$/i;

function parseKey(key: string): ParsedKey {
  const match = KEY_REGEX.exec(key.trim());
  if (!match)
    return { letter: 'C', accidental: '', mode: 'major' };

  const [, letter, accidental, modeToken = ''] = match;
  const isMinor = /^(min(?:or)?|m|-)$/i.test(modeToken);
  return {
    letter: letter.toUpperCase(),
    accidental: (accidental?.toLowerCase() ?? '') as '' | '#' | 'b',
    mode: isMinor ? 'minor' : 'major',
  };
}

function chromaticValue({ letter, accidental }: Pick<ParsedKey, 'letter' | 'accidental'>): number {
  return (((NATURAL_CHROMATIC[letter] ?? 0) + ACCIDENTAL_SEMITONES[accidental]) % 12 + 12) % 12;
}

function formatKey({ mode, ...pitch }: ParsedKey): string {
  const base = MAJOR_KEYS[chromaticValue(pitch)];
  return mode === 'minor' ? `${base}m` : base;
}

/** Canonicalises any recognised key spelling to this app's flat-preferred display format. */
export function normalizeKey(key: string): string {
  return formatKey(parseKey(key));
}

/** The right option list for the Select, based on whether `key` is minor. */
export function keyOptionsFor(key: string) {
  return parseKey(key).mode === 'minor' ? MINOR_KEY_OPTIONS : MAJOR_KEY_OPTIONS;
}

/** Bumps a key label by one or more semitones (used by the up/down arrows). */
export function transposeKey(key: string, semitones: number): string {
  const parsed = parseKey(key);
  const nextIndex = (((chromaticValue(parsed) + semitones) % 12) + 12) % 12;
  const base = MAJOR_KEYS[nextIndex];
  return parsed.mode === 'minor' ? `${base}m` : base;
}

/** Chromatic semitone distance from fromKey's tonic to toKey's tonic. */
export function keyDistance(fromKey: string, toKey: string): number {
  return chromaticValue(parseKey(toKey)) - chromaticValue(parseKey(fromKey));
}

/** Steps around the natural letter cycle (C D E F G A B) from fromKey's tonic letter to toKey's. */
export function letterDistance(fromKey: string, toKey: string): number {
  const fromIndex = NATURAL_LETTERS.indexOf(parseKey(fromKey).letter);
  const toIndex = NATURAL_LETTERS.indexOf(parseKey(toKey).letter);
  return (((toIndex - fromIndex) % 7) + 7) % 7;
}

function accidentalToSymbol(semitones: number): string {
  switch (semitones) {
    case 0: return '';
    case 1: return '#';
    case -1: return 'b';
    case 2: return '##';
    case -2: return 'bb';
    // Shouldn't occur for realistic Western tonal transpositions — see note below.
    default: return semitones > 0 ? '#' : 'b';
  }
}

/**
 * Transposes a single note (as parsed off a chord root or bass note) by a
 * letter-shift and a semitone-shift, independently. This is what lets "D"
 * come out as "F#" rather than "Gb" when the surrounding chart moves from
 * Eb to G — the letter moves by letterShift regardless of what the semitone
 * shift alone would suggest, and the accidental is picked to make the two agree.
 */
export function transposeNote(letter: string, accidental: string, letterShift: number, semitoneShift: number): string {
  const fromIndex = NATURAL_LETTERS.indexOf(letter);
  if (fromIndex === -1)
    return `${letter}${accidental}`;

  const fromChromatic = (((NATURAL_CHROMATIC[letter] ?? 0) + (ACCIDENTAL_SEMITONES[accidental] ?? 0)) % 12 + 12) % 12;
  const toLetter = NATURAL_LETTERS[(((fromIndex + letterShift) % 7) + 7) % 7];
  const targetChromatic = (((fromChromatic + semitoneShift) % 12) + 12) % 12;

  const accidentalSemitones = targetChromatic - NATURAL_CHROMATIC[toLetter];
  const normalized = accidentalSemitones > 6 ? accidentalSemitones - 12 : accidentalSemitones < -6 ? accidentalSemitones + 12 : accidentalSemitones;

  return `${toLetter}${accidentalToSymbol(normalized)}`;
}

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const ENHARMONIC_TO_INDEX: Record<string, number> = {
  'C': 0,
  'B#': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'Fb': 4,
  'F': 5,
  'E#': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11,
  'Cb': 11,
};

export const KEY_OPTIONS = KEYS.map(k => ({ label: k, value: k }));

export function transposeKey(key: string, semitones: number): string {
  const index = ENHARMONIC_TO_INDEX[key] ?? 0;
  const nextIndex = (((index + semitones) % 12) + 12) % 12;
  return KEYS[nextIndex];
}

/** Semitone distance from `fromKey` to `toKey`, signed, range -11..11. */
export function keyDistance(fromKey: string, toKey: string): number {
  const fromIndex = ENHARMONIC_TO_INDEX[fromKey] ?? 0;
  const toIndex = ENHARMONIC_TO_INDEX[toKey] ?? 0;
  return toIndex - fromIndex;
}

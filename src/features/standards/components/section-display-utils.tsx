export const MAX_BARS_PER_ROW = 4;

export function parseBars(chordString: string): string[] {
  const bars = chordString.split('|').map(b => b.trim());
  if (bars.length > 1 && bars.at(-1) === '')
    return bars;
  return bars.filter(Boolean);
}

export function countBars(chordString: string): number {
  return parseBars(chordString).length;
}

export function isEmptyChords(chords: string): boolean {
  const t = chords.trim();
  return !t || t === '-';
}

const DEFAULT_BEATS_PER_BAR = 4;

export function beatsPerBar(timeSignature?: string): number {
  if (!timeSignature)
    return DEFAULT_BEATS_PER_BAR;
  const n = Number.parseInt(timeSignature.split('/')[0], 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_BEATS_PER_BAR;
}

/**
 * Expands a bar's comma-string into exactly `n` slots.
 *
 * - Already n entries → used as-is.
 * - Fewer entries (legacy bars like "C" or "C,Dm7") → each token is
 *   placed at its proportional beat position so rhythm is preserved.
 *   "C,Dm7" in 4/4 → ["C","","Dm7",""] rather than naively padding.
 * - More entries than n → truncated (visible immediately on next edit).
 */
export function expandBarToBeats(barRaw: string, n: number): string[] {
  const raw = barRaw.trim();
  if (!raw)
    return Array.from({ length: n }, () => '');

  const parts = raw.split(',').map(p => p.trim());
  if (parts.length === n)
    return parts;
  if (parts.length > n)
    return parts.slice(0, n);

  const result = Array.from({ length: n }, () => '');
  parts.forEach((part, i) => {
    result[Math.round((i * n) / parts.length)] = part;
  });
  return result;
}

export function collapseBeatsToBar(beats: string[]): string {
  return beats.map(b => b.trim()).join(',');
}

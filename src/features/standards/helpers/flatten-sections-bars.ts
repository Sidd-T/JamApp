import type { SegmentRef } from '@/features/standards/standards';

export type FlatBar = {
  /** Index into the flattened sequence across the whole section */
  flatIndex: number;
  /** Which segment this bar belongs to */
  segment: SegmentRef;
  /** Index of this bar within its own segment's bar array */
  localIndex: number;
  /** Raw bar text, e.g. "C,,Dm7," */
  raw: string;
};

type SectionLike = {
  MainSegment?: { Chords?: string };
  Endings?: { Chords: string }[];
};

function splitBars(chordString: string | undefined): string[] {
  if (chordString == null)
    return [];

  const bars = chordString.split('|').map(b => b.trim());

  // preserve a trailing empty bar
  if (bars.length > 1 && bars.at(-1) === '')
    return bars;

  return bars.filter(Boolean);
}

/**
 * Flattens a section's MainSegment + all Endings into one ordered bar
 * sequence, so Prev/Next Bar can walk across segment boundaries as a
 * single continuous list.
 */
export function flattenSectionBars(section: SectionLike): FlatBar[] {
  const result: FlatBar[] = [];
  let flatIndex = 0;

  const mainBars = splitBars(section.MainSegment?.Chords);

  if (mainBars.length === 0) {
    // Nothing entered yet — still expose one empty, tappable slot so an
    // empty section can be opened for editing in the first place.
    result.push({ flatIndex, segment: { segment: 'main' }, localIndex: 0, raw: '' });
    flatIndex++;
  }
  else {
    mainBars.forEach((raw, localIndex) => {
      result.push({ flatIndex, segment: { segment: 'main' }, localIndex, raw });
      flatIndex++;
    });
  }

  (section.Endings ?? []).forEach((ending, endingIndex) => {
    splitBars(ending.Chords).forEach((raw, localIndex) => {
      result.push({
        flatIndex,
        segment: { segment: 'ending', endingIndex },
        localIndex,
        raw,
      });
      flatIndex++;
    });
  });

  return result;
}

/** Finds the flat index for a given segment+localIndex, or -1 if not found. */
export function findFlatIndex(
  flatBars: FlatBar[],
  segment: SegmentRef,
  localIndex: number,
): number {
  return flatBars.findIndex(
    b =>
      b.localIndex === localIndex
      && b.segment.segment === segment.segment
      && (b.segment.segment !== 'ending'
        || (segment.segment === 'ending'
          && b.segment.endingIndex === segment.endingIndex)),
  );
}

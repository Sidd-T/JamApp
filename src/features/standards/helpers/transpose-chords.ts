import type { Section } from '../standards';
import { keyDistance, letterDistance, transposeNote } from './music-keys';

const CHORD_TOKEN_REGEX
  = /(?<=^|[\s|,(])([A-G])(#|b)?([^\s|,)/]*)(\/([A-G])(#|b)?)?(?=$|[\s|,)])/g;

export function transposeChordString(chordString: string, letterShift: number, semitoneShift: number): string {
  if (!chordString || (letterShift === 0 && ((semitoneShift % 12) + 12) % 12 === 0))
    return chordString;

  return chordString.replace(
    CHORD_TOKEN_REGEX,
    (_match, rootLetter: string, rootAcc: string | undefined, suffix: string, _slashGroup: string | undefined, bassLetter: string | undefined, bassAcc: string | undefined) => {
      const root = transposeNote(rootLetter, rootAcc ?? '', letterShift, semitoneShift);
      if (!bassLetter)
        return `${root}${suffix}`;
      const bass = transposeNote(bassLetter, bassAcc ?? '', letterShift, semitoneShift);
      return `${root}${suffix}/${bass}`;
    },
  );
}

/** Returns new Section objects with MainSegment/Endings chords transposed from fromKey to toKey. */
export function transposeSections(sections: Section[], fromKey: string, toKey: string): Section[] {
  const semitoneShift = keyDistance(fromKey, toKey);
  const letterShift = letterDistance(fromKey, toKey);
  if (letterShift === 0 && ((semitoneShift % 12) + 12) % 12 === 0)
    return sections;

  return sections.map(section => ({
    ...section,
    MainSegment: section.MainSegment
      ? { ...section.MainSegment, Chords: transposeChordString(section.MainSegment.Chords, letterShift, semitoneShift) }
      : section.MainSegment,
    Endings: section.Endings?.map(ending => ({
      ...ending,
      Chords: transposeChordString(ending.Chords, letterShift, semitoneShift),
    })),
  }));
}

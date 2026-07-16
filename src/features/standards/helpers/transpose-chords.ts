import type { Section } from '../standards';
import { transposeKey } from './music-keys';

/**
 * Matches a chord's root (and optional slash-bass note), leaving everything
 * else — quality/extension text, bar lines, commas, spaces, "NC", "%" — alone.
 *
 * A chord token must start right after a boundary (start of string, space,
 * "|", ",", or "(") and end right before one (or end of string). This keeps
 * "NC" from being misread as a C chord, and keeps suffix text like
 * "m7b5" or "6/9" from being mistaken for a slash-bass note.
 */
const CHORD_TOKEN_REGEX
  = /(?<=^|[\s|,(])([A-G])(#|b)?([^\s|,)/]*)(\/([A-G])(#|b)?)?(?=$|[\s|,)])/g;

export function transposeChordString(chordString: string, semitones: number): string {
  if (!chordString || semitones % 12 === 0)
    return chordString;

  return chordString.replace(
    CHORD_TOKEN_REGEX,
    (_match, rootLetter: string, rootAcc: string | undefined, suffix: string, _slashGroup: string | undefined, bassLetter: string | undefined, bassAcc: string | undefined) => {
      const root = transposeKey(`${rootLetter}${rootAcc ?? ''}`, semitones);
      if (!bassLetter)
        return `${root}${suffix}`;
      const bass = transposeKey(`${bassLetter}${bassAcc ?? ''}`, semitones);
      return `${root}${suffix}/${bass}`;
    },
  );
}

/** Returns new Section objects with MainSegment/Endings chords transposed. Original array is untouched. */
export function transposeSections(sections: Section[], semitones: number): Section[] {
  if (semitones % 12 === 0)
    return sections;

  return sections.map(section => ({
    ...section,
    MainSegment: section.MainSegment
      ? { ...section.MainSegment, Chords: transposeChordString(section.MainSegment.Chords, semitones) }
      : section.MainSegment,
    Endings: section.Endings?.map(ending => ({
      ...ending,
      Chords: transposeChordString(ending.Chords, semitones),
    })),
  }));
}

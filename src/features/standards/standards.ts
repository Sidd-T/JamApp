import jazzStandards from '../../../data/jazz-standards.json';

export type MainSegment = {
  Chords: string;
};

export type Ending = {
  Chords: string;
};

export type Section = {
  Label?: string;
  Repeats?: number;
  MainSegment?: MainSegment;
  Endings?: Ending[];
};

export type Song = {
  Title: string;
  Composer: string;
  Key?: string;
  Rhythm?: string;
  TimeSignature?: string;
  Sections: Section[];
};

export function getAllStandards(): Song[] {
  return jazzStandards as Song[];
}

export function findStandardByTitle(title: string): Song | undefined {
  return getAllStandards().find(song => song.Title === title);
}

export function getUniqueRhythms(): string[] {
  const rhythms = new Set<string>();
  getAllStandards().forEach((song) => {
    if (song.Rhythm)
      rhythms.add(song.Rhythm);
  });
  return Array.from(rhythms).sort();
}

export function getUniqueKeys(): string[] {
  const keys = new Set<string>();
  getAllStandards().forEach((song) => {
    if (song.Key)
      keys.add(song.Key);
  });
  return Array.from(keys).sort();
}

export function getUniqueTimeSignatures(): string[] {
  const sigs = new Set<string>();
  getAllStandards().forEach((song) => {
    if (song.TimeSignature)
      sigs.add(song.TimeSignature);
  });
  return Array.from(sigs).sort();
}

export function getUniqueComposers(): string[] {
  const composers = new Set<string>();
  getAllStandards().forEach((song) => {
    composers.add(song.Composer);
  });
  return Array.from(composers).sort();
}

export function filterByRhythm(rhythm: string): Song[] {
  return getAllStandards().filter(song => song.Rhythm === rhythm);
}

export function filterByKey(key: string): Song[] {
  return getAllStandards().filter(song => song.Key === key);
}

export function filterByTimeSignature(timeSignature: string): Song[] {
  return getAllStandards().filter(song => song.TimeSignature === timeSignature);
}

export function filterByComposer(composer: string): Song[] {
  return getAllStandards().filter(song => song.Composer === composer);
}

export function filterBySearchTerm(term: string): Song[] {
  const lowerTerm = term.toLowerCase();
  return getAllStandards().filter(
    song =>
      song.Title.toLowerCase().includes(lowerTerm)
      || song.Composer.toLowerCase().includes(lowerTerm),
  );
}

export type FilterType = 'rhythm' | 'key' | 'timeSignature' | 'composer' | 'all';

export type FilterState = {
  type: FilterType;
  value: string;
};

export function getFilteredStandards(filter: FilterState): Song[] {
  if (filter.type === 'all')
    return getAllStandards();
  if (filter.type === 'rhythm')
    return filterByRhythm(filter.value);
  if (filter.type === 'key')
    return filterByKey(filter.value);
  if (filter.type === 'timeSignature')
    return filterByTimeSignature(filter.value);
  if (filter.type === 'composer')
    return filterByComposer(filter.value);
  return getAllStandards();
}

export function normalizeChordString(chordString: string): string[] {
  return chordString.split('|').map(chord => chord.trim());
}

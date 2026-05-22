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

export type SongSource = 'jazz-standards' | 'user-created';

export type FilterState = {
  searchTerm: string;
  rhythms: string[];
  timeSignatures: string[];
  sources: SongSource[];
};

export function getFilteredStandards(filter: FilterState): Song[] {
  let results = getAllStandards();

  // Filter by search term (title or composer)
  if (filter.searchTerm) {
    const lowerTerm = filter.searchTerm.toLowerCase();
    results = results.filter(
      song =>
        song.Title.toLowerCase().includes(lowerTerm)
        || song.Composer.toLowerCase().includes(lowerTerm),
    );
  }

  // Filter by rhythms (multi-select)
  if (filter.rhythms.length > 0) {
    results = results.filter(song => filter.rhythms.includes(song.Rhythm || ''));
  }

  // Filter by time signatures (multi-select)
  if (filter.timeSignatures.length > 0) {
    results = results.filter(song =>
      filter.timeSignatures.includes(song.TimeSignature || ''),
    );
  }

  // Filter by sources (multi-select)
  if (filter.sources.length > 0) {
    results = results.filter((_song) => {
      // For now, all songs in the data are jazz-standards
      // This will be updated when user-created songs are added
      const songSource: SongSource = 'jazz-standards';
      return filter.sources.includes(songSource);
    });
  }

  return results;
}

export function normalizeChordString(chordString: string): string[] {
  return chordString.split('|').map(chord => chord.trim());
}

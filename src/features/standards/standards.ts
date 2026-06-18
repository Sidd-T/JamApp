import jazzStandards from '../../../data/jazz-standards.json';

export type MainSegment = {
  Chords: string;
};

export type Ending = {
  Chords: string;
};

export type Section = {
  Label?: string;
  Repeat?: number; // was: boolean
  MainSegment?: { Chords: string };
  Endings?: { Chords: string }[];
};

export type Song = {
  id: string; // UUID for user-created songs, or title-based for jazz-standards
  Title: string;
  Composer: string;
  Key?: string;
  Rhythm?: string;
  TimeSignature?: string;
  Sections: Section[];
};

export type SongWithSource = Song & {
  source: SongSource;
};

function getAllJazzStandards(): Song[] {
  // Add title as ID for jazz-standards (backward compatible)
  return (jazzStandards as Omit<Song, 'id'>[]).map(song => ({
    ...song,
    id: song.Title, // Use title as ID for built-in standards
  }));
}

export function getAllStandards(userSongs: Song[] = []): Song[] {
  return [...getAllJazzStandards(), ...userSongs];
}

export function findStandardByTitle(title: string, userSongs: Song[] = []): Song | undefined {
  return getAllStandards(userSongs).find(song => song.Title === title);
}

export function getUniqueRhythms(userSongs: Song[] = []): string[] {
  const rhythms = new Set<string>();
  getAllStandards(userSongs).forEach((song) => {
    if (song.Rhythm)
      rhythms.add(song.Rhythm);
  });
  return Array.from(rhythms).sort();
}

export function getUniqueKeys(userSongs: Song[] = []): string[] {
  const keys = new Set<string>();
  getAllStandards(userSongs).forEach((song) => {
    if (song.Key)
      keys.add(song.Key);
  });
  return Array.from(keys).sort();
}

export function getUniqueTimeSignatures(userSongs: Song[] = []): string[] {
  const sigs = new Set<string>();
  getAllStandards(userSongs).forEach((song) => {
    if (song.TimeSignature)
      sigs.add(song.TimeSignature);
  });
  return Array.from(sigs).sort();
}

export function getUniqueComposers(userSongs: Song[] = []): string[] {
  const composers = new Set<string>();
  getAllStandards(userSongs).forEach((song) => {
    composers.add(song.Composer);
  });
  return Array.from(composers).sort();
}

export function filterByRhythm(rhythm: string, userSongs: Song[] = []): Song[] {
  return getAllStandards(userSongs).filter(song => song.Rhythm === rhythm);
}

export function filterByKey(key: string, userSongs: Song[] = []): Song[] {
  return getAllStandards(userSongs).filter(song => song.Key === key);
}

export function filterByTimeSignature(timeSignature: string, userSongs: Song[] = []): Song[] {
  return getAllStandards(userSongs).filter(song => song.TimeSignature === timeSignature);
}

export function filterByComposer(composer: string, userSongs: Song[] = []): Song[] {
  return getAllStandards(userSongs).filter(song => song.Composer === composer);
}

export function filterBySearchTerm(term: string, userSongs: Song[] = []): Song[] {
  const lowerTerm = term.toLowerCase();
  return getAllStandards(userSongs).filter(
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

export function getUniqueSources(userSongs: Song[] = []): SongSource[] {
  const sources = new Set<SongSource>();
  sources.add('jazz-standards');
  if (userSongs.length > 0) {
    sources.add('user-created');
  }
  return Array.from(sources);
}

export function getFilteredStandards(filter: FilterState, userSongs: Song[] = []): Song[] {
  let results = getAllStandards(userSongs);

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
    results = results.filter((song) => {
      const songSource: SongSource = song.id === song.Title ? 'jazz-standards' : 'user-created';
      return filter.sources.includes(songSource);
    });
  }

  return results;
}

export function normalizeChordString(chordString: string): string[] {
  return chordString.split('|').map(chord => chord.trim());
}

// Identifies which segment of a section is currently being edited.
// 'main' -> Section.MainSegment
// 'ending' -> Section.Endings[endingIndex]
export type SegmentRef
  = | { segment: 'main' }
    | { segment: 'ending'; endingIndex: number };

export type ActiveTarget = {
  sectionIndex: number;
  segment: SegmentRef;
  /** Bar index within the active segment (matches normalizeChordString output for that segment). */
  localIndex: number;
} | null;

export function segmentsEqual(a: SegmentRef, b: SegmentRef): boolean {
  if (a.segment !== b.segment)
    return false;
  if (a.segment === 'ending' && b.segment === 'ending') {
    return a.endingIndex === b.endingIndex;
  }
  return true;
}

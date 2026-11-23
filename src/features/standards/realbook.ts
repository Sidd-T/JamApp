import { Platform } from 'react-native';
import realBookPages from '../../../data/realbook-index/realbook-pages.generated.json';
import { keyDistance, normalizeKey, transposeKey } from './helpers/music-keys';

type BookKey = 'a-flat' | 'a' | 'b-flat' | 'b' | 'c-sharp' | 'c' | 'd' | 'e-flat' | 'e' | 'f' | 'g-flat' | 'g';

type PageRange = {
  startPage: number;
  endPage: number;
};

type RealBookLookup = Record<string, Partial<Record<BookKey, PageRange>>>;

const BOOK_BY_KEY: Record<string, BookKey> = {
  C: 'c',
  Db: 'c-sharp',
  D: 'd',
  Eb: 'e-flat',
  E: 'e',
  F: 'f',
  Gb: 'g-flat',
  G: 'g',
  Ab: 'a-flat',
  A: 'a',
  Bb: 'b-flat',
  B: 'b',
};

const REALBOOK_LOOKUP = realBookPages as RealBookLookup;
const NATIVE_REALBOOKS_ORIGIN = 'https://www.openchords.top';

export function getRealBookViewerUrl(title: string, originalKey: string, currentKey: string): string | undefined {
  // The PDF variants are labeled opposite to the desired score transposition.
  const transposition = keyDistance(currentKey, originalKey);
  const transposedFromC = normalizeKey(transposeKey('C', transposition)).replace(/m$/, '');
  const bookKey = BOOK_BY_KEY[transposedFromC];
  const pageRange = REALBOOK_LOOKUP[title.trim()]?.[bookKey];

  if (!bookKey || !pageRange)
    return undefined;

  const origin = Platform.OS === 'web'
    && process.env.NODE_ENV !== 'development'
    && typeof window !== 'undefined'
    ? window.location.origin
    : NATIVE_REALBOOKS_ORIGIN;

  const query = new URLSearchParams({
    book: `realbook-${bookKey}.pdf`,
    page: String(pageRange.startPage),
  });

  return `${origin}/realbook-viewer.html?${query.toString()}`;
}

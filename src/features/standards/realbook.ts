import { Platform } from 'react-native';
import realBookPages from '../../../data/realbook-index/realbook-pages.generated.json';
import { normalizeKey } from './helpers/music-keys';

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

export function getRealBookViewerUrl(title: string, key: string): string | undefined {
  const bookKey = BOOK_BY_KEY[normalizeKey(key).replace(/m$/, '')];
  const pageRange = REALBOOK_LOOKUP[title.trim()]?.[bookKey];

  if (!bookKey || !pageRange)
    return undefined;

  const origin = Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : NATIVE_REALBOOKS_ORIGIN;

  const query = new URLSearchParams({
    book: `realbook-${bookKey}.pdf`,
    page: String(pageRange.startPage),
  });

  return `${origin}/realbook-viewer.html?${query.toString()}`;
}

import { Platform } from 'react-native';
import { getRealBookViewerUrl } from './realbook';

describe('getRealBookPdfUrl', () => {
  it('uses the matching key book and adjusted PDF page', () => {
    const url = getRealBookViewerUrl('Autumn Leaves', 'C');

    expect(url).toMatch(/\/realbook-viewer\.html\?book=realbook-c\.pdf&page=143$/);
    if (Platform.OS !== 'web')
      expect(url).toContain('https://www.openchords.top');
  });

  it('normalizes enharmonic major and minor keys', () => {
    expect(getRealBookViewerUrl('Autumn Leaves', 'A#')).toMatch(/\/realbook-viewer\.html\?book=realbook-b-flat\.pdf&page=143$/);
    expect(getRealBookViewerUrl('Autumn Leaves', 'C#min')).toMatch(/\/realbook-viewer\.html\?book=realbook-c-sharp\.pdf&page=145$/);
  });

  it('returns no URL when the title has no index match', () => {
    expect(getRealBookViewerUrl('26-2', 'F')).toBeUndefined();
  });
});

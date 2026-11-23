import { Platform } from 'react-native';
import { getRealBookViewerUrl } from './realbook';

describe('getRealBookPdfUrl', () => {
  it('uses the C book when the tune is not transposed', () => {
    const url = getRealBookViewerUrl('Autumn Leaves', 'Ab', 'Ab');

    expect(url).toMatch(/\/realbook-viewer\.html\?book=realbook-c\.pdf&page=143$/);
    expect(getRealBookViewerUrl('All The Things You Are', 'Ab', 'Ab')).toMatch(/\/realbook-viewer\.html\?book=realbook-c\.pdf&page=82$/);
    if (Platform.OS !== 'web')
      expect(url).toContain('https://www.openchords.top');
  });

  it('selects the book by transposition interval, including minor keys', () => {
    expect(getRealBookViewerUrl('Autumn Leaves', 'Ab', 'Bb')).toMatch(/\/realbook-viewer\.html\?book=realbook-b-flat\.pdf&page=143$/);
    expect(getRealBookViewerUrl('Autumn Leaves', 'C#min', 'Dmin')).toMatch(/\/realbook-viewer\.html\?book=realbook-b\.pdf&page=145$/);
  });

  it('selects the matching Just Friends version for transposed keys', () => {
    expect(getRealBookViewerUrl('Just Friends', 'G', 'A')).toMatch(/\/realbook-viewer\.html\?book=realbook-b-flat\.pdf&page=829$/);
    expect(getRealBookViewerUrl('Just Friends', 'G', 'Bb')).toMatch(/\/realbook-viewer\.html\?book=realbook-a\.pdf&page=829$/);
    expect(getRealBookViewerUrl('Just Friends', 'G', 'C')).toMatch(/\/realbook-viewer\.html\?book=realbook-g\.pdf&page=829$/);
  });

  it('returns no URL when the title has no index match', () => {
    expect(getRealBookViewerUrl('26-2', 'F', 'F')).toBeUndefined();
  });
});

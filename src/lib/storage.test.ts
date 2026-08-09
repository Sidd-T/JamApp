import { getItem, storage } from './storage';

describe('storage getItem', () => {
  it('returns null instead of throwing when persisted JSON is corrupted', () => {
    storage.getString = jest.fn().mockReturnValue('{not-json');

    expect(() => getItem('broken_key')).not.toThrow();
    expect(getItem('broken_key')).toBeNull();
  });
});

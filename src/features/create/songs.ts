import type { Song } from '@/features/standards/standards';
import * as crypto from 'expo-crypto';

/**
 * Generate a UUID v4 for user-created songs
 */
export async function generateSongId(): Promise<string> {
  return crypto.randomUUID();
}

/**
 * Check if a song is user-created (has UUID) vs jazz-standard (keyed by title)
 * User songs have UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function isUserCreatedSong(songId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(songId);
}

/**
 * Serialize song to JSON string for storage
 */
export function songToJSON(song: Song): string {
  return JSON.stringify(song);
}

/**
 * Deserialize song from JSON string
 */
export function songFromJSON(json: string): Song {
  return JSON.parse(json) as Song;
}

/**
 * Serialize multiple songs to JSON array for storage
 */
export function songsToJSON(songs: Song[]): string {
  return JSON.stringify(songs);
}

/**
 * Deserialize multiple songs from JSON array
 */
export function songsFromJSON(json: string): Song[] {
  return JSON.parse(json) as Song[];
}

/**
 * Get source indicator for a song based on its ID
 */
export function getSongSource(songId: string): 'jazz-standards' | 'user-created' {
  return isUserCreatedSong(songId) ? 'user-created' : 'jazz-standards';
}

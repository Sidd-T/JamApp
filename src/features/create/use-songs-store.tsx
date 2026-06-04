import type { Song } from '@/features/standards/standards';
import { create } from 'zustand';
import { generateSongId } from '@/features/create/songs';
import { CreateSongSchema, UpdateSongSchema } from '@/lib/songs/song-validators';
import { getItem, setItem } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const SONGS_STORAGE_KEY = 'user_songs';

type SongsState = {
  songs: Song[];
  addSong: (songData: Omit<Song, 'id'>) => Promise<Song>;
  updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  getSongs: () => Song[];
  getSongById: (id: string) => Song | undefined;
  hydrate: () => Promise<void>;
};

const _useSongsStore = create<SongsState>((set, get) => ({
  songs: [],

  addSong: async (songData) => {
    try {
      // Validate input
      const validated = CreateSongSchema.parse(songData);

      // Generate ID
      const id = await generateSongId();
      const newSong: Song = {
        ...validated,
        id,
      };

      // Update state
      set((state) => {
        const updatedSongs = [...state.songs, newSong];
        // Persist to MMKV
        setItem(SONGS_STORAGE_KEY, updatedSongs);
        return { songs: updatedSongs };
      });

      return newSong;
    }
    catch (error) {
      console.error('Error adding song:', error);
      throw error;
    }
  },

  updateSong: async (id, updates) => {
    try {
      // Validate partial updates
      const validated = UpdateSongSchema.parse(updates);

      set((state) => {
        const updatedSongs = state.songs.map((song) => {
          if (song.id === id) {
            return { ...song, ...validated };
          }
          return song;
        });

        // Only update if song was found
        const songFound = state.songs.some(song => song.id === id);
        if (songFound) {
          setItem(SONGS_STORAGE_KEY, updatedSongs);
          return { songs: updatedSongs };
        }

        return state;
      });
    }
    catch (error) {
      console.error('Error updating song:', error);
      throw error;
    }
  },

  deleteSong: async (id) => {
    try {
      set((state) => {
        const updatedSongs = state.songs.filter(song => song.id !== id);
        setItem(SONGS_STORAGE_KEY, updatedSongs);
        return { songs: updatedSongs };
      });
    }
    catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },

  getSongs: () => get().songs,

  getSongById: id => get().songs.find(song => song.id === id),

  hydrate: async () => {
    try {
      const storedSongs = getItem<Song[]>(SONGS_STORAGE_KEY);
      if (storedSongs && Array.isArray(storedSongs)) {
        set({ songs: storedSongs });
      }
    }
    catch (error) {
      console.error('Error hydrating songs:', error);
      // Continue with empty songs array if hydration fails
    }
  },
}));

export const useSongsStore = createSelectors(_useSongsStore);

// Global action exports
export function addSong(songData: Omit<Song, 'id'>) {
  return _useSongsStore.getState().addSong(songData);
}

export function updateSong(id: string, updates: Partial<Song>) {
  return _useSongsStore.getState().updateSong(id, updates);
}

export function deleteSong(id: string) {
  return _useSongsStore.getState().deleteSong(id);
}

export function hydrateSongs() {
  return _useSongsStore.getState().hydrate();
}

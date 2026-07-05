import type { FilterState, Song, SongSource } from './standards';
import { create } from 'zustand';
import { getItem, setItem } from '@/lib/storage';
import { useSongsStore } from '../create/use-songs-store';
import {
  getFilteredStandards,
  getUniqueComposers,
  getUniqueKeys,
  getUniqueRhythms,
  getUniqueSources,
  getUniqueTimeSignatures,
} from './standards';

const FAVORITES_STORAGE_KEY = 'standards_favourites';

type StandardsStore = {
  filter: FilterState;
  favouriteSongIds: string[];
  setSearchTerm: (term: string) => void;
  setRhythms: (rhythms: string[]) => void;
  setTimeSignatures: (timeSignatures: string[]) => void;
  setSources: (sources: SongSource[]) => void;
  setShowFavouritesOnly: (showFavouritesOnly: boolean) => void;
  toggleFavourite: (songId: string) => void;
  filteredStandards: Song[];
  uniqueRhythms: string[];
  uniqueKeys: string[];
  uniqueTimeSignatures: string[];
  uniqueComposers: string[];
  uniqueSources: SongSource[];
  updateWithUserSongs: (userSongs: Song[]) => void;
};

const initialFavourites = getItem<string[]>(FAVORITES_STORAGE_KEY) ?? [];

export const useStandardsStore = create<StandardsStore>(set => ({
  filter: {
    searchTerm: '',
    rhythms: [],
    timeSignatures: [],
    sources: [],
    showFavouritesOnly: false,
  },
  favouriteSongIds: initialFavourites,
  filteredStandards: getFilteredStandards(
    {
      searchTerm: '',
      rhythms: [],
      timeSignatures: [],
      sources: [],
      showFavouritesOnly: false,
    },
    [],
    initialFavourites,
  ),
  uniqueRhythms: getUniqueRhythms(),
  uniqueKeys: getUniqueKeys(),
  uniqueTimeSignatures: getUniqueTimeSignatures(),
  uniqueComposers: getUniqueComposers(),
  uniqueSources: getUniqueSources(),

  setSearchTerm: (term) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, searchTerm: term };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs, state.favouriteSongIds),
      };
    });
  },

  setRhythms: (rhythms) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, rhythms };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs, state.favouriteSongIds),
      };
    });
  },

  setTimeSignatures: (timeSignatures) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, timeSignatures };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs, state.favouriteSongIds),
      };
    });
  },

  setSources: (sources) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, sources };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs, state.favouriteSongIds),
      };
    });
  },

  setShowFavouritesOnly: (showFavouritesOnly) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, showFavouritesOnly };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs, state.favouriteSongIds),
      };
    });
  },

  toggleFavourite: (songId) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const isFavourite = state.favouriteSongIds.includes(songId);
      const favouriteSongIds = isFavourite
        ? state.favouriteSongIds.filter(id => id !== songId)
        : [...state.favouriteSongIds, songId];

      setItem(FAVORITES_STORAGE_KEY, favouriteSongIds);

      return {
        favouriteSongIds,
        filteredStandards: getFilteredStandards(state.filter, userSongs, favouriteSongIds),
      };
    });
  },

  updateWithUserSongs: (userSongs) => {
    set(state => ({
      filteredStandards: getFilteredStandards(state.filter, userSongs, state.favouriteSongIds),
      uniqueRhythms: getUniqueRhythms(userSongs),
      uniqueKeys: getUniqueKeys(userSongs),
      uniqueTimeSignatures: getUniqueTimeSignatures(userSongs),
      uniqueComposers: getUniqueComposers(userSongs),
      uniqueSources: getUniqueSources(userSongs),
    }));
  },
}));

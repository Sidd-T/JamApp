import type { FilterState, Song, SongSource } from './standards';
import { create } from 'zustand';
import { useSongsStore } from '../create/use-songs-store';
import {

  getFilteredStandards,
  getUniqueComposers,
  getUniqueKeys,
  getUniqueRhythms,
  getUniqueSources,
  getUniqueTimeSignatures,
} from './standards';

type StandardsStore = {
  filter: FilterState;
  setSearchTerm: (term: string) => void;
  setRhythms: (rhythms: string[]) => void;
  setTimeSignatures: (timeSignatures: string[]) => void;
  setSources: (sources: SongSource[]) => void;
  filteredStandards: Song[];
  uniqueRhythms: string[];
  uniqueKeys: string[];
  uniqueTimeSignatures: string[];
  uniqueComposers: string[];
  uniqueSources: SongSource[];
  updateWithUserSongs: (userSongs: Song[]) => void;
};

export const useStandardsStore = create<StandardsStore>(set => ({
  filter: {
    searchTerm: '',
    rhythms: [],
    timeSignatures: [],
    sources: [],
  },
  filteredStandards: getFilteredStandards(
    {
      searchTerm: '',
      rhythms: [],
      timeSignatures: [],
      sources: [],
    },
    [],
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
        filteredStandards: getFilteredStandards(newFilter, userSongs),
      };
    });
  },

  setRhythms: (rhythms) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, rhythms };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs),
      };
    });
  },

  setTimeSignatures: (timeSignatures) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, timeSignatures };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs),
      };
    });
  },

  setSources: (sources) => {
    set((state) => {
      const userSongs = useSongsStore.getState().songs;
      const newFilter: FilterState = { ...state.filter, sources };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter, userSongs),
      };
    });
  },

  updateWithUserSongs: (userSongs) => {
    set(state => ({
      filteredStandards: getFilteredStandards(state.filter, userSongs),
      uniqueRhythms: getUniqueRhythms(userSongs),
      uniqueKeys: getUniqueKeys(userSongs),
      uniqueTimeSignatures: getUniqueTimeSignatures(userSongs),
      uniqueComposers: getUniqueComposers(userSongs),
      uniqueSources: getUniqueSources(userSongs),
    }));
  },
}));

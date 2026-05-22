import type { FilterState, Song, SongSource } from './standards';
import { create } from 'zustand';
import {

  getFilteredStandards,

  getUniqueComposers,
  getUniqueKeys,
  getUniqueRhythms,
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
};

export const useStandardsStore = create<StandardsStore>(set => ({
  filter: {
    searchTerm: '',
    rhythms: [],
    timeSignatures: [],
    sources: [],
  },
  filteredStandards: getFilteredStandards({
    searchTerm: '',
    rhythms: [],
    timeSignatures: [],
    sources: [],
  }),
  uniqueRhythms: getUniqueRhythms(),
  uniqueKeys: getUniqueKeys(),
  uniqueTimeSignatures: getUniqueTimeSignatures(),
  uniqueComposers: getUniqueComposers(),

  setSearchTerm: (term) => {
    set((state) => {
      const newFilter: FilterState = { ...state.filter, searchTerm: term };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter),
      };
    });
  },

  setRhythms: (rhythms) => {
    set((state) => {
      const newFilter: FilterState = { ...state.filter, rhythms };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter),
      };
    });
  },

  setTimeSignatures: (timeSignatures) => {
    set((state) => {
      const newFilter: FilterState = { ...state.filter, timeSignatures };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter),
      };
    });
  },

  setSources: (sources) => {
    set((state) => {
      const newFilter: FilterState = { ...state.filter, sources };
      return {
        filter: newFilter,
        filteredStandards: getFilteredStandards(newFilter),
      };
    });
  },
}));

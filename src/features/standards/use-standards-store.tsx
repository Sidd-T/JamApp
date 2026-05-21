import type { FilterState, Song } from './standards';
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
  setFilter: (type: FilterState['type'], value: string) => void;
  filteredStandards: Song[];
  uniqueRhythms: string[];
  uniqueKeys: string[];
  uniqueTimeSignatures: string[];
  uniqueComposers: string[];
};

export const useStandardsStore = create<StandardsStore>(set => ({
  filter: { type: 'all', value: '' },
  filteredStandards: getFilteredStandards({ type: 'all', value: '' }),
  uniqueRhythms: getUniqueRhythms(),
  uniqueKeys: getUniqueKeys(),
  uniqueTimeSignatures: getUniqueTimeSignatures(),
  uniqueComposers: getUniqueComposers(),

  setFilter: (type, value) => {
    const newFilter: FilterState = { type, value };
    set({
      filter: newFilter,
      filteredStandards: getFilteredStandards(newFilter),
    });
  },
}));

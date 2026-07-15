import { create } from 'zustand';

type SetlistNavigationState = {
  cameFromSetlist: boolean;
  markFromSetlist: () => void;
  clear: () => void;
};

export const useSetlistNavigation = create<SetlistNavigationState>(set => ({
  cameFromSetlist: false,
  markFromSetlist: () => set({ cameFromSetlist: true }),
  clear: () => set({ cameFromSetlist: false }),
}));

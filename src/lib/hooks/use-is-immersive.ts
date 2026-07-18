import { create } from 'zustand';

type ImmersiveModeState = {
  isImmersive: boolean;
  toggle: () => void;
  show: () => void;
};

export const useImmersiveMode = create<ImmersiveModeState>(set => ({
  isImmersive: false,
  toggle: () => set(state => ({ isImmersive: !state.isImmersive })),
  show: () => set({ isImmersive: false }),
}));

import { create } from 'zustand';
import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const PROFILE_STORAGE_KEY = 'user_profile_name';

type ProfileState = {
  name: string;
  setName: (name: string) => void;
  hydrate: () => void;
};

const _useProfileStore = create<ProfileState>(set => ({
  name: '',
  setName: (name) => {
    const trimmedName = name.trim();
    set({ name: trimmedName });
    void setItem(PROFILE_STORAGE_KEY, trimmedName);
  },
  hydrate: () => {
    const storedName = getItem<string>(PROFILE_STORAGE_KEY);
    if (typeof storedName === 'string') {
      set({ name: storedName });
    }
  },
}));

export const useProfileStore = createSelectors(_useProfileStore);

export function setProfileName(name: string) {
  _useProfileStore.getState().setName(name);
}

export function hydrateProfile() {
  _useProfileStore.getState().hydrate();
}

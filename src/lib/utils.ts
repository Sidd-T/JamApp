import type { StoreApi, UseBoundStore } from 'zustand';
import { Linking } from 'react-native';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then(canOpen => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(_store: S) {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store(s => s[k as keyof typeof s]);
  }

  return store;
}

/**
 * Generate a unique key for list items that combines semantic content with position.
 * This ensures uniqueness even when items have identical content (e.g., repeated sections).
 * @param semanticBase - A meaningful identifier based on the item's content
 * @param position - The index/position of the item in the array
 * @returns A unique key string
 */
export function generateListKey(semanticBase: string, position: number): string {
  return `${semanticBase}-pos-${position}`;
}

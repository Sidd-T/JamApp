import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);

  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as T | null;
    return parsed ?? null;
  }
  catch (error) {
    console.warn(`[storage] Failed to parse persisted JSON for key "${key}" — clearing the corrupted value`, error);

    try {
      storage.remove(key);
    }
    catch {
      // MMKV implementations differ slightly across platforms. If the delete API is missing,
      // we still continue booting without crashing the app.
    }

    return null;
  }
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.remove(key);
}

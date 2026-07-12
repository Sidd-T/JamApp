import ar from '@/translations/ar.json';
import en from '@/translations/en.json';
import fr from '@/translations/fr.json';

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  fr: {
    translation: fr,
  },
};

export type Language = keyof typeof resources;

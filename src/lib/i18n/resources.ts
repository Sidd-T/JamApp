import ar from '@/translations/ar.json';
import en from '@/translations/en.json';
import fr from '@/translations/fr.json';
import jp from '@/translations/jp.json';
import kr from '@/translations/kr.json';
import zhCN from '@/translations/zh-cn.json';
import zhTW from '@/translations/zh-tw.json';

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
  kr: {
    translation: kr,
  },
  jp: {
    translation: jp,
  },
  zhCN: {
    translation: zhCN,
  },
  zhTW: {
    translation: zhTW,
  },
};

export type Language = keyof typeof resources;

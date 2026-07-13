import type { MultiSelectOptionType } from '@/components/ui';

import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { Options, useModal } from '@/components/ui';
import { translate, useSelectedLanguage } from '@/lib/i18n';

import { SettingsItem } from './settings-item';

export function LanguageItem() {
  const { language, setLanguage } = useSelectedLanguage();
  const modal = useModal();
  const onSelect = React.useCallback(
    (option: MultiSelectOptionType) => {
      setLanguage(option.value as Language);
      modal.dismiss();
    },
    [setLanguage, modal],
  );

  const langs = React.useMemo(
    () => [
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
      { label: translate('settings.french'), value: 'fr' },
      { label: translate('settings.korean'), value: 'kr' },
      { label: translate('settings.japanese'), value: 'jp' },
      { label: translate('settings.chinese_simplified'), value: 'zhCN' },
      { label: translate('settings.chinese_traditional'), value: 'zhTW' },
    ],
    [],
  );

  const selectedLanguage = React.useMemo(
    () => langs.find(lang => lang.value === language),
    [language, langs],
  );

  return (
    <>
      <SettingsItem
        text="settings.language"
        value={selectedLanguage?.label}
        onPress={modal.present}
      />
      <Options
        ref={modal.ref}
        options={langs}
        onSelect={onSelect}
        value={selectedLanguage?.value}
      />
    </>
  );
}

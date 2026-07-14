import Env from 'env';
import * as StoreReview from 'expo-store-review';
import * as React from 'react';
import { Platform, Share as RNShare } from 'react-native';
import { useUniwind } from 'uniwind';

import {
  colors,
  FocusAwareStatusBar,
  Input,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { useProfileStore } from '@/lib/hooks/use-profile';
import { openBrowser, translate } from '@/lib/i18n';
import { LanguageItem } from './components/language-item';
import { SettingsContainer } from './components/settings-container';
import { SettingsItem } from './components/settings-item';
import { ThemeItem } from './components/theme-item';

export function SettingsScreen() {
  const { theme } = useUniwind();
  const profileName = useProfileStore.use.name();
  const setProfileName = useProfileStore.use.setName();
  const iconColor
    = theme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const handleShare = async () => {
    try {
      await RNShare.share({
        url: 'https://spades.top',
      });
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleRate = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
    else {
      // fallback to store page directly
      openBrowser(
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/idYOUR_APP_ID?action=write-review'
          : 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME',
      );
    }
  };

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-16">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>

          <SettingsContainer title="settings.generale">
            <View className="flex-row items-center justify-between gap-8 px-4 py-2">
              <Text className="pb-2 text-black dark:text-white">
                {translate('settings.yourName')}
              </Text>
              <View className="w-1/2">
                <Input
                  placeholder={translate('settings.namePlaceholder')}
                  value={profileName}
                  onChangeText={setProfileName}
                  style={{ textAlign: 'right', borderWidth: 1 }}
                />
              </View>

            </View>
            <LanguageItem />
            <ThemeItem />
          </SettingsContainer>

          <SettingsContainer title="settings.about">
            <SettingsItem
              text="settings.app_name"
              value={Env.EXPO_PUBLIC_NAME}
            />
            <SettingsItem
              text="settings.version"
              value={Env.EXPO_PUBLIC_VERSION}
            />
          </SettingsContainer>

          <SettingsContainer title="settings.support">
            <SettingsItem
              text="settings.share"
              icon={<Share color={iconColor} />}
              onPress={handleShare}
            />
            <SettingsItem
              text="settings.rate"
              icon={<Rate color={iconColor} />}
              onPress={handleRate}
            />
            <SettingsItem
              text="settings.support"
              icon={<Support color={iconColor} />}
              onPress={() => { openBrowser('https://spades.top'); }}
            />
          </SettingsContainer>

          <SettingsContainer title="settings.links">
            <SettingsItem
              text="settings.github"
              icon={<Github color={iconColor} />}
              onPress={() => { openBrowser('https://github.com/Sidd-T/JamApp'); }}
            />
            <SettingsItem
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => { openBrowser('https://spades.top'); }}
            />
          </SettingsContainer>

        </View>
      </ScrollView>
    </>
  );
}

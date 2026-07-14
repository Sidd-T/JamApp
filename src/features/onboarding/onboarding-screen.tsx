import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
import { useProfileStore } from '@/lib/hooks/use-profile';
import { translate } from '@/lib/i18n';
import { Cover } from './components/cover';

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const profileName = useProfileStore.use.name();
  const setProfileName = useProfileStore.use.setName();
  const canContinue = profileName.trim().length > 0;

  return (
    <View className="flex h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="flex items-center justify-start px-6">
        <Text className="my-3 text-center text-5xl font-bold">
          {translate('onboarding.title')}
        </Text>
        <Text className="mb-2 text-center text-lg text-neutral-600">
          {translate('onboarding.subtitle')}
        </Text>
        <View className="mt-4 w-full">
          <Text className="mb-2 text-left text-base font-semibold text-neutral-700 dark:text-neutral-200">
            {translate('onboarding.namePrompt')}
          </Text>
          <Input
            placeholder={translate('onboarding.namePlaceholder')}
            value={profileName}
            onChangeText={setProfileName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

      </View>
      <SafeAreaView className="mt-6">
        <Button
          label={translate('onboarding.cta')}
          onPress={() => {
            if (!canContinue)
              return;
            setIsFirstTime(false);
            router.replace('/standards');
          }}
          disabled={!canContinue}
        />
      </SafeAreaView>
    </View>
  );
}

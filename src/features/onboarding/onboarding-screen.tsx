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
import { useProfileStore } from '@/lib/profile';
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
          JamTime
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          Open source, cross-platform, Real Book and jam session app
        </Text>
        <View className="mt-4 w-full">
          <Text className="mb-2 text-left text-base font-semibold text-gray-700 dark:text-gray-200">
            Enter Name Before Continuing:
          </Text>
          <Input
            placeholder="Name"
            value={profileName}
            onChangeText={setProfileName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

      </View>
      <SafeAreaView className="mt-6">
        <Button
          label="Let's Get Started"
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

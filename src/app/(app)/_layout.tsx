import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import {
  Add as AddIcon,
  MusicList as MusicIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { useImmersiveMode } from '@/lib/hooks/use-is-immersive';
import { translate } from '@/lib/i18n';

function AnimatedTabBar(props: BottomTabBarProps) {
  const isImmersive = useImmersiveMode(s => s.isImmersive);

  if (isImmersive)
    return null;

  return (
    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      hideSplash();
    }, 1000);
    return () => clearTimeout(timer);
  }, [hideSplash]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs tabBar={props => <AnimatedTabBar {...props} />}>
      <Tabs.Screen
        name="standards"
        options={{
          title: translate('standards.title'),
          headerShown: false,
          tabBarIcon: ({ color }) => <MusicIcon color={color} />,
          tabBarButtonTestID: 'standards-tab',
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: translate('create.title'),
          headerShown: false,
          tabBarIcon: ({ color }) => <AddIcon color={color} />,
          tabBarButtonTestID: 'create-tab',
        }}
      />

      <Tabs.Screen
        name="jams"
        options={{
          title: translate('jams.title'),
          headerShown: false,
          tabBarIcon: ({ color }) => <PeopleIcon color={color} />,
          tabBarButtonTestID: 'jams-tab',
          href: Platform.OS === 'web' ? null : undefined,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: translate('settings.title'),
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

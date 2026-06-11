import { Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import {
  Add as AddIcon,
  MusicList as MusicIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

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
    <Tabs>
      <Tabs.Screen
        name="standards"
        options={{
          title: 'Standards',
          headerShown: false,
          tabBarIcon: ({ color }) => <MusicIcon color={color} />,
          tabBarButtonTestID: 'standards-tab',
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          headerShown: false,
          tabBarIcon: ({ color }) => <AddIcon color={color} />,
          tabBarButtonTestID: 'create-tab',
        }}
      />

      <Tabs.Screen
        name="jams"
        options={{
          title: 'Jams',
          headerShown: false,
          tabBarIcon: ({ color }) => <PeopleIcon color={color} />,
          tabBarButtonTestID: 'jams-tab',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

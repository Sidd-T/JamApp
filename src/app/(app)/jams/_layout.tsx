import { Stack } from 'expo-router';
import * as React from 'react';

import { useThemeConfig } from '@/components/ui/use-theme-config';
import { translate } from '@/lib/i18n';

export default function JamsLayout() {
  const theme = useThemeConfig();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { fontSize: 24, color: theme.colors.text },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: translate('jams.title'),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }: any) => ({
          title: route.params?.name ? decodeURIComponent(route.params.name) : translate('standards.detail.title'),
          headerBackTitle: translate('jams.back'),
        })}
      />
    </Stack>
  );
}

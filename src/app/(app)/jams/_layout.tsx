import { Stack } from 'expo-router';
import * as React from 'react';

import { useThemeConfig } from '@/components/ui/use-theme-config';

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
          title: 'Jams',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }: any) => ({
          title: route.params?.id ? decodeURIComponent(route.params.id) : 'Standard',
          headerBackTitle: 'Back',
        })}
      />
    </Stack>
  );
}

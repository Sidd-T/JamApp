import { Stack } from 'expo-router';
import * as React from 'react';

import { useThemeConfig } from '@/components/ui/use-theme-config';

export default function CreateLayout() {
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
          title: 'My Songs',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[option]"
        options={({ route }: any) => ({
          title:
            route.params?.option && decodeURIComponent(route.params.option) === 'edit'
              ? 'Edit Song'
              : 'Create Song',
          headerBackTitle: 'Back',
        })}
      />
    </Stack>
  );
}

import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { ArrowRight } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';

export default function StandardsLayout() {
  const theme = useThemeConfig();
  const router = useRouter();

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
          title: 'Jazz Standards',
          headerLargeTitle: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }: any) => {
          const routeParams = route.params ?? {};
          const navigateBackToRoom = routeParams.returnTo === 'room' && routeParams.roomId;

          return {
            title: routeParams.title ?? (routeParams.id ? decodeURIComponent(routeParams.id) : 'Standard'),
            headerBackTitle: 'Back',
            headerTitleAlign: 'center',
            headerBackVisible: !navigateBackToRoom,
            headerLeft: navigateBackToRoom
              ? () => (
                  <Pressable
                    onPress={() => {
                      router.replace(
                        `/jams/${encodeURIComponent(routeParams.roomId)}?name=${encodeURIComponent(routeParams.roomName ?? '')}`,
                      );
                    }}
                    style={{ transform: [{ scaleX: -1 }] }}
                  >
                    <ArrowRight width={20} height={20} color={theme.colors.text} />
                  </Pressable>
                )
              : undefined,
          };
        }}
      />
    </Stack>
  );
}

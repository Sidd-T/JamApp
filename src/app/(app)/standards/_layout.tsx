import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { ArrowRight } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { useSetlistNavigation } from '@/lib/hooks/use-setlist-navigation';
import { translate } from '@/lib/i18n';

export default function StandardsLayout() {
  const theme = useThemeConfig();
  const router = useRouter();
  const cameFromSetlist = useSetlistNavigation(s => s.cameFromSetlist);
  const clearSetlistFlag = useSetlistNavigation(s => s.clear);

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
          title: translate('standards.title'),
          headerLargeTitle: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }: any) => {
          const routeParams = route.params ?? {};
          const navigateBackToRoom
            = routeParams.returnTo === 'room'
              && routeParams.roomId
              && cameFromSetlist;

          return {
            title:
              routeParams.title
              ?? (routeParams.id
                ? decodeURIComponent(routeParams.id)
                : translate('standards.detail.title')),
            headerBackTitle: translate('standards.detail.back'),
            headerTitleAlign: 'center',
            headerBackVisible: !navigateBackToRoom,
            headerLeft: navigateBackToRoom
              ? () => (
                  <Pressable
                    onPress={() => {
                      clearSetlistFlag();
                      router.replace(
                        `/jams/${encodeURIComponent(routeParams.roomId)}?name=${encodeURIComponent(routeParams.roomName ?? '')}`,
                      );
                    }}
                    className="-scale-x-100"
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

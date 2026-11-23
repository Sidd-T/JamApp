import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import { FocusAwareStatusBar, Text } from '@/components/ui';
import { Settings } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { useJamsStore } from '@/features/jams/use-jams-store';
import { useImmersiveMode } from '@/lib/hooks/use-is-immersive';
import { SectionDisplay, TransposeControl } from './components';
import { RealBookButton } from './components/realbook-button';
import { normalizeKey } from './helpers/music-keys';
import { transposeSections } from './helpers/transpose-chords';
import { findStandardById } from './standards';

export function StandardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : '';
  const jamSong = useJamsStore.use.setlist().find(entry => entry.song.id === decodedId)?.song;
  const standard = jamSong ?? findStandardById(decodedId);
  const navigation = useNavigation();
  const theme = useThemeConfig();

  const [currentKey, setCurrentKey] = React.useState(() => normalizeKey(standard?.Key ?? 'C'));
  const [isTransposePopupVisible, setIsTransposePopupVisible] = React.useState(false);

  const isImmersive = useImmersiveMode(s => s.isImmersive);
  const toggleImmersive = useImmersiveMode(s => s.toggle);
  const showChrome = useImmersiveMode(s => s.show);

  React.useLayoutEffect(() => {
    if (!standard)
      return;

    navigation.setOptions({
      headerTitle: () => (
        <View className="flex-row items-center">
          <Text
            numberOfLines={1}
            style={{ maxWidth: 240, fontSize: 20, color: theme.colors.text }}
          >
            {standard.Title}
          </Text>
          <RealBookButton
            title={standard.Title}
            originalKey={standard.Key ?? 'C'}
            currentKey={currentKey}
            className="ml-2"
          />
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setIsTransposePopupVisible(visible => !visible)}
          accessibilityRole="button"
          accessibilityLabel="Transpose settings"
          accessibilityState={{ expanded: isTransposePopupVisible }}
          className="mr-3"
        >
          <Settings color={theme.colors.text} width={22} height={22} />
        </Pressable>
      ),
    });
  }, [currentKey, isTransposePopupVisible, navigation, standard, theme.colors.text]);

  // Always bring the header/tab bar back when leaving this screen
  useFocusEffect(
    React.useCallback(() => {
      return () => showChrome();
    }, [showChrome]),
  );

  const transposedSections = React.useMemo(() => {
    if (!standard)
      return [];
    return transposeSections(standard.Sections, standard.Key ?? 'C', currentKey);
  }, [standard, currentKey]);

  if (!standard) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <FocusAwareStatusBar />
        <Text className="text-neutral-600 dark:text-neutral-400">404</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FocusAwareStatusBar />
      {!isImmersive && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(200)}
          className="relative z-20 mb-4 flex-row items-center px-1 pt-1"
        >
          <View className="flex-1">
            {standard.Rhythm && (
              <Text className="text-sm font-semibold text-neutral-700 italic dark:text-neutral-300">
                {standard.Rhythm}
              </Text>
            )}
          </View>

          <View className="flex-1 items-end">
            <Text className="text-base text-neutral-700 dark:text-neutral-300">
              {standard.Composer}
            </Text>
          </View>
        </Animated.View>
      )}

      <Animated.View layout={LinearTransition.duration(200)} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1 }} onPress={toggleImmersive}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-1">
              {transposedSections.map((section, index) => (
                <SectionDisplay
                  key={`${standard.Title}-section-${section.Label || ''}-${index}`}
                  section={section}
                  index={index}
                  timeSignature={standard.TimeSignature}
                  createMode={false}
                />
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Animated.View>

      <TransposeControl
        currentKey={currentKey}
        originalKey={normalizeKey(standard.Key ?? 'C')}
        onChange={setCurrentKey}
        visible={isTransposePopupVisible}
        onClose={() => setIsTransposePopupVisible(false)}
        testID="transpose-control"
      />
    </View>
  );
}

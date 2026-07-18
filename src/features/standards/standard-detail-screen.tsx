import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { useJamsStore } from '@/features/jams/use-jams-store';
import { useImmersiveMode } from '@/lib/hooks/use-is-immersive';
import { SectionDisplay, TransposeControl } from './components';
import { normalizeKey } from './helpers/music-keys';
import { transposeSections } from './helpers/transpose-chords';
import { findStandardById } from './standards';

export function StandardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : '';
  const jamSong = useJamsStore.use.setlist().find(entry => entry.song.id === decodedId)?.song;
  const standard = jamSong ?? findStandardById(decodedId);

  const [currentKey, setCurrentKey] = React.useState(() => normalizeKey(standard?.Key ?? 'C'));

  const isImmersive = useImmersiveMode(s => s.isImmersive);
  const toggleImmersive = useImmersiveMode(s => s.toggle);
  const showChrome = useImmersiveMode(s => s.show);

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
        <Text className="text-neutral-600 dark:text-neutral-400">Standard not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
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

          <TransposeControl
            currentKey={currentKey}
            originalKey={normalizeKey(standard.Key ?? 'C')}
            onChange={setCurrentKey}
            testID="transpose-control"
          />

          <View className="flex-1 items-end">
            <Text className="text-base text-neutral-700 dark:text-neutral-300">
              {standard.Composer}
            </Text>
          </View>
        </Animated.View>
      )}

      <Animated.View layout={LinearTransition.duration(200)} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1 }} onPress={toggleImmersive}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-1">
              {transposedSections.map((section, index) => (
                <SectionDisplay
                  key={`${standard.Title}-section-${section.Label || ''}-${index}`}
                  section={section}
                  index={index}
                  timeSignature={standard.TimeSignature}
                />
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Animated.View>
    </View>
  );
}

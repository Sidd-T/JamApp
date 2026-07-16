import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';
import { useJamsStore } from '@/features/jams/use-jams-store';
import { SectionDisplay, TransposeControl } from './components';
import { keyDistance } from './helpers/music-keys';
import { transposeSections } from './helpers/transpose-chords';
import { findStandardById } from './standards';

export function StandardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : '';
  const jamSong = useJamsStore.use.setlist().find(entry => entry.song.id === decodedId)?.song;
  const standard = jamSong ?? findStandardById(decodedId);

  const [currentKey, setCurrentKey] = React.useState(standard?.Key ?? 'C');

  const transposedSections = React.useMemo(() => {
    if (!standard)
      return [];
    const semitones = keyDistance(standard.Key ?? 'C', currentKey);
    return transposeSections(standard.Sections, semitones);
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
      {/* Header row — deliberately OUTSIDE the ScrollView, same as StandardsFilter sits above FlashList */}
      <View className="relative z-20 mb-4 flex-row items-center px-1 pt-1">
        <View className="flex-1">
          {standard.Rhythm && (
            <Text className="text-sm font-semibold text-neutral-700 italic dark:text-neutral-300">
              {standard.Rhythm}
            </Text>
          )}
        </View>

        <TransposeControl
          currentKey={currentKey}
          originalKey={standard.Key}
          onChange={setCurrentKey}
          testID="transpose-control"
        />

        <View className="flex-1 items-end">
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {standard.Composer}
          </Text>
        </View>
      </View>

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
    </View>
  );
}

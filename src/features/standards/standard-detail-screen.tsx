import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';
import { useJamsStore } from '@/features/jams/use-jams-store';
import { SectionDisplay } from './components';
import { findStandardById } from './standards';

export function StandardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : '';
  const jamSong = useJamsStore.use.setlist().find(entry => entry.song.id === decodedId)?.song;
  const standard = jamSong ?? findStandardById(decodedId);

  if (!standard) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text className="text-neutral-600 dark:text-neutral-400">Standard not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4">

        {/* Rhythm + Key row */}
        <View className="mb-4 flex-row items-center justify-between gap-4">
          {standard.Rhythm && (
            <Text className="text-sm font-semibold text-neutral-700 italic dark:text-neutral-300">
              {standard.Rhythm}
            </Text>
          )}
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {standard.Composer}
          </Text>
        </View>

        {/* ── Sections ── */}
        {standard.Sections.map((section, index) => (
          <SectionDisplay
            key={`${standard.Title}-section-${section.Label || ''}-${index}`}
            section={section}
            index={index}
            timeSignature={standard.TimeSignature}
          />
        ))}
      </View>
    </ScrollView>
  );
}

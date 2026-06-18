import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';
import { generateListKey } from '@/lib/utils';
import { SectionDisplay } from './components';
import { findStandardByTitle } from './standards';

export function StandardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedTitle = id ? decodeURIComponent(id) : '';
  const standard = findStandardByTitle(decodedTitle);

  if (!standard) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <Text className="text-gray-600 dark:text-gray-400">Standard not found</Text>
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
            <Text className="text-sm font-semibold text-gray-700 italic dark:text-gray-300">
              {standard.Rhythm}
            </Text>
          )}
          <Text className="text-base text-gray-700 dark:text-gray-300">
            {standard.Composer}
          </Text>
        </View>

        {/* ── Sections ── */}
        {standard.Sections.map((section, index) => (
          <SectionDisplay
            key={generateListKey(`${standard.Title}-section-${section.Label || ''}`, index)}
            section={section}
            index={index}
            timeSignature={standard.TimeSignature}
          />
        ))}
      </View>
    </ScrollView>
  );
}

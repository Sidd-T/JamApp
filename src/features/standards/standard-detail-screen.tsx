import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';
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
    <ScrollView className="flex-1 bg-white dark:bg-gray-950" showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-4 pb-8">
        {/* Header */}
        <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {standard.Title}
        </Text>
        <Text className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          by
          {' '}
          {standard.Composer}
        </Text>

        {/* Metadata */}
        <View className="mb-8 flex-row flex-wrap gap-3">
          {standard.Key && (
            <View className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Key
              </Text>
              <Text className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {standard.Key}
              </Text>
            </View>
          )}
          {standard.TimeSignature && (
            <View className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 dark:border-green-800 dark:bg-green-900/20">
              <Text className="text-xs font-semibold text-green-600 dark:text-green-400">
                Time Signature
              </Text>
              <Text className="text-sm font-bold text-green-900 dark:text-green-200">
                {standard.TimeSignature}
              </Text>
            </View>
          )}
          {standard.Rhythm && (
            <View className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 dark:border-purple-800 dark:bg-purple-900/20">
              <Text className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Rhythm
              </Text>
              <Text className="text-sm font-bold text-purple-900 dark:text-purple-200">
                {standard.Rhythm}
              </Text>
            </View>
          )}
        </View>

        {/* Sections */}
        <View className="border-t border-gray-200 pt-6 dark:border-gray-800">
          <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Chord Progression
          </Text>
          {standard.Sections.map((section, index) => (
            <SectionDisplay key={index} section={section} index={index} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

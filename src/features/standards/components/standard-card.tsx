import type { Song } from '../standards';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';

type StandardCardProps = {
  standard: Song;
  onPress: () => void;
};

export function StandardCard({ standard, onPress }: StandardCardProps) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View className="mb-3 rounded-xl border border-gray-200 bg-neutral-100 p-4 shadow-md dark:border-gray-800 dark:bg-gray-900">
        <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          {standard.Title}
        </Text>
        <Text className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {standard.Composer}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {standard.Key && (
            <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
              <Text className="text-xs text-black dark:text-primary-200">
                {standard.Key}
              </Text>
            </View>
          )}
          {standard.TimeSignature && (
            <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
              <Text className="text-xs text-black dark:text-primary-200">
                {standard.TimeSignature}
              </Text>
            </View>
          )}
          {standard.Rhythm && (
            <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
              <Text className="text-xs text-black dark:text-primary-200">
                {standard.Rhythm}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

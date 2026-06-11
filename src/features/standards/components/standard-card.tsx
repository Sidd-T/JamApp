import type { Song } from '../standards';
import { Pressable, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { Support } from '@/components/ui/icons';

type StandardCardProps = {
  standard: Song;
  onPress: () => void;
  onAdd?: () => void;
  added?: boolean;
};

export function StandardCard({ standard, onPress, onAdd, added = false }: StandardCardProps) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View className={`mb-3 rounded-xl border bg-neutral-100 p-4 shadow-md dark:bg-gray-900 ${
        added
          ? 'border-primary-500 dark:border-primary-400'
          : 'border-gray-200 dark:border-gray-800'
      }`}
      >
        <View className="flex-row gap-4">

          {/* Left: all text content */}
          <View className="flex-1">
            <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {standard.Title}
            </Text>
            <Text className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {standard.Composer}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {standard.Key && (
                <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                  <Text className="text-xs text-black dark:text-primary-200">{standard.Key}</Text>
                </View>
              )}
              {standard.TimeSignature && (
                <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                  <Text className="text-xs text-black dark:text-primary-200">{standard.TimeSignature}</Text>
                </View>
              )}
              {standard.Rhythm && (
                <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                  <Text className="text-xs text-black dark:text-primary-200">{standard.Rhythm}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right: star top, add button bottom */}
          <View className="items-end justify-between">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                // favourite handler goes here
              }}
            >
              <Support />
            </Pressable>

            {onAdd && (
              <Button
                label={added ? '✓' : 'Add to Jam'}
                variant={added ? 'secondary' : 'outline'}
                size="sm"
                className="-m-0.5 rounded-full"
                onPress={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
              />
            )}
          </View>

        </View>
      </View>
    </Pressable>
  );
}

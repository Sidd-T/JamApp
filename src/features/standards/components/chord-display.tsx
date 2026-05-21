import { View } from 'react-native';
import { Text } from '@/components/ui';
import { normalizeChordString } from '../standards';

type ChordDisplayProps = {
  chordString: string;
  label?: string;
};

export function ChordDisplay({ chordString, label }: ChordDisplayProps) {
  if (!chordString)
    return null;

  const chords = normalizeChordString(chordString);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}
      <View className="rounded-sm border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <View className="flex-row flex-wrap gap-2">
          {chords.map((chord, index) => (
            <View
              key={index}
              className="rounded-sm border border-gray-300 bg-white px-3 py-1 dark:border-gray-600 dark:bg-gray-700"
            >
              <Text className="font-mono text-sm text-gray-800 dark:text-gray-100">
                {chord}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

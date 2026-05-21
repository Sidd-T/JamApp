import type { Section } from '../standards';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ChordDisplay } from './chord-display';

type SectionDisplayProps = {
  section: Section;
  index: number;
};

export function SectionDisplay({ section, index }: SectionDisplayProps) {
  const label = section.Label || `Section ${index + 1}`;

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        {label}
      </Text>

      {section.MainSegment?.Chords && (
        <ChordDisplay chordString={section.MainSegment.Chords} label="Main" />
      )}

      {section.Endings && section.Endings.length > 0 && (
        <View>
          <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Endings
          </Text>
          {section.Endings.map((ending, endingIndex) => (
            <ChordDisplay
              key={endingIndex}
              chordString={ending.Chords}
              label={`Ending ${endingIndex + 1}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

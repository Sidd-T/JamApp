import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SectionDisplay } from '@/features/standards/components';
import { generateListKey } from '@/lib/utils';

export function SongFormSectionsPreview({ sections, timeSignature, onSelectSection }: any) {
  return (
    <View className="border-t border-gray-200 py-3 dark:border-gray-800">
      <Text className="mb-2 text-lg text-gray-300">
        Sections (tap to edit)
      </Text>

      <View className="rounded-sm bg-gray-50 p-2 dark:bg-gray-900">
        {sections.map((section: any, i: number) => (
          <Pressable key={generateListKey(`section-preview-${section.Label}`, i)} onPress={() => onSelectSection(i)}>
            <SectionDisplay section={section} index={i} timeSignature={timeSignature} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

import type { Section, SegmentRef } from '@/features/standards/standards';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Switch } from '@/components/ui';
import { SectionDisplay } from '@/features/standards/components';
import { generateListKey } from '@/lib/utils';

type SongFormSectionsPreviewProps = {
  sections: Section[];
  timeSignature?: string;
  onSelectBar: (sectionIndex: number, segment: SegmentRef, localIndex: number) => void;
  onRepeatChange: (sectionIndex: number, repeat: number) => void;
  onModeChange: (sectionIndex: number, mode: 'repeat' | 'endings') => void;
  onEndingCountChange: (sectionIndex: number, count: number) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onAddSection: () => void;
};

function sectionMode(section: Section): 'repeat' | 'endings' {
  // Endings take precedence as the signal: if Endings exist, we're in
  // endings mode regardless of whatever Repeat happens to hold (Repeat
  // should already be cleared by onModeChange, but this keeps display
  // correct even if some other code path left both set).
  return section.Endings && section.Endings.length > 0 ? 'endings' : 'repeat';
}

export function SongFormSectionsPreview({
  sections,
  timeSignature,
  onSelectBar,
  onRepeatChange,
  onModeChange,
  onEndingCountChange,
  onDeleteSection,
  onAddSection,
}: SongFormSectionsPreviewProps) {
  return (
    <View className="border-t border-gray-200 py-3 dark:border-gray-800">
      <Text className="mb-2 text-lg text-gray-300">
        Sections (tap a chord to edit)
      </Text>

      <View className="rounded-sm bg-gray-50 p-2 dark:bg-gray-900">
        {sections.map((section, i) => {
          const mode = sectionMode(section);
          const isEndingsMode = mode === 'endings';
          // Same stepper, different meaning depending on mode: number of
          // repeats in repeat mode (1 = no visible repeat), number of
          // endings in endings mode (0 = none yet).
          const repeat = section.Repeat ?? 1;
          const endingCount = section.Endings?.length ?? 0;
          const stepperValue = isEndingsMode ? endingCount : repeat;
          const stepperMin = isEndingsMode ? 0 : 1;

          return (
            <View key={generateListKey(`section-preview-${section.Label}`, i)} className="mb-3">
              {/* Control row: delete (left) — mode switch + stepper (right) */}
              <View className="mb-1 flex-row items-center justify-between">
                <Pressable
                  onPress={() => onDeleteSection(i)}
                  disabled={sections.length <= 1}
                  className={`rounded-sm border border-red-300 px-2 py-1 dark:border-red-800 ${sections.length <= 1 ? 'opacity-40' : ''}`}
                >
                  <Text className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Delete
                  </Text>
                </Pressable>

                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Repeat
                  </Text>
                  <Switch
                    checked={isEndingsMode}
                    onChange={checked => onModeChange(i, checked ? 'endings' : 'repeat')}
                    accessibilityLabel={`Toggle endings mode for section ${section.Label ?? i + 1}`}
                  />
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Endings
                  </Text>

                  <View className="ml-2 flex-row items-center gap-2">
                    <Pressable
                      onPress={() => {
                        const next = Math.max(stepperMin, stepperValue - 1);
                        if (isEndingsMode)
                          onEndingCountChange(i, next);
                        else onRepeatChange(i, next);
                      }}
                      disabled={stepperValue <= stepperMin}
                      className={`size-6 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-700 ${stepperValue <= stepperMin ? 'opacity-40' : ''}`}
                    >
                      <Text className="text-sm font-semibold text-black dark:text-white">−</Text>
                    </Pressable>
                    <Text className="w-6 text-center text-sm font-semibold text-black dark:text-white">
                      {stepperValue}
                    </Text>
                    <Pressable
                      onPress={() => {
                        const next = stepperValue + 1;
                        if (isEndingsMode)
                          onEndingCountChange(i, next);
                        else onRepeatChange(i, next);
                      }}
                      className="size-6 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-700"
                    >
                      <Text className="text-sm font-semibold text-black dark:text-white">+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <SectionDisplay
                section={section}
                index={i}
                timeSignature={timeSignature}
                onBarPress={(segment, localIndex) => onSelectBar(i, segment, localIndex)}
              />
            </View>
          );
        })}
      </View>

      {/* Add section */}
      <Pressable
        onPress={onAddSection}
        className="mt-3 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-4 dark:border-gray-700"
      >
        <Text className="text-2xl text-gray-400 dark:text-gray-600">+</Text>
      </Pressable>
    </View>
  );
}

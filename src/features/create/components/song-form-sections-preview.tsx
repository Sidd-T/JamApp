import type { ActiveTarget, Section, SegmentRef } from '@/features/standards/standards';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown } from '@/components/ui/icons';
import { SectionDisplay } from '@/features/standards/components';

type SongFormSectionsPreviewProps = {
  sections: Section[];
  timeSignature?: string;
  activeTarget: ActiveTarget;
  onSelectBeat: (sectionIndex: number, segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
  onRepeatChange: (sectionIndex: number, repeat: number) => void;
  onModeChange: (sectionIndex: number, mode: 'repeat' | 'endings') => void;
  onEndingCountChange: (sectionIndex: number, count: number) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onAddSection: () => void;
};

type SectionRowProps = {
  section: Section;
  index: number;
  sectionsCount: number;
  timeSignature?: string;
  activeTarget: ActiveTarget;
  onSelectBeat: (sectionIndex: number, segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
  onRepeatChange: (sectionIndex: number, repeat: number) => void;
  onModeChange: (sectionIndex: number, mode: 'repeat' | 'endings') => void;
  onEndingCountChange: (sectionIndex: number, count: number) => void;
  onDeleteSection: (sectionIndex: number) => void;
};

function SectionRow({
  section,
  index,
  sectionsCount,
  timeSignature,
  activeTarget,
  onSelectBeat,
  onRepeatChange,
  onModeChange,
  onEndingCountChange,
  onDeleteSection,
}: SectionRowProps) {
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const isEndingsMode = section.Endings !== undefined;
  // Repeats: 0 = no repeat shown, 2+ = show barline. Same 0-based floor as endings.
  const repeatValue = section.Repeat ?? 0;
  const endingCount = section.Endings?.length ?? 0;
  const stepperValue = isEndingsMode ? endingCount : repeatValue;
  const isEditingThisSection = activeTarget?.sectionIndex === index;

  return (
    <View className="mb-3">
      <View className="mb-1 flex-row items-center justify-between">
        <Pressable
          onPress={() => onDeleteSection(index)}
          disabled={sectionsCount <= 1}
          className={`rounded-sm border border-red-300 px-2 py-1 dark:border-red-800 ${sectionsCount <= 1 ? 'opacity-40' : ''}`}
        >
          <Text className="text-xs font-semibold text-red-600 dark:text-red-400">
            Delete
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <View className="relative">
            <Pressable
              onPress={() => setModeMenuOpen(prev => !prev)}
              className="min-w-8 flex-row items-center justify-between rounded-xl border border-gray-300 px-3 py-2 dark:border-gray-700"
            >
              <Text className="text-sm text-black dark:text-white">
                {isEndingsMode ? 'Endings' : 'Repeats'}
              </Text>
              <CaretDown />
            </Pressable>

            {modeMenuOpen && (
              <View className="absolute bottom-full left-0 mb-2 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-neutral-800">
                <Pressable
                  onPress={() => {
                    onModeChange(index, 'repeat');
                    setModeMenuOpen(false);
                  }}
                  className={`px-4 py-3 ${!isEndingsMode ? 'bg-gray-100 dark:bg-neutral-700' : ''}`}
                >
                  <Text className="text-black dark:text-white">Repeats</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    onModeChange(index, 'endings');
                    setModeMenuOpen(false);
                  }}
                  className={`border-t border-gray-200 px-4 py-3 dark:border-gray-700 ${isEndingsMode ? 'bg-gray-100 dark:bg-neutral-700' : ''}`}
                >
                  <Text className="text-black dark:text-white">Endings</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View className="ml-2 flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                const next = Math.max(0, stepperValue - 1);
                if (isEndingsMode)
                  onEndingCountChange(index, next);
                else onRepeatChange(index, next);
              }}
              disabled={stepperValue <= 0}
              className={`size-6 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-700 ${stepperValue <= 0 ? 'opacity-40' : ''}`}
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
                  onEndingCountChange(index, next);
                else onRepeatChange(index, next);
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
        index={index}
        timeSignature={timeSignature}
        onBarPress={(segment, localIndex) => onSelectBeat(index, segment, localIndex, 0)}
        activeSegment={isEditingThisSection ? activeTarget!.segment : undefined}
        activeBarLocalIndex={isEditingThisSection ? activeTarget!.localIndex : undefined}
        activeBeatIndex={isEditingThisSection ? activeTarget!.beatIndex : undefined}
        onBeatPress={
          isEditingThisSection
            ? (segment, barLocalIndex, beatIndex) =>
                onSelectBeat(index, segment, barLocalIndex, beatIndex)
            : undefined
        }
      />
    </View>
  );
}

export function SongFormSectionsPreview({
  sections,
  timeSignature,
  activeTarget,
  onSelectBeat,
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
        {sections.map((section, i) => (
          <SectionRow
            key={`section-preview-${i}`}
            section={section}
            index={i}
            sectionsCount={sections.length}
            timeSignature={timeSignature}
            activeTarget={activeTarget}
            onSelectBeat={onSelectBeat}
            onRepeatChange={onRepeatChange}
            onModeChange={onModeChange}
            onEndingCountChange={onEndingCountChange}
            onDeleteSection={onDeleteSection}
          />
        ))}
      </View>

      <Pressable
        onPress={onAddSection}
        className="mt-3 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-4 dark:border-gray-700"
      >
        <Text className="text-2xl text-gray-400 dark:text-gray-600">+</Text>
      </Pressable>
    </View>
  );
}

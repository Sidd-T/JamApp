import type { Section, Song } from '@/features/standards/standards';
import * as React from 'react';
import { View } from 'react-native';
import { normalizeChordString } from '@/features/standards/standards';
import { SectionChordKeyboard } from './section-chord-keyboard';

type SongFormChordKeyboardOverlayProps = {
  activeSectionIndex: number | null;
  sections: Section[];
  activeBarIndex: number;
  setActiveBarIndex: React.Dispatch<React.SetStateAction<number>>;
  setActiveSectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Song, 'id'>>>;
};

export function SongFormChordKeyboardOverlay({
  activeSectionIndex,
  sections,
  activeBarIndex,
  setActiveBarIndex,
  setActiveSectionIndex,
  setFormData,
}: SongFormChordKeyboardOverlayProps) {
  if (activeSectionIndex === null)
    return null;

  const section = sections[activeSectionIndex];

  // Convert chord string into array of bars safely
  const chordString = section?.MainSegment?.Chords ?? '';
  const bars: string[] = normalizeChordString(chordString);

  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <SectionChordKeyboard
        bars={bars}
        barIndex={activeBarIndex}
        onBarChange={(barIndex, chordToken) => {
          const updatedBars = [...bars];

          // Ensure enough bars exist
          while (updatedBars.length <= barIndex) updatedBars.push('');

          updatedBars[barIndex] = chordToken;

          setFormData(prev => ({
            ...prev,
            Sections: prev.Sections.map((s, i) => {
              if (i !== activeSectionIndex)
                return s;

              return {
                ...s,
                MainSegment: {
                  Chords: updatedBars.join('|'),
                },
              };
            }),
          }));
        }}
        onPrevBar={() =>
          setActiveBarIndex(i => Math.max(0, i - 1))}
        onNextBar={() =>
          setActiveBarIndex(i => i + 1)}
        onClose={() =>
          setActiveSectionIndex(null)}
      />
    </View>
  );
}

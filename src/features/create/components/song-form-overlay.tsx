import type { ActiveTarget, Section, Song } from '@/features/standards/standards';
import * as React from 'react';
import { View } from 'react-native';
import { findFlatIndex, flattenSectionBars } from '@/features/standards/helpers/flatten-sections-bars';
import { SectionChordKeyboard } from './section-chord-keyboard';

type SongFormChordKeyboardOverlayProps = {
  activeTarget: ActiveTarget;
  sections: Section[];
  setActiveTarget: React.Dispatch<React.SetStateAction<ActiveTarget>>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Song, 'id'>>>;
};

export function SongFormChordKeyboardOverlay({
  activeTarget,
  sections,
  setActiveTarget,
  setFormData,
}: SongFormChordKeyboardOverlayProps) {
  if (activeTarget === null)
    return null;

  const { sectionIndex, segment, localIndex } = activeTarget;
  const section = sections[sectionIndex];
  if (!section)
    return null;

  // Flattened bar sequence for the whole section (main + all endings, in
  // order), so Prev/Next Bar can walk across segment boundaries.
  const flatBars = flattenSectionBars(section);
  const bars = flatBars.map(b => b.raw);
  const flatIndex = Math.max(0, findFlatIndex(flatBars, segment, localIndex));

  const appendBar = () => {
    const lastFlatBar = flatBars[flatBars.length - 1];

    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;

        // no endings => extend MainSegment
        if (!s.Endings?.length) {
          const chords = s.MainSegment?.Chords ?? '';

          return {
            ...s,
            MainSegment: {
              ...s.MainSegment,
              Chords: chords ? `${chords}|` : '|',
            },
          };
        }

        // extend whichever segment owns final flat bar
        if (lastFlatBar?.segment.segment === 'main') {
          const chords = s.MainSegment?.Chords ?? '';

          return {
            ...s,
            MainSegment: {
              ...s.MainSegment,
              Chords: chords ? `${chords}|` : '|',
            },
          };
        }

        const endings = [...(s.Endings ?? [])];
        const endingIndex = lastFlatBar.segment.endingIndex;

        const ending = endings[endingIndex];
        if (!ending)
          return s;

        endings[endingIndex] = {
          ...ending,
          Chords: ending.Chords ? `${ending.Chords}|` : '|',
        };

        return {
          ...s,
          Endings: endings,
        };
      }),
    }));

    if (!lastFlatBar) {
      setActiveTarget({
        sectionIndex,
        segment: { segment: 'main' },
        localIndex: 0,
      });

      return;
    }

    setActiveTarget({
      sectionIndex,
      segment: lastFlatBar.segment,
      localIndex: lastFlatBar.localIndex + 1,
    });
  };

  const writeBar = (targetFlatIndex: number, chordToken: string) => {
    const fb = flatBars[targetFlatIndex];
    if (!fb)
      return;

    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;

        if (fb.segment.segment === 'main') {
          const mainBars = (s.MainSegment?.Chords ?? '')
            .split('|')
            .map(b => b.trim())
            .filter(Boolean);
          while (mainBars.length <= fb.localIndex) mainBars.push('');
          mainBars[fb.localIndex] = chordToken;
          return {
            ...s,
            MainSegment: { ...s.MainSegment, Chords: mainBars.join('|') },
          };
        }

        // segment === 'ending'
        const endings = [...(s.Endings ?? [])];
        const ending = endings[fb.segment.endingIndex];
        if (!ending)
          return s;
        const endingBars = ending.Chords.split('|').map(b => b.trim()).filter(Boolean);
        while (endingBars.length <= fb.localIndex) endingBars.push('');
        endingBars[fb.localIndex] = chordToken;
        endings[fb.segment.endingIndex] = { ...ending, Chords: endingBars.join('|') };
        return { ...s, Endings: endings };
      }),
    }));
  };

  const moveTo = (targetFlatIndex: number) => {
    const fb = flatBars[targetFlatIndex];
    if (!fb)
      return;
    setActiveTarget({
      sectionIndex,
      segment: fb.segment,
      localIndex: fb.localIndex,
    });
  };

  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <SectionChordKeyboard
        bars={bars}
        barIndex={flatIndex}
        onBarChange={(barIndex, chordToken) => writeBar(barIndex, chordToken)}
        onPrevBar={() => moveTo(Math.max(0, flatIndex - 1))}
        onNextBar={() => {
          if (flatIndex < bars.length - 1) {
            moveTo(flatIndex + 1);
          }
          else {
            appendBar();
          }
        }}
        onClose={() => setActiveTarget(null)}
      />
    </View>
  );
}

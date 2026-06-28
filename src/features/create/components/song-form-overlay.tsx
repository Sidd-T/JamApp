import type { ActiveTarget, Section, Song } from '@/features/standards/standards';
import * as React from 'react';
import { View } from 'react-native';
import {
  beatsPerBar,
  collapseBeatsToBar,
  expandBarToBeats,
} from '@/features/standards/helpers/bar-beats';
import {
  findFlatBeatIndex,
  flattenSectionBeats,
} from '@/features/standards/helpers/flatten-section-beats';
import { SectionChordKeyboard } from './section-chord-keyboard';

type SongFormChordKeyboardOverlayProps = {
  activeTarget: ActiveTarget;
  sections: Section[];
  timeSignature?: string;
  setActiveTarget: React.Dispatch<React.SetStateAction<ActiveTarget>>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Song, 'id'>>>;
};

export function SongFormChordKeyboardOverlay({
  activeTarget,
  sections,
  timeSignature,
  setActiveTarget,
  setFormData,
}: SongFormChordKeyboardOverlayProps) {
  if (activeTarget === null)
    return null;

  const { sectionIndex, segment, localIndex, beatIndex } = activeTarget;
  const section = sections[sectionIndex];
  if (!section)
    return null;

  const n = beatsPerBar(timeSignature);
  const flatBeats = flattenSectionBeats(section, timeSignature);
  const beats = flatBeats.map(b => b.raw);
  const flatIndex = Math.max(
    0,
    findFlatBeatIndex(flatBeats, segment, localIndex, beatIndex),
  );

  const currentFlat = flatBeats[flatIndex];
  const barLabel = currentFlat
    ? `Bar ${currentFlat.barLocalIndex + 1}, Beat ${currentFlat.beatIndex + 1}`
    : 'Beat';

  // Appends one blank bar (N empty beats) to whichever segment owns the
  // last flat beat, then moves the cursor to its first beat.
  const appendBar = () => {
    const lastFlat = flatBeats[flatBeats.length - 1];
    const targetSegment = lastFlat?.segment ?? { segment: 'main' as const };
    const blankBar = collapseBeatsToBar(Array.from({ length: n }, () => ''));

    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;

        if (targetSegment.segment === 'main') {
          const chords = s.MainSegment?.Chords ?? '';
          return {
            ...s,
            MainSegment: {
              ...s.MainSegment,
              Chords: chords ? `${chords}|${blankBar}` : blankBar,
            },
          };
        }

        const endings = [...(s.Endings ?? [])];
        const ending = endings[targetSegment.endingIndex];
        if (!ending)
          return s;
        endings[targetSegment.endingIndex] = {
          ...ending,
          Chords: ending.Chords ? `${ending.Chords}|${blankBar}` : blankBar,
        };
        return { ...s, Endings: endings };
      }),
    }));

    setActiveTarget({
      sectionIndex,
      segment: targetSegment,
      localIndex: lastFlat ? lastFlat.barLocalIndex + 1 : 0,
      beatIndex: 0,
    });
  };

  const writeBeat = (targetFlatIndex: number, text: string) => {
    const fb = flatBeats[targetFlatIndex];
    if (!fb)
      return;

    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;

        const updateBars = (chordString: string): string => {
          const bars = chordString
            .split('|')
            .map(b => b.trim())
            .filter(Boolean);
          while (bars.length <= fb.barLocalIndex) bars.push('');
          const beatSlots = expandBarToBeats(bars[fb.barLocalIndex], n);
          beatSlots[fb.beatIndex] = text;
          bars[fb.barLocalIndex] = collapseBeatsToBar(beatSlots);
          return bars.join('|');
        };

        if (fb.segment.segment === 'main') {
          return {
            ...s,
            MainSegment: {
              ...s.MainSegment,
              Chords: updateBars(s.MainSegment?.Chords ?? ''),
            },
          };
        }

        const endings = [...(s.Endings ?? [])];
        const ending = endings[fb.segment.endingIndex];
        if (!ending)
          return s;
        endings[fb.segment.endingIndex] = {
          ...ending,
          Chords: updateBars(ending.Chords),
        };
        return { ...s, Endings: endings };
      }),
    }));
  };

  const moveTo = (targetFlatIndex: number) => {
    const fb = flatBeats[targetFlatIndex];
    if (!fb)
      return;
    setActiveTarget({
      sectionIndex,
      segment: fb.segment,
      localIndex: fb.barLocalIndex,
      beatIndex: fb.beatIndex,
    });
  };

  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <SectionChordKeyboard
        beats={beats}
        beatIndex={flatIndex}
        barLabel={barLabel}
        onBeatChange={(idx, text) => writeBeat(idx, text)}
        onPrevBeat={() => moveTo(Math.max(0, flatIndex - 1))}
        onNextBeat={() => {
          if (flatIndex < beats.length - 1) {
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

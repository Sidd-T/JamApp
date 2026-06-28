import type { SegmentRef } from '@/features/standards/standards';
import { beatsPerBar, expandBarToBeats } from './bar-beats';

export type FlatBeat = {
  flatIndex: number;
  segment: SegmentRef;
  barLocalIndex: number;
  beatIndex: number;
  raw: string;
};

type SectionLike = {
  MainSegment?: { Chords?: string };
  Endings?: { Chords: string }[];
};

function splitBars(chordString: string | undefined): string[] {
  if (chordString == null)
    return [];
  const bars = chordString.split('|').map(b => b.trim());
  if (bars.length > 1 && bars.at(-1) === '')
    return bars;
  return bars.filter(Boolean);
}

export function flattenSectionBeats(
  section: SectionLike,
  timeSignature: string | undefined,
): FlatBeat[] {
  const n = beatsPerBar(timeSignature);
  const result: FlatBeat[] = [];
  let flatIndex = 0;

  const pushBars = (bars: string[], segment: SegmentRef) => {
    // Empty segment still exposes one editable bar so it can be tapped.
    const list = bars.length === 0 ? [''] : bars;
    list.forEach((barRaw, barLocalIndex) => {
      expandBarToBeats(barRaw, n).forEach((raw, beatIndex) => {
        result.push({ flatIndex, segment, barLocalIndex, beatIndex, raw });
        flatIndex++;
      });
    });
  };

  pushBars(splitBars(section.MainSegment?.Chords), { segment: 'main' });
  (section.Endings ?? []).forEach((ending, endingIndex) => {
    pushBars(splitBars(ending.Chords), { segment: 'ending', endingIndex });
  });

  return result;
}

export function findFlatBeatIndex(
  flatBeats: FlatBeat[],
  segment: SegmentRef,
  barLocalIndex: number,
  beatIndex: number,
): number {
  return flatBeats.findIndex(
    b =>
      b.barLocalIndex === barLocalIndex
      && b.beatIndex === beatIndex
      && b.segment.segment === segment.segment
      && (b.segment.segment !== 'ending'
        || (segment.segment === 'ending'
          && b.segment.endingIndex === segment.endingIndex)),
  );
}

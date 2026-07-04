import type { Section, SegmentRef } from '../standards';
import { View } from 'react-native';
import { ChordDisplay } from './chord-display';
import { EmptyEndingSegment } from './empty-segments';
import { countBars, isEmptyChords } from './section-display-utils';
import { VoltaBracket } from './volta-bracket';

type EndingsCommonProps = {
  section: Section;
  sectionIndex: number;
  timeSignature?: string;
  editMode: boolean;
  activeSegment?: SegmentRef;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBarPress?: (segment: SegmentRef, localIndex: number) => void;
  onBeatPress?: (segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
  endingFits: boolean[];
};

function endingActiveBar(
  endingIndex: number,
  activeSegment?: SegmentRef,
  activeBarLocalIndex?: number,
): number | undefined {
  if (
    activeSegment?.segment !== 'ending'
    || (activeSegment as any).endingIndex !== endingIndex
    || activeBarLocalIndex == null
  ) {
    return undefined;
  }
  return activeBarLocalIndex;
}

// ── Single ending ────────────────────────────────────────────────────────────
type EndingProps = {
  ending: { Chords: string };
  endingIndex: number;
  endingCount: number;
  sectionIndex: number;
  props: EndingsCommonProps;
  showOpeningLine: boolean;
};

function Ending({ ending, endingIndex, endingCount, sectionIndex, props, showOpeningLine }: EndingProps) {
  const {
    timeSignature,
    editMode,
    activeSegment,
    activeBarLocalIndex,
    activeBeatIndex,
    onBarPress,
    onBeatPress,
  } = props;

  const endingRef: SegmentRef = { segment: 'ending', endingIndex };
  const isLastEnding = endingIndex === endingCount - 1;
  const isThisEndingActive
    = activeSegment?.segment === 'ending'
      && (activeSegment as any).endingIndex === endingIndex;
  const barCount = isEmptyChords(ending.Chords) ? 1 : countBars(ending.Chords);

  // Content passed to ChordDisplay as emptyContent when there are no chords,
  // so ChordDisplay always owns the closing bar line.
  const emptyContent = (
    <EmptyEndingSegment
      endingRef={endingRef}
      timeSignature={timeSignature}
      editMode={editMode}
      isThisEndingActive={isThisEndingActive}
      activeBeatIndex={activeBeatIndex}
      onBarPress={onBarPress}
      onBeatPress={onBeatPress}
    />
  );

  return (
    <View
      key={`section-${sectionIndex}-ending-${endingIndex}-of-${endingCount}`}
      style={{ flex: barCount }}
    >
      <VoltaBracket number={endingIndex + 1} open={isLastEnding} />
      <ChordDisplay
        chordString={ending.Chords}
        timeSignature={timeSignature}
        repeat={undefined} // no repeat for endings
        editMode={editMode}
        activeBarLocalIndex={endingActiveBar(endingIndex, activeSegment, activeBarLocalIndex)}
        activeBeatIndex={activeBeatIndex}
        emptyContent={emptyContent}
        showOpeningLine={showOpeningLine}
        onBeatPress={
          onBeatPress
            ? (localBar, bi) => onBeatPress(endingRef, localBar, bi)
            : undefined
        }
        onBarPress={
          onBarPress
            ? localIndex => onBarPress(endingRef, localIndex)
            : undefined
        }
      />
    </View>
  );
}

// ── InlineEndingsRow ─────────────────────────────────────────────────────────

export function InlineEndingsRow(props: EndingsCommonProps) {
  const { section, sectionIndex, endingFits } = props;
  const endingCount = section.Endings!.length;

  return (
    <>
      {section.Endings!.map((ending, endingIndex) => {
        if (!endingFits[endingIndex])
          return null;
        return (
          <Ending
            key={`section-${sectionIndex}-ending-${endingIndex}-of-${endingCount}`}
            ending={ending}
            endingIndex={endingIndex}
            endingCount={endingCount}
            sectionIndex={sectionIndex}
            props={props}
            showOpeningLine={true}
          />
        );
      })}
    </>
  );
}

// ── OverflowEndings ──────────────────────────────────────────────────────────

export function OverflowEndings(props: EndingsCommonProps) {
  const { section, sectionIndex, endingFits } = props;
  const endingCount = section.Endings!.length;

  return (
    <View>
      {section.Endings!.map((ending, endingIndex) => {
        if (endingFits[endingIndex])
          return null;
        return (
          <Ending
            key={`section-${sectionIndex}-ending-${endingIndex}-of-${endingCount}`}
            ending={ending}
            endingIndex={endingIndex}
            endingCount={endingCount}
            sectionIndex={sectionIndex}
            props={props}
            showOpeningLine={true}
          />
        );
      })}
    </View>
  );
}

import type { Section, SegmentRef } from '../standards';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ChordDisplay } from './chord-display';
import { EmptyEndingSegment } from './empty-segments';
import { countBars, isEmptyChords } from './section-display-utils';

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

function renderEndingContent(
  ending: { Chords: string },
  endingIndex: number,
  isLastEnding: boolean,
  props: EndingsCommonProps,
) {
  const {
    section,
    timeSignature,
    editMode,
    activeSegment,
    activeBarLocalIndex,
    activeBeatIndex,
    onBarPress,
    onBeatPress,
  } = props;

  const endingRef: SegmentRef = { segment: 'ending', endingIndex };
  const isThisEndingActive
    = activeSegment?.segment === 'ending'
      && (activeSegment as any).endingIndex === endingIndex;

  if (section && isEmptyChords(ending.Chords)) {
    return (
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
  }

  return (
    <ChordDisplay
      chordString={ending.Chords}
      showTimeSignature={false}
      timeSignature={timeSignature}
      repeat={!isLastEnding ? 2 : undefined}
      editMode={editMode}
      activeBarLocalIndex={endingActiveBar(endingIndex, activeSegment, activeBarLocalIndex)}
      activeBeatIndex={activeBeatIndex}
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
  );
}

// Renders the ending boxes that fit on the last row of the main segment.
// The main segment bar(s) for that row are rendered by the parent — this
// component only renders the ending boxes themselves.
export function InlineEndingsRow(props: EndingsCommonProps) {
  const { section, sectionIndex, endingFits } = props;

  return (
    <>
      {section.Endings!.map((ending, endingIndex) => {
        if (!endingFits[endingIndex])
          return null;
        const isLastEnding = endingIndex === section.Endings!.length - 1;
        const barCount = isEmptyChords(ending.Chords) ? 1 : countBars(ending.Chords);

        return (
          <View
            key={`section-${sectionIndex}-ending-${endingIndex}`}
            style={{ flex: barCount }}
          >
            <View
              className={`mb-1 border-t border-l border-black dark:border-white${!isLastEnding ? 'border-r' : ''}`}
            >
              <Text className="text-xs font-bold text-black dark:text-white">
                {endingIndex + 1}
                .
              </Text>
            </View>
            {renderEndingContent(ending, endingIndex, isLastEnding, props)}
          </View>
        );
      })}
    </>
  );
}

// Renders endings that didn't fit inline, each on their own row below.
export function OverflowEndings(props: EndingsCommonProps) {
  const { section, sectionIndex, endingFits } = props;

  return (
    <View>
      {section.Endings!.map((ending, endingIndex) => {
        if (endingFits[endingIndex])
          return null;
        const isLastEnding = endingIndex === section.Endings!.length - 1;

        return (
          <View
            key={`section-${sectionIndex}-ending-${endingIndex}`}
          >
            <View
              className={`mb-1 flex-row items-stretch border-t border-black dark:border-white${!isLastEnding ? 'border-r' : ''}`}
            >
              <View className="justify-center border-l border-black px-2 pt-1 dark:border-white">
                <Text className="text-xs font-bold text-black dark:text-white">
                  {endingIndex + 1}
                  .
                </Text>
              </View>
            </View>
            {renderEndingContent(ending, endingIndex, isLastEnding, props)}
          </View>
        );
      })}
    </View>
  );
}

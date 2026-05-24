import type { Section } from '../standards';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { generateListKey } from '@/lib/utils';
import { ChordDisplay } from './chord-display';

type SectionDisplayProps = {
  section: Section;
  index: number;
  timeSignature?: string;
};

const MAX_BARS_PER_ROW = 4;

function countBars(chordString: string): number {
  return chordString.split('|').map(b => b.trim()).filter(Boolean).length;
}

export function SectionDisplay({ section, index, timeSignature }: SectionDisplayProps) {
  const label = section.Label || `${index + 1}`;
  const hasEndings = section.Endings && section.Endings.length > 0;
  const mainChords = section.MainSegment?.Chords;

  const mainBarCount = mainChords ? countBars(mainChords) : 0;

  const lastRowBarCount = mainBarCount % MAX_BARS_PER_ROW === 0 && mainBarCount > 0
    ? MAX_BARS_PER_ROW
    : mainBarCount % MAX_BARS_PER_ROW;

  const remainingSlots = MAX_BARS_PER_ROW - lastRowBarCount;

  const endingFits: boolean[] = [];
  if (hasEndings && mainChords) {
    let slots = remainingSlots;
    for (const ending of section.Endings!) {
      const bars = countBars(ending.Chords);
      if (bars <= slots) {
        endingFits.push(true);
        slots -= bars;
      }
      else {
        endingFits.push(false);
        // remaining endings also don't fit
        for (let j = endingFits.length; j < section.Endings!.length; j++) {
          endingFits.push(false);
        }
        break;
      }
    }
  }

  const anyEndingInline = endingFits.some(Boolean);

  const allMainBars = mainChords
    ? mainChords.split('|').map(b => b.trim()).filter(Boolean)
    : [];

  // Split main bars into leading rows and the last row
  const leadingBars = allMainBars.slice(0, mainBarCount - lastRowBarCount);
  const lastRowBars = allMainBars.slice(mainBarCount - lastRowBarCount);
  const leadingChords = leadingBars.join('|');
  const lastRowChords = lastRowBars.join('|');

  // showTimeSignature only on the very first rendered chord row
  const timeSigOnLeading = index === 0 && leadingChords.length > 0;
  const timeSigOnLastRow = index === 0 && leadingChords.length === 0;

  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="size-7 items-center justify-center border-2 border-gray-900 dark:border-gray-100">
          <Text className="text-sm font-black text-gray-900 dark:text-white">
            {label}
          </Text>
        </View>
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </View>

      {mainChords && (
        <>
          {leadingChords.length > 0 && (
            <ChordDisplay
              chordString={leadingChords}
              showTimeSignature={timeSigOnLeading}
              timeSignature={timeSignature}
            />
          )}

          {anyEndingInline
            ? (
                <View className="flex-row items-stretch">
                  {/* Last row of main segment */}
                  <View style={{ flex: lastRowBarCount }}>
                    {/* Invisible spacer matching volta bracket height */}
                    <View className="mb-1">
                      <Text className="text-xs font-bold text-transparent"></Text>
                    </View>
                    <ChordDisplay
                      chordString={lastRowChords}
                      showTimeSignature={timeSigOnLastRow}
                      timeSignature={timeSignature}
                    />
                  </View>

                  {/* Inline endings */}
                  {section.Endings!.map((ending, endingIndex) => {
                    if (!endingFits[endingIndex])
                      return null;
                    const isLastEnding = endingIndex === section.Endings!.length - 1;
                    const barCount = countBars(ending.Chords);
                    return (
                      <View key={generateListKey(`section-${index}-ending-${ending.Chords}`, endingIndex)} style={{ flex: barCount }}>
                        <View className={`mb-1 border-t border-l border-black dark:border-white${!isLastEnding ? 'border-r' : ''}`}>
                          <Text className="text-xs font-bold text-black dark:text-white">
                            {endingIndex + 1}
                            .
                          </Text>
                        </View>
                        <ChordDisplay
                          chordString={ending.Chords}
                          showTimeSignature={false}
                          timeSignature={timeSignature}
                          repeat={!isLastEnding ? 2 : undefined}
                        />
                      </View>
                    );
                  })}
                </View>
              )
            : (
                <ChordDisplay
                  chordString={lastRowChords}
                  showTimeSignature={timeSigOnLastRow}
                  timeSignature={timeSignature}
                  repeat={!hasEndings ? section.Repeat : undefined}
                />
              )}
        </>
      )}

      {/* Endings that didn't fit inline */}
      {hasEndings && endingFits.some((fits, _i) => !fits) && (
        <View>
          {section.Endings!.map((ending, endingIndex) => {
            if (endingFits[endingIndex])
              return null;
            const isLastEnding = endingIndex === section.Endings!.length - 1;
            return (
              <View key={generateListKey(`section-${index}-ending-${ending.Chords}`, endingIndex)}>
                <View className={`mb-1 flex-row items-stretch border-t border-black dark:border-white ${!isLastEnding ? 'border-r' : ''}`}>
                  <View className="justify-center border-l border-black px-2 pt-1 dark:border-white">
                    <Text className="text-xs font-bold text-black dark:text-white">
                      {endingIndex + 1}
                      .
                    </Text>
                  </View>
                </View>
                <ChordDisplay
                  chordString={ending.Chords}
                  showTimeSignature={false}
                  timeSignature={timeSignature}
                  repeat={!isLastEnding ? 2 : undefined}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

import { View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar } from '@/features/standards/helpers/bar-beats';
import { BarCell } from './bar-cell';

type ChordDisplayProps = {
  chordString: string;
  label?: string;
  showTimeSignature?: boolean;
  timeSignature?: string;
  repeat?: number;
  /**
   * Offset applied when this ChordDisplay renders a slice of a larger bar
   * array. The caller passes the section-level activeBarLocalIndex and this
   * component subtracts startIndex before comparing, so the caller never has
   * to do the arithmetic manually.
   */
  startIndex?: number;
  /** Normal mode: whole bar was tapped. */
  onBarPress?: (localIndex: number) => void;
  /** Edit mode: render fixed beat cells with highlight. */
  editMode?: boolean;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBeatPress?: (barLocalIndex: number, beatIndex: number) => void;
};

function normalizeBar(bar: string) {
  return bar.split(',').map(s => s.trim()).filter(Boolean).join('|');
}

export function ChordDisplay({
  chordString,
  label,
  showTimeSignature,
  timeSignature = '4/4',
  repeat,
  startIndex = 0,
  onBarPress,
  editMode = false,
  activeBarLocalIndex,
  activeBeatIndex,
  onBeatPress,
}: ChordDisplayProps) {
  // Translate the section-level active index into a local index for this slice.
  const localActiveBarIndex = activeBarLocalIndex != null
    ? activeBarLocalIndex - startIndex
    : undefined;
  if (!chordString)
    return null;

  const rawBars = chordString.split('|').map(b => b.trim()).filter(Boolean);
  const n = beatsPerBar(timeSignature);

  const bars = rawBars.map((bar, i) => {
    const normalized = normalizeBar(bar);
    const prevNormalized = i > 0 ? normalizeBar(rawBars[i - 1]) : null;
    return {
      raw: bar,
      isRepeat: !editMode && prevNormalized !== null && normalized === prevNormalized,
    };
  });

  const rows: typeof bars[] = [];
  for (let i = 0; i < bars.length; i += 4) {
    rows.push(bars.slice(i, i + 4));
  }

  return (
    <View className="mb-1">
      {label && (
        <Text className="mb-1 text-xs font-semibold tracking-widest text-black uppercase dark:text-white">
          {label}
        </Text>
      )}

      {rows.map((rowBars, rowIndex) => {
        const isFirstRow = rowIndex === 0;
        const isLastRow = rowIndex === rows.length - 1;
        const rowStartIndex = rowIndex * 4;
        // Include bar count in the key so that when a new row is created (or
        // an existing row loses a bar), React Native remounts the View rather
        // than reusing a stale measured layout from the previous render.
        const rowKey = `row-${rowIndex}-${rowStartIndex}-${rowBars.length}-${editMode ? 'editing' : 'displaying'}`;

        return (
          <View key={rowKey} className="relative mb-2 flex-row">
            {/* Opening bar line — absolutely positioned so it never affects row height */}
            <View className="absolute top-0 bottom-0 left-0 w-px bg-black dark:bg-white" />

            {/* Time signature sits in flow on the first row only, pushing bars right */}
            {isFirstRow && showTimeSignature && (
              <View className="items-center justify-center px-1">
                <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
                  {timeSignature.split('/')[0]}
                </Text>
                <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
                  {timeSignature.split('/')[1]}
                </Text>
              </View>
            )}

            {/* On rows without a time signature, add padding so bars start past the bar line */}
            {!isFirstRow || !showTimeSignature
              ? (
                  <View className="w-px" />
                )
              : null}

            {rowBars.map((bar, barIndex) => {
              const absoluteBarIndex = rowStartIndex + barIndex;
              const isLastBar = isLastRow && barIndex === rowBars.length - 1;

              return (
                <BarCell
                  key={`bar-${barIndex}`}
                  bar={bar}
                  absoluteBarIndex={absoluteBarIndex}
                  rowBarCount={rowBars.length}
                  isLastBar={isLastBar}
                  repeat={isLastBar ? repeat : undefined}
                  editMode={editMode}
                  n={n}
                  isActiveBar={localActiveBarIndex === absoluteBarIndex}
                  activeBeatIndex={activeBeatIndex}
                  onBeatPress={onBeatPress
                    ? (localBar, bi) => onBeatPress(startIndex + localBar, bi)
                    : undefined}
                  onBarPress={onBarPress
                    ? localIndex => onBarPress(startIndex + localIndex)
                    : undefined}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

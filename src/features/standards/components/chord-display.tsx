import { View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar } from '@/features/standards/helpers/bar-beats';
import { BarCell } from './bar-cell';
import { BarLine } from './bar-line';
import { BarLineEnd } from './bar-line-end';
import { OpeningBarLine } from './opening-bar-line';

type ChordDisplayProps = {
  chordString: string;
  label?: string;
  showTimeSignature?: boolean;
  timeSignature?: string;
  repeat?: number;
  /**
   * Offset applied when this ChordDisplay renders a slice of a larger bar
   * array. The caller passes the section-level activeBarLocalIndex and this
   * component subtracts startIndex before comparing.
   */
  startIndex?: number;
  /**
   * Rendered instead of bars when chordString is empty. ChordDisplay wraps it
   * with the opening and closing bar lines so no caller ever draws bar lines.
   */
  emptyContent?: React.ReactNode;
  /** Normal mode: whole bar was tapped. */
  onBarPress?: (localIndex: number) => void;
  /** Edit mode: render fixed beat cells with highlight. */
  editMode?: boolean;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBeatPress?: (barLocalIndex: number, beatIndex: number) => void;
  /** Controls whether the first row renders its leading opening bar line. */
  showOpeningLine?: boolean;
  /** Controls whether the segment renders a trailing closing bar line on the last bar. */
  showClosingLine?: boolean;
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
  emptyContent,
  onBarPress,
  editMode = false,
  activeBarLocalIndex,
  activeBeatIndex,
  onBeatPress,
  showOpeningLine = true,
  showClosingLine = true,
}: ChordDisplayProps) {
  const closing = repeat != null
    ? <BarLineEnd repeat={repeat} />
    : <BarLine />;

  if (!chordString) {
    if (!emptyContent)
      return null;
    return (
      <View className="mb-2 flex-row">
        {showOpeningLine && (
          <OpeningBarLine timeSignature={showTimeSignature ? timeSignature : undefined} />
        )}
        {emptyContent}
        {showClosingLine ? closing : null}
      </View>
    );
  }

  const localActiveBarIndex = activeBarLocalIndex != null
    ? activeBarLocalIndex - startIndex
    : undefined;

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
        const rowKey = `row-${rowStartIndex}-${rowBars.length}-${editMode ? 'edit' : 'view'}`;
        const shouldRenderOpeningLine = rowIndex > 0 || showOpeningLine;
        const rowTimeSignature = shouldRenderOpeningLine && isFirstRow && showTimeSignature
          ? timeSignature
          : undefined;

        return (
          <View key={rowKey} className="mb-2 flex-row">
            {shouldRenderOpeningLine && <OpeningBarLine timeSignature={rowTimeSignature} />}
            {rowBars.map((bar, barIndex) => {
              const absoluteBarIndex = rowStartIndex + barIndex;
              const isLastBar = isLastRow && barIndex === rowBars.length - 1;
              const showTrailingLine = !isLastBar || showClosingLine;

              return (
                <View key={`bar-${barIndex}`} style={{ flex: 1 / rowBars.length }} className="flex-row">
                  <BarCell
                    bar={bar}
                    absoluteBarIndex={absoluteBarIndex}
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
                  {showTrailingLine && (
                    isLastBar && repeat != null
                      ? <BarLineEnd repeat={repeat} />
                      : <BarLine />
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

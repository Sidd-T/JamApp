import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { generateListKey } from '@/lib/utils';
import { ChordSymbol, OptionalChordSymbol } from './chord-symbol';

type ParsedSlot = {
  chord: string;
  optional?: string;
  beats: number;
};

type ChordDisplayProps = {
  chordString: string;
  label?: string;
  showTimeSignature?: boolean;
  timeSignature?: string;
  repeat?: number;
  /**
   * Called when a bar is tapped. `localIndex` is the bar's position
   * within `chordString` as a whole (i.e. across all internal rows of 4,
   * not reset per row) — matching what normalizeChordString(chordString)
   * would produce.
   */
  onBarPress?: (localIndex: number) => void;
};

function parseBar(barStr: string): ParsedSlot[] {
  const raw = barStr.trim();
  if (!raw)
    return [];
  const parts = raw.split(',');

  const result: ParsedSlot[] = [];
  let i = 0;

  while (i < parts.length) {
    const token = parts[i];
    let beats = 1;

    while (i + beats < parts.length && parts[i + beats] === '') {
      beats++;
    }

    if (token !== '') {
      const match = token.match(/^([^(]*)\(([^)]+)\)(.*)$/);

      if (match) {
        const chord = (match[1] + match[3]).trim();
        const optional = match[2].trim();
        result.push({ chord, optional, beats });
      }
      else {
        result.push({ chord: token, beats });
      }
    }

    i += beats;
  }

  return result;
}

function normalizeBar(bar: string) {
  return bar
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .join('|');
}

export function ChordDisplay({
  chordString,
  label,
  showTimeSignature,
  timeSignature = '4/4',
  repeat,
  onBarPress,
}: ChordDisplayProps) {
  if (!chordString)
    return null;

  const rawBars = chordString.split('|').map(b => b.trim()).filter(Boolean);

  // Detect repeated bars
  const bars = rawBars.map((bar, i) => {
    const normalized = normalizeBar(bar);
    const prevNormalized
      = i > 0 ? normalizeBar(rawBars[i - 1]) : null;

    return {
      raw: bar,
      isRepeat: prevNormalized !== null && normalized === prevNormalized,
    };
  });

  // Group into rows of 4
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
        const isLastRow = rowIndex === rows.length - 1;
        const isFirstRow = rowIndex === 0;
        // Offset so bar taps report position within the *whole*
        // chordString, not reset per row of 4.
        const rowStartIndex = rowIndex * 4;

        return (
          <View
            key={generateListKey(
              `row-${rowBars.map(b => b.raw).join('-')}`,
              rowIndex,
            )}
            className="mb-0 flex-row items-stretch"
          >
            {/* Opening bar line / time signature */}
            {isFirstRow && showTimeSignature
              ? (
                  <View className="mr-0 flex-row items-center">
                    <View className="items-center justify-center px-1">
                      <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
                        {timeSignature.split('/')[0]}
                      </Text>
                      <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
                        {timeSignature.split('/')[1]}
                      </Text>
                    </View>
                    <View className="mb-2 w-px bg-black dark:bg-white" />
                  </View>
                )
              : (
                  <View className="mb-2 w-px bg-black dark:bg-white" />
                )}

            {rowBars.map((bar, barIndex) => {
              const isLastBar
                = isLastRow && barIndex === rowBars.length - 1;

              const slots = bar.isRepeat
                ? [{ chord: '%' }]
                : parseBar(bar.raw);

              const displaySlots = slots;
              const absoluteBarIndex = rowStartIndex + barIndex;

              const barContent = (
                <View className="min-h-10 flex-1 flex-row items-center px-1 py-2">
                  {displaySlots.map((slot: any, si) => (
                    <View
                      key={generateListKey(
                        `slot-${slot.chord}-${slot.optional || ''}`,
                        si,
                      )}
                      style={{ flex: slot.beats || 1 }}
                      className={`${bar.isRepeat ? 'items-center font-bold' : 'items-start'} justify-center`}
                    >
                      <View className="relative">
                        {slot.optional && (
                          <View className="absolute bottom-full left-0">
                            <OptionalChordSymbol raw={slot.optional} />
                          </View>
                        )}
                        <ChordSymbol raw={slot.chord} />
                      </View>
                    </View>
                  ))}
                </View>
              );

              return (
                <View
                  key={generateListKey(`bar-${bar.raw}`, barIndex)}
                  style={{ flex: 1 / rowBars.length }}
                  className="mb-2 flex-row"
                >
                  {onBarPress
                    ? (
                        <Pressable
                          style={{ flex: 1 }}
                          onPress={() => onBarPress(absoluteBarIndex)}
                        >
                          {barContent}
                        </Pressable>
                      )
                    : (
                        barContent
                      )}

                  {/* Repeat / bar separator */}
                  {isLastBar && repeat
                    ? (
                        <>
                          <View className="flex-row items-center">
                            <View className="mr-0.5 w-1.5 items-center justify-center">
                              <Text className="text-2xl/5 font-bold text-black dark:text-white">
                                :
                              </Text>
                            </View>
                            <View className="w-px bg-black dark:bg-white" />
                            <View className="mx-0.5 w-px bg-black dark:bg-white" />
                            {repeat > 2 && (
                              <Text className="ml-0.5 text-xs font-bold text-black dark:text-white">
                                ×
                                {repeat}
                              </Text>
                            )}
                          </View>
                          <View className="mr-1 w-px bg-black dark:bg-white" />
                          <View className="w-px bg-black dark:bg-white" />
                        </>
                      )
                    : (
                        <View className="w-px bg-black dark:bg-white" />
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

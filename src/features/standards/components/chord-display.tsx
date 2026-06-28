import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar, expandBarToBeats } from '@/features/standards/helpers/bar-beats';
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
  /** Normal mode: whole bar was tapped. */
  onBarPress?: (localIndex: number) => void;
  /** Edit mode: render fixed beat cells with highlight. */
  editMode?: boolean;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBeatPress?: (barLocalIndex: number, beatIndex: number) => void;
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
  editMode = false,
  activeBarLocalIndex,
  activeBeatIndex,
  onBeatPress,
}: ChordDisplayProps) {
  if (!chordString)
    return null;

  const rawBars = chordString.split('|').map(b => b.trim()).filter(Boolean);
  const n = beatsPerBar(timeSignature);

  const bars = rawBars.map((bar, i) => {
    const normalized = normalizeBar(bar);
    const prevNormalized = i > 0 ? normalizeBar(rawBars[i - 1]) : null;
    return {
      raw: bar,
      // Repeat symbol is suppressed in edit mode so every beat is visible.
      isRepeat: !editMode && prevNormalized !== null && normalized === prevNormalized,
    };
  });

  const rows: typeof bars[] = [];
  for (let i = 0; i < bars.length; i += 4) {
    rows.push(bars.slice(i, i + 4));
  }

  const renderRepeatBarLine = (
    <View className="flex-row items-center">
      <View className="mr-0.5 w-1.5 items-center justify-center">
        <Text className="text-2xl/5 font-bold text-black dark:text-white">:</Text>
      </View>
      <View className="w-px bg-black dark:bg-white" />
      <View className="mx-0.5 w-px bg-black dark:bg-white" />
    </View>
  );

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
        const rowStartIndex = rowIndex * 4;

        return (
          <View
            key={`row-${rowIndex}`}
            className="mb-0 flex-row items-stretch"
          >
            {/* Opening bar line / time signature */}
            {isFirstRow && showTimeSignature
              ? (
                  <View className="mr-0 flex-row items-center">
                    <View className="mb-2 h-[80%] w-px bg-black dark:bg-white" />
                    <View className="mb-[40%] items-center justify-center px-1">
                      <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
                        {timeSignature.split('/')[0]}
                      </Text>
                      <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
                        {timeSignature.split('/')[1]}
                      </Text>
                    </View>

                  </View>
                )
              : (
                  <View className="mb-2 h-[80%] w-px bg-black dark:bg-white" />
                )}

            {rowBars.map((bar, barIndex) => {
              const isLastBar = isLastRow && barIndex === rowBars.length - 1;
              const absoluteBarIndex = rowStartIndex + barIndex;
              const isActiveBar = activeBarLocalIndex === absoluteBarIndex;

              // ── Edit mode: fixed N beat cells ──────────────────────
              if (editMode && onBeatPress) {
                const beatSlots = expandBarToBeats(bar.raw, n);

                return (
                  <View
                    key={`bar-${barIndex}`}
                    style={{ flex: 1 / rowBars.length }}
                    className="mb-2 flex-row"
                  >
                    <View style={{ flex: 1 }} className="flex-row">
                      {beatSlots.map((beatText, bi) => {
                        const isActiveBeat = isActiveBar && activeBeatIndex === bi;
                        return (
                          <Pressable
                            key={bi}
                            style={{ flex: 1 }}
                            onPress={() => onBeatPress(absoluteBarIndex, bi)}
                          >
                            <View
                              className={[
                                'min-h-10 flex-1 items-center justify-center py-2',
                                bi < beatSlots.length - 1
                                  ? 'border-r border-neutral-200 dark:border-neutral-800'
                                  : '',
                                isActiveBeat
                                  ? 'bg-primary-100 dark:bg-primary-900'
                                  : '',
                              ].filter(Boolean).join(' ')}
                            >
                              {beatText
                                ? (
                                    <ChordSymbol raw={beatText} />
                                  )
                                : (
                                    <Text className="text-sm text-neutral-300 dark:text-neutral-700">
                                      —
                                    </Text>
                                  )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>

                    {isLastBar && repeat
                      ? (
                          <>
                            {renderRepeatBarLine}
                            {repeat > 1 && (
                              <Text className="ml-0.5 text-xs font-bold text-black dark:text-white">
                                ×
                                {repeat}
                              </Text>
                            )}
                            <View className="mr-1 w-px bg-black dark:bg-white" />
                            <View className="w-px bg-black dark:bg-white" />
                          </>
                        )
                      : (
                          <View className="w-px bg-black dark:bg-white" />
                        )}
                  </View>
                );
              }

              // ── Normal mode: collapsed chord slots ─────────────────
              const slots = bar.isRepeat ? [{ chord: '%' }] : parseBar(bar.raw);

              const barContent = (
                <View className="min-h-10 flex-1 flex-row items-center px-1 py-2">
                  {slots.map((slot: any, si) => (
                    <View
                      key={`slot-${si}`}
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
                  key={`bar-${barIndex}`}
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

                  {isLastBar && repeat
                    ? (
                        <>
                          {renderRepeatBarLine}
                          {repeat >= 2 && (
                            <Text className="ml-0.5 text-xs font-bold text-black dark:text-white">
                              ×
                              {repeat}
                            </Text>
                          )}
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

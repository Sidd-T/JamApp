import { View } from 'react-native';
import { Text } from '@/components/ui';
import { generateListKey } from '@/lib/utils';

// how much the bar widths should vary based on their beat counts, vs all bars being equal width
const PROPORTION_WEIGHT = 0.5;

type ChordDisplayProps = {
  chordString: string;
  label?: string;
  showTimeSignature?: boolean;
  timeSignature?: string;
  repeat?: number;
};

function parseBar(barStr: string): { chord: string; optional?: string; beats: number }[] {
  const raw = barStr.trim();
  if (!raw)
    return [];
  const parts = raw.split(',');
  const result: { chord: string; optional?: string; beats: number }[] = [];
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

export function ChordDisplay({
  chordString,
  label,
  showTimeSignature,
  timeSignature = '4/4',
  repeat,
}: ChordDisplayProps) {
  if (!chordString)
    return null;

  const bars = chordString.split('|').map(b => b.trim()).filter(Boolean);

  const rows: string[][] = [];
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

        const parsedBars = rowBars.map((bar) => {
          const slots = parseBar(bar);
          const beats = slots.length === 0 ? 1 : slots.reduce((s, slot) => s + slot.beats, 0);
          return { slots, beats };
        });

        const rowTotalBeats = parsedBars.reduce((sum, b) => sum + b.beats, 0);

        return (
          <View key={generateListKey(`row-${rowBars.join('-')}`, rowIndex)} className="mb-0 flex-row items-stretch">

            {/* Opening bar line — for first row, optionally prefix with time sig */}
            {isFirstRow && showTimeSignature
              ? (
                  <View className="mr-0 flex-row items-center">
                    {/* Stacked time sig numbers, compact */}
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

            {parsedBars.map(({ slots, beats: barBeats }, barIndex) => {
              const isLastBar = isLastRow && barIndex === rowBars.length - 1;

              const equalFlex = 1 / rowBars.length;
              const proportionalFlex = barBeats / rowTotalBeats;
              const barFlex = equalFlex * (1 - PROPORTION_WEIGHT) + proportionalFlex * PROPORTION_WEIGHT;

              return (
                <View key={generateListKey(`bar-${slots.map(s => s.chord).join('-')}`, barIndex)} style={{ flex: barFlex }} className="mb-2 flex-row">
                  <View className="min-h-10 flex-1 flex-row items-center px-1 py-2">
                    {slots.length === 0
                      ? (
                          <Text className="text-xl font-bold text-black dark:text-white">%</Text>
                        )
                      : (
                          slots.map((slot, si) => (
                            <View
                              key={generateListKey(`slot-${slot.chord}-${slot.optional || ''}`, si)}
                              style={{ flex: slot.beats }}
                              className="items-start justify-center"
                            >
                              <View className="relative">
                                {slot.optional && (
                                  <Text
                                    className="absolute bottom-[80%] left-0 text-xs text-black italic dark:text-white"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.7}
                                  >
                                    (
                                    {slot.optional}
                                    )
                                  </Text>
                                )}
                                <Text
                                  className="text-lg font-bold text-black dark:text-white"
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                  minimumFontScale={0.6}
                                >
                                  {/** Use invis character to preserve alignment if no chord */}
                                  {(slot.chord !== '') ? slot.chord : ' ‎ '}
                                </Text>
                              </View>
                            </View>
                          ))
                        )}
                  </View>

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

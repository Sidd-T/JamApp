import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { expandBarToBeats } from '@/features/standards/helpers/bar-beats';
import { BarLine } from './bar-line';
import { BarLineEnd } from './bar-line-end';
import { ChordSymbol, OptionalChordSymbol } from './chord-symbol';
import { PressableBar } from './pressable-bar';

type ParsedSlot = {
  chord: string;
  optional?: string;
  beats: number;
};

export type BarCellProps = {
  bar: { raw: string; isRepeat: boolean };
  absoluteBarIndex: number;
  rowBarCount: number;
  isLastBar: boolean;
  repeat?: number;
  // Edit mode
  editMode: boolean;
  n: number;
  isActiveBar: boolean;
  activeBeatIndex?: number;
  onBeatPress?: (barLocalIndex: number, beatIndex: number) => void;
  // Normal mode
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

export function BarCell({
  bar,
  absoluteBarIndex,
  rowBarCount,
  isLastBar,
  repeat,
  editMode,
  n,
  isActiveBar,
  activeBeatIndex,
  onBeatPress,
  onBarPress,
}: BarCellProps) {
  const trailing = isLastBar && repeat != null
    ? <BarLineEnd repeat={repeat} />
    : <BarLine />;

  if (editMode && onBeatPress) {
    const beatSlots = expandBarToBeats(bar.raw, n);
    return (
      <View style={{ flex: 1 / rowBarCount }} className="flex-row">
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
                    isActiveBeat ? 'bg-primary-100 dark:bg-primary-900' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {beatText
                    ? (
                        <ChordSymbol raw={beatText} />
                      )
                    : (
                        <Text className="text-sm text-neutral-300 dark:text-neutral-700">—</Text>
                      )}
                </View>
              </Pressable>
            );
          })}
        </View>
        {trailing}
      </View>
    );
  }

  // Normal mode
  const slots = bar.isRepeat ? [{ chord: '%', beats: 1 }] : parseBar(bar.raw);
  const barContent = (
    <View className="min-h-10 flex-1 flex-row items-center px-1 py-2">
      {slots.map((slot, si) => (
        <View
          key={`slot-${si}`}
          style={{ flex: slot.beats || 1 }}
          className={`${bar.isRepeat ? 'items-center font-bold' : 'items-start'} justify-center`}
        >
          <View className="relative">
            {'optional' in slot && slot.optional && (
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
    <View style={{ flex: 1 / rowBarCount }} className="flex-row">
      <PressableBar onPress={onBarPress ? () => onBarPress(absoluteBarIndex) : undefined}>
        {barContent}
      </PressableBar>
      {trailing}
    </View>
  );
}

import type { TextInput } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { ChordInput } from './chord-input';
import { ChordKeyboard } from './chord-keyboard';
import { useChordEditor } from './use-chord-editor';

type SectionChordKeyboardProps = {
  bars: string[];
  barIndex: number;
  onBarChange: (barIndex: number, chordToken: string) => void;
  onPrevBar: () => void;
  onNextBar: () => void;
  onClose: () => void;
};

export function SectionChordKeyboard({
  bars,
  barIndex,
  onBarChange,
  onPrevBar,
  onNextBar,
  onClose,
}: SectionChordKeyboardProps) {
  const currentChord = bars[barIndex] ?? '';
  const inputRef = React.useRef<TextInput>(null);

  const {
    selection,
    setSelection,
    insertAtCursor,
    backspace,
    moveCursorToEnd,
  } = useChordEditor({
    value: currentChord,
    onChange: value => onBarChange(barIndex, value),
  });

  const previousBarIndex = React.useRef(barIndex);

  React.useEffect(() => {
    if (previousBarIndex.current !== barIndex) {
      previousBarIndex.current = barIndex;
      moveCursorToEnd();
    }
  }, [barIndex, moveCursorToEnd]);

  return (
    <View className="border-t border-neutral-300 bg-neutral-200 px-3 dark:border-neutral-800 dark:bg-black">

      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="ml-2 text-base font-semibold text-black dark:text-white">
          {`Bar ${barIndex + 1}:`}
        </Text>

        <Button
          label="Done"
          onPress={onClose}
          variant="ghost"
          size="sm"
          fullWidth={false}
          className="border-transparent bg-transparent"
          textClassName="text-base text-primary-600 dark:text-primary-500 font-semibold"
        />
      </View>

      {/* Input */}
      <ChordInput
        ref={inputRef}
        value={currentChord}
        selection={selection}
        onChangeText={text => onBarChange(barIndex, text)}
        onSelectionChange={setSelection}
      />

      {/* Keyboard */}
      <ChordKeyboard
        insertAtCursor={insertAtCursor}
        backspace={backspace}
        inputRef={inputRef}
        onPrevBar={onPrevBar}
        onNextBar={onNextBar}
        barIndex={barIndex}
      />
    </View>
  );
}

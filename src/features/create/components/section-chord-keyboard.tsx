import type { TextInput } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { ChordInput } from './chord-input';
import { ChordKeyboard } from './chord-keyboard';
import { useChordEditor } from './use-chord-editor';

type SectionChordKeyboardProps = {
  beats: string[];
  beatIndex: number;
  barLabel: string;
  totalBars: number; // ← add
  onBeatChange: (beatIndex: number, text: string) => void;
  onPrevBeat: () => void;
  onNextBeat: () => void;
  onDeleteBar: () => void; // ← add
  onAddBar: () => void; // ← add
  onClose: () => void;
};

export function SectionChordKeyboard({
  beats,
  beatIndex,
  barLabel,
  totalBars,
  onBeatChange,
  onPrevBeat,
  onNextBeat,
  onDeleteBar,
  onAddBar,
  onClose,
}: SectionChordKeyboardProps) {
  const currentBeat = beats[beatIndex] ?? '';
  const inputRef = React.useRef<TextInput>(null);

  const {
    selection,
    setSelection,
    insertAtCursor,
    backspace,
  } = useChordEditor({
    value: currentBeat,
    onChange: text => onBeatChange(beatIndex, text),
  });

  return (
    <View className="border-t border-neutral-300 bg-neutral-200 px-2 dark:border-neutral-800 dark:bg-black">

      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="ml-2 text-base font-semibold text-black dark:text-white">
          {barLabel}
          :
        </Text>

        <View className="mx-2 grow">
          <ChordInput
            ref={inputRef}
            value={currentBeat}
            selection={selection}
            onChangeText={text => onBeatChange(beatIndex, text)}
            onSelectionChange={setSelection}
          />
        </View>

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

      <ChordKeyboard
        insertAtCursor={insertAtCursor}
        backspace={backspace}
        inputRef={inputRef}
        onPrevBeat={onPrevBeat}
        onNextBeat={onNextBeat}
        onAddBar={onAddBar}
        onDeleteBar={onDeleteBar}
        beatIndex={beatIndex}
        totalBars={totalBars}
      />
    </View>
  );
}

import type { RefObject } from 'react';
import type { TextInput } from 'react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import {
  ACCIDENTALS,
  KEY_CLASS,
  KEY_TEXT_CLASS,
  NOTE_LETTERS,
  NUMBERS,
  QUALITIES,
} from './chord-constants';

type Props = {
  insertAtCursor: (value: string) => void;
  backspace: () => void;
  inputRef: RefObject<TextInput | null>;
  onPrevBeat: () => void;
  onNextBeat: () => void;
  onDeleteBar: () => void;
  onAddBar: () => void;
  beatIndex: number;
  totalBars: number;
};

export function ChordKeyboard({
  insertAtCursor,
  backspace,
  inputRef,
  onPrevBeat,
  onNextBeat,
  onDeleteBar,
  onAddBar,
  beatIndex,
  totalBars,
}: Props) {
  return (

    <View className="mt-2 gap-0.5">

      {/* Numbers + backspace */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row flex-wrap">
          {NUMBERS.map(n => (
            <Button
              key={n}
              label={n}
              onPress={() => {
                insertAtCursor(n);
                inputRef.current?.focus();
              }}
              variant="outline"
              size="sm"
              fullWidth={false}
              className={KEY_CLASS}
              textClassName={KEY_TEXT_CLASS}
            />
          ))}
        </View>

        <Button
          label="⌫"
          onPress={() => {
            backspace();
            inputRef.current?.focus();
          }}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={KEY_CLASS}
          textClassName={KEY_TEXT_CLASS}
        />
      </View>

      {/* Letters + accidentals */}
      <View className="flex-row flex-wrap justify-center gap-0.5">
        {NOTE_LETTERS.map(n => (
          <Button
            key={n}
            label={n}
            onPress={() => {
              insertAtCursor(n);
              inputRef.current?.focus();
            }}
            variant="outline"
            size="sm"
            fullWidth={false}
            className={KEY_CLASS}
            textClassName={KEY_TEXT_CLASS}
          />
        ))}

        {ACCIDENTALS.map(a => (
          <Button
            key={a.key}
            label={a.label}
            onPress={() => {
              insertAtCursor(a.value);
              inputRef.current?.focus();
            }}
            variant="outline"
            size="sm"
            fullWidth={false}
            className={KEY_CLASS}
            textClassName={`-translate-y-[12%] scale-120 ${KEY_TEXT_CLASS}`}
          />
        ))}
      </View>

      {/* Qualities + symbols */}
      <View className="scale-95 flex-row items-center justify-center gap-0.5">
        {QUALITIES.map(q => (
          <Button
            key={q}
            label={q}
            onPress={() => {
              insertAtCursor(q);
              inputRef.current?.focus();
            }}
            variant="outline"
            size="sm"
            fullWidth={false}
            className={KEY_CLASS}
            textClassName={KEY_TEXT_CLASS}
          />
        ))}
      </View>

      {/* Bottom row: Bar ops | divider | Beat nav */}
      <View className="flex-row items-center justify-center gap-1">
        {/* Bar operations */}
        <Button
          label="− Bar"
          onPress={onDeleteBar}
          disabled={totalBars <= 1}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={
            totalBars <= 1
              ? 'bg-neutral-300 opacity-50'
              : `${KEY_CLASS}`
          }
          textClassName={KEY_TEXT_CLASS}
        />
        <Button
          label="+ Bar"
          onPress={onAddBar}
          variant="secondary"
          size="sm"
          fullWidth={false}
          textClassName="text-lg"
        />

        {/* Faint vertical divider */}
        <View className="mx-1 h-7 w-px bg-neutral-400 opacity-30" />

        {/* Beat navigation */}
        <Button
          label="< Prev"
          onPress={onPrevBeat}
          disabled={beatIndex <= 0}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={
            beatIndex <= 0
              ? 'min-w-[22%] bg-neutral-300 opacity-50'
              : `min-w-[22%] ${KEY_CLASS}`
          }
          textClassName={KEY_TEXT_CLASS}
        />
        <Button
          label="Next >"
          onPress={onNextBeat}
          variant="secondary"
          size="sm"
          fullWidth={false}
          className="min-w-[22%]"
          textClassName="text-lg"
        />
      </View>
    </View>
  );
}

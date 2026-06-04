import type { TextInput } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import {
  KEY_CLASS,
  KEY_TEXT_CLASS,
  NOTE_LETTERS,
  NUMBERS,
  QUALITIES,
  TOKEN_BUTTONS,
} from './chord-constants';

type Props = {
  insertAtCursor: (value: string) => void;
  backspace: () => void;
  inputRef: React.RefObject<TextInput | null>;
  onPrevBar: () => void;
  onNextBar: () => void;
  barIndex: number;
};

export function ChordKeyboard({
  insertAtCursor,
  backspace,
  inputRef,
  onPrevBar,
  onNextBar,
  barIndex,
}: Props) {
  return (
    <View className="mt-4 gap-0.5">

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

      {/* Letters */}
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
      </View>

      {/* Qualities + symbols */}
      <View className="flex-row flex-wrap justify-center gap-0.5">
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

        {TOKEN_BUTTONS.map(t => (
          <Button
            key={t.key}
            label={t.label}
            onPress={() => {
              insertAtCursor(t.value);
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

      {/* Bottom row */}
      <View className="flex-row items-center justify-center gap-0.5">

        <Button
          label="< Prev Bar"
          onPress={onPrevBar}
          disabled={barIndex <= 0}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={
            barIndex <= 0
              ? 'rounded-xl bg-neutral-300 opacity-50'
              : KEY_CLASS
          }
          textClassName={KEY_TEXT_CLASS}
        />
        <Button
          label="Add Chord"
          onPress={() => {
            insertAtCursor(',');
            inputRef.current?.focus();
          }}
          variant="default"
          size="sm"
          fullWidth={false}
          className="min-w-48 rounded-xl border border-neutral-300 bg-white shadow-sm dark:bg-neutral-700"
          textClassName={KEY_TEXT_CLASS}
        />

        <Button
          label="Next Bar >"
          onPress={onNextBar}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={KEY_CLASS}
          textClassName={KEY_TEXT_CLASS}
        />
      </View>
    </View>
  );
}

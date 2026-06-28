import type { TextInput } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import {
  ACCIDENTALS,
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
  onPrevBeat: () => void;
  onNextBeat: () => void;
  beatIndex: number;
};

export function ChordKeyboard({
  insertAtCursor,
  backspace,
  inputRef,
  onPrevBeat,
  onNextBeat,
  beatIndex,
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

      {/* Bottom row: Prev / Next beat */}
      <View className="flex-row items-center justify-center gap-0.5">
        <Button
          label="< Prev"
          onPress={onPrevBeat}
          disabled={beatIndex <= 0}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={
            beatIndex <= 0
              ? 'min-w-[48%] rounded-xl bg-neutral-300 opacity-50'
              : `min-w-[48%] ${KEY_CLASS}`
          }
          textClassName={KEY_TEXT_CLASS}
        />
        <Button
          label="Next >"
          onPress={onNextBeat}
          variant="outline"
          size="sm"
          fullWidth={false}
          className={`min-w-[48%] ${KEY_CLASS}`}
          textClassName={KEY_TEXT_CLASS}
        />
      </View>
    </View>
  );
}

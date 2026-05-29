import * as React from 'react';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';

export type ChordToken = {
  barIndex: number;
  chord: string;
};

type SectionChordKeyboardProps = {
  bars: string[];
  barIndex: number;
  onBarChange: (
    barIndex: number,
    chordToken: string,
  ) => void;
  onPrevBar: () => void;
  onNextBar: () => void;
  onClose: () => void;
};

const NOTE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const QUALITIES = ['m', 'maj', 'dim', 'aug', '7', 'm7', 'maj7', 'sus2', 'sus4'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const TOKEN_BUTTONS = [
  { key: 'slash', label: '/', value: '/' },
  { key: 'left-bracket', label: '(', value: '(' },
  { key: 'right-bracket', label: ')', value: ')' },
  { key: 'sharp', label: '#', value: '#' },
  { key: 'flat', label: '♭', value: 'b' },
];

function appendAtEnd(current: string, value: string) {
  return `${current}${value}`;
}

function removeLastChar(current: string) {
  return current.slice(0, -1);
}

const KEY_CLASS = `
  my-0
  rounded-xl
  min-w-8
  bg-white
  dark:bg-neutral-700
  border
  border-neutral-300
  dark:border-neutral-600
  shadow-sm
`;

const WIDE_KEY_CLASS = `
  my-0
  rounded-xl
  min-w-12
  bg-white
  dark:bg-neutral-700
  border
  border-neutral-300
  dark:border-neutral-600
  shadow-sm
`;

const KEY_TEXT_CLASS = 'text-black dark:text-white font-semibold';

export function SectionChordKeyboard({
  bars,
  barIndex,
  onBarChange,
  onPrevBar,
  onNextBar,
  onClose,
}: SectionChordKeyboardProps) {
  const currentChord = bars[barIndex] ?? '';

  const addToken = (value: string) => {
    onBarChange(barIndex, appendAtEnd(currentChord, value));
  };

  const backspace = () => {
    onBarChange(barIndex, removeLastChar(currentChord));
  };

  return (
    <View
      className="border-t border-neutral-300 bg-neutral-200 px-4 py-2 dark:border-neutral-800 dark:bg-black"
    >

      {/* Current Chord */}
      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="ml-2 text-base font-semibold text-neutral-700 dark:text-neutral-300">
            {`Bar ${barIndex + 1}:`}
          </Text>
          <Button
            label="Done"
            onPress={onClose}
            variant="ghost"
            size="sm"
            fullWidth={false}
            className="my-0"
            textClassName="text-base text-blue-600 dark:text-blue-400 font-semibold no-underline"
          />
        </View>

        <View className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <Text className="font-mono text-lg text-black dark:text-white">
            {currentChord || ' '}
          </Text>
        </View>
      </View>

      <View className="gap-1">
        {/* Top row - numbers + backspace */}
        <View className="flex-row items-center justify-between gap-0.5">
          <View className="flex-1 flex-row flex-wrap gap-0.5">
            {NUMBERS.map(n => (
              <Button
                key={n}
                label={n}
                onPress={() => addToken(n)}
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
            onPress={backspace}
            variant="outline"
            size="sm"
            fullWidth={false}
            className={WIDE_KEY_CLASS}
            textClassName={KEY_TEXT_CLASS}
          />
        </View>

        {/* Letters */}
        <View className="flex-row flex-wrap justify-center gap-0.5">
          {NOTE_LETTERS.map(n => (
            <Button
              key={n}
              label={n}
              onPress={() => addToken(n)}
              variant="outline"
              size="sm"
              fullWidth={false}
              className={KEY_CLASS}
              textClassName={KEY_TEXT_CLASS}
            />
          ))}
        </View>

        {/* Chord qualities and symbols */}
        <View className="flex-row flex-wrap justify-center gap-0.5">
          {QUALITIES.map(q => (
            <Button
              key={q}
              label={q}
              onPress={() => addToken(q)}
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
              onPress={() => addToken(t.value)}
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
            variant="outline"
            size="sm"
            fullWidth={false}
            className={
              (barIndex <= 0)
                ? 'border-0 bg-neutral-300 dark:bg-neutral-300'
                : KEY_CLASS
            }
            textClassName={
              (barIndex <= 0)
                ? 'text-neutral-400 dark:text-neutral-400'
                : KEY_TEXT_CLASS
            }
            disabled={barIndex <= 0}
          />

          <Button
            label="Add Chord"
            onPress={() => addToken(',')}
            variant="default"
            size="sm"
            fullWidth={false}
            className="my-0 min-w-48 rounded-xl border border-neutral-300 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-700"
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
    </View>
  );
}

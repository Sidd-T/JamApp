import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { Select, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { ArrowRight, Edit, Refresh } from '@/components/ui/icons';
import { KEY_OPTIONS, transposeKey } from '../helpers/music-keys';

type TransposeControlProps = {
  currentKey: string;
  originalKey?: string;
  onChange: (newKey: string) => void;
  testID?: string;
};

export function TransposeControl({
  currentKey,
  originalKey,
  onChange,
  testID,
}: TransposeControlProps) {
  const [open, setOpen] = React.useState(false);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const iconColor = isDark ? colors.neutral[300] : colors.neutral[500];
  const editColor = open ? colors.primary[500] : iconColor;

  const isTransposed = originalKey !== undefined && originalKey !== currentKey;

  const handleSelect = (value: string | number) => {
    onChange(String(value));
    setOpen(false);
  };

  const handleStep = (semitones: number) => {
    onChange(transposeKey(currentKey, semitones));
  };

  const handleReset = () => {
    if (originalKey)
      onChange(originalKey);
  };

  return (
    <View className="relative z-30 items-center" testID={testID}>
      <Pressable
        onPress={() => setOpen(prev => !prev)}
        hitSlop={8}
        className="flex-row items-center gap-1 px-2 py-1"
        testID={testID ? `${testID}-trigger` : undefined}
      >
        <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
          {currentKey}
        </Text>
        {isTransposed
          ? (
              <Pressable
                onPress={handleReset}
                hitSlop={8}
                className="z-99"
                testID={testID ? `${testID}-reset` : undefined}
              >
                <Refresh color={iconColor} width={20} height={20} />
              </Pressable>
            )
          : <Edit color={editColor} width={20} height={20} />}
      </Pressable>

      {open && (
        <View className="absolute top-full left-1/2 z-50 -translate-x-1/2 flex-row items-start rounded-xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <Select
            value={currentKey}
            options={KEY_OPTIONS}
            onSelect={handleSelect}
            className="z-70 w-20"
            testID={testID ? `${testID}-select` : undefined}
          />

          <View className="ml-2 flex-col gap-1">
            <Pressable
              onPress={() => handleStep(1)}
              className="-rotate-90 items-center justify-center rounded-sm p-1"
              testID={testID ? `${testID}-up` : undefined}
            >
              <ArrowRight color={iconColor} />
            </Pressable>
            <Pressable
              onPress={() => handleStep(-1)}
              className="rotate-90 items-center justify-center rounded-sm p-1"
              testID={testID ? `${testID}-down` : undefined}
            >
              <ArrowRight color={iconColor} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

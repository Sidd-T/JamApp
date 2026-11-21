import { Pressable, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { Select } from '@/components/ui';
import colors from '@/components/ui/colors';
import { ArrowRight, Refresh } from '@/components/ui/icons';
import { keyOptionsFor, transposeKey } from '../helpers/music-keys';

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
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const iconColor = isDark ? colors.neutral[300] : colors.neutral[500];

  const isTransposed = originalKey !== undefined && originalKey !== currentKey;

  const handleSelect = (value: string | number) => {
    onChange(String(value));
  };

  const handleStep = (semitones: number) => {
    onChange(transposeKey(currentKey, semitones));
  };

  const handleReset = () => {
    if (originalKey)
      onChange(originalKey);
  };

  return (
    <View className="relative z-30 flex-row items-center" testID={testID}>
      <Select
        value={currentKey}
        options={keyOptionsFor(currentKey)}
        onSelect={handleSelect}
        className="mb-0 min-w-28"
        inputClassName="px-2 py-1"
        inputValueClassName="text-center"
        testID={testID ? `${testID}-select` : undefined}
      />

      <View className="ml-1 flex-col items-center">
        <Pressable
          onPress={() => handleStep(1)}
          className="-rotate-90 items-center justify-center rounded-sm"
          testID={testID ? `${testID}-up` : undefined}
        >
          <ArrowRight color={iconColor} width={16} height={16} />
        </Pressable>
        <Pressable
          onPress={() => handleStep(-1)}
          className="rotate-90 items-center justify-center rounded-sm"
          testID={testID ? `${testID}-down` : undefined}
        >
          <ArrowRight color={iconColor} width={16} height={16} />
        </Pressable>
      </View>

      {isTransposed && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset transposition"
          onPress={handleReset}
          hitSlop={8}
          className="ml-1"
          testID={testID ? `${testID}-reset` : undefined}
        >
          <Refresh color={iconColor} width={18} height={18} />
        </Pressable>
      )}
    </View>
  );
}

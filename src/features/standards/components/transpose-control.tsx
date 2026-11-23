import { Pressable, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { Button, Select, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { ArrowRight, Close, Refresh } from '@/components/ui/icons';
import { translate } from '@/lib/i18n';
import { keyOptionsFor, transposeKey } from '../helpers/music-keys';

type TransposeControlProps = {
  currentKey: string;
  originalKey?: string;
  onChange: (newKey: string) => void;
  visible: boolean;
  onClose: () => void;
  testID?: string;
};

export function TransposeControl({
  currentKey,
  originalKey,
  onChange,
  visible,
  onClose,
  testID,
}: TransposeControlProps) {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const iconColor = isDark ? colors.neutral[300] : colors.neutral[500];
  const arrowButtonStyle = { width: 128, height: 30, paddingHorizontal: 0 };
  const resetButtonStyle = { width: 40, height: 40, paddingHorizontal: 0 };

  const isTransposed = originalKey !== undefined && originalKey !== currentKey;

  if (!visible)
    return null;

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
    <View
      className="absolute inset-0 z-50"
      pointerEvents="box-none"
      testID={testID}
    >
      <Pressable
        className="absolute inset-0"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss transpose controls"
      />

      <View
        className="absolute top-2 right-4 z-99 w-40 rounded-lg border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800"
        pointerEvents="auto"
      >
        <View className="flex-row items-center justify-between border-b border-neutral-200 p-3 dark:border-neutral-700">
          <Text className="text-base font-semibold dark:text-neutral-100">{translate('settings.title')}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close transpose controls">
            <Close color={iconColor} width={18} height={18} />
          </Pressable>
        </View>

        <View className="items-center gap-2 px-4 py-3">
          <Button
            onPress={() => handleStep(1)}
            accessibilityRole="button"
            accessibilityLabel="Transpose up"
            variant="outline"
            size="icon"
            className="my-0"
            style={arrowButtonStyle}
            testID={testID ? `${testID}-up` : undefined}
          >
            <View className="-rotate-90">
              <ArrowRight color={iconColor} width={16} height={16} />
            </View>
          </Button>

          <View className="w-full flex-row items-center justify-center gap-2">
            <Select
              value={currentKey}
              options={keyOptionsFor(currentKey)}
              onSelect={handleSelect}
              className={`mb-0 ${isTransposed ? 'w-24' : 'w-32'}`}
              inputClassName="h-10 px-2 py-1"
              inputValueClassName="text-center"
              testID={testID ? `${testID}-select` : undefined}
            />

            {isTransposed && (
              <Button
                accessibilityRole="button"
                accessibilityLabel="Reset transposition"
                onPress={handleReset}
                variant="secondary"
                size="icon"
                className="my-0"
                style={resetButtonStyle}
                testID={testID ? `${testID}-reset` : undefined}
              >
                <Refresh color={colors.neutral[100]} width={18} height={18} />
              </Button>
            )}
          </View>

          <Button
            onPress={() => handleStep(-1)}
            accessibilityRole="button"
            accessibilityLabel="Transpose down"
            variant="outline"
            size="icon"
            className="my-0"
            style={arrowButtonStyle}
            testID={testID ? `${testID}-down` : undefined}
          >
            <View className="rotate-90">
              <ArrowRight color={iconColor} width={16} height={16} />
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}

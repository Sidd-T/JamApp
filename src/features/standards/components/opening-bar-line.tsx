import { View } from 'react-native';
import { Text } from '@/components/ui';
import { AbsoluteBarLine } from './bar-line';

type OpeningBarLineProps = {
  /** When provided, renders the time signature alongside the bar line. */
  timeSignature?: string;
};

/**
 * The bar line is absolutely positioned (fills row height without affecting
 * it). When a time signature is shown, it sits in normal flow next to the
 * bar line so it naturally pushes bar content to the right.
 */
export function OpeningBarLine({ timeSignature }: OpeningBarLineProps) {
  if (timeSignature) {
    const [top, bottom] = timeSignature.split('/');
    return (
      <View className="relative flex-row">
        <AbsoluteBarLine side="left" />
        {/* w-px clears the absolute bar line so the time sig doesn't overlap it */}
        <View className="w-px" />
        <View className="items-center justify-center px-1">
          <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
            {top}
          </Text>
          <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
            {bottom}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="relative w-px">
      <AbsoluteBarLine side="left" />
    </View>
  );
}

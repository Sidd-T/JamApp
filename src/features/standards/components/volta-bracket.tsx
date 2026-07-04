import { View } from 'react-native';
import { Text } from '@/components/ui';
import { HorizontalBarLine } from './bar-line';

type VoltaBracketProps = {
  number: number;
  /** When true, the right side of the bracket is open (last ending). */
  open: boolean;
};

/**
 * The volta bracket above an ending — a top bar line, short left drop,
 * optional short right drop, and the ending number label. Height is
 * determined by the label text only.
 *
 * Bar lines below this are owned by ChordDisplay, not by this component.
 */
export function VoltaBracket({ number, open }: VoltaBracketProps) {
  return (
    <View className="flex-row items-stretch pb-1">
      {/* Left drop */}
      <View className="w-px bg-black dark:bg-white" />

      <View className="flex-1">
        {/* Top bar */}
        <HorizontalBarLine />
        {/* Label */}
        <View className="px-1 py-0.5">
          <Text className="text-xs font-bold text-black dark:text-white">
            {number}
            .
          </Text>
        </View>
      </View>

      {/* Right drop — closed bracket only */}
      {!open && <View className="w-px bg-black dark:bg-white" />}
    </View>
  );
}

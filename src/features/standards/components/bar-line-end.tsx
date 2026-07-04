import { View } from 'react-native';
import { Text } from '@/components/ui';
import { BarLine } from './bar-line';

type BarLineEndProps = {
  repeat?: number;
};

export function BarLineEnd({ repeat }: BarLineEndProps) {
  return (
    <>
      <View className="relative flex-row items-center">
        {repeat != null && repeat > 1 && (
          <Text className="absolute top-0 right-0 mr-0.5 text-xs font-bold text-black dark:text-white">
            ×
            {repeat}
          </Text>
        )}
        <View className="mr-0.5 items-center justify-center">
          <Text className="text-2xl/5 font-bold text-black dark:text-white">:</Text>
        </View>
      </View>
      <View className="flex-row gap-0.5">
        <BarLine />
        <BarLine />
      </View>

    </>
  );
}

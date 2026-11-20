import { Pressable, Text, View } from 'react-native';

type RealBookScreenControlsProps = {
  title: string;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
};

export function RealBookScreenControls({
  title,
  isFullscreen,
  onClose,
  onToggleFullscreen,
}: RealBookScreenControlsProps) {
  return (
    <View className="h-12 flex-row items-center gap-2 border-b border-neutral-200 bg-white px-2 dark:border-neutral-800 dark:bg-neutral-900">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close Real Book viewer"
        onPress={onClose}
        className="min-w-14 items-center p-2"
      >
        <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Close</Text>
      </Pressable>
      <Text numberOfLines={1} className="min-w-0 flex-1 text-center text-sm font-semibold text-neutral-900 dark:text-white">
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        onPress={onToggleFullscreen}
        className="min-w-24 items-center p-2"
      >
        <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </Text>
      </Pressable>
    </View>
  );
}

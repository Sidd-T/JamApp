import { Pressable, View } from 'react-native';

type PressableBarProps = {
  onPress?: () => void;
  children: React.ReactNode;
};

export function PressableBar({ onPress, children }: PressableBarProps) {
  if (onPress) {
    return (
      <Pressable style={{ flex: 1 }} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View style={{ flex: 1 }}>{children}</View>;
}

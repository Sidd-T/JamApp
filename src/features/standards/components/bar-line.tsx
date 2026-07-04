import { View } from 'react-native';

/** A vertical bar line — 1px wide, full height of its container. */
export function BarLine() {
  return <View className="w-px bg-black dark:bg-white" />;
}

/** A horizontal bar line — 1px tall, full width of its container. */
export function HorizontalBarLine() {
  return <View className="h-px bg-black dark:bg-white" />;
}

/**
 * A vertical bar line pinned absolutely to a side of its nearest `relative`
 * ancestor, spanning its full height. Use for bar lines that must not
 * contribute to layout height.
 */
export function AbsoluteBarLine({ side }: { side: 'left' | 'right' }) {
  return (
    <View
      className={`absolute inset-y-0 w-px bg-black dark:bg-white ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    />
  );
}

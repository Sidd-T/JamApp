import type { LayoutChangeEvent } from 'react-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

type SquishToFitProps = {
  children: React.ReactNode;
  minScale?: number;
  align?: 'start' | 'center';
};

export function SquishToFit({ children, minScale = 0.5, align = 'start' }: SquishToFitProps) {
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setAvailableWidth(prev => (prev !== w ? w : prev));
  }, []);

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setNaturalWidth(prev => (prev !== w ? w : prev));
  }, []);

  const SAFETY_MARGIN = 0.96;
  const ready = availableWidth != null && naturalWidth != null;
  const rawScale = ready && naturalWidth > availableWidth
    ? (availableWidth * SAFETY_MARGIN) / naturalWidth
    : 1;
  const scale = Math.max(rawScale, minScale);

  const alignClass = align === 'center' ? 'self-center origin-center' : 'self-start origin-left';

  return (
    <View onLayout={onContainerLayout} className="w-full">
      <View
        onLayout={onContentLayout}
        className={`${alignClass} ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: [{ scaleX: scale }] }}
      >
        {children}
      </View>
    </View>
  );
}

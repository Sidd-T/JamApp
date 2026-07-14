import type { LayoutChangeEvent } from 'react-native';
// squish-bar.tsx
import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

type SquishBarContextValue = {
  scale: number;
  ready: boolean;
  registerAvailableWidth: (id: string, width: number) => void;
  registerNaturalWidth: (id: string, width: number) => void;
};

const SquishBarContext = createContext<SquishBarContextValue | null>(null);

function useSquishBar() {
  const ctx = use(SquishBarContext);
  if (!ctx)
    throw new Error('SquishSlot/SquishItem must be used within a SquishBar');
  return ctx;
}

type SquishBarProps = {
  children: React.ReactNode;
  /** Number of chord slots in this bar — lets us know when all measurements are in. */
  itemCount: number;
  minScale?: number;
};

/**
 * Computes one shared horizontal scale for a bar's worth of chords.
 * The scale is driven by the MOST CONSTRAINED slot (its available
 * flex width vs its content's natural width) so no chord ever overflows
 * its own slot and bleeds into a neighbor — every chord just shares
 * that same worst-case scale, which keeps the squish visually even.
 */
export function SquishBar({ children, itemCount, minScale = 0.65 }: SquishBarProps) {
  const availableWidths = useRef<Map<string, number>>(new Map());
  const naturalWidths = useRef<Map<string, number>>(new Map());
  const [, forceRender] = useState(0);

  const registerAvailableWidth = useCallback((id: string, width: number) => {
    if (availableWidths.current.get(id) !== width) {
      availableWidths.current.set(id, width);
      forceRender(n => n + 1);
    }
  }, []);

  const registerNaturalWidth = useCallback((id: string, width: number) => {
    if (naturalWidths.current.get(id) !== width) {
      naturalWidths.current.set(id, width);
      forceRender(n => n + 1);
    }
  }, []);

  const allMeasured
    = availableWidths.current.size >= itemCount
      && naturalWidths.current.size >= itemCount;

  let scale = 1;
  if (allMeasured) {
    let minRatio = 1; // never scale UP past natural size
    for (const [id, natural] of naturalWidths.current) {
      if (natural <= 0)
        continue;
      const avail = availableWidths.current.get(id) ?? 0;
      const ratio = avail / natural;
      if (ratio < minRatio)
        minRatio = ratio;
    }
    scale = Math.max(minScale, minRatio);
  }

  const value = useMemo(
    () => ({ scale, ready: allMeasured, registerAvailableWidth, registerNaturalWidth }),
    [scale, allMeasured, registerAvailableWidth, registerNaturalWidth],
  );

  return (
    <View className="flex-1 flex-row items-center">
      <SquishBarContext value={value}>
        {children}
      </SquishBarContext>
    </View>
  );
}

type SquishSlotProps = {
  id: string;
  flex: number;
  className?: string;
  children: React.ReactNode;
};

/** The per-chord flex container — reports how much width it was actually given. */
export function SquishSlot({ id, flex, className, children }: SquishSlotProps) {
  const { registerAvailableWidth } = useSquishBar();

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    registerAvailableWidth(id, e.nativeEvent.layout.width);
  }, [id, registerAvailableWidth]);

  return (
    <View style={{ flex }} className={className} onLayout={onLayout}>
      {children}
    </View>
  );
}

type SquishItemProps = {
  id: string;
  children: React.ReactNode;
};

/** The chord content itself — reports its natural width and paints at the bar's shared scale. */
export function SquishItem({ id, children }: SquishItemProps) {
  const { scale, ready, registerNaturalWidth } = useSquishBar();

  const onNaturalLayout = useCallback((e: LayoutChangeEvent) => {
    registerNaturalWidth(id, e.nativeEvent.layout.width);
  }, [id, registerNaturalWidth]);

  return (
    <View
      onLayout={onNaturalLayout}
      style={{
        alignSelf: 'flex-start',
        transform: [{ scaleX: scale }],
        transformOrigin: 'left center',
        opacity: ready ? 1 : 0,
      }}
    >
      {children}
    </View>
  );
}

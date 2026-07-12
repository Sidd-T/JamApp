import type { SegmentRef } from '../standards';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar } from '@/features/standards/helpers/bar-beats';
import { PressableBar } from './pressable-bar';

// ── Shared beat grid ─────────────────────────────────────────────────────────

type BeatGridProps = {
  n: number;
  isActive: boolean;
  activeBeatIndex?: number;
  onBeatPress: (bi: number) => void;
};

function BeatGrid({ n, isActive, activeBeatIndex, onBeatPress }: BeatGridProps) {
  return (
    <View style={{ flex: 1 }} className="flex-row">
      {Array.from({ length: n }).map((_, bi) => {
        const isActiveBeat = isActive && activeBeatIndex === bi;
        return (
          <Pressable key={bi} style={{ flex: 1 }} onPress={() => onBeatPress(bi)}>
            <View
              className={[
                'min-h-10 flex-1 items-center justify-center',
                bi < n - 1 ? 'border-r border-neutral-200 dark:border-neutral-800' : '',
                isActiveBeat ? 'bg-primary-100 dark:bg-primary-900' : '',
              ].filter(Boolean).join(' ')}
            >
              <Text className="text-sm text-neutral-300 dark:text-neutral-700">—</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── EmptyMainSegment ─────────────────────────────────────────────────────────
// Pure content — no bar lines. Pass as emptyContent to ChordDisplay, which
// wraps it with the opening and closing bar lines.

type EmptyMainSegmentProps = {
  timeSignature?: string;
  editMode: boolean;
  isMainActive: boolean;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBarPress?: (segment: SegmentRef, localIndex: number) => void;
  onBeatPress?: (segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
};

const mainSegmentRef: SegmentRef = { segment: 'main' };

export function EmptyMainSegment({
  timeSignature,
  editMode,
  isMainActive,
  activeBarLocalIndex,
  activeBeatIndex,
  onBarPress,
  onBeatPress,
}: EmptyMainSegmentProps) {
  const n = beatsPerBar(timeSignature);
  const isActive = isMainActive && activeBarLocalIndex === 0;

  if (editMode && onBeatPress) {
    return (
      <BeatGrid
        n={n}
        isActive={isActive}
        activeBeatIndex={activeBeatIndex}
        onBeatPress={bi => onBeatPress(mainSegmentRef, 0, bi)}
      />
    );
  }

  return (
    <PressableBar onPress={onBarPress ? () => onBarPress(mainSegmentRef, 0) : undefined}>
      <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
        <Text className="text-base text-neutral-400 dark:text-neutral-600">+ chord</Text>
      </View>
    </PressableBar>
  );
}

// ── EmptyEndingSegment ───────────────────────────────────────────────────────
// Pure content — no bar lines. The volta bracket's left drop is the left edge;
// ChordDisplay (via emptyContent) provides the closing bar line.

type EmptyEndingSegmentProps = {
  endingRef: SegmentRef;
  timeSignature?: string;
  editMode: boolean;
  isThisEndingActive: boolean;
  activeBeatIndex?: number;
  onBarPress?: (segment: SegmentRef, localIndex: number) => void;
  onBeatPress?: (segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
};

export function EmptyEndingSegment({
  endingRef,
  timeSignature,
  editMode,
  isThisEndingActive,
  activeBeatIndex,
  onBarPress,
  onBeatPress,
}: EmptyEndingSegmentProps) {
  const n = beatsPerBar(timeSignature);

  if (editMode && onBeatPress) {
    return (
      <BeatGrid
        n={n}
        isActive={isThisEndingActive}
        activeBeatIndex={activeBeatIndex}
        onBeatPress={bi => onBeatPress(endingRef, 0, bi)}
      />
    );
  }

  return (
    <PressableBar onPress={onBarPress ? () => onBarPress(endingRef, 0) : undefined}>
      <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
        <Text className="text-base text-neutral-400 dark:text-neutral-600">+ chord</Text>
      </View>
    </PressableBar>
  );
}

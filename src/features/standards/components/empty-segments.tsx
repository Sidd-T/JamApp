import type { SegmentRef } from '../standards';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar } from '@/features/standards/helpers/bar-beats';

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

  if (!editMode && onBarPress) {
    return (
      <View className="mb-1 flex-row items-stretch">
        <View className="mb-2 w-px bg-black dark:bg-white" />
        <Pressable style={{ flex: 1 }} onPress={() => onBarPress(mainSegmentRef, 0)}>
          <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
            <Text className="text-base text-gray-400 dark:text-gray-600">
              + chord
            </Text>
          </View>
        </Pressable>
        <View className="w-px bg-black dark:bg-white" />
      </View>
    );
  }

  if (editMode && onBeatPress) {
    return (
      <View className="mb-1 flex-row items-stretch">
        <View className="mb-2 w-px bg-black dark:bg-white" />
        <View style={{ flex: 1 }} className="mb-2 flex-row">
          {Array.from({ length: n }).map((_, bi) => {
            const isActiveBeat
              = isMainActive
                && activeBarLocalIndex === 0
                && activeBeatIndex === bi;
            return (
              <Pressable
                key={bi}
                style={{ flex: 1 }}
                onPress={() => onBeatPress(mainSegmentRef, 0, bi)}
              >
                <View
                  className={[
                    'min-h-10 flex-1 items-center justify-center',
                    bi < n - 1 ? 'border-r border-neutral-200 dark:border-neutral-800' : '',
                    isActiveBeat ? 'bg-primary-100 dark:bg-primary-900' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <Text className="text-sm text-neutral-300 dark:text-neutral-700">
                    —
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View className="w-px bg-black dark:bg-white" />
      </View>
    );
  }

  return null;
}

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
      <View className="mb-1 flex-row items-stretch">
        <View className="mb-2 w-px bg-black dark:bg-white" />
        <View style={{ flex: 1 }} className="mb-2 flex-row">
          {Array.from({ length: n }).map((_, bi) => {
            const isActiveBeat = isThisEndingActive && activeBeatIndex === bi;
            return (
              <Pressable
                key={bi}
                style={{ flex: 1 }}
                onPress={() => onBeatPress(endingRef, 0, bi)}
              >
                <View
                  className={[
                    'min-h-10 flex-1 items-center justify-center',
                    bi < n - 1 ? 'border-r border-neutral-200 dark:border-neutral-800' : '',
                    isActiveBeat ? 'bg-primary-100 dark:bg-primary-900' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <Text className="text-sm text-neutral-300 dark:text-neutral-700">
                    —
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View className="w-px bg-black dark:bg-white" />
      </View>
    );
  }

  if (onBarPress) {
    return (
      <View className="mb-1 flex-row items-stretch">
        <View className="mb-2 w-px bg-black dark:bg-white" />
        <Pressable style={{ flex: 1 }} onPress={() => onBarPress(endingRef, 0)}>
          <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
            <Text className="text-base text-gray-400 dark:text-gray-600">
              + chord
            </Text>
          </View>
        </Pressable>
        <View className="w-px bg-black dark:bg-white" />
      </View>
    );
  }

  return null;
}

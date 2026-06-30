import type { Section, SegmentRef } from '../standards';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { beatsPerBar } from '@/features/standards/helpers/bar-beats';
import { ChordDisplay } from './chord-display';
import { InlineEndingsRow, OverflowEndings } from './endings';
import { countBars, isEmptyChords, MAX_BARS_PER_ROW, parseBars } from './section-display-utils';

type SectionDisplayProps = {
  section: Section;
  index: number;
  timeSignature?: string;
  onBarPress?: (segment: SegmentRef, localIndex: number) => void;
  activeSegment?: SegmentRef;
  activeBarLocalIndex?: number;
  activeBeatIndex?: number;
  onBeatPress?: (segment: SegmentRef, barLocalIndex: number, beatIndex: number) => void;
};

export function SectionDisplay({
  section,
  index,
  timeSignature,
  onBarPress,
  activeSegment,
  activeBarLocalIndex,
  activeBeatIndex,
  onBeatPress,
}: SectionDisplayProps) {
  const label = section.Label || `${index + 1}`;
  const hasEndings = section.Endings !== undefined;
  const hasEndingItems = !!section.Endings && section.Endings.length > 0;
  const rawMainChords = section.MainSegment?.Chords ?? '';
  const hasMainChords = !isEmptyChords(rawMainChords);
  const editMode = onBeatPress !== undefined;
  const n = beatsPerBar(timeSignature);

  const mainSegmentRef: SegmentRef = { segment: 'main' };
  const isMainActive = activeSegment?.segment === 'main';

  const repeatValue = !hasEndings ? (section.Repeat ?? 0) : 0;
  const showRepeat = repeatValue >= 1;

  // ── Bar layout (only needed when endings may share the last row) ─────────
  const mainBarCount = hasMainChords ? countBars(rawMainChords) : 1;
  const lastRowBarCount
    = mainBarCount % MAX_BARS_PER_ROW === 0 && mainBarCount > 0
      ? MAX_BARS_PER_ROW
      : mainBarCount % MAX_BARS_PER_ROW;
  const remainingSlots = MAX_BARS_PER_ROW - lastRowBarCount;

  const endingFits: boolean[] = [];
  if (hasEndingItems) {
    let slots = remainingSlots;
    for (const ending of section.Endings!) {
      const bars = isEmptyChords(ending.Chords) ? 1 : countBars(ending.Chords);
      if (bars <= slots) {
        endingFits.push(true);
        slots -= bars;
      }
      else {
        endingFits.push(false);
        for (let j = endingFits.length; j < section.Endings!.length; j++) {
          endingFits.push(false);
        }
        break;
      }
    }
  }

  const anyEndingInline = endingFits.some(Boolean);

  // ── Chord string splitting (only needed for inline endings) ──────────────
  const allMainBars = hasMainChords ? parseBars(rawMainChords) : [];
  const lastRowStartIndex = allMainBars.length - lastRowBarCount;
  const leadingChords = anyEndingInline
    ? allMainBars.slice(0, lastRowStartIndex).join('|')
    : '';
  const lastRowChords = anyEndingInline
    ? allMainBars.slice(lastRowStartIndex).join('|')
    : '';

  // ── Empty main bar (edit or normal mode, no chords) ──────────────────────
  function renderEmptyMainBar() {
    if (!editMode && onBarPress) {
      return (
        <Pressable style={{ flex: 1 }} onPress={() => onBarPress(mainSegmentRef, 0)}>
          <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
            <Text className="text-base text-gray-400 dark:text-gray-600">+ chord</Text>
          </View>
        </Pressable>
      );
    }

    if (editMode && onBeatPress) {
      return (
        <View style={{ flex: 1 }} className="flex-row">
          {Array.from({ length: n }).map((_, bi) => {
            const isActiveBeat
              = isMainActive && activeBarLocalIndex === 0 && activeBeatIndex === bi;
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
                  <Text className="text-sm text-neutral-300 dark:text-neutral-700">—</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      );
    }

    return <View style={{ flex: 1 }} />;
  }

  // ── Last row (handles inline endings when present) ────────────────────────
  function renderLastRow() {
    // Case 1: inline endings — split the last row between main and endings
    if (anyEndingInline) {
      return (
        <View className="flex-row">
          <View style={{ flex: lastRowBarCount }}>
            {/* Spacer matching the ending number label row */}
            <View className="mb-1">
              <Text className="text-xs font-bold text-transparent"> </Text>
            </View>
            {hasMainChords
              ? (
                  <ChordDisplay
                    chordString={lastRowChords}
                    showTimeSignature={index === 0 && leadingChords.length === 0}
                    timeSignature={timeSignature}
                    editMode={editMode}
                    startIndex={lastRowStartIndex}
                    activeBarLocalIndex={isMainActive ? activeBarLocalIndex : undefined}
                    activeBeatIndex={activeBeatIndex}
                    onBeatPress={
                      onBeatPress
                        ? (localBar, bi) => onBeatPress(mainSegmentRef, localBar, bi)
                        : undefined
                    }
                    onBarPress={
                      onBarPress
                        ? localIndex => onBarPress(mainSegmentRef, localIndex)
                        : undefined
                    }
                  />
                )
              : (
            // Empty bar — the first ending's border acts as the closing barline
                  <View className="relative mb-2 flex-row">
                    <View className="absolute top-0 bottom-0 left-0 w-px bg-black dark:bg-white" />
                    <View className="w-px" />
                    {renderEmptyMainBar()}
                  </View>
                )}
          </View>

          <InlineEndingsRow
            section={section}
            sectionIndex={index}
            timeSignature={timeSignature}
            editMode={editMode}
            activeSegment={activeSegment}
            activeBarLocalIndex={activeBarLocalIndex}
            activeBeatIndex={activeBeatIndex}
            onBarPress={onBarPress}
            onBeatPress={onBeatPress}
            endingFits={endingFits}
          />
        </View>
      );
    }

    // Case 2: chords, no inline endings — ChordDisplay owns everything
    if (hasMainChords) {
      return (
        <ChordDisplay
          chordString={rawMainChords}
          showTimeSignature={index === 0}
          timeSignature={timeSignature}
          repeat={showRepeat ? repeatValue : undefined}
          editMode={editMode}
          activeBarLocalIndex={isMainActive ? activeBarLocalIndex : undefined}
          activeBeatIndex={activeBeatIndex}
          onBeatPress={
            onBeatPress
              ? (localBar, bi) => onBeatPress(mainSegmentRef, localBar, bi)
              : undefined
          }
          onBarPress={
            onBarPress
              ? localIndex => onBarPress(mainSegmentRef, localIndex)
              : undefined
          }
        />
      );
    }

    // Case 3: no chords, no inline endings — single empty bar
    return (
      <View className="relative mb-2 flex-row">
        <View className="absolute top-0 bottom-0 left-0 w-px bg-black dark:bg-white" />
        {index === 0 && timeSignature
          ? (
              <View className="items-center justify-center px-1">
                <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
                  {timeSignature.split('/')[0]}
                </Text>
                <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
                  {timeSignature.split('/')[1]}
                </Text>
              </View>
            )
          : (
              <View className="w-px" />
            )}
        {renderEmptyMainBar()}
        {/* Closing bar line */}
        <View className="absolute top-0 right-0 bottom-0 w-px bg-black dark:bg-white" />
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="size-7 items-center justify-center border-2 border-gray-900 dark:border-gray-100">
          <Text className="text-sm font-black text-gray-900 dark:text-white">{label}</Text>
        </View>
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </View>

      {/* Leading rows — only rendered when inline endings force a split */}
      {anyEndingInline && hasMainChords && leadingChords.length > 0 && (
        <ChordDisplay
          chordString={leadingChords}
          showTimeSignature={index === 0}
          timeSignature={timeSignature}
          editMode={editMode}
          activeBarLocalIndex={isMainActive ? activeBarLocalIndex : undefined}
          activeBeatIndex={activeBeatIndex}
          onBeatPress={
            onBeatPress
              ? (localBar, bi) => onBeatPress(mainSegmentRef, localBar, bi)
              : undefined
          }
          onBarPress={
            onBarPress
              ? localIndex => onBarPress(mainSegmentRef, localIndex)
              : undefined
          }
        />
      )}

      {renderLastRow()}

      {hasEndingItems && endingFits.some(f => !f) && (
        <OverflowEndings
          section={section}
          sectionIndex={index}
          timeSignature={timeSignature}
          editMode={editMode}
          activeSegment={activeSegment}
          activeBarLocalIndex={activeBarLocalIndex}
          activeBeatIndex={activeBeatIndex}
          onBarPress={onBarPress}
          onBeatPress={onBeatPress}
          endingFits={endingFits}
        />
      )}
    </View>
  );
}

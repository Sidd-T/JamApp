import type { Section, SegmentRef } from '../standards';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ChordDisplay } from './chord-display';
import { EmptyMainSegment } from './empty-segments';
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

  const mainSegmentRef: SegmentRef = { segment: 'main' };
  const isMainActive = activeSegment?.segment === 'main';

  const repeatValue = !hasEndings ? (section.Repeat ?? 0) : 0;
  const showRepeat = repeatValue >= 1;

  // ── Bar layout ─────────────────────────────────────────────────────────────
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

  // ── Chord splitting (only needed when endings share the last row) ──────────
  const allMainBars = hasMainChords ? parseBars(rawMainChords) : [];
  const lastRowStartIndex = allMainBars.length - lastRowBarCount;
  const leadingChords = anyEndingInline
    ? allMainBars.slice(0, lastRowStartIndex).join('|')
    : '';
  const lastRowChords = anyEndingInline
    ? allMainBars.slice(lastRowStartIndex).join('|')
    : '';

  // ── Shared props for ChordDisplay calls on the main segment ───────────────
  const mainChordDisplayProps = {
    timeSignature,
    editMode,
    activeBarLocalIndex: isMainActive ? activeBarLocalIndex : undefined,
    activeBeatIndex,
    onBeatPress: onBeatPress
      ? (localBar: number, bi: number) => onBeatPress(mainSegmentRef, localBar, bi)
      : undefined,
    onBarPress: onBarPress
      ? (localIndex: number) => onBarPress(mainSegmentRef, localIndex)
      : undefined,
  };

  // ── Last row ───────────────────────────────────────────────────────────────
  function renderLastRow() {
    // Case 1: some endings fit inline — split the row between main and endings
    if (anyEndingInline) {
      return (
        <View className="flex-row items-end">
          <View style={{ flex: lastRowBarCount }}>
            {/* Spacer matching the ending number label height */}
            <View className="mb-1">
              <Text className="text-xs font-bold text-transparent"> </Text>
            </View>
            {hasMainChords
              ? (
                  <ChordDisplay
                    chordString={lastRowChords}
                    showTimeSignature={index === 0 && leadingChords.length === 0}
                    startIndex={lastRowStartIndex}
                    showClosingLine={false}
                    {...mainChordDisplayProps}
                  />
                )
              : (
                  <EmptyMainSegment
                    timeSignature={timeSignature}
                    editMode={editMode}
                    isMainActive={isMainActive}
                    activeBarLocalIndex={isMainActive ? activeBarLocalIndex : undefined}
                    activeBeatIndex={activeBeatIndex}
                    onBarPress={onBarPress}
                    onBeatPress={onBeatPress}
                  />
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

    // Case 2: chords, no inline endings — ChordDisplay owns the whole row
    if (hasMainChords) {
      return (
        <ChordDisplay
          chordString={rawMainChords}
          showTimeSignature={index === 0}
          repeat={showRepeat ? repeatValue : undefined}
          {...mainChordDisplayProps}
        />
      );
    }

    // Case 3: no chords, no inline endings — single empty bar
    return (
      <EmptyMainSegment
        timeSignature={timeSignature}
        editMode={editMode}
        isMainActive={isMainActive}
        activeBarLocalIndex={isMainActive ? activeBarLocalIndex : undefined}
        activeBeatIndex={activeBeatIndex}
        onBarPress={onBarPress}
        onBeatPress={onBeatPress}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View className="mb-6">
      {/* Section label */}
      <View className="mb-2 flex-row items-center gap-2">
        <View className="min-w-7 items-center justify-center border-2 border-gray-900 p-0.5 dark:border-gray-100">
          <Text className="text-sm font-black text-gray-900 dark:text-white">
            {label}
          </Text>
        </View>
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </View>

      {/* Leading rows — only when inline endings force a last-row split */}
      <View key={`leading-${anyEndingInline && leadingChords.length > 0 ? leadingChords : 'none'}`}>
        {anyEndingInline && hasMainChords && leadingChords.length > 0 && (
          <ChordDisplay
            chordString={leadingChords}
            showTimeSignature={index === 0}
            {...mainChordDisplayProps}
          />
        )}
      </View>

      {/* Last row (may include inline endings) */}
      <View key={`last-row-${anyEndingInline ? 'inline' : 'plain'}-${endingFits.length}`}>
        {renderLastRow()}
      </View>

      {/* Overflow endings — those that didn't fit on the last row */}
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

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

  // ── Bar layout ───────────────────────────────────────────────────────────
  // Treat empty main segment as 1 bar so endings/repeat layout is consistent.
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

  // ── Chord string splitting ───────────────────────────────────────────────
  const allMainBars = hasMainChords ? parseBars(rawMainChords) : [];
  const leadingBars = allMainBars.slice(0, mainBarCount - lastRowBarCount);
  const lastRowBars = allMainBars.slice(mainBarCount - lastRowBarCount);
  const leadingChords = leadingBars.join('|');
  const lastRowChords = lastRowBars.join('|');
  const leadingStartIndex = 0;
  const lastRowStartIndex = leadingBars.length;

  const timeSigOnLeading = index === 0 && leadingChords.length > 0;
  const timeSigOnLastRow = index === 0 && leadingChords.length === 0;

  const repeatValue = !hasEndings ? (section.Repeat ?? 0) : 0;
  const showRepeat = repeatValue >= 1;

  // ── Active bar helpers ───────────────────────────────────────────────────
  function leadingActiveBar(): number | undefined {
    if (!isMainActive || activeBarLocalIndex == null)
      return undefined;
    const local = activeBarLocalIndex - leadingStartIndex;
    return local >= 0 && local < leadingBars.length ? local : undefined;
  }

  function lastRowActiveBar(): number | undefined {
    if (!isMainActive || activeBarLocalIndex == null)
      return undefined;
    const local = activeBarLocalIndex - lastRowStartIndex;
    return local >= 0 && local < lastRowBars.length ? local : undefined;
  }

  // ── Opening bar line or time signature ──────────────────────────────────
  function renderOpeningBarLine(showTimeSignature: boolean) {
    if (showTimeSignature) {
      return (
        <View className="mr-0 flex-row items-center">
          <View className="mb-2 h-[80%] w-px bg-black dark:bg-white" />
          <View className="mb-[40%] items-center justify-center px-1">
            <Text className="border-b border-black text-center text-base leading-none font-bold text-black dark:border-white dark:text-white">
              {timeSignature?.split('/')[0]}
            </Text>
            <Text className="text-center text-base leading-none font-bold text-black dark:text-white">
              {timeSignature?.split('/')[1]}
            </Text>
          </View>
        </View>
      );
    }
    return <View className="mb-2 h-[80%] w-px bg-black dark:bg-white" />;
  }

  // ── Closing bar line or repeat barline ──────────────────────────────────
  function renderClosingBarLine() {
    if (showRepeat) {
      return (
        <>
          <View className="flex-row items-center">
            <View className="mr-0.5 w-1.5 items-center justify-center">
              <Text className="text-2xl/5 font-bold text-black dark:text-white">:</Text>
            </View>
            <View className="w-px bg-black dark:bg-white" />
            <View className="mx-0.5 w-px bg-black dark:bg-white" />
          </View>
          {repeatValue > 1 && (
            <Text className="ml-0.5 self-center text-xs font-bold text-black dark:text-white">
              ×
              {repeatValue}
            </Text>
          )}
          <View className="mr-1 w-px bg-black dark:bg-white" />
          <View className="w-px bg-black dark:bg-white" />
        </>
      );
    }
    return <View className="mb-2 w-px bg-black dark:bg-white" />;
  }

  // ── Empty main bar content (no opening/closing barlines) ─────────────────
  // Just the tappable interior. Barlines are always added by the caller so
  // that repeat barlines and ending borders attach correctly.
  function renderEmptyMainBarContent() {
    if (!editMode && onBarPress) {
      return (
        <Pressable style={{ flex: 1 }} onPress={() => onBarPress(mainSegmentRef, 0)}>
          <View className="min-h-10 flex-1 items-start justify-center px-1 py-2">
            <Text className="text-base text-gray-400 dark:text-gray-600">
              + chord
            </Text>
          </View>
        </Pressable>
      );
    }

    if (editMode && onBeatPress) {
      return (
        <View style={{ flex: 1 }} className="flex-row">
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
                    bi < n - 1
                      ? 'border-r border-neutral-200 dark:border-neutral-800'
                      : '',
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
      );
    }

    return <View style={{ flex: 1 }} />;
  }

  // ── Last row ─────────────────────────────────────────────────────────────
  function renderLastRow() {
    // Case 1: some endings fit inline on this row
    if (anyEndingInline) {
      return (
        <View className="flex-row items-stretch">
          {/* Main segment portion of the last row */}
          <View style={{ flex: lastRowBarCount }}>
            {/* Spacer matching the ending number label row */}
            <View className="mb-1">
              <Text className="text-xs font-bold text-transparent"> </Text>
            </View>
            {hasMainChords
              ? (
                  <ChordDisplay
                    chordString={lastRowChords}
                    showTimeSignature={timeSigOnLastRow}
                    timeSignature={timeSignature}
                    editMode={editMode}
                    activeBarLocalIndex={lastRowActiveBar()}
                    activeBeatIndex={activeBeatIndex}
                    onBeatPress={
                      onBeatPress
                        ? (localBar, bi) =>
                            onBeatPress(mainSegmentRef, lastRowStartIndex + localBar, bi)
                        : undefined
                    }
                    onBarPress={
                      onBarPress
                        ? localIndex =>
                          onBarPress(mainSegmentRef, lastRowStartIndex + localIndex)
                        : undefined
                    }
                  />
                )
              : (
                  // Empty bar — opening barline + content only; the first
                  // ending's border-l acts as the closing barline.
                  <View className="mb-1 flex-row items-stretch">
                    {renderOpeningBarLine(timeSigOnLastRow)}
                    {renderEmptyMainBarContent()}
                  </View>
                )}
          </View>

          {/* Inline ending boxes */}
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

    // Case 2: chords exist, no inline endings — ChordDisplay handles barlines
    if (hasMainChords) {
      return (
        <ChordDisplay
          chordString={lastRowChords}
          showTimeSignature={timeSigOnLastRow}
          timeSignature={timeSignature}
          repeat={showRepeat ? repeatValue : undefined}
          editMode={editMode}
          activeBarLocalIndex={lastRowActiveBar()}
          activeBeatIndex={activeBeatIndex}
          onBeatPress={
            onBeatPress
              ? (localBar, bi) =>
                  onBeatPress(mainSegmentRef, lastRowStartIndex + localBar, bi)
              : undefined
          }
          onBarPress={
            onBarPress
              ? localIndex =>
                onBarPress(mainSegmentRef, lastRowStartIndex + localIndex)
              : undefined
          }
        />
      );
    }

    // Case 3: no chords, no inline endings — empty bar with opening + closing barlines
    return (
      <View className="mb-1 flex-row items-stretch">
        {renderOpeningBarLine(timeSigOnLastRow)}
        {renderEmptyMainBarContent()}
        {renderClosingBarLine()}
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="size-7 items-center justify-center border-2 border-gray-900 dark:border-gray-100">
          <Text className="text-sm font-black text-gray-900 dark:text-white">
            {label}
          </Text>
        </View>
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </View>

      {/* Leading rows — only when chords span more than one row */}
      {hasMainChords && leadingChords.length > 0 && (
        <ChordDisplay
          chordString={leadingChords}
          showTimeSignature={timeSigOnLeading}
          timeSignature={timeSignature}
          editMode={editMode}
          activeBarLocalIndex={leadingActiveBar()}
          activeBeatIndex={activeBeatIndex}
          onBeatPress={
            onBeatPress
              ? (localBar, bi) =>
                  onBeatPress(mainSegmentRef, leadingStartIndex + localBar, bi)
              : undefined
          }
          onBarPress={
            onBarPress
              ? localIndex => onBarPress(mainSegmentRef, leadingStartIndex + localIndex)
              : undefined
          }
        />
      )}

      {renderLastRow()}

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

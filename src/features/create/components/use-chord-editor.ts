import { useCallback, useRef, useState } from 'react';

type Selection = {
  start: number;
  end: number;
};

type Params = {
  value: string;
  onChange: (value: string) => void;
};

export function useChordEditor({
  value,
  onChange,
}: Params) {
  const [selection, setSelectionState] = useState<Selection>({
    start: value.length,
    end: value.length,
  });

  // Render-phase sync: when `value` changes for a reason other than our
  // own onChange (e.g. the caller switched to editing a different bar),
  // snap the cursor to the end of the new value immediately, rather than
  // leaving `selection` pointing at an offset that belonged to the
  // previous bar's string until a later effect catches up. This is what
  // was breaking Prev/Next Bar: the input would render for a frame (or
  // longer, if a key press landed first) with a selection computed
  // against the old bar's text length.
  const lastSyncedValueRef = useRef(value);
  if (lastSyncedValueRef.current !== value) {
    lastSyncedValueRef.current = value;
    if (selection.start > value.length || selection.end > value.length) {
      setSelectionState({ start: value.length, end: value.length });
    }
  }

  const lastInsertedRef = useRef<string | null>(null);

  const setSelection = useCallback((next: Selection) => {
    lastSyncedValueRef.current = value;
    setSelectionState(next);
  }, [value]);

  const insertAtCursor = useCallback(
    (text: string) => {
      const { start, end } = selection;

      const updated
        = value.slice(0, start)
          + text
          + value.slice(end);

      onChange(updated);

      const next = start + text.length;

      lastSyncedValueRef.current = updated;
      setSelectionState({
        start: next,
        end: next,
      });

      lastInsertedRef.current = text;
    },
    [value, selection, onChange],
  );

  const backspace = useCallback(() => {
    const { start, end } = selection;

    // selection delete
    if (start !== end) {
      const updated
        = value.slice(0, start)
          + value.slice(end);

      onChange(updated);

      lastSyncedValueRef.current = updated;
      setSelectionState({
        start,
        end: start,
      });

      return;
    }

    if (start === 0)
      return;

    // delete last inserted token (maj7, sus4, etc.)
    const last = lastInsertedRef.current;

    if (last && value.slice(start - last.length, start) === last) {
      const updated
        = value.slice(0, start - last.length)
          + value.slice(start);

      onChange(updated);

      const newPos = start - last.length;

      lastSyncedValueRef.current = updated;
      setSelectionState({
        start: newPos,
        end: newPos,
      });

      lastInsertedRef.current = null;
      return;
    }

    // fallback: single char
    const updated
      = value.slice(0, start - 1)
        + value.slice(start);

    onChange(updated);

    lastSyncedValueRef.current = updated;
    setSelectionState({
      start: start - 1,
      end: start - 1,
    });
  }, [value, selection, onChange]);

  const moveCursorToEnd = useCallback(() => {
    lastSyncedValueRef.current = value;
    setSelectionState({
      start: value.length,
      end: value.length,
    });
  }, [value]);

  return {
    selection,
    setSelection,
    insertAtCursor,
    backspace,
    moveCursorToEnd,
  };
}

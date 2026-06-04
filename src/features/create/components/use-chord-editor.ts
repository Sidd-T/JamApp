import * as React from 'react';

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
  const [selection, setSelection] = React.useState<Selection>({
    start: value.length,
    end: value.length,
  });

  const lastInsertedRef = React.useRef<string | null>(null);

  const insertAtCursor = React.useCallback(
    (text: string) => {
      const { start, end } = selection;

      const updated
        = value.slice(0, start)
          + text
          + value.slice(end);

      onChange(updated);

      const next = start + text.length;

      setSelection({
        start: next,
        end: next,
      });

      lastInsertedRef.current = text;
    },
    [value, selection, onChange],
  );

  const backspace = React.useCallback(() => {
    const { start, end } = selection;

    // selection delete
    if (start !== end) {
      const updated
        = value.slice(0, start)
          + value.slice(end);

      onChange(updated);

      setSelection({
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

      setSelection({
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

    setSelection({
      start: start - 1,
      end: start - 1,
    });
  }, [value, selection, onChange]);

  const moveCursorToEnd = React.useCallback(() => {
    setSelection({
      start: value.length,
      end: value.length,
    });
  }, [value.length]);

  return {
    selection,
    setSelection,
    insertAtCursor,
    backspace,
    moveCursorToEnd,
  };
}

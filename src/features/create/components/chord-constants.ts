export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Rendered in the same row as NOTE_LETTERS.
export const ACCIDENTALS = [
  { key: 'sharp', label: '♯', value: '#' },
  { key: 'flat', label: '♭', value: 'b' },
  // { key: 'comma', label: ',', value: ','}
];

export const QUALITIES = [
  '-',
  'o',
  'ø',
  '+',
  'Δ',
  'sus',
  'add',
  '/',
  '(',
  ')',
];

export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const KEY_CLASS = `my-0 rounded-md bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 shadow-sm`;

export const KEY_TEXT_CLASS = 'text-lg text-black dark:text-white font-semibold';

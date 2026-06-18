import { View } from 'react-native';
import { Text } from '@/components/ui';

/**
 * Parse a raw chord token into its display parts.
 *
 * Examples:
 *   "Abmaj7"  → root:"A", acc:"♭", quality:"△", ext:"7"
 *   "Gbm6"    → root:"G", acc:"♭", quality:"−", ext:"6"
 *   "Cm7b5"   → root:"C", acc:"",  quality:"ø", ext:""
 *   "Bbmaj7"  → root:"B", acc:"♭", quality:"△", ext:"7"
 *   "F#dim"   → root:"F", acc:"♯", quality:"o", ext:""
 *   "Gaug"    → root:"G", acc:"",  quality:"+", ext:""
 *   "Am"      → root:"A", acc:"",  quality:"−", ext:""
 *   "G7"      → root:"G", acc:"",  quality:"",  ext:"7"
 *   "C"       → root:"C", acc:"",  quality:"",  ext:""
 *
 * Accidental detection:
 *   A "b" after the root letter is flat only when it is followed by a known
 *   quality starter, a digit, end-of-string, or another accidental — i.e.
 *   anything that cannot start a second root letter.  This correctly handles:
 *     Ab  →  A♭  (b at end)
 *     Abm →  A♭− (b before quality)
 *     Bb  →  B♭  (b at end)
 *     Bbm →  B♭− (b before quality)
 *   while avoiding treating the second "b" in "Bb" (root B, flat b) as a
 *   quality letter.
 */

const QUALITY_STARTERS = new Set(['m', 'd', 'a', 's', 'j', 'M', 'D', 'A', 'S', 'J']);

function parseChordSymbol(raw: string): {
  root: string;
  accidental: string;
  quality: string;
  extensions: string;
} {
  if (!raw || raw === '%' || raw === ' ‎ ') {
    return { root: raw, accidental: '', quality: '', extensions: '' };
  }

  const rootMatch = raw.match(/^([A-G])/);
  if (!rootMatch) {
    return { root: raw, accidental: '', quality: '', extensions: '' };
  }

  const root = rootMatch[1];
  let rest = raw.slice(1);

  let accidental = '';

  if (rest.startsWith('##') || rest.startsWith('x')) {
    accidental = '𝄪';
    rest = rest.slice(rest.startsWith('x') ? 1 : 2);
  }
  else if (rest.startsWith('#')) {
    accidental = '♯';
    rest = rest.slice(1);
  }
  else if (rest.startsWith('bb')) {
    // double-flat (e.g. Abb) — must check before single-b
    accidental = '𝄫';
    rest = rest.slice(2);
  }
  else if (rest.startsWith('b')) {
    // Flat only when the character after 'b' cannot be another root letter.
    // Root letters: A-G. So "b" is a flat unless followed by A-G (but not
    // if it's at end-of-string or followed by a quality keyword/digit).
    const afterB = rest[1]; // undefined if 'b' is last char
    const isFlatContext
      = afterB === undefined // "Ab", "Bb" etc at end
        || /\d/.test(afterB) // "Ab7"
        || QUALITY_STARTERS.has(afterB) // "Abm", "Abmaj", "Abdim" …
        || afterB === '#' // "Ab#?" – unusual but safe
        || afterB === 'b'; // "Abb" caught above; extra guard

    if (isFlatContext) {
      accidental = '♭';
      rest = rest.slice(1);
    }
  }

  // Half-dim: m7b5 must be checked before the generic "m" quality rule
  const halfDimMatch = rest.match(/^m7b5(.*)$/i);
  if (halfDimMatch) {
    const ext = halfDimMatch[1].replace(/#/g, '♯').replace(/b(?=\d)/g, '♭');
    return { root, accidental, quality: 'ø', extensions: ext };
  }

  let quality = '';

  if (/^maj/i.test(rest)) {
    quality = 'Δ';
    rest = rest.replace(/^maj/i, '');
  }
  else if (/^dim/i.test(rest)) {
    quality = 'o';
    rest = rest.replace(/^dim/i, '');
  }
  else if (/^aug/i.test(rest)) {
    quality = '+';
    rest = rest.replace(/^aug/i, '');
  }
  else if (rest[0] === 'm') {
    // Lowercase m only — uppercase M kept as-is (some charts use M for major)
    quality = '−';
    rest = rest.slice(1);
  }

  // Convert accidentals in extensions (b9, #11, b5 etc.)
  const extensions = rest
    .replace(/#/g, '♯')
    .replace(/b(?=\d)/g, '♭');

  return { root, accidental, quality, extensions };
}

/**
 * Renders a chord symbol with:
 *   - large root letter
 *   - superscript accidental (♯ / ♭)
 *   - subscript quality  (° + − ø △)  +  extensions (7 9 ♯11 …)
 */
export function ChordSymbol({ raw }: { raw: string }) {
  const { root, accidental, quality, extensions } = parseChordSymbol(raw);

  return (
    <View className="flex-row items-center">
      <Text
        className="text-2xl leading-none font-bold text-black dark:text-white"
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.7}
      >
        {root || `${raw}`}
        {' '}
        {/* fallback to raw if parsing fails or no chord */}
      </Text>

      {(accidental || quality || extensions)
        ? (
            <View className="-mt-1 -ml-1.5 h-6 justify-center">
              <Text
                className={`text-lg leading-none font-bold text-black dark:text-white ${
                  accidental ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {accidental}
              </Text>

              <Text className="text-sm leading-none font-bold text-black dark:text-white">
                {quality}
                {extensions}
              </Text>
            </View>
          )
        : null}
    </View>
  );
}

/**
 * Compact chord symbol for the optional (parenthesised) chord shown above
 * the main chord. Everything is rendered at a smaller size, italic.
 */
export function OptionalChordSymbol({ raw }: { raw: string }) {
  const { root, accidental, quality, extensions } = parseChordSymbol(raw);

  return (
    <View className="flex-row items-center">
      <Text className="text-xs leading-none font-bold text-black dark:text-white">
        (
        {root}
      </Text>

      {(accidental || quality || extensions)
        ? (
            <View className="-mt-1 ml-px h-6 justify-center">
              <Text
                className={`text-xs leading-none font-bold text-black dark:text-white ${
                  accidental ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {accidental}
              </Text>

              <Text className="mt-0.5 text-[9px] leading-none font-bold text-black dark:text-white">
                {quality}
                {extensions}
              </Text>
            </View>
          )
        : null}

      <Text className="text-xs leading-none font-bold text-black dark:text-white">
        )
      </Text>
    </View>
  );
}

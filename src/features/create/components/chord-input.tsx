import * as React from 'react';
import { TextInput, useColorScheme, View } from 'react-native';

type Selection = {
  start: number;
  end: number;
};

type Props = {
  value: string;
  selection: Selection;
  onChangeText: (text: string) => void;
  onSelectionChange: (selection: Selection) => void;
};

export function ChordInput({ ref, value, selection, onChangeText, onSelectionChange }: Props & { ref?: React.RefObject<TextInput | null> }) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 0,
        borderRadius: 8,

        borderWidth: 1,
        borderColor: isDark ? '#404040' : '#d4d4d4',

        backgroundColor: isDark ? '#171717' : '#ffffff',

        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },

        elevation: 2,
      }}
    >
      <TextInput
        ref={ref}
        value={value}
        selection={selection}
        onChangeText={onChangeText}
        onSelectionChange={e =>
          onSelectionChange(e.nativeEvent.selection)}
        showSoftInputOnFocus={false}
        autoCorrect={false}
        autoCapitalize="none"
        multiline={false}
        className="font-mono text-lg text-black dark:text-white"
      />
    </View>
  );
}

ChordInput.displayName = 'ChordInput';

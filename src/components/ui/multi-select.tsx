/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { useUniwind } from 'uniwind';
import colors from '@/components/ui/colors';

import { CaretDown } from '@/components/ui/icons';
import { Checkbox } from './checkbox';
import { Modal, useModal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-3',
    label: 'mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-100',
    input:
      'border-grey-50 mt-0 flex-row items-center justify-center rounded-xl border-[0.5px] p-2.5 dark:border-neutral-500 dark:bg-neutral-800',
    inputValue: 'flex-1 text-sm dark:text-neutral-100',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-600',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
        inputValue: 'text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

export type MultiSelectOptionType = { label: string; value: string | number };

type OptionsProps = {
  options: MultiSelectOptionType[];
  onSelect: (option: MultiSelectOptionType) => void;
  selectedValues?: (string | number)[];
  testID?: string;
};

const Option = React.memo(
  ({
    label,
    selected = false,
    onPress,
    testID,
  }: {
    selected?: boolean;
    label: string;
    onPress?: () => void;
    testID?: string;
  }) => {
    return (
      <View className="mb-2 w-1/2 px-1">
        <Checkbox
          checked={selected}
          onChange={() => onPress?.()}
          label={label}
          testID={testID}
          className={`rounded-xl border p-3 ${
            selected
              ? 'border-primary-600 dark:border-primary-400'
              : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
          }`}
          accessibilityLabel={label}
        />
      </View>
    );
  },
);

export function MultiSelectOptions({
  ref,
  options,
  onSelect,
  selectedValues = [],
  testID,
}: OptionsProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const height = options.length * 70 + 100;
  const snapPoints = React.useMemo(() => [height], [height]);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: isDark ? colors.neutral[800] : colors.white,
      }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 8 }}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <View className="flex-row flex-wrap">
          {options.map(option => (
            <Option
              key={`select-item-${option.value}`}
              label={option.label}
              selected={selectedValues.includes(option.value)}
              onPress={() => onSelect(option)}
              testID={testID ? `${testID}-item-${option.value}` : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </Modal>
  );
}

export type MultiSelectProps = {
  values?: (string | number)[];
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: MultiSelectOptionType[];
  onSelect?: (values: (string | number)[]) => void;
  placeholder?: string;
  testID?: string;
};

export function MultiSelect(props: MultiSelectProps) {
  const {
    label,
    values = [],
    error,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    onSelect,
    testID,
  } = props;
  const modal = useModal();

  const onSelectOption = React.useCallback(
    (option: MultiSelectOptionType) => {
      const newValues = values.includes(option.value)
        ? values.filter(v => v !== option.value)
        : [...values, option.value];
      onSelect?.(newValues);
    },
    [values, onSelect],
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled],
  );

  const textValue = React.useMemo(() => {
    if (values.length === 0) {
      return placeholder;
    }
    const labels = values
      .map(v => options.find(opt => opt.value === v)?.label)
      .filter(Boolean);
    return labels.length > 0 ? labels.join(', ') : placeholder;
  }, [values, options, placeholder]);

  return (
    <>
      <View className={styles.container()}>
        {label && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            className={styles.label()}
          >
            {label}
          </Text>
        )}
        <Pressable
          className={styles.input()}
          disabled={disabled}
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          <Text numberOfLines={1} className={styles.inputValue()}>
            {textValue}
          </Text>
          <CaretDown />
        </Pressable>
      </View>
      <MultiSelectOptions
        ref={modal.ref}
        options={options}
        onSelect={onSelectOption}
        selectedValues={values}
        testID={testID}
      />
    </>
  );
}

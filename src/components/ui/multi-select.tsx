/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import {
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import { useUniwind } from 'uniwind';
import colors from '@/components/ui/colors';

import { CaretDown } from '@/components/ui/icons';
import { Modal, useModal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-4',
    label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
    input:
      'border-grey-50 mt-0 flex-row items-center justify-center rounded-xl border-[0.5px] p-3 dark:border-neutral-500 dark:bg-neutral-800',
    inputValue: 'flex-1 dark:text-neutral-100',
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

const List = Platform.OS === 'web' ? FlashList : BottomSheetFlatList;

export type MultiSelectOptionType = { label: string; value: string | number };

type OptionsProps = {
  options: MultiSelectOptionType[];
  onSelect: (option: MultiSelectOptionType) => void;
  selectedValues?: (string | number)[];
  testID?: string;
};

function keyExtractor(item: MultiSelectOptionType) {
  return `select-item-${item.value}`;
}

const Option = React.memo(
  ({
    label,
    selected = false,
    ...props
  }: PressableProps & {
    selected?: boolean;
    label: string;
  }) => {
    return (
      <Pressable
        className={`flex-row items-center border-b p-3 ${
          selected
            ? 'border-neutral-300 bg-blue-100 dark:border-neutral-700 dark:bg-blue-950'
            : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800'
        }`}
        {...props}
      >
        <Text
          className={`flex-1 font-medium ${
            selected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {label}
        </Text>
        {selected && <Check />}
      </Pressable>
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

  const renderSelectItem = React.useCallback(
    ({ item }: { item: MultiSelectOptionType }) => (
      <Option
        key={`select-item-${item.value}`}
        label={item.label}
        selected={selectedValues.includes(item.value)}
        onPress={() => onSelect(item)}
        testID={testID ? `${testID}-item-${item.value}` : undefined}
      />
    ),
    [onSelect, selectedValues, testID],
  );

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: isDark ? colors.neutral[800] : colors.white,
      }}
    >
      <List
        data={options}
        keyExtractor={keyExtractor}
        renderItem={renderSelectItem}
        testID={testID ? `${testID}-modal` : undefined}
        estimatedItemSize={52}
      />
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

function Check({ ...props }: SvgProps) {
  return (
    <Svg
      width={25}
      height={24}
      fill="none"
      viewBox="0 0 25 24"
      {...props}
      className="stroke-black dark:stroke-white"
    >
      <Path
        d="m20.256 6.75-10.5 10.5L4.506 12"
        strokeWidth={2.438}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

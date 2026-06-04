import type { SongSource } from '../standards';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Filter } from '@/components/ui/icons';
import { MultiSelect } from '@/components/ui/multi-select';
import { useThemeConfig } from '@/components/ui/use-theme-config';

type StandardsFilterProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;

  rhythms: (string | number)[];
  onRhythmsChange: (rhythms: (string | number)[]) => void;
  rhythmOptions: string[];

  timeSignatures: string[];
  onTimeSignaturesChange: (sigs: (string | number)[]) => void;
  timeSignatureOptions: string[];

  sources: SongSource[];
  onSourcesChange: (sources: SongSource[]) => void;
};

export function StandardsFilter({
  searchTerm,
  onSearchChange,
  rhythms,
  onRhythmsChange,
  rhythmOptions,
  timeSignatures,
  onTimeSignaturesChange,
  timeSignatureOptions,
  sources,
  onSourcesChange,
}: StandardsFilterProps) {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const theme = useThemeConfig();
  const filterIconColor = theme.dark ? colors.neutral[300] : colors.neutral[800];

  const sourceOptions = [
    { label: 'Jazz Standards', value: 'jazz-standards' },
    { label: 'User Created', value: 'user-created' },
  ];

  // Count active filters
  const activeFilterCount = rhythms.length + timeSignatures.length + sources.length;

  const resetFilters = () => {
    onRhythmsChange([]);
    onTimeSignaturesChange([]);
    onSourcesChange([]);
  };

  return (
    <View className="relative border-b border-neutral-300 bg-neutral-200 px-4 pt-12 pb-4 dark:border-neutral-700 dark:bg-neutral-900">
      {/* Search Bar with Filter Icon */}
      <View className="flex-row items-center gap-2 rounded-3xl border-[0.5px] border-neutral-100 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
        <TextInput
          placeholder="Search by title or composer..."
          value={searchTerm}
          onChangeText={onSearchChange}
          className="flex-1 px-4 py-3 text-base font-medium dark:text-white"
          placeholderTextColor={colors.neutral[400]}
        />
        <Pressable
          onPress={() => setIsFilterModalVisible(true)}
          className="flex-row items-center gap-1 pr-4"
        >
          <Filter width={20} height={20} active={activeFilterCount > 0} color={filterIconColor} />
          {activeFilterCount > 0 && (
            <View className="size-5 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500">
              <Text className="text-xs font-bold text-white">{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Filter Modal - Overlay and Content */}
      {isFilterModalVisible && (
        <View
          className="absolute inset-0 z-50"
          pointerEvents="box-none"
        >
          {/* Overlay */}
          <Pressable
            className="absolute inset-0 min-h-screen min-w-screen"
            onPress={() => setIsFilterModalVisible(false)}
          />

          {/* Modal Content - Top right, below filter icon */}
          <View
            className="absolute top-[90%] right-4 w-3/5 rounded-lg bg-white shadow-2xl dark:bg-neutral-800"
            pointerEvents="auto"
          >
            {/* Modal Header */}
            <View className="border-b border-neutral-200 p-4 dark:border-neutral-700">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold dark:text-neutral-100">Filters</Text>
                <Pressable onPress={() => setIsFilterModalVisible(false)}>
                  <Text className="text-2xl text-neutral-600 dark:text-neutral-300">×</Text>
                </Pressable>
              </View>
            </View>

            {/* Modal Body */}
            <View className="gap-2 px-4 py-2">
              {/* Rhythm Multi-select */}
              <MultiSelect
                label="Rhythm"
                values={rhythms}
                onSelect={onRhythmsChange}
                options={rhythmOptions.map(r => ({ label: r, value: r }))}
                placeholder="Select rhythms..."
                testID="rhythm-select"
              />

              {/* Time Signature Multi-select */}
              <MultiSelect
                label="Time Signature"
                values={timeSignatures}
                onSelect={onTimeSignaturesChange}
                options={timeSignatureOptions.map(sig => ({
                  label: sig,
                  value: sig,
                }))}
                placeholder="Select time signatures..."
                testID="time-signature-select"
              />

              {/* Source Multi-select */}
              <MultiSelect
                label="Source"
                values={sources as (string | number)[]}
                onSelect={(vals) => {
                  onSourcesChange(vals as SongSource[]);
                }}
                options={sourceOptions}
                placeholder="Select sources..."
                testID="source-select"
              />
            </View>

            {/* Modal Footer */}
            <View className="flex-row gap-2 px-4 pb-4">
              <Button
                label="Reset"
                onPress={() => resetFilters()}
                variant="outline"
                className="flex-1"
              />
              <Button
                label="Done"
                onPress={() => setIsFilterModalVisible(false)}
                className="flex-1"
                variant="secondary"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

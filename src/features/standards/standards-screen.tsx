import type { FilterType } from './standards';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { StandardCard, TabFilter } from './components';
import { useStandardsStore } from './use-standards-store';

export function StandardsScreen() {
  const router = useRouter();
  const filter = useStandardsStore(state => state.filter);
  const filteredStandards = useStandardsStore(state => state.filteredStandards);
  const setFilter = useStandardsStore(state => state.setFilter);
  const uniqueRhythms = useStandardsStore(state => state.uniqueRhythms);
  const uniqueKeys = useStandardsStore(state => state.uniqueKeys);
  const uniqueTimeSignatures = useStandardsStore(state => state.uniqueTimeSignatures);

  const filterOptions = useMemo(
    () => [
      { label: 'All', type: 'all' as FilterType, value: '' },
      ...uniqueRhythms.map(rhythm => ({
        label: rhythm,
        type: 'rhythm' as FilterType,
        value: rhythm,
      })),
      ...uniqueKeys.map(key => ({
        label: `Key: ${key}`,
        type: 'key' as FilterType,
        value: key,
      })),
      ...uniqueTimeSignatures.map(sig => ({
        label: sig,
        type: 'timeSignature' as FilterType,
        value: sig,
      })),
    ],
    [uniqueRhythms, uniqueKeys, uniqueTimeSignatures],
  );

  const handleFilterChange = (type: FilterType, value: string) => {
    setFilter(type, value);
  };

  const handleCardPress = (title: string) => {
    router.push(`/standards/${encodeURIComponent(title)}`);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <View className="px-0 pt-4">
        <TabFilter
          options={filterOptions}
          selectedFilter={filter}
          onFilterChange={handleFilterChange}
        />
      </View>

      {filteredStandards.length > 0
        ? (
            <FlashList
              data={filteredStandards}
              renderItem={({ item }) => (
                <View className="px-4">
                  <StandardCard
                    standard={item}
                    onPress={() => handleCardPress(item.Title)}
                  />
                </View>
              )}
              keyExtractor={item => item.Title}
            />
          )
        : (
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                No standards found for the selected filter.
              </Text>
            </View>
          )}
    </View>
  );
}

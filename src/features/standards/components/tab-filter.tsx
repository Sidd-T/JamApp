import type { FilterType } from '../standards';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';

type FilterOption = {
  label: string;
  type: FilterType;
  value: string;
};

type TabFilterProps = {
  options: FilterOption[];
  selectedFilter: { type: FilterType; value: string };
  onFilterChange: (type: FilterType, value: string) => void;
};

export function TabFilter({ options, selectedFilter, onFilterChange }: TabFilterProps) {
  return (
    <View className="mb-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <View className="flex-row gap-2 px-4">
          {options.map((option) => {
            const isSelected
              = selectedFilter.type === option.type && selectedFilter.value === option.value;

            return (
              <Pressable
                key={`${option.type}-${option.value}`}
                onPress={() => onFilterChange(option.type, option.value)}
                className={`rounded-full px-4 py-2 ${
                  isSelected
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

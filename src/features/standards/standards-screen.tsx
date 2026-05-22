import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { StandardCard, StandardsFilter } from './components';
import { useStandardsStore } from './use-standards-store';

export function StandardsScreen() {
  const router = useRouter();
  const filter = useStandardsStore(state => state.filter);
  const filteredStandards = useStandardsStore(state => state.filteredStandards);
  const setSearchTerm = useStandardsStore(state => state.setSearchTerm);
  const setRhythms = useStandardsStore(state => state.setRhythms);
  const setTimeSignatures = useStandardsStore(state => state.setTimeSignatures);
  const setSources = useStandardsStore(state => state.setSources);
  const uniqueRhythms = useStandardsStore(state => state.uniqueRhythms);
  const uniqueTimeSignatures = useStandardsStore(state => state.uniqueTimeSignatures);

  const handleCardPress = (title: string) => {
    router.push(`/standards/${encodeURIComponent(title)}`);
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-800">
      <StandardsFilter
        searchTerm={filter.searchTerm}
        onSearchChange={setSearchTerm}
        rhythms={filter.rhythms}
        onRhythmsChange={setRhythms as (rhythms: (string | number)[]) => void}
        rhythmOptions={uniqueRhythms}
        timeSignatures={filter.timeSignatures}
        onTimeSignaturesChange={setTimeSignatures as (sigs: (string | number)[]) => void}
        timeSignatureOptions={uniqueTimeSignatures}
        sources={filter.sources}
        onSourcesChange={setSources}
      />

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
              className="pt-4"
            />
          )
        : (
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                No standards found for the selected filters.
              </Text>
            </View>
          )}
    </View>
  );
}

import type { Song } from './standards';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { addSetlistSong, removeSetlistSong, useJamsStore } from '../jams/use-jams-store';
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

  const pickMode = useJamsStore.use.pickMode();
  const setPickMode = useJamsStore.use.setPickMode();
  const setlist = useJamsStore.use.setlist();
  const currentRoom = useJamsStore.use.currentRoom();

  // derive added state directly from the store — stays in sync with jams room deletions
  const addedSongs = new Map(setlist.map(e => [e.song.Title, e.entryId]));

  useEffect(() => {
    return () => {
      setPickMode(false);
    };
  }, [setPickMode]);

  const handleCardPress = (title: string) => {
    router.push(`/standards/${encodeURIComponent(title)}`);
  };

  const handleAddToSetlist = async (standard: Song) => {
    const existingEntryId = addedSongs.get(standard.Title);

    if (existingEntryId) {
      await removeSetlistSong(existingEntryId);
    }
    else {
      await addSetlistSong({
        title: standard.Title,
        composer: standard.Composer,
        key: standard.Key ?? undefined,
        rhythm: standard.Rhythm ?? undefined,
        timeSignature: standard.TimeSignature ?? undefined,
      });
    }
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
                    onAdd={pickMode ? () => handleAddToSetlist(item) : undefined}
                    added={addedSongs.has(item.Title)}
                  />
                </View>
              )}
              keyExtractor={item => item.Title}
              contentContainerStyle={pickMode ? { paddingBottom: 72 } : undefined}
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

      {pickMode && (
        <View className="absolute inset-x-6 bottom-4">
          <Button
            label="Return to Jam Room"
            variant="secondary"
            onPress={() => router.push(`/jams/${currentRoom?.id}`)}
            size="lg"
            className="rounded-full border-2 border-primary-900 shadow-xl dark:border-primary-200"
          />
        </View>
      )}
    </View>
  );
}

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Button, colors, FocusAwareStatusBar, SafeAreaView, ScrollView, Text } from '@/components/ui';
import { Edit, Trash } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { useSongsStore } from '@/features/create/use-songs-store';
import { deleteSong } from './use-songs-store';

export function CreateScreen() {
  const router = useRouter();
  const songs = useSongsStore.use.songs();
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const theme = useThemeConfig();

  const handleAddPress = () => {
    router.push('/create/new');
  };

  const handleEditPress = (songId: string) => {
    router.push(`/create/edit?id=${encodeURIComponent(songId)}`);
  };

  const handleDeletePress = async (id: string) => {
    try {
      await deleteSong(id);
      setDeleteConfirmId(null);
    }
    catch (error) {
      console.error('Failed to delete song:', error);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 px-4">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="-mt-6 mb-6">
            <Text className="text-sm text-neutral-600 dark:text-neutral-300">Create and manage your jazz standards</Text>
          </View>

          {/* Add New Song Button */}
          <Button label="+ Add New Song" onPress={handleAddPress} className="mb-6" variant="secondary" />

          {/* Songs List or Empty State */}
          {songs.length === 0
            ? (
                <View className="flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
                  <Text className="text-center text-gray-500">
                    No songs yet.
                    {'\n'}
                    Create your first song to get started!
                  </Text>
                </View>
              )
            : (
                <View className="gap-3">
                  {songs.map(song => (
                    <View
                      key={song.id}
                      className="rounded-xl border border-gray-200 bg-neutral-100 p-4 shadow-md dark:border-gray-800 dark:bg-neutral-800"
                    >
                      {/* Song Header */}
                      <View className="mb-3 flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{song.Title}</Text>
                          <Text className="text-sm text-gray-600 dark:text-gray-400">{song.Composer}</Text>
                        </View>
                      </View>

                      {/* Song Details - Badge Style */}
                      <View className="mb-3 flex-row flex-wrap gap-2">
                        {song.Key && (
                          <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                            <Text className="text-xs text-black dark:text-primary-200">
                              Key:
                              {' '}
                              {song.Key}
                            </Text>
                          </View>
                        )}
                        {song.TimeSignature && (
                          <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                            <Text className="text-xs text-black dark:text-primary-200">
                              {song.TimeSignature}
                            </Text>
                          </View>
                        )}
                        {song.Rhythm && (
                          <View className="rounded-sm bg-primary-100 px-2 py-1 dark:bg-primary-900/30">
                            <Text className="text-xs text-black dark:text-primary-200">
                              {song.Rhythm}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Edit and Delete Buttons */}
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleEditPress(song.id)}
                          className="rounded-lg bg-transparent p-2"
                        >
                          <Edit width={20} height={20} color={theme.dark ? colors.neutral[300] : colors.neutral[500]} />
                        </Pressable>
                        <Pressable
                          onPress={() => setDeleteConfirmId(deleteConfirmId === song.id ? null : song.id)}
                          className="rounded-lg bg-transparent p-2"
                        >
                          <Trash width={20} height={20} color={theme.dark ? colors.neutral[300] : colors.neutral[500]} />
                        </Pressable>
                      </View>

                      {/* Delete Confirmation Buttons */}
                      {deleteConfirmId === song.id && (
                        <View className="mt-2 flex-row gap-2">
                          <Button
                            label="Cancel"
                            onPress={() => setDeleteConfirmId(null)}
                            variant="outline"
                            className="flex-1"
                          />
                          <Button
                            label="Delete"
                            onPress={() => handleDeletePress(song.id)}
                            variant="destructive"
                            className="flex-1"
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
        </SafeAreaView>
      </ScrollView>

      {/* Song form is rendered as its own screen via routing */}
    </>
  );
}

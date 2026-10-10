import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button, colors, FocusAwareStatusBar, SafeAreaView, ScrollView, Text } from '@/components/ui';
import { Edit, Trash } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { useSongsStore } from '@/features/create/use-songs-store';
import { translate } from '@/lib/i18n';
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
    <View className="flex-1 bg-white dark:bg-neutral-800">
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-white dark:bg-neutral-800"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <SafeAreaView className="flex-1">
          <View className="-mt-8 px-4" style={{ backgroundColor: theme.colors.background }}>
            {/* Header */}
            <View className="mb-2">
              <Text className="text-sm text-neutral-600 dark:text-neutral-300">{translate('create.headerSubtitle')}</Text>
            </View>

            {/* Add New Song Button */}
            <Button label={translate('create.addNewSong')} onPress={handleAddPress} className="mt-0 mb-4" variant="secondary" />
          </View>

          {/* Songs List or Empty State */}
          <View className="flex-1 bg-white dark:bg-neutral-800">
            {songs.length === 0
              ? (
                  <View className="mx-2 flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-300 py-12">
                    <Text className="text-center text-neutral-500">
                      {translate('create.emptyState')}
                    </Text>
                  </View>
                )
              : (
                  <View className="gap-1 px-2 pt-2">
                    {songs.map(song => (
                      <Pressable
                        key={song.id}
                        className="rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900"
                        onPress={() => handleEditPress(song.id)}
                      >
                        {/* Song Header */}
                        <View className="mb-1.5 flex-row items-start justify-between">
                          <View className="flex-1 pr-2">
                            <View className="mb-0.5 self-start border-b border-primary-700">
                              <Text className="text-base font-semibold text-neutral-900 dark:text-white">{song.Title}</Text>
                            </View>
                            <Text className="text-sm text-neutral-600 dark:text-neutral-400">{song.Composer}</Text>
                          </View>

                          {/* Edit and Delete Buttons */}
                          <View className="flex-row gap-1">
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
                        </View>

                        {/* Song Details - Badge Style */}
                        <View className="flex-row flex-wrap gap-1.5">
                          {song.Key && (
                            <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                              <Text className="text-xs text-neutral-700 dark:text-neutral-300">
                                {song.Key}
                              </Text>
                            </View>
                          )}
                          {song.TimeSignature && (
                            <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                              <Text className="text-xs text-neutral-700 dark:text-neutral-300">
                                {song.TimeSignature}
                              </Text>
                            </View>
                          )}
                          {song.Rhythm && (
                            <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                              <Text className="text-xs text-neutral-700 dark:text-neutral-300">
                                {song.Rhythm}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Delete Confirmation Buttons */}
                        {deleteConfirmId === song.id && (
                          <Animated.View
                            entering={FadeInUp.duration(250)}
                            className="mt-2 flex-row gap-2"
                          >
                            <Button
                              label={translate('create.cancel')}
                              onPress={() => setDeleteConfirmId(null)}
                              variant="outline"
                              className="flex-1"
                            />
                            <Button
                              label={translate('create.delete')}
                              onPress={() => handleDeletePress(song.id)}
                              variant="destructive"
                              className="flex-1"
                            />
                          </Animated.View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Song form is rendered as its own screen via routing */}
    </View>
  );
}

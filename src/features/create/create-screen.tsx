import type { Song } from '@/features/standards/standards';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { Button, FocusAwareStatusBar, Modal, SafeAreaView, ScrollView, Text, useModal } from '@/components/ui';
import { SongForm } from '@/features/create/components';
import { useSongsStore } from '@/features/create/use-songs-store';
import { addSong, deleteSong, updateSong } from './use-songs-store';

export function CreateScreen() {
  const router = useRouter();
  const songs = useSongsStore.use.songs();
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [editingSongId, setEditingSongId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formModal = useModal();

  const handleAddPress = () => {
    setEditingSongId(null);
    router.push('/create/new');
    // formModal.present();
  };

  const handleEditPress = (songId: string) => {
    setEditingSongId(songId);
    router.push('/create/edit');
    // formModal.present();
  };

  const handleFormSave = async (songData: Omit<Song, 'id'>) => {
    try {
      setIsSubmitting(true);
      if (editingSongId) {
        // Update existing song
        await updateSong(editingSongId, songData);
      }
      else {
        // Create new song
        await addSong(songData);
      }
      formModal.dismiss();
      setEditingSongId(null);
    }
    catch (error) {
      console.error('Failed to save song:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    formModal.dismiss();
    setEditingSongId(null);
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

  const editingSong = editingSongId ? songs.find(s => s.id === editingSongId) : null;
  const songDataForForm = editingSong
    ? {
        Title: editingSong.Title,
        Composer: editingSong.Composer,
        Key: editingSong.Key,
        Rhythm: editingSong.Rhythm,
        TimeSignature: editingSong.TimeSignature,
        Sections: editingSong.Sections,
      }
    : null;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 px-4">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="-mt-8 mb-6">
            <Text className="text-sm text-gray-600">Create and manage your jazz standards</Text>
          </View>

          {/* Add New Song Button */}
          <Button label="+ Add New Song" onPress={handleAddPress} className="mb-6" />

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
                      className="gap-2 rounded-lg border border-gray-200 bg-white p-4"
                    >
                      {/* Song Header with Source Badge */}
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold">{song.Title}</Text>
                          <Text className="text-sm text-gray-600">{song.Composer}</Text>
                        </View>
                        <View className="rounded-sm bg-blue-100 px-2 py-1">
                          <Text className="text-xs font-medium text-blue-700">User Created</Text>
                        </View>
                      </View>

                      {/* Song Details */}
                      <View className="flex-row gap-3 py-2">
                        {song.Key && (
                          <Text className="text-xs text-gray-500">
                            Key:
                            {song.Key}
                          </Text>
                        )}
                        {song.Rhythm && (
                          <Text className="text-xs text-gray-500">
                            Rhythm:
                            {song.Rhythm}
                          </Text>
                        )}
                        {song.TimeSignature && (
                          <Text className="text-xs text-gray-500">
                            Time:
                            {song.TimeSignature}
                          </Text>
                        )}
                      </View>

                      {/* Action Buttons */}
                      <View className="mt-2 flex-row gap-2">
                        <Button
                          label="Edit"
                          onPress={() => handleEditPress(song.id)}
                          variant="outline"
                          className="flex-1"
                        />
                        {deleteConfirmId === song.id
                          ? (
                              <>
                                <Button
                                  label="Confirm"
                                  onPress={() => handleDeletePress(song.id)}
                                  className="flex-1 bg-red-500"
                                />
                                <Button
                                  label="Cancel"
                                  onPress={() => setDeleteConfirmId(null)}
                                  variant="outline"
                                  className="flex-1"
                                />
                              </>
                            )
                          : (
                              <Button
                                label="Delete"
                                onPress={() => setDeleteConfirmId(song.id)}
                                className="flex-1 bg-red-100"
                              />
                            )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
        </SafeAreaView>
      </ScrollView>

      {/* Song Form Modal */}
      <Modal
        ref={formModal.ref}
        snapPoints={['85%']}
        title={editingSong ? 'Edit Song' : 'Create Song'}
      >
        <SongForm
          song={songDataForForm}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isLoading={isSubmitting}
        />
      </Modal>
    </>
  );
}

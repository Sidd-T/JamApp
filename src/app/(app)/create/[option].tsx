import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { SongFormScreen } from '@/features/create/song-form-screen';
import { addSong, updateSong, useSongsStore } from '@/features/create/use-songs-store';

export default function SongFormPage() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = rawId ? decodeURIComponent(rawId) : undefined;

  const songs = useSongsStore.use.songs();
  const editingSong = id ? songs.find(s => s.id === id) : null;

  const songData = editingSong
    ? {
        Title: editingSong.Title,
        Composer: editingSong.Composer,
        Key: editingSong.Key,
        Rhythm: editingSong.Rhythm,
        TimeSignature: editingSong.TimeSignature,
        Sections: editingSong.Sections,
      }
    : null;

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (id)
        await updateSong(id, data);
      else await addSong(data);
      router.back();
    }
    catch (error) {
      console.error('Failed to save song:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  return (
    <SongFormScreen
      song={songData}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isSubmitting}
    />
  );
}

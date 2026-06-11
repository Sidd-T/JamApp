import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { colors } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Trash } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { hydrateJams, leaveRoom, removeSetlistSong, useJamsStore } from './use-jams-store';

export function JamRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const roomId = String(params.id ?? '');
  const theme = useThemeConfig();

  const currentRoom = useJamsStore.use.currentRoom();
  const participants = useJamsStore.use.participants();
  const setlist = useJamsStore.use.setlist();
  const mode = useJamsStore.use.mode();
  const setPickMode = useJamsStore.use.setPickMode();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await hydrateJams();
      setReady(true);
    };
    load();
  }, [roomId]);

  useEffect(() => {
    if (!ready)
      return;
    if (!currentRoom || currentRoom.id !== roomId) {
      router.replace('/jams');
    }
  }, [currentRoom, roomId, ready, router]);

  const handleAddSong = () => {
    setPickMode(true);
    router.push('/standards');
  };

  const handleLeave = async () => {
    setPickMode(false);
    await leaveRoom();
    router.dismissAll();
    router.replace('/jams');
  };

  const handleSetlistEntryPress = (title: string) => {
    router.push(`/standards/${encodeURIComponent(title)}`);
  };

  const handleRemovePress = (entryId: string) => {
    removeSetlistSong(entryId);
  };

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-base text-neutral-600 dark:text-neutral-300">Loading room…</Text>
      </View>
    );
  }

  if (!currentRoom || currentRoom.id !== roomId) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4 dark:bg-black">
        <Text className="text-center text-lg font-semibold text-black dark:text-white">Room not found</Text>
        <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Create or join a room from the Jams home screen.
        </Text>
        <Button className="mt-6" label="Back to Jams" onPress={() => router.replace('/jams')} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6 dark:bg-black">
      <Text className="text-3xl font-bold text-black dark:text-white">{currentRoom.name}</Text>
      <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Code:
        {' '}
        {currentRoom.roomCode}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Host:
        {' '}
        {currentRoom.hostName}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Mode:
        {' '}
        {mode === 'hosting' ? 'Host' : 'Joined'}
      </Text>

      {/* Participants */}
      <View className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Participants</Text>
        {participants.length === 0
          ? <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No participants yet.</Text>
          : participants.map(participant => (
              <View key={participant.id} className="mt-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
                <Text className="font-medium text-black dark:text-white">{participant.displayName}</Text>
                <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Joined at
                  {' '}
                  {new Date(participant.joinedAt).toLocaleTimeString()}
                </Text>
              </View>
            ))}
      </View>

      {/* Setlist */}
      <View className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Setlist</Text>
        {setlist.length === 0
          ? <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No songs added yet.</Text>
          : setlist.map(entry => (
              <Pressable
                key={entry.entryId}
                onPress={() => handleSetlistEntryPress(entry.song.Title)}
                className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-black dark:text-white">
                      {entry.song.Title}
                    </Text>
                    <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {entry.song.Composer}
                    </Text>
                  </View>
                  {mode === 'hosting' && (
                    <Pressable
                      onPress={() => handleRemovePress(entry.entryId)}
                      className="rounded-lg bg-transparent p-2"
                    >
                      <Trash width={20} height={20} color={theme.dark ? colors.neutral[300] : colors.neutral[500]} />
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
      </View>

      {/* Add song */}
      {mode === 'hosting' && (
        <View className="mt-6">
          <Button label="Add song to setlist" onPress={handleAddSong} />
        </View>
      )}

      <Button label="Leave room" variant="destructive" className="mt-6" onPress={handleLeave} />
    </ScrollView>
  );
}

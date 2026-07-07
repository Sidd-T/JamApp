import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { colors } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Trash, User } from '@/components/ui/icons';
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
  const [holdingLeave, setHoldingLeave] = useState(false);

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
    <ScrollView className="flex-1 bg-white p-4 dark:bg-black">
      {/* Header: code + host + leave */}
      <View className="items-center">
        <Text className="text-xs font-medium tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          Room Code
        </Text>
        <Text className="mt-0.5 text-4xl font-extrabold tracking-wide text-black dark:text-white">
          {currentRoom.roomCode}
        </Text>

        <View className="mt-3 flex-row items-center justify-center gap-2">
          <View className="h-9 flex-row items-center rounded-full bg-neutral-100 px-4 dark:bg-neutral-800">
            <Text className="text-sm font-semibold text-black dark:text-white">
              {currentRoom.hostName}
            </Text>
            <Text className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
              ·
              {' '}
              {mode === 'hosting' ? 'Host' : 'Joined'}
            </Text>
          </View>

          {mode === 'hosting'
            ? (
                <Button
                  label={holdingLeave ? 'Keep holding…' : 'Destroy room'}
                  variant="destructive"
                  className={`h-9 justify-center rounded-full px-4 ${holdingLeave ? 'opacity-60' : ''}`}
                  textClassName="text-sm font-semibold"
                  onPressIn={() => setHoldingLeave(true)}
                  onPressOut={() => setHoldingLeave(false)}
                  onLongPress={handleLeave}
                  delayLongPress={600}
                />
              )
            : (
                <Button
                  label="Leave room"
                  variant="secondary"
                  className="h-9 justify-center rounded-full px-4"
                  textClassName="text-sm font-semibold"
                  onPress={handleLeave}
                />
              )}
        </View>

        <Text className="mt-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
          {mode === 'hosting'
            ? 'Hold "Destroy room" to destroy the room'
            : 'You can leave the room at any time'}
        </Text>
      </View>

      {/* Setlist */}
      <View className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Setlist</Text>

        {setlist.map(entry => (
          <Pressable
            key={entry.entryId}
            onPress={() => handleSetlistEntryPress(entry.song.Title)}
            className="mt-2.5 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-black dark:text-white">
                  {entry.song.Title}
                </Text>
                <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
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

        {setlist.length === 0 && (
          <Text className="mt-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            No songs added yet.
          </Text>
        )}

        {/* Add song row, styled as the last list item */}
        {mode === 'hosting' && (
          <Pressable
            onPress={handleAddSong}
            className="mt-2.5 flex-row items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-transparent p-4 active:opacity-60 dark:border-neutral-600"
          >
            <View className="mr-2 size-6 items-center justify-center rounded-full bg-primary-600 shadow-lg">
              <Text className="text-base leading-none font-bold text-white">+</Text>
            </View>
            <Text className="font-medium text-black underline dark:text-white">
              Add song to setlist
            </Text>
          </Pressable>
        )}
      </View>

      {/* Participants */}
      <View className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Participants</Text>

        {participants.length === 0
          ? (
              <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No participants yet.</Text>
            )
          : (
              <View className="mt-2.5 flex-row flex-wrap justify-start">
                {participants.map(participant => (
                  <View
                    key={participant.id}
                    className="mr-2.5 mb-2.5 size-20 justify-between rounded-xl bg-white p-2 shadow-sm dark:bg-neutral-800"
                  >
                    <View className="flex-row items-center gap-1">
                      <User
                        width={15}
                        height={15}
                        color={mode === 'hosting'
                          ? (theme.dark ? colors.primary[500] : colors.primary[600])
                          : (theme.dark ? colors.neutral[300] : colors.neutral[700])}
                      />
                      <Text
                        numberOfLines={1}
                        className="flex-1 text-base font-semibold text-black dark:text-white"
                      >
                        {participant.displayName}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={1}
                      className="text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      {new Date(participant.joinedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
      </View>
    </ScrollView>
  );
}

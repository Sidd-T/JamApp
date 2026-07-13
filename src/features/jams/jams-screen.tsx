import type { ExternalPathString } from 'expo-router';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { translate } from '@/lib/i18n';
import { useProfileStore } from '@/lib/profile';
import { createRoom, hydrateJams, joinRoom, startDiscovery, stopDiscovery, useJamsStore } from './use-jams-store';

export function JamsHomeScreen() {
  const router = useRouter();
  const currentRoom = useJamsStore.use.currentRoom();
  const discoveredRooms = useJamsStore.use.discoveredRooms();

  const profileName = useProfileStore.use.name();
  const [ready, setReady] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const init = async () => {
      await hydrateJams();
      setReady(true);
      if (useJamsStore.getState().networkStatus === 'idle') {
        startDiscovery();
      }
    };

    init();

    return () => {
      stopDiscovery();
    };
  }, []);

  const navigateToRoom = (room: { id: string; name: string }) => {
    router.push({
      pathname: `/jams/${encodeURIComponent(room.id)}` as ExternalPathString,
      params: { name: room.name },
    });
  };

  const handleCreateRoom = async () => {
    try {
      setError('');
      setIsCreating(true);
      navigateToRoom(await createRoom(roomName || translate('jams.home.roomNamePlaceholder'), profileName || translate('jams.room.hostLabel')));
    }
    catch (cause) {
      setError(translate('jams.home.createRoomError'));
      console.error('Create room failed:', cause);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError('');
      setIsJoining(true);
      navigateToRoom(await joinRoom(joinCode, profileName || translate('jams.room.joinedLabel')));
    }
    catch (cause) {
      setError(translate('jams.home.joinRoomError'));
      console.error('Join room failed:', cause);
      setIsJoining(false);
    }
  };

  const handleJoinDiscoveredRoom = async (roomCode: string) => {
    try {
      setError('');
      setIsJoining(true);
      navigateToRoom(await joinRoom(roomCode, profileName || translate('jams.room.joinedLabel')));
    }
    catch (cause) {
      setError(translate('jams.home.joinDiscoveredRoomError'));
      console.error('Join discovered room failed:', cause);
      setIsJoining(false);
    }
  };

  // Reset create/join state when coming back to this screen
  // (needed b/c components stay mounted)
  useFocusEffect(
    useCallback(() => {
      setIsCreating(false);
      setIsJoining(false);
    }, []),
  );

  if (ready) {
    return (
      <ScrollView className="flex-1 bg-white px-4 py-6 dark:bg-neutral-900">
        <View className="-mt-6">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">{translate('jams.home.description')}</Text>
        </View>

        {!currentRoom || isCreating || isJoining
          ? (
              <View>
                <Text className="py-4 text-xl font-bold text-black dark:text-white">{translate('jams.home.createRoomTitle')}</Text>
                <Input
                  label={translate('jams.home.roomNameLabel')}
                  value={roomName}
                  placeholder={translate('jams.home.roomNamePlaceholder')}
                  onChangeText={setRoomName}
                  editable={true}
                />
                <Button label={translate('jams.home.createRoomButton')} onPress={handleCreateRoom} variant="secondary" disabled={isCreating} />

                <Text className="py-4 text-xl font-bold text-black dark:text-white">{translate('jams.home.joinRoomTitle')}</Text>
                <Input
                  label={translate('jams.home.roomCodeLabel')}
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder={translate('jams.home.roomCodePlaceholder')}
                  autoCapitalize="characters"
                />
                <Button label={translate('jams.home.joinRoomButton')} variant="secondary" onPress={handleJoinRoom} disabled={isJoining} />

                {discoveredRooms.length > 0 && (
                  <View className="mt-8">
                    <Text className="text-lg font-semibold text-black dark:text-white">{translate('jams.home.nearbyRoomsTitle')}</Text>
                    <View className="mt-3 space-y-3">
                      {discoveredRooms.map(room => (
                        <View key={`${room.roomCode}-${room.address}`} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                          <Text className="text-base font-semibold text-black dark:text-white">{room.hostName}</Text>
                          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {translate('jams.home.codeLabel')}
                            {room.roomCode}
                          </Text>
                          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                            {translate('jams.home.addressLabel')}
                            {room.address}
                          </Text>
                          <Button label={translate('jams.home.joinButton')} variant="secondary" className="mt-4" onPress={() => handleJoinDiscoveredRoom(room.roomCode)} />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )
          : (
              <View className="mt-6 rounded-3xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900">
                <Text className="text-lg font-semibold text-black dark:text-white">{translate('jams.home.activeRoomTitle')}</Text>
                <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{translate('jams.home.activeRoomDescription')}</Text>
                <Text className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{currentRoom.name}</Text>
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                  {translate('jams.home.codeLabel')}
                  {currentRoom.roomCode}
                </Text>
                <Button
                  label={translate('jams.home.enterRoomButton')}
                  variant="secondary"
                  className="mt-4"
                  onPress={() => router.push({
                    pathname: `/jams/${encodeURIComponent(currentRoom.id)}` as ExternalPathString,
                    params: { name: currentRoom.name },
                  })}
                />
              </View>
            )}

        {error ? <Text className="mt-4 text-sm text-danger-600 dark:text-danger-400">{error}</Text> : null}
      </ScrollView>
    );
  }
}

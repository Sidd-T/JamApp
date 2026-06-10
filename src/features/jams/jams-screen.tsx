import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { createRoom, hydrateJams, joinRoom, startDiscovery, stopDiscovery, useJamsStore } from './use-jams-store';

export function JamsHomeScreen() {
  const router = useRouter();
  const currentRoom = useJamsStore.use.currentRoom();
  const discoveredRooms = useJamsStore.use.discoveredRooms();

  const [roomName, setRoomName] = useState('My Jam Room');
  const [hostName, setHostName] = useState('Host');
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('Player');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const init = async () => {
      await hydrateJams();

      if (useJamsStore.getState().networkStatus === 'idle') {
        startDiscovery();
      }
    };

    init();

    return () => {
      stopDiscovery();
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      setError('');
      setIsCreating(true);
      const room = await createRoom(roomName, hostName);
      router.push(`/jams/${encodeURIComponent(room.id)}`);
    }
    catch (cause) {
      setError('Please enter a valid room name and host name.');
      console.error('Create room failed:', cause);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError('');
      setIsJoining(true);
      const room = await joinRoom(joinCode, displayName);
      router.push(`/jams/${encodeURIComponent(room.id)}`);
    }
    catch (cause) {
      setError('Could not join the room. Make sure the host is available on the local network and that the code is correct.');
      console.error('Join room failed:', cause);
      setIsJoining(false);
    }
  };

  const handleJoinDiscoveredRoom = async (roomCode: string) => {
    try {
      setError('');
      const room = await joinRoom(roomCode, displayName);
      router.push(`/jams/${encodeURIComponent(room.id)}`);
    }
    catch (cause) {
      setError('Could not join the discovered room.');
      console.error('Join discovered room failed:', cause);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6 dark:bg-neutral-900">
      <View className="-mt-6">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">Create a local room or join others on the same network</Text>
      </View>

      {!currentRoom || isCreating || isJoining
        ? (
            <View>
              <Text className="py-4 text-xl font-bold text-black dark:text-white">Create a Room</Text>
              <Input
                label="Room name"
                onChangeText={setRoomName}
                placeholder="My Jam Room"
              />
              <Input
                label="Your name"
                onChangeText={setHostName}
                placeholder="Host"
              />
              <Button label="Create room" onPress={handleCreateRoom} variant="secondary" />

              <Text className="py-4 text-xl font-bold text-black dark:text-white">Join a Room</Text>
              <Input
                label="Room code"
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="ABCD"
                autoCapitalize="characters"
              />
              <Input
                label="Display name"
                onChangeText={setDisplayName}
                placeholder="Player"
              />
              <Button label="Join room" variant="secondary" onPress={handleJoinRoom} />

              {discoveredRooms.length > 0 && (
                <View className="mt-8">
                  <Text className="text-lg font-semibold text-black dark:text-white">Nearby rooms</Text>
                  <View className="mt-3 space-y-3">
                    {discoveredRooms.map(room => (
                      <View key={`${room.roomCode}-${room.address}`} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <Text className="text-base font-semibold text-black dark:text-white">{room.hostName}</Text>
                        <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          Code:
                          {room.roomCode}
                        </Text>
                        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                          Address:
                          {room.address}
                        </Text>
                        <Button label="Join" variant="secondary" className="mt-4" onPress={() => handleJoinDiscoveredRoom(room.roomCode)} />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )
        : (
            <View className="mt-6 rounded-3xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900">
              <Text className="text-lg font-semibold text-black dark:text-white">Active room</Text>
              <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">You are already in an active room. Enter it below.</Text>
              <Text className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{currentRoom.name}</Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                Code:
                {currentRoom.roomCode}
              </Text>
              <Button label="Enter room" variant="secondary" className="mt-4" onPress={() => router.push(`/jams/${encodeURIComponent(currentRoom.id)}`)} />
            </View>
          )}

      {error ? <Text className="mt-4 text-sm text-danger-600 dark:text-danger-400">{error}</Text> : null}
    </ScrollView>
  );
}

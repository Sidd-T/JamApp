import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { addSetlistSong, createRoom, hydrateJams, joinRoom, leaveRoom, startDiscovery, stopDiscovery, useJamsStore } from './use-jams-store';

export function JamsHomeScreen() {
  const router = useRouter();
  const rooms = useJamsStore.use.rooms();
  const currentRoom = useJamsStore.use.currentRoom();
  const mode = useJamsStore.use.mode();
  const discoveredRooms = useJamsStore.use.discoveredRooms();
  const networkStatus = useJamsStore.use.networkStatus();

  const [roomName, setRoomName] = useState('My Jam Room');
  const [hostName, setHostName] = useState('Host');
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('Player');
  const [error, setError] = useState('');

  useEffect(() => {
    hydrateJams();
    startDiscovery();
    return () => {
      stopDiscovery();
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      setError('');
      const room = await createRoom(roomName, hostName);
      router.push(`/jams/${encodeURIComponent(room.id)}`);
    }
    catch (cause) {
      setError('Please enter a valid room name and host name.');
      console.error('Create room failed:', cause);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError('');
      const room = await joinRoom(joinCode, displayName);
      router.push(`/jams/${encodeURIComponent(room.id)}`);
    }
    catch (cause) {
      setError('Could not join the room. Make sure the host is available on the local network and that the code is correct.');
      console.error('Join room failed:', cause);
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

  const sectionTitle = (title: string) => (
    <Text className="mt-6 mb-2 text-lg font-semibold text-black dark:text-white">{title}</Text>
  );

  const roomCard = (room: typeof rooms[number]) => (
    <View key={room.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <Text className="text-base font-semibold text-black dark:text-white">{room.name}</Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Host:
        {room.hostName}
      </Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        Code:
        {room.roomCode}
      </Text>
      <Button
        label="Open"
        variant="secondary"
        className="mt-4"
        onPress={() => router.push(`/jams/${encodeURIComponent(room.id)}`)}
      />
    </View>
  );

  const statusLabel = useMemo(() => {
    if (mode === 'hosting')
      return 'Hosting a room';
    if (mode === 'joined')
      return 'Joined a room';
    if (networkStatus === 'discovering')
      return 'Searching for rooms...';
    if (networkStatus === 'connected')
      return 'Connected to a room';
    if (networkStatus === 'error')
      return 'Network error detected';
    return 'Ready to create or join a room';
  }, [mode, networkStatus]);

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6 dark:bg-black">
      <Text className="text-3xl font-bold text-black dark:text-white">Jams</Text>
      <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Create a local room or join another player on the same network.</Text>
      <Text className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{statusLabel}</Text>

      {sectionTitle('Create a room')}
      <Input
        label="Room name"
        value={roomName}
        onChangeText={setRoomName}
        placeholder="My Jam Room"
      />
      <Input
        label="Your name"
        value={hostName}
        onChangeText={setHostName}
        placeholder="Host"
      />
      <Button label="Create room" onPress={handleCreateRoom} />

      {sectionTitle('Join a room by code')}
      <Input
        label="Room code"
        value={joinCode}
        onChangeText={setJoinCode}
        placeholder="ABCD"
        autoCapitalize="characters"
      />
      <Input
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Player"
      />
      <Button label="Join room" variant="outline" onPress={handleJoinRoom} />

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

      {error ? <Text className="mt-4 text-sm text-danger-600 dark:text-danger-400">{error}</Text> : null}

      {rooms.length > 0 && (
        <View className="mt-8">
          <Text className="text-lg font-semibold text-black dark:text-white">Saved rooms</Text>
          <View className="mt-3 space-y-3">
            {rooms.map(roomCard)}
          </View>
        </View>
      )}

      {currentRoom
        ? (
            <View className="mt-8 rounded-3xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900">
              <Text className="font-semibold text-black dark:text-white">Active room</Text>
              <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{currentRoom.name}</Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                Code:
                {currentRoom.roomCode}
              </Text>
            </View>
          )
        : null}
    </ScrollView>
  );
}

export function JamRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const roomId = String(params.id ?? '');

  const currentRoom = useJamsStore.use.currentRoom();
  const participants = useJamsStore.use.participants();
  const setlist = useJamsStore.use.setlist();
  const mode = useJamsStore.use.mode();

  const [songTitle, setSongTitle] = useState('');
  const [songComposer, setSongComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songRhythm, setSongRhythm] = useState('');
  const [songTimeSignature, setSongTimeSignature] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await hydrateJams();
      setReady(true);
    };

    load();
  }, [roomId]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!currentRoom || currentRoom.id !== roomId) {
      router.replace('/jams');
    }
  }, [currentRoom, roomId, ready, router]);

  const handleAddSong = async () => {
    try {
      setErrorMessage('');
      await addSetlistSong({
        title: songTitle,
        composer: songComposer,
        key: songKey || undefined,
        rhythm: songRhythm || undefined,
        timeSignature: songTimeSignature || undefined,
      });
      setSongTitle('');
      setSongComposer('');
      setSongKey('');
      setSongRhythm('');
      setSongTimeSignature('');
    }
    catch (cause) {
      setErrorMessage('Please fill in a title and composer.');
      console.error('Add song failed:', cause);
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    router.replace('/jams');
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
        <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">Create or join a room from the Jams home screen.</Text>
        <Button className="mt-6" label="Back to Jams" onPress={() => router.replace('/jams')} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6 dark:bg-black">
      <Text className="text-3xl font-bold text-black dark:text-white">{currentRoom.name}</Text>
      <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Code:
        {currentRoom.roomCode}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Host:
        {currentRoom.hostName}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Mode:
        {mode === 'hosting' ? 'Host' : 'Joined'}
      </Text>

      <View className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Participants</Text>
        {participants.length === 0
          ? (
              <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No participants yet.</Text>
            )
          : (
              participants.map(participant => (
                <View key={participant.id} className="mt-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
                  <Text className="font-medium text-black dark:text-white">{participant.displayName}</Text>
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Joined at
                    {new Date(participant.joinedAt).toLocaleTimeString()}
                  </Text>
                </View>
              ))
            )}
      </View>

      <View className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-lg font-semibold text-black dark:text-white">Setlist</Text>
        {setlist.length === 0
          ? (
              <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No songs added yet.</Text>
            )
          : (
              setlist.map((entry, index) => (
                <View key={entry.entryId} className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <Text className="font-semibold text-black dark:text-white">
                    {index + 1}
                    .
                    {' '}
                    {entry.song.Title}
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{entry.song.Composer}</Text>
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Added by
                    {entry.addedBy}
                  </Text>
                </View>
              ))
            )}
      </View>

      <View className="mt-6">
        <Text className="text-lg font-semibold text-black dark:text-white">Add a song</Text>
        <Input label="Title" value={songTitle} onChangeText={setSongTitle} placeholder="Song title" />
        <Input label="Composer" value={songComposer} onChangeText={setSongComposer} placeholder="Composer name" />
        <Input label="Key" value={songKey} onChangeText={setSongKey} placeholder="C, Dm, etc." />
        <Input label="Rhythm" value={songRhythm} onChangeText={setSongRhythm} placeholder="Swing, Ballad" />
        <Input label="Time signature" value={songTimeSignature} onChangeText={setSongTimeSignature} placeholder="4/4" />
        <Button label="Add song to setlist" onPress={handleAddSong} className="mt-2" />
        {errorMessage ? <Text className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errorMessage}</Text> : null}
      </View>

      <Button label="Leave room" variant="destructive" className="mt-6" onPress={handleLeave} />
    </ScrollView>
  );
}

import type {
  JamMode,
  JamNetworkMessage,
  JamParticipant,
  JamRoom,
  JamSetlistEntry,
  NewJamSongPayload,
} from './jams-types';
import type { Song } from '@/features/standards/standards';

import type { LanDiscoveredRoom } from '@/lib/networking/jams-networking';
import { z } from 'zod';
import { create } from 'zustand';
import { createJamNetwork } from '@/lib/networking/jams-networking';
import { getItem, setItem } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const JAM_STORAGE_KEY = 'jam_state';

const createRoomSchema = z.object({
  roomName: z.string().trim().min(1),
  hostName: z.string().trim().min(1),
});

const joinRoomSchema = z.object({
  roomCode: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
});

const newJamSongSchema = z.object({
  title: z.string().trim().min(1),
  composer: z.string().trim().min(1),
  key: z.string().trim().optional(),
  rhythm: z.string().trim().optional(),
  timeSignature: z.string().trim().optional(),
});

type JamPersistedState = {
  currentRoom: JamRoom | null;
  participants: JamParticipant[];
  setlist: JamSetlistEntry[];
  localUserId: string;
  localDisplayName: string;
  mode: JamMode;
  discoveredRooms: LanDiscoveredRoom[];
  networkStatus: 'idle' | 'discovering' | 'hosting' | 'connected' | 'error';
};

type JamStore = JamPersistedState & {
  createRoom: (roomName: string, hostName: string) => Promise<JamRoom>;
  joinRoom: (roomCode: string, displayName: string) => Promise<JamRoom>;
  leaveRoom: () => Promise<void>;
  addSetlistSong: (songData: NewJamSongPayload) => Promise<void>;
  removeSetlistSong: (entryId: string) => Promise<void>;
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const network = createJamNetwork();
let hydrated = false;

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function buildSongPayload(songData: NewJamSongPayload): Song {
  const { title, composer, key, rhythm, timeSignature } = newJamSongSchema.parse(songData);

  return {
    id: generateId('song'),
    Title: title,
    Composer: composer,
    Key: key,
    Rhythm: rhythm,
    TimeSignature: timeSignature,
    Sections: [],
  };
}

const _useJamStore = create<JamStore>((set, get) => ({
  currentRoom: null,
  participants: [],
  setlist: [],
  localUserId: generateId('user'),
  localDisplayName: '',
  mode: 'idle',
  discoveredRooms: [],
  networkStatus: 'idle',

  createRoom: async (roomName, hostName) => {
    if (get().currentRoom) {
      throw new Error('Already in an active room');
    }
    const validated = createRoomSchema.parse({ roomName, hostName });

    await network.stopDiscovery();

    const room: JamRoom = {
      id: generateId('room'),
      name: validated.roomName,
      hostId: get().localUserId,
      hostName: validated.hostName,
      roomCode: generateRoomCode(),
      createdAt: new Date().toISOString(),
    };

    const participant: JamParticipant = {
      id: get().localUserId,
      displayName: validated.hostName,
      joinedAt: new Date().toISOString(),
    };

    const state = get() as JamStore & { rooms?: JamRoom[] };
    const { rooms, ...currentState } = state;

    const nextState = {
      ...currentState,
      currentRoom: room,
      participants: [participant],
      setlist: [],
      localDisplayName: validated.hostName,
      mode: 'hosting' as JamMode,
      networkStatus: 'hosting' as const,
    };

    set(nextState);
    setItem(JAM_STORAGE_KEY, nextState);

    try {
      await network.advertise(room);
    }
    catch (error) {
      console.error('Failed to advertise room:', error);
      set({ networkStatus: 'error' });
    }

    return room;
  },

  joinRoom: async (roomCode, displayName) => {
    if (get().currentRoom) {
      throw new Error('Already in an active room');
    }
    const validated = joinRoomSchema.parse({ roomCode, displayName });
    const discovered = get().discoveredRooms.find(room => room.roomCode === validated.roomCode);

    if (!discovered) {
      throw new Error('Room not found on the local network');
    }

    await network.connectToRoom(discovered);
    set({ networkStatus: 'connected' });

    const room: JamRoom = {
      id: generateId('room'),
      name: `Room ${validated.roomCode}`,
      hostId: `host-${validated.roomCode}`,
      hostName: discovered.hostName,
      roomCode: validated.roomCode,
      createdAt: new Date().toISOString(),
    };

    const participant: JamParticipant = {
      id: get().localUserId,
      displayName: validated.displayName,
      joinedAt: new Date().toISOString(),
    };

    set((state) => {
      const currentState = state as JamStore & { rooms?: JamRoom[] };
      const { rooms, ...rest } = currentState;
      const nextState = {
        ...rest,
        currentRoom: room,
        participants: [participant],
        setlist: [],
        localDisplayName: validated.displayName,
        mode: 'joined' as JamMode,
      };
      setItem(JAM_STORAGE_KEY, nextState);
      return nextState;
    });

    await network.send({
      type: 'join',
      payload: {
        roomCode: validated.roomCode,
        participant,
      },
    });

    return room;
  },

  leaveRoom: async () => {
    if (get().mode === 'hosting') {
      await network.stopAdvertising();
    }
    else {
      await network.closeConnection();
    }
    hydrated = false;
    const state = get() as JamStore & { rooms?: JamRoom[] };
    const { rooms, ...currentState } = state;
    const nextState = {
      ...currentState,
      currentRoom: null,
      participants: [],
      setlist: [],
      mode: 'idle' as JamMode,
      networkStatus: 'idle' as const,
    };

    set(nextState);
    setItem(JAM_STORAGE_KEY, nextState);
  },

  addSetlistSong: async (songData) => {
    const song = buildSongPayload(songData);
    const entry: JamSetlistEntry = {
      entryId: generateId('entry'),
      song,
      addedBy: get().localDisplayName || 'You',
      addedAt: new Date().toISOString(),
    };

    if (get().mode === 'hosting') {
      set((state) => {
        const nextState = {
          ...state,
          setlist: [...state.setlist, entry],
        };
        setItem(JAM_STORAGE_KEY, nextState);
        return nextState;
      });
      await network.send({ type: 'setlistSync', payload: { roomCode: get().currentRoom?.roomCode ?? '', setlist: [...get().setlist, entry] } });
      return;
    }

    if (get().mode === 'joined') {
      await network.send({ type: 'addSong', payload: { roomCode: get().currentRoom?.roomCode ?? '', entry } });
      return;
    }

    throw new Error('Cannot add song when not in a room');
  },

  removeSetlistSong: async (entryId) => {
    if (get().mode === 'hosting') {
      set((state) => {
        const nextSetlist = state.setlist.filter(entry => entry.entryId !== entryId);
        const nextState = {
          ...state,
          setlist: nextSetlist,
        };
        setItem(JAM_STORAGE_KEY, nextState);
        return nextState;
      });
      await network.send({ type: 'setlistSync', payload: { roomCode: get().currentRoom?.roomCode ?? '', setlist: get().setlist.filter(entry => entry.entryId !== entryId) } });
      return;
    }

    if (get().mode === 'joined') {
      await network.send({ type: 'removeSong', payload: { roomCode: get().currentRoom?.roomCode ?? '', entryId } });
      return;
    }

    throw new Error('Cannot remove song when not in a room');
  },

  startDiscovery: async () => {
    if (get().networkStatus !== 'idle') {
      return;
    }

    set({ networkStatus: 'discovering' });
    await network.startDiscovery((room) => {
      set((state) => {
        // Don't show your own hosted room
        if (state.mode === 'hosting' && state.currentRoom?.roomCode === room.roomCode) {
          return state;
        }

        const exists = state.discoveredRooms.some(
          candidate => candidate.roomCode === room.roomCode && candidate.address === room.address && candidate.port === room.port,
        );

        if (exists) {
          return state;
        }

        return {
          ...state,
          discoveredRooms: [...state.discoveredRooms, room],
        };
      });
    });
  },

  stopDiscovery: async () => {
    if (get().networkStatus !== 'discovering') {
      return;
    }

    await network.stopDiscovery();
    set({ networkStatus: 'idle' });
  },

  hydrate: async () => {
    if (hydrated)
      return;
    hydrated = true;

    const stored = getItem<JamPersistedState>(JAM_STORAGE_KEY);
    if (!stored)
      return;

    set({
      currentRoom: stored.currentRoom,
      participants: stored.participants,
      setlist: stored.setlist,
      localUserId: stored.localUserId,
      localDisplayName: stored.localDisplayName,
      mode: stored.mode,
      discoveredRooms: [],
      networkStatus: 'idle', // don't restore network state
    });
    // Don't re-advertise — user must explicitly re-host
  },
}));

function handleNetworkMessage(message: JamNetworkMessage) {
  const state = _useJamStore.getState();

  if (state.mode === 'hosting' && state.currentRoom) {
    if (message.type === 'join' && message.payload.roomCode === state.currentRoom.roomCode) {
      const exists = state.participants.some(participant => participant.id === message.payload.participant.id);
      const participants = exists ? state.participants : [...state.participants, message.payload.participant];
      const nextState = { ...state, participants };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
      network.send({
        type: 'fullSync',
        payload: {
          room: state.currentRoom,
          participants,
          setlist: state.setlist,
        },
      });
      return;
    }

    if (message.type === 'addSong' && message.payload.roomCode === state.currentRoom.roomCode) {
      const nextSetlist = [...state.setlist, message.payload.entry];
      const nextState = { ...state, setlist: nextSetlist };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
      network.send({ type: 'setlistSync', payload: { roomCode: state.currentRoom.roomCode, setlist: nextSetlist } });
      return;
    }

    if (message.type === 'removeSong' && message.payload.roomCode === state.currentRoom.roomCode) {
      const nextSetlist = state.setlist.filter(entry => entry.entryId !== message.payload.entryId);
      const nextState = { ...state, setlist: nextSetlist };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
      network.send({ type: 'setlistSync', payload: { roomCode: state.currentRoom.roomCode, setlist: nextSetlist } });
      return;
    }

    if (message.type === 'leave' && message.payload.roomCode === state.currentRoom.roomCode) {
      const nextParticipants = state.participants.filter(participant => participant.id !== message.payload.participantId);
      const nextState = { ...state, participants: nextParticipants };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
      network.send({
        type: 'fullSync',
        payload: {
          room: state.currentRoom,
          participants: nextParticipants,
          setlist: state.setlist,
        },
      });
      return;
    }
  }

  if (state.mode === 'joined') {
    if (message.type === 'fullSync') {
      _useJamStore.setState({
        currentRoom: message.payload.room,
        participants: message.payload.participants,
        setlist: message.payload.setlist,
      });
      return;
    }

    if (message.type === 'setlistSync') {
      _useJamStore.setState({ setlist: message.payload.setlist });
      return;
    }

    if (message.type === 'join') {
      const nextParticipants = state.participants.some(participant => participant.id === message.payload.participant.id)
        ? state.participants
        : [...state.participants, message.payload.participant];
      const nextState = { ...state, participants: nextParticipants };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
      return;
    }

    if (message.type === 'leave') {
      const nextParticipants = state.participants.filter(participant => participant.id !== message.payload.participantId);
      const nextState = { ...state, participants: nextParticipants };
      setItem(JAM_STORAGE_KEY, nextState);
      _useJamStore.setState(nextState);
    }
  }
}

network.onMessage(handleNetworkMessage);

export const useJamsStore = createSelectors(_useJamStore);

export function createRoom(roomName: string, hostName: string) {
  return _useJamStore.getState().createRoom(roomName, hostName);
}

export function joinRoom(roomCode: string, displayName: string) {
  return _useJamStore.getState().joinRoom(roomCode, displayName);
}

export function leaveRoom() {
  return _useJamStore.getState().leaveRoom();
}

export function addSetlistSong(songData: NewJamSongPayload) {
  return _useJamStore.getState().addSetlistSong(songData);
}

export function removeSetlistSong(entryId: string) {
  return _useJamStore.getState().removeSetlistSong(entryId);
}

export function startDiscovery() {
  return _useJamStore.getState().startDiscovery();
}

export function stopDiscovery() {
  return _useJamStore.getState().stopDiscovery();
}

export function hydrateJams() {
  return _useJamStore.getState().hydrate();
}

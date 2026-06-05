import type { Song } from '@/features/standards/standards';

export type JamRoom = {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  roomCode: string;
  createdAt: string;
};

export type JamParticipant = {
  id: string;
  displayName: string;
  joinedAt: string;
};

export type JamSetlistEntry = {
  entryId: string;
  song: Song;
  addedBy: string;
  addedAt: string;
};

export type NewJamSongPayload = {
  title: string;
  composer: string;
  key?: string;
  rhythm?: string;
  timeSignature?: string;
};

export type JamMode = 'idle' | 'hosting' | 'joined';

export type JamNetworkMessage
  = | { type: 'join'; payload: { roomCode: string; participant: JamParticipant } }
    | { type: 'leave'; payload: { roomCode: string; participantId: string } }
    | { type: 'fullSync'; payload: { room: JamRoom; participants: JamParticipant[]; setlist: JamSetlistEntry[] } }
    | { type: 'setlistSync'; payload: { roomCode: string; setlist: JamSetlistEntry[] } }
    | { type: 'addSong'; payload: { roomCode: string; entry: JamSetlistEntry } }
    | { type: 'removeSong'; payload: { roomCode: string; entryId: string } };

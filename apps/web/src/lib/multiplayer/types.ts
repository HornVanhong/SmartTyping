export type RoomStatus = 'WAITING' | 'READY' | 'RACING' | 'COMPLETED';
export type ParticipantStatus = 'JOINED' | 'READY' | 'RACING' | 'FINISHED' | 'DISCONNECTED';

export interface ParticipantResponse {
  id: string;
  userId: string | null;
  displayName: string;
  avatarColor: string;
  progressCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  finishElapsedMs: number | null;
  finalCpm: number | null;
  finalWpm: number | null;
  placement: number | null;
  status: ParticipantStatus;
}

export interface RoomResponse {
  id: string;
  roomCode: string;
  hostUserId: string;
  locale: 'en' | 'km';
  status: RoomStatus;
  isPrivate: boolean;
  maxPlayers: number;
  passageId: string | null;
  passageContent: string;
  passageTitle: string;
  participants: ParticipantResponse[];
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export type RoomEventType =
  | 'ROOM_UPDATED'
  | 'RACE_STARTED'
  | 'PARTICIPANT_PROGRESS'
  | 'RACE_FINISHED';

export interface RoomEvent<T = any> {
  type: RoomEventType;
  payload: T;
}

export interface RaceProgressPayload {
  roomCode: string;
  progressCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
}

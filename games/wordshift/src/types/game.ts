import type { Timestamp } from "firebase/firestore";

export type GameMode = "DISCOVERY" | "TARGET";
export type RoomStatus = "WAITING" | "ACTIVE" | "ENDED";

export interface Room {
  roomCode: string;
  hostId: string;
  hostName: string;
  startWord: string;
  targetWord?: string;
  mode: GameMode;
  status: RoomStatus;
  timeLimitSeconds: number;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface Player {
  playerId: string;
  name: string;
  joinedAt: Timestamp;
  isHost: boolean;
  isOnline?: boolean;
  lastSeenAt?: Timestamp;
  uniqueWordsDiscovered?: number;
  totalWordsSubmitted?: number;
}

export interface PlayerWord {
  word: string;
  playerId: string;
  playerName: string;
  parentWord: string | null;
  dictionary?: WordDefinition;
  submittedAt: Timestamp;
}

export interface DiscoveredWord {
  word: string;
  firstDiscoveredBy: string;
  firstDiscoveredByName: string;
  firstDiscoveredParentWord?: string | null;
  dictionary?: WordDefinition;
  discoveredAt: Timestamp;
}

export interface PlayerScore {
  playerId: string;
  name: string;
  uniqueWordsDiscovered: number;
  totalWordsSubmitted: number;
}

export interface SubmittedWordValidation {
  ok: boolean;
  message?: string;
  parentWord?: string;
}

export interface WordDefinition {
  word: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
}

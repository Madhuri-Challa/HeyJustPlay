import type { Timestamp } from "firebase/firestore";

export type GameStats = {
  gameId: string;
  displayName: string;
  description: string;
  totalRoomsCreated: number;
  totalPlayersJoined: number;
  averagePlayersPerRoom: number;
  lastPlayedAt?: Timestamp;
  enabled: boolean;
  sortOrder?: number;
};

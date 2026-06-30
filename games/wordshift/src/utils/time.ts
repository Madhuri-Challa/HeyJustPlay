import type { Room } from "../types/game";

export function getRoomTimeRemainingSeconds(room: Pick<Room, "status" | "startedAt" | "timeLimitSeconds">) {
  if (room.status !== "ACTIVE") return room.timeLimitSeconds;
  if (!room.startedAt) return room.timeLimitSeconds;

  const elapsedSeconds = Math.floor((Date.now() - room.startedAt.toMillis()) / 1000);
  return Math.max(room.timeLimitSeconds - elapsedSeconds, 0);
}

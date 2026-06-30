const PLAYER_ID_PREFIX = "heyjustplay";

export function getRoomPlayerIdentityKey(roomCode: string) {
  return `${PLAYER_ID_PREFIX}:${roomCode.trim().toUpperCase()}:playerId`;
}

export function getStoredRoomPlayerId(roomCode: string | undefined) {
  if (!roomCode || typeof window === "undefined") return undefined;

  try {
    return window.localStorage.getItem(getRoomPlayerIdentityKey(roomCode)) ?? undefined;
  } catch {
    return undefined;
  }
}

export function storeRoomPlayerId(roomCode: string, playerId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getRoomPlayerIdentityKey(roomCode), playerId);
  } catch {
    // Storage can be unavailable in private browsing; Firebase auth remains the fallback identity.
  }
}

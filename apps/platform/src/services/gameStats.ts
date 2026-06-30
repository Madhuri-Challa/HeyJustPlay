import { collection, doc, getDocs, increment, runTransaction, serverTimestamp, type Firestore } from "firebase/firestore";
import type { GameStats } from "@packages/shared/src";
import { gameCatalog, type GameCatalogEntry } from "../games/catalog";
import { getFirebaseServices } from "../lib/firebase";

function toFallbackStats(game: GameCatalogEntry): GameStats {
  return {
    gameId: game.gameId,
    displayName: game.displayName,
    description: game.description,
    totalRoomsCreated: 0,
    totalPlayersJoined: 0,
    averagePlayersPerRoom: 0,
    enabled: game.enabled,
    sortOrder: game.sortOrder,
  };
}

function mergeWithCatalog(stats: GameStats[]) {
  const statsByGameId = new Map(stats.map((entry) => [entry.gameId, entry]));
  const catalogBackedStats = gameCatalog.map((game) => ({
    ...toFallbackStats(game),
    ...statsByGameId.get(game.gameId),
    displayName: statsByGameId.get(game.gameId)?.displayName ?? game.displayName,
    description: statsByGameId.get(game.gameId)?.description ?? game.description,
    enabled: statsByGameId.get(game.gameId)?.enabled ?? game.enabled,
    sortOrder: statsByGameId.get(game.gameId)?.sortOrder ?? game.sortOrder,
  }));

  const uncatalogedStats = stats.filter((entry) => !gameCatalog.some((game) => game.gameId === entry.gameId));
  return [...catalogBackedStats, ...uncatalogedStats]
    .filter((entry) => entry.enabled)
    .sort(
      (first, second) =>
        second.totalRoomsCreated - first.totalRoomsCreated ||
        second.averagePlayersPerRoom - first.averagePlayersPerRoom ||
        (first.sortOrder ?? Number.MAX_SAFE_INTEGER) - (second.sortOrder ?? Number.MAX_SAFE_INTEGER),
    );
}

export async function getEnabledGameStats() {
  try {
    const { db } = getFirebaseServices();
    const snapshot = await getDocs(collection(db, "gameStats"));
    const stats = snapshot.docs.map((statsDoc) => {
      const data = statsDoc.data() as Partial<GameStats>;
      return {
        gameId: data.gameId ?? statsDoc.id,
        displayName: data.displayName ?? statsDoc.id,
        description: data.description ?? "",
        totalRoomsCreated: data.totalRoomsCreated ?? 0,
        totalPlayersJoined: data.totalPlayersJoined ?? 0,
        averagePlayersPerRoom: data.averagePlayersPerRoom ?? 0,
        lastPlayedAt: data.lastPlayedAt,
        enabled: data.enabled ?? true,
        sortOrder: data.sortOrder,
      } satisfies GameStats;
    });

    return mergeWithCatalog(stats);
  } catch {
    return mergeWithCatalog([]);
  }
}

function getStatsMetadata(gameId: string) {
  const catalogEntry = gameCatalog.find((game) => game.gameId === gameId);
  return {
    displayName: catalogEntry?.displayName ?? gameId,
    description: catalogEntry?.description ?? "",
    enabled: catalogEntry?.enabled ?? true,
    sortOrder: catalogEntry?.sortOrder,
  };
}

async function updateGameStats(
  db: Firestore,
  gameId: string,
  increments: { roomsCreated?: number; playersJoined?: number },
) {
  const statsRef = doc(db, "gameStats", gameId);
  const metadata = getStatsMetadata(gameId);

  await runTransaction(db, async (transaction) => {
    const statsSnap = await transaction.get(statsRef);
    const current = statsSnap.exists() ? (statsSnap.data() as Partial<GameStats>) : {};
    const totalRoomsCreated = (current.totalRoomsCreated ?? 0) + (increments.roomsCreated ?? 0);
    const totalPlayersJoined = (current.totalPlayersJoined ?? 0) + (increments.playersJoined ?? 0);
    const averagePlayersPerRoom = totalRoomsCreated > 0 ? totalPlayersJoined / totalRoomsCreated : 0;

    transaction.set(
      statsRef,
      {
        gameId,
        displayName: current.displayName ?? metadata.displayName,
        description: current.description ?? metadata.description,
        enabled: current.enabled ?? metadata.enabled,
        ...(current.sortOrder ?? metadata.sortOrder ? { sortOrder: current.sortOrder ?? metadata.sortOrder } : {}),
        totalRoomsCreated: increment(increments.roomsCreated ?? 0),
        totalPlayersJoined: increment(increments.playersJoined ?? 0),
        averagePlayersPerRoom,
        lastPlayedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export async function recordGameRoomCreated(db: Firestore, gameId: string) {
  await updateGameStats(db, gameId, { roomsCreated: 1, playersJoined: 1 });
}

export async function recordGamePlayerJoined(db: Firestore, gameId: string) {
  await updateGameStats(db, gameId, { playersJoined: 1 });
}

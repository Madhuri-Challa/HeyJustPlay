import {
  collection,
  deleteField,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseServices } from "@platform/lib/firebase";
import { recordGamePlayerJoined, recordGameRoomCreated } from "@platform/services/gameStats";
import { getDictionaryDefinition } from "./dictionary";
import type { DiscoveredWord, GameMode, Player, PlayerWord, Room } from "../types/game";
import { generateRoomCode } from "../utils/roomCode";
import { getRoomTimeRemainingSeconds } from "../utils/time";
import { normalizeWord, validateSubmittedWord } from "../utils/wordRules";

const WORDSHIFT_GAME_ID = "wordshift";
const BATCH_WRITE_LIMIT = 450;

export interface CreateRoomInput {
  hostId: string;
  hostName: string;
  startWord: string;
  targetWord?: string;
  mode: GameMode;
  timeLimitSeconds: number;
}

export async function createRoom(input: CreateRoomInput) {
  const { db } = getFirebaseServices();
  let roomCode = generateRoomCode();
  let roomRef = doc(db, "rooms", roomCode);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await getDoc(roomRef);
    if (!existing.exists()) break;
    roomCode = generateRoomCode();
    roomRef = doc(db, "rooms", roomCode);
  }

  const startWord = normalizeWord(input.startWord);
  const targetWord = input.targetWord ? normalizeWord(input.targetWord) : undefined;

  await setDoc(roomRef, {
    roomCode,
    hostId: input.hostId,
    hostName: input.hostName.trim(),
    startWord,
    ...(targetWord ? { targetWord } : {}),
    mode: input.mode,
    status: "WAITING",
    timeLimitSeconds: input.timeLimitSeconds,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "rooms", roomCode, "players", input.hostId), {
    playerId: input.hostId,
    name: input.hostName.trim(),
    joinedAt: serverTimestamp(),
    isHost: true,
    isOnline: true,
    lastSeenAt: serverTimestamp(),
    uniqueWordsDiscovered: 0,
    totalWordsSubmitted: 0,
  });

  await recordGameRoomCreated(db, WORDSHIFT_GAME_ID).catch(() => undefined);

  return roomCode;
}

export async function joinRoom(roomId: string, playerId: string, name: string) {
  const { db } = getFirebaseServices();
  const normalizedRoomId = roomId.trim().toUpperCase();
  const roomRef = doc(db, "rooms", normalizedRoomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) throw new Error("Room not found.");
  const room = roomSnap.data() as Room;
  if (room.status === "ENDED") throw new Error("Game already ended.");
  if (room.status === "ACTIVE" && getRoomTimeRemainingSeconds(room) <= 0) {
    if (room.hostId === playerId) {
      await updateDoc(roomRef, {
        status: "ENDED",
        endedAt: serverTimestamp(),
      });
    }
    throw new Error("Game already ended.");
  }

  const playerRef = doc(db, "rooms", normalizedRoomId, "players", playerId);
  const playerSnap = await getDoc(playerRef);

  if (playerSnap.exists()) {
    await updateDoc(playerRef, {
      name: name.trim(),
      isHost: room.hostId === playerId,
      isOnline: true,
      lastSeenAt: serverTimestamp(),
    });
  } else {
    await setDoc(playerRef, {
      playerId,
      name: name.trim(),
      joinedAt: serverTimestamp(),
      isHost: room.hostId === playerId,
      isOnline: true,
      lastSeenAt: serverTimestamp(),
      uniqueWordsDiscovered: 0,
      totalWordsSubmitted: 0,
    });
  }

  if (!playerSnap.exists()) {
    await recordGamePlayerJoined(db, WORDSHIFT_GAME_ID).catch(() => undefined);
  }

  return normalizedRoomId;
}

export async function updatePlayerPresence(roomId: string, playerId: string, isOnline: boolean) {
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, "rooms", roomId, "players", playerId), {
    isOnline,
    lastSeenAt: serverTimestamp(),
  });
}

async function commitDeletes(db: Firestore, docs: QueryDocumentSnapshot[]) {
  for (let index = 0; index < docs.length; index += BATCH_WRITE_LIMIT) {
    const batch = writeBatch(db);
    docs.slice(index, index + BATCH_WRITE_LIMIT).forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
}

async function clearRoundWords(db: Firestore, roomId: string) {
  const roomWords = await getDocs(collection(db, "rooms", roomId, "words"));
  const players = await getDocs(collection(db, "rooms", roomId, "players"));
  const playerWordsByPlayer = await Promise.all(players.docs.map((playerDoc) => getDocs(collection(playerDoc.ref, "words"))));

  await commitDeletes(db, [...roomWords.docs, ...playerWordsByPlayer.flatMap((snapshot) => snapshot.docs)]);
}

export async function resetRoom(roomId: string, playerId: string, startImmediately = false) {
  const { db } = getFirebaseServices();
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) throw new Error("Room not found.");
  const room = roomSnap.data() as Room;
  if (room.hostId !== playerId) throw new Error("Only the host can reset the room.");

  await clearRoundWords(db, roomId);
  await updateDoc(roomRef, {
    status: startImmediately ? "ACTIVE" : "WAITING",
    startedAt: startImmediately ? serverTimestamp() : deleteField(),
    endedAt: deleteField(),
  });
}

export async function startGame(roomId: string, playerId: string) {
  const { db } = getFirebaseServices();
  await runTransaction(db, async (transaction) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found.");
    const room = roomSnap.data() as Room;
    if (room.hostId !== playerId) throw new Error("Only the host can start the game.");
    if (room.status !== "WAITING") throw new Error("Game cannot be started now.");

    transaction.update(roomRef, {
      status: "ACTIVE",
      startedAt: serverTimestamp(),
    });
  });
}

export async function endGame(roomId: string, playerId: string) {
  const { db } = getFirebaseServices();
  await runTransaction(db, async (transaction) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found.");
    const room = roomSnap.data() as Room;
    if (room.hostId !== playerId) throw new Error("Only the host can end the game.");
    if (room.status === "ENDED") return;

    transaction.update(roomRef, {
      status: "ENDED",
      endedAt: serverTimestamp(),
    });
  });
}

export async function getRoom(roomId: string) {
  const { db } = getFirebaseServices();
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  return roomSnap.exists() ? (roomSnap.data() as Room) : null;
}

export async function getRoomFromServer(roomId: string) {
  const { db } = getFirebaseServices();
  const roomSnap = await getDocFromServer(doc(db, "rooms", roomId));
  return roomSnap.exists() ? (roomSnap.data() as Room) : null;
}

export async function submitWord(
  roomId: string,
  player: Player,
  room: Room,
  playerWords: PlayerWord[],
  rawWord: string,
) {
  const { db } = getFirebaseServices();
  const word = normalizeWord(rawWord);
  if (playerWords.some((entry) => entry.word === word)) {
    throw new Error("Word already submitted.");
  }
  const personalChainWords = [{ word: room.startWord }, ...playerWords];
  const validation = validateSubmittedWord(word, room.startWord, personalChainWords);
  if (!validation.ok || !validation.parentWord) {
    throw new Error(validation.message ?? "Word is not valid.");
  }
  const dictionary = await getDictionaryDefinition(word);

  const playerRef = doc(db, "rooms", roomId, "players", player.playerId);
  const playerWordRef = doc(db, "rooms", roomId, "players", player.playerId, "words", word);
  const discoveredWordRef = doc(db, "rooms", roomId, "words", word);
  await runTransaction(db, async (transaction) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await transaction.get(roomRef);
    const playerWordSnap = await transaction.get(playerWordRef);
    const discoveredWordSnap = await transaction.get(discoveredWordRef);
    if (!roomSnap.exists()) throw new Error("Room not found.");
    const playerSnap = await transaction.get(playerRef);
    if (!playerSnap.exists()) throw new Error("Join this room before submitting words.");
    const latestRoom = roomSnap.data() as Room;
    if (latestRoom.status !== "ACTIVE") throw new Error("Game already ended.");
    if (getRoomTimeRemainingSeconds(latestRoom) <= 0) {
      throw new Error("Game already ended.");
    }
    if (playerWordSnap.exists()) throw new Error("Word already submitted.");

    transaction.set(playerWordRef, {
      word,
      playerId: player.playerId,
      playerName: player.name,
      parentWord: validation.parentWord,
      dictionary,
      submittedAt: serverTimestamp(),
    });

    if (!discoveredWordSnap.exists()) {
      transaction.set(discoveredWordRef, {
        word,
        firstDiscoveredBy: player.playerId,
        firstDiscoveredByName: player.name,
        firstDiscoveredParentWord: validation.parentWord,
        dictionary,
        discoveredAt: serverTimestamp(),
      });
    }

    if (room.mode === "TARGET" && room.targetWord === word) {
      transaction.update(roomRef, {
        status: "ENDED",
        endedAt: serverTimestamp(),
      });
    }
  });
}

export function subscribeRoom(roomId: string, callback: (room: Room | null) => void, onError?: (error: Error) => void): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(
    doc(db, "rooms", roomId),
    (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as Room) : null);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribePlayers(roomId: string, callback: (players: Player[]) => void): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(query(collection(db, "rooms", roomId, "players"), orderBy("joinedAt", "asc")), (snapshot) => {
    callback(snapshot.docs.map((playerDoc) => playerDoc.data() as Player));
  });
}

export function subscribeDiscoveredWords(roomId: string, callback: (words: DiscoveredWord[]) => void): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(collection(db, "rooms", roomId, "words"), (snapshot) => {
    const discoveredWords = snapshot.docs
      .map((wordDoc) => {
        const data = wordDoc.data() as Partial<DiscoveredWord> & {
          ownerPlayerId?: string;
          ownerName?: string;
          parentWord?: string | null;
          createdAt?: DiscoveredWord["discoveredAt"];
        };

        if (data.firstDiscoveredBy) return data as DiscoveredWord;
        if (!data.ownerPlayerId) return null;

        return {
          word: data.word ?? wordDoc.id,
          firstDiscoveredBy: data.ownerPlayerId,
          firstDiscoveredByName: data.ownerName ?? "Unknown",
          firstDiscoveredParentWord: data.parentWord,
          dictionary: data.dictionary,
          discoveredAt: data.createdAt,
        } as DiscoveredWord;
      })
      .filter((word): word is DiscoveredWord => Boolean(word));

    callback(discoveredWords);
  });
}

export function subscribePlayerWords(roomId: string, playerId: string, callback: (words: PlayerWord[]) => void): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(query(collection(db, "rooms", roomId, "players", playerId, "words"), orderBy("submittedAt", "asc")), (snapshot) => {
    callback(snapshot.docs.map((wordDoc) => wordDoc.data() as PlayerWord));
  });
}

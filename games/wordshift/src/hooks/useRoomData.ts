import { useEffect, useMemo, useState } from "react";
import { getRoomFromServer, subscribeDiscoveredWords, subscribePlayers, subscribePlayerWords, subscribeRoom } from "../services/rooms";
import type { DiscoveredWord, Player, PlayerWord, Room } from "../types/game";

export function useRoomData(roomId: string | undefined, playerId?: string) {
  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [discoveredWords, setDiscoveredWords] = useState<DiscoveredWord[]>([]);
  const [playerWordsByPlayer, setPlayerWordsByPlayer] = useState<Record<string, PlayerWord[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return undefined;
    let pollingInterval: number | undefined;

    try {
      const refreshRoomFromServer = () => {
        void getRoomFromServer(roomId)
          .then((latestRoom) => {
            setRoom(latestRoom);
          })
          .catch((pollError) => {
            setError(pollError instanceof Error ? pollError.message : "Could not refresh the room status.");
          });
      };

      const roomUnsubscribe = subscribeRoom(roomId, setRoom, (roomError) => {
        setError(roomError.message);
        setRoom(null);
      });
      const playersUnsubscribe = subscribePlayers(roomId, setPlayers);
      const discoveredWordsUnsubscribe = subscribeDiscoveredWords(roomId, setDiscoveredWords);
      pollingInterval = window.setInterval(refreshRoomFromServer, 1500);
      window.addEventListener("focus", refreshRoomFromServer);
      document.addEventListener("visibilitychange", refreshRoomFromServer);

      return () => {
        if (pollingInterval) window.clearInterval(pollingInterval);
        window.removeEventListener("focus", refreshRoomFromServer);
        document.removeEventListener("visibilitychange", refreshRoomFromServer);
        roomUnsubscribe();
        playersUnsubscribe();
        discoveredWordsUnsubscribe();
      };
    } catch (subscribeError) {
      setError(subscribeError instanceof Error ? subscribeError.message : "Could not connect to the game service.");
      setRoom(null);
      return undefined;
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !players.length) {
      setPlayerWordsByPlayer({});
      return undefined;
    }

    try {
      const unsubscribes = players.map((player) =>
        subscribePlayerWords(roomId, player.playerId, (words) => {
          setPlayerWordsByPlayer((currentWords) => ({
            ...currentWords,
            [player.playerId]: words,
          }));
        }),
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    } catch (subscribeError) {
      setError(subscribeError instanceof Error ? subscribeError.message : "Could not load your words.");
      setPlayerWordsByPlayer({});
      return undefined;
    }
  }, [players, roomId]);

  const playerWords = useMemo(() => (playerId ? (playerWordsByPlayer[playerId] ?? []) : []), [playerId, playerWordsByPlayer]);
  const allPlayerWords = useMemo(() => Object.values(playerWordsByPlayer).flat(), [playerWordsByPlayer]);

  return useMemo(
    () => ({ error, room, players, discoveredWords, playerWords, playerWordsByPlayer, allPlayerWords }),
    [allPlayerWords, discoveredWords, error, playerWords, playerWordsByPlayer, players, room],
  );
}

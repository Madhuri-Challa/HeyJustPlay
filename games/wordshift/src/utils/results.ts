import type { DiscoveredWord, Player, PlayerScore, PlayerWord } from "../types/game";
import { buildChainToWord } from "./chains";

export type PlayerResult = {
  player: Player;
  score: PlayerScore;
  chain: Pick<PlayerWord, "word" | "parentWord">[];
  words: PlayerWord[];
  uniqueWords: DiscoveredWord[];
};

export type LongestChainResult = {
  player: Player;
  chain: Pick<PlayerWord, "word" | "parentWord">[];
};

export function getPlayerChain(playerId: string, playerWordsByPlayer: Record<string, PlayerWord[]>, startWord: string) {
  return [{ word: startWord, parentWord: null }, ...(playerWordsByPlayer[playerId] ?? [])];
}

export function getUniqueWordsByPlayer(playerId: string, discoveredWords: DiscoveredWord[]) {
  return discoveredWords.filter((entry) => entry.firstDiscoveredBy === playerId);
}

export function getAllUniqueWordsGroupedByPlayer(players: Player[], discoveredWords: DiscoveredWord[]) {
  return players.map((player) => ({
    player,
    words: getUniqueWordsByPlayer(player.playerId, discoveredWords),
  }));
}

export function getPlayerResults(
  players: Player[],
  playerWordsByPlayer: Record<string, PlayerWord[]>,
  discoveredWords: DiscoveredWord[],
  startWord: string,
) {
  return players.map<PlayerResult>((player) => {
    const words = playerWordsByPlayer[player.playerId] ?? [];
    const uniqueWords = getUniqueWordsByPlayer(player.playerId, discoveredWords);

    return {
      player,
      score: {
        playerId: player.playerId,
        name: player.name,
        uniqueWordsDiscovered: uniqueWords.length,
        totalWordsSubmitted: words.length,
      },
      chain: getPlayerChain(player.playerId, playerWordsByPlayer, startWord),
      words,
      uniqueWords,
    };
  });
}

export function getLongestChain(
  players: Player[],
  playerWordsByPlayer: Record<string, PlayerWord[]>,
  startWord: string,
): LongestChainResult | null {
  return players.reduce<LongestChainResult | null>((longest, player) => {
    const playerChain = getPlayerChain(player.playerId, playerWordsByPlayer, startWord);
    const longestPlayerChain = playerChain.reduce<Pick<PlayerWord, "word" | "parentWord">[]>((currentLongest, entry) => {
      const chain = buildChainToWord(entry.word, playerChain);
      return chain.length > currentLongest.length ? chain : currentLongest;
    }, []);

    if (!longest || longestPlayerChain.length > longest.chain.length) {
      return {
        player,
        chain: longestPlayerChain,
      };
    }

    return longest;
  }, null);
}

import type { PlayerWord } from "../types/game";

export function buildChainToWord(targetWord: string, words: Pick<PlayerWord, "word" | "parentWord">[]) {
  const byWord = new Map(words.map((entry) => [entry.word, entry]));
  const chain: Pick<PlayerWord, "word" | "parentWord">[] = [];
  let current = byWord.get(targetWord);

  while (current) {
    chain.unshift(current);
    current = current.parentWord ? byWord.get(current.parentWord) : undefined;
  }

  return chain;
}

export function findLongestChain(words: Pick<PlayerWord, "word" | "parentWord">[]) {
  return words.reduce<Pick<PlayerWord, "word" | "parentWord">[]>((longest, entry) => {
    const chain = buildChainToWord(entry.word, words);
    return chain.length > longest.length ? chain : longest;
  }, []);
}

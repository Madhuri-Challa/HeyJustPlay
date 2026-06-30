import type { PlayerWord, SubmittedWordValidation } from "../types/game";

export function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}

export function isAlphabetic(word: string) {
  return /^[a-z]+$/.test(word);
}

export function differsByOneLetter(first: string, second: string) {
  if (first.length !== second.length) return false;

  let differences = 0;
  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) differences += 1;
    if (differences > 1) return false;
  }

  return differences === 1;
}

export function findValidParentWord(candidate: string, acceptedWords: Pick<PlayerWord, "word">[]) {
  return acceptedWords.find((entry) => differsByOneLetter(candidate, entry.word))?.word;
}

export function validateSubmittedWord(
  rawWord: string,
  startWord: string,
  acceptedWords: Pick<PlayerWord, "word">[],
): SubmittedWordValidation {
  const word = normalizeWord(rawWord);

  if (!word) return { ok: false, message: "Enter a word to shift." };
  if (!isAlphabetic(word)) return { ok: false, message: "Word must use letters only." };
  if (word.length !== startWord.length) {
    return { ok: false, message: "Word must be same length as start word." };
  }
  if (acceptedWords.some((entry) => entry.word === word)) {
    return { ok: false, message: "Word already submitted." };
  }
  const parentWord = findValidParentWord(word, acceptedWords);
  if (!parentWord) return { ok: false, message: "Word must change exactly one letter." };

  return { ok: true, parentWord };
}

import type { WordDefinition } from "../types/game";

interface DictionaryApiDefinition {
  definition?: string;
  example?: string;
}

interface DictionaryApiMeaning {
  partOfSpeech?: string;
  definitions?: DictionaryApiDefinition[];
}

interface DictionaryApiEntry {
  word?: string;
  meanings?: DictionaryApiMeaning[];
}

const DICTIONARY_API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

export async function getDictionaryDefinition(word: string): Promise<WordDefinition> {
  const normalizedWord = encodeURIComponent(word.trim().toLowerCase());
  const response = await fetch(`${DICTIONARY_API_BASE_URL}/${normalizedWord}`);

  if (response.status === 404) {
    throw new Error("Word not in dictionary.");
  }

  if (!response.ok) {
    throw new Error("Dictionary lookup failed. Check your internet connection and try again.");
  }

  const entries = (await response.json()) as DictionaryApiEntry[];
  const entry = entries[0];
  const meaning = entry?.meanings?.find((item) => item.partOfSpeech && item.definitions?.[0]?.definition);
  const firstDefinition = meaning?.definitions?.[0];

  if (!entry || !meaning?.partOfSpeech || !firstDefinition?.definition) {
    throw new Error("Word not in dictionary.");
  }

  return {
    word: entry.word ?? word.trim().toLowerCase(),
    partOfSpeech: meaning.partOfSpeech,
    definition: firstDefinition.definition,
    ...(firstDefinition.example ? { example: firstDefinition.example } : {}),
  };
}

import type { GameStats } from "@packages/shared/src";

export type GameCatalogEntry = Pick<GameStats, "gameId" | "displayName" | "description" | "enabled" | "sortOrder"> & {
  route: string;
  accentLetters: string[];
};

export const gameCatalog: GameCatalogEntry[] = [
  {
    gameId: "wordshift",
    displayName: "WordShift",
    description: "Change one letter at a time and race to build the word tree.",
    enabled: true,
    sortOrder: 1,
    route: "/wordshift",
    accentLetters: ["W", "O", "R", "D", "S", "H", "I", "F", "T"],
  },
];

export function getGameCatalogEntry(gameId: string) {
  return gameCatalog.find((game) => game.gameId === gameId);
}

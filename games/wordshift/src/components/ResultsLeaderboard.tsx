import type { DiscoveredWord, Player, PlayerScore, PlayerWord } from "../types/game";

function getPlayerScore(player: Player, discoveredWords: DiscoveredWord[], playerWords: PlayerWord[]): PlayerScore {
  return {
    playerId: player.playerId,
    name: player.name,
    uniqueWordsDiscovered: player.uniqueWordsDiscovered ?? discoveredWords.filter((entry) => entry.firstDiscoveredBy === player.playerId).length,
    totalWordsSubmitted: player.totalWordsSubmitted ?? playerWords.length,
  };
}

export function ResultsLeaderboard({
  players,
  discoveredWords,
  playerWordsByPlayer,
}: {
  players: Player[];
  discoveredWords: DiscoveredWord[];
  playerWordsByPlayer: Record<string, PlayerWord[]>;
}) {
  const rows = players
    .map((player) => {
      const playerWords = playerWordsByPlayer[player.playerId] ?? [];
      return {
        player,
        score: getPlayerScore(player, discoveredWords, playerWords),
        words: playerWords,
      };
    })
    .sort(
      (first, second) =>
        second.score.uniqueWordsDiscovered - first.score.uniqueWordsDiscovered ||
        second.score.totalWordsSubmitted - first.score.totalWordsSubmitted,
    );

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <div key={row.player.playerId} className="rounded-lg border border-line bg-ink/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">#{index + 1}</p>
              <h3 className="text-lg font-black text-white">{row.player.name}</h3>
            </div>
            <div className="grid gap-2 text-right sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Unique</p>
                <p className="font-mono text-3xl font-black text-mint">{row.score.uniqueWordsDiscovered}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Total</p>
                <p className="font-mono text-3xl font-black text-white">{row.score.totalWordsSubmitted}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {row.words.map((entry) => (
              <span key={entry.word} className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
                {entry.word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

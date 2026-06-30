import type { PlayerResult } from "../utils/results";

function WordList({ emptyLabel, words }: { emptyLabel: string; words: string[] }) {
  if (!words.length) {
    return <p className="text-sm font-semibold text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <span className="text-slate-500">→</span> : null}
          <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-200">{word}</span>
        </span>
      ))}
    </div>
  );
}

export function ResultsLeaderboard({
  rows,
}: {
  rows: PlayerResult[];
}) {
  const sortedRows = [...rows]
    .sort(
      (first, second) =>
        second.score.uniqueWordsDiscovered - first.score.uniqueWordsDiscovered ||
        second.score.totalWordsSubmitted - first.score.totalWordsSubmitted,
    );

  return (
    <div className="grid gap-3">
      {sortedRows.map((row, index) => (
        <div key={row.player.playerId} className="rounded-lg border border-line bg-ink/55 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
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

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase text-slate-400">Chain</p>
              <WordList emptyLabel="No submitted words." words={row.chain.map((entry) => entry.word)} />
            </div>
            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase text-slate-400">Unique discoveries</p>
              <div className="flex flex-wrap gap-2">
                {row.uniqueWords.length ? (
                  row.uniqueWords.map((entry) => (
                    <span key={entry.word} className="rounded-md bg-mint/15 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-mint">
                      {entry.word}
                    </span>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-slate-400">No first discoveries.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

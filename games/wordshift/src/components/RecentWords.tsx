import type { PlayerWord } from "../types/game";

export function RecentWords({ words }: { words: PlayerWord[] }) {
  const recent = words.slice(-12).reverse();

  if (!recent.length) {
    return <p className="rounded-lg border border-line bg-ink/50 px-3 py-4 text-center text-sm font-semibold text-slate-300">Your discovered words will appear here.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {recent.map((entry) => (
        <div key={entry.word} className="rounded-lg border border-line bg-ink/50 px-3 py-3 text-center">
          <p className="font-mono text-lg font-black uppercase tracking-widest text-white">{entry.word}</p>
          {entry.dictionary?.partOfSpeech ? <p className="mt-1 text-xs font-bold uppercase text-mint">{entry.dictionary.partOfSpeech}</p> : null}
        </div>
      ))}
    </div>
  );
}

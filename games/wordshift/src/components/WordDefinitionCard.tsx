import type { WordDefinition } from "../types/game";

export function WordDefinitionCard({ definition }: { definition: WordDefinition }) {
  return (
    <div className="rounded-lg border border-mint/40 bg-mint/10 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-lg font-black uppercase tracking-widest text-white">{definition.word}</p>
        <span className="rounded-md bg-mint/20 px-2 py-1 text-xs font-bold uppercase text-mint">{definition.partOfSpeech}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">{definition.definition}</p>
      {definition.example ? <p className="mt-2 text-sm italic leading-6 text-slate-300">"{definition.example}"</p> : null}
    </div>
  );
}

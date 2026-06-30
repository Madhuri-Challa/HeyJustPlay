import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { ResultsLeaderboard } from "../components/ResultsLeaderboard";
import { useRoomData } from "../hooks/useRoomData";
import { buildChainToWord } from "../utils/chains";
import { getAllUniqueWordsGroupedByPlayer, getLongestChain, getPlayerResults } from "../utils/results";

function ArrowWordList({ words }: { words: string[] }) {
  if (!words.length) {
    return <p className="text-sm font-semibold text-slate-400">None</p>;
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

export function ResultsPage() {
  const { roomId } = useParams();
  const { error, room, players, discoveredWords, playerWordsByPlayer } = useRoomData(roomId);

  if (!roomId) return <Navigate to="/" replace />;
  if (room === undefined) return <p className="py-10 text-center text-slate-300">Loading results...</p>;
  if (!room) {
    return (
      <Card className="mx-auto grid max-w-md gap-4 text-center">
        <h1 className="text-2xl font-black text-white">{error ? "Setup needed" : "Room not found"}</h1>
        {error ? <p className="text-sm font-semibold text-slate-300">{error}</p> : null}
        <Link className="rounded-lg bg-mint px-5 py-3 text-sm font-bold text-ink" to="/">
          Home
        </Link>
      </Card>
    );
  }

  const scoreRows = getPlayerResults(players, playerWordsByPlayer, discoveredWords, room.startWord);
  const uniqueWordsWinner = [...scoreRows].sort((first, second) => second.score.uniqueWordsDiscovered - first.score.uniqueWordsDiscovered)[0];
  const totalWordsWinner = [...scoreRows].sort((first, second) => second.score.totalWordsSubmitted - first.score.totalWordsSubmitted)[0];
  const longestChainWinner = getLongestChain(players, playerWordsByPlayer, room.startWord);
  const targetFinder = room.targetWord ? discoveredWords.find((entry) => entry.word === room.targetWord) : undefined;
  const targetFinderWords = targetFinder ? (playerWordsByPlayer[targetFinder.firstDiscoveredBy] ?? []) : [];
  const targetChain = targetFinder ? buildChainToWord(targetFinder.word, [{ word: room.startWord, parentWord: null }, ...targetFinderWords]) : [];
  const uniqueWordsByPlayer = getAllUniqueWordsGroupedByPlayer(players, discoveredWords);

  return (
    <div className="grid gap-5">
      <Card className="grid gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Results</p>
        <h1 className="text-4xl font-black text-white">Game complete</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Unique Words Winner</p>
            <p className="mt-1 text-lg font-black text-white">{uniqueWordsWinner?.score.uniqueWordsDiscovered ? uniqueWordsWinner.player.name : "None"}</p>
            <p className="font-mono text-2xl font-black text-mint">{uniqueWordsWinner?.score.uniqueWordsDiscovered ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Total Words Winner</p>
            <p className="mt-1 text-lg font-black text-white">{totalWordsWinner?.score.totalWordsSubmitted ? totalWordsWinner.player.name : "None"}</p>
            <p className="font-mono text-2xl font-black text-mint">{totalWordsWinner?.score.totalWordsSubmitted ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Longest Chain Winner</p>
            <p className="mt-1 text-lg font-black text-white">{longestChainWinner && longestChainWinner.chain.length > 1 ? longestChainWinner.player.name : "None"}</p>
            <p className="font-mono text-2xl font-black text-mint">{longestChainWinner ? Math.max(longestChainWinner.chain.length - 1, 0) : 0}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Total unique words</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">{discoveredWords.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Longest chain</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">{longestChainWinner ? Math.max(longestChainWinner.chain.length - 1, 0) : 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Target finder</p>
            <p className="mt-1 text-lg font-black text-white">{targetFinder?.firstDiscoveredByName ?? "None"}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:flex">
          <Link to="/create" className="min-h-12 rounded-lg bg-mint px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-emerald-300">
            New Room
          </Link>
          <Link to={`/join/${room.roomCode}`} className="min-h-12 rounded-lg bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/15">
            Play Again
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-black text-white">Leaderboard</h2>
        <ResultsLeaderboard rows={scoreRows} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">All Unique Words by Discoverer</h2>
          <span className="text-xs font-bold uppercase text-slate-400">{discoveredWords.length} total</span>
        </div>
        <div className="grid gap-4">
          {uniqueWordsByPlayer.map(({ player, words }) => (
            <div key={player.playerId} className="rounded-lg border border-line bg-ink/45 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-bold text-white">{player.name}</h3>
                <span className="text-xs font-bold uppercase text-slate-400">{words.length} unique</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {words.length ? (
                  words.map((entry) => (
                    <span key={entry.word} className="rounded-md bg-mint/15 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-mint">
                      {entry.word}
                    </span>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-slate-400">No first discoveries.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-black text-white">Longest Chain</h2>
        {longestChainWinner ? <p className="mb-3 text-sm font-semibold text-slate-300">{longestChainWinner.player.name}</p> : null}
        <ArrowWordList words={longestChainWinner?.chain.map((entry) => entry.word) ?? []} />
      </Card>

      {targetChain.length ? (
        <Card>
          <h2 className="mb-4 text-xl font-black text-white">Target Chain</h2>
          <ArrowWordList words={targetChain.map((entry) => entry.word)} />
        </Card>
      ) : null}
    </div>
  );
}

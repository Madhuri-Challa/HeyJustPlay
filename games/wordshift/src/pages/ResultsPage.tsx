import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { ResultsLeaderboard } from "../components/ResultsLeaderboard";
import { useRoomData } from "../hooks/useRoomData";
import type { Player, PlayerScore, PlayerWord } from "../types/game";
import { findLongestChain, buildChainToWord } from "../utils/chains";

function getPlayerScore(player: Player, playerWords: PlayerWord[], uniqueWordsDiscovered: number): PlayerScore {
  return {
    playerId: player.playerId,
    name: player.name,
    uniqueWordsDiscovered: player.uniqueWordsDiscovered ?? uniqueWordsDiscovered,
    totalWordsSubmitted: player.totalWordsSubmitted ?? playerWords.length,
  };
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

  const scoreRows = players
    .map((player) => {
      const playerWords = playerWordsByPlayer[player.playerId] ?? [];
      const uniqueWordsDiscovered = discoveredWords.filter((entry) => entry.firstDiscoveredBy === player.playerId).length;
      return {
        player,
        score: getPlayerScore(player, playerWords, uniqueWordsDiscovered),
        words: playerWords,
      };
    });
  const uniqueWordsWinner = [...scoreRows].sort((first, second) => second.score.uniqueWordsDiscovered - first.score.uniqueWordsDiscovered)[0];
  const totalWordsWinner = [...scoreRows].sort((first, second) => second.score.totalWordsSubmitted - first.score.totalWordsSubmitted)[0];
  const longestChain = scoreRows.reduce<Pick<PlayerWord, "word" | "parentWord">[]>((longest, row) => {
    const chain = findLongestChain([{ word: room.startWord, parentWord: null }, ...row.words]);
    return chain.length > longest.length ? chain : longest;
  }, []);
  const targetFinder = room.targetWord ? discoveredWords.find((entry) => entry.word === room.targetWord) : undefined;
  const targetFinderWords = targetFinder ? (playerWordsByPlayer[targetFinder.firstDiscoveredBy] ?? []) : [];
  const targetChain = targetFinder ? buildChainToWord(targetFinder.word, [{ word: room.startWord, parentWord: null }, ...targetFinderWords]) : [];

  return (
    <div className="grid gap-5">
      <Card className="grid gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Results</p>
        <h1 className="text-4xl font-black text-white">Game complete</h1>
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Total unique words</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">{discoveredWords.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Longest chain</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">{Math.max(longestChain.length - 1, 0)}</p>
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
        <ResultsLeaderboard discoveredWords={discoveredWords} playerWordsByPlayer={playerWordsByPlayer} players={players} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">All Unique Words</h2>
          <span className="text-xs font-bold uppercase text-slate-400">{discoveredWords.length} total</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {discoveredWords.map((entry) => (
            <span key={entry.word} className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
              {entry.word}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-black text-white">Longest Chain</h2>
        <div className="flex flex-wrap gap-2">
          {longestChain.map((entry) => (
            <span key={entry.word} className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
              {entry.word}
            </span>
          ))}
        </div>
      </Card>

      {targetChain.length ? (
        <Card>
          <h2 className="mb-4 text-xl font-black text-white">Target Chain</h2>
          <div className="flex flex-wrap gap-2">
            {targetChain.map((entry) => (
              <span key={entry.word} className="rounded-md bg-mint/15 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-mint">
                {entry.word}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

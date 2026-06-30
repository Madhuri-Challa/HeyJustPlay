import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import type { GameStats } from "@packages/shared/src";
import { getGameCatalogEntry } from "../games/catalog";
import { getEnabledGameStats } from "../services/gameStats";

function formatRooms(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "room" : "rooms"}`;
}

function formatAveragePlayers(average: number) {
  const formattedAverage = Number.isInteger(average) ? average.toString() : average.toFixed(1);
  return `Avg ${formattedAverage} ${average === 1 ? "player" : "players"}`;
}

export function LandingPage() {
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState<GameStats[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const inviteRoomCode = searchParams.get("room")?.trim().toUpperCase();

  useEffect(() => {
    let ignore = false;

    getEnabledGameStats()
      .then((stats) => {
        if (!ignore) setGames(stats);
      })
      .finally(() => {
        if (!ignore) setLoadingGames(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (inviteRoomCode) {
    return <Navigate to={`/join/${inviteRoomCode}`} replace />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="grid gap-6 py-8 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-mint">Game room</p>
        <div className="grid max-w-3xl gap-4">
          <h1 className="text-5xl font-black leading-tight text-white sm:text-7xl">Hey Just Play</h1>
          <p className="text-xl font-semibold text-slate-300 sm:text-2xl">Pick a game and start a room.</p>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">Popular with teams</p>
            <h2 className="mt-2 text-3xl font-black text-white">Most Played Games</h2>
          </div>
          <span className="hidden rounded-md border border-line bg-white/10 px-3 py-2 text-xs font-black uppercase text-slate-200 sm:inline-flex">Most played</span>
        </div>

        {loadingGames ? (
          <div className="rounded-lg border border-line bg-card p-5 text-sm font-semibold text-slate-300">Loading popular games...</div>
        ) : null}

        {!loadingGames && !games.length ? (
          <div className="rounded-lg border border-line bg-card p-5 text-sm font-semibold text-slate-300">No games are available yet.</div>
        ) : null}

        {games.length ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
            <div className="flex min-w-full snap-x gap-4">
              {games.map((game) => {
                const catalogEntry = getGameCatalogEntry(game.gameId);
                const route = catalogEntry?.route ?? "/";
                const accentLetters = catalogEntry?.accentLetters ?? game.displayName.slice(0, 9).toUpperCase().split("");

                return (
                  <article
                    key={game.gameId}
                    className="group grid min-h-[25rem] w-[18rem] shrink-0 snap-start content-between overflow-hidden rounded-lg border border-line bg-card shadow-2xl shadow-black/20 transition hover:border-mint/70 hover:bg-ink/80 sm:w-[21rem]"
                  >
                    <div className="grid gap-4 p-5">
                      <div className="grid aspect-[1.25] place-items-center rounded-lg border border-line bg-ink/60">
                        <div className="grid grid-cols-3 gap-1">
                          {accentLetters.map((letter, index) => (
                            <span
                              key={`${letter}-${index}`}
                              className="grid size-10 place-items-center rounded-md bg-white/10 font-mono text-sm font-black text-mint"
                            >
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-2xl font-black text-white">{game.displayName}</h3>
                          <span className="rounded-md bg-coral/20 px-2 py-1 text-xs font-black uppercase text-rose-100">Trending now</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{game.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-line bg-ink/55 p-3">
                          <p className="text-xs font-bold uppercase text-slate-400">Rooms</p>
                          <p className="mt-1 font-mono text-lg font-black text-white">{formatRooms(game.totalRoomsCreated)}</p>
                        </div>
                        <div className="rounded-lg border border-line bg-ink/55 p-3">
                          <p className="text-xs font-bold uppercase text-slate-400">Players</p>
                          <p className="mt-1 font-mono text-lg font-black text-white">{formatAveragePlayers(game.averagePlayersPerRoom)}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={route}
                      className="m-5 mt-0 min-h-12 rounded-lg bg-mint px-5 py-3 text-center text-sm font-black uppercase text-ink transition group-hover:bg-emerald-300"
                    >
                      Play Now
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

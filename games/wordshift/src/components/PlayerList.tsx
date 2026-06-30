import type { Player } from "../types/game";

const OFFLINE_AFTER_MS = 45000;

function isPlayerOffline(player: Player, now: number) {
  if (player.isOnline === false) return true;
  if (!player.lastSeenAt) return false;
  return now - player.lastSeenAt.toMillis() > OFFLINE_AFTER_MS;
}

export function PlayerList({ now = Date.now(), players }: { now?: number; players: Player[] }) {
  return (
    <div className="grid gap-2">
      {players.map((player) => {
        const offline = isPlayerOffline(player, now);

        return (
          <div key={player.playerId} className="flex items-center justify-between rounded-lg border border-line bg-ink/50 px-3 py-3">
            <span className={`font-semibold ${offline ? "text-slate-400" : "text-white"}`}>{player.name}</span>
            <span className="flex items-center gap-2">
              {offline ? <span className="text-xs font-bold uppercase text-slate-500">Offline</span> : null}
              {player.isHost ? <span className="text-xs font-bold uppercase text-mint">Host</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

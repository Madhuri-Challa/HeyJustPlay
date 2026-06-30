import type { Player } from "../types/game";

export function PlayerList({ players }: { players: Player[] }) {
  return (
    <div className="grid gap-2">
      {players.map((player) => (
        <div key={player.playerId} className="flex items-center justify-between rounded-lg border border-line bg-ink/50 px-3 py-3">
          <span className="font-semibold text-white">{player.name}</span>
          {player.isHost ? <span className="text-xs font-bold uppercase text-mint">Host</span> : null}
        </div>
      ))}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PlayerList } from "../components/PlayerList";
import { QRCodeBox } from "../components/QRCodeBox";
import { RecentWords } from "../components/RecentWords";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Timer } from "../components/Timer";
import { WordInput } from "../components/WordInput";
import { WordDefinitionCard } from "../components/WordDefinitionCard";
import { useAnonymousAuth } from "../hooks/useAnonymousAuth";
import { useRoomData } from "../hooks/useRoomData";
import { endGame, startGame, submitWord } from "../services/rooms";

export function RoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAnonymousAuth();
  const { error: roomError, room, players, playerWords } = useRoomData(roomId, user?.uid);
  const [message, setMessage] = useState<string | null>(null);

  const currentPlayer = useMemo(() => players.find((player) => player.playerId === user?.uid), [players, user?.uid]);
  const isHost = Boolean(user && room?.hostId === user.uid);
  const joinLink = `${window.location.origin}/join/${roomId ?? ""}`;
  const latestDefinedWord = [...playerWords].reverse().find((entry) => entry.dictionary)?.dictionary;

  const handleExpire = useCallback(() => {
    if (roomId && room?.status === "ACTIVE") void endGame(roomId);
  }, [room?.status, roomId]);

  useEffect(() => {
    if (!roomId) return;
    if (room?.status === "ACTIVE" && !location.pathname.endsWith("/play")) {
      navigate(`/room/${roomId}/play`, { replace: true });
    } else if (room?.status === "ENDED" && !location.pathname.endsWith("/results")) {
      navigate(`/room/${roomId}/results`, { replace: true });
    }
  }, [location.pathname, navigate, room?.status, roomId]);

  if (!roomId) return <Navigate to="/" replace />;
  if (authLoading || room === undefined) return <p className="py-10 text-center text-slate-300">Loading room...</p>;
  if (!room) {
    return (
      <Card className="mx-auto grid max-w-md gap-4 text-center">
        <h1 className="text-2xl font-black text-white">{roomError ? "Setup needed" : "Room not found"}</h1>
        {roomError ? <p className="text-sm font-semibold text-slate-300">{roomError}</p> : null}
        <Link className="rounded-lg bg-mint px-5 py-3 text-sm font-bold text-ink" to="/join">
          Join another game
        </Link>
      </Card>
    );
  }
  if (room.status === "ENDED") return <Navigate to={`/room/${roomId}/results`} replace />;
  if (room.status === "ACTIVE" && !location.pathname.endsWith("/play")) {
    return <Navigate to={`/room/${roomId}/play`} replace />;
  }

  if (room.status === "WAITING") {
    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="grid content-start gap-4">
          <RoomCodeBadge code={room.roomCode} />
          <QRCodeBox value={joinLink} />
          <div className="rounded-lg border border-line bg-ink/50 p-3">
            <p className="text-xs font-bold uppercase text-slate-400">Join link</p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-200">{joinLink}</p>
          </div>
          {isHost ? (
            <Button disabled={players.length === 0} onClick={() => void startGame(roomId)}>
              Start Game
            </Button>
          ) : (
            <p className="rounded-lg border border-line bg-ink/50 px-3 py-3 text-center font-semibold text-slate-300">Waiting for host to start...</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Waiting Room</h1>
            <span className="font-mono text-sm font-bold text-mint">{players.length} joined</span>
          </div>
          <PlayerList players={players} />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 sm:grid-cols-4">
        <Card className="sm:col-span-1">
          <p className="text-xs font-bold uppercase text-slate-400">Start</p>
          <p className="mt-1 font-mono text-3xl font-black uppercase tracking-widest text-white">{room.startWord}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-bold uppercase text-slate-400">Timer</p>
          <Timer durationSeconds={room.timeLimitSeconds} onExpire={handleExpire} startedAt={room.startedAt} />
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-bold uppercase text-slate-400">Your words</p>
          <p className="mt-1 font-mono text-3xl font-black text-white">{playerWords.length}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-bold uppercase text-slate-400">Mode</p>
          <p className="mt-1 text-lg font-black text-white">{room.mode === "TARGET" ? "Target" : "Discovery"}</p>
          {room.targetWord ? <p className="font-mono text-sm font-bold uppercase tracking-widest text-mint">{room.targetWord}</p> : null}
        </Card>
      </section>

      <Card className="grid gap-4">
        <WordInput
          disabled={!currentPlayer}
          onSubmit={async (word) => {
            setMessage(null);
            if (!currentPlayer) {
              setMessage("Join this room before submitting words.");
              return;
            }
            try {
              await submitWord(roomId, currentPlayer, room, playerWords, word);
              setMessage("Accepted.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not submit word.");
            }
          }}
        />
        {message ? <p className="rounded-lg border border-line bg-ink/50 px-3 py-2 text-sm font-semibold text-slate-200">{message}</p> : null}
        {latestDefinedWord ? <WordDefinitionCard definition={latestDefinedWord} /> : null}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Recent Words</h2>
          <span className="text-xs font-bold uppercase text-slate-400">Only yours</span>
        </div>
        <RecentWords words={playerWords} />
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAnonymousAuth } from "../hooks/useAnonymousAuth";
import { getRoomFromServer, joinRoom } from "../services/rooms";
import { storeRoomPlayerId } from "../utils/playerIdentity";
import { getRoomTimeRemainingSeconds } from "../utils/time";

export function JoinGamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAnonymousAuth();
  const [code, setCode] = useState(roomCode ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roomStatusMessage, setRoomStatusMessage] = useState<string | null>(null);
  const [joinBlocked, setJoinBlocked] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (roomCode) setCode(roomCode.toUpperCase());
  }, [roomCode]);

  useEffect(() => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setRoomStatusMessage(null);
      setJoinBlocked(false);
      return undefined;
    }

    let ignore = false;
    const timeout = window.setTimeout(() => {
      void getRoomFromServer(normalizedCode)
        .then((room) => {
          if (ignore) return;
          if (!room) {
            setRoomStatusMessage(null);
            setJoinBlocked(false);
            return;
          }

          if (room.status === "ENDED" || (room.status === "ACTIVE" && getRoomTimeRemainingSeconds(room) <= 0)) {
            setRoomStatusMessage("This game has ended. You can view results, but joining is closed.");
            setJoinBlocked(true);
            return;
          }

          setRoomStatusMessage(room.status === "ACTIVE" ? "Game is already active. Join now to start playing." : "Room found. Enter your name to join.");
          setJoinBlocked(false);
        })
        .catch(() => {
          if (ignore) return;
          setRoomStatusMessage(null);
          setJoinBlocked(false);
        });
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [code]);

  async function handleJoin() {
    setError(null);
    if (!user) {
      setError("Connecting to Firebase. Try again in a moment.");
      return;
    }
    if (!code.trim()) {
      setError("Enter a room code.");
      return;
    }
    if (!name.trim()) {
      setError("Enter a display name.");
      return;
    }
    if (joinBlocked) {
      setError("This game has ended.");
      return;
    }

    setJoining(true);
    try {
      const roomId = await joinRoom(code, user.uid, name);
      storeRoomPlayerId(roomId, user.uid);
      navigate(`/room/${roomId}`);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Could not join room.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Player entry</p>
        <h1 className="mt-2 text-3xl font-black text-white">Join Game</h1>
      </div>
      <Card className="grid gap-4">
        <Input
          autoCapitalize="characters"
          autoComplete="off"
          label="Room code"
          maxLength={6}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="ABC123"
          value={code}
        />
        <Input
          autoComplete="name"
          enterKeyHint={"join" as never}
          inputMode="text"
          label="Display name"
          maxLength={24}
          onChange={(event) => setName(event.target.value)}
          placeholder="Player"
          type="text"
          value={name}
        />
        {roomStatusMessage ? <p className="rounded-lg border border-line bg-ink/50 px-3 py-2 text-sm font-semibold text-slate-200">{roomStatusMessage}</p> : null}
        {authError || error ? <p className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-semibold text-rose-100">{authError ?? error}</p> : null}
        <Button disabled={authLoading || joining || joinBlocked} onClick={() => void handleJoin()}>
          Join
        </Button>
        {joinBlocked && code.trim() ? (
          <Link className="rounded-lg bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/15" to={`/room/${code.trim().toUpperCase()}/results`}>
            View results
          </Link>
        ) : null}
      </Card>
    </div>
  );
}

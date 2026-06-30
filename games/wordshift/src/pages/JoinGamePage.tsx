import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAnonymousAuth } from "../hooks/useAnonymousAuth";
import { joinRoom } from "../services/rooms";

export function JoinGamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAnonymousAuth();
  const [code, setCode] = useState(roomCode ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (roomCode) setCode(roomCode.toUpperCase());
  }, [roomCode]);

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

    setJoining(true);
    try {
      const roomId = await joinRoom(code, user.uid, name);
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
          enterKeyHint="done"
          inputMode="text"
          label="Display name"
          maxLength={24}
          onChange={(event) => setName(event.target.value)}
          placeholder="Player"
          type="text"
          value={name}
        />
        {authError || error ? <p className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-semibold text-rose-100">{authError ?? error}</p> : null}
        <Button disabled={authLoading || joining} onClick={() => void handleJoin()}>
          Join
        </Button>
      </Card>
    </div>
  );
}

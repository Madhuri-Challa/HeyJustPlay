import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAnonymousAuth } from "../hooks/useAnonymousAuth";
import { createRoom } from "../services/rooms";
import type { GameMode } from "../types/game";
import { isAlphabetic, normalizeWord } from "../utils/wordRules";

const timeOptions = [
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
];

export function CreateGamePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAnonymousAuth();
  const [hostName, setHostName] = useState("");
  const [startWord, setStartWord] = useState("");
  const [mode, setMode] = useState<GameMode>("DISCOVERY");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300);
  const [targetWord, setTargetWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setError(null);
    const normalizedStart = normalizeWord(startWord);
    const normalizedTarget = normalizeWord(targetWord);

    if (!user) {
      setError("Connecting to Firebase. Try again in a moment.");
      return;
    }
    if (!hostName.trim()) {
      setError("Enter a host display name.");
      return;
    }
    if (!isAlphabetic(normalizedStart) || ![4, 5].includes(normalizedStart.length)) {
      setError("Start word must be a 4- or 5-letter word.");
      return;
    }
    if (mode === "TARGET" && (!isAlphabetic(normalizedTarget) || normalizedTarget.length !== normalizedStart.length)) {
      setError("Target word must use letters only and match the start word length.");
      return;
    }

    setCreating(true);
    try {
      const roomId = await createRoom({
        hostId: user.uid,
        hostName,
        startWord: normalizedStart,
        targetWord: mode === "TARGET" ? normalizedTarget : undefined,
        mode,
        timeLimitSeconds,
      });
      navigate(`/room/${roomId}`);
    } catch {
      setError("Could not create the room. Check Firebase setup and try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Host setup</p>
        <h1 className="mt-2 text-3xl font-black text-white">Create Game</h1>
      </div>
      <Card className="grid gap-4">
        <Input
          autoComplete="name"
          enterKeyHint="done"
          inputMode="text"
          label="Host display name"
          maxLength={24}
          onChange={(event) => setHostName(event.target.value)}
          placeholder="Ramu"
          type="text"
          value={hostName}
        />
        <Input label="Start word" maxLength={5} onChange={(event) => setStartWord(event.target.value)} placeholder="ABLE" value={startWord} />

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-slate-200">Game mode</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setMode("DISCOVERY")} type="button" variant={mode === "DISCOVERY" ? "primary" : "secondary"}>
              Discovery Mode
            </Button>
            <Button onClick={() => setMode("TARGET")} type="button" variant={mode === "TARGET" ? "primary" : "secondary"}>
              Target Word Mode
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-slate-200">Time limit</p>
          <div className="grid grid-cols-3 gap-2">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setTimeLimitSeconds(option.value)}
                type="button"
                variant={timeLimitSeconds === option.value ? "primary" : "secondary"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {mode === "TARGET" ? (
          <Input label="Target word" maxLength={5} onChange={(event) => setTargetWord(event.target.value)} placeholder="ABOUT" value={targetWord} />
        ) : null}

        {authError || error ? <p className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-semibold text-rose-100">{authError ?? error}</p> : null}
        <Button disabled={authLoading || creating} onClick={() => void handleCreate()}>
          Create Room
        </Button>
      </Card>
    </div>
  );
}

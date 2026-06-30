import { useState } from "react";
import { Button } from "./Button";

export function WordInput({ disabled, onSubmit }: { disabled?: boolean; onSubmit: (word: string) => Promise<void> }) {
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!word.trim()) return;
    setBusy(true);
    try {
      await onSubmit(word);
      setWord("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <input
        className="min-h-14 rounded-lg border border-line bg-ink/70 px-4 py-3 text-center text-xl font-black uppercase tracking-[0.16em] text-white outline-none transition placeholder:text-slate-600 focus:border-mint"
        disabled={disabled || busy}
        autoComplete="off"
        enterKeyHint="go"
        inputMode="text"
        maxLength={5}
        onChange={(event) => setWord(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void submit();
        }}
        placeholder="WORD"
        type="text"
        value={word}
      />
      <Button disabled={disabled || busy} onClick={() => void submit()}>
        Submit
      </Button>
    </div>
  );
}

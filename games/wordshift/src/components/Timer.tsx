import { useEffect, useMemo, useState } from "react";
import type { Timestamp } from "firebase/firestore";

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Timer({
  startedAt,
  durationSeconds,
  onExpire,
}: {
  startedAt?: Timestamp;
  durationSeconds: number;
  onExpire?: () => void;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!startedAt) return durationSeconds;
    const elapsed = Math.floor((now - startedAt.toMillis()) / 1000);
    return Math.max(durationSeconds - elapsed, 0);
  }, [durationSeconds, now, startedAt]);

  useEffect(() => {
    if (remainingSeconds === 0) onExpire?.();
  }, [onExpire, remainingSeconds]);

  return <span className="font-mono text-3xl font-black text-mint">{formatSeconds(remainingSeconds)}</span>;
}

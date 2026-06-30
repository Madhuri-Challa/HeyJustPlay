import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { ensureAnonymousUser } from "@platform/lib/firebase";

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureAnonymousUser()
      .then(setUser)
      .catch((authError) => {
        setError(authError instanceof Error ? authError.message : "Could not connect to the game service. Check Firebase configuration.");
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}

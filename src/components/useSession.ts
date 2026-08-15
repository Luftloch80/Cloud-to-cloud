"use client";

import { useEffect, useState } from "react";

type SessionPayload = {
  authenticated: boolean;
  apple: { id: string; email?: string; name?: string } | null;
  dropbox: { connected: boolean; email?: string; displayName?: string };
  folder: { path: string; name: string } | null;
  dropboxConfigured: boolean;
};

export function useSession() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading, setSession };
}

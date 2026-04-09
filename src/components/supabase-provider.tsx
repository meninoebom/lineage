"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SupabaseContextValue {
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      // Use a microtask to avoid synchronous setState in effect body
      queueMicrotask(() => setLoading(false));
      return;
    }

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const client = getSupabaseClient();
    if (!client) return { error: new Error("Supabase not configured") };
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
  }, []);

  return (
    <SupabaseContext.Provider
      value={{ user, loading, signInWithMagicLink, signInWithGoogle, signOut }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}

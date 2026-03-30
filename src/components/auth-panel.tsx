"use client";

import { useState } from "react";
import { useSupabase } from "./supabase-provider";

export function AuthPanel() {
  const { signInWithMagicLink, signInWithGoogle } = useSupabase();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="font-serif text-lg font-medium text-foreground">Check your email</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <p className="font-serif text-lg font-medium text-foreground">
        Sign in to share your experience
      </p>

      <form onSubmit={handleMagicLink} className="flex gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending…" : "Email me a link"}
        </button>
      </form>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <button
        onClick={signInWithGoogle}
        className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
      >
        Google
      </button>
    </div>
  );
}

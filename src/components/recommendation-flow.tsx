"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabase } from "./supabase-provider";
import { AuthPanel } from "./auth-panel";
import { ProfileCompletion } from "./profile-completion";
import {
  createRecommendation,
  getUserRecommendation,
  getRecommendationCount,
  createTestimony,
  getProfile,
} from "@/lib/testimonies";

type Step = "idle" | "auth" | "testimony" | "profile" | "success";

const SCAFFOLD_PROMPTS = [
  "How did this resource impact your practice?",
  "What were you going through when you found it?",
  "Who would benefit most from this?",
  "Anything else you'd like to share?",
];

const MAX_CHARS = 2000;

interface RecommendationFlowProps {
  resourceSlug: string;
  resourceTitle: string;
}

export function RecommendationFlow({
  resourceSlug,
  resourceTitle,
}: RecommendationFlowProps) {
  const { user, loading: authLoading } = useSupabase();
  const [step, setStep] = useState<Step>("idle");
  const [hasRecommended, setHasRecommended] = useState(false);
  const [count, setCount] = useState(0);
  const [recommending, setRecommending] = useState(false);
  const [showTestimonyPrompt, setShowTestimonyPrompt] = useState(false);
  const [showScaffolding, setShowScaffolding] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const pendingActionFired = useRef(false);

  // Fetch recommendation state and count on mount / auth change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const c = await getRecommendationCount(resourceSlug);
      if (cancelled) return;
      setCount(c);
      if (user) {
        const rec = await getUserRecommendation(user.id, resourceSlug);
        if (cancelled) return;
        if (rec) {
          setHasRecommended(true);
        }
      }
    }
    if (!authLoading) load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, resourceSlug]);

  const doRecommend = useCallback(async () => {
    if (!user || hasRecommended || recommending) return;
    setRecommending(true);
    setErrorMsg(null);

    // Optimistic update
    setHasRecommended(true);
    setCount((prev) => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      await createRecommendation(user.id, resourceSlug);
      clearActionParam();

      // Check profile for later testimony submission
      const profile = await getProfile(user.id);
      setNeedsProfile(!profile?.traditions?.length);

      // Show testimony prompt after 300ms delay
      setTimeout(() => {
        setShowTestimonyPrompt(true);
      }, 300);
    } catch (err: unknown) {
      // Rollback optimistic update
      setHasRecommended(false);
      setCount((prev) => prev - 1);
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("banned") ||
        msg.includes("violates row-level security")
      ) {
        setErrorMsg(
          "Your account has been restricted. Please contact the site administrator."
        );
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setRecommending(false);
    }
  }, [user, hasRecommended, recommending, resourceSlug]);

  // Handle pending-action URL param: auto-fire recommend on auth
  useEffect(() => {
    if (authLoading || pendingActionFired.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "recommend" && user && !hasRecommended) {
      pendingActionFired.current = true;
      doRecommend();
    }
  }, [user, authLoading, hasRecommended, doRecommend]);

  // When user signs in from auth step, go back to idle
  useEffect(() => {
    if (user && step === "auth") {
      setStep("idle");
      // Check pending action
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "recommend" && !pendingActionFired.current) {
        pendingActionFired.current = true;
        doRecommend();
      }
    }
  }, [user, step, doRecommend]);

  function clearActionParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function handleRecommendClick() {
    if (authLoading) return;
    if (!user) {
      // Set pending-action param so intent survives the auth flow
      const url = new URL(window.location.href);
      url.searchParams.set("action", "recommend");
      window.history.replaceState({}, "", url.pathname + url.search);
      setStep("auth");
      return;
    }
    doRecommend();
  }

  async function handleTestimonySubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createTestimony({
        user_id: user!.id,
        resource_slug: resourceSlug,
        content: content.trim(),
      });
      clearActionParam();
      setStep(needsProfile ? "profile" : "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("banned") ||
        msg.includes("violates row-level security")
      ) {
        setErrorMsg(
          "Your account has been restricted. Please contact the site administrator."
        );
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "auth") {
    return <AuthPanel />;
  }

  if (step === "profile") {
    return (
      <ProfileCompletion
        userId={user!.id}
        onComplete={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="font-serif text-lg font-medium text-foreground">
          Thank you for your recommendation
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your experience helps others find resources that matter
        </p>
      </div>
    );
  }

  // -- Main recommend-first UI (step === "idle") --

  return (
    <div className="space-y-4">
      {/* Recommend button with heart + count */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRecommendClick}
          disabled={hasRecommended || recommending}
          aria-label={hasRecommended ? "Recommended" : "Recommend"}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            hasRecommended
              ? "bg-terracotta-light text-terracotta cursor-default"
              : "border border-terracotta/30 text-foreground hover:border-terracotta hover:text-terracotta"
          } disabled:opacity-100`}
        >
          {/* Heart icon */}
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-all duration-300 ${
              hasRecommended ? "text-terracotta" : "text-muted-foreground"
            } ${animating ? "scale-125" : "scale-100"}`}
            fill={hasRecommended ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={hasRecommended ? 0 : 2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{hasRecommended ? "Recommended" : "Recommend"}</span>
        </button>

        <span
          className="text-sm text-muted-foreground"
          data-testid="recommend-count"
        >
          {count} {count === 1 ? "recommendation" : "recommendations"}
        </span>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      {/* "Want to say why?" testimony prompt */}
      {hasRecommended && showTestimonyPrompt && step === "idle" && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div>
            <p className="font-serif text-lg font-medium text-foreground">
              Want to say why?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share what made {resourceTitle} meaningful to you
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              placeholder="What impact has this had on your practice?"
              rows={5}
              maxLength={MAX_CHARS}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-y"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowScaffolding((prev) => !prev)}
                className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors underline decoration-dotted underline-offset-2"
              >
                Need help getting started?
              </button>
              <span className="text-xs text-muted-foreground/60 tabular-nums">
                {content.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {showScaffolding && (
            <ul className="space-y-1 pl-4 text-xs text-muted-foreground/70 italic list-disc animate-in fade-in duration-200">
              {SCAFFOLD_PROMPTS.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
          )}

          {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

          <button
            onClick={handleTestimonySubmit}
            disabled={submitting || !content.trim()}
            className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Share your experience"}
          </button>
        </div>
      )}
    </div>
  );
}

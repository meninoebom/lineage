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

const PROMPTS = [
  {
    key: "impact" as const,
    label: "How did this resource impact you?",
    placeholder: "What shifted for you? What did you understand differently?",
  },
  {
    key: "context" as const,
    label: "What were you going through at the time?",
    placeholder: "Helps others in similar situations find this",
  },
  {
    key: "who_for" as const,
    label: "Who would benefit most from this?",
    placeholder:
      'e.g. "Anyone starting a sitting practice" or "People dealing with grief"',
  },
  {
    key: "freeform" as const,
    label: "Anything else you'd like to share?",
    placeholder: "An open space for whatever feels relevant",
  },
];

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
  const [activePrompts, setActivePrompts] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, string>>({});
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

  function togglePrompt(key: string) {
    setActivePrompts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setValues((v) => {
          const copy = { ...v };
          delete copy[key];
          return copy;
        });
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleTestimonySubmit() {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createTestimony({
        user_id: user!.id,
        resource_slug: resourceSlug,
        impact: values.impact || null,
        context: values.context || null,
        who_for: values.who_for || null,
        freeform: values.freeform || null,
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

          <div className="space-y-3">
            {PROMPTS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => togglePrompt(key)}
                  className={`w-full text-left rounded-md border px-4 py-3 text-sm transition-colors ${
                    activePrompts.has(key)
                      ? "border-terracotta/50 bg-terracotta-light"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span
                    className={
                      activePrompts.has(key)
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {label}
                  </span>
                </button>
                {activePrompts.has(key) && (
                  <textarea
                    value={values[key] ?? ""}
                    onChange={(e) => updateValue(key, e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    maxLength={2000}
                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                )}
              </div>
            ))}
          </div>

          {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

          <button
            onClick={handleTestimonySubmit}
            disabled={submitting}
            className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Share your experience"}
          </button>
        </div>
      )}
    </div>
  );
}

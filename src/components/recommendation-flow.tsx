"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./supabase-provider";
import { AuthPanel } from "./auth-panel";
import { ProfileCompletion } from "./profile-completion";
import { createTestimony, getUserTestimony, getProfile } from "@/lib/testimonies";

type Step = "cta" | "auth" | "form" | "profile" | "success" | "already-recommended";

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
    placeholder: 'e.g. "Anyone starting a sitting practice" or "People dealing with grief"',
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

export function RecommendationFlow({ resourceSlug, resourceTitle }: RecommendationFlowProps) {
  const { user, loading: authLoading } = useSupabase();
  const [step, setStep] = useState<Step>("cta");
  const [activePrompts, setActivePrompts] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkExisting = useCallback(async () => {
    if (!user) return;
    const existing = await getUserTestimony(user.id, resourceSlug);
    if (existing) {
      setStep("already-recommended");
    } else {
      const profile = await getProfile(user.id);
      setNeedsProfile(!profile?.traditions?.length);
      setStep("form");
    }
  }, [user, resourceSlug]);

  // When user signs in (from auth step), advance to form
  useEffect(() => {
    if (user && step === "auth") {
      checkExisting();
    }
  }, [user, step, checkExisting]);

  function handleCta() {
    if (authLoading) return;
    if (user) {
      checkExisting();
    } else {
      setStep("auth");
    }
  }

  function togglePrompt(key: string) {
    setActivePrompts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setValues((v) => { const copy = { ...v }; delete copy[key]; return copy; });
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
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
      setStep(needsProfile ? "profile" : "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("banned") || msg.includes("violates row-level security")) {
        setErrorMsg("Your account has been restricted. Please contact the site administrator.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "cta") {
    return (
      <button
        onClick={handleCta}
        className="w-full rounded-lg border-2 border-dashed border-terracotta/30 p-6 text-center hover:border-terracotta/60 transition-colors group"
      >
        <p className="font-serif text-lg font-medium text-foreground group-hover:text-terracotta transition-colors">
          Have you read {resourceTitle}?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Share how it impacted your practice
        </p>
      </button>
    );
  }

  if (step === "auth") {
    return <AuthPanel />;
  }

  if (step === "already-recommended") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="font-serif text-lg font-medium text-foreground">
          You&apos;ve already recommended this resource
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you for sharing your experience
        </p>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 space-y-5">
        <div>
          <p className="font-serif text-lg font-medium text-foreground">
            Recommend {resourceTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose any prompts that feel relevant — or just submit to recommend it
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
                <span className={activePrompts.has(key) ? "text-foreground font-medium" : "text-muted-foreground"}>
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
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting…" : "Recommend this resource"}
        </button>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <ProfileCompletion
        userId={user!.id}
        onComplete={() => setStep("success")}
      />
    );
  }

  // success
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

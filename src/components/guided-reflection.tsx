"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

const REFLECTION_STEPS = [
  {
    prompt: "How did this resource touch your practice?",
    placeholder: "Take your time — there's no right answer.",
  },
  {
    prompt: "What were you going through when you found it?",
    placeholder: "The context often matters as much as the resource itself.",
  },
  {
    prompt: "Who might benefit most from this?",
    placeholder: "Think of someone specific you'd share this with.",
  },
  {
    prompt: "Anything else you'd like to share?",
    placeholder: "Any other thoughts, caveats, or context...",
  },
];

const MAX_CHARS = 2000;

type Stage = "idle" | "auth" | "reflecting" | "profile" | "success";

interface GuidedReflectionProps {
  resourceSlug: string;
  resourceTitle: string;
}

// --- Sub-components ---

function ReflectionProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            i < current
              ? "w-6 bg-terracotta"
              : i === current
                ? "w-6 bg-terracotta/50"
                : "w-3 bg-border"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {current + 1} of {total}
      </span>
    </div>
  );
}

interface ReflectionStepProps {
  step: (typeof REFLECTION_STEPS)[number];
  stepIndex: number;
  totalSteps: number;
  answer: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLast: boolean;
  submitting: boolean;
  errorMsg: string | null;
}

function ReflectionStep({
  step,
  stepIndex,
  totalSteps,
  answer,
  onChange,
  onNext,
  onBack,
  onSkip,
  isLast,
  submitting,
  errorMsg,
}: ReflectionStepProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-5">
      <ReflectionProgress current={stepIndex} total={totalSteps} />

      <p className="font-serif text-lg font-medium text-foreground">{step.prompt}</p>

      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder={step.placeholder}
        rows={4}
        maxLength={MAX_CHARS}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-y"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {answer.length}/{MAX_CHARS}
        </span>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <div className="flex items-center gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Sharing your reflection..." : isLast ? "Submit" : "Next"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline decoration-dotted underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function ReflectionComplete({ firstAnswer, resourceTitle }: { firstAnswer?: string; resourceTitle: string }) {
  return (
    <div
      data-testid="reflection-complete"
      className="rounded-lg border border-border bg-card p-6 text-center space-y-3"
    >
      <p className="font-serif text-lg font-medium text-foreground">
        Thank you for sharing
      </p>
      {firstAnswer && (
        <p className="text-sm text-muted-foreground italic">
          &ldquo;{firstAnswer.slice(0, 120)}{firstAnswer.length > 120 ? "…" : ""}&rdquo;
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Your reflection on {resourceTitle} helps others find what matters.
      </p>
    </div>
  );
}

// --- Main orchestrator ---

export function GuidedReflection({ resourceSlug, resourceTitle }: GuidedReflectionProps) {
  const reducedMotion = useReducedMotion();
  const { user, loading: authLoading } = useSupabase();
  const [stage, setStage] = useState<Stage>("idle");
  const [hasRecommended, setHasRecommended] = useState(false);
  const [count, setCount] = useState(0);
  const [recommending, setRecommending] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reflection step state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [firstAnswer, setFirstAnswer] = useState<string | undefined>();

  const pendingActionFired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const c = await getRecommendationCount(resourceSlug);
      if (cancelled) return;
      setCount(c);
      if (user) {
        const rec = await getUserRecommendation(user.id, resourceSlug);
        if (cancelled) return;
        if (rec) setHasRecommended(true);
      }
    }
    if (!authLoading) load();
    return () => { cancelled = true; };
  }, [user, authLoading, resourceSlug]);

  const doRecommend = useCallback(async () => {
    if (!user || hasRecommended || recommending) return;
    setRecommending(true);
    setErrorMsg(null);

    setHasRecommended(true);
    setCount((prev) => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      await createRecommendation(user.id, resourceSlug);
      clearActionParam();

      const profile = await getProfile(user.id);
      setNeedsProfile(!profile?.traditions?.length);

      setTimeout(() => setStage("reflecting"), 300);
    } catch (err: unknown) {
      setHasRecommended(false);
      setCount((prev) => prev - 1);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("banned") || msg.includes("violates row-level security")) {
        setErrorMsg("Your account has been restricted. Please contact the site administrator.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setRecommending(false);
    }
  }, [user, hasRecommended, recommending, resourceSlug]);

  useEffect(() => {
    if (authLoading || pendingActionFired.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "recommend" && user && !hasRecommended) {
      pendingActionFired.current = true;
      doRecommend();
    }
  }, [user, authLoading, hasRecommended, doRecommend]);

  useEffect(() => {
    if (user && stage === "auth") {
      setStage("idle");
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "recommend" && !pendingActionFired.current) {
        pendingActionFired.current = true;
        doRecommend();
      }
    }
  }, [user, stage, doRecommend]);

  function clearActionParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function handleRecommendClick() {
    if (authLoading) return;
    if (!user) {
      const url = new URL(window.location.href);
      url.searchParams.set("action", "recommend");
      window.history.replaceState({}, "", url.pathname + url.search);
      setStage("auth");
      return;
    }
    doRecommend();
  }

  function handleAnswerChange(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  }

  async function handleNext() {
    const isLast = currentStep === REFLECTION_STEPS.length - 1;
    if (!isLast) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Final step — submit testimony
    const combined = REFLECTION_STEPS.map((step, i) => {
      const ans = answers[i]?.trim();
      return ans ? `${step.prompt}\n${ans}` : null;
    })
      .filter(Boolean)
      .join("\n\n");

    if (!combined) {
      // No answers provided — skip to success
      setStage(needsProfile ? "profile" : "success");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createTestimony({
        user_id: user!.id,
        resource_slug: resourceSlug,
        content: combined,
      });
      const echo = Object.values(answers).find((a) => a.trim());
      setFirstAnswer(echo);
      setStage(needsProfile ? "profile" : "success");
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

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleSkip() {
    setStage("success");
  }

  // --- Render ---

  if (stage === "auth") return <AuthPanel />;

  if (stage === "profile") {
    return (
      <ProfileCompletion
        userId={user!.id}
        onComplete={() => setStage("success")}
      />
    );
  }

  if (stage === "success") {
    return <ReflectionComplete firstAnswer={firstAnswer} resourceTitle={resourceTitle} />;
  }

  const stepVariants = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  if (stage === "reflecting") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          data-testid="reflection-step-animator"
          data-step={currentStep}
          {...stepVariants}
        >
          <ReflectionStep
            step={REFLECTION_STEPS[currentStep]}
            stepIndex={currentStep}
            totalSteps={REFLECTION_STEPS.length}
            answer={answers[currentStep] ?? ""}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLast={currentStep === REFLECTION_STEPS.length - 1}
            submitting={submitting}
            errorMsg={errorMsg}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- Idle state ---
  return (
    <div className="space-y-4">
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

        <span className="text-sm text-muted-foreground" data-testid="recommend-count">
          {count} {count === 1 ? "recommendation" : "recommendations"}
        </span>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback } from "@/lib/feedback";

type WidgetState = "idle" | "loading" | "success" | "error";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<WidgetState>("idle");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setState("idle");
    buttonRef.current?.focus();
  }, []);

  // Focus textarea when panel opens
  useEffect(() => {
    if (open && state === "idle") {
      textareaRef.current?.focus();
    }
  }, [open, state]);

  // Auto-close after success
  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => {
        setMessage("");
        setName("");
        setEmail("");
        close();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, close]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const result = await submitFeedback({
      message,
      name: name || undefined,
      email: email || undefined,
      pageUrl: pathname,
    });
    setState(result.ok ? "success" : "error");
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={close}
          data-testid="feedback-backdrop"
        />
      )}

      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
        {/* Panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Send feedback"
          className={`absolute bottom-14 right-0 w-80 sm:w-96 rounded-lg bg-card border border-border/50 shadow-xl transition-all duration-250 origin-bottom-right ${
            open
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-serif text-lg font-medium">Send Feedback</h2>
            <button
              onClick={close}
              aria-label="Close feedback"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {state === "success" ? (
            <div className="px-4 pb-4 pt-2 text-center">
              <p className="font-sans text-sm text-muted-foreground">
                Thank you — we read every message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
              <div>
                <label htmlFor="feedback-message" className="sr-only">
                  Message
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-message"
                  required
                  rows={3}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded border border-border/50 bg-surface-container-highest px-3 py-2 font-sans text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="feedback-name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    placeholder="Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 rounded border border-border/50 bg-surface-container-highest px-3 py-2 font-sans text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="feedback-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 rounded border border-border/50 bg-surface-container-highest px-3 py-2 font-sans text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors"
                  />
                </div>
              </div>
              {state === "error" && (
                <p className="font-sans text-sm text-red-600" role="alert">
                  Something went wrong. Your message is still here — try again?
                </p>
              )}
              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-4 py-2 rounded font-sans text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {state === "loading" ? "Sending…" : "Send Feedback"}
              </button>
            </form>
          )}
        </div>

        {/* Floating button */}
        <button
          ref={buttonRef}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open feedback form"
          aria-expanded={open}
          className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-4 py-2.5 rounded-full shadow-lg font-serif text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 3h12v8H4l-2 2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          Feedback
        </button>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";

const FORMSPREE_ID = "mbdpjqyb";

interface Props {
  contextType: "teacher" | "tradition";
  contextName: string;
  prefilledValue?: string;
}

export function SuggestResourceForm({ contextType, contextName, prefilledValue = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const prompt =
    contextType === "teacher"
      ? `Know a video or talk by ${contextName} we should add?`
      : `Know a great resource on ${contextName}?`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.currentTarget),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // form remains visible on network error
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <section id="suggest" className="mb-12">
        <p className="font-sans text-sm text-muted-foreground">
          {prompt}{" "}
          <button
            onClick={() => setOpen(true)}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Suggest one &rarr;
          </button>
        </p>
      </section>
    );
  }

  if (submitted) {
    return (
      <section id="suggest" className="mb-12">
        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="font-sans text-sm text-muted-foreground">
            Thanks for the suggestion — we&rsquo;ll take a look.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="suggest" className="mb-12">
      <form onSubmit={handleSubmit} className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
        <input type="hidden" name="_subject" value={`Resource suggestion: ${contextName}`} />
        <input type="hidden" name="context_type" value={contextType} />
        <input type="hidden" name="context_name" value={contextName} />

        <p className="font-sans text-sm font-medium text-foreground">{prompt}</p>

        <div className="space-y-3">
          <div>
            <label className="font-sans text-xs text-muted-foreground block mb-1">
              URL <span className="text-primary">*</span>
            </label>
            <input
              type="url"
              name="url"
              required
              placeholder="https://…"
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-sans text-xs text-muted-foreground block mb-1">Type</label>
            <select
              name="type"
              className="font-sans text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— select —</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="book">Book</option>
            </select>
          </div>

          <div>
            <label className="font-sans text-xs text-muted-foreground block mb-1">
              {contextType === "teacher" ? "Teacher" : "Tradition"}
            </label>
            <input
              type="text"
              name={contextType === "teacher" ? "teacher" : "tradition"}
              defaultValue={prefilledValue}
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-sans text-xs text-muted-foreground block mb-1">
              Why include this? (optional)
            </label>
            <textarea
              name="why"
              rows={2}
              placeholder="1–2 sentences…"
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-sans text-xs text-muted-foreground block mb-1">
              Your name (optional)
            </label>
            <input
              type="text"
              name="name"
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="font-sans text-sm font-medium bg-primary text-primary-foreground rounded px-4 py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Sending…" : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

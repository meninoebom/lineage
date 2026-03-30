"use client";

import { useEffect, useState } from "react";
import { getTestimonies } from "@/lib/testimonies";
import type { Testimony } from "@/lib/types";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function TestimonySkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
    </div>
  );
}

function TestimonyCard({ testimony }: { testimony: Testimony }) {
  const profile = testimony.profiles;
  const hasContent = testimony.impact || testimony.context || testimony.who_for || testimony.freeform;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {profile?.display_name || "A practitioner"}
          </span>
          {profile?.traditions && profile.traditions.length > 0 && (
            <span className="text-xs text-muted-foreground">
              · {profile.traditions.join(", ")}
            </span>
          )}
          {profile?.years_of_practice && (
            <span className="text-xs text-muted-foreground">
              · {profile.years_of_practice} years
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {relativeTime(testimony.created_at)}
        </span>
      </div>

      {!hasContent && (
        <p className="text-sm text-muted-foreground italic">recommended this</p>
      )}

      {testimony.impact && (
        <p className="text-sm text-foreground leading-relaxed">{testimony.impact}</p>
      )}

      {testimony.context && (
        <p className="text-xs text-muted-foreground italic">
          Context: {testimony.context}
        </p>
      )}

      {testimony.who_for && (
        <p className="text-xs text-muted-foreground">
          Recommended for: {testimony.who_for}
        </p>
      )}

      {testimony.freeform && (
        <p className="text-sm text-foreground/80 leading-relaxed mt-1">
          {testimony.freeform}
        </p>
      )}
    </div>
  );
}

interface TestimonyDisplayProps {
  resourceSlug: string;
}

export function TestimonyDisplay({ resourceSlug }: TestimonyDisplayProps) {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonies(resourceSlug)
      .then(setTestimonies)
      .catch(() => {}) // Fail silently — empty state is fine
      .finally(() => setLoading(false));
  }, [resourceSlug]);

  if (loading) {
    return (
      <div className="space-y-3">
        <TestimonySkeleton />
        <TestimonySkeleton />
      </div>
    );
  }

  if (testimonies.length === 0) return null;

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        {testimonies.length} practitioner{testimonies.length !== 1 ? "s" : ""}{" "}
        recommend{testimonies.length === 1 ? "s" : ""} this
      </p>
      {testimonies.map((t) => (
        <TestimonyCard key={t.id} testimony={t} />
      ))}
    </section>
  );
}

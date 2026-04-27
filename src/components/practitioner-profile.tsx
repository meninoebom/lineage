"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, getPractitionerTestimonies } from "@/lib/testimonies";
import type { Profile, Testimony } from "@/lib/types";

interface ResourceIndexItem {
  slug: string;
  title: string;
  author: string | null;
  type: string;
}

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

function ReflectionCard({
  testimony,
  resource,
}: {
  testimony: Testimony;
  resource: ResourceIndexItem | undefined;
}) {
  const hasContent =
    testimony.impact || testimony.context || testimony.who_for || testimony.freeform;

  return (
    <article className="rounded-lg border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {resource ? (
            <Link
              href={`/resources/${resource.slug}`}
              className="font-serif text-base font-semibold text-foreground hover:text-primary transition-colors leading-snug"
            >
              {resource.title}
            </Link>
          ) : (
            <span className="font-serif text-base font-semibold text-muted-foreground">
              {testimony.resource_slug}
            </span>
          )}
          {resource?.author && (
            <p className="font-sans text-xs text-muted-foreground mt-0.5">{resource.author}</p>
          )}
        </div>
        <time className="font-sans text-xs text-muted-foreground shrink-0 mt-1">
          {relativeTime(testimony.created_at)}
        </time>
      </div>

      {!hasContent && (
        <p className="font-sans text-sm text-muted-foreground italic">recommended this</p>
      )}
      {testimony.impact && (
        <p className="font-sans text-sm text-foreground leading-relaxed">{testimony.impact}</p>
      )}
      {testimony.context && (
        <p className="font-sans text-xs text-muted-foreground italic">
          Context: {testimony.context}
        </p>
      )}
      {testimony.who_for && (
        <p className="font-sans text-xs text-muted-foreground">
          Recommended for: {testimony.who_for}
        </p>
      )}
      {testimony.freeform && (
        <p className="font-sans text-sm text-foreground/80 leading-relaxed italic">
          &ldquo;{testimony.freeform}&rdquo;
        </p>
      )}
    </article>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface PractitionerProfileProps {
  userId: string;
}

export function PractitionerProfile({ userId }: PractitionerProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [resources, setResources] = useState<Map<string, ResourceIndexItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, t, resourcesRes] = await Promise.all([
          getProfile(userId),
          getPractitionerTestimonies(userId),
          fetch("/resources-index.json").then((r) => r.json() as Promise<ResourceIndexItem[]>),
        ]);

        if (!p) {
          setNotFound(true);
          return;
        }

        setProfile(p);
        setTestimonies(t);

        const map = new Map<string, ResourceIndexItem>();
        for (const r of resourcesRes) map.set(r.slug, r);
        setResources(map);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <ProfileSkeleton />;

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-2">Practitioner not found.</p>
        <p className="text-sm text-muted-foreground">
          This profile may not exist or may be private.
        </p>
      </div>
    );
  }

  if (!profile) return null;

  const name = profile.display_name || "A practitioner";

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <h1 className="mb-2">{name}</h1>

        {profile.bio && (
          <p className="text-foreground/80 leading-relaxed mb-4 max-w-prose">{profile.bio}</p>
        )}

        {profile.practice_background && (
          <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4 max-w-prose">
            {profile.practice_background}
          </p>
        )}

        {/* Subtle secondary context */}
        {(profile.traditions.length > 0 || profile.years_of_practice) && (
          <p className="font-sans text-xs text-muted-foreground/70">
            {[
              profile.traditions.join(", "),
              profile.years_of_practice && `${profile.years_of_practice} years of practice`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </header>

      {/* Reflections mosaic */}
      <section>
        <h2 className="font-serif text-xl font-semibold mb-6">
          Reflections
          <span className="font-sans text-sm font-normal text-muted-foreground ml-3">
            {testimonies.length} {testimonies.length === 1 ? "resource" : "resources"}
          </span>
        </h2>

        {testimonies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">
              {name} hasn&apos;t shared any reflections yet.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Reflections appear when a practitioner recommends and annotates a resource.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonies.map((t) => (
              <ReflectionCard
                key={t.id}
                testimony={t}
                resource={resources.get(t.resource_slug)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

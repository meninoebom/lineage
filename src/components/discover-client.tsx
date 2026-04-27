"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// --- Types ---

interface ResourceIndexItem {
  slug: string;
  title: string;
  author: string | null;
  type: string;
  traditions: string[];
  teachers: string[];
  experience_level: string | null;
  topics: string[];
  practice_context: string[];
  description: string;
  url: string;
  year: number | null;
}

interface FilterState {
  type: string;
  experienceLevel: string;
  topics: string[];
  practiceContext: string[];
  traditions: string[];
  teachers: string[];
}

const EMPTY_FILTERS: FilterState = {
  type: "",
  experienceLevel: "",
  topics: [],
  practiceContext: [],
  traditions: [],
  teachers: [],
};

// --- Constants ---

const RESOURCE_TYPES = [
  { value: "", label: "All" },
  { value: "book", label: "Book" },
  { value: "video", label: "Video" },
  { value: "podcast", label: "Podcast" },
  { value: "article", label: "Article" },
  { value: "website", label: "Website" },
  { value: "app", label: "App" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-[#eaf2ea] text-[#3d6b3d] border-[#3d6b3d]/20",
  intermediate: "bg-[#f3e8e5] text-[#9e4a3a] border-[#9e4a3a]/20",
  advanced: "bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20",
};

const TYPE_ICONS: Record<string, string> = {
  video: "▶",
  podcast: "◉",
  app: "◈",
};

const ALL_TOPICS = [
  "meditation-technique",
  "philosophy",
  "daily-life",
  "grief-loss",
  "embodiment",
  "ethics",
  "devotion",
  "nature-of-mind",
  "teacher-student",
  "monasticism",
];

const ALL_PRACTICE_CONTEXTS = [
  "new-to-practice",
  "deepening",
  "life-transition",
  "cross-tradition",
  "retreat-prep",
  "academic",
  "secular",
];

// --- Helpers ---

function formatLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function countActiveFilters(f: FilterState): number {
  return (
    (f.type ? 1 : 0) +
    (f.experienceLevel ? 1 : 0) +
    f.topics.length +
    f.practiceContext.length +
    f.traditions.length +
    f.teachers.length
  );
}

function filterResources(items: ResourceIndexItem[], f: FilterState): ResourceIndexItem[] {
  return items.filter((r) => {
    if (f.type && r.type !== f.type) return false;
    if (f.experienceLevel && r.experience_level !== f.experienceLevel) return false;
    if (f.topics.length > 0 && !f.topics.some((t) => r.topics.includes(t))) return false;
    if (f.practiceContext.length > 0 && !f.practiceContext.some((c) => r.practice_context.includes(c))) return false;
    if (f.traditions.length > 0 && !f.traditions.some((t) => r.traditions.includes(t))) return false;
    if (f.teachers.length > 0 && !f.teachers.some((t) => r.teachers.includes(t))) return false;
    return true;
  });
}

// --- Sub-components ---

function TypeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleBadge({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} aria-pressed={active}>
      <Badge
        variant={active ? "family" : "outline"}
        className="cursor-pointer font-serif text-[11px] transition-colors"
      >
        {label}
      </Badge>
    </button>
  );
}

function ResourceCard({
  item,
  traditionNames,
  teacherNames,
}: {
  item: ResourceIndexItem;
  traditionNames: Record<string, string>;
  teacherNames: Record<string, string>;
}) {
  const typeIcon = TYPE_ICONS[item.type];
  const isMedia = item.type === "video" || item.type === "podcast";
  const isBook = item.type === "book";

  return (
    <Link href={`/resources/${item.slug}`} className="group block">
      <article className="relative rounded-lg border border-border/60 bg-surface p-5 hover:border-primary/30 hover:bg-accent/20 transition-all">
        {/* Stretched link overlay */}
        <span className="absolute inset-0" aria-hidden />

        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {typeIcon && (
              <span className="text-xs text-muted-foreground" aria-hidden>
                {typeIcon}
              </span>
            )}
            <Badge variant="outline" className="text-[10px] font-medium">
              {formatLabel(item.type)}
            </Badge>
            {item.experience_level && (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 font-serif text-[10px] font-medium ${LEVEL_STYLES[item.experience_level] ?? ""}`}
              >
                {formatLabel(item.experience_level)}
              </span>
            )}
          </div>
          {isBook && item.year && (
            <span className="text-xs text-muted-foreground shrink-0">{item.year}</span>
          )}
        </div>

        <h2 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
          {isMedia && typeIcon && <span className="mr-1 text-muted-foreground text-sm">{typeIcon}</span>}
          {item.title}
        </h2>

        {item.author && (
          <p className={`text-sm text-muted-foreground mb-2 ${isBook ? "font-medium" : ""}`}>
            {item.author}
            {isBook && item.year && <span className="font-normal"> · {item.year}</span>}
          </p>
        )}

        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        {(item.topics.length > 0 || item.practice_context.length > 0 || item.traditions.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {item.topics.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-border/60 px-1.5 py-0.5 font-serif text-[10px] text-muted-foreground"
              >
                {formatLabel(t)}
              </span>
            ))}
            {item.traditions.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-border/60 px-1.5 py-0.5 font-serif text-[10px] text-muted-foreground"
              >
                {traditionNames[t] ?? formatLabel(t)}
              </span>
            ))}
            {item.teachers.slice(0, 1).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-border/60 px-1.5 py-0.5 font-serif text-[10px] text-muted-foreground"
              >
                {teacherNames[t] ?? formatLabel(t)}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}

// --- Main component ---

interface DiscoverClientProps {
  traditionNames: Record<string, string>;
  teacherNames: Record<string, string>;
}

export function DiscoverClient({ traditionNames, teacherNames }: DiscoverClientProps) {
  const [resources, setResources] = useState<ResourceIndexItem[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showAllTeachers, setShowAllTeachers] = useState(false);

  useEffect(() => {
    fetch("/resources-index.json")
      .then((r) => r.json())
      .then(setResources)
      .catch(() => setFetchError(true));
  }, []);

  // Derive available filter options from loaded data
  const availableTraditions = useMemo(() => {
    if (!resources) return [];
    const seen = new Set<string>();
    for (const r of resources) r.traditions.forEach((t) => seen.add(t));
    return Array.from(seen)
      .filter((s) => traditionNames[s])
      .sort((a, b) => (traditionNames[a] ?? a).localeCompare(traditionNames[b] ?? b));
  }, [resources, traditionNames]);

  // Teachers who have ≥1 resource linked
  const availableTeachers = useMemo(() => {
    if (!resources) return [];
    const seen = new Set<string>();
    for (const r of resources) r.teachers.forEach((t) => seen.add(t));
    return Array.from(seen)
      .filter((s) => teacherNames[s])
      .sort((a, b) => (teacherNames[a] ?? a).localeCompare(teacherNames[b] ?? b));
  }, [resources, teacherNames]);

  const results = useMemo(() => {
    if (!resources) return [];
    return filterResources(resources, filters);
  }, [resources, filters]);

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const toggle = useCallback(<K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }, []);

  const visibleTeachers = showAllTeachers
    ? availableTeachers
    : availableTeachers.slice(0, 12);

  if (fetchError) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Unable to load resources. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
          What are you looking for?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Browse {resources ? resources.length.toLocaleString() : "1,156"} books, videos, podcasts, and articles across contemplative traditions.
        </p>
      </header>

      {/* Type tabs — global view switch */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border/40 pb-6">
        {RESOURCE_TYPES.map(({ value, label }) => (
          <TypeTab
            key={value}
            label={label}
            active={filters.type === value}
            onClick={() => setFilters((prev) => ({ ...prev, type: value }))}
          />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filter sidebar */}
        <aside className="lg:w-56 shrink-0 space-y-8">
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear all filters ({activeFilterCount})
            </button>
          )}

          {/* Experience level */}
          <FilterSection title="Experience">
            <div className="space-y-1.5">
              {EXPERIENCE_LEVELS.map(({ value, label }) => {
                const active = filters.experienceLevel === value;
                return (
                  <button
                    key={value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        experienceLevel: active ? "" : value,
                      }))
                    }
                    aria-pressed={active}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors text-left ${
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium font-serif ${LEVEL_STYLES[value]}`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Topics */}
          <FilterSection title="Topics">
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOPICS.map((t) => (
                <ToggleBadge
                  key={t}
                  label={formatLabel(t)}
                  active={filters.topics.includes(t)}
                  onClick={() => toggle("topics", t)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Practice context */}
          <FilterSection title="Practice Context">
            <div className="flex flex-wrap gap-1.5">
              {ALL_PRACTICE_CONTEXTS.map((c) => (
                <ToggleBadge
                  key={c}
                  label={formatLabel(c)}
                  active={filters.practiceContext.includes(c)}
                  onClick={() => toggle("practiceContext", c)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Tradition */}
          {availableTraditions.length > 0 && (
            <FilterSection title="Tradition">
              <div className="flex flex-wrap gap-1.5">
                {availableTraditions.map((slug) => (
                  <ToggleBadge
                    key={slug}
                    label={traditionNames[slug] ?? formatLabel(slug)}
                    active={filters.traditions.includes(slug)}
                    onClick={() => toggle("traditions", slug)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Teacher */}
          {availableTeachers.length > 0 && (
            <FilterSection title="Teacher">
              <div className="flex flex-wrap gap-1.5">
                {visibleTeachers.map((slug) => (
                  <ToggleBadge
                    key={slug}
                    label={teacherNames[slug] ?? formatLabel(slug)}
                    active={filters.teachers.includes(slug)}
                    onClick={() => toggle("teachers", slug)}
                  />
                ))}
                {availableTeachers.length > 12 && (
                  <button
                    onClick={() => setShowAllTeachers((v) => !v)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors mt-1"
                  >
                    {showAllTeachers
                      ? "Show fewer"
                      : `+${availableTeachers.length - 12} more`}
                  </button>
                )}
              </div>
            </FilterSection>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {!resources ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-sm">Loading resources…</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {results.length.toLocaleString()}{" "}
                  {results.length === 1 ? "resource" : "resources"}
                  {hasActiveFilters && " matching"}
                </p>
              </div>

              {results.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground mb-2">No resources match your filters.</p>
                  <button
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="text-sm text-primary hover:underline"
                  >
                    Try broadening your search
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.map((item) => (
                    <ResourceCard
                      key={item.slug}
                      item={item}
                      traditionNames={traditionNames}
                      teacherNames={teacherNames}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

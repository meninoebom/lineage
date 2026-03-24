"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Teacher } from "@/lib/types";
import { filterTeachers } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeachersClientProps {
  teachers: Teacher[];
  traditionNames: Record<string, string>;
}

export function TeachersClient({ teachers, traditionNames }: TeachersClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);

  const traditions = useMemo(() => {
    const t = new Set<string>();
    for (const teacher of teachers) teacher.traditions.forEach((tr) => t.add(tr));
    return Array.from(t).sort();
  }, [teachers]);

  const results = useMemo(() => {
    return filterTeachers(teachers, {
      query,
      traditions: selectedTraditions,
      state: "",
    });
  }, [teachers, query, selectedTraditions]);

  const toggleTradition = useCallback((slug: string) => {
    setSelectedTraditions((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedTraditions([]);
  }, []);

  const hasActiveFilters = query !== "" || selectedTraditions.length > 0;

  return (
    <div>
      <div className="mb-10 space-y-4">
        <Input
          placeholder="Search teachers by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search teachers by name"
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tradition">
            {traditions.map((slug) => {
              const name = traditionNames[slug] ?? slug;
              const isSelected = selectedTraditions.includes(slug);
              return (
                <button
                  key={slug}
                  onClick={() => toggleTradition(slug)}
                  aria-pressed={isSelected}
                  aria-label={`Filter by ${name}`}
                >
                  <Badge variant={isSelected ? "family" : "tradition"}>
                    {name}
                  </Badge>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p className="font-sans text-sm text-muted-foreground mb-6">
        {results.length} {results.length === 1 ? "teacher" : "teachers"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">
            No teachers found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters, or{" "}
            <Link
              href="/masters"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              explore historical masters
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((teacher) => (
            <Link
              key={teacher.slug}
              href={`/teachers/${teacher.slug}`}
              className="group"
            >
              <div className="h-full rounded-lg border border-border bg-white p-4 group-hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-muted-foreground"
                          />
                          <path
                            d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="text-muted-foreground"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base font-medium tracking-tight group-hover:text-primary transition-colors">
                      {teacher.name}
                    </h3>
                    {(teacher.city || teacher.state || teacher.country) && (
                      <p className="font-sans text-sm text-muted-foreground">
                        {[teacher.city, teacher.state].filter(Boolean).join(", ")}
                        {teacher.country && teacher.country !== "US" && ` · ${teacher.country}`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teacher.traditions.map((slug) => (
                        <Badge key={slug} variant="tradition">
                          {traditionNames[slug] ?? slug}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

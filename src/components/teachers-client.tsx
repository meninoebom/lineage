"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Teacher } from "@/lib/types";
import type { SearchFilters } from "@/lib/search";
import { filterTeachers } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TeachersClientProps {
  teachers: Teacher[];
  traditionNames: Record<string, string>;
}

export function TeachersClient({ teachers, traditionNames }: TeachersClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");

  const states = useMemo(() => {
    const s = new Set<string>();
    for (const t of teachers) s.add(t.state);
    return Array.from(s).sort();
  }, [teachers]);

  const traditions = useMemo(() => {
    const t = new Set<string>();
    for (const teacher of teachers) teacher.traditions.forEach((tr) => t.add(tr));
    return Array.from(t).sort();
  }, [teachers]);

  const filters: SearchFilters = useMemo(
    () => ({ query, traditions: selectedTraditions, state: selectedState }),
    [query, selectedTraditions, selectedState]
  );

  const results = useMemo(
    () => filterTeachers(teachers, filters),
    [teachers, filters]
  );

  const toggleTradition = useCallback((slug: string) => {
    setSelectedTraditions((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedTraditions([]);
    setSelectedState("");
  }, []);

  const hasActiveFilters =
    query !== "" || selectedTraditions.length > 0 || selectedState !== "";

  return (
    <div>
      <div className="mb-8 space-y-4">
        <Input
          placeholder="Search teachers by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search teachers by name"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter by location"
            className="sm:max-w-xs"
          >
            <option value="">All locations</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

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
      </div>

      <p className="font-sans text-sm text-muted-foreground mb-4">
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
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((teacher) => (
            <Link key={teacher.slug} href={`/teachers/${teacher.slug}`} className="group">
              <Card accent="terracotta" className="h-full group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {teacher.name}
                  </CardTitle>
                  <CardDescription>
                    {teacher.city}, {teacher.state}
                    {teacher.country !== "US" && ` · ${teacher.country}`}
                  </CardDescription>
                </CardHeader>
                <div className="flex flex-wrap gap-1.5 px-5 pb-5">
                  {teacher.traditions.map((slug) => (
                    <Badge key={slug} variant="tradition">
                      {traditionNames[slug] ?? slug}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Teacher, Center } from "@/lib/types";
import type { SearchFilters } from "@/lib/search";
import { searchAll, getUniqueStates, getUniqueTraditions } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SearchClientProps {
  teachers: Teacher[];
  centers: Center[];
  /** Map of tradition slug -> display name */
  traditionNames: Record<string, string>;
}

export function SearchClient({
  teachers,
  centers,
  traditionNames,
}: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");

  const states = useMemo(
    () => getUniqueStates(teachers, centers),
    [teachers, centers]
  );
  const traditions = useMemo(
    () => getUniqueTraditions(teachers, centers),
    [teachers, centers]
  );

  const filters: SearchFilters = useMemo(
    () => ({
      query,
      traditions: selectedTraditions,
      state: selectedState,
    }),
    [query, selectedTraditions, selectedState]
  );

  const results = useMemo(
    () => searchAll(teachers, centers, filters),
    [teachers, centers, filters]
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
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search input */}
        <Input
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search by name"
        />

        {/* State filter and clear */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter by state"
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

        {/* Tradition tags */}
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

      {/* Results count */}
      <p className="font-sans text-sm text-muted-foreground mb-4">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">
            No teachers or centers found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters, or{" "}
            <Link
              href="/traditions"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              browse traditions
            </Link>{" "}
            to discover lineages.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((result) => {
            const isTeacher = result.type === "teacher";
            const item = result.item;
            const href = isTeacher
              ? `/teachers/${item.slug}`
              : `/centers/${item.slug}`;

            return (
              <Link key={`${result.type}-${item.slug}`} href={href} className="group">
                <Card
                  accent={isTeacher ? "terracotta" : "green"}
                  className="h-full group-hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {isTeacher ? "Teacher" : "Center"}
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription>
                      {item.city}, {item.state}
                      {item.country !== "US" && ` · ${item.country}`}
                    </CardDescription>
                  </CardHeader>
                  <div className="flex flex-wrap gap-1.5 px-5 pb-5">
                    {item.traditions.map((slug) => (
                      <Badge key={slug} variant="tradition">
                        {traditionNames[slug] ?? slug}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

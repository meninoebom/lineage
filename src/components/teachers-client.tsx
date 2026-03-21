"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Teacher } from "@/lib/types";
import type { SearchFilters } from "@/lib/search";
import { filterTeachers } from "@/lib/search";
import { geocodeLocation, sortByDistance } from "@/lib/geo";
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

  // Proximity search state
  const [locationQuery, setLocationQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState<{
    query: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

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

  const filtered = useMemo(
    () => filterTeachers(teachers, filters),
    [teachers, filters]
  );

  // Apply proximity sort after filtering
  const results = useMemo(() => {
    if (!activeLocation) return filtered;
    return sortByDistance(filtered, activeLocation.lat, activeLocation.lng);
  }, [filtered, activeLocation]);

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

  const handleLocationSearch = useCallback(async () => {
    const trimmed = locationQuery.trim();
    if (!trimmed) return;

    setLocationLoading(true);
    setLocationError("");

    const coords = await geocodeLocation(trimmed);

    if (coords) {
      setActiveLocation({ query: trimmed, lat: coords.lat, lng: coords.lng });
    } else {
      setLocationError("Could not find location. Try a different city or zip code.");
      setActiveLocation(null);
    }

    setLocationLoading(false);
  }, [locationQuery]);

  const clearLocation = useCallback(() => {
    setLocationQuery("");
    setActiveLocation(null);
    setLocationError("");
  }, []);

  const hasActiveFilters =
    query !== "" || selectedTraditions.length > 0 || selectedState !== "";

  // Helper to get distance for a result (works whether sorted or not)
  const getDistance = (teacher: (typeof results)[number]): number | null => {
    if (!activeLocation) return null;
    return "distance" in teacher ? (teacher as { distance: number | null }).distance : null;
  };

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

        {/* Proximity search */}
        <div className="border-t border-border pt-4">
          <label className="block font-sans text-sm text-muted-foreground mb-2">
            Sort by distance from...
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="City or zip code"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLocationSearch();
              }}
              aria-label="Enter city or zip code for proximity search"
              className="flex-1"
            />
            <button
              onClick={handleLocationSearch}
              disabled={locationLoading || !locationQuery.trim()}
              className="px-4 py-2 font-sans text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Searching
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {locationError && (
            <p className="font-sans text-sm text-destructive mt-2">{locationError}</p>
          )}

          {activeLocation && (
            <div className="flex items-center gap-2 mt-2 font-sans text-sm text-muted-foreground">
              <span>
                Sorted by distance from{" "}
                <span className="font-medium text-foreground">{activeLocation.query}</span>
              </span>
              <button
                onClick={clearLocation}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear location sort"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
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
          {results.map((teacher) => {
            const distance = getDistance(teacher);
            return (
              <Link key={teacher.slug} href={`/teachers/${teacher.slug}`} className="group">
                <Card accent="terracotta" className="h-full group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {teacher.name}
                        </CardTitle>
                        <CardDescription>
                          {teacher.city}, {teacher.state}
                          {teacher.country !== "US" && ` · ${teacher.country}`}
                        </CardDescription>
                      </div>
                      {distance != null && (
                        <span className="font-sans text-sm text-muted-foreground whitespace-nowrap">
                          {Math.round(distance)} mi
                        </span>
                      )}
                    </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

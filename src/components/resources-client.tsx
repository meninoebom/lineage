"use client";

import { useState, useMemo, useCallback } from "react";
import type { Resource } from "@/lib/types";
import type { ResourceSearchFilters } from "@/lib/search";
import { filterResources } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const RESOURCE_TYPES = ["book", "podcast", "video", "article", "website"] as const;

function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

interface ResourcesClientProps {
  resources: Resource[];
  traditionNames: Record<string, string>;
}

export function ResourcesClient({ resources, traditionNames }: ResourcesClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");

  const traditions = useMemo(() => {
    const t = new Set<string>();
    for (const r of resources) r.traditions.forEach((tr) => t.add(tr));
    return Array.from(t).sort();
  }, [resources]);

  const filters: ResourceSearchFilters = useMemo(
    () => ({ query, traditions: selectedTraditions, type: selectedType }),
    [query, selectedTraditions, selectedType]
  );

  const results = useMemo(
    () => filterResources(resources, filters),
    [resources, filters]
  );

  const toggleTradition = useCallback((slug: string) => {
    setSelectedTraditions((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedTraditions([]);
    setSelectedType("");
  }, []);

  const hasActiveFilters =
    query !== "" || selectedTraditions.length > 0 || selectedType !== "";

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by title or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search resources by title or author"
            className="flex-1"
          />

          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by type"
            className="sm:max-w-[180px]"
          >
            <option value="">All types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
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
        {results.length} {results.length === 1 ? "resource" : "resources"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">
            No resources found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters, or{" "}
            <Link
              href="/paths"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              explore our curated learning paths
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((resource) => (
            <a
              key={resource.slug}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline gap-3 rounded border border-border/50 bg-card px-4 py-2.5 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <span className="font-sans text-sm font-medium group-hover:text-primary transition-colors">
                  {resource.title}
                </span>
                {resource.author && (
                  <span className="font-sans text-xs text-muted-foreground ml-2">
                    {resource.author}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {resource.traditions.slice(0, 2).map((slug) => (
                  <span key={slug} className="font-sans text-[10px] text-muted-foreground/60">
                    {traditionNames[slug] ?? slug}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

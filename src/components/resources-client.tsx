"use client";

import { useState, useMemo, useCallback } from "react";
import type { Resource } from "@/lib/types";
import type { ResourceSearchFilters } from "@/lib/search";
import { filterResources } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
              href="/library"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              explore our curated reading paths
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((resource) => (
            <a
              key={resource.slug}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <Badge variant="default" className="shrink-0">
                      {typeLabel(resource.type)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {resource.author && <span>{resource.author}</span>}
                    {resource.author && resource.year && <span> · </span>}
                    {resource.year && <span>{resource.year}</span>}
                  </CardDescription>
                </CardHeader>
                <div className="mt-auto flex flex-wrap gap-1.5 px-5 pb-5">
                  {resource.traditions.map((slug) => (
                    <Badge key={slug} variant="tradition">
                      {traditionNames[slug] ?? slug}
                    </Badge>
                  ))}
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

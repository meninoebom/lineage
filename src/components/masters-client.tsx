"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Teacher } from "@/lib/types";
import { filterTeachers } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MasterWithMeta extends Teacher {
  family: string;
  traditionNameMap: { slug: string; name: string }[];
}

interface MastersClientProps {
  masters: MasterWithMeta[];
  traditionNames: Record<string, string>;
  families: string[];
}

function formatYears(birth: number | null, death: number | null): string {
  const b = birth ?? "?";
  const d = death ?? "?";
  return `${b}\u2013${d}`;
}

function truncateBio(bio: string, maxLength = 160): string {
  if (bio.length <= maxLength) return bio;
  return bio.slice(0, maxLength).replace(/\s+\S*$/, "") + "\u2026";
}

export function MastersClient({ masters, traditionNames, families }: MastersClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("");

  const traditions = useMemo(() => {
    const t = new Set<string>();
    for (const m of masters) m.traditions.forEach((tr) => t.add(tr));
    return Array.from(t).sort();
  }, [masters]);

  const results = useMemo(() => {
    const filtered = filterTeachers(masters, {
      query,
      traditions: selectedTraditions,
      state: "",
    }) as MasterWithMeta[];
    if (!selectedFamily) return filtered;
    return filtered.filter((m) => m.family === selectedFamily);
  }, [masters, query, selectedTraditions, selectedFamily]);

  const toggleTradition = useCallback((slug: string) => {
    setSelectedTraditions((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedTraditions([]);
    setSelectedFamily("");
  }, []);

  const hasActiveFilters =
    query !== "" || selectedTraditions.length > 0 || selectedFamily !== "";

  // Group results by family for the grouped view
  const grouped = useMemo(() => {
    const map = new Map<string, MasterWithMeta[]>();
    for (const m of results) {
      const existing = map.get(m.family) ?? [];
      existing.push(m);
      map.set(m.family, existing);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([family, members]) => ({
        family,
        members: members.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0)),
      }));
  }, [results]);

  return (
    <div>
      <div className="mb-10 space-y-4">
        <Input
          placeholder="Search masters by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search masters by name"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            aria-label="Filter by tradition family"
            className="sm:max-w-xs"
          >
            <option value="">All tradition families</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
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

      <p className="font-sans text-sm text-muted-foreground mb-6">
        {results.length} {results.length === 1 ? "master" : "masters"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">
            No masters found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters, or{" "}
            <Link
              href="/teachers"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              find a living teacher
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {grouped.map(({ family, members }) => (
            <section key={family}>
              <h2 className="font-serif text-2xl font-normal text-[#9e4a3a] mb-8">
                {family}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-0">
                {members.map((master) => (
                  <div
                    key={master.slug}
                    className="flex gap-4 py-6"
                  >
                    {/* Photo */}
                    {master.photo ? (
                      <Link href={`/teachers/${master.slug}`} className="shrink-0">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest">
                          <Image
                            src={master.photo}
                            alt={master.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <Link href={`/teachers/${master.slug}`} className="shrink-0">
                        <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="font-serif text-lg text-muted-foreground/60">
                            {master.name.charAt(0)}
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Content */}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link
                          href={`/teachers/${master.slug}`}
                          className="font-serif text-2xl font-normal text-foreground hover:text-[#9e4a3a] transition-colors"
                        >
                          {master.name}
                        </Link>
                        <span className="font-sans text-sm font-light text-muted-foreground whitespace-nowrap">
                          {formatYears(master.birth_year, master.death_year)}
                        </span>
                      </div>

                      <p className="font-sans text-sm text-muted-foreground leading-relaxed mt-1">
                        {truncateBio(master.bio)}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {master.traditionNameMap.map(({ slug, name }) => (
                          <Link key={slug} href={`/traditions/${slug}`}>
                            <Badge variant="tradition" className="text-xs hover:bg-[#9e4a3a]/20 transition-colors">
                              {name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

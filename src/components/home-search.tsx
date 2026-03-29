"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Teacher, Center, Resource } from "@/lib/types";

interface SearchableItem {
  type: "teacher" | "center" | "book" | "tradition";
  name: string;
  slug: string;
  href: string;
  detail: string;
}

interface HomeSearchProps {
  teachers: Teacher[];
  centers: Center[];
  resources: Resource[];
  traditionNames: Record<string, string>;
}

export function HomeSearch({
  teachers,
  centers,
  resources,
  traditionNames,
}: HomeSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Position the dropdown relative to the input
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (focused) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [focused, updatePosition]);

  // Build a flat searchable index
  const items = useMemo(() => {
    const all: SearchableItem[] = [];

    for (const t of teachers.filter((t) => !t.death_year)) {
      all.push({
        type: "teacher",
        name: t.name,
        slug: t.slug,
        href: `/teachers/${t.slug}`,
        detail: t.traditions.map((s) => traditionNames[s] ?? s).join(", "),
      });
    }

    for (const c of centers) {
      all.push({
        type: "center",
        name: c.name,
        slug: c.slug,
        href: `/centers/${c.slug}`,
        detail: [c.city, c.state].filter(Boolean).join(", ") || "",
      });
    }

    for (const r of resources.filter((r) => r.type === "book")) {
      all.push({
        type: "book",
        name: r.title,
        slug: r.slug,
        href: `/resources#${r.slug}`,
        detail: r.author ?? "",
      });
    }

    for (const [slug, name] of Object.entries(traditionNames)) {
      all.push({
        type: "tradition",
        name,
        slug,
        href: `/traditions/${slug}`,
        detail: "Tradition",
      });
    }

    return all;
  }, [teachers, centers, resources, traditionNames]);

  const results = useMemo(() => {
    const normalize = (s: string) =>
      s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
    const q = normalize(query);
    if (!q || q.length < 2) return [];
    return items
      .filter(
        (item) =>
          normalize(item.name).includes(q) ||
          normalize(item.detail).includes(q),
      )
      .slice(0, 8);
  }, [query, items]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showResults = focused && query.length >= 2 && results.length > 0;

  const typeLabel: Record<string, string> = {
    teacher: "Teacher",
    center: "Center",
    book: "Book",
    tradition: "Tradition",
  };

  const typeColor: Record<string, string> = {
    teacher: "text-amber-700",
    center: "text-emerald-700",
    book: "text-blue-700",
    tradition: "text-purple-700",
  };

  const dropdown = showResults ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-lg bg-white border border-border/50 shadow-xl overflow-hidden z-[9999]"
    >
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.slug}`}
          href={result.href}
          onClick={() => {
            setFocused(false);
            setQuery("");
          }}
          className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/20 last:border-0"
        >
          <div className="min-w-0">
            <div className="font-sans text-sm font-medium text-foreground truncate">
              {result.name}
            </div>
            <div className="font-sans text-xs text-muted-foreground truncate">
              {result.detail}
            </div>
          </div>
          <span
            className={`font-sans text-xs font-medium shrink-0 ml-3 ${typeColor[result.type]}`}
          >
            {typeLabel[result.type]}
          </span>
        </Link>
      ))}
    </div>
  ) : null;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search teachers, traditions, videos, books..."
          aria-label="Search Lineage"
          className="w-full h-12 pl-11 pr-4 rounded-lg bg-white/90 backdrop-blur border border-border/30 font-sans text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20 shadow-lg transition-all"
        />
      </div>

      {typeof window !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}

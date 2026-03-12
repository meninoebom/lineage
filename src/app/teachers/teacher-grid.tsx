"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Teacher } from "@/lib/types";

type Filter = "all" | "living" | "historical";

interface TeacherWithTraditions extends Teacher {
  traditionNames: { slug: string; name: string }[];
}

function formatYears(teacher: Teacher): string | null {
  if (teacher.birth_year && teacher.death_year) return `${teacher.birth_year}–${teacher.death_year}`;
  if (teacher.birth_year) return `b. ${teacher.birth_year}`;
  return null;
}

export function TeacherGrid({ teachers }: { teachers: TeacherWithTraditions[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = teachers.filter((t) => {
    if (filter === "living") return !t.death_year;
    if (filter === "historical") return !!t.death_year;
    return true;
  });

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All Teachers" },
    { value: "living", label: "Living Teachers" },
    { value: "historical", label: "Historical Masters" },
  ];

  return (
    <>
      <div className="flex gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`font-sans text-sm px-4 py-2 rounded-md transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((teacher) => (
          <Link key={teacher.slug} href={`/teachers/${teacher.slug}`} className="group">
            <Card accent="terracotta" className="h-full group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {teacher.name}
                  {formatYears(teacher) && (
                    <span className="font-sans text-sm font-normal text-muted-foreground ml-2">
                      ({formatYears(teacher)})
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {teacher.city}, {teacher.state}
                  {teacher.country !== "US" && ` · ${teacher.country}`}
                </CardDescription>
              </CardHeader>
              <div className="flex flex-wrap gap-1.5 px-5 pb-5">
                {teacher.traditionNames.map(({ slug, name }) => (
                  <Badge key={slug} variant="tradition">
                    {name}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No teachers found for this filter.
        </p>
      )}
    </>
  );
}

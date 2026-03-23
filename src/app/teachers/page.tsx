import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTeachers, getAllTraditions } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Find a Teacher",
  description:
    "Living teachers you can study with across contemplative traditions.",
  openGraph: {
    title: "Find a Teacher",
    description:
      "Living teachers you can study with across contemplative traditions.",
    url: `${SITE_URL}/teachers`,
  },
};

export default function TeachersPage() {
  const teachers = getAllTeachers()
    .filter((t) => t.death_year === null || t.death_year === undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const traditions = getAllTraditions();
  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <header className="mb-12">
        <h1 className="mb-3">Find a Teacher</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Living teachers you can study with across contemplative traditions.
        </p>
      </header>

      <p className="font-sans text-sm text-muted-foreground mb-6">
        {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <Link
            key={teacher.slug}
            href={`/teachers/${teacher.slug}`}
            className="group"
          >
            <Card className="h-full group-hover:shadow-md transition-shadow">
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
            </Card>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}

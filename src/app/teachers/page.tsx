import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTeachers, getTradition } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const teachersWithTraditions = teachers.map((t) => ({
    ...t,
    traditionNames: t.traditions.map((slug) => {
      const tradition = getTradition(slug);
      return { slug, name: tradition?.name ?? slug };
    }),
  }));

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Find a Teacher</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Living teachers you can study with across contemplative traditions.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {teachersWithTraditions.map((teacher) => (
          <Link
            key={teacher.slug}
            href={`/teachers/${teacher.slug}`}
            className="group"
          >
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

      {teachersWithTraditions.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No living teachers found.
        </p>
      )}
    </PageLayout>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllTeachers, getTradition } from "@/lib/data";

export const metadata: Metadata = {
  title: "Teachers — Lineage",
  description: "Browse contemplative teachers by tradition and location.",
};

export default function TeachersPage() {
  const teachers = getAllTeachers();

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Teachers</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Find teachers across contemplative traditions.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {teachers.map((teacher) => (
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
                {teacher.traditions.map((slug) => {
                  const t = getTradition(slug);
                  return (
                    <Badge key={slug} variant="tradition">
                      {t?.name ?? slug}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}

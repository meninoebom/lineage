import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTradition } from "@/lib/data";
import {
  getTeachersByState,
  getTeachersForState,
} from "@/lib/location";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return getTeachersByState().map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const group = getTeachersForState(stateSlug);
  if (!group) return {};
  const description = `Browse ${group.teachers.length} contemplative teacher${group.teachers.length === 1 ? "" : "s"} in ${group.state}.`;
  return {
    title: `Teachers in ${group.state}`,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: `Teachers in ${group.state}`,
      description,
      url: `${SITE_URL}/teachers/location/${stateSlug}`,
    },
  };
}

export default async function StateTeachersPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: stateSlug } = await params;
  const group = getTeachersForState(stateSlug);
  if (!group) notFound();

  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { label: "Teachers", href: "/teachers" },
          { label: group.state },
        ]}
      />

      <header className="mb-10">
        <h1 className="mb-3">Teachers in {group.state}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {group.teachers.length} contemplative teacher
          {group.teachers.length === 1 ? "" : "s"} based in {group.state}.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {group.teachers.map((teacher) => (
          <Link
            key={teacher.slug}
            href={`/teachers/${teacher.slug}`}
            className="group"
          >
            <Card accent="terracotta" className="h-full group-hover:bg-accent/50">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {teacher.name}
                </CardTitle>
                <CardDescription>
                  {teacher.city}, {teacher.state}
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

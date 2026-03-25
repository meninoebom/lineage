import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import { ResourceList } from "@/components/resource-list";
import { Comments } from "@/components/comments";
import { getAllTeachers, getTeacher, getCenter, getTradition, getResourcesByTeacher } from "@/lib/data";
import { teacherJsonLd, SITE_URL } from "@/lib/seo";
import type { Teacher } from "@/lib/types";

function formatYears(teacher: Teacher): string | null {
  if (teacher.birth_year && teacher.death_year) return `${teacher.birth_year}–${teacher.death_year}`;
  if (teacher.birth_year) return `b. ${teacher.birth_year}`;
  return null;
}

export function generateStaticParams() {
  return getAllTeachers().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teacher = getTeacher(slug);
  if (!teacher) return {};
  const description = teacher.traditions.length > 0
    ? `${teacher.name} — ${teacher.traditions.join(", ")} teacher in ${teacher.city}, ${teacher.state}.`
    : `${teacher.name} — contemplative teacher in ${teacher.city}, ${teacher.state}.`;
  return {
    title: teacher.name,
    description,
    openGraph: {
      title: teacher.name,
      description,
      url: `${SITE_URL}/teachers/${teacher.slug}`,
      type: "profile",
    },
  };
}

export default async function TeacherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teacher = getTeacher(slug);
  if (!teacher) notFound();

  const resources = getResourcesByTeacher(slug);
  const traditions = teacher.traditions
    .map((s) => getTradition(s))
    .filter((t): t is NonNullable<typeof t> => t != null);
  const centers = teacher.centers
    .map((s) => getCenter(s))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <PageLayout>
      <JsonLd data={teacherJsonLd(teacher)} />
      <Breadcrumbs
        items={[
          { label: "Teachers", href: "/teachers" },
          { label: teacher.name },
        ]}
      />

      <article>
        {/* Header */}
        <header className="mb-10 flex gap-8 items-start">
          {teacher.photo && (
            <div className="shrink-0">
              <Image
                src={teacher.photo}
                alt={teacher.name}
                width={160}
                height={160}
                className="rounded-lg object-cover w-32 h-32 sm:w-40 sm:h-40"
              />
            </div>
          )}
          <div>
          <h1 className="mb-3">
            {teacher.name}
            {formatYears(teacher) && (
              <span className="font-sans text-lg text-muted-foreground ml-3">
                ({formatYears(teacher)})
              </span>
            )}
          </h1>
          <p className="font-sans text-sm text-muted-foreground mb-4">
            {teacher.city}, {teacher.state}
            {teacher.country !== "US" && ` · ${teacher.country}`}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {traditions.map((t) => (
              <Link key={t.slug} href={`/traditions/${t.slug}`}>
                <Badge variant="tradition">{t.name}</Badge>
              </Link>
            ))}
          </div>
          {teacher.website && (
            <a
              href={teacher.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Visit website &rarr;
            </a>
          )}
          </div>
        </header>

        {/* Bio */}
        <section className="mb-12 max-w-2xl">
          <h2 className="mb-4">About</h2>
          <p className="leading-relaxed text-secondary-foreground">{teacher.bio}</p>
        </section>

        {/* Resources */}
        <ResourceList resources={resources} />

        {/* Centers */}
        {centers.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4">Centers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {centers.map((center) => (
                <Link key={center.slug} href={`/centers/${center.slug}`} className="group">
                  <Card className="h-full group-hover:bg-accent/50">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {center.name}
                      </CardTitle>
                      <CardDescription>
                        {center.city}, {center.state}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* Community Notes */}
        <Comments pageId={`teacher/${slug}`} pageTitle={teacher.name} />
      </article>
    </PageLayout>
  );
}

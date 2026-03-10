import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import { getAllCenters, getCenter, getTeacher, getTradition } from "@/lib/data";
import { centerJsonLd, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return getAllCenters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const center = getCenter(slug);
  if (!center) return {};
  const description = center.traditions.length > 0
    ? `${center.name} — ${center.traditions.join(", ")} center in ${center.city}, ${center.state}.`
    : `${center.name} — contemplative center in ${center.city}, ${center.state}.`;
  return {
    title: center.name,
    description,
    openGraph: {
      title: center.name,
      description,
      url: `${SITE_URL}/centers/${center.slug}`,
      type: "website",
    },
  };
}

export default async function CenterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const center = getCenter(slug);
  if (!center) notFound();

  const traditions = center.traditions
    .map((s) => getTradition(s))
    .filter((t): t is NonNullable<typeof t> => t != null);
  const teachers = center.teachers
    .map((s) => getTeacher(s))
    .filter((t): t is NonNullable<typeof t> => t != null);

  return (
    <PageLayout>
      <JsonLd data={centerJsonLd(center)} />
      <Breadcrumbs
        items={[
          { label: "Centers", href: "/centers" },
          { label: center.name },
        ]}
      />

      <article>
        {/* Header */}
        <header className="mb-10">
          <h1 className="mb-3">{center.name}</h1>
          <p className="font-sans text-sm text-muted-foreground mb-4">
            {center.city}, {center.state}
            {center.country !== "US" && ` · ${center.country}`}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {traditions.map((t) => (
              <Link key={t.slug} href={`/traditions/${t.slug}`}>
                <Badge variant="tradition">{t.name}</Badge>
              </Link>
            ))}
          </div>
          {center.website && (
            <a
              href={center.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Visit website &rarr;
            </a>
          )}
        </header>

        {/* Description */}
        <section className="mb-12 max-w-2xl">
          <h2 className="mb-4">About</h2>
          <p className="leading-relaxed text-secondary-foreground">{center.description}</p>
        </section>

        {/* Teachers */}
        {teachers.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4">Teachers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {teachers.map((teacher) => (
                <Link key={teacher.slug} href={`/teachers/${teacher.slug}`} className="group">
                  <Card className="h-full group-hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {teacher.name}
                      </CardTitle>
                      <CardDescription>
                        {teacher.city}, {teacher.state}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageLayout>
  );
}

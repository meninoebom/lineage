import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import {
  getAllTraditions,
  getTradition,
  getTeachersByTradition,
  getCentersByTradition,
  getRelatedTraditions,
} from "@/lib/data";
import { CitationLinks } from "@/components/citation-links";
import { SuggestEditLink } from "@/components/suggest-edit-link";
import { traditionJsonLd, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return getAllTraditions().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tradition = getTradition(slug);
  if (!tradition) return {};
  return {
    title: tradition.name,
    description: tradition.summary,
    openGraph: {
      title: tradition.name,
      description: tradition.summary,
      url: `${SITE_URL}/traditions/${tradition.slug}`,
      type: "article",
    },
  };
}

export default async function TraditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tradition = getTradition(slug);
  if (!tradition) notFound();

  const teachers = getTeachersByTradition(slug);
  const centers = getCentersByTradition(slug);
  const related = getRelatedTraditions(slug);

  return (
    <PageLayout>
      <JsonLd data={traditionJsonLd(tradition)} />
      <Breadcrumbs
        items={[
          { label: "Traditions", href: "/traditions" },
          { label: tradition.name },
        ]}
      />

      <article className="mb-16">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="family">{tradition.family}</Badge>
          </div>
          <h1 className="mb-3">{tradition.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {tradition.summary}
          </p>
        </header>

        {/* Editorial content */}
        <div className="prose-editorial max-w-2xl">
          <MDXRemote source={tradition.content} />
        </div>
      </article>

      {/* Teachers in this tradition */}
      {teachers.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6">Teachers in {tradition.name}</h2>
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

      {/* Centers in this tradition */}
      {centers.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6">Centers for {tradition.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {centers.map((center) => (
              <Link key={center.slug} href={`/centers/${center.slug}`} className="group">
                <Card className="h-full group-hover:shadow-md">
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

      {/* Related traditions */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6">Related Traditions</h2>
          <div className="grid gap-4">
            {related.map((r) => (
              <Link key={r.slug} href={`/traditions/${r.slug}`} className="group">
                <Card className="group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {r.name}
                      </CardTitle>
                      <Badge variant="outline">{r.connection.connection_type.replaceAll("_", " ")}</Badge>
                    </div>
                    <CardDescription>
                      {r.connection.description}
                      <CitationLinks sources={r.connection.sources} />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SuggestEditLink traditionName={tradition.name} />
    </PageLayout>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPaths, getPathBySlug, getTradition } from "@/lib/data";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import type { ResolvedPath } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPaths().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) return {};
  return {
    title: path.title,
    description: path.description,
    openGraph: {
      title: path.title,
      description: path.description,
      url: `${SITE_URL}/paths/${path.slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

function pathJsonLd(path: ResolvedPath): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: path.title,
    description: path.description,
    url: `${SITE_URL}/paths/${path.slug}`,
    numberOfItems: path.resources.length,
    itemListElement: path.resources.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.title,
      url: r.url,
      ...(r.author && { author: { "@type": "Person", name: r.author } }),
      ...(r.year && { datePublished: `${r.year}` }),
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) notFound();

  const tradition =
    path.type === "tradition" && path.tradition
      ? getTradition(path.tradition)
      : undefined;

  return (
    <PageLayout>
      <JsonLd data={pathJsonLd(path)} />
      <Breadcrumbs
        items={[
          { label: "Reading Paths", href: "/paths" },
          { label: path.title },
        ]}
      />

      <article>
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1>{path.title}</h1>
            <Badge variant="family">{path.type}</Badge>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {path.description}
          </p>
          {tradition && (
            <p className="mt-4 text-sm">
              <Link
                href={`/traditions/${tradition.slug}`}
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Learn more about {tradition.name} →
              </Link>
            </p>
          )}
        </header>

        <section className="mb-12">
          <h2 className="mb-6">Resources</h2>
          <div className="space-y-4">
            {path.resources.map((r, i) => (
              <Card key={r.slug} accent="terracotta">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-serif text-sm">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {r.title}
                        <Badge variant="outline" className="text-xs font-normal">
                          {r.type}
                        </Badge>
                      </CardTitle>
                      {(r.author || r.year) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {r.author}
                          {r.author && r.year && ` (${r.year})`}
                          {!r.author && r.year && `${r.year}`}
                        </p>
                      )}
                      <CardDescription className="mt-2">
                        {r.description}
                      </CardDescription>
                      <Link
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-primary hover:underline"
                      >
                        View resource →
                      </Link>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Link
          href="/paths"
          className="inline-block text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          ← Back to Reading Paths
        </Link>
      </article>
    </PageLayout>
  );
}

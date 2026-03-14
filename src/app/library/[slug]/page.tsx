import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPaths, getPathBySlug } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

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
      url: `${SITE_URL}/library/${path.slug}`,
    },
  };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) notFound();

  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { label: "Library", href: "/library" },
          { label: path.title },
        ]}
      />

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1>{path.title}</h1>
          <Badge variant="family">{path.type}</Badge>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {path.description}
        </p>
      </header>

      <section>
        <div className="space-y-4">
          {path.resources.map((r, i) => (
            <Card key={r.slug} accent="terracotta">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-serif text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      {r.title}
                      <Badge variant="outline" className="text-xs font-normal">
                        {r.type}
                      </Badge>
                    </CardTitle>
                    {r.author && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.author}
                        {r.year && ` (${r.year})`}
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
    </PageLayout>
  );
}

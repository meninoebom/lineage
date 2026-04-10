import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { getAllResources, getResource, getAllTraditions, getAllTeachers } from "@/lib/data";
import { bookshopAffiliateUrl } from "@/lib/affiliate";
import { ResourceTestimonies } from "@/components/resource-testimonies";
import { TaxonomyBadges } from "@/components/taxonomy-badges";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return getAllResources().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  return {
    title: `${resource.title}${resource.author ? ` by ${resource.author}` : ""}`,
    description: resource.description,
    openGraph: {
      title: resource.title,
      description: resource.description,
      url: `${SITE_URL}/resources/${resource.slug}`,
      type: "article",
    },
  };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  const allTraditions = getAllTraditions();
  const allTeachers = getAllTeachers();

  const traditions = resource.traditions
    .map((s) => allTraditions.find((t) => t.slug === s))
    .filter(Boolean);

  const teachers = resource.teachers
    .map((s) => allTeachers.find((t) => t.slug === s))
    .filter(Boolean);

  const typeLabels: Record<string, string> = {
    book: "Book",
    podcast: "Podcast",
    video: "Video",
    article: "Article",
    website: "Website",
  };

  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { label: "Resources", href: "/resources" },
          { label: resource.title },
        ]}
      />

      <article className="max-w-2xl">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline">{typeLabels[resource.type] ?? resource.type}</Badge>
          </div>
          <h1 className="mb-2">{resource.title}</h1>
          {resource.author && (
            <p className="text-lg text-muted-foreground">{resource.author}</p>
          )}
          {resource.year && (
            <p className="text-sm text-muted-foreground mt-1">{resource.year}</p>
          )}
          {resource.experience_level && (
            <div className="mt-3">
              <TaxonomyBadges experienceLevel={resource.experience_level} />
            </div>
          )}
        </header>

        <p className="text-foreground/80 leading-relaxed mb-6">
          {resource.description}
        </p>

        {(resource.topics?.length || resource.practice_context?.length) && (
          <div className="mb-8">
            <TaxonomyBadges
              topics={resource.topics}
              practiceContext={resource.practice_context}
            />
          </div>
        )}

        {/* External link */}
        <div className="mb-10">
          <a
            href={bookshopAffiliateUrl(resource.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-terracotta/90 transition-colors"
          >
            {resource.url.includes("bookshop.org") ? "Buy from Bookshop.org" : "View resource"}
            <span aria-hidden>↗</span>
          </a>
        </div>

        {/* Traditions and teachers */}
        {(traditions.length > 0 || teachers.length > 0) && (
          <div className="mb-10 flex flex-wrap gap-2">
            {traditions.map((t) => (
              <Link key={t!.slug} href={`/traditions/${t!.slug}`}>
                <Badge variant="tradition" className="hover:bg-accent transition-colors">
                  {t!.name}
                </Badge>
              </Link>
            ))}
            {teachers.map((t) => (
              <Link key={t!.slug} href={`/teachers/${t!.slug}`}>
                <Badge variant="outline" className="hover:bg-accent transition-colors">
                  {t!.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Testimonies (client-side) */}
        <ResourceTestimonies resourceSlug={resource.slug} resourceTitle={resource.title} />
      </article>
    </PageLayout>
  );
}

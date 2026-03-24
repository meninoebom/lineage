import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllResources, getAllTraditions } from "@/lib/data";
import { ResourcesClient } from "@/components/resources-client";
import { SITE_URL } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Browse books, podcasts, videos, articles, and websites across contemplative traditions.",
  openGraph: {
    title: "Resources",
    description:
      "Browse books, podcasts, videos, articles, and websites across contemplative traditions.",
    url: `${SITE_URL}/resources`,
  },
};

export default function ResourcesPage() {
  const resources = getAllResources().sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const traditions = getAllTraditions();
  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Resources" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Resources</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Books, podcasts, videos, articles, and websites across contemplative
          traditions. Want a guided journey? Try our{" "}
          <Link
            href="/library"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            curated reading paths
          </Link>
          .
        </p>
      </header>

      <ResourcesClient resources={resources} traditionNames={traditionNames} />
    </PageLayout>
  );
}

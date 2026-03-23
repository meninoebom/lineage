import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllCenters, getAllTraditions } from "@/lib/data";
import { CentersClient } from "@/components/centers-client";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Centers",
  description:
    "Find contemplative practice centers by tradition and location.",
  openGraph: {
    title: "Centers",
    description:
      "Find contemplative practice centers by tradition and location.",
    url: `${SITE_URL}/centers`,
  },
};

export default function CentersPage() {
  const centers = getAllCenters();
  const traditions = getAllTraditions();

  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Centers" }]} />

      <header className="mb-16">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
          Where to Practice
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Find centers and communities across contemplative traditions.
          Filter by tradition or location to find a place near you.
        </p>
      </header>

      <CentersClient centers={centers} traditionNames={traditionNames} />
    </PageLayout>
  );
}

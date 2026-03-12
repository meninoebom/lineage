import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { getAllTraditions, getAllResources } from "@/lib/data";
import { TraditionMap } from "@/components/tradition-map";
import { SITE_URL } from "@/lib/seo";

const description =
  "An interactive map of contemplative traditions — how they connect, diverge, and speak to one another across history.";

export const metadata: Metadata = {
  title: "Interactive Map",
  description,
  openGraph: {
    title: "Interactive Map",
    description,
    url: `${SITE_URL}/map`,
  },
};

export default function MapPage() {
  const traditions = getAllTraditions();
  const allResources = getAllResources();
  const resourceMap: Record<string, { title: string; url: string; author: string | null; description: string; traditions: string[] }> = {};
  for (const r of allResources) {
    resourceMap[r.slug] = { title: r.title, url: r.url, author: r.author, description: r.description, traditions: r.traditions };
  }

  return (
    <PageLayout>
      <header className="mb-4 text-center">
        <h1 className="mb-3">The Contemplative Landscape</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          How the great contemplative traditions connect, diverge, and speak to
          one another — an interactive guide to the paths of practice.
        </p>
      </header>

      <TraditionMap traditions={traditions} resourceMap={resourceMap} />
    </PageLayout>
  );
}

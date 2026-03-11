import Link from "next/link";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllTraditions, getAllResources } from "@/lib/data";
import { TraditionMap } from "@/components/tradition-map";

export const metadata: Metadata = {
  title: "Lineage — A Map of Contemplative Traditions",
  description:
    "An interactive map of contemplative traditions and how they connect. Find teachers and meditation centers near you across Buddhist, Hindu, Christian, Sufi, and secular paths.",
};

const sections = [
  {
    title: "Traditions",
    description:
      "Explore the landscape of contemplative paths — how they connect, diverge, and speak to one another.",
    href: "/traditions",
  },
  {
    title: "Teachers",
    description:
      "Find teachers across traditions, from Vipassana to Zen to Christian contemplative.",
    href: "/teachers",
  },
  {
    title: "Centers",
    description:
      "Discover meditation centers and practice communities across the United States.",
    href: "/centers",
  },
];

export default function Home() {
  const traditions = getAllTraditions();
  const allResources = getAllResources();
  const resourceMap: Record<string, { title: string; url: string }> = {};
  for (const r of allResources) {
    resourceMap[r.slug] = { title: r.title, url: r.url };
  }

  return (
    <PageLayout>
      {/* Hero — the map IS the landing experience */}
      <header className="mb-4 text-center">
        <h1 className="mb-3">The Contemplative Landscape</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          How the great contemplative traditions connect, diverge, and speak to
          one another — an interactive guide to the paths of practice.
        </p>
      </header>

      <TraditionMap traditions={traditions} resourceMap={resourceMap} />

      {/* Navigation cards below the map */}
      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card className="h-full group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </PageLayout>
  );
}

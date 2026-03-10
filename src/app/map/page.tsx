import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTraditions } from "@/lib/data";
import { TraditionMap } from "@/components/tradition-map";

export const metadata: Metadata = {
  title: "Map of Contemplative Traditions — Lineage",
  description:
    "An interactive visual map of contemplative traditions and how they connect — Buddhist, Hindu, Taoist, Christian, Islamic, and more.",
};

export default function MapPage() {
  const traditions = getAllTraditions();

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Map" }]} />

      <header className="mb-8 text-center">
        <h1 className="mb-3">The Contemplative Landscape</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          How the great contemplative traditions connect, diverge, and speak to
          one another — an interactive guide to the paths of practice.
        </p>
      </header>

      <TraditionMap traditions={traditions} />
    </PageLayout>
  );
}

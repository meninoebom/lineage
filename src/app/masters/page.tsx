import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTeachers, getTradition, getAllTraditions } from "@/lib/data";
import { MastersClient } from "@/components/masters-client";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Historical Masters",
  description:
    "The great teachers whose wisdom shaped the contemplative traditions.",
  openGraph: {
    title: "Historical Masters",
    description:
      "The great teachers whose wisdom shaped the contemplative traditions.",
    url: `${SITE_URL}/masters`,
  },
};

export default function MastersPage() {
  const allTeachers = getAllTeachers();
  const allTraditions = getAllTraditions();

  const traditionNames: Record<string, string> = {};
  for (const t of allTraditions) {
    traditionNames[t.slug] = t.name;
  }

  const masters = allTeachers
    .filter((t) => t.death_year !== null)
    .map((t) => {
      const firstTradition = t.traditions[0]
        ? getTradition(t.traditions[0])
        : undefined;
      const family = firstTradition?.family ?? "Other";
      const traditionNameMap = t.traditions.map((slug) => ({
        slug,
        name: traditionNames[slug] ?? slug,
      }));
      return { ...t, family, traditionNameMap };
    });

  const families = Array.from(new Set(masters.map((m) => m.family))).sort();

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Historical Masters" }]} />

      <header className="mb-12">
        <h1 className="mb-3">Historical Masters</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          The great teachers whose wisdom shaped the contemplative traditions.
        </p>
      </header>

      <MastersClient
        masters={masters}
        traditionNames={traditionNames}
        families={families}
      />
    </PageLayout>
  );
}

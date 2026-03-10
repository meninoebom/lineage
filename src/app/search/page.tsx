import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SearchClient } from "@/components/search-client";
import { getAllTeachers, getAllCenters, getAllTraditions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search — Lineage",
  description:
    "Find contemplative teachers and meditation centers by tradition and location.",
};

export default function SearchPage() {
  const teachers = getAllTeachers();
  const centers = getAllCenters();
  const traditions = getAllTraditions();

  // Build a slug -> display name map for the client component
  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Search" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Search</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Find teachers and centers across contemplative traditions.
        </p>
      </header>

      <SearchClient
        teachers={teachers}
        centers={centers}
        traditionNames={traditionNames}
      />
    </PageLayout>
  );
}

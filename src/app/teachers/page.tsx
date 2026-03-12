import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTeachers, getAllTraditions } from "@/lib/data";
import { TeachersClient } from "@/components/teachers-client";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Find a Teacher",
  description:
    "Living teachers you can study with across contemplative traditions.",
  openGraph: {
    title: "Find a Teacher",
    description:
      "Living teachers you can study with across contemplative traditions.",
    url: `${SITE_URL}/teachers`,
  },
};

export default function TeachersPage() {
  const teachers = getAllTeachers()
    .filter((t) => t.death_year === null || t.death_year === undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const traditions = getAllTraditions();
  const traditionNames: Record<string, string> = {};
  for (const t of traditions) {
    traditionNames[t.slug] = t.name;
  }

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Find a Teacher</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Living teachers you can study with across contemplative traditions.
        </p>
      </header>

      <TeachersClient teachers={teachers} traditionNames={traditionNames} />
    </PageLayout>
  );
}

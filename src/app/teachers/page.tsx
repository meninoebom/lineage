import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllTeachers, getTradition } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { TeacherGrid } from "./teacher-grid";

export const metadata: Metadata = {
  title: "Teachers",
  description: "Browse contemplative teachers by tradition and location.",
  openGraph: {
    title: "Teachers",
    description: "Browse contemplative teachers by tradition and location.",
    url: `${SITE_URL}/teachers`,
  },
};

export default function TeachersPage() {
  const teachers = getAllTeachers();

  // Resolve tradition names at build time (server component)
  const teachersWithTraditionNames = teachers.map((t) => ({
    ...t,
    traditionNames: t.traditions.map((slug) => {
      const tradition = getTradition(slug);
      return { slug, name: tradition?.name ?? slug };
    }),
  }));

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <header className="mb-10">
        <h1 className="mb-3">Teachers</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Find teachers across contemplative traditions.
        </p>
      </header>

      <TeacherGrid teachers={teachersWithTraditionNames} />
    </PageLayout>
  );
}

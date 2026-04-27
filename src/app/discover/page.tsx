import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { getAllTraditions, getAllTeachers } from "@/lib/data";
import { DiscoverClient } from "@/components/discover-client";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Discover Resources",
  description:
    "Find books, videos, podcasts, and articles matched to where you are in your practice.",
  openGraph: {
    title: "Discover Resources",
    description:
      "Find books, videos, podcasts, and articles matched to where you are in your practice.",
    url: `${SITE_URL}/discover`,
  },
};

export default function DiscoverPage() {
  const traditions = getAllTraditions();
  const teachers = getAllTeachers();

  const traditionNames: Record<string, string> = {};
  for (const t of traditions) traditionNames[t.slug] = t.name;

  const teacherNames: Record<string, string> = {};
  for (const t of teachers) teacherNames[t.slug] = t.name;

  return (
    <PageLayout>
      <Suspense fallback={<div className="h-8 w-full animate-pulse bg-muted rounded" />}>
        <DiscoverClient traditionNames={traditionNames} teacherNames={teacherNames} />
      </Suspense>
    </PageLayout>
  );
}

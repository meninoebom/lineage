import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PathCard } from "@/components/path-card";
import { getAllPaths } from "@/lib/data";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Curated learning paths through the contemplative traditions.",
  openGraph: {
    title: "Learning Paths",
    description:
      "Curated learning paths through the contemplative traditions.",
    url: `${SITE_URL}/paths`,
  },
};

export default function LibraryPage() {
  const paths = getAllPaths();
  const traditionPaths = paths.filter((p) => p.type === "tradition");
  const thematicPaths = paths.filter((p) => p.type === "thematic");

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Learning Paths" }]} />

      <header className="mb-16">
        <h1 className="mb-3">Learning Paths</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Curated learning paths through the contemplative traditions.{" "}
          <Link
            href="/resources"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Browse the full collection
          </Link>
          .
        </p>
      </header>

      <section className="mb-20">
        <h2 className="mb-6">Tradition Paths</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {traditionPaths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-6">Thematic Paths</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {thematicPaths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

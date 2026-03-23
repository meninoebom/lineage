import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PathCard } from "@/components/path-card";
import { getAllPaths } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Curated reading paths through contemplative traditions — books, articles, and resources grouped by tradition and theme.",
  openGraph: {
    title: "Library",
    description:
      "Curated reading paths through contemplative traditions — books, articles, and resources grouped by tradition and theme.",
    url: `${SITE_URL}/library`,
  },
};

export default function LibraryPage() {
  const paths = getAllPaths();
  const traditionPaths = paths.filter((p) => p.type === "tradition");
  const thematicPaths = paths.filter((p) => p.type === "thematic");

  return (
    <PageLayout>
      <Breadcrumbs items={[{ label: "Library" }]} />

      <header className="mb-16">
        <h1 className="mb-3">Library</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Curated reading paths through the contemplative traditions — each a
          sequence of 3–5 resources chosen to guide exploration of a tradition
          or theme. Looking for individual resources?{" "}
          <a
            href="/resources"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Browse the full collection
          </a>
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
